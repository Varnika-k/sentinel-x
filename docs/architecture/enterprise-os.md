# SentinelX Enterprise Operating System (EOS) Layer

---

## 1. Purpose
The **Enterprise Operating System (EOS)** acts as the central policy enforcement decision hub of SentinelX. It sits above raw telemetry-collecting endpoints and below the Command Center. Its job is to bind technical risk metrics to business reality, calculating monetary exposure, cascading system dependencies, SLA impacts, compliance postures, and coordinating autonomic mitigation plans.

---

## 2. Architecture & Design
EOS is structured as a collection of sub-engines collaborating via the event bus:
* **Enterprise State Engine**: Holds the current global snapshot of the enterprise health.
* **Operational Model / Context**: Maps live infrastructure events to the lines of business they support (e.g., HR, Payroll, Logistics).
* **Mitigation / Defense Engine**: Holds remediation scripts and playbooks that are triggered when thresholds are crossed.
* **Compliance / Governance Engine**: Continuously audits zero-trust policies, access controls, and software versions.

---

## 3. Key Responsibilities
* **Health Scoring**: Calculate overall corporate health based on security, operational readiness, database connections, and infrastructure loads.
* **Financial Impact Modeling**: Translate active server infections into financial loss metrics (USD/hour) to aid decision prioritization.
* **Cross-Subsystem Signaling**: Listens to raw telemetry alerts and triggers appropriate higher-level events (e.g., publishing `orchestration:remediating` when playbooks are executed).
* **Enterprise Memory**: Recovers recurrent attack pattern logs to prevent regression.

---

## 4. Data Flow
1. **Raw Breach Warning**: Telemetry is ingested into the Graph Intelligence Engine.
2. **Impact Calculation**: EOS retrieves the node profile (e.g., `app-payroll`), reviews its connected database dependencies, and calculates current financial outage cost.
3. **Subsystem Coordination**: EOS broadcasts updated health scores onto the event bus.
4. **Autonomous Response**: If automated mitigation is active, EOS coordinates with the Autonomous Defense Layer to isolate the infected segment.

---

## 5. Subsystem Dependencies
* **Graph Intelligence Engine**: For graph topology data and node status.
* **Governance and Compliance Engine**: For policy adherence scores.
* **Event Bus**: For real-time updates and notification loops.

---

## 6. Operational Role
Acts as the translator between raw technical cyber telemetry and business-level risk, giving security operators, risk officers, and executive leadership a shared language and unified view.
