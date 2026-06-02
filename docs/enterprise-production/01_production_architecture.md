# SentinelX Enterprise production Architecture
## High-Availability (HA), Clustering & Distributed State Layout

This document delineates the core production topology of **SentinelX**, moving away from local-only single-container environments to a decoupled, resilient, horizontally-scalable distributed enterprise platform.

---

```
                                  +-----------------------+
                                  |   Enterprise Ingress  |
                                  |   (AWS ALB / Kong API)  |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     | (X-Tenant-ID Segment)                           | (X-Tenant-ID Segment)
                     v                                                 v
         +-----------+-----------+                         +-----------+-----------+
         |     SentinelX Pod     |                         |     SentinelX Pod     |
         |    (API Server 01)    |                         |    (API Server 02)    |
         +-----+--------+-----+--+                         +-----+--------+-----+--+
               |        |     |                                  |        |     |
  +------------+        |     +----------------+  +--------------+        |     +------------+
  | (WebSocket Sync)    |                      |  |                       |                  |
  v                     |                      v  v                       |                  v
+-----------------+     |                    +------+                     |     +------------------+
|   Redis Ring    |     |                    | Kafka|                     |     | PostgreSQL Cluster|
| Distributed Bus |     |                    | Event|                     |     |  (Primary Write) |
+-----------------+     |                    | Bus  |                     |     +--------+---------+
                        v                    +------+                     v              | (Streaming)
                 +--------------+                                  +--------------+      v
                 | HashiCorp   |                                  | AWS KMS Key  |  +---+--+---------+
                 | Vault Engine |                                  | Manager      |  | Read-Replicas |
                 +--------------+                                  +--------------+  +---------------+
```

---

## 1. High Availability Database Layer (PostgreSQL HA)

To handle massive graph loads, simulation histories, and incident tracking, SentinelX relies on a multi-node PostgreSQL topology running in high-availability mode.

### Clustering Topology
- **Active Primary / Multiple Warm Standbys**: Enforced using **Patroni** and **Consul / Etcd** for reliable consensus-driven leader elections.
- **Failover SLA**: Automatic leader election and traffic rerouting within $< 10$ seconds, targeting an aggregate **$99.999\%$ system uptime (Five Nines)**.
- **Replication Channel**: Synchronous replication to at least one warm standby in an adjacent availability zone (AZ) to ensure zero-data-loss commit guarantees ($RPO = 0$). Asynchronous replication to standard read-replicas for read queries and heavy compliance analytical sweeps.

### Read/Write Ingress Split
- All backend entities use distinct pool links:
  - **Primary Write Pool**: Directs to the Patroni leader for transactional changes (Incident state modifications, digital twin scenario execution, config tweaks).
  - **Replica Connection Pool**: Routed via **PgBouncer** middleware directly across read-replicas. Telemetry viewer canvases, graph navigation grids, and search queries use these pools to minimize burden on primary transaction logs.

---

## 2. Distributed Memory and WebSockets Scaling (Redis Cluster)

SentinelX runs multiple stateless application nodes. Because users receive real-time graph updates. incident logs, and intelligence streams, state and communication are decoupled.

### Distributed Cache & WebSockets (Pub/Sub Adapter)
- **Session Decoupling**: All user sessions are decrypted server-side and tracked via standard JWT keys with sessions hydrated from **Redis**.
- **WebSocket Synchronization**: Leverages **Redis Pub/Sub adapter**. When an anomaly or automated mitigation occurs on Node A, it is published to the `sentinelx:websocket:broadcast` channel. Downstream, Node B and Node C consume the event and emit it directly to their local pinned socket connections.
- **Ring Buffering & Rate Control**: Highly dense telemetry events are not dumped into PostgreSQL in real-time. Instead, they write directly to a Redis stream which acts as a durable, non-blocking ingestion buffer.

---

## 3. High-Velocity Enterprise Message Bus (Apache Kafka / RabbitMQ)

For dense enterprise pipeline ingestion, SentinelX utilizes **Apache Kafka** or its high-performance counterpart **NATS JestStream** to decouple security event processors.

### Choice of Architecture: Apache Kafka
Kafka represents the highest-recommended transport architecture for SentinelX corporate rollouts under the following rationale:
1. **Log-Append Scale**: Handles millions of events/sec natively.
2. **Deterministic Partitioning**: Partition security events by `X-Tenant-Id` or `Agent-ID` to guarantee event sequence delivery for incident correlation.
3. **Consumer Replays**: Security operations analysts can rerun telemetry playback pipelines from up to 7 days in historical perspective.

### Kafka Topic Blueprint

| Topic Name | Partitions | Retention Policy | Compaction | Segment Trigger |
| :--- | :--- | :--- | :--- | :--- |
| `sentinelx.telemetry.ingest` | 32 (by Tenant) | 3 Days | Delete | 100,000 Messages |
| `sentinelx.mitigation.responses`| 8 | 14 Days | Delete | Time (1 Day) |
| `sentinelx.compliance.audit` | 16 | Infinite | Compact | Size (10 GB) |
| `sentinelx.ai.inferences` | 8 | 1 Day | Delete | Time (12 Hours) |

---

## 4. Horizontal Extensibility Limits & Metrics

The SentinelX deployment boundaries scale dynamically through Kubernetes horizontal pod autoscalers (HPA):

- **Auto-Scale Metrics**:
  - CPU threshold: $> 70\%$ allocated pod threshold for 3 consecutive minutes.
  - Memory usage: $> 80\%$ allocated RAM.
  - Ingestion buffer backlog: queue depth in Redis stream exceeds 50,000 unhandled records.
- **Scale-Up Speed**: Ready to accept incoming API handshakes within 12 seconds utilizing pre-warmed images and lazy-initialized connectors.
