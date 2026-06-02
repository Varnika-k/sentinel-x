import { logger } from '../core/logger';
import { GraphNodeState, GraphEdgeState, graphIntelligenceEngine } from './graph-intelligence';

export interface TemporalGraphSnapshot {
  timestamp: string;
  nodesSnapshot: GraphNodeState[];
  edgesSnapshot: GraphEdgeState[];
}

export class GraphIntelligenceMesh {
  private static instance: GraphIntelligenceMesh;
  private snapshots: TemporalGraphSnapshot[] = [];

  private constructor() {}

  public static getInstance(): GraphIntelligenceMesh {
    if (!GraphIntelligenceMesh.instance) {
      GraphIntelligenceMesh.instance = new GraphIntelligenceMesh();
    }
    return GraphIntelligenceMesh.instance;
  }

  /**
   * Captures the current graph states recursively to preserve historic audit trials (Temporal Graph Reconstruction)
   */
  public captureSnapshot(): string {
    const ts = new Date().toISOString();
    const nodes = Array.from(graphIntelligenceEngine.nodes.values()).map(n => ({ ...n }));
    const edges = graphIntelligenceEngine.edges.map(e => ({ ...e }));
    
    this.snapshots.push({ timestamp: ts, nodesSnapshot: nodes, edgesSnapshot: edges });
    if (this.snapshots.length > 100) this.snapshots.shift(); // Keep last 100 snapshots
    
    logger.debug(`[GraphMesh] Saved temporal graph snapshot at index ${ts}. Active snap pool: ${this.snapshots.length}`);
    return ts;
  }

  /**
   * Restores a precise point-in-time operational state from past snapshots
   */
  public reconstructTemporalGraph(timestamp: string): boolean {
    const snap = this.snapshots.find(s => s.timestamp === timestamp);
    if (!snap) return false;

    graphIntelligenceEngine.nodes.clear();
    snap.nodesSnapshot.forEach(node => {
      graphIntelligenceEngine.nodes.set(node.name, { ...node });
    });
    graphIntelligenceEngine.edges = snap.edgesSnapshot.map(e => ({ ...e }));
    
    logger.info(`[GraphMesh] Successfully reconstructed topological state to point-in-time: ${timestamp}`);
    return true;
  }

  public getSnapshotsList(): string[] {
    return this.snapshots.map(s => s.timestamp);
  }

  /**
   * Group and partition nodes dynamically based on zones and compliance levels
   */
  public dynamicPartitioning(): Record<string, GraphNodeState[]> {
    const partitions: Record<string, GraphNodeState[]> = {};
    const nodes = Array.from(graphIntelligenceEngine.nodes.values());

    nodes.forEach(node => {
      const zone = node.environment || 'default-zone';
      if (!partitions[zone]) {
        partitions[zone] = [];
      }
      partitions[zone].push(node);
    });

    return partitions;
  }

  /**
   * Perform large-scale semantic node clustering to manage massive networks gracefully
   */
  public computeLargeScaleClustering(): Array<{ clusterId: string; parentNode: string; itemsCount: number; averageTrust: number }> {
    const clusterMap: Record<string, GraphNodeState[]> = {};
    const nodes = Array.from(graphIntelligenceEngine.nodes.values());

    nodes.forEach(node => {
      const category = node.namespace || 'external';
      if (!clusterMap[category]) {
        clusterMap[category] = [];
      }
      clusterMap[category].push(node);
    });

    return Object.entries(clusterMap).map(([cat, nodeItems]) => {
      const totalTrust = nodeItems.reduce((sum, n) => sum + (n.trustScore || 100), 0);
      return {
        clusterId: `cluster-${cat}`,
        parentNode: nodeItems[0]?.name || 'unknown-anchor',
        itemsCount: nodeItems.length,
        averageTrust: Math.round(totalTrust / (nodeItems.length || 1))
      };
    });
  }

  /**
   * Find high-compromise path routes traversing adjacent vulnerability vectors using Dijkstra/risk paths
   */
  public computeIntelligentEdgeRouting(startNodeName: string, endNodeName: string): string[] {
    const nodes = Array.from(graphIntelligenceEngine.nodes.keys());
    const edges = graphIntelligenceEngine.edges;

    const distances: Record<string, number> = {};
    const previous: Record<string, string | null> = {};
    const queue = new Set<string>();

    nodes.forEach(node => {
      distances[node] = Infinity;
      previous[node] = null;
      queue.add(node);
    });

    distances[startNodeName] = 0;

    while (queue.size > 0) {
      // Find smallest distance in queue
      let u: string | null = null;
      for (const item of queue) {
        if (u === null || distances[item] < distances[u]) {
          u = item;
        }
      }

      if (u === null || distances[u] === Infinity || u === endNodeName) {
        break;
      }

      queue.delete(u);

      const adjacentEdges = edges.filter(e => e.source === u && e.status !== 'severed');
      for (const edge of adjacentEdges) {
        const alt = distances[u] + (1 - edge.riskWeight); // Prefer stronger risk-weight pathways
        const v = edge.target;
        if (distances[v] !== undefined && alt < distances[v]) {
          distances[v] = alt;
          previous[v] = u;
        }
      }
    }

    const path: string[] = [];
    let current: string | null = endNodeName;
    while (current !== null) {
      path.unshift(current);
      current = previous[current];
    }

    return path[0] === startNodeName ? path : [];
  }

  /**
   * Dynamically adjust propagation scaling coefficients leveraging zone isolation metrics
   */
  public evaluateAdaptivePropagationScale(nodeName: string): number {
    const node = graphIntelligenceEngine.nodes.get(nodeName);
    if (!node) return 1.0;

    let baseScale = node.propagationMultiplier || 1.0;
    
    // Scale up based on critical identity roles or compliance gaps
    if (node.securityClassification === 'restricted' || node.containsSensitiveAssets) {
      baseScale *= 1.35;
    }
    if (node.complianceStatus === 'non-compliant') {
      baseScale *= 1.5;
    }
    if (node.status === 'infected') {
      baseScale *= 1.25;
    }

    return Math.min(3.5, Number(baseScale.toFixed(2)));
  }
}

export const graphIntelligenceMesh = GraphIntelligenceMesh.getInstance();
