# SentinelX Agent & Platform Deployment Guide

This operations guide defines bootstrap and installation steps for integrating SentinelX into enterprise environments or running standalone local simulation packages.

---

## 1. System Requirements
SentinelX is lightweight and can run in single containers or multi-node Kubernetes configurations:
* **Operating System**: Linux (CentOS 8+, Ubuntu 20.04+, Debian 11+) or Windows Server 2/3.
* **Core Requirements**: Node.js v18 or later, Redis v6+ (or local memory emulation).
* **Hardware Profile**: 4 Cores, 8GB RAM, 20GB SSD partition.

---

## 2. Ingest Agent Bootstrap (Suricata/Falco)
To connect live servers and compile intrusion events:
1. **Host-Level Falco Setup**:
   ```bash
   curl -s https://falco.org/repo/falcosecurity-packages.asc | apt-key add -
   echo "deb https://download.falco.org/packages/deb stable main" | tee -a /etc/apt/sources.list.d/falcosecurity.list
   apt-get update && apt-get install -y falco
   ```
2. **Setup Suricata Probe**:
   ```bash
   apt-get install -y suricata
   # Edit /etc/suricata/suricata.yaml to route logs to SentinelX receiver
   systemctl start suricata
   ```

---

## 3. Platform Launch (Local Sandbox)
1. Clone the platform repository.
2. Run installation scripts:
   ```bash
   npm install
   ```
3. Start the application dev mode:
   ```bash
   npm run dev
   ```
4. Access the command console page at: `http://localhost:3000`.
