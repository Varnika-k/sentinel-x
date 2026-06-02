# SentinelX Enterprise Command Center

---

## 1. Purpose
The **Enterprise Command Center** is the unified administrative glass pane of SentinelX. It provides full, high-fidelity real-time visibility and control across the entire secure corporate infrastructure, allowing operational commanders, incident handlers, and analysts to monitor, investigate, and mitigate multi-vector cyber threats.

---

## 2. Architecture & Design
The Command Center is a high-density, React-based dashboards environment utilizing:
* **Interactive Navigation Sidebar**: Seamlessly toggle between control modes (Operations Map, Enterprise OS, Knowledge Fabric, AI Reasoning, Digital Twin, etc.).
* **Operations Map / Grid**: Interactive canvas displaying all network nodes and real-time packet transmissions.
* **Incident Queue & Activity Register**: Consolidated feeds of verified security incidents and administrative actions.
* **Policy Control Deck**: Manual toggle panel for global policy sets (Zero-Trust, isolation levels, audit depth).

---

## 3. Key Responsibilities
* **Unified Triage Grid**: Display incident details, severity tags, affected systems, and suggested steps.
* **Manual Mitigation Controls**: Provide overrides to manually lock, restore, or isolate microservice nodes.
* **Knowledge Integration**: Interface directly with the AI Intelligence layer to supply readable summaries of incidents.
* **Auditing and Reporting**: Standardized exporter models reporting active attack chains for compliance.

---

## 4. Data Flow
1. **Telemetry Feed**: System events arrive in real-time from the Core Event Bus.
2. **Visual Re-render**: Component updates network node visual status based on telemetry.
3. **Manual Operator Actions**: Operator clicks `Isolate Server` -> and an HTTP API call notifies the backend mitigation controllers.
4. **Log Registry**: The action is registered across the global Event Timeline and saved to Enterprise Memory.

---

## 5. Subsystem Dependencies
* **Enterprise Operating System**: For live health scores and financial impact projections.
* **Graph Intelligence Engine**: For structural server linkages.
* **Heuristic Visualizers**: Responsive maps built on SVG and D3.js.

---

## 6. Operational Role
Serves as the central security cockpit for SentinelX, aggregating all signals, AI insights, and manual commands.
