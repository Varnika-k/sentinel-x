# SentinelX Digital Twin

---

## 1. Purpose
The **Digital Twin** is a dynamic, highly accurate, real-time mirror of the organization’s network topology. It allows operators, engineers, and risk officers to execute "what-if" risk scenario simulations (DDoS, Ransomware, internal file leakage, insider defection) on a mirrored architecture sandpit without touching production environments.

---

## 2. Architecture & Design
The Digital Twin operates alongside real-world telemetry feeds, utilizing:
* **Topology Mirror Loop**: Captures structural server nodes and connection edges.
* **Sandbox Environment Builder**: Translates exact config parameters into a simulated virtual workspace.
* **Heuristic SIR Prediction Models**: Runs math calculations to model lateral infection speeds and potential blast radii.

---

## 3. Key Responsibilities
* **Scenario Modeling**: Simulate massive intrusions and trace propagation paths through active databases.
* **Proactive Blast Radius Calculation**: Quantify the downstream impact score, system outages, and financial fallout of planned downtime or unplanned failures.
* **Playbook Testing**: Dry-run autonomous defensive isolation commands in the sandbox to observe network survivability metrics.

---

## 4. Data Flow
1. **Scenario Selection**: The operator triggers a "Ransomware Outbreak on DB" inside the Digital Twin interface.
2. **Deterministic Run**: Propagation model advances tick-by-tick, highlighting infection vectors.
3. **Impact Estimation**: Digital Twin delivers detailed predictions: downstream node dependencies affected, and estimated monetary damage.
4. **Remediation Suggestion**: Recommends the optimal policy configuration to quarantine the simulated threat.

---

## 5. Subsystem Dependencies
* **Graph Intelligence Engine**: The physical blueprint used to build the sandbox twin.
* **Enterprise State Engine**: Provides live configuration states of system policies.

---

## 6. Operational Role
Gives security architects a safe playground to measure network survivability under siege, ensuring changes to incident playbooks are backed by predictive, empirical simulation.
