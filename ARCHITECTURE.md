# Architecture (Public, Non-Sensitive)

**Goal:** Research transaction execution reliability & latency on Solana using real-time data streams and standardized metrics.

```
[Data Stream (e.g., ShredStream)]
│ (gRPC/TLS)
▼
Ingestion Client (this repo)
├─ reconnect/backoff
├─ light decoding
└─ per-slot timing markers
│
▼
Metrics Layer
├─ histograms/counters
└─ /metrics exposition
│
▼
Prometheus + Grafana
├─ scrape at 15s
└─ Latency Overview dashboard
```

> Planner/Executor components are **conceptual** here and excluded from this public repo to protect IP and avoid sensitive usage. This repo focuses on **ingestion quality, timing, and observability**.
