import { logger } from '../../core/logger';
import { relationshipEngine, FabricEntity } from './relationship-engine';

export interface BusinessImpactMetrics {
  id: string;
  name: string;
  type: string;
  operationalImpact: number; // 0 to 100
  businessCriticality: number; // 0 to 100
  governanceSensitivity: number; // 0 to 100
  dependencyWeight: number; // number of incoming dependency paths
  failureImpactScore: number; // mathematical fusion
  recoveryComplexity: 'very_low' | 'low' | 'medium' | 'high' | 'ultra_extreme';
}

export class AssetContextEngine {
  /**
   * Compiles dynamic business impact analytics for physical and logic assets
   */
  public evaluateAssetImpact(assetId: string): BusinessImpactMetrics | null {
    const entity = relationshipEngine.getEntity(assetId);
    if (!entity) return null;

    // 1. Dependency Weight: Number of incoming links that depend on us
    const adjs = relationshipEngine.getAdjacencies(assetId);
    const dependentIncoming = adjs.filter(adj => adj.direction === 'incoming' && adj.relation.relationType === 'depends_on');
    const dependencyWeight = dependentIncoming.length;

    // 2. Base metrics depending on entity type
    let operationalImpact = 50;
    let businessCriticality = 50;
    let governanceSensitivity = 50;
    let recoveryComplexity: 'very_low' | 'low' | 'medium' | 'high' | 'ultra_extreme' = 'medium';

    if (entity.type === 'application') {
      const riskLevel = entity.metadata.riskLevel || 'medium';
      operationalImpact = riskLevel === 'critical' ? 95 : riskLevel === 'high' ? 80 : riskLevel === 'medium' ? 50 : 25;
      businessCriticality = entity.metadata.usersCount > 50000 ? 90 : entity.metadata.usersCount > 10000 ? 70 : 40;
      governanceSensitivity = entity.metadata.governanceStatus === 'non-compliant' ? 85 : 45;
      recoveryComplexity = riskLevel === 'critical' ? 'ultra_extreme' : riskLevel === 'high' ? 'high' : 'medium';
    } 
    else if (entity.type === 'database') {
      const sensitivity = entity.metadata.sensitivity || 'confidential';
      operationalImpact = sensitivity === 'restricted' ? 98 : sensitivity === 'confidential' ? 80 : 60;
      businessCriticality = entity.metadata.volumeGb > 10000 ? 85 : 60;
      governanceSensitivity = sensitivity === 'restricted' ? 100 : sensitivity === 'confidential' ? 85 : 55;
      recoveryComplexity = sensitivity === 'restricted' ? 'ultra_extreme' : 'high';
    } 
    else if (entity.type === 'infra_node') {
      const provider = entity.metadata.provider || 'aws';
      operationalImpact = entity.metadata.utilization > 80 ? 85 : 60;
      businessCriticality = 65;
      governanceSensitivity = provider === 'on-premise' ? 80 : 50;
      recoveryComplexity = provider === 'on-premise' ? 'high' : 'low';
    }

    // Mathematical Fusion formula
    let failureImpactScore = Math.round((operationalImpact * 0.4) + (businessCriticality * 0.4) + (governanceSensitivity * 0.1) + (dependencyWeight * 5));
    failureImpactScore = Math.min(100, Math.max(10, failureImpactScore));

    return {
      id: assetId,
      name: entity.name,
      type: entity.type,
      operationalImpact,
      businessCriticality,
      governanceSensitivity,
      dependencyWeight,
      failureImpactScore,
      recoveryComplexity
    };
  }

  /**
   * Calculates overall downstream impact chains (Blast Radius) if a target node is lost
   */
  public calculateBlastRadius(nodeId: string) {
    const startNode = relationshipEngine.getEntity(nodeId);
    if (!startNode) return null;

    const directImpacted: FabricEntity[] = [];
    const indirectImpacted: FabricEntity[] = [];
    const downstreamImpacted: FabricEntity[] = [];
    
    // Graph BFS walk to list cascading damage
    const visited = new Set<string>();
    visited.add(nodeId);
    
    // Direct level
    const adjDirect = relationshipEngine.getAdjacencies(nodeId);
    adjDirect.forEach(adj => {
      const ent = adj.entity!;
      if (!visited.has(ent.id)) {
        visited.add(ent.id);
        directImpacted.push(ent);
      }
    });

    // Indirect level (depth = 2)
    directImpacted.forEach(n => {
      const adjSec = relationshipEngine.getAdjacencies(n.id);
      adjSec.forEach(adj => {
        const ent = adj.entity!;
        if (!visited.has(ent.id)) {
          visited.add(ent.id);
          indirectImpacted.push(ent);
        }
      });
    });

    // Downstream level (depth = 3+)
    indirectImpacted.forEach(n => {
      const adjThird = relationshipEngine.getAdjacencies(n.id);
      adjThird.forEach(adj => {
        const ent = adj.entity!;
        if (!visited.has(ent.id)) {
          visited.add(ent.id);
          downstreamImpacted.push(ent);
        }
      });
    });

    const totalInFabric = relationshipEngine.getEntities().length;
    const compromisedPercent = Number(((visited.size / totalInFabric) * 100).toFixed(1));

    // Dynamic recovery and consequence statements
    let strategicImpactSummary = `The disappearance or failure of ${startNode.name} triggers a localized system disruption. Minimal upstream business services affected.`;
    if (compromisedPercent > 35) {
      strategicImpactSummary = `CRITICAL: Failure of ${startNode.name} triggers cascading system failure across the enterprise, impacting major client portals and treasury ledgers. Executive intervention strongly recommended.`;
    } else if (compromisedPercent > 15) {
      strategicImpactSummary = `WARNING: Failure of ${startNode.name} degrades operation bounds. Downstream system dependencies report latency drift and authentication delays.`;
    }

    return {
      targetNodeName: startNode.name,
      targetNodeType: startNode.type,
      blastScore: compromisedPercent,
      strategicImpactSummary,
      counts: {
        direct: directImpacted.length,
        indirect: indirectImpacted.length,
        downstream: downstreamImpacted.length,
        totalCascading: visited.size - 1
      },
      directImpacted: directImpacted.map(e => ({ id: e.id, name: e.name, type: e.type })),
      indirectImpacted: indirectImpacted.map(e => ({ id: e.id, name: e.name, type: e.type })),
      downstreamImpacted: downstreamImpacted.map(e => ({ id: e.id, name: e.name, type: e.type }))
    };
  }
}

export const assetContextEngine = new AssetContextEngine();
