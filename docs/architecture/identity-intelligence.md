# SentinelX Identity Intelligence

---

## 1. Purpose
**Identity Intelligence** monitors, audits, and visualizes administrative personnel directories, user privileges, and access vectors in the SentinelX environment. It bridges technical credentials to human owners and flags access privilege drifts (e.g. over-permissioned service accounts) that increase insider risk and lateral threat movement.

---

## 2. Architecture & Design
Identity Intelligence organizes human elements into readable network configurations:
* **User-to-Node Mapper**: Interrogates LDAP/AD records to map system ownership (e.g., Evan Wright owns `app-payroll`).
* **Privilege Level Evaluator**: Tracks administrators, support desks, developers, and operators’ security clearances.
* **Access Logs Analyser**: Fuses session-level log streams to identify suspicious login times or credential reuse anomalies.

---

## 3. Key Responsibilities
* **Ownership Mapping**: Expose direct owners of specific applications and database nodes to facilitate fast triage contact during incidents.
* **Insider Risk Diagnostics**: Calculate user-related vulnerability metrics.
* **Anomalous Access Alerts**: Trigger policy warnings when sensitive systems are queried by accounts without appropriate clearance.
* **Credential Drift Auditing**: Detect lingering over-permissioned admin service accounts.

---

## 4. Data Flow
1. **Access Event Ingest**: System captures a terminal login action on a confidential database.
2. **Access Evaluation**: Identity Intelligence audits the user’s clearance level.
3. **Drift Escalation**: If the query is anomalous, an identity-priority alert is published on the event bus.
4. **Command Console Alert**: Operator is briefed on the exact human, system owner, and contact data next to the affected node.

---

## 5. Subsystem Dependencies
* **Telemetry Fabric**: Ingestion point for authentication, terminal, and access log data.
* **Enterprise Memory Registers**: For checking historic patterns of account utilization.

---

## 6. Operational Role
Inserts the critical "human layer" into cyber offense-defense simulation, answering who owns, who manages, and who accessed compromised resources when an incident triggers.
