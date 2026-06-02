# SentinelX Operations Map

---

## 1. Purpose
The **Operations Map** is the physical and logical topology visualization layer of the SentinelX platform. It maps server positions, routing configurations, and active connections, providing real-time visual tracking of packet communication, lateral threat movement, and network isolation boundaries.

---

## 2. Architecture & Design
The Operations Map is designed to be fully dynamic, leveraging React, Tailwind CSS, and custom D3-force network graph overlays:
* **Interactive Node Configurations**: Visual coordinates mapped by network zones (Perimeter, Routing, DMZ, Core, Database, Backups).
* **Pulse Triggers & Flow Lines**: Active SVG paths tracking packet streams between nodes.
* **State Radiance**: Red glows signpost compromised servers, amber for warnings, and deep blue for quarantined/isolated cells.

---

## 3. Key Responsibilities
* **Visual Topology Mapping**: Display network topology accurately under various zoom scales.
* **Real-time Packet Flow Monitoring**: Graph structural relationships and dynamic messages.
* **Triage Callouts**: Highlight affected paths to expose collateral reach vectors.
* **Zero-config Resize Scaling**: Leverage containment sizing to prevent visual overflow on adaptive displays.

---

## 4. Data Flow
1. **Network Change Publishes**: The Graph Engine reports structural edge updates.
2. **Operations Map Sync**: The component re-evaluates force alignments and node sizes.
3. **Path Rendering**: Active packet lines are fired to trace communication frequencies.
4. **Action Overlays**: Operator interactions trigger popovers to access microservice administrative states.

---

## 5. Subsystem Dependencies
* **Graph Intelligence Engine**: The underlying truth of all topological properties.
* **D3.js & SVG Render Engines**: High-performance layout math.

---

## 6. Operational Role
Acts as the visual ground-truth map of the threat landscape, allowing incident response engineers to physically trace how a breach propagates from perimeter segments into confidential backend databases.
