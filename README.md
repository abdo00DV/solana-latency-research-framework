# Solana Latency / Execution Research Framework (Safe, Advanced Demo)

A **non-sensitive**, advanced demo of a low-latency Solana trading/execution research setup:
- **Ingestion** via gRPC stream (e.g., ShredStream) with TLS, reconnect, health checks.
- **Metrics** via Prometheus + example Grafana dashboard (latency histograms/counters).
- **Config** with `.env` + Zod validation (no secrets committed).
- **Monitoring** via `docker-compose` (Prometheus + Grafana).

> This public demo **excludes strategy/execution logic and private endpoints**. It's strictly to demonstrate infrastructure maturity for infra providers (e.g., Jito).

## Quick start
```bash
cp .env.example .env   # fill placeholders locally; DO NOT COMMIT .env
npm install
npm run dev            # runs ingest client + metrics /health endpoints

# Optional: start monitoring stack (Prometheus:9090, Grafana:3000)
docker-compose up -d
```

## Project modules

- `src/ingest/shred_client.ts` — robust gRPC streaming client (TLS, backoff, reconnect).
- `src/metrics.ts` — Prometheus registry & histograms/counters.
- `src/config.ts` — Zod-validated config (env only).
- `src/health.ts` — basic HTTP health + metrics exposition.

See `ARCHITECTURE.md` and `METRICS.md` for details.
