# SentinelX Operational Troubleshooting Guide

This guide details diagnostics procedures and quick recoveries for common administrative warnings inside the SentinelX hub.

---

## 1. Diagnostics Workflow
If network monitoring widgets appear frozen or show offline markers:
1. **Launch Diagnostics**: On the bottom console, click **Launch Diagnostics** (or press ESC to check node panel statuses).
2. **Review Core Event Loop**: Ensure that the local telemetry daemon is actively broadcasting heartbeat streams.
3. **Verify Dev Server**: Ensure port `3000` is clear and not blocked by local system processes.

---

## 2. Resolving Firebase & Firestore Errors
* **Symptom**: Console throws "Missing or insufficient permissions" or failed connection alerts during simulation saves.
* **Analysis**: Indicates local firestore rule credentials are out of sync or db settings have timed out.
* **Resolution**:
  1. Navigate to the project root directory.
  2. Re-apply the basic blueprint rule configuration setup.
  3. Verify permission tiers under your chosen Operator Role.

---

## 3. Quarantined System Recovery (Stuck in Isolation)
* **Symptom**: Server node icon remains Blue (Isolated) and cannot be modified.
* **Resolution**:
  1. Click the Blue server node on the Operations Map.
  2. Under Node Controls, click **RESTORE NETWORK EDGE**.
  3. This will re-attach the inter-node paths, returning the server to nominal Green status.
