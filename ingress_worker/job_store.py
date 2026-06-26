"""Filesystem-backed job persistence for telemetry ingestion."""

from __future__ import annotations

import json
import os
import struct
import uuid
from datetime import UTC, datetime
from pathlib import Path
from threading import Lock

FLOATS_PER_ROW = 3
ROW_BYTES = FLOATS_PER_ROW * 8
POINTS_HEADER = struct.Struct(">Q")

_store_lock = Lock()


def jobs_root() -> Path:
	"""Return the configured jobs data root directory."""
	return Path(os.getenv("METIS_JOBS_DATA_ROOT", "/data/jobs"))


def ensure_jobs_root() -> None:
	"""Create the jobs data root if missing."""
	jobs_root().mkdir(parents=True, exist_ok=True)


def _current_timestamp() -> str:
	return datetime.now(UTC).isoformat()


def _job_dir(job_uuid: str) -> Path:
	return jobs_root() / job_uuid


def _meta_path(job_uuid: str) -> Path:
	return _job_dir(job_uuid) / "meta.json"


def _payload_path(job_uuid: str) -> Path:
	return _job_dir(job_uuid) / "payload.bin"


def _points_path(job_uuid: str) -> Path:
	return _job_dir(job_uuid) / "points.bin"


def job_exists(job_uuid: str) -> bool:
	"""Return True when a job directory and meta file exist."""
	return _meta_path(job_uuid).is_file()


def create_job(raw_body: bytes, input_format: str, noise_injected: bool) -> str:
	"""Persist payload bytes to disk and return a new job UUID."""
	job_uuid = str(uuid.uuid4())
	job_dir = _job_dir(job_uuid)

	with _store_lock:
		job_dir.mkdir(parents=True, exist_ok=True)
		_payload_path(job_uuid).write_bytes(raw_body)
		meta = {
			"status": "INGESTING",
			"input_format": input_format,
			"rows_processed": 0,
			"created_at": _current_timestamp(),
			"completed_at": None,
			"error": None,
			"noise_injected": noise_injected,
		}
		_meta_path(job_uuid).write_text(json.dumps(meta), encoding="utf-8")

	return job_uuid


def _read_meta_file(job_uuid: str) -> dict | None:
	meta_file = _meta_path(job_uuid)
	if not meta_file.is_file():
		return None
	return json.loads(meta_file.read_text(encoding="utf-8"))


def load_meta(job_uuid: str) -> dict | None:
	"""Load job metadata from disk."""
	with _store_lock:
		return _read_meta_file(job_uuid)


def read_payload(job_uuid: str) -> bytes:
	"""Read raw ingest payload bytes from disk."""
	return _payload_path(job_uuid).read_bytes()


def _write_meta(job_uuid: str, meta: dict) -> None:
	_meta_path(job_uuid).write_text(json.dumps(meta), encoding="utf-8")


def save_completed(job_uuid: str, points: list[list[float]]) -> None:
	"""Serialize coordinate rows to points.bin and mark the job COMPLETED."""
	row_count = len(points)
	points_file = _points_path(job_uuid)
	payload = bytearray(POINTS_HEADER.pack(row_count))
	for row in points:
		for scalar in row:
			payload.extend(struct.pack(">d", scalar))

	with _store_lock:
		points_file.write_bytes(payload)
		meta = _read_meta_file(job_uuid)
		if meta is None:
			return
		meta.update(
			{
				"status": "COMPLETED",
				"rows_processed": row_count,
				"completed_at": _current_timestamp(),
				"error": None,
			},
		)
		_write_meta(job_uuid, meta)


def save_failed(job_uuid: str, error_detail: dict) -> None:
	"""Mark a job FAILED with structured error detail."""
	with _store_lock:
		meta = _read_meta_file(job_uuid)
		if meta is None:
			return
		meta.update(
			{
				"status": "FAILED",
				"error": error_detail,
				"completed_at": _current_timestamp(),
			},
		)
		_write_meta(job_uuid, meta)


def load_points_slice(job_uuid: str, start_idx: int, end_idx: int) -> list[list[float]]:
	"""Read a coordinate slice from points.bin without loading the full matrix."""
	points_file = _points_path(job_uuid)
	if not points_file.is_file():
		return []

	with points_file.open("rb") as handle:
		header_bytes = handle.read(POINTS_HEADER.size)
		if len(header_bytes) < POINTS_HEADER.size:
			return []
		row_count = POINTS_HEADER.unpack(header_bytes)[0]
		start_idx = max(0, start_idx)
		end_idx = min(end_idx, row_count)
		if start_idx >= end_idx:
			return []

		handle.seek(POINTS_HEADER.size + start_idx * ROW_BYTES)
		raw = handle.read((end_idx - start_idx) * ROW_BYTES)

	rows: list[list[float]] = []
	offset = 0
	while offset + ROW_BYTES <= len(raw):
		x, y, z = struct.unpack_from(">ddd", raw, offset)
		rows.append([x, y, z])
		offset += ROW_BYTES
	return rows
