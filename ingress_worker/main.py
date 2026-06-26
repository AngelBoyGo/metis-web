"""Persistent METIS telemetry ingress worker."""

from __future__ import annotations

import logging
import math
import os
import uuid
from collections.abc import Callable
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from typing import Any

from fastapi import BackgroundTasks, FastAPI, Request
from fastapi.responses import JSONResponse

from ingress_worker import job_store, response_cache
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
DEFAULT_PAGE_SIZE = 100_000
JSON_HEADERS = {
	"Cache-Control": "no-store, max-age=0, must-revalidate",
}
TRUTHY_HEADER_VALUES = {"1", "true", "yes", "on"}

logger = logging.getLogger("metis.ingress_worker")
logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))


@asynccontextmanager
async def lifespan(_app: FastAPI):
	"""Ensure the jobs data root exists at startup."""
	job_store.ensure_jobs_root()
	yield


app = FastAPI(title="METIS Persistent Telemetry Ingress", lifespan=lifespan)

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


def parse_error_detail(input_format: str, error: Exception) -> dict[str, str]:
	"""Create structured adapter error detail."""
	return {
		"input_format": input_format,
		"message": str(error),
	}


def current_timestamp() -> str:
	"""Return an ISO-8601 UTC timestamp."""
	return datetime.now(UTC).isoformat()


def compute_total_pages(rows_processed: int, page_size: int = DEFAULT_PAGE_SIZE) -> int:
	"""Return the page count for one coordinate result set."""
	if rows_processed <= 0:
		return 0
	return math.ceil(rows_processed / page_size)


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
	"""Parse payload bytes from disk and persist the job result."""
	meta = job_store.load_meta(job_uuid)
	if meta is None:
		return

	try:
		raw_body = job_store.read_payload(job_uuid)
		coordinates = parser(raw_body)
		reconstructed_points = apply_projection_flag(
			coordinates,
			bool(meta.get("noise_injected")),
		)
		rows_processed = len(reconstructed_points)
		logger.info(
			"[INGESTION_ADAPTER_PARSED //] input_format=%s rows=%s",
			input_format,
			rows_processed,
		)
		job_store.save_completed(job_uuid, reconstructed_points)
	except (PayloadParseError, BadTelemetryFrameError) as error:
		job_store.save_failed(job_uuid, parse_error_detail(input_format, error))


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
	job_uuid = job_store.create_job(raw_body, input_format, is_noise_injected(request))
	background_tasks.add_task(process_ingestion_job, job_uuid, input_format, parser)

	return json_response(
		{
			"job_uuid": job_uuid,
			"status": "INGESTING",
			"message": "Telemetry stream link opened",
		},
		202,
	)


def _completed_status_payload(job_uuid: str, meta: dict[str, Any]) -> dict[str, Any]:
	rows_processed = meta.get("rows_processed", 0)
	return {
		"job_uuid": job_uuid,
		"status": "COMPLETED",
		"rows_processed": rows_processed,
		"total_pages": compute_total_pages(rows_processed),
	}


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

	meta = job_store.load_meta(job_uuid)
	if meta is None:
		return json_response({"error": "Not Found"}, 404)

	status = meta["status"]
	if status == "INGESTING":
		return json_response(
			{
				"job_uuid": job_uuid,
				"status": "INGESTING",
				"input_format": meta.get("input_format"),
				"rows_processed": meta.get("rows_processed", 0),
			},
			200,
		)

	if status == "COMPLETED":
		cached = response_cache.get_cached(job_uuid)
		if cached is not None:
			return json_response(cached, 200)

		payload = _completed_status_payload(job_uuid, meta)
		response_cache.set_cached(job_uuid, payload)
		return json_response(payload, 200)

	return json_response(
		{
			"job_uuid": job_uuid,
			"status": "FAILED",
			"error": meta.get("error"),
		},
		422,
	)


@app.get("/api/v1/jobs/status/{job_uuid}/points")
async def job_status_points(
	job_uuid: str,
	request: Request,
	page: int = 1,
	limit: int = DEFAULT_PAGE_SIZE,
) -> JSONResponse:
	"""Return one paginated slice of reconstructed coordinates."""
	if not is_authorized(request):
		return json_response({"error": "Unauthorized"}, 401)

	if page < 1:
		return json_response(
			{
				"error": "Unprocessable Entity",
				"detail": "page must be >= 1",
			},
			422,
		)

	if limit < 1 or limit > DEFAULT_PAGE_SIZE:
		return json_response(
			{
				"error": "Unprocessable Entity",
				"detail": f"limit must be between 1 and {DEFAULT_PAGE_SIZE}",
			},
			422,
		)

	meta = job_store.load_meta(job_uuid)
	if meta is None:
		return json_response({"error": "Not Found"}, 404)

	status = meta["status"]
	if status != "COMPLETED":
		return json_response(
			{
				"error": "Conflict",
				"detail": f"Job status is {status}; coordinate slices require COMPLETED",
			},
			409,
		)

	cache_key = f"{job_uuid}:{page}:{limit}"
	cached = response_cache.get_cached(cache_key)
	if cached is not None:
		return json_response(cached, 200)

	start_idx = (page - 1) * limit
	end_idx = start_idx + limit
	coordinate_slice = job_store.load_points_slice(job_uuid, start_idx, end_idx)

	payload = {
		"page": page,
		"limit": limit,
		"reconstructed_coordinates": coordinate_slice,
	}
	response_cache.set_cached(cache_key, payload)
	return json_response(payload, 200)
