const INGESTION_BEARER_TOKEN =
  process.env.METIS_INGESTION_BEARER_TOKEN ??
  "metis_live_7f8c1a9d3b2e4560a7b8c9d0e1f2a3b4";

const JSON_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Content-Type": "application/json",
};

const FRAME_MAGIC = 0x4d455449;
const ASSET_UUID_BYTE_LENGTH = 16;
const HEADER_BYTE_LENGTH = 4 + ASSET_UUID_BYTE_LENGTH + 8 + 4;
const FLOAT64_BYTE_LENGTH = 8;
const VECTOR_SCALAR_COUNT = 3;
const TRUTHY_HEADER_VALUES = new Set(["1", "true", "yes", "on"]);

type BinaryFrame = {
  assetUuid: string;
  trackingTimestamp: bigint;
  coordinates: number[][];
};

class BadBinaryFrameError extends Error {
  /**
   * Mark a binary ingestion frame as user input that cannot be parsed.
   */
  constructor(message: string) {
    super(message);
    this.name = "BadBinaryFrameError";
  }
}

/**
 * Build a no-store JSON response for the production ingestion endpoint.
 */
function jsonResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: JSON_HEADERS,
  });
}

/**
 * Decode a V15 big-endian binary frame into coordinate vectors.
 */
function decodeBinaryFrame(payload: ArrayBuffer): BinaryFrame {
  if (payload.byteLength < HEADER_BYTE_LENGTH) {
    throw new BadBinaryFrameError("Binary frame is shorter than the header");
  }

  const view = new DataView(payload);
  let offset = 0;

  const magic = view.getUint32(offset, false);
  offset += 4;

  if (magic !== FRAME_MAGIC) {
    throw new BadBinaryFrameError("Invalid magic number");
  }

  const assetUuidBytes = new Uint8Array(
    payload,
    offset,
    ASSET_UUID_BYTE_LENGTH,
  );
  const assetUuid = new TextDecoder().decode(assetUuidBytes).replace(/\0+$/g, "");
  offset += ASSET_UUID_BYTE_LENGTH;

  const trackingTimestamp = view.getBigInt64(offset, false);
  offset += 8;

  const scalarCount = view.getInt32(offset, false);
  offset += 4;

  if (scalarCount < 0) {
    throw new BadBinaryFrameError("Coordinate scalar count is negative");
  }

  if (scalarCount % VECTOR_SCALAR_COUNT !== 0) {
    throw new BadBinaryFrameError(
      "Coordinate scalar count is not divisible by three",
    );
  }

  const coordinatesByteLength = scalarCount * FLOAT64_BYTE_LENGTH;
  if (payload.byteLength - offset < coordinatesByteLength) {
    throw new BadBinaryFrameError("Binary frame ended before coordinates");
  }

  const coordinates: number[][] = [];
  for (let scalarIndex = 0; scalarIndex < scalarCount; scalarIndex += 1) {
    const coordinate = view.getFloat64(offset, false);
    offset += FLOAT64_BYTE_LENGTH;

    const vectorIndex = Math.floor(scalarIndex / VECTOR_SCALAR_COUNT);
    if (!coordinates[vectorIndex]) {
      coordinates[vectorIndex] = [];
    }
    coordinates[vectorIndex].push(coordinate);
  }

  return {
    assetUuid,
    trackingTimestamp,
    coordinates,
  };
}

/**
 * Read the optional radial projection flag from the request headers.
 */
function isNoiseInjected(request: Request): boolean {
  const value = request.headers.get("x-metis-noise-injected");
  return value !== null && TRUTHY_HEADER_VALUES.has(value.trim().toLowerCase());
}

/**
 * Normalize vectors onto a unit sphere while preserving zero vectors.
 */
function applyRadialProjection(coordinates: number[][]): number[][] {
  return coordinates.map((coordinate) => {
    const [x, y, z] = coordinate;
    const magnitude = Math.hypot(x, y, z);

    if (magnitude === 0) {
      return coordinate;
    }

    return [x / magnitude, y / magnitude, z / magnitude];
  });
}

/**
 * Accept raw binary ingestion payloads and return a processed job receipt.
 */
export async function POST(request: Request): Promise<Response> {
  const authorization = request.headers.get("authorization") ?? "";
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

  if (tokenMatch?.[1] !== INGESTION_BEARER_TOKEN) {
    return jsonResponse('{"error":"Unauthorized"}', 401);
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("application/octet-stream")) {
    return jsonResponse('{"error":"Unsupported Media Type"}', 415);
  }

  try {
    const payload = await request.arrayBuffer();
    const parsedFrame = decodeBinaryFrame(payload);
    const reconstructedCoordinates = isNoiseInjected(request)
      ? applyRadialProjection(parsedFrame.coordinates)
      : parsedFrame.coordinates;

    void parsedFrame.assetUuid;
    void parsedFrame.trackingTimestamp;

    const jobCorrelationId = crypto.randomUUID();

    return jsonResponse(
      JSON.stringify({
        job_correlation_id: jobCorrelationId,
        reconstructed_coordinates: reconstructedCoordinates,
        status: "PROCESSED",
      }),
      200,
    );
  } catch (error) {
    if (error instanceof BadBinaryFrameError) {
      return jsonResponse(
        JSON.stringify({
          error: "Bad Request",
          detail: error.message,
        }),
        400,
      );
    }

    return jsonResponse(
      JSON.stringify({
        error: "Internal Server Error",
        metadata: {
          parser: "metis-v15-binary-frame",
          reason: "unexpected parsing failure",
        },
      }),
      500,
    );
  }
}
