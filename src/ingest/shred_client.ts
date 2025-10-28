/**
 * Robust, safe gRPC streaming client:
 * - TLS
 * - metadata auth header (Bearer token from env)
 * - exponential backoff reconnect
 * - minimal message handling (no sensitive payload logging)
 * - Prometheus metrics (counters + histogram)
 *
 * NOTE: RPC method path is illustrative. Do NOT publish private API signatures.
 */
import * as grpc from "@grpc/grpc-js";
import { env } from "../config.js";
import {
  serveMetrics,
  ingestMessagesTotal,
  ingestErrorsTotal,
  ingestReconnectsTotal,
  ingestMessageLatencyMs,
} from "../metrics.js";

const STREAM_LABEL = "shred";

function metadata(): grpc.Metadata {
  const md = new grpc.Metadata();
  md.add("authorization", `Bearer ${env.SHREDSTREAM_TOKEN}`);
  return md;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function runStream() {
  const creds = grpc.credentials.createSsl();
  const client = new grpc.Client(env.SHREDSTREAM_ENDPOINT, creds);
  let backoff = 250; // ms
  const maxBackoff = 8000;

  while (true) {
    console.log(`[ingest] connecting to ${env.SHREDSTREAM_ENDPOINT} ...`);
    const start = Date.now();

    try {
      const call = client.makeServerStreamRequest(
        "/example.ShredStream/Subscribe", // illustrative path
        (arg: any) => Buffer.from([]),
        (buf: Buffer) => ({}),
        null,
        metadata()
      );

      call.on("data", (msg: any) => {
        const t0 = Date.now();
        // (optional) parse minimal metadata here safely; avoid payload dumps
        ingestMessagesTotal.labels(STREAM_LABEL).inc();

        const dt = Date.now() - t0; // minimal handling latency
        ingestMessageLatencyMs.observe(dt);
      });

      await new Promise<void>((resolve, reject) => {
        call.on("end", resolve);
        call.on("error", (e: Error) => reject(e));
      });

      console.warn("[ingest] stream ended, reconnecting...");
      ingestReconnectsTotal.inc();
    } catch (e: any) {
      console.error("[ingest] stream error:", e?.message ?? e);
      ingestErrorsTotal.labels("grpc").inc();
      ingestReconnectsTotal.inc();
    }

    // backoff before reconnect
    console.log(`[ingest] backoff ${backoff}ms before reconnect`);
    await sleep(backoff);
    backoff = Math.min(backoff * 2, maxBackoff);
  }
}

async function main() {
  serveMetrics(env.HTTP_HOST, env.HTTP_PORT);
  runStream().catch((e) => {
    console.error("fatal ingest:", e);
    process.exit(1);
  });
}

main();
