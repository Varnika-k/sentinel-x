# SentinelX Security Architecture
## Zero-Trust Enterprise Identity & Key-Vault Tokenization Specs

This security framework defines how **SentinelX** secures sensitive client configurations, manages federated identities, evaluates RBAC/ABAC authorization parameters, and records tamper-detection auditable records.

---

## 1. Zero-Trust Identity Federation (Okta & Entra ID Integration)

SentinelX integrates natively with multi-tenant Single Sign-On (SSO) providers using OpenID Connect (OIDC) and SAML v2.0 standards.

```
+-------------+         1. Authentication Request        +-------------+
|    User     | ---------------------------------------> | Enterprise  |
|  (Browser)  | <--------------------------------------- | Identity    |
+-------------+             2. SAML / Id token           |   Provider  |
       |                                                 | (Entra/Okta)|
       |                                                 +-------------+
       | 3. POST token to /api/auth/sso
       v
+-------------+         4. Validate signature            +-------------+
|  SentinelX  | ---------------------------------------> |  IdP JWKS   |
| API Gateway | <--------------------------------------- | Public Keys |
+-------------+             5. Validation response        +-------------+
       |
       | 6. Just-In-Time Provisioning
       v
+-------------+
| PostgreSQL /|
|  Identity   |
+-------------+
```

### Protocol Integrations
- **Microsoft Entra ID (Azure AD)**: Implements OpenID Connect Flow using confidential JWT certificates to exchange standard authorization codes.
- **Okta SSO**: Handles OAuth2 and SAML WebSSO. Supports reading nested claims to locate active corporate Active Directory (AD) groups.
- **Single Sign-On (SSO) SLA**: Multi-tenant redirection occurs via dedicated subdomain or corporate ID parameter (e.g. `https://sentinelx.domain.corp/login?tenantId=tenant-acme-hq`).

### Multi-Factor Authentication (MFA)
- Pre-requisite validation flags: SentinelX relies on claims parameter `amr: ["mfa"]` or standard SAML authentication class indicators (`urn:oasis:names:tc:SAML:2.0:ac:classes:SecondFactor`).
- Any attempt to trigger live system mitigations or re-allocate security boundary credentials immediately halts if MFA confirmation holds no validation evidence in the active JWT payload.

---

## 2. Advanced Access Control (RBAC, ABAC, and Inheritance)

SentinelX applies a layered authorization topology combining Role-Based Access Control (RBAC) and Attribute-Based Access Control (ABAC).

### Role Hierarchy
The configuration enforces cascading capabilities through strict logical role inheritance:

$$\text{SUPER\_ADMIN} \supset \text{ADMIN} \supset \text{SECURITY\_LEAD} \supset \text{ANALYST} \supset \text{OPERATOR} \supset \text{READONLY}$$

- If an operations route requires the `ANALYST` role, any active user holding `SECURITY_LEAD` or `SUPER_ADMIN` credentials gains access dynamically.

### Attribute-Based Access Control (ABAC) Policy Matrix
SentinelX evaluates the following parameters before permitting resource queries:

| Asset Layer | Required User Role | Location Constraint | Minimum Trust level | Allowed Posture Conditions |
| :--- | :--- | :--- | :--- | :--- |
| **Mitigation Trigger** | `OPERATOR`, `ADMIN` | Corporate Class Range | $\ge 80$ | `SECURE`, `COMPLIANT` |
| **Search Operations** | `READONLY` | Universal | $\ge 40$ | Universal |
| **Scenario Simulation** | `ANALYST`, `ADMIN` | Corporate/VPN VPN | $\ge 70$ | `SECURE`, `COMPLIANT` |
| **Connector Configuration**| `ADMIN` | Hardware Bound Device | $\ge 90$ | `SECURE` only |

---

## 3. Dynamic Secrets Management

To maintain compliance inside regulated enterprise banking and government defense branches, SentinelX **strictly bans** local ENV-file plaintext storage or repository-committed credentials.

```
                        +----------------------+
                        |   HashiCorp Vault    |
                        | (KvV2 Secure Engine) |
                        +----------+-----------+
                                   |
                  Secrets Request  |  Role Validation
                  (AppRole Token)  |  via KMS Dev-Token
                                   v
+------------------+    Dynamic    +-------------------+
| SentinelX Pod    | ------------> | decrypted Secret  |
| (API Client Port)| <------------ | (Temp RAM Cache)  |
+------------------+               +-------------------+
```

### Encryption and Storage
- **KMS Envelope Encryption**: High-security fields (e.g., AD Client Secrets, cloud access keys, customized API endpoints) are encrypted inside PostgreSQL using AES-256-GCM. The encryption key is sourced dynamically from external KMS platforms.
- **Supported Backends**:
  - AWS KMS & AWS Secrets Manager.
  - Microsoft Azure Key Vault (Key decryption keys).
  - HashiCorp Vault (Transit Engine).
- **Graceful Token Rotation**: Secrets Manager contains integrated Cron hooks to invalidate local decryptor caches every 12 hours, forcing dynamic refetches to catch credential rotations instantly and ensure zero-downtime key rollouts.
