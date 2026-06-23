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


def decode_telemetry_stream(raw_body: bytes) -> list[list[float]]:
    """Parse adjacent big-endian METIS telemetry frames into 3D rows."""
    offset = 0
    coordinates_accumulator: list[list[float]] = []

    if not raw_body:
        raise BadTelemetryFrameError("Telemetry stream ended before header")

    while offset < len(raw_body):
        frame_start = offset
        remaining_header_bytes = len(raw_body) - offset
        if remaining_header_bytes < HEADER_BYTE_LENGTH:
            raise BadTelemetryFrameError(
                f"Truncated telemetry frame header at offset {frame_start}: "
                f"need {HEADER_BYTE_LENGTH} bytes, got {remaining_header_bytes}",
            )

        magic = struct.unpack_from(">I", raw_body, offset)[0]
        if magic != FRAME_MAGIC:
            raise BadTelemetryFrameError(f"Invalid magic marker at offset {frame_start}")
        offset += 4

        asset_bytes = raw_body[offset : offset + ASSET_UUID_BYTE_LENGTH]
        asset_uuid = asset_bytes.decode("ascii", errors="ignore").rstrip("\x00")
        offset += ASSET_UUID_BYTE_LENGTH

        tracking_timestamp = struct.unpack_from(">q", raw_body, offset)[0]
        offset += 8

        scalar_count = struct.unpack_from(">i", raw_body, offset)[0]
        offset += 4

        if scalar_count < 0:
            raise BadTelemetryFrameError(
                f"Coordinate scalar count is negative at offset {frame_start}",
            )

        if scalar_count % VECTOR_SCALAR_COUNT != 0:
            raise BadTelemetryFrameError(
                f"Coordinate scalar count at offset {frame_start} is not divisible by three",
            )

        scalar_byte_count = scalar_count * FLOAT64_BYTE_LENGTH
        remaining_scalar_bytes = len(raw_body) - offset
        if remaining_scalar_bytes < scalar_byte_count:
            raise BadTelemetryFrameError(
                f"Truncated telemetry frame scalars at offset {frame_start}: "
                f"need {scalar_byte_count} bytes, got {remaining_scalar_bytes}",
            )

        frame_coordinates: list[list[float]] = []
        for scalar_offset in range(offset, offset + scalar_byte_count, FLOAT64_BYTE_LENGTH):
            scalar = struct.unpack_from(">d", raw_body, scalar_offset)[0]
            if not math.isfinite(scalar):
                raise BadTelemetryFrameError(
                    f"Coordinate scalar is non-finite at offset {scalar_offset}",
                )

            if not frame_coordinates or len(frame_coordinates[-1]) == VECTOR_SCALAR_COUNT:
                frame_coordinates.append([])
            frame_coordinates[-1].append(scalar)

        frame_metadata = DecodedTelemetryFrame(
            asset_uuid=asset_uuid,
            tracking_timestamp=tracking_timestamp,
            coordinates=frame_coordinates,
        )
        coordinates_accumulator.extend(frame_metadata.coordinates)
        offset = frame_start + HEADER_BYTE_LENGTH + scalar_byte_count

    return coordinates_accumulator


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
