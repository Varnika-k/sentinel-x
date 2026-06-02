import { complianceEngine } from '../governance/compliance-engine';
import { trustEnforcer } from '../governance/trust-enforcer';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';

export class GovernanceContextBuilder {
  public static buildGovernanceAIContext(targetNodeName: string): string {
    const nodes = Array.from(graphIntelligenceEngine.nodes.values());
    const edges = graphIntelligenceEngine.edges;

    // Get live compliance stats
    const readiness = complianceEngine.evaluateEnterpriseReadiness(nodes);
    
    // Get Zero Trust breaches
    const breaches = trustEnforcer.enforceZeroTrustBoundaries(nodes, edges);
    const targetBreaches = breaches.filter(b => b.sourceNode === targetNodeName || b.targetNode === targetNodeName);

    let context = `GOVERNANCE & TRUST BOUNDARY AUDIT:\n`;
    context += `- Core Compliance Scores: SOC2: ${readiness.soc2.readinessPercentage}%, PCI-DSS: ${readiness.pciDss.readinessPercentage}%, HIPAA: ${readiness.hipaa.readinessPercentage}%\n`;
    
    if (targetBreaches.length > 0) {
      context += `- ACTIVE TRUST BREACHES MAPPED TO SPECIFIC COGNITIVE RANGE:\n`;
      targetBreaches.forEach(tb => {
        context += `  * [BREACH ALERT] Unauthorized edge connection detected. Transit: ${tb.sourceNode} -> ${tb.targetNode} (Risk Weight: ${tb.leakedRiskWeight}). Action: ${tb.enforcementActionSimulated}\n`;
      });
    } else {
      context += `- Trust boundary status: Secure. No direct zero-trust leaks verified on requested nodes.\n`;
    }

    return context;
  }
}
