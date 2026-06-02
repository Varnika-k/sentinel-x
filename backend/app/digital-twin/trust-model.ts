import { TwinNode } from './types';
import { infrastructureModel } from './infrastructure-model';

export class TrustModel {
  private static instance: TrustModel;

  private constructor() {}

  public static getInstance(): TrustModel {
    if (!TrustModel.instance) {
      TrustModel.instance = new TrustModel();
    }
    return TrustModel.instance;
  }

  /**
   * Recalculates the dynamic Trust Score for a node based on active indicators:
   * identity risk, abnormal behavior, compromise probability, status logs
   */
  public recalculateNodeTrust(node: TwinNode): number {
    let trust = 100;

    // Direct status penalties
    if (node.status === 'infected') {
      trust -= 60;
    } else if (node.status === 'critical') {
      trust -= 35;
    } else if (node.status === 'warning') {
      trust -= 15;
    } else if (node.status === 'isolated') {
      trust -= 10; // isolation is quarantine; preserves some internal integrity but trust is locked
    }

    // Indicator penalties
    trust -= (node.abnormalBehaviorScore || 0) * 0.4;
    trust -= (node.identityRisk || 0) * 0.3;
    trust -= (node.governanceRisk || 0) * 0.2;

    // Safety clamps
    return Math.round(Math.max(0, Math.min(100, trust)));
  }

  /**
   * Evaluates propagation effects on adjacent node trust values
   */
  public propagateTrustDegradation(nodes: Map<string, TwinNode>, infectedNodeName: string) {
    const primaryNode = nodes.get(infectedNodeName);
    if (!primaryNode) return;

    // Reduce adjacent nodes trust partially representing lateral trust boundary decay
    primaryNode.relationships.forEach(adjName => {
      const adjNode = nodes.get(adjName);
      if (adjNode && adjNode.status !== 'infected' && adjNode.status !== 'isolated') {
        const structuralRiskWeight = 0.25 * (primaryNode.propagationMultiplier || 1.0);
        const trustReduction = Math.round(20 * structuralRiskWeight);
        
        const newTrust = Math.max(10, adjNode.trustScore - trustReduction);
        const newCompromiseProb = Math.min(0.95, adjNode.compromiseProbability + (trustReduction / 100));

        adjNode.trustScore = newTrust;
        adjNode.compromiseProbability = newCompromiseProb;
        
        if (newTrust < 40 && adjNode.status === 'healthy') {
          adjNode.status = 'warning';
        }
      }
    });
  }

  /**
   * Generates a 60-minute prediction timeline projecting average trust degradation
   */
  public forecastTrustTimeline(
    nodes: Map<string, TwinNode>, 
    sourceOfInfection: string | null
  ): { timeOffsetMinutes: number; averageTrust: number }[] {
    const timeline: { timeOffsetMinutes: number; averageTrust: number }[] = [];
    const simulatedNodes = new Map<string, TwinNode>();

    // Copy original states
    nodes.forEach((node, key) => {
      simulatedNodes.set(key, { ...node });
    });

    // Baseline calculation at T=0
    timeline.push({ timeOffsetMinutes: 0, averageTrust: this.getAverageTrust(simulatedNodes) });

    // Step intervals: 10, 20, 30, 40, 50, 60 minutes
    const steps = [10, 20, 30, 40, 50, 60];
    
    steps.forEach((minute, index) => {
      if (sourceOfInfection) {
        // Mock a step-wise growth of risk propagation
        simulatedNodes.forEach((node, key) => {
          if (node.status === 'infected' || key === sourceOfInfection) {
            node.trustScore = Math.max(5, node.trustScore - 15);
            // Decay neighbors further with each step index
            node.relationships.forEach(name => {
              const neighbor = simulatedNodes.get(name);
              if (neighbor && neighbor.status !== 'infected') {
                neighbor.trustScore = Math.max(15, neighbor.trustScore - (3 * (index + 1)));
                neighbor.compromiseProbability = Math.min(0.99, neighbor.compromiseProbability + 0.08);
              }
            });
          }
        });
      }

      timeline.push({
        timeOffsetMinutes: minute,
        averageTrust: this.getAverageTrust(simulatedNodes)
      });
    });

    return timeline;
  }

  private getAverageTrust(nodes: Map<string, TwinNode>): number {
    let sum = 0;
    nodes.forEach(node => {
      sum += node.trustScore;
    });
    return nodes.size > 0 ? Math.round(sum / nodes.size) : 100;
  }
}

export const trustModel = TrustModel.getInstance();
