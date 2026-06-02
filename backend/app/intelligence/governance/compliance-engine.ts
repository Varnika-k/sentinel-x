import { GraphNodeState } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';
import { policyEngine } from './policy-engine';

export interface ComplianceReadiness {
  frameworkName: string;
  readinessPercentage: number;
  unmetControlsCount: number;
  governanceComplianceViolated: boolean;
  complianceBrief: string;
}

export class ComplianceEngine {
  public evaluateEnterpriseReadiness(nodes: GraphNodeState[]): {
    soc2: ComplianceReadiness;
    hipaa: ComplianceReadiness;
    pciDss: ComplianceReadiness;
    aggregatedGovernanceScore: number;
  } {
    logger.debug('[ComplianceEngine] Performing continuous compliance mapping of digital twin nodes...');

    let authVulnerabilities = 0;
    let dataExposurePoints = 0;
    let identityAbuseEvents = 0;

    nodes.forEach(node => {
      const audit = policyEngine.auditNodePolicies(node);
      if (!audit.compliant) {
        if (audit.brokenPolicies.some(p => p.includes('Auth') || p.includes('Credential'))) {
          authVulnerabilities++;
        }
        if (audit.brokenPolicies.some(p => p.includes('Sensitive') || p.includes('Data'))) {
          dataExposurePoints++;
        }
        if (audit.brokenPolicies.some(p => p.includes('Abnormal'))) {
          identityAbuseEvents++;
        }
      }
    });

    const soc2Readiness = Math.max(20, Math.round(100 - (authVulnerabilities * 30 + identityAbuseEvents * 15)));
    const pciDssReadiness = Math.max(30, Math.round(100 - (dataExposurePoints * 35 + authVulnerabilities * 15)));
    const hipaaReadiness = Math.max(40, Math.round(100 - (dataExposurePoints * 40 + identityAbuseEvents * 10)));

    const aggregatedGovernanceScore = Math.round((soc2Readiness + pciDssReadiness + hipaaReadiness) / 3);

    return {
      soc2: {
        frameworkName: 'SOC2 Trust Services Criteria',
        readinessPercentage: soc2Readiness,
        unmetControlsCount: authVulnerabilities + identityAbuseEvents,
        governanceComplianceViolated: soc2Readiness < 80,
        complianceBrief: 'Evaluates access controls, boundary firewalls, network monitoring, and system behavior.'
      },
      pciDss: {
        frameworkName: 'PCI-DSS v4.0 (Cardholder Data Protection)',
        readinessPercentage: pciDssReadiness,
        unmetControlsCount: dataExposurePoints + authVulnerabilities,
        governanceComplianceViolated: pciDssReadiness < 85,
        complianceBrief: 'Requires encryption levels, data segregation, isolated payment processes, and root key locks.'
      },
      hipaa: {
        frameworkName: 'HIPAA Security Standards (PHI Protection)',
        readinessPercentage: hipaaReadiness,
        unmetControlsCount: dataExposurePoints + identityAbuseEvents,
        governanceComplianceViolated: hipaaReadiness < 80,
        complianceBrief: 'Ensures electronic Protected Health Information remains isolated from public subnets and endpoints.'
      },
      aggregatedGovernanceScore
    };
  }
}

export const complianceEngine = new ComplianceEngine();
