# SentinelX Observability Architecture
## Prometheus Metrics, OpenTelemetry Tracing, SLIs & SLOs

This architecture document specifies the observability framework deployed inside **SentinelX**, providing security operations teams with full insight into pipeline performance, database health, API latency, and AI inference latency.

---

## 1. Core Service-Level Indicators (SLIs) and Objectives (SLOs)

SentinelX targets the following Service Level Objectives (SLOs) under multi-tenant enterprise stress conditions:

| Indicator (SLI) | Measuring Mechanism | Target SLO Performance | Critical Warning Limit |
| :--- | :--- | :--- | :--- |
| **API Respond Latency** | Duration from HTTP request ingress to headers egress | $99\%$ of requests $< 200\text{ ms}$ | Any endpoint $> 1500\text{ ms}$ |
| **WebSocket Delivery** | Interval of event genesis in worker to screen render | $95\%$ of emissions $< 50\text{ ms}$| Emission delay $> 500\text{ ms}$ |
| **Telemetry ingestion**| Pipeline delay from sensor receipt to DB persistence | $99\%$ of events $< 2.5\text{ sec}$ | Ingestion delay $> 20\text{ sec}$|
| **AI Inference Latency**| Duration of Gemini API stream calculations | $90\%$ of completions $< 4\text{ sec}$| Generation time $> 15\text{ sec}$ |
| **System Availability** | Continuous status of health check ping registers | $99.99\%$ continuous uptime | Total outage $> 5\text{ min}$ |

---

## 2. Prometheus Metric Endpoint Specifications

The SentinelX application pods export a standard `/metrics` endpoint formatted for active Prometheus scrapers.

### Core Metrics Exported

- `sentinelx_api_request_duration_seconds{method, route, tenant_id, status}`: Histogram tracking API execution times across specific corporate accounts.
- `sentinelx_telemetry_ingested_events_total{sensor_type, tenant_id}`: Counter checking syslog, Suricata, and Falco parsed message depths.
- `sentinelx_pipeline_backlog_messages{queue_name}`: Gauge checking the active Redis stream queue depth to prevent storage starvation.
- `sentinelx_active_websocket_connections{tenant_id}`: Gauge counting active browser connections per tenant workspace.
- `sentinelx_ai_inference_duration_seconds{model_name, operation_type}`: Histogram capturing API reasoning execution cycles.

---

## 3. Distributed OpenTelemetry Tracing

For trace correlations across API gateways, simulation engines, database connections, and AI helpers, SentinelX injects standard **OpenTelemetry** headers (`W3C Trace Context` or `B3 Propagation` specs).

```
   [Kong API Gateway] -> (Injects TraceParent: "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01")
            |
            v
   [SentinelX API Node] -> (Span: "api_route_handler")
            |
   +--------+--------+
   |                 |
   v                 v
[Redis Stream]    [PostgreSQL Pool] -> (Span: "sql_execute_query", db.statement: "SELECT...")
   |
   v (Propagates SpanContext)
[Inferences Engine] -> (Span: "gemini_api_call", model: "gemini-2.5-pro")
```

- **Trace Propagation**: Every incoming HTTP request or WebSocket handshake generates a unique `trace_id`. Downstream queries, async background jobs, and outbound API calls forward this context in their payload headers.
- **Trace Export Protocol**: Exported via **gRPC** or **HTTP (OTLP)** to central systems (Dynatrace, Jaeger, Datadog, AWS X-Ray, Google Cloud Trace).

---

## 4. Platform Health Check Framework

Pods expose decoupled, lightweight JSON health check routes to ensure immediate load-balancer failovers:

### Liveness Probe (`/health/liveness`)
Concludes quickly, returning `200 OK` unless the application process has crashed or is locked in a deadlock.
- **Output sample**: `{ "status": "OK", "uptime": 86450 }`

### Readiness Probe (`/health/readiness`)
Verifies active connection readiness before routing traffic to the Node:
- Checks PostgreSQL connection pool availability.
- Pings Redis Sentinel/Cluster for active health responses.
- Confirms state loader readiness.
- **Fail response**: `503 Service Unavailable` with details of the failing dependency.

### Diagnostics Portal (`/health/diagnostics`)
Accessible strictly to administrators. Emits deep diagnostics covering system resource usage, thread states, cached memory footprints, database execution statistics, and connection pools.
