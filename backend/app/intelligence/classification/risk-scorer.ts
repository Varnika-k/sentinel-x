import { ClassificationResult, SensitivityLevel, ComplianceStatus } from './types';
import { RuntimeNodeState, RuntimeEdgeState } from '../../../core/types';

export class GovernanceRiskScorer {
  /**
   * Evaluates the absolute trust level (0 - 100) of an individual system based on its security posture
   * and discovered data assets.
   */
  public static calculateNodeTrust(
    status: string,
    governanceRisk: number,
    complianceStatus: ComplianceStatus
  ): number {
    let trust = 100;

    // Direct compromise drastically ruins trust
    if (status === 'compromised' || status === 'infected') {
      trust -= 80;
    } else if (status === 'degraded' || status === 'warning') {
      trust -= 35;
    } else if (status === 'isolated' || status === 'quarantined') {
      trust -= 10; // isolation secures threat but limits operational trust
    }

    // Penalize based on raw governance density (high-value data requires higher defenses; if uncontrolled, trust drops)
    trust -= (governanceRisk * 0.4);

    // Compliance state penalty
    if (complianceStatus === 'non-compliant') {
      trust -= 20;
    } else if (complianceStatus === 'warning') {
      trust -= 10;
    }

    return Math.max(0, Math.round(trust));
  }

  /**
   * Recalculates dynamically the exposure rating of a node taking into account its neighbors and active trust paths.
   * Compromised sensitive nodes amplify this rate recursively.
   */
  public static calculateExposure(
    currentNode: RuntimeNodeState,
    allNodes: RuntimeNodeState[],
    allEdges: RuntimeEdgeState[]
  ): number {
    let baseExposure = currentNode.exposureScore || 10;
    
    // Scale baseline by sensitivity class
    const sensitivity = (currentNode as any).sensitivityLevel || 'low';
    if (sensitivity === 'critical') baseExposure += 25;
    if (sensitivity === 'high') baseExposure += 15;
    if (sensitivity === 'medium') baseExposure += 5;

    // Check surrounding topology: are we connected to high-risk or compromised nodes?
    const connectedEdges = allEdges.filter(
      e => (e.source === currentNode.id || e.target === currentNode.id) && e.status !== 'severed'
    );

    let neighborRiskMultiplier = 1.0;
    let adjacentCompromisedCount = 0;

    for (const edge of connectedEdges) {
      const neighborId = edge.source === currentNode.id ? edge.target : edge.source;
      const neighbor = allNodes.find(n => n.id === neighborId);
      
      if (neighbor) {
        // Compromised neighbors severely bleed exposure
        if (neighbor.status === 'compromised' || neighbor.status === 'infected') {
          adjacentCompromisedCount++;
          // High-sensitivity compromised neighbors amplify risks double time
          const neighborSensitivity = (neighbor as any).sensitivityLevel || 'low';
          const multiplierDelta = neighborSensitivity === 'critical' ? 0.6 : neighborSensitivity === 'high' ? 0.4 : 0.25;
          neighborRiskMultiplier += multiplierDelta * (edge.riskWeight || 0.5);
        } else if (neighbor.riskScore > 50) {
          neighborRiskMultiplier += 0.1;
        }
      }
    }

    baseExposure = baseExposure * neighborRiskMultiplier + (adjacentCompromisedCount * 12);
    return Math.min(100, Math.round(baseExposure));
  }

  /**
   * Recalculates a node risk profile factoring in static governance patterns + runtime operational events.
   */
  public static computeCumulativeGovernanceRisk(
    baseGovernanceRisk: number,
    status: string,
    abnormalAccessScore: number
  ): number {
    let temp = baseGovernanceRisk;

    if (status === 'compromised' || status === 'infected') {
      temp = Math.max(temp, 90);
    } else if (status === 'degraded' || status === 'warning') {
      temp += 15;
    }

    // Abnormal active queries of databases boost our calculated risk indicator
    temp += abnormalAccessScore * 0.5;

    return Math.min(100, Math.round(temp));
  }
}
