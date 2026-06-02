# SentinelX Deployment Architecture
## Orchestration Manifests, Hybrid-Cloud & Air-Gapped Topology

This specification charts the deployment architecture of **SentinelX**, from single-node instances to geographically distributed high-availability Kubernetes environments.

---

## 1. Multi-Environment Workload Breakdown

| Platform Flavor | Infrastructure Assets | Ingress Traffic Mechanism | Scaling Strategy | Optimal Target Profile |
| :--- | :--- | :--- | :--- | :--- |
| **Local Sandbox** | Individual Docker Host | Localhost Port Binding | Manual container restarts | Developer Sandbox |
| **On-Prem Appliance** | Clean Metal Node | SSL Proxy Interlock | Hardware scale-up (CPU/RAM)| Air-gapped Defense HQs |
| **Enterprise Cloud** | Multi-AZ Kubernetes | Managed Cloud ALB/ELB | Horizontal Pod Autoscaler(HPA)| Corporate Global SaaS |

---

## 2. Production Kubernetes (Helm/K8s) Topology

In high-concurrency commercial deployments, SentinelX is packaged via Helm and provisioned across standard managed engines (AWS EKS, GCP GKE, Azure AKS):

```
                        +----------------------+
                        |   Route 53 / DNS     |
                        +-----------+----------+
                                    |
+---------------------+             v             +----------------------+
|    AWS EKS Cluster  |  +--------------------+   |      Kong/Istio      |
|  (Multi-AZ Engine)  |  |   Ingress Class    |   |     Service Mesh     |
|                     |  |  (SSL Ter. / ALB)  |   | (mTLS Pod Isolation) |
|                     |  +---------+----------+   +----------+-----------+
|                     |            |                         |
|                     |            v                         v
|                     |  +--------------------+   +----------------------+
|                     |  |  Internal API Pods |   |   Background Ingest  |
|                     |  | (Horizontal Scale) |   |    (State Workers)   |
|                     |  +---------+----------+   +----------+-----------+
|                     |            |                         |
|                     |            +------------+------------+
|                     |                         |
|                     v                         v
|                     +----------------------------------+
+---------------------+          Elasticache Redis       |
                      |          & Patroni PostgreSQL    |
                      +----------------------------------+
```

### Production Workload Manifest (Sample `deployment.yaml`)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinelx-api-server
  namespace: sentinelx-prod
  labels:
    app: sentinelx
    tier: api
spec:
  replicas: 4
  selector:
    matchLabels:
      app: sentinelx
      tier: api
  template:
    metadata:
      labels:
        app: sentinelx
        tier: api
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: tier
                  operator: In
                  values:
                  - api
              topologyKey: "kubernetes.io/hostname"
      containers:
      - name: api-container
        image: sentinelx-enterprise/server:v3.2.1
        imagePullPolicy: IfNotPresent
        ports:
        - containerPort: 3000
          name: api-port
        resources:
          limits:
            cpu: "2000m"
            memory: "4Gi"
          requests:
            cpu: "500m"
            memory: "1Gi"
        readinessProbe:
          httpGet:
            path: /health/readiness
            port: api-port
          initialDelaySeconds: 15
          periodSeconds: 10
        livenessProbe:
          httpGet:
            path: /health/liveness
            port: api-port
          initialDelaySeconds: 20
          periodSeconds: 15
        envFrom:
        - configMapRef:
            name: sentinelx-production-config
        - secretRef:
            name: sentinelx-keyvault-approle
```

---

## 3. Cloud Provider Mapping Specifications

### AWS Architecture
- **Ingress Engine**: AWS ALB terminating secure HTTPS using TLS v1.3 with automated AWS ACM certificates renewal.
- **Compute Plane**: Amazon EKS (Managed Node Groups across 3 distinct Availability Zones).
- **Persistence State**: Amazon RDS for PostgreSQL (Multi-AZ with replica endpoints) + Amazon ElastiCache for Redis (Cluster mode enabled).

### Azure Architecture
- **Ingress Engine**: Azure Application Gateway equipped with integrated Web Application Firewall (WAF) rule filters.
- **Compute Plane**: Azure Kubernetes Service (AKS) deploying specialized Virtual Machine Scale Sets.
- **Persistence State**: Azure Database for PostgreSQL Flexible Server + Azure Cache for Redis.

---

## 4. Hardened Air-Gapped On-Premises Architecture

For government defense sites, banking cores, and aerospace cleanrooms, SentinelX operates under absolute isolation guidelines:

- **Local Package Registry**: Deliverable via cohesive tarball files containing pre-compiled Docker images, Helm packages, and Database migration assets.
- **Vulnerability Patching**: Dynamic package updates require secure USB transit gates, requiring scanning through sandboxed malware scanners before server execution.
- **AI Infrastructure Air-gap**: In deep isolation nodes where public internet routes to the Gemini API are restricted, SentinelX redirects to private on-premises instances of **Gemini Code Assist** or localized **Gemma / Llama-3 models** hosted on isolated enterprise GPU servers.
- **Database Backup Plane**: Direct local SAN/NAS backups via encrypted NFS mounts using absolute local private keys.
