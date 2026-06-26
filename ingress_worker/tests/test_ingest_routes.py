"""Route-level tests for METIS universal ingestion adapters."""

from __future__ import annotations

import json
import struct
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from ingress_worker import job_store, response_cache
from ingress_worker.main import (
    DEFAULT_INGESTION_BEARER_TOKEN,
    DEFAULT_PAGE_SIZE,
    _completed_status_payload,
    app,
)


AUTH_HEADERS = {"Authorization": f"Bearer {DEFAULT_INGESTION_BEARER_TOKEN}"}


@pytest.fixture(autouse=True)
def isolated_jobs_root(monkeypatch: pytest.MonkeyPatch, tmp_path) -> None:
	"""Route each test through an isolated on-disk job root."""
	monkeypatch.setenv("METIS_JOBS_DATA_ROOT", str(tmp_path))
	response_cache.clear_cache()
	yield
	response_cache.clear_cache()


def build_binary_payload(coordinates: list[list[float]]) -> bytes:
	"""Build one big-endian binary telemetry frame."""
	flattened = [scalar for row in coordinates for scalar in row]
	header = struct.pack(
		">I16sqi",
		0x4D455449,
		b"asset-test-0001",
		1_719_000_000,
		len(flattened),
	)
	scalars = b"".join(struct.pack(">d", scalar) for scalar in flattened)
	return header + scalars


def write_ingesting_job(job_uuid: str, input_format: str = "JSON") -> None:
	"""Seed one INGESTING job on disk."""
	job_store.ensure_jobs_root()
	job_dir = job_store.jobs_root() / job_uuid
	job_dir.mkdir(parents=True, exist_ok=True)
	(job_dir / "payload.bin").write_bytes(b"")
	meta = {
		"status": "INGESTING",
		"input_format": input_format,
		"rows_processed": 0,
		"created_at": "2026-06-23T00:00:00+00:00",
		"completed_at": None,
		"error": None,
		"noise_injected": False,
	}
	(job_dir / "meta.json").write_text(json.dumps(meta), encoding="utf-8")


def write_completed_job(
	job_uuid: str,
	coordinates: list[list[float]],
	input_format: str = "JSON",
) -> None:
	"""Seed one COMPLETED job with on-disk coordinate storage."""
	write_ingesting_job(job_uuid, input_format)
	job_store.save_completed(job_uuid, coordinates)


def status_for(client: TestClient, job_uuid: str):
	"""Fetch one v1 job status response."""
	return client.get(f"/api/v1/jobs/status/{job_uuid}", headers=AUTH_HEADERS)


def points_for(
	client: TestClient,
	job_uuid: str,
	*,
	page: int = 1,
	limit: int = DEFAULT_PAGE_SIZE,
):
	"""Fetch one paginated coordinate slice for a v1 job."""
	return client.get(
		f"/api/v1/jobs/status/{job_uuid}/points",
		headers=AUTH_HEADERS,
		params={"page": page, "limit": limit},
	)


def test_ingest_json_lifecycle_returns_reconstructed_coordinates() -> None:
	"""JSON ingestion returns a job that can be polled."""
	client = TestClient(app)

	response = client.post(
		"/api/v1/ingest/json",
		headers=AUTH_HEADERS,
		json={"asset_id": "asset-json", "coordinates": [[1, 2, 3], [4.5, 5.5, 6.5]]},
	)

	assert response.status_code == 202
	body = response.json()
	assert body["status"] == "INGESTING"
	assert body["message"] == "Telemetry stream link opened"
	assert "job_uuid" in body

	status_response = status_for(client, body["job_uuid"])
	assert status_response.status_code == 200
	status_body = status_response.json()
	assert status_body == {
		"job_uuid": body["job_uuid"],
		"status": "COMPLETED",
		"rows_processed": 2,
		"total_pages": 1,
	}
	assert "reconstructed_coordinates" not in status_body

	points_response = points_for(client, body["job_uuid"])
	assert points_response.status_code == 200
	assert points_response.json() == {
		"page": 1,
		"limit": DEFAULT_PAGE_SIZE,
		"reconstructed_coordinates": [[1.0, 2.0, 3.0], [4.5, 5.5, 6.5]],
	}


def test_ingest_csv_lifecycle_with_header_returns_coordinates() -> None:
	"""CSV ingestion accepts a header row and blank lines."""
	client = TestClient(app)

	response = client.post(
		"/api/v1/ingest/csv",
		headers={**AUTH_HEADERS, "Content-Type": "text/csv"},
		content="x,y,z\n1,2,3\n\n4,5,6\n",
	)

	assert response.status_code == 202
	body = response.json()
	assert body["status"] == "INGESTING"

	status_response = status_for(client, body["job_uuid"])
	assert status_response.status_code == 200
	assert status_response.json() == {
		"job_uuid": body["job_uuid"],
		"status": "COMPLETED",
		"rows_processed": 2,
		"total_pages": 1,
	}


def test_ingest_binary_lifecycle_returns_coordinates() -> None:
	"""Binary ingestion creates a pollable decoded telemetry job."""
	client = TestClient(app)

	response = client.post(
		"/api/v1/ingest/binary",
		headers={**AUTH_HEADERS, "Content-Type": "application/octet-stream"},
		content=build_binary_payload([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]),
	)

	assert response.status_code == 202
	body = response.json()
	assert body["status"] == "INGESTING"

	status_response = status_for(client, body["job_uuid"])
	assert status_response.status_code == 200
	assert status_response.json() == {
		"job_uuid": body["job_uuid"],
		"status": "COMPLETED",
		"rows_processed": 2,
		"total_pages": 1,
	}


def test_ingest_binary_lifecycle_combines_concatenated_frames() -> None:
	"""Binary ingestion combines coordinate rows from adjacent frames."""
	client = TestClient(app)
	payload = build_binary_payload([[1.0, 2.0, 3.0]]) + build_binary_payload(
		[[4.0, 5.0, 6.0]],
	)

	response = client.post(
		"/api/v1/ingest/binary",
		headers={**AUTH_HEADERS, "Content-Type": "application/octet-stream"},
		content=payload,
	)

	assert response.status_code == 202
	body = response.json()
	assert body["status"] == "INGESTING"

	status_response = status_for(client, body["job_uuid"])
	assert status_response.status_code == 200
	assert status_response.json() == {
		"job_uuid": body["job_uuid"],
		"status": "COMPLETED",
		"rows_processed": 2,
		"total_pages": 1,
	}


def test_ingest_binary_lifecycle_fails_on_invalid_second_frame_magic() -> None:
	"""Binary ingestion records a parse failure for a bad adjacent frame marker."""
	client = TestClient(app)
	second_frame = bytearray(build_binary_payload([[4.0, 5.0, 6.0]]))
	second_frame[:4] = b"NOPE"
	payload = build_binary_payload([[1.0, 2.0, 3.0]]) + bytes(second_frame)

	response = client.post(
		"/api/v1/ingest/binary",
		headers={**AUTH_HEADERS, "Content-Type": "application/octet-stream"},
		content=payload,
	)

	assert response.status_code == 202
	body = response.json()

	status_response = status_for(client, body["job_uuid"])
	assert status_response.status_code == 422
	status_body = status_response.json()
	assert status_body["job_uuid"] == body["job_uuid"]
	assert status_body["status"] == "FAILED"
	assert status_body["error"]["input_format"] == "BINARY"
	assert status_body["error"]["message"] == "Invalid magic marker at offset 56"


def test_jobs_start_preserves_coordinate_response() -> None:
	"""Legacy binary alias returns reconstructed coordinates."""
	client = TestClient(app)

	response = client.post(
		"/api/jobs/start",
		headers={**AUTH_HEADERS, "Content-Type": "application/octet-stream"},
		content=build_binary_payload([[1.0, 2.0, 3.0]]),
	)

	assert response.status_code == 200
	body = response.json()
	assert body["reconstructed_coordinates"] == [[1.0, 2.0, 3.0]]
	assert body["status"] == "PROCESSED"
	assert "rows_processed" not in body


def test_ingest_csv_invalid_row_fails_status() -> None:
	"""Invalid CSV rows move the job into FAILED status."""
	client = TestClient(app)

	response = client.post(
		"/api/v1/ingest/csv",
		headers={**AUTH_HEADERS, "Content-Type": "text/plain"},
		content="x,y,z\n1,nope,3\n",
	)

	assert response.status_code == 202
	body = response.json()
	status_response = status_for(client, body["job_uuid"])

	assert status_response.status_code == 422
	status_body = status_response.json()
	assert status_body["job_uuid"] == body["job_uuid"]
	assert status_body["status"] == "FAILED"
	assert status_body["error"]["input_format"] == "CSV"
	assert "non-numeric" in status_body["error"]["message"]


def test_status_missing_job_returns_404() -> None:
	"""Unknown v1 job UUID returns a not found response."""
	client = TestClient(app)

	response = client.get(
		"/api/v1/jobs/status/00000000-0000-0000-0000-000000000000",
		headers=AUTH_HEADERS,
	)

	assert response.status_code == 404
	assert response.json()["error"] == "Not Found"


def test_status_ingesting_response_includes_progress() -> None:
	"""INGESTING jobs expose current progress fields."""
	client = TestClient(app)
	job_uuid = "11111111-1111-1111-1111-111111111111"
	write_ingesting_job(job_uuid, input_format="JSON")

	response = status_for(client, job_uuid)

	assert response.status_code == 200
	assert response.json() == {
		"job_uuid": job_uuid,
		"status": "INGESTING",
		"input_format": "JSON",
		"rows_processed": 0,
	}


def test_ingest_json_rejects_wrong_content_type() -> None:
	"""JSON route rejects unsupported media types."""
	client = TestClient(app)

	response = client.post(
		"/api/v1/ingest/json",
		headers={**AUTH_HEADERS, "Content-Type": "text/plain"},
		content='{"asset_id":"asset-json","coordinates":[[1,2,3]]}',
	)

	assert response.status_code == 415
	assert response.json()["error"] == "Unsupported Media Type"


def test_ingest_binary_rejects_invalid_auth() -> None:
	"""Binary route rejects missing or mismatched bearer tokens."""
	client = TestClient(app)

	response = client.post(
		"/api/v1/ingest/binary",
		headers={"Authorization": "Bearer wrong", "Content-Type": "application/octet-stream"},
		content=build_binary_payload([[1.0, 2.0, 3.0]]),
	)

	assert response.status_code == 401
	assert response.json()["error"] == "Unauthorized"


def test_completed_status_returns_metadata_only() -> None:
	"""COMPLETED status omits inline reconstructed coordinates."""
	client = TestClient(app)
	job_uuid = "22222222-2222-2222-2222-222222222222"
	write_completed_job(job_uuid, [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])

	response = status_for(client, job_uuid)

	assert response.status_code == 200
	body = response.json()
	assert body == {
		"job_uuid": job_uuid,
		"status": "COMPLETED",
		"rows_processed": 2,
		"total_pages": 1,
	}
	assert "reconstructed_coordinates" not in body


def test_points_pagination_slices_coordinates() -> None:
	"""Points gateway returns one coordinate page at a time."""
	client = TestClient(app)
	job_uuid = "33333333-3333-3333-3333-333333333333"
	coordinates = [[float(index), float(index + 1), float(index + 2)] for index in range(5)]
	write_completed_job(job_uuid, coordinates)

	first_page = points_for(client, job_uuid, page=1, limit=2)
	second_page = points_for(client, job_uuid, page=2, limit=2)
	third_page = points_for(client, job_uuid, page=3, limit=2)

	assert first_page.status_code == 200
	assert first_page.json() == {
		"page": 1,
		"limit": 2,
		"reconstructed_coordinates": coordinates[0:2],
	}
	assert second_page.status_code == 200
	assert second_page.json() == {
		"page": 2,
		"limit": 2,
		"reconstructed_coordinates": coordinates[2:4],
	}
	assert third_page.status_code == 200
	assert third_page.json() == {
		"page": 3,
		"limit": 2,
		"reconstructed_coordinates": coordinates[4:5],
	}


def test_points_pagination_reads_from_disk() -> None:
	"""Points gateway seeks into points.bin without loading the full matrix."""
	client = TestClient(app)
	job_uuid = "77777777-7777-7777-7777-777777777777"
	coordinates = [[float(index), float(index + 1), float(index + 2)] for index in range(10)]
	write_completed_job(job_uuid, coordinates)

	with patch(
		"ingress_worker.main.job_store.load_points_slice",
		wraps=job_store.load_points_slice,
	) as load_slice:
		response = points_for(client, job_uuid, page=2, limit=3)

	assert response.status_code == 200
	assert response.json()["reconstructed_coordinates"] == coordinates[3:6]
	load_slice.assert_called_once_with(job_uuid, 3, 6)


def test_points_rejects_limit_above_cap() -> None:
	"""Points gateway rejects limits above the configured cap."""
	client = TestClient(app)
	job_uuid = "44444444-4444-4444-4444-444444444444"
	write_completed_job(job_uuid, [[1.0, 2.0, 3.0]])

	response = points_for(client, job_uuid, limit=DEFAULT_PAGE_SIZE + 1)

	assert response.status_code == 422
	assert response.json()["detail"] == f"limit must be between 1 and {DEFAULT_PAGE_SIZE}"


def test_points_missing_job_returns_404() -> None:
	"""Unknown job UUID returns a not found response on the points gateway."""
	client = TestClient(app)

	response = points_for(client, "55555555-5555-5555-5555-555555555555")

	assert response.status_code == 404
	assert response.json()["error"] == "Not Found"


def test_points_rejects_non_completed_job() -> None:
	"""Points gateway rejects jobs that are not COMPLETED."""
	client = TestClient(app)
	job_uuid = "66666666-6666-6666-6666-666666666666"
	write_ingesting_job(job_uuid)

	response = points_for(client, job_uuid)

	assert response.status_code == 409
	assert "INGESTING" in response.json()["detail"]


def test_points_cache_hit_skips_second_disk_read() -> None:
	"""Repeated identical /points requests hit the in-process TTL cache."""
	client = TestClient(app)
	job_uuid = "88888888-8888-8888-8888-888888888888"
	write_completed_job(job_uuid, [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]])

	with patch(
		"ingress_worker.main.job_store.load_points_slice",
		wraps=job_store.load_points_slice,
	) as load_slice:
		first = points_for(client, job_uuid, page=1, limit=1)
		second = points_for(client, job_uuid, page=1, limit=1)

	assert first.status_code == 200
	assert second.status_code == 200
	assert first.json() == second.json()
	assert load_slice.call_count == 1


def test_completed_status_cache_hit() -> None:
    """Repeated COMPLETED status requests hit the in-process TTL cache."""
    client = TestClient(app)
    job_uuid = "99999999-9999-9999-9999-999999999999"
    write_completed_job(job_uuid, [[1.0, 2.0, 3.0]])

    with patch(
        "ingress_worker.main._completed_status_payload",
        wraps=_completed_status_payload,
    ) as build_payload:
        first = status_for(client, job_uuid)
        second = status_for(client, job_uuid)

    assert first.status_code == 200
    assert second.status_code == 200
    assert first.json() == second.json()
    assert build_payload.call_count == 1
