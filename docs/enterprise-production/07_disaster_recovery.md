# SentinelX Disaster Recovery Plan
## Recovery SLAs, Multi-Region Replication & Failover Playbooks

This Disaster Recovery (DR) plan outlines the strategies and procedures to ensure multi-region continuity, replication consistency, and minimum system downtimes for **SentinelX** in the event of major infrastructure failures.

---

## 1. DURABILITIY & METRIC GOALS (SLAs)

SentinelX guarantees enterprise operational resilience under three severity tiers:

### Tier 1: Primary Database Loss (Region Outage)
- **Recovery Time Objective (RTO)**: $< 15$ Minutes (Transition traffic completely to a passive warm standby region).
- **Recovery Point Objective (RPO)**: $< 5$ Seconds (Representing maximum data loss via synchronous cloud replication delays).

### Tier 2: Cached Ingestion Stream Overload
- **Recovery Time Objective (RTO)**: $< 2$ Minutes.
- **Recovery Point Objective (RPO)**: Zero Data Loss (Due to NATS / Kafka log storage durability).

### Tier 3: Third-Party Authentication Service Outage (Okta/Entra ID)
- **Recovery Time Objective (RTO)**: $< 1$ Minute.
- **Recovery Point Objective (RPO)**: Zero Data Loss (Session tokens caches remain active locally).

---

## 2. Multi-Region Active-Passive Replication Design

```
+=======================================+       +=======================================+
|          US-EAST-1 (Primary Active)   |       |          US-WEST-2 (Warm Standby)     |
|                                       |       |                                       |
|  [Ingress Proxy] ---> [Application]   |       |               [Application]           |
|                          |            |       |                     |                 |
|                          v            |       |                     v                 |
|                   [PostgreSQL]        |       |               [PostgreSQL]            |
|                   (Active Leader)     |       |              (Warm Standby)           |
+==========================|============+       +=====================^=================+
                           |                                          |
                           +----------------- Replication ------------+
```

### Database Synchronization
- **Primary Site**: Actively processes transactions, running standard database instances.
- **Alternate Site (Standby)**: Subscribes to PostgreSQL write-ahead logs (WAL) via synchronous streaming replication. The standby database is mounted in read-only mode to handle read queries during peak workloads.
- **Failover DNS Routing**: Handled via **AWS Route 53 Multi-Value / Latency Routing** or Cloudflare Load Balancing. If the primary health check fails for 3 consecutive minutes, the DNS records are updated to point to the active warm standby region.

---

## 3. High-Integrity Database Backup Protocols

SentinelX runs structured backup schedules utilizing standard tools like `pg_backups` or Velero:

- **Hourly Backups**: Write-Ahead Logs (WAL) are shipped to an AWS S3 bucket with Object Lock enabled, preventing tampering or deletion of security audit data.
- **Daily Backups**: Complete snapshot backups are executed at 02:00 UTC, utilizing zero-downtime, copy-on-write capabilities.
- **Retention Schedule**:
  - Daily snapshots are retained for 30 days.
  - Monthly snapshots are retained for 1 year.
  - Yearly compliance audit snapshots are preserved indefinitely to meet SOC2 and regulatory requirements.

---

## 4. Disaster Recovery Scenarios & Response Runbooks

### Scenario A: Split-Brain Mitigation (Consensus Lost)
If network partitions isolate Kubernetes pods, different primary nodes may attempt to accept writes concurrently.
- **Prevention**: Uses **Raft consensus** (etcd/Consul) with Patroni.
- **Resolution**: If a node loses connection to the consensus cluster, it is automatically demoted, dropping active write pools and terminating open connections within $< 3$ seconds to prevent database corruption.

### Scenario B: AI Pipeline Interruption (Gemini Endpoint Connection Failure)
If the public network connection to the Gemini API is lost:
- **Resilience Strategy**:
  - API routes use a failover circuit breaker to gracefully degrade AI functionality when connection failures exceed $5\%$ over a 60-second window.
  - The system displays a warning message to security analysts, directing queries to a backup regional Gemini endpoint or localized fallback instances of Gemma to ensure continuous operations.
- **Auto-Retry**: Implements exponential backoff with random jitter to re-authenticate connections.
