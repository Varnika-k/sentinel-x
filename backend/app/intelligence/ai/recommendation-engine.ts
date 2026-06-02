import { GraphNodeState } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';

export interface AutonomousActionPlan {
  actionId: string;
  mitigationType: 'isolate' | 'rotate_credentials' | 'block_traffic' | 'escalate';
  recommendationText: string;
  rationale: string;
  complianceImpact: string;
  sideEffects: string;
  successProbability: number;
}

export class RecommendationEngine {
  public formulateAutonomousRemediation(node: GraphNodeState, blastRadiusScore: number): AutonomousActionPlan[] {
    logger.debug(`[RecommendationEngine] Generating adaptive mitigations and stagers for asset node: ${node.name}`);

    const list: AutonomousActionPlan[] = [];

    // Isolate containment action (extremely high precedence for severe/infected nodes)
    if (node.status === 'infected' || blastRadiusScore > 50) {
      list.push({
        actionId: `ACT-ISO-${node.name.toUpperCase()}`,
        mitigationType: 'isolate',
        recommendationText: `Simulate active container quarantine & router isolation for asset [${node.name}]`,
        rationale: `Prevents ongoing lateral expansion across the production subnet and intercepts malware callbacks.`,
        complianceImpact: `Instantly returns compliance status to WARNING instead of NON-COMPLIANT by cutting the threat path.`,
        sideEffects: `Produces minor, self-contained availability downtime for the workloads running on this pod.`,
        successProbability: 95
      });
    }

    // Credentials revocation action (crucial for credential-handling components)
    if (node.containsSecrets || node.name.includes('auth') || node.name.includes('ad') || node.name.includes('root') || node.name.includes('vault')) {
      list.push({
        actionId: `ACT-ROT-${node.name.toUpperCase()}`,
        mitigationType: 'rotate_credentials',
        recommendationText: `Deploy automatic certificate and token rotations for service identities mapped on [${node.name}]`,
        rationale: `Terminates hijacked sessions instantly and renders any stolen API keys unusable.`,
        complianceImpact: `Restores compliance confidence rating and establishes secure communication bounds.`,
        sideEffects: `Causes brief, sub-second authentication retry cycles for dependent background microservices.`,
        successProbability: 88
      });
    }

    // Firewall prune flow
    list.push({
      actionId: `ACT-FW-${node.name.toUpperCase()}`,
      mitigationType: 'block_traffic',
      recommendationText: `Implement temporary security-group boundaries to prune egress traffic on asset [${node.name}]`,
      rationale: `Sever active unauthorized TCP egress pipes connecting to foreign public web addresses.`,
      complianceImpact: `Mitigates exfiltration volume probability through designated gateways.`,
      sideEffects: `Restriced external API calls until custom firewall policies are verified.`,
      successProbability: 80
    });

    return list;
  }
}

export const recommendationEngine = new RecommendationEngine();
