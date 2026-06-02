# SentinelX: Enterprise Intelligence Operating System

SentinelX is a state-of-the-art **Enterprise Intelligence Operating System** and **Enterprise Resilience Platform** designed to act as a unified fabric for active security defense, continuous digital twin network mapping, cognitive threat forensics, and resilient event broker architectures. It enables organizations to withstand, model, and mitigate sophisticated multi-stage cyber threat campaigns in real time.

Designed for high-security environments, SentinelX integrates live telemetry normalization, graph relationship propagation, generative AI threat forensics, scenario-based mitigation modeling, and zero-trust controls into a cohesive command center.

---

## 🚀 Executive Overview

Modern enterprise infrastructure resides in hybrid-multi-cloud environments, exposing organizations to extremely complex, fast-moving, and multi-stage attack vectors. Traditional Security Information and Event Management (SIEM) systems focus on raw log storage, but they lack relational context, leading to high telemetry costs, alert fatigue, and delayed containment.

**SentinelX** solves these problems by providing:
* **The Living Enterprise Topology**: An in-memory, real-time dependency graph mapping relations between user identities, server hosts, databases, and microservices.
* **Unified Event Ingestion**: An open endpoint and processing engine designed to consume telemetry from standard security tools (Suricata, Falco, Wazuh, Syslog, OpenTelemetry) and immediately calculate downstream system risks.
* **Cognitive Decision Support**: Leverages generative AI models (such as Google’s Gemini) to conduct automatic impact assessments and blast-radius analysis without exposing raw platform credentials.
* **Deceptive Deception Loops (Honeytokens)**: Automated high-interaction honeypots that trigger defensive isolation maneuvers the moment malicious scans touch decoy ranges.

SentinelX is built for CISOs seeking enterprise-wide risk visibility, CIOs working on system consolidation, and SOC Directors aiming to slash Mean Time to Resolution (MTTR).

---

## 🎯 Core Capabilities

* **Enterprise Operating System**: Unified system orchestration coordinating identity services, operational processes, and network firewalls.
* **Cognitive AI Intelligence**: Deep analysis and natural language forensics of multi-hop security signals, identifying lateral speed patterns and lateral movement intents.
* **Knowledge Fabric**: Maps and indexes compliance policies (such as SOC2, PCI-DSS, GDPR, SWIFT, ISO-27001) to operational entities, highlighting deviations instantly.
* **Data Fabric**: Dual-database architecture using **PostgreSQL** in production with an on-demand fallback database (memory-optimized SQLite/SQL.JS) to assure 100% telemetry storage reliability.
* **Governance**: Automatically monitors identity changes, access rules, and administrator workflows to maintain secure access states.
* **Digital Twin & Simulation**: A visual cyber playground modeled directly from live network topologies. Operators can trigger threat simulations to compute mitigation strategies before pushing actual firewall rules.
* **Unified Telemetry**: Custom ingestion pipelines that normalize heterogenous events into a single schema.
* **Identity Intelligence**: Active monitoring of privileged access tokens, identifying AD privilege creep and session hijacking vectors.
* **Enterprise Command Center**: A zero-trust dashboard providing unified interactive control, graph visuals, tactical log search, and single-click containment.

---

## 🏗️ Technical Architecture & Subsystems

```
                                [ INCOMING TELEMETRY FEEDS ]
                  (Suricata Event JSON, Falco Audits, Wazuh HIDS, RFC 5424 Syslog, OTel)
                                             │
                                             v
                           ┌───────────────────────────────────┐
                           │      UNIFIED TELEMETRY BUS        │
                           │  - Express Ingestion & API Router │
                           │  - Telemetry Normalizer Adapter   │
                           └─────────────────┬─────────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
         ┌─────────────────────────┐                   ┌─────────────────────────┐
         │     DATA FABRIC         │                   │   KNOWLEDGE FABRIC      │
         │ - PostgreSQL 16 (Live)  │                   │ - Active Twin Memory    │
         │ - SQL.JS Memory Fallback│                   │ - Graph Intel Engine    │
         └─────────────────────────┘                   └────────────┬────────────┘
                                                                    │
                                                                    ▼
                                                       ┌─────────────────────────┐
                                                       │  ENTERPRISE COMMAND     │
                                                       │  - WebSocket Gateway    │
                                                       │  - React Canvas Graph   │
                                                       └────────────┬────────────┘
                                                                    │
                                                                    ▼
                                                       ┌─────────────────────────┐
                                                       │   COGNITIVE ENGINE      │
                                                       │  - Gemini AI Forensics  │
                                                       │  - Simulation modeling  │
                                                       └─────────────────────────┘
```

### Data Flow Lifecycles

1. **Telemetry Normalization**: Custom service endpoints normalize incoming logs (Wazuh, Falco, Syslog, etc.) into the open SentinelX Telemetry Protocol.
2. **State Updates**: Updates are processed by the central **Digital Twin Engine** where node metrics (risk, connectivity, CPU, latency) are mutated.
3. **Graph Intelligence**: The Graph Engine propagates risks across relational edges, highlighting affected assets.
4. **Cognitive Assessment**: Generative models parse multi-point anomalies to draft human-readable forensics reports and recommended playbooks.
5. **Interactive Controls**: Session states are broadcasted to active command centers via clustered Redb-Sub/WebSockets.
6. **Autonomic Defense Action**: Single-click remediation blocks credentials or isolates docker hosts, storing records in the compliance audit tables.

---

## 🛠️ Technology Stack

| Layer | Technology | Function |
| :--- | :--- | :--- |
| **Frontend** | React 19, Tailwind CSS, Lucide icons, Framer Motion | High-density Web UI, interactive force-directed graph rendering. |
| **Backend** | Node.js v22 (LTS), Express, TypeScript (TSX compilation) | Core APIs, streaming WebSockets gateway, relational controllers. |
| **Database** | PostgreSQL 16, TypeORM, memory-optimized SQL.JS | Persistent ledger logging, asset listings, transactional records. |
| **Message Bus** | Redis Pub/Sub, shared key-value states | Cross-session socket sync, horizontal scaling distribution. |
| **Cognitive Framework** | Google GenAI SDK (`@google/genai`), prompt isolation templates | Intelligent threat reasoning and incident forensics reports. |
| **Observability** | Prometheus, Grafana dashboards | System performance and health tracking. |

---

## 🚀 Local Setup & Deployment Guide

This workspace configuration is ready for native execution inside standard **Ubuntu 24.04 WSL2** or **Docker Desktop**.

### 1. Inbound Network Interface Allocation

Prior to boot, verify the following localhost ports are unrestricted:
* **Web Command Console**: `http://localhost:3000`
* **WebSocket Streaming API**: `ws://localhost:3000`
* **PostgreSQL Engine**: `localhost:5432`
* **Redis Event Broker**: `localhost:6379`
* **Grafana Dashboards**: `http://localhost:3001`
* **Prometheus Health Scraper**: `http://localhost:9090`

### 2. Standard Container Launch

Bring up the entire container stack with a single command from your terminal:
```bash
# Allow script execution
chmod +x ./start-local.sh

# Run multi-service system
./start-local.sh
```

*(Note for Windows developers: Use `start-local.bat` inside standard Command Prompt.)*

### 3. Environment Variables

Define the following environment variables inside your `.env` configuration:
* `DATABASE_URL`: Connection string pointing to live PostgreSQL hosts (`postgres://postgres:postgres_pass@postgres-db:5432/sentinelx_enterprise`).
* `REDIS_URL`: Connection string for session message distribution (`redis://:sentinel_redis_secret@redis-stream:6379`).
* `GEMINI_API_KEY`: API Key needed to trigger live generative forensics.
* `PORT`: Service port (defaults to `3000`).

---

## 📁 System Project Structure

```
├── .env.example                       # Application environment model template
├── docker-compose.yml                 # Multi-container orchestration setup
├── Dockerfile                         # Production-grade Node multi-stage compiler
├── package.json                       # Core service dependencies and compilation scripts
├── tsconfig.json                      # Compiler parameters
├── src/                               # React Frontend Web Application codebase
│   ├── components/                    # Dashboard view panels and canvas graphs
│   └── main.tsx                       # Main React browser mount file
├── backend/                           # Node TS API & Ingestion codebase
│   ├── app/                           # API subsystems
│   │   ├── ingestion/                 # Custom telemetry processors & adapters
│   │   ├── connectors/                # Native Active Directory and cloud sync engines
│   │   ├── simulation/                # Cyber twin models & state engines
│   │   ├── workers/                   # Background log workers
│   │   └── main.ts                    # Main API express router & controller
└── docs/                              # Production and Deployment manuals
```

---

## 🔧 Continuous Development Workflow

Inside the root system directory, the follow scripts are available:

* **Install dependencies offline/locally**: `npm install`
* **Launch local development API & client**: `npm run dev`
* **Build code for production export**: `npm run build`
* **Examine typescript syntax and types**: `npm run lint`
* **Execute system component unit tests**: `npm run test`

---

## 🚀 Technical Roadmap

1. **Graph Serialization Standard**: Export active dependency states into open graph formats (GML, GraphML) for threat analysis tools.
2. **Distributed Queue Engine Upgrade**: Replace memory systems with BullMQ and worker nodes to scale file processing during enterprise ingestion peaks.
3. **Hardware Enclaves Support**: Enable AWS Nitro Enclaves and confidential computing modules for secure key decryption.
4. **Kernel eBPF Integrations**: Develop native Linux eBPF telemetry hooks to capture host events directly at the kernel tier.

---

## 📄 License & Contribution Guide

### License
SentinelX is released under the **Apache License 2.0**. For complete details, review licensing documentation within the system directories.

### Contribution Guidelines
Prior to issuing pull requests:
* Document clear use cases, describing specific business benefits.
* Run standard static analyzers (`npm run lint`) to confirm TypeScript rules are fully satisfied.
* Ensure code compiles without warnings (`npm run build`) before publishing changes.
