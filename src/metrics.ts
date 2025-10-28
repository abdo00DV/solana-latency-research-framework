import express from "express";
import client from "prom-client";

export const registry = new client.Registry();
client.collectDefaultMetrics({ register: registry });

export const ingestMessagesTotal = new client.Counter({
  name: "ingest_messages_total",
  help: "Count of received ingestion messages",
  labelNames: ["stream"] as const,
});
export const ingestErrorsTotal = new client.Counter({
  name: "ingest_errors_total",
  help: "Count of errors by type",
  labelNames: ["type"] as const,
});
export const ingestReconnectsTotal = new client.Counter({
  name: "ingest_reconnects_total",
  help: "Reconnect cycles due to errors/EOF",
});
export const ingestMessageLatencyMs = new client.Histogram({
  name: "ingest_message_latency_ms",
  help: "Latency from receive to minimal parse/log (ms)",
  buckets: [1, 2, 3, 5, 10, 20, 50, 100, 200, 500, 1000],
});

registry.registerMetric(ingestMessagesTotal);
registry.registerMetric(ingestErrorsTotal);
registry.registerMetric(ingestReconnectsTotal);
registry.registerMetric(ingestMessageLatencyMs);

export function serveMetrics(host: string, port: number) {
  const app = express();
  app.get("/healthz", (_req, res) => res.status(200).send("ok"));
  app.get("/metrics", async (_req, res) => {
    res.set("Content-Type", registry.contentType);
    res.end(await registry.metrics());
  });
  app.listen(port, host, () => {
    console.log(`[http] healthz on http://${host}:${port}/healthz`);
    console.log(`[http] metrics on http://${host}:${port}/metrics`);
  });
}
