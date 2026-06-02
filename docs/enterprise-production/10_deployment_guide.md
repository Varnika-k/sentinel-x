# SentinelX Enterprise Deployment Guide
## Step-by-Step EKS Cluster Provisioning, Vault Injection & SSO Federation

This guide provides step-by-step instructions for deploying **SentinelX** in a cloud-native, high-availability corporate environment.

---

## Step 01: Setup Private Cloud VPC and Persistent Networks

Configure isolated network subnets across three availability zones (AZs) using Terraform or AWS CloudFormation:

- Provison **Private App Subnets** to host application containers.
- Provision **Isolated Databases Subnets** for database clusters.
- Create **NAT Gateways** in public subnets to provide secure outbound internet routes.
- Bind security group rules: RESTRICT traffic to port 3000, allowing connections exclusively from ingress resources.

---

## Step 02: Provision Managed Secrets Key Vault

Initialize HashiCorp Vault inside the target namespace:

1. **Deploy Vault Server**:
   ```bash
   helm repo add hashicorp https://helm.releases.hashicorp.com
   helm install vault hashicorp/vault --namespace sentinelx-prod -f values.yaml
   ```
2. **Configure AppRole Authentication**:
   Enable the AppRole authentication method to allow application pods to authenticate securely:
   ```bash
   vault auth enable approle
   ```
3. **Register Application Secrets**:
   Write sensitive parameters like connection strings and API keys to the KV storage:
   ```bash
   vault kv put secret/data/sentinelx/prod \
     DATABASE_URL="postgresql://sentinel_prod:SecurePass@db-pool.sentinelx.internal:5432/sentinelx_meta" \
     REDIS_URL="rediss://redis-cluster.sentinelx.internal:6379" \
     GEMINI_API_KEY="AIzaSyA..."
   ```

---

## Step 03: Establish Enterprise SSO Identity Integration

Register SentinelX as a trusted application in your Identity Provider (IdP):

### Microsoft Entra ID
1. Navigate to **Identity > Applications > App registrations** inside the Azure Portal.
2. Select **New registration**, naming the credential `SentinelX-Cloud-Ingressor`.
3. Configure the **Redirect URI**:
   `https://sentinelx.domain.corp/api/v3/connectors/azure-ad/callback`
4. Create a **Client Secret** and record the generated Value and App ID securely.
5. Grant required API permissions: `Directory.Read.All` and `User.Read`.

### Okta SSO Configuration
1. Navigate to the **Applications Console** and choose **Create App Integration**.
2. Select **OIDC - OpenID Connect** as your Sign-in method.
3. Configure redirect paths and assign designated Active Directory security groups (e.g., `SentinelX-Admins`) to map roles.

---

## Step 04: Initialize Helm Charts and Scale Deployments

1. **Update ConfigMap Schema Configurations (`configmap.yaml`)**:
   ```yaml
   apiVersion: v1
   kind: ConfigMap
   metadata:
     name: sentinelx-production-config
     namespace: sentinelx-prod
   data:
     DEPLOYMENT_PROFILE: "production"
     PORT: "3000"
     DB_POOL_MAX: "25"
     SECRETS_PROVIDER: "VAULT"
     VAULT_ADDR: "http://vault.sentinelx-prod.svc.cluster.local:8200"
   ```
2. **Execute Schema Migration Commands**:
   Run database migration scripts to verify that tables, indexes, and partition rules are successfully created:
   ```bash
   npx typeorm migration:run -d backend/app/db/data-source.ts
   ```
3. **Launch Helm Workloads**:
   ```bash
   helm install sentinelx ./charts/sentinelx --namespace sentinelx-prod
   ```

---

## Step 05: Configure Ingress TLS and Run Verify Checks

1. Verify that incoming SSL connections are routed correctly via the Ingress Controller:
   ```bash
   curl -I https://sentinelx.domain.corp/health/readiness
   ```
   *Expected Response*: `HTTP/2 200` with the metadata payload.
2. Confirm that logging and telemetry outputs are recording actions to the audit trail:
   ```bash
   kubectl logs deployment/sentinelx-api-server -n sentinelx-prod | grep "AUDIT"
   ```
   *Expected Response*: System login and operational trace entries formatted as clean JSON.
- **Verification Complete**: The platform is configured, secured, and ready for operations.
