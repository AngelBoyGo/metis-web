"""Persistent METIS telemetry ingress worker."""

from __future__ import annotations

import logging
import os
import uuid
from collections.abc import Callable
from datetime import UTC, datetime
from threading import Lock
from typing import Any

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import JSONResponse

from ingress_worker.adapters import (
    PayloadParseError,
    parse_binary_payload,
    parse_csv_payload,
    parse_json_payload,
)
from ingress_worker.decoder import (
    BadTelemetryFrameError,
    apply_radial_projection,
)


DEFAULT_INGESTION_BEARER_TOKEN = "metis_live_7f8c1a9d3b2e4560a7b8c9d0e1f2a3b4"
JSON_HEADERS = {
    "Cache-Control": "no-store, max-age=0, must-revalidate",
}
TRUTHY_HEADER_VALUES = {"1", "true", "yes", "on"}

logger = logging.getLogger("metis.ingress_worker")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))

app = FastAPI(title="METIS Persistent Telemetry Ingress")

CoordinateParser = Callable[[bytes], list[list[float]]]
JobRecord = dict[str, Any]

jobs_registry: dict[str, JobRecord] = {}
jobs_registry_lock = Lock()


def ingestion_bearer_token() -> str:
    """Return the configured bearer token for telemetry ingestion."""
    return (
        os.getenv("METIS_BEARER_TOKEN")
        or os.getenv("INGESTION_BEARER_TOKEN")
        or DEFAULT_INGESTION_BEARER_TOKEN
    )


def json_response(payload: dict, status_code: int) -> JSONResponse:
    """Create a no-store JSON response."""
    return JSONResponse(
        content=payload,
        status_code=status_code,
        headers=JSON_HEADERS,
    )


def is_authorized(request: Request) -> bool:
    """Check the Authorization bearer token."""
    authorization = request.headers.get("authorization", "")
    scheme, _, token = authorization.partition(" ")
    return scheme.lower() == "bearer" and token == ingestion_bearer_token()


def has_octet_stream_content_type(request: Request) -> bool:
    """Check for an application/octet-stream content type."""
    return has_content_type(request, {"application/octet-stream"})


def has_content_type(request: Request, accepted_media_types: set[str]) -> bool:
    """Check the request media type against an accepted set."""
    content_type = request.headers.get("content-type", "")
    media_type = content_type.split(";", 1)[0].strip().lower()
    return media_type in accepted_media_types


def is_noise_injected(request: Request) -> bool:
    """Read the optional radial projection request flag."""
    value = request.headers.get("x-metis-noise-injected")
    return value is not None and value.strip().lower() in TRUTHY_HEADER_VALUES


async def read_request_body(request: Request) -> bytes:
    """Read a request stream into bytes."""
    payload_accumulator = bytearray()
    async for chunk in request.stream():
        if chunk:
            payload_accumulator.extend(chunk)
    return bytes(payload_accumulator)


def parse_error_response(input_format: str, error: Exception) -> JSONResponse:
    """Create a structured adapter error response."""
    return json_response(
        {
            "error": "Unprocessable Entity",
            "detail": {
                "input_format": input_format,
                "message": str(error),
            },
        },
        422,
    )


def parse_error_detail(input_format: str, error: Exception) -> dict[str, str]:
    """Create structured adapter error detail."""
    return {
        "input_format": input_format,
        "message": str(error),
    }


def current_timestamp() -> str:
    """Return an ISO-8601 UTC timestamp."""
    return datetime.now(UTC).isoformat()


def get_job_record(job_uuid: str) -> JobRecord | None:
    """Return a shallow copy of one job record."""
    with jobs_registry_lock:
        record = jobs_registry.get(job_uuid)
        if record is None:
            return None
        return dict(record)


def update_job_record(job_uuid: str, updates: JobRecord) -> None:
    """Merge updates into one job record."""
    with jobs_registry_lock:
        record = jobs_registry.get(job_uuid)
        if record is None:
            return
        record.update(updates)


def create_ingestion_job(
    raw_body: bytes,
    input_format: str,
    noise_injected: bool,
) -> str:
    """Create a registry entry for one ingestion request."""
    job_uuid = str(uuid.uuid4())
    with jobs_registry_lock:
        jobs_registry[job_uuid] = {
            "status": "INGESTING",
            "payload": bytearray(raw_body),
            "reconstructed_points": [],
            "created_at": current_timestamp(),
            "input_format": input_format,
            "rows_processed": 0,
            "error": None,
            "noise_injected": noise_injected,
        }
    return job_uuid


def apply_projection_flag(
    coordinates: list[list[float]],
    noise_injected: bool,
) -> list[list[float]]:
    """Apply radial projection when the request flag is truthy."""
    if not noise_injected:
        return coordinates

    logger.info("[MANIFOLD_CORRECTION_COMPLETED //] projection applied")
    return apply_radial_projection(coordinates, correction_factor=1.0)


def apply_optional_projection(
    coordinates: list[list[float]],
    request: Request,
) -> list[list[float]]:
    """Apply radial projection when the request flag is truthy."""
    return apply_projection_flag(coordinates, is_noise_injected(request))


def process_ingestion_job(
    job_uuid: str,
    input_format: str,
    parser: CoordinateParser,
) -> None:
    """Parse payload bytes and cache the job result."""
    record = get_job_record(job_uuid)
    if record is None:
        return

    try:
        raw_body = bytes(record["payload"])
        coordinates = parser(raw_body)
        reconstructed_points = apply_projection_flag(
            coordinates,
            bool(record.get("noise_injected")),
        )
        rows_processed = len(reconstructed_points)
        logger.info(
            "[INGESTION_ADAPTER_PARSED //] input_format=%s rows=%s",
            input_format,
            rows_processed,
        )
        update_job_record(
            job_uuid,
            {
                "status": "COMPLETED",
                "reconstructed_points": reconstructed_points,
                "rows_processed": rows_processed,
                "completed_at": current_timestamp(),
                "error": None,
            },
        )
    except (PayloadParseError, BadTelemetryFrameError) as error:
        update_job_record(
            job_uuid,
            {
                "status": "FAILED",
                "error": parse_error_detail(input_format, error),
                "completed_at": current_timestamp(),
            },
        )


async def process_ingestion(
    request: Request,
    input_format: str,
    parser: CoordinateParser,
) -> tuple[list[list[float]], JSONResponse | None]:
    """Parse and transform an ingestion payload."""
    try:
        raw_body = await read_request_body(request)
        coordinates = parser(raw_body)
        logger.info(
            "[INGESTION_ADAPTER_PARSED //] input_format=%s rows=%s",
            input_format,
            len(coordinates),
        )
        return apply_optional_projection(coordinates, request), None
    except (PayloadParseError, BadTelemetryFrameError) as error:
        return [], parse_error_response(input_format, error)


async def v1_ingestion_response(
    request: Request,
    background_tasks: BackgroundTasks,
    input_format: str,
    parser: CoordinateParser,
    accepted_media_types: set[str],
) -> JSONResponse:
    """Handle one v1 ingestion route."""
    if not is_authorized(request):
        return json_response({"error": "Unauthorized"}, 401)

    if not has_content_type(request, accepted_media_types):
        return json_response({"error": "Unsupported Media Type"}, 415)

    raw_body = await read_request_body(request)
    job_uuid = create_ingestion_job(raw_body, input_format, is_noise_injected(request))
    background_tasks.add_task(process_ingestion_job, job_uuid, input_format, parser)

    return json_response(
        {
            "job_uuid": job_uuid,
            "status": "INGESTING",
            "message": "Telemetry stream link opened",
        },
        202,
    )


@app.get("/health")
async def health() -> dict[str, str]:
    """Return worker health metadata."""
    return {"status": "READY"}


@app.post("/api/jobs/start")
async def start_job(request: Request) -> JSONResponse:
    """Accept a binary telemetry stream and return reconstructed coordinates."""
    if not is_authorized(request):
        return json_response({"error": "Unauthorized"}, 401)

    if not has_octet_stream_content_type(request):
        return json_response({"error": "Unsupported Media Type"}, 415)

    logger.info("[PERSISTENT_INGRESS_ATTACHED //] stream opened")
    reconstructed_coordinates, error_response = await process_ingestion(
        request,
        "BINARY",
        parse_binary_payload,
    )
    if error_response is not None:
        return error_response

    return json_response(
        {
            "job_correlation_id": str(uuid.uuid4()),
            "reconstructed_coordinates": reconstructed_coordinates,
            "status": "PROCESSED",
        },
        200,
    )


@app.post("/api/v1/ingest/binary")
async def ingest_binary(request: Request, background_tasks: BackgroundTasks) -> JSONResponse:
    """Accept a binary telemetry frame and return a v1 summary."""
    return await v1_ingestion_response(
        request,
        background_tasks,
        "BINARY",
        parse_binary_payload,
        {"application/octet-stream"},
    )


@app.post("/api/v1/ingest/json")
async def ingest_json(request: Request, background_tasks: BackgroundTasks) -> JSONResponse:
    """Accept JSON coordinates and return a v1 summary."""
    return await v1_ingestion_response(
        request,
        background_tasks,
        "JSON",
        parse_json_payload,
        {"application/json"},
    )


@app.post("/api/v1/ingest/csv")
async def ingest_csv(request: Request, background_tasks: BackgroundTasks) -> JSONResponse:
    """Accept CSV coordinates and return a v1 summary."""
    return await v1_ingestion_response(
        request,
        background_tasks,
        "CSV",
        parse_csv_payload,
        {"text/csv", "text/plain"},
    )


@app.get("/api/v1/jobs/status/{job_uuid}")
async def job_status(job_uuid: str, request: Request) -> JSONResponse:
    """Return the cached lifecycle state for one v1 ingestion job."""
    if not is_authorized(request):
        return json_response({"error": "Unauthorized"}, 401)

    record = get_job_record(job_uuid)
    if record is None:
        return json_response({"error": "Not Found"}, 404)

    status = record["status"]
    if status == "INGESTING":
        return json_response(
            {
                "job_uuid": job_uuid,
                "status": "INGESTING",
                "input_format": record.get("input_format"),
                "rows_processed": record.get("rows_processed", 0),
            },
            200,
        )

    if status == "COMPLETED":
        return json_response(
            {
                "job_uuid": job_uuid,
                "status": "COMPLETED",
                "reconstructed_coordinates": record.get("reconstructed_points", []),
                "rows_processed": record.get("rows_processed", 0),
            },
            200,
        )

    return json_response(
        {
            "job_uuid": job_uuid,
            "status": "FAILED",
            "error": record.get("error"),
        },
        422,
    )
