"""Persistent METIS telemetry ingress worker."""

from __future__ import annotations

import logging
import os
import uuid

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from ingress_worker.decoder import (
    BadTelemetryFrameError,
    TelemetryStreamDecoder,
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
    content_type = request.headers.get("content-type", "")
    media_type = content_type.split(";", 1)[0].strip().lower()
    return media_type == "application/octet-stream"


def is_noise_injected(request: Request) -> bool:
    """Read the optional radial projection request flag."""
    value = request.headers.get("x-metis-noise-injected")
    return value is not None and value.strip().lower() in TRUTHY_HEADER_VALUES


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

    try:
        decoder = TelemetryStreamDecoder()
        logger.info("[PERSISTENT_INGRESS_ATTACHED //] stream opened")

        payload_accumulator = bytearray()
        async for chunk in request.stream():
            if chunk:
                payload_accumulator.extend(chunk)

        decoder.feed(bytes(payload_accumulator))
        parsed_frame = decoder.finish()
        logger.info(
            "[CHUNKED_STREAM_DECODED //] scalar_groups=%s",
            len(parsed_frame.coordinates),
        )

        reconstructed_coordinates = parsed_frame.coordinates
        if is_noise_injected(request):
            reconstructed_coordinates = apply_radial_projection(
                parsed_frame.coordinates,
                correction_factor=1.0,
            )
            logger.info("[MANIFOLD_CORRECTION_COMPLETED //] projection applied")

        return json_response(
            {
                "job_correlation_id": str(uuid.uuid4()),
                "reconstructed_coordinates": reconstructed_coordinates,
                "status": "PROCESSED",
            },
            200,
        )
    except BadTelemetryFrameError as error:
        return json_response(
            {
                "error": "Bad Request",
                "detail": str(error),
            },
            400,
        )
    except Exception as error:
        logger.error(
            "[PERSISTENT_INGRESS_ATTACHED //] request error class=%s",
            error.__class__.__name__,
        )
        return json_response(
            {
                "error": "Internal Server Error",
                "metadata": {
                    "worker": "metis-persistent-ingress-v16",
                    "reason": error.__class__.__name__,
                },
            },
            500,
        )
