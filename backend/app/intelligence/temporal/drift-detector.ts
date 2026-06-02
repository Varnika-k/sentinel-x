import { TwinSnapshot } from '../../digital-twin/types';
import { infrastructureModel } from '../../digital-twin/infrastructure-model';
import { governanceModel } from '../../digital-twin/governance-model';

export interface DriftReport {
  timestamp: string;
  baselineName: string;
  operationalDriftPercentage: number;  // Change in CPU / latency
  governanceDriftPercentage: number;   // Gain/Loss of compliance
  trustDriftPercentage: number;        // Reduction in system trust
  isRiskThresholdExceeded: boolean;
  driftIndicators: string[];
}

export class DriftDetector {
  private static instance: DriftDetector;

  private constructor() {}

  public static getInstance(): DriftDetector {
    if (!DriftDetector.instance) {
      DriftDetector.instance = new DriftDetector();
    }
    return DriftDetector.instance;
  }

  /**
   * Compares the current live state against a historical checkpoint snapshot to gauge percentage displacement (drift)
   */
  public calculateDrift(baseline: TwinSnapshot): DriftReport {
    const currentNodes = infrastructureModel.getNodes();
    
    let baselineSumCpu = 0;
    let currentSumCpu = 0;
    let baselineSumTrust = 0;
    let currentSumTrust = 0;
    let count = 0;

    currentNodes.forEach((node, name) => {
      const baseNode = baseline.nodes[name];
      if (baseNode) {
        count++;
        baselineSumCpu += baseNode.cpuLoad;
        currentSumCpu += node.cpuLoad;
        baselineSumTrust += baseNode.trustScore;
        currentSumTrust += node.trustScore;
      }
    });

    const baseAvgCpu = count > 0 ? baselineSumCpu / count : 20;
    const currAvgCpu = count > 0 ? currentSumCpu / count : 20;
    const baseAvgTrust = count > 0 ? baselineSumTrust / count : 95;
    const currAvgTrust = count > 0 ? currentSumTrust / count : 95;

    // 1. Calculate operational drift
    const cpuDiff = Math.abs(currAvgCpu - baseAvgCpu);
    const operationalDriftPercentage = Math.round(Math.min(100, (cpuDiff / Math.max(1, baseAvgCpu)) * 100));

    // 2. Calculate trust drift
    const trustDiff = baseAvgTrust - currAvgTrust;
    const trustDriftPercentage = Math.round(Math.min(100, Math.max(0, (trustDiff / baseAvgTrust) * 100)));

    // 3. Calculate governance drift
    const currentGov = governanceModel.auditCompliance(currentNodes);
    const govDiff = baseline.governanceComplianceScore - currentGov.complianceScore;
    const governanceDriftPercentage = Math.round(Math.min(100, Math.max(0, (govDiff / Math.max(1, baseline.governanceComplianceScore)) * 100)));

    const driftIndicators: string[] = [];
    if (operationalDriftPercentage > 25) driftIndicators.push("RESOURCE_VOLATILITY_OOT_COHORTS");
    if (trustDriftPercentage > 15) driftIndicators.push("IDENTITY_BOUNDARIES_DECAY");
    if (governanceDriftPercentage > 10) driftIndicators.push("GOVERNANCE_COMPLIANCE_COLLAPSE");

    const isRiskThresholdExceeded = (operationalDriftPercentage + trustDriftPercentage + governanceDriftPercentage) > 40;

    return {
      timestamp: new Date().toISOString(),
      baselineName: baseline.label,
      operationalDriftPercentage,
      governanceDriftPercentage,
      trustDriftPercentage,
      isRiskThresholdExceeded,
      driftIndicators
    };
  }
}

export const driftDetector = DriftDetector.getInstance();
