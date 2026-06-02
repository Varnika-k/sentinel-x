# SentinelX Platform Overview Architecture

---

## 1. Purpose
SentinelX is a unified, high-fidelity Enterprise Autonomous Cyber Defense and Simulation Platform. It integrates distributed telemetry streams, represents them in an event-driven system graph, evaluates business impact, and initiates automated mitigative playbooks (Neural Isolation, Firewalls, IP Blacklisting) to secure the enterprise topology without interrupting mission-critical services.

---

## 2. Architecture
SentinelX is built on an event-driven, full-stack microservices design:
* **Ingestion Layer**: Telemetry Mesh parsing Falco, Suricata, and standard syslog streams.
* **Core Event Bus**: A cluster-wide Redis-backed messaging loop that coordinates event propagation.
* **Graph Intelligence Engine**: A real-time topology controller that models parent-child assets, lines of business, and vulnerability exposure.
* **Enterprise Operating System (EOS)**: The policy enforcement and business logic layer, calculating executive diagnostics, risk scores, and financial impact.
* **Enterprise Command Center / AI Reasoning Studio**: The primary glass-pane interface, providing real-time operations mapping, LLM reasoning summaries, and manual triage capabilities.

```
       [Telemetry Sources (Falco/Suricata/Ingress)]
                            │
                            ▼
                    [Telemetry Mesh]
                            │
                            ▼
              [Core Event Bus (Redis / Bus)]
                /           │            \
               ▼            ▼             ▼
       [Graph Engine] [Governance]  [Identity Intel]
               \            │             /
                ▼           ▼            ▼
             [Enterprise Operating System (EOS)]
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
 [Autonomous Response]            [Enterprise Command Center]
            │                               │
            ▼                               ▼
 [Remediation Playbooks]          [AI Reasoning Studio]
```

---

## 3. Key Responsibilities
* **Real-Time Data Ingestion**: Continuously fuse structured security telemetry from Suricata, Falco, and cloud APIs.
* **Dynamic Dependency Mapping**: Track relations between servers, databases, third-party APIs, and human owners.
* **Automated Risk Scoring**: Continually verify governance, compliance, and zero-trust policies to calculate a global health score.
* **Autonomous Remediation**: Run playbook isolation routines to quarantine compromised entities.

---

## 4. Data Flow
1. **Telemetry Ingest**: Intrusions are published onto the event bus with critical flags.
2. **Graph Accumulation**: The Graph Intelligence Engine updates node statuses (`warning`, `infected`, `critical`).
3. **Enterprise Evaluation**: The Enterprise OS evaluates financial risk per hour and cascading dependencies.
4. **Remediation & Defense**: Autonomous playbooks trigger. If isolated, the network edges are severed.
5. **Observability**: Real-time updates stream directly to the Enterprise Command Center and the Digital Twin dashboard.

---

## 5. Dependencies
* **Core Systems**: Node.js runtime, Event-Driven Memory Bus, Redis Streams.
* **Heuristics & AI**: Gemini API (Flash/Pro) for log summary, reasoning chains, and strategic recommendations.
* **Interfaces**: React 18, Vite, Tailwind CSS, Recharts, Framer Motion.

---

## 6. Operational Role
Acts as the central cockpit and resilient coordinator for the entire enterprise security operations. It bridges low-fidelity infrastructure signals into high-fidelity business risk visualizations, allowing both operators and C-suite executives to understand threat impact instantly.
