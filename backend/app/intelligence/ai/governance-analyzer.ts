import { GraphNodeState, GraphEdgeState, graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';
import { temporalMemoryEngine } from './memory-engine';

export interface GovernanceRiskReport {
  overallComplianceScore: number;
  violatedRulesCount: number;
  severeRiskNodesList: string[];
  zonesInstability: Record<string, number>;
  trustBoundaryLeaking: boolean;
  incidentExplanations: string[];
}

export class GovernanceAnalyzer {
  public evaluateGovernanceRisk(nodes: GraphNodeState[], edges: GraphEdgeState[]): GovernanceRiskReport {
    logger.debug('[GovernanceAnalyzer] Analyzing enterprise trust boundaries and compliance states...');

    let violatedRulesCount = 0;
    const severeRiskNodesList: string[] = [];
    let trustBoundaryLeaking = false;
    const incidentExplanations: string[] = [];
    const zonesInstability: Record<string, number> = {
      'production': 0,
      'db-tier': 0,
      'security': 0,
      'hq': 0,
      'aws-global': 0
    };

    // Calculate dynamic security classifications and highlight violations
    nodes.forEach(node => {
      // Rule 1: A non-healthy node located in storage/db-tier namespace violates strict data backup policy
      if ((node.namespace === 'db-tier' || node.namespace === 'storage') && node.status !== 'healthy' && node.status !== 'isolated') {
        violatedRulesCount++;
        severeRiskNodesList.push(node.name);
        incidentExplanations.push(`CRITICAL DATA PROTECTION BREACH: Storage node [${node.name}] is currently flagged [${node.status}] (Potential data lock risk).`);
        zonesInstability['db-tier'] += 35;
      }

      // Rule 2: Non-compliant AD connectors or root accounts under attack
      if ((node.name === 'azure-vm-ad-connector' || node.name === 'iam-root-account') && node.status === 'infected') {
        violatedRulesCount++;
        severeRiskNodesList.push(node.name);
        trustBoundaryLeaking = true;
        incidentExplanations.push(`DOMINANT AUTH LEAK: Core authority endpoint [${node.name}] is heavily compromised! (Primary Directory Domain Lockdown initiated).`);
        zonesInstability['security'] += 50;
      }

      // Rule 3: Cross domain compliance degradation
      if (node.complianceStatus === 'non-compliant' || node.trustScore < 40) {
        zonesInstability[node.environment || 'production'] = (zonesInstability[node.environment || 'production'] || 0) + 20;
      }
    });

    // Evaluate edge boundaries to see if insecure ingress allows direct traffic to DB tier
    const hasDirectUnholyBridge = edges.some(edge => {
      if (edge.status !== 'severed' && edge.riskWeight > 0.6) {
        const srcNode = nodes.find(n => n.name === edge.source);
        const tgtNode = nodes.find(n => n.name === edge.target);
        if (srcNode && tgtNode) {
          // If ingress-nginx or a workspace connects straight to credentials or db layers bypassing auth
          if (srcNode.namespace === 'production' && tgtNode.namespace === 'db-tier' && srcNode.status === 'infected') {
            return true;
          }
        }
      }
      return false;
    });

    if (hasDirectUnholyBridge) {
      violatedRulesCount++;
      trustBoundaryLeaking = true;
      incidentExplanations.push(`TRUST ZONE COLLAPSE: An compromised operational boundary has established an insecure direct access bypass to Db backend tier.`);
    }

    // Dynamic trust-compliance score baseline representation
    const nonCompliantNodes = nodes.filter(n => n.complianceStatus === 'non-compliant').length;
    const warnNodes = nodes.filter(n => n.complianceStatus === 'warning').length;
    const totalCount = nodes.length || 1;
    const overallComplianceScore = Math.max(0, Math.round(100 - (nonCompliantNodes * 25 + warnNodes * 8) * (13 / totalCount)));

    return {
      overallComplianceScore,
      violatedRulesCount,
      severeRiskNodesList,
      zonesInstability,
      trustBoundaryLeaking,
      incidentExplanations
    };
  }
}

export const governanceAnalyzer = new GovernanceAnalyzer();
