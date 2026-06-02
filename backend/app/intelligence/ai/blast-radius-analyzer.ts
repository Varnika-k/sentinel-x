import { GraphNodeState, GraphEdgeState, graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';

export interface BlastRadiusReport {
  score: number;
  affectedNodes: string[];
  criticalSystemsRisk: Array<{ name: string; criticality: number; role: string }>;
  exposurePercentage: number;
  atRiskCount: number;
  cascadingComplexity: 'low' | 'medium' | 'high' | 'severe';
  instabilityIndex: number;
}

export class BlastRadiusAnalyzer {
  public analyzeBlastCascade(nodeName: string): BlastRadiusReport {
    logger.debug(`[BlastRadiusAnalyzer] Analyzing cascading blast effects for: ${nodeName}`);

    // Compute basic blast details from the existing graph-intelligence engine
    const basicBlast = graphIntelligenceEngine.computeBlastRadius(nodeName);
    const nodes = Array.from(graphIntelligenceEngine.nodes.values());
    const targetNode = graphIntelligenceEngine.nodes.get(nodeName);

    const affectedNodes: string[] = basicBlast.affectedNodes || [];
    const criticalSystemsRisk = basicBlast.criticalSystemsRisk || [];
    
    // Calculate exposure percentage on adjacent assets
    const atRiskCount = affectedNodes.length;
    const totalCount = nodes.length || 1;
    const exposurePercentage = Math.round((atRiskCount / totalCount) * 100);

    let cascadingComplexity: 'low' | 'medium' | 'high' | 'severe' = 'low';
    if (exposurePercentage > 60) cascadingComplexity = 'severe';
    else if (exposurePercentage > 35) cascadingComplexity = 'high';
    else if (exposurePercentage > 15) cascadingComplexity = 'medium';

    // Calculate structural instability index
    let nodeCriticalityMultiplier = 1;
    if (targetNode) {
      nodeCriticalityMultiplier = targetNode.operationalCriticality >= 80 ? 1.5 : 1.0;
    }
    const instabilityIndex = Math.min(100, Math.round(basicBlast.score * nodeCriticalityMultiplier));

    return {
      score: basicBlast.score,
      affectedNodes,
      criticalSystemsRisk,
      exposurePercentage,
      atRiskCount,
      cascadingComplexity,
      instabilityIndex
    };
  }
}

export const blastRadiusAnalyzer = new BlastRadiusAnalyzer();
