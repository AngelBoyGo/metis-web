"""Streaming decoder for METIS binary telemetry frames."""

from __future__ import annotations

import math
import struct
from dataclasses import dataclass


FRAME_MAGIC = 0x4D455449
ASSET_UUID_BYTE_LENGTH = 16
HEADER_BYTE_LENGTH = 4 + ASSET_UUID_BYTE_LENGTH + 8 + 4
FLOAT64_BYTE_LENGTH = 8
VECTOR_SCALAR_COUNT = 3


class BadTelemetryFrameError(ValueError):
    """Raised when a telemetry frame cannot be parsed."""


@dataclass(frozen=True)
class DecodedTelemetryFrame:
    """Decoded METIS telemetry coordinates and frame metadata."""

    asset_uuid: str
    tracking_timestamp: int
    coordinates: list[list[float]]


class TelemetryStreamDecoder:
    """Incrementally parse a single big-endian METIS telemetry frame."""

    def __init__(self) -> None:
        """Create a decoder with no buffered stream data."""
        self._buffer = bytearray()
        self._asset_uuid: str | None = None
        self._tracking_timestamp: int | None = None
        self._scalar_count: int | None = None
        self._scalar_index = 0
        self._coordinates: list[list[float]] = []
        self._pending_vector: list[float] = []
        self._complete = False

    def feed(self, chunk: bytes | bytearray | memoryview) -> None:
        """Append stream bytes and parse all complete frame fields."""
        if not isinstance(chunk, (bytes, bytearray, memoryview)):
            raise TypeError("Telemetry chunks must be bytes-like")

        if self._complete and chunk:
            raise BadTelemetryFrameError("Trailing bytes after telemetry frame")

        self._buffer.extend(chunk)
        self._parse_header()
        self._parse_scalars()

    def finish(self) -> DecodedTelemetryFrame:
        """Return the decoded frame after the stream ends."""
        self._parse_header()
        self._parse_scalars()

        if self._asset_uuid is None or self._tracking_timestamp is None:
            raise BadTelemetryFrameError("Telemetry stream ended before header")

        if self._scalar_count is None or self._scalar_index != self._scalar_count:
            raise BadTelemetryFrameError("Telemetry stream ended before coordinates")

        if self._buffer:
            raise BadTelemetryFrameError("Trailing bytes after telemetry frame")

        return DecodedTelemetryFrame(
            asset_uuid=self._asset_uuid,
            tracking_timestamp=self._tracking_timestamp,
            coordinates=self._coordinates,
        )

    def _parse_header(self) -> None:
        """Parse the fixed frame header when enough bytes are present."""
        if self._scalar_count is not None:
            return

        if len(self._buffer) < HEADER_BYTE_LENGTH:
            return

        header = bytes(self._buffer[:HEADER_BYTE_LENGTH])
        del self._buffer[:HEADER_BYTE_LENGTH]

        magic = struct.unpack_from(">I", header, 0)[0]
        if magic != FRAME_MAGIC:
            raise BadTelemetryFrameError("Invalid magic number")

        asset_bytes_start = 4
        asset_bytes_end = asset_bytes_start + ASSET_UUID_BYTE_LENGTH
        asset_uuid = header[asset_bytes_start:asset_bytes_end].decode(
            "ascii",
            errors="ignore",
        )

        tracking_timestamp = struct.unpack_from(">q", header, asset_bytes_end)[0]
        scalar_count = struct.unpack_from(">i", header, asset_bytes_end + 8)[0]

        if scalar_count < 0:
            raise BadTelemetryFrameError("Coordinate scalar count is negative")

        if scalar_count % VECTOR_SCALAR_COUNT != 0:
            raise BadTelemetryFrameError(
                "Coordinate scalar count is not divisible by three",
            )

        self._asset_uuid = asset_uuid.rstrip("\x00")
        self._tracking_timestamp = tracking_timestamp
        self._scalar_count = scalar_count

    def _parse_scalars(self) -> None:
        """Parse all complete float64 scalars already in the buffer."""
        if self._scalar_count is None:
            return

        while (
            self._scalar_index < self._scalar_count
            and len(self._buffer) >= FLOAT64_BYTE_LENGTH
        ):
            scalar = struct.unpack_from(">d", self._buffer, 0)[0]
            del self._buffer[:FLOAT64_BYTE_LENGTH]

            self._pending_vector.append(scalar)
            self._scalar_index += 1

            if len(self._pending_vector) == VECTOR_SCALAR_COUNT:
                self._coordinates.append(self._pending_vector)
                self._pending_vector = []

        if self._scalar_index == self._scalar_count:
            self._complete = True


def apply_radial_projection(
    coordinates: list[list[float]],
    correction_factor: float = 1.0,
) -> list[list[float]]:
    """Move each non-zero 3D coordinate toward the unit sphere."""
    if not 0.0 <= correction_factor <= 1.0:
        raise ValueError("correction_factor must be between 0 and 1")

    projected_coordinates: list[list[float]] = []
    for coordinate in coordinates:
        x, y, z = coordinate
        magnitude = math.hypot(x, y, z)

        if magnitude == 0:
            projected_coordinates.append(coordinate)
            continue

        normalized = [x / magnitude, y / magnitude, z / magnitude]
        projected_coordinates.append(
            [
                original + correction_factor * (target - original)
                for original, target in zip(coordinate, normalized)
            ],
        )

    return projected_coordinates
