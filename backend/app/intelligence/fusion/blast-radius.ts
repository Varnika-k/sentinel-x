import { digitalTwinEngine } from '../../simulation/twin-engine';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { ExposureChain } from './types';

export class BlastRadiusAnalyzer {
  /**
   * Evaluates exposure chains and returns estimated blast radius and exposure risks for a given node.
   */
  public static analyzeBlastRadius(nodeId: string): ExposureChain {
    const node = digitalTwinEngine.nodes.get(nodeId);
    if (!node) {
      return {
        headNodeId: nodeId,
        path: [],
        criticalAssetsAtRisk: [],
        exposureRiskIndex: 0,
        governanceComplianceViolated: false
      };
    }

    // 1. Fetch potential propagation spread from the core graph intelligence model
    const spread = graphIntelligenceEngine.computeAttackSpread(nodeId) || [];
    
    // Sort reachability path based on highest lateral threat probability
    const sortedSpread = [...spread].sort((a: any, b: any) => b.probability - a.probability);
    const path = sortedSpread.map((s: any) => s.nodeName);

    // 2. Identify vulnerable and critical downstream nodes (operational criticality > 70)
    const criticalAssetsAtRisk: string[] = [];
    let exposureRiskAccumulator = nodeId.startsWith('host-') ? 30 : 15; // external nodes start lower, internal ingress starts higher
    let governanceComplianceViolated = false;

    path.forEach(name => {
      const targetNode = digitalTwinEngine.nodes.get(name);
      if (targetNode) {
        if (targetNode.operationalCriticality >= 70 || targetNode.containsSensitiveAssets) {
          criticalAssetsAtRisk.push(name);
          exposureRiskAccumulator += 20;
        } else {
          exposureRiskAccumulator += 5;
        }

        // Trace governance policy breaches (non-compliant classifications or restricted database entries)
        if (targetNode.containsSensitiveAssets || targetNode.securityClassification === 'restricted' || targetNode.securityClassification === 'confidential') {
          governanceComplianceViolated = true;
          exposureRiskAccumulator += 15;
        }
      }
    });

    // Apply risk reduction if the node is isolated or partitioned
    if (node.status === 'isolated') {
      exposureRiskAccumulator *= 0.15;
    }

    const exposureRiskIndex = Math.max(5, Math.min(100, Math.round(exposureRiskAccumulator)));

    return {
      headNodeId: nodeId,
      path,
      criticalAssetsAtRisk,
      exposureRiskIndex,
      governanceComplianceViolated
    };
  }
}
