import { TwinNode } from './types';
import { infrastructureModel } from './infrastructure-model';
import { trustModel } from './trust-model';

export class PropagationSimulator {
  private static instance: PropagationSimulator;

  private constructor() {}

  public static getInstance(): PropagationSimulator {
    if (!PropagationSimulator.instance) {
      PropagationSimulator.instance = new PropagationSimulator();
    }
    return PropagationSimulator.instance;
  }

  /**
   * Advances the simulation state of the twin nodes by one dynamic 'tick'.
   * Gradually spreads status deterioration through relationships based on vulnerability rates
   */
  public propagateStep(nodes: Map<string, TwinNode>, isHistoricalMode: boolean = false): {
    infectedCount: number;
    warningsTriggered: string[];
  } {
    const newlyInfected: string[] = [];
    const warningsTriggered: string[] = [];

    // Analyze nodes and prepare delta shifts
    nodes.forEach((node, name) => {
      if (node.status === 'infected' && !isHistoricalMode) {
        // Evaluate adjacent neighbors for potential intrusion hop propagation
        node.relationships.forEach(adjName => {
          const adjNode = nodes.get(adjName);
          if (adjNode && adjNode.status === 'healthy') {
            const dangerChance = (adjNode.exposureScore / 100) * (node.propagationMultiplier || 1.1);
            if (Math.random() < dangerChance) {
              newlyInfected.push(adjName);
            } else if (Math.random() < Math.max(0.3, dangerChance * 2)) {
              warningsTriggered.push(adjName);
            }
          } else if (adjNode && adjNode.status === 'warning') {
            const dangerChance = (adjNode.exposureScore / 100) * 1.5;
            if (Math.random() < dangerChance) {
              newlyInfected.push(adjName);
            }
          }
        });
      }
    });

    // Commit changes
    newlyInfected.forEach(name => {
      const node = nodes.get(name);
      if (node && node.status !== 'isolated') {
        node.status = 'infected';
        node.cpuLoad = Math.min(100, node.cpuLoad + 35);
        node.latency = Math.min(1000, node.latency * 3.5);
        node.abnormalBehaviorScore = 100;
        node.compromiseProbability = 1.0;
        node.trustScore = Math.max(5, node.trustScore - 50);

        // Degrade neighbors trust immediately through the trust model
        trustModel.propagateTrustDegradation(nodes, name);
      }
    });

    warningsTriggered.forEach(name => {
      const node = nodes.get(name);
      if (node && node.status === 'healthy') {
        node.status = 'warning';
        node.cpuLoad = Math.min(85, node.cpuLoad + 15);
        node.latency = Math.min(250, node.latency * 1.8);
        node.abnormalBehaviorScore = Math.min(100, node.abnormalBehaviorScore + 30);
      }
    });

    // Let's return the infected node count
    let infectedCount = 0;
    nodes.forEach(node => {
      if (node.status === 'infected') {
        infectedCount++;
      }
    });

    return {
      infectedCount,
      warningsTriggered
    };
  }
}

export const propagationSimulator = PropagationSimulator.getInstance();
