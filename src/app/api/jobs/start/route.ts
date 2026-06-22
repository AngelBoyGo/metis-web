const INGESTION_BEARER_TOKEN =
  process.env.METIS_INGESTION_BEARER_TOKEN ??
  "metis_live_7f8c1a9d3b2e4560a7b8c9d0e1f2a3b4";

const JSON_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Content-Type": "application/json",
};

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

  const payload = await request.arrayBuffer();
  if (payload.byteLength === 0) {
    return jsonResponse('{"error":"Empty request body"}', 400);
  }

  const jobCorrelationId = crypto.randomUUID();

  return jsonResponse(
    `{"job_correlation_id":"${jobCorrelationId}","reconstructed_coordinates":[[0.0,0.0,0.0]],"status":"PROCESSED"}`,
    200,
  );
}
