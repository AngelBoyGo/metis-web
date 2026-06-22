"""Stateless payload parsers for METIS ingestion routes."""

from __future__ import annotations

import csv
import io
import json
import math
from json import JSONDecodeError
from typing import Any

from ingress_worker.decoder import TelemetryStreamDecoder


class PayloadParseError(ValueError):
    """Raised when an ingestion payload cannot be parsed."""


def parse_json_payload(raw_body: bytes) -> list[list[float]]:
    """Parse a JSON coordinate payload into 3D float rows."""
    try:
        decoded_payload = raw_body.decode("utf-8-sig")
        payload = json.loads(decoded_payload)
    except UnicodeDecodeError as error:
        raise PayloadParseError("JSON payload is not valid UTF-8 text") from error
    except JSONDecodeError as error:
        raise PayloadParseError("JSON payload is malformed") from error

    if not isinstance(payload, dict):
        raise PayloadParseError("JSON payload must be an object")

    asset_id = payload.get("asset_id")
    if not isinstance(asset_id, str) or not asset_id:
        raise PayloadParseError("JSON payload requires asset_id")

    return _coerce_coordinate_rows(payload.get("coordinates"), "JSON")


def parse_csv_payload(raw_body: bytes) -> list[list[float]]:
    """Parse a CSV coordinate payload into 3D float rows."""
    try:
        decoded_payload = raw_body.decode("utf-8-sig")
    except UnicodeDecodeError as error:
        raise PayloadParseError("CSV payload is not valid UTF-8 text") from error

    reader = csv.reader(io.StringIO(decoded_payload))
    coordinates: list[list[float]] = []
    saw_data_row = False

    for line_number, row in enumerate(reader, start=1):
        if not row or all(not column.strip() for column in row):
            continue

        trimmed_row = [column.strip() for column in row]
        if not saw_data_row and _is_csv_header(trimmed_row):
            saw_data_row = True
            continue

        saw_data_row = True
        if len(trimmed_row) != 3:
            raise PayloadParseError(f"CSV row {line_number} must contain x,y,z")

        coordinates.append(
            [
                _coerce_float(value, f"CSV row {line_number}")
                for value in trimmed_row
            ],
        )

    if not coordinates:
        raise PayloadParseError("CSV payload contains no coordinate rows")

    return coordinates


def parse_binary_payload(raw_body: bytes) -> list[list[float]]:
    """Parse a binary telemetry frame into 3D float rows."""
    decoder = TelemetryStreamDecoder()
    decoder.feed(raw_body)
    return decoder.finish().coordinates


def _is_csv_header(row: list[str]) -> bool:
    """Return true when the first CSV row is the x,y,z header."""
    return [column.lower() for column in row] == ["x", "y", "z"]


def _coerce_coordinate_rows(candidate: Any, input_format: str) -> list[list[float]]:
    """Convert nested coordinate values into finite float rows."""
    if not isinstance(candidate, list):
        raise PayloadParseError(f"{input_format} coordinates must be a list")

    coordinates: list[list[float]] = []
    for index, row in enumerate(candidate, start=1):
        if not isinstance(row, list) or len(row) != 3:
            raise PayloadParseError(
                f"{input_format} coordinate row {index} must contain three values",
            )

        coordinates.append(
            [
                _coerce_float(value, f"{input_format} coordinate row {index}")
                for value in row
            ],
        )

    if not coordinates:
        raise PayloadParseError(f"{input_format} coordinates must not be empty")

    return coordinates


def _coerce_float(value: Any, location: str) -> float:
    """Convert one coordinate scalar into a finite float."""
    if isinstance(value, bool):
        raise PayloadParseError(f"{location} contains a non-numeric value")

    try:
        scalar = float(value)
    except (TypeError, ValueError) as error:
        raise PayloadParseError(f"{location} contains a non-numeric value") from error

    if not math.isfinite(scalar):
        raise PayloadParseError(f"{location} contains a non-finite value")

    return scalar
