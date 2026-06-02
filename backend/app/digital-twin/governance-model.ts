import { TwinNode } from './types';
import { infrastructureModel } from './infrastructure-model';

export interface GovernanceViolation {
  nodeName: string;
  policyId: string;
  ruleTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  vulnerabilityCount: number;
}

export class GovernanceModel {
  private static instance: GovernanceModel;

  private constructor() {}

  public static getInstance(): GovernanceModel {
    if (!GovernanceModel.instance) {
      GovernanceModel.instance = new GovernanceModel();
    }
    return GovernanceModel.instance;
  }

  /**
   * Scans nodes and returns active policy violations based on security posture rules
   */
  public auditCompliance(nodes: Map<string, TwinNode>): {
    violations: GovernanceViolation[];
    complianceScore: number; // 0 to 100
  } {
    const violations: GovernanceViolation[] = [];
    let complianceScoreSum = 0;
    let nodeCount = 0;

    nodes.forEach(node => {
      nodeCount++;
      let nodeScore = 100;

      // Rule 1: No critical asset should be infected or warning
      if (node.containsSensitiveAssets && (node.status === 'infected' || node.status === 'critical')) {
        violations.push({
          nodeName: node.name,
          policyId: "POL-SEC-001",
          ruleTitle: "SENSITIVE_ASSETS_INTEGRITY",
          severity: "critical",
          description: `Assets containing sensitive data is currently in a state of ${node.status.toUpperCase()}. Immediate lockdown recommended.`,
          vulnerabilityCount: node.status === 'infected' ? 3 : 1
        });
        nodeScore -= 50;
      }

      // Rule 2: Unisolated root administrative profiles with active compromise levels
      if (node.securityClassification === 'restricted' && node.compromiseProbability > 0.4 && node.status !== 'isolated') {
        violations.push({
          nodeName: node.name,
          policyId: "POL-SEC-002",
          ruleTitle: "PRIVILEGED_ACCOUNT_BOUNDARIES",
          severity: "high",
          description: `Restricted administrative subject has high compromise probability (${Math.round(node.compromiseProbability * 100)}%) without quarantine.`,
          vulnerabilityCount: 2
        });
        nodeScore -= 30;
      }

      // Rule 3: Abnormal behavior rating limits
      if (node.abnormalBehaviorScore > 60) {
        violations.push({
          nodeName: node.name,
          policyId: "POL-SEC-003",
          ruleTitle: "BEHAVIORAL_COMPLIANCE_THRESHOLD",
          severity: "medium",
          description: `Behavioral anomalies are exceeding core continuous verification boundaries: Score (${Math.round(node.abnormalBehaviorScore)})`,
          vulnerabilityCount: 1
        });
        nodeScore -= 20;
      }

      // Rule 4: Critical Secrets Vault directly coupled without TLS status layers
      if (node.type === 'SECRETS_VAULT' && node.latency > 150) {
        violations.push({
          nodeName: node.name,
          policyId: "POL-SEC-004",
          ruleTitle: "SECRETS_VAULT_DEGRADED_PERFORMANCE",
          severity: "low",
          description: `Vault latency (${node.latency} ms) exceeds compliance threshold of 100ms. Potential timing attacks check.`,
          vulnerabilityCount: 1
        });
        nodeScore -= 10;
      }

      // Sync and clamp node compliance metrics
      const clampedScore = Math.max(0, nodeScore);
      node.governanceRisk = 100 - clampedScore;
      node.complianceStatus = clampedScore > 80 ? 'compliant' : clampedScore > 50 ? 'warning' : 'non-compliant';
      
      complianceScoreSum += clampedScore;
    });

    const averageCompliance = nodeCount > 0 ? Math.round(complianceScoreSum / nodeCount) : 100;

    return {
      violations,
      complianceScore: averageCompliance
    };
  }

  /**
   * Forecasts the extent of governance collapse (loss of compliance) during ongoing lateral attacks
   */
  public forecastGovernanceCollapse(
    nodes: Map<string, TwinNode>,
    expectedInfectionNames: string[]
  ): {
    projectedComplianceScore: number;
    projectedViolationsCount: number;
  } {
    // Clone nodes for a what-if analysis
    const cloneMap = new Map<string, TwinNode>();
    nodes.forEach((node, k) => {
      cloneMap.set(k, { ...node });
    });

    // Mark the hypothetical targets as infected
    expectedInfectionNames.forEach(name => {
      const target = cloneMap.get(name);
      if (target) {
        target.status = 'infected';
        target.abnormalBehaviorScore = 100;
        target.compromiseProbability = 1.0;
      }
    });

    // Audit compliance on the future representation
    const auditResult = this.auditCompliance(cloneMap);

    return {
      projectedComplianceScore: auditResult.complianceScore,
      projectedViolationsCount: auditResult.violations.length
    };
  }
}

export const governanceModel = GovernanceModel.getInstance();
