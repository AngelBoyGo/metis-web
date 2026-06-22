"""Persistent METIS telemetry ingress worker."""

from __future__ import annotations

import logging
import os
import uuid
from collections.abc import Callable

from fastapi import FastAPI, Request
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


def apply_optional_projection(
    coordinates: list[list[float]],
    request: Request,
) -> list[list[float]]:
    """Apply radial projection when the request flag is truthy."""
    if not is_noise_injected(request):
        return coordinates

    logger.info("[MANIFOLD_CORRECTION_COMPLETED //] projection applied")
    return apply_radial_projection(coordinates, correction_factor=1.0)


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
    input_format: str,
    parser: CoordinateParser,
    accepted_media_types: set[str],
) -> JSONResponse:
    """Handle one v1 ingestion route."""
    if not is_authorized(request):
        return json_response({"error": "Unauthorized"}, 401)

    if not has_content_type(request, accepted_media_types):
        return json_response({"error": "Unsupported Media Type"}, 415)

    coordinates, error_response = await process_ingestion(request, input_format, parser)
    if error_response is not None:
        return error_response

    return json_response(
        {
            "job_correlation_id": str(uuid.uuid4()),
            "rows_processed": len(coordinates),
            "input_format": input_format,
            "status": "PROCESSED",
        },
        200,
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
async def ingest_binary(request: Request) -> JSONResponse:
    """Accept a binary telemetry frame and return a v1 summary."""
    return await v1_ingestion_response(
        request,
        "BINARY",
        parse_binary_payload,
        {"application/octet-stream"},
    )


@app.post("/api/v1/ingest/json")
async def ingest_json(request: Request) -> JSONResponse:
    """Accept JSON coordinates and return a v1 summary."""
    return await v1_ingestion_response(
        request,
        "JSON",
        parse_json_payload,
        {"application/json"},
    )


@app.post("/api/v1/ingest/csv")
async def ingest_csv(request: Request) -> JSONResponse:
    """Accept CSV coordinates and return a v1 summary."""
    return await v1_ingestion_response(
        request,
        "CSV",
        parse_csv_payload,
        {"text/csv", "text/plain"},
    )
