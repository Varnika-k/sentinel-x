import { GraphNodeState, graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';

export interface QuarantineWardsStatus {
  nodeId: string;
  isIsolated: boolean;
  activeEgressBlocksCount: number;
  cpuClampPercent: number;
  simulatedTimeRemainingSeconds: number;
}

export class IsolationEngine {
  private activeSimulatedQuarantines: Map<string, QuarantineWardsStatus> = new Map();

  public simulateQuarantine(nodeName: string): QuarantineWardsStatus {
    logger.info(`[IsolationEngine] Simulating network sandboxing sandbox containment for: ${nodeName}`);

    const existing = this.activeSimulatedQuarantines.get(nodeName);
    if (existing) return existing;

    const newQuarantine: QuarantineWardsStatus = {
      nodeId: nodeName,
      isIsolated: true,
      activeEgressBlocksCount: 6,
      cpuClampPercent: 12, // Clamp CPU resource allocation to choke malware processes
      simulatedTimeRemainingSeconds: 3600 // 1 hour test window
    };

    this.activeSimulatedQuarantines.set(nodeName, newQuarantine);
    return newQuarantine;
  }

  public trackSimulatedNodesQuarantined() {
    return Array.from(this.activeSimulatedQuarantines.values());
  }

  public clearAllSimulatedQuarantines() {
    this.activeSimulatedQuarantines.clear();
  }
}

export const isolationEngine = new IsolationEngine();
