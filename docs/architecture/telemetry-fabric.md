# SentinelX Telemetry Fabric

---

## 1. Purpose
The **Telemetry Fabric** is the event ingest, parsing, and normalization pipeline of SentinelX. It combines raw, high-throughput security event logs from heterogeneous endpoints (system level, host level, network edge) into standard, clean, structured events delivered to the Master Event Bus.

---

## 2. Architecture & Design
The Telemetry Fabric is built to handle multiple external inputs:
* **Falco Agent Collector**: Captures system call anomalies on host, namespaces, and directory operations (for container intrusion detection).
* **Suricata Core Module**: Ingests network packet logs, protocol violations, and signature matches.
* **Kubernetes Ingress Loggers**: Collects perimeter load balancing errors and unauthorized connection queries.
* **Unified Normalizer Loop**: Translates raw JSON reports into standardized `TelemetryEvent` structures with universal severity tiers.

---

## 3. Key Responsibilities
* **Log Ingest & Translation**: Collect alerts and normalize unstructured system information.
* **Sensor Health Checks**: Continuously audit ingestion agent connectivity.
* **Datalink Streaming**: Feed cleansed events into the Memory Event Bus without latency spikes.
* **System Event Decoupling**: Isolate raw sensor failures so that the core simulation engine remains stable.

---

## 4. Data Flow
1. **Intrusion Trigger**: A Suricata agent captures a malicious signature query at the perimeter.
2. **Alert Normalization**: The Telemetry Fabric maps the alert payload, setting severity to `high` and extracting target IP.
3. **Bus Broadcast**: Fabric publishes a `telemetry:ingested` event onto the global event loop.
4. **Graph Propagation**: Adjacent engines ingest the normalized log, updating internal server risk tables.

---

## 5. Subsystem Dependencies
* **Core Event Bus**: The distribution channel for normalized security logs.
* **Container Host Interfaces**: Direct linkages to OS kernel stream watchers.

---

## 6. Operational Role
Acts as the central nervous system, ensuring SentinelX speaks a single, high-fidelity security schema regardless of whether the threat originates at the host, container, or cloud network edge.
