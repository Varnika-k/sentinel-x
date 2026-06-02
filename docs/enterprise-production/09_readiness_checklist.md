# SentinelX Production Readiness Checklist
## Pre-Flight Security, Persistence, Ingress & AI Controls

This checklist outlines the technical verifications that must be completed before promoting any **SentinelX** cluster to live production status.

---

## 1. Secrets and Credential Audits
- [ ] **No Local plaintext .env file dependencies exist**: Validate that all environment parameters are loaded dynamically from HashiCorp Vault, AWS Secrets Manager, or Azure Key Vault.
- [ ] **Database Connection Strings Decoupled**: Ensure the main database string is encrypted at rest using KMS-wrapped credentials.
- [ ] **Secret Token Verification**: Confirm that secret tokens, such as API keys and JWT signing secrets, are rotated.
- [ ] **No secrets are logged**: Verify that logging outputs do not print sensitive keys or certificates in clear text.

---

## 2. Infrastructure Database Checks
- [ ] **Patroni HA Replication Active**: Verify that the PostgreSQL primary-secondary heartbeat is running normally across adjacent availability zones.
- [ ] **PgBouncer Connection Pooling Enabled**: Confirm that connection pools are sized correctly based on cluster capacity.
- [ ] **TimescaleDB Partition Rules Active**: Verify that the telemetry database tables have active monthly partition rules.
- [ ] **Encrypted Storage Volumes**: Ensure that EBS volumes and cloud storage classes use AES-256 block storage encryption.

---

## 3. High-Security Edge & Network Configurations
- [ ] **Strict TLS v1.3 Only Required**: Ensure the API Gateway (Kong/ALB) terminates SSL using TLS v1.3, dropping support for outdated TLS versions.
- [ ] **WAF (Web Application Firewall) Rules Active**: Protect the ingress endpoint against common attack vectors like SQL injection and cross-site scripting (XSS).
- [ ] **Rate Limiting Active**: Verify that API endpoints enforce rate-limiting rules (e.g. 100 requests per minute from a single IP address).
- [ ] **Isolated VPC Architecture**: Ensure that backend application pods, databases, and cache layers reside in private subnets with no direct public routes.

---

## 4. Multi-Tenant Partition Verification
- [ ] **Default Fallbacks Dissolved**: Confirm that default fallbacks are disabled in production, requiring valid `X-Tenant-ID` header parameters.
- [ ] **Redis Prefix Isolation Confirmed**: Verify that cache operations prepend active tenant prefixes to avoid cross-tenant cache contamination.
- [ ] **Tenant Metadata Synchronization**: Ensure tenant profiles, permissions, and compliance boundaries are registered in the metadata database.

---

## 5. Observability and Monitoring Setup
- [ ] **Prometheus Exporter Active**: Confirm that the `/metrics` endpoint is reachable and exporting system metrics.
- [ ] **Grafana Performance Dashboards Loaded**: Verify that dashboard panels are rendering correctly.
- [ ] **Liveness and Readiness Probes Configured**: Ensure HTTP probes are configured for Kubernetes pod health monitoring.
- [ ] **Alerting Thresholds Confirmed**: Hook Slack, PagerDuty, or OpsGenie channels to active alarms (e.g. database disk space $> 80\%$ or ingestion queues $> 50k$ items).

---

## 6. AI Integrations Verification
- [ ] **Gemini API Key Securely Loaded**: Verify that the Gemini API key is loaded into server-side process environments.
- [ ] **Prompt Isolation Appended**: Confirm that multi-tenant prompt templates are automatically applied during runtime.
- [ ] **AI Usage Costs Tracked**: Verify that AI call volumes and tokens usage are aggregated and logged for cost management.
