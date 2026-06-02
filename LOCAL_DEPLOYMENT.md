# SentinelX Local WSL & Docker deployment Guide

This guide describes how to run **SentinelX** entirely in a local offline/isolated environment (using Docker, Docker Compose, and Ubuntu WSL2) with **minimal manual configuration**.

The system is configured to auto-bootstrap a production-grade active defense cyber range cluster consisting of:
1. **SentinelX Core Application**: Node.js/Express.js backend + bundled React/Vite/Tailwind frontend.
2. **PostgreSQL Database**: Relational storage and telemetry ledger.
3. **Redis Stream Broker**: High-speed pub/sub message bus for continuous event pipelines.
4. **Prometheus**: Time-series performance metrics scraper.
5. **Grafana**: Graphical telemetry and service health observer.

---

## 🏗️ Local System Architecture Map

```
                     +---------------------------------------+
                     |         BROWSER PORT: 3000            |
                     |  (React/Tailwind High-Density Visuals)|
                     +-------------------+-------------------+
                                         |
                                         | Ingress / API / Sockets
                                         v
                     +---------------------------------------+
                     |         SENTINELX CONTAINER           |
                     |  (Express Core Node:22 Ingestion Engine)|
                     +-------+-----------------------+-------+
                             |                       |
            Port: 5432       v                       v  Port: 6379 (requirepass)
                 +-----------+-----------+   +-------+---------------+
                 |  POSTGRESQL CONTAINER  |   | REDIS STREAM MESSENGER|
                 |  (Relational Ledger)  |   | (Pub/Sub State Bus)   |
                 +-----------------------+   +-----------------------+
                                                         ^
                             +-------------------+-------+
                             |                   |
                             v                   v Ports: 9090 & 3001
                 +-----------+-----------+   +---------------+-------+
                 |  PROMETHEUS ENGINE    |---|   GRAFANA INTERACTIVE |
                 |  (Metrics Scraper)    |   |   (Observability)     |
                 +-----------------------+   +-----------------------+
```

---

## 📋 Prerequisites

Before starting, ensure your system meets the following specifications:

### Ubuntu Web Services Layer (WSL2)
* **WSL2** enabled with **Ubuntu** installed (`wsl --install -d Ubuntu`).
* Inside WSL, packages `bash`, `curl`, and `git` are available.

### Docker Desktop (Windows / macOS) or Native Docker Eng
* **Docker Desktop** installed with **WSL2 integration enabled** inside Docker Desktop Settings -> *Resources -> WSL Integration* (select Ubuntu).
* Ensure the Docker daemon is fully started and ready.

---

## ⚡ Quick Start: 2-Step Local Bootstrapper

We have included automated bootstrap programs designed for single-command launches.

### Method A: Linux / WSL / macOS (Recommended)
1. Open your terminal (e.g. Ubuntu WSL console).
2. Make the script executable and execute it:
   ```bash
   chmod +x ./start-local.sh
   ./start-local.sh
   ```
3. Enter your **Google Gemini API Key** (optional, press Enter to skip and run with offline heuristic intelligence).

### Method B: Native Windows Command Line
1. Open standard CMD (Command Prompt) or PowerShell in the root directory.
2. Run the batch script:
   ```cmd
   start-local.bat
   ```
3. Provide your **Google Gemini API Key** when prompted.

---

## 🎨 Local Service Directory

Once the bootstrapper completes, the following services will be fully accessible on your host machine:

| Component | Local Access Endpoint | Authentication Details | Description |
| :--- | :--- | :--- | :--- |
| **SentinelX Console** | `http://localhost:3000` | No auth needed | Main control panel, interactive cyber range, threat feed, twin simulator, zero trust maps. |
| **Grafana Visualizer**| `http://localhost:3001` | Default (admin / admin) | Standard metrics analyzer dashboards. |
| **Prometheus Interface**| `http://localhost:9090` | Public access | High-fidelity TSDB query engine and metric endpoints. |
| **PostgreSQL DB** | `localhost:5432` | User: `postgres`<br>Pass: `postgres_pass`<br>DB: `sentinelx_enterprise` | Holds telemetry feeds, incident tickets, digital twin snapshots, and historical summaries. |
| **Redis Broker** | `localhost:6379` | User: `default`<br>Pass: `sentinel_redis_secret` | Powers pub/sub network streams and websocket fanning. |

---

## ⚙️ Custom Environment Variables Setup (`.env`)

You can modify and tune variables inside the generated `.env` file directly:

| Key | Default Value | Tuning Guide |
| :--- | :--- | :--- |
| `PORT` | `3000` | Local port bound by SentinelX. Change if 3000 is occupied. |
| `GEMINI_API_KEY` | `""` | Paste your actual API Key from Google AI Studio to activate live generative cyber forensics. |
| `DATABASE_URL` | `postgres://postgres:postgres_pass@postgres-db:5432/...` | Points to the docker Postgres database. Reverts to in-memory `/tmp/database.sqlite` if removed or offline. |
| `REDIS_URL` | `redis://:sentinel_redis_secret@redis-stream:6379/0` | Points to the docker Redis stream. Standard memory fanning activates if connection fails. |

---

## 🏗️ Production Readiness Audit & Design Rationales

SentinelX contains advanced features to support standalone local operation out of the box:

1. **Pre-Compiles Top-level Scripts (`dotenv/config`)**:
   We added a global `import 'dotenv/config';` directly inside our `server.ts` entry file. This guarantees that local environment mappings are uniformly initialized at runtime before Express or TypeORM starts up.
2. **Resilient Dual-Fallback Database System**:
   If Postgres is down or credentialed falsely, the system waits 2 seconds between 3 subsequent retries. Upon exhaustion, it dynamically reverts to a fast local **SQLJS/SQLite database** (`database.sqlite`) to prevent the controller crashing, maintaining continuous operational logs.
3. **Double Fallback Streaming Event Bus**:
   If the local Redis service is unreachable or under heavy load, the underlying network mesh automatically routes event streams down locally inside RAM queues, safeguarding live WebSocket updates.
4. **Built-in Automatic Garbage Collection and Table Truncation (Anti-Memory-Leak Protection)**:
   SQLJS does not sweep memory naturally under continuous writes. To prevent out-of-memory lockups in low-resource VM environments like WSL:
   * Telemetry table sizes are audited periodically and kept below `120` entries.
   * Large JSON graph states with network node schemas are systematically truncated down to the latest `10` entries.
   * If queries fail with an OOM flag, the system performs an absolute automated state reset to immediately recover virtual memory.

---

## 🛠️ Operational Diagnostics & Logs Inspection

To inspect the background container mechanisms, use standard Docker Compose instructions:

### Watch Core Ingestion Logs
```bash
docker compose logs -f sentinelx
```

### Inspect Database Queries
```bash
docker compose logs -f postgres-db
```

### Reset All Local States (Full Hard Clean)
```bash
docker compose down -v
```

This clears physical databases and logs, recreating a fresh greenfield next time `./start-local.sh` is triggered.
