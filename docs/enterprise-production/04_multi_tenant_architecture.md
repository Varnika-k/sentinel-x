# SentinelX Multi-Tenant Architecture
## Logical Partitioning, Isolated AI Contexts & Thread-Safe Context propagation

This design document outlines the detailed multi-tenancy mechanics implemented inside **SentinelX** to guarantee strict tenant isolation, customizable tenant policies, and zero-leak cross-domain operations.

---

## 1. Multi-Tenant Architectural Design Choices

To support scalable SaaS and dedicated tenant federated clouds, SentinelX supports three operational models for data segregation:

```
===================================================================
1. POOLED STORAGE MODEL (Logical Segregation via Tenant ID keys)
   [Node Table] -> [Row: Tenant A] | [Row: Tenant B] | [Row: Tenant A]
===================================================================
2. SCHEMA-LEVEL SEGREGATION (PostgreSQL Namespace Separation)
   [Schema: Tenant_Acme]         | [Schema: Tenant_Shield_Gov]
     └─ Nodes Table              |   └─ Nodes Table
===================================================================
3. SILO STORAGE MODEL (Completely Separate Databases)
   [Database Server A: Acme]     | [Database Server B: Gov-HW]
===================================================================
```

### Evaluation Matrix

| Segregation Strategy | Memory / Compute Cost | Onboarding Friction | Auditing Robustness | Compliance Rating |
| :--- | :--- | :--- | :--- | :--- |
| **Row-Level (Shared DB)** | $\text{Minimal}$ | $\text{Instantaneous}$ | $\text{Moderate}$ | $\text{SOC2 Adequate}$ |
| **Schema-Level (Segregated Schemas)**| $\text{Low-Medium}$| $\text{Fast (< 5 seconds)}$ | $\text{High}$ | $\text{ISO27001 / HIPAA}$ |
| **Silo Database Pool** | $\text{High}$ | $\text{Minutes}$ | $\text{Maximum}$ | $\text{FedRAMP / Secure Gov}$|

- **SentinelX default**: Hybrid Schema/Row segregation. Essentials clients run inside a highly optimized shared Pooled db schema. Enterprise and Secure Gov workspaces are instantly spun up with dedicated, isolated PostgreSQL schemas or separate dedicated databases.

---

## 2. Leak-Proof Isolation with AsyncLocalStorage

To achieve thread-safe context propagation across thousands of concurrent requests, SentinelX utilizes the `AsyncLocalStorage` API in Node.js instead of risky, error-prone manual variable passing.

```
       Express Route Ingress (HTTP / WebSocket Connection Request)
                              |
                     [Tenant Middleware]
- Intercepts Header parameters: 'X-Tenant-ID' or OIDC Claim tokens
- Fetches Registry Session (tier, permissions, audit settings)
                              |
       Binds context using: 'tenantLocalStorage.run(session, ...)'
                              |
+-----------------------------v-----------------------------+
|               Node.js Thread / Async Event Loop Context    |
|                                                           |
|       All async operations inside this bracket naturally  |
|       can read the exact active segment parameters:         |
|                                                           |
|       - 'getTenantContext()' -> { id: "tenant-acme-hq" }  |
|                                                           |
|       No manual function parameters, zero accidental      |
|       cross-talk leak hazards.                             |
+-----------------------------------------------------------+
```

---

## 3. Distributed Cache Partitioning (Redis Key Namespaces)

To prevent cache poisoning or cross-tenant cache retrieval errors, all Redis interactions are isolated:

- **Namespace Format**:
  `tenant:<Tenant-ID>:<Module-Prefix>:<Key>`
- **Example Ingress**:
  `tenant:tenant-acme-hq:digitaltwin:topology-snapshot`
- **Dynamic Routing Utility**:
  The `tenantManager.getTenantCacheNamespace(tenantId)` generates the required namespace, ensuring that Redis operations are constrained to the current tenant's boundary.

---

## 4. Tenant-Level AI Security and Prompt Isolation

When the Executive AI Copilot or strategic scenario simulations run, they undergo rigorous multi-tenant context injection to isolate AI training data and model responses:

### Tenant Prompts Safety Filter
At the start of any AI orchestration request, SentinelX automatically queries the tenant's safety parameters and appends a strict system guardrails block:

- **Prompt Envelope Isolation**:
  We inject the active organization's specific boundaries, compliance frameworks (e.g. HIPAA), and data retention rules directly into the Gemini model prompt via `compileAiContextDirectives()`.
- **Leak Prevention**:
  This approach prevents the model from leaking external corporate data, restricting AI context retrieval to the designated organization's memories. These safety boundaries are evaluated at the API level before sending prompts to the server-side Gemini API.
- **Model Overrides**:
  Enterprise customers can configure custom models (such as `gemini-2.5-pro` for deep reasoning on graph analysis, or `gemini-2.5-flash` for high-throughput stream evaluation) according to their API license budgets.
