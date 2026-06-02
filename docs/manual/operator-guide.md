# SentinelX Operator & Simulation Manual

This guide outlines standard operating procedures for modeling cyber attack campaigns and testing active resilience controls inside the SentinelX Battlespace Simulator.

---

## 1. Operating the Simulator
The simulator allows you to model real-world cyber campaigns against custom-segmented nodes:
1. **Launch Battlespace**: From the landing screen, click **LAUNCH BATTLESPACE**.
2. **Access Control Desk**: The left-hand panel holds configuration controls (speed, spread velocity, auto-remediation toggles).
3. **Choose Scenario**: Click **Launch Scenario** (such as *Ransomware Chain* or *Logstash Exploit*).

---

## 2. Monitoring Threat Propagation
Once launched, you will see infection wavefronts moving through the network topology graph:
* **Active Packet Arcs**: White light trails indicate nominal communication.
* **Red Ping Rings**: Indicate an active, successful exploit attempt.
* **Colored Nodes**:
  * `Green`: Cleared, healthy, compliant.
  * `Orange / Yellow`: High-risk or warning states.
  * `Red`: Infected, locked, or compromised.
  * `Blue`: Quarantined / Isolated from the network.

---

## 3. Adjusting Simulation Physics
* **Simulation Speed**: Multipliers of 0.5x, 1x, or 2x to test slow-stealth attacks vs. high-velocity ingress events.
* **Spread Velocity**: Slide up to test devastating zero-day speeds, or down for quiet malware persistence checks.
* **Resetting Grid**: Use the **RESET GRID** button to restore node tables back to perfect health baselines.
