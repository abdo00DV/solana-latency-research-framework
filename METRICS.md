# Metrics Catalog (Prometheus)

**All names are example-safe.** No strategy outcomes are published here.

- `ingest_messages_total{stream="shred"}` (counter)  
  Count of received stream messages.

- `ingest_errors_total{type="grpc|decode|transport"}` (counter)  
  Error classification for debugging reliability.

- `ingest_reconnects_total` (counter)  
  Number of reconnect cycles due to EOF/errors.

- `ingest_message_latency_ms` (histogram)  
  Time from socket receive → minimal parse/log, to detect spikes.
  Buckets: [1,2,3,5,10,20,50,100,200,500,1000]

- `ingest_slot_gap` (gauge)  
  Gap between last seen slot and current (if slot parsed from metadata).

Scrape endpoint: `GET /metrics` (text exposition).
Health probe: `GET /healthz` returns `200 OK`.
