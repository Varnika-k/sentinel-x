import { TwinNode } from './types';
import { infrastructureModel } from './infrastructure-model';

export class OperationalState {
  private static instance: OperationalState;

  private constructor() {}

  public static getInstance(): OperationalState {
    if (!OperationalState.instance) {
      OperationalState.instance = new OperationalState();
    }
    return OperationalState.instance;
  }

  /**
   * Evaluates the operational status metrics for noise, spike injection, or load degradation
   */
  public evaluateMetrics(nodes: Map<string, TwinNode>): {
    overallContinuity: number;
    averageLatency: number;
    anomalyCount: number;
  } {
    let totalContinuityScore = 100;
    let sumLatency = 0;
    let anomalyCount = 0;
    let nodeCount = 0;

    nodes.forEach(node => {
      nodeCount++;
      sumLatency += node.latency;

      // Penalize continuity for critical statuses
      if (node.status === 'infected') {
        totalContinuityScore -= 15;
        anomalyCount++;
      } else if (node.status === 'isolated') {
        totalContinuityScore -= 20; // isolated reduces functional workspace paths
      } else if (node.status === 'critical') {
        totalContinuityScore -= 8;
        anomalyCount++;
      } else if (node.status === 'warning') {
        totalContinuityScore -= 3;
      }

      // Check for performance spikes
      if (node.cpuLoad > 85) {
        anomalyCount++;
      }
      if (node.latency > 150) {
        anomalyCount++;
      }
    });

    const averageLatency = nodeCount > 0 ? sumLatency / nodeCount : 0;
    const overallContinuity = Math.max(10, Math.min(100, totalContinuityScore));

    return {
      overallContinuity,
      averageLatency,
      anomalyCount
    };
  }

  /**
   * Apply chaos spikes to model stress loads
   */
  public simulateStress(nodeName: string, cpuLoadIncrease: number, latencyMultiplier: number) {
    const node = infrastructureModel.getNode(nodeName);
    if (node) {
      const newCpu = Math.min(100, node.cpuLoad + cpuLoadIncrease);
      const newLatency = Math.min(1000, Math.round(node.latency * latencyMultiplier));
      infrastructureModel.updateNode(nodeName, {
        cpuLoad: newCpu,
        latency: newLatency,
        abnormalBehaviorScore: Math.min(100, (node.abnormalBehaviorScore || 0) + 15)
      });
    }
  }

  /**
   * Restores stress loads of a particular node to baseline values
   */
  public restoreBaseline(nodeName: string) {
    const node = infrastructureModel.getNode(nodeName);
    if (node) {
      infrastructureModel.updateNode(nodeName, {
        cpuLoad: Math.floor(Math.random() * 20) + 5,
        latency: Math.floor(Math.random() * 15) + 3,
        abnormalBehaviorScore: Math.max(0, (node.abnormalBehaviorScore || 0) - 25)
      });
    }
  }
}

export const operationalState = OperationalState.getInstance();
