"""Route-level tests for METIS universal ingestion adapters."""

from __future__ import annotations

import struct

from fastapi.testclient import TestClient

from ingress_worker.main import DEFAULT_INGESTION_BEARER_TOKEN, app, jobs_registry


AUTH_HEADERS = {"Authorization": f"Bearer {DEFAULT_INGESTION_BEARER_TOKEN}"}


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


def status_for(client: TestClient, job_uuid: str):
    """Fetch one v1 job status response."""
    return client.get(f"/api/v1/jobs/status/{job_uuid}", headers=AUTH_HEADERS)


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
        "reconstructed_coordinates": [[1.0, 2.0, 3.0], [4.5, 5.5, 6.5]],
        "rows_processed": 2,
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
        "reconstructed_coordinates": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
        "rows_processed": 2,
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
        "reconstructed_coordinates": [[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]],
        "rows_processed": 2,
    }


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
    jobs_registry[job_uuid] = {
        "status": "INGESTING",
        "payload": bytearray(b""),
        "reconstructed_points": [],
        "created_at": "2026-06-23T00:00:00+00:00",
        "input_format": "JSON",
        "rows_processed": 0,
        "error": None,
    }

    response = status_for(client, job_uuid)

    assert response.status_code == 200
    assert response.json() == {
        "job_uuid": job_uuid,
        "status": "INGESTING",
        "input_format": "JSON",
        "rows_processed": 0,
    }
    jobs_registry.pop(job_uuid, None)


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
