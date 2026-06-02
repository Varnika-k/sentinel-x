# SentinelX Scaling Architecture
## Enterprise Scale Metrics, DB Partitioning, Streams & WebSocket Clustering

This specification outlines the mathematical scaling constraints, database sharding strategies, ingestion buffer pipelines, and parallel worker topologies enabling **SentinelX** to process billions of telemetrical and relationship inputs.

---

## 1. Baseline Scale Metrics Targets

SentinelX is built to monitor and orchestrate digital security meshes across large-scale enterprises with the following performance SLAs:

- **Corporate Employee Base**: $100,000+$ active workforce identities.
- **Federated Corporate Applications**: $10,000+$ distinct SaaS, Cloud, and custom APIs.
- **Dependency Map Nodes & Relationships**: $10,000,000+$ active graph linkages.
- **Daily Event Ingestion Volume**: $2,000,000,000+$ raw telemetry data streams (Suricata, Falco, cloud logs).
- **Concurrency Support**: $10,000+$ simultaneous cybersecurity team members active on live dashboards.

---

## 2. High-Performance Database Partitioning & Sharding

To prevent a single PostgreSQL table from bloating and causing query degradation under high volumes of events, SentinelX implements partition structures.

```
       [UnifiedTelemetryEventEntity TABLE] (Partitioned Router)
                               |
       +-----------------------+-----------------------+
       | Partitioned by: 'PARTITION BY RANGE (timestamp)'
       |
       v                       v                       v
+--------------+        +--------------+        +--------------+
| Events Table |        | Events Table |        | Events Table |
| (Year_2026_  |        | (Year_2026_  |        | (Year_2026_  |
|  Month_Jan)  |        |  Month_Feb)  |        |  Month_Mar)  |
+--------------+        +--------------+        +--------------+
```

### Partitioning Rules by Entity
- **Telemetry Events Table**: Partitioned using **Range Partitioning** on the `timestamp` column in monthly segments (e.g. `telemetry_y2026m06`).
- **Graph Snapshots Table**: Partitioned by **List Partitioning** on `tenant_id` to ensure isolated corporate scans reside on dedicated SSD storage ranges.
- **Replay Sessions & Incident Logs**: Maintained on standard write-optimized tables with B-Tree indices on `id`, `startTime`, and `tenantId`.

### Data Sharding
For global-scale deployments, the backend is sharded horizontally using **TimescaleDB** or **Postgres-Citus** extensions:
- **Shard Key**: Hash calculation on `(tenant_id, resource_id)`.
- **Primary Benefit**: Minimizes cross-node data lookup overhead during real-time graph rendering, restricting analytical evaluations to single hardware nodes.

---

## 3. High-Throughput Telemetry Ingestion Pipeline (Redis Streams)

Directly writing telemetry streams down into PostgreSQL in real-time creates storage write lock starvation. SentinelX interposes a non-blocking ingestion mesh:

```
+------------+       HTTP / UDP Logs POST
| Ingestion  | -------------------------------+
| Handlers   |                                 |
+------------+                                 |
                                               v
+------------+                       +-------------------+
| Suricata / | --------------------> | Redis Ingestion   |
| Falco Pods |                       | Stream / Queue    |
+------------+                       +---------+---------+
                                               |
                                               | (Parallel Batch Pull)
                                               v
                                     +-------------------+
                                     | Telemetry Workers |
                                     | (Parallel CPU     |
                                     |  Multithreading)  |
                                     +---------+---------+
                                               | (Bulk Write SQL - 5000/Batch)
                                               v
                                     +-------------------+
                                     | PostgreSQL        |
                                     | Partitioned Tables|
                                     +-------------------+
```

### Batch Ingestion Metrics
- **Buffered Queue**: Fast Redis memory instances hold incoming logs using asynchronous append-only writes, returning a `202 Accepted` response inside $< 1.5$ milliseconds to the network sensors.
- **Bulk Flusher Execution**: Background engine threads pull batches of $5,000$ events from the stream, running copy-optimized bulk SQL inserts to optimize disk storage write speeds.

---

## 4. Horizons-Scale WebSockets & Push Clustering

To deliver real-time dashboards across multiple georouted Security Operation Centers (SOCs) without overwhelming individual application pods:

- **Socket.io Cluster Scaling**: Pods connect to a shared Redis sentinel cluster. When an event fires, the Redis Pub/Sub adapter disseminates the socket payload across EKS cluster instances.
- **Dead-Connection Deadlocks Prevention**: Client connections enforce a 25-second heartbeat ping-pong sequence. Down connections are culled within 35 seconds to avoid memory leaks from dead file descriptors.
- **Dynamic Load Balancing**: Ingress controllers distribute WebSocket connections using IP Hash or Cookie Stickiness policies. This approach reduces redundant reconnection attempts, improving performance across multi-regional setups.
