export const runtime = "edge";
export const dynamic = "force-dynamic";

export type TelemetryFrame = {
  clockHz: number;
  cycle: number;
  matrices: number;
  memoryBoundMb: number;
  ops: string[];
  ts: number;
};

const CLOCK_HZ = 8_000_000;
const EMIT_INTERVAL_MS = 500;

const OPCODES = [
  "MATMUL",
  "CONV2D",
  "ATTN",
  "REDUCE",
  "GATHER",
  "SCATTER",
  "SYNC",
  "FLUSH",
  "DMA_RD",
  "DMA_WR",
  "TENSOR",
  "KERNEL",
] as const;

/**
 * Builds a deterministic telemetry frame for the given processing cycle.
 * @param cycle - Monotonic processing-cycle counter
 * @returns TelemetryFrame locked to 8 MHz steady-state simulation
 */
function buildFrame(cycle: number): TelemetryFrame {
  const matrices = 64 + (cycle % 16);
  const memoryBoundMb = 8192 + (cycle % 256);
  const opCount = 6 + (cycle % 4);
  const ops: string[] = [];

  for (let i = 0; i < opCount; i += 1) {
    const opcode = OPCODES[(cycle + i) % OPCODES.length];
    const lane = (cycle * 7 + i * 3) % 128;
    ops.push(`${opcode}::L${lane.toString(16).toUpperCase().padStart(2, "0")}`);
  }

  return {
    clockHz: CLOCK_HZ,
    cycle,
    matrices,
    memoryBoundMb,
    ops,
    ts: Date.now(),
  };
}

/**
 * SSE route handler streaming deterministic high-dimensional telemetry.
 */
export function GET(): Response {
  const encoder = new TextEncoder();
  let cycle = 0;
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const emit = () => {
        const frame = buildFrame(cycle);
        cycle += 1;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(frame)}\n\n`),
        );
      };

      emit();
      intervalId = setInterval(emit, EMIT_INTERVAL_MS);
    },
    cancel() {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
