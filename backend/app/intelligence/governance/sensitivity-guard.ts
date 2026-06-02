import { GraphNodeState } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';

export interface SensitiveLayerStatus {
  layerKey: string;
  hasInfiltrationRisk: boolean;
  abnormalBehaviorScoreAvg: number;
  unauthorizedCrossingsFound: boolean;
  integrityIndex: number;
}

export class SensitivityGuard {
  public auditSensitivityZones(nodes: GraphNodeState[]): SensitiveLayerStatus[] {
    logger.debug('[SensitivityGuard] Computing sensitivity zone overlays and identity risk profiles...');

    const layers: Record<string, { totalBehavior: number; count: number; infected: boolean; containsSensitive: boolean }> = {};

    nodes.forEach(node => {
      const classification = node.securityClassification || 'public';
      if (!layers[classification]) {
        layers[classification] = { totalBehavior: 0, count: 0, infected: false, containsSensitive: false };
      }

      layers[classification].totalBehavior += node.abnormalBehaviorScore || 0;
      layers[classification].count++;
      if (node.status === 'infected' || node.status === 'critical') {
        layers[classification].infected = true;
      }
      if (node.containsSensitiveAssets) {
        layers[classification].containsSensitive = true;
      }
    });

    const statusList: SensitiveLayerStatus[] = [];

    Object.entries(layers).forEach(([classKey, details]) => {
      const avgBehavior = details.count > 0 ? Math.round(details.totalBehavior / details.count) : 0;
      
      // Calculate zone integrity index
      let integrity = 100 - avgBehavior;
      if (details.infected) integrity -= 40;
      integrity = Math.max(0, integrity);

      statusList.push({
        layerKey: classKey,
        hasInfiltrationRisk: details.infected,
        abnormalBehaviorScoreAvg: avgBehavior,
        unauthorizedCrossingsFound: details.infected && details.containsSensitive,
        integrityIndex: integrity
      });
    });

    return statusList;
  }
}

export const sensitivityGuard = new SensitivityGuard();
