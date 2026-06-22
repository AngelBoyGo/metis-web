"""Route-level tests for METIS universal ingestion adapters."""

from __future__ import annotations

import struct

from fastapi.testclient import TestClient

from ingress_worker.main import DEFAULT_INGESTION_BEARER_TOKEN, app


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


def test_ingest_json_returns_rows_processed() -> None:
    """JSON ingestion returns the v1 processed response."""
    client = TestClient(app)

    response = client.post(
        "/api/v1/ingest/json",
        headers=AUTH_HEADERS,
        json={"asset_id": "asset-json", "coordinates": [[1, 2, 3], [4.5, 5.5, 6.5]]},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["rows_processed"] == 2
    assert body["input_format"] == "JSON"
    assert body["status"] == "PROCESSED"
    assert "job_correlation_id" in body


def test_ingest_csv_with_header_returns_rows_processed() -> None:
    """CSV ingestion accepts a header row and blank lines."""
    client = TestClient(app)

    response = client.post(
        "/api/v1/ingest/csv",
        headers={**AUTH_HEADERS, "Content-Type": "text/csv"},
        content="x,y,z\n1,2,3\n\n4,5,6\n",
    )

    assert response.status_code == 200
    body = response.json()
    assert body["rows_processed"] == 2
    assert body["input_format"] == "CSV"
    assert body["status"] == "PROCESSED"


def test_ingest_binary_returns_rows_processed() -> None:
    """Binary ingestion returns rows processed for a decoded telemetry frame."""
    client = TestClient(app)

    response = client.post(
        "/api/v1/ingest/binary",
        headers={**AUTH_HEADERS, "Content-Type": "application/octet-stream"},
        content=build_binary_payload([[1.0, 2.0, 3.0], [4.0, 5.0, 6.0]]),
    )

    assert response.status_code == 200
    body = response.json()
    assert body["rows_processed"] == 2
    assert body["input_format"] == "BINARY"
    assert body["status"] == "PROCESSED"


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


def test_ingest_csv_invalid_row_returns_422() -> None:
    """Invalid CSV rows return a structured adapter error."""
    client = TestClient(app)

    response = client.post(
        "/api/v1/ingest/csv",
        headers={**AUTH_HEADERS, "Content-Type": "text/plain"},
        content="x,y,z\n1,nope,3\n",
    )

    assert response.status_code == 422
    body = response.json()
    assert body["error"] == "Unprocessable Entity"
    assert body["detail"]["input_format"] == "CSV"


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
