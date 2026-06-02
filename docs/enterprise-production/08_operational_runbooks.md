# SentinelX Operational Runbooks
## Platform Incidents Mitigation, Core Rotations & Sensor Recovery

This operations manual provides step-by-step procedures for platform engineers and SREs to resolve performance bottlenecks, rotation tasks, and network disconnects in **SentinelX**.

---

## Runbook 01: Deployments Experiencing High CPU/Memory Load

### Problem Statement
An application pod's CPU utilization exceeds $90\%$ or memory footprint hits $85\%$ of the designated container limits, triggering Prometheus alerts.

### Remediation Steps
1. **Analyze Resource Footprint**:
   Query active cluster resources using standard kubectl utilities:
   ```bash
   kubectl top pods -n sentinelx-prod
   ```
2. **Increase Horizontal Bounds (Scale Up)**:
   Scale up replicas of the affected deployment to distribute workload:
   ```bash
   kubectl scale deployment/sentinelx-api-server --replicas=8 -n sentinelx-prod
   ```
3. **Inspect Thread Profiler Output**:
   Query the diagnostics port `/health/diagnostics` to locate slow database calls, background worker loops, or long-running AI inference requests.
4. **Tune Garbage Collection**:
   If Node memory leaks are detected, adjust container environment parameters to allocate memory more efficiently:
   ```yaml
   env:
     - name: NODE_OPTIONS
       value: "--max-old-space-size=3072"
   ```

---

## Runbook 02: Resolving Database Lock Starvation

### Problem Statement
A high volume of concurrent write queries creates transaction bottlenecks, causing API requests to hang or time out.

### Remediation Steps
1. **Locate Stuck Queries**:
   Log into the primary database instance and query the active locks table:
   ```sql
   SELECT pid, age(clock_timestamp(), query_start), usename, query, state 
   FROM pg_stat_activity 
   WHERE state != 'idle' AND age(clock_timestamp(), query_start) > interval '5 seconds'
   ORDER BY 2 DESC;
   ```
2. **Terminate Blocked Transactions**:
   Identify the process ID (PID) of the blocking transaction and terminate it safely:
   ```sql
   SELECT pg_cancel_backend(BLOCKING_PID);
   -- If non-responsive, terminate the connection:
   SELECT pg_terminate_backend(BLOCKING_PID);
   ```
3. **Review Connection Pools**:
   Check PgBouncer settings in `database.poolMax` to verify that active connections are matched to database resource capacity.

---

## Runbook 03: Rotating Secret Keys

### Problem Statement
An enterprise compliance policy requires a key rotation, or an existing credential (such as an Azure Client Secret or AWS KMS Key) is compromised.

### Remediation Steps
1. **Generate New Credentials**:
   Generate a new credential pair inside your corporate identity provider (e.g. Azure Entra Portal or Okta).
2. **Register the New Secret with the Key Vault**:
   Store the secret securely within your enterprise key vault (AWS Secrets Manager, Azure Key Vault, or HashiCorp Vault), using a unique version identifier.
3. **Perform Zero-Downtime Rollover**:
   - Save the new credentials under the appropriate vault key while keeping the previous secret active.
   - SentinelX automatically synchronizes secret keys, allowing the server to transition securely to the new credentials without service disruption.
4. **Trigger Cache Invalidation**:
   Flush the local secrets cache to load the rotated values immediately:
   ```bash
   curl -X POST -H "Authorization: Bearer <Admin-Token>" https://sentinelx.domain.corp/api/v3/secrets/invalidate-cache
   ```
5. **Revoke the Deprecated Secret**:
   Confirm that the new keys are successfully processing requests, then revoke the old credentials from the identity provider.

---

## Runbook 04: Resolving Telemetry Ingestion Drops (Sensor Outages)

### Problem Statement
Events from critical network sensors (like Suricata or Falco) drop to zero, indicating potential connection failures or pipeline blocks.

### Remediation Steps
1. **Verify Network Connectivity**:
   Confirm that the security sensors can reach the designated ingestion endpoint:
   ```bash
   ping -c 4 ingest-listener.sentinelx.internal
   ```
2. **Check Sensor Pod Container Logs**:
   Inspect the container logs for network errors, credential validation issues, or file access exceptions:
   ```bash
   kubectl logs deployment/suricata-sensor -n sentinelx-prod
   ```
3. **Monitor Ingestion Queue Depths**:
   Check the Redis stream size to determine if events are accumulating in the buffer without being processed:
   ```bash
   redis-cli -u $REDIS_URL XLEN sentinelx:telemetry:ingest
   ```
4. **Scale Telemetry Workers**:
   If the Kafka backlog continues to grow, scale up the background telemetry workers to process the event backlog:
   ```bash
   kubectl scale deployment/sentinelx-telemetry-worker --replicas=6 -n sentinelx-prod
   ```
