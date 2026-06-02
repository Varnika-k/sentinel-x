import { GraphNodeState, GraphEdgeState, graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';

export interface TrustBorderBreach {
  breachId: string;
  sourceNode: string;
  targetNode: string;
  relationshipType: string;
  leakedRiskWeight: number;
  unauthorizedBypass: boolean;
  enforcementActionSimulated: string;
}

export class TrustEnforcer {
  public enforceZeroTrustBoundaries(nodes: GraphNodeState[], edges: GraphEdgeState[]): TrustBorderBreach[] {
    logger.debug('[TrustEnforcer] Evaluating network topologies for zero-trust boundary compliance...');

    const breaches: TrustBorderBreach[] = [];

    edges.forEach(edge => {
      // If we see an active communication path where one endpoint is infected and the other is high/confidential sensitivity
      if (edge.status !== 'severed') {
        const srcNode = nodes.find(n => n.name === edge.source);
        const tgtNode = nodes.find(n => n.name === edge.target);

        if (srcNode && tgtNode) {
          const isSrcInfected = srcNode.status === 'infected';
          const isTgtInfected = tgtNode.status === 'infected';

          const containsSensitive = srcNode.containsSensitiveAssets || tgtNode.containsSensitiveAssets || 
                                     srcNode.securityClassification === 'restricted' || tgtNode.securityClassification === 'restricted';

          // Critical zero trust failure: High sensitivity asset direct route with infected node
          if ((isSrcInfected || isTgtInfected) && containsSensitive) {
            breachedRouteHandler(srcNode, tgtNode, edge);
          }
        }
      }
    });

    function breachedRouteHandler(src: GraphNodeState, tgt: GraphNodeState, edge: GraphEdgeState) {
      breaches.push({
        breachId: `BRC-${edge.id.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        sourceNode: src.name,
        targetNode: tgt.name,
        relationshipType: edge.type,
        leakedRiskWeight: edge.riskWeight,
        unauthorizedBypass: edge.riskWeight > 0.4,
        enforcementActionSimulated: `STAGED INTERACTION SHIELD: Virtually severed route path [${edge.id}] communicating between ${src.name} & ${tgt.name} to avoid lateral threat leakage.`
      });
    }

    return breaches;
  }
}

export const trustEnforcer = new TrustEnforcer();
