import { TwinNode, PredictionResult } from './types';
import { infrastructureModel } from './infrastructure-model';
import { attackSimulator } from './attack-simulator';
import { governanceModel } from './governance-model';
import { trustModel } from './trust-model';
import { identityEngine } from '../intelligence/identity/identity-engine';

export class FutureStateEngine {
  private static instance: FutureStateEngine;

  private constructor() {}

  public static getInstance(): FutureStateEngine {
    if (!FutureStateEngine.instance) {
      FutureStateEngine.instance = new FutureStateEngine();
    }
    return FutureStateEngine.instance;
  }

  /**
   * Compiles confidence-weighted forecasts projecting 5 indicators: exfiltration probability, targets, trust decay, governance breaches, stability
   */
  public generateFutureRiskForecast(activeInfections: string[]): PredictionResult {
    const nodes = infrastructureModel.getNodes();
    
    // 1. Identify the next target cohorts based on highest exposure / proximity to infected nodes
    const targetCohorts: { name: string; score: number }[] = [];
    
    nodes.forEach(node => {
      if (node.status !== 'infected' && node.status !== 'isolated') {
        let isAdjacentToInfected = false;
        node.relationships.forEach(adjName => {
          const adjNode = nodes.get(adjName);
          if (adjNode && adjNode.status === 'infected') {
            isAdjacentToInfected = true;
          }
        });

        if (isAdjacentToInfected) {
          // Weight target probability by exposureScore and proximity multipliers
          const targetWeight = node.exposureScore * (node.propagationMultiplier || 1.1);
          targetCohorts.push({ name: node.name, score: targetWeight });
        }
      }
    });

    // If no adjacent nodes are infected, check high-exposure endpoints generally
    if (targetCohorts.length === 0) {
      nodes.forEach(node => {
        if (node.status === 'healthy' && node.exposureScore > 60) {
          targetCohorts.push({ name: node.name, score: node.exposureScore });
        }
      });
    }

    targetCohorts.sort((a, b) => b.score - a.score);
    const nextTargetCohort = targetCohorts.slice(0, 3).map(tc => tc.name);

    // 2. Probable blast radius growth (%)
    const expectedBlastRadiusGrowth = activeInfections.length > 0 
      ? Math.round(Math.min(100, (activeInfections.length / nodes.size) * 100 + 15))
      : 12;

    // 3. Insider threat active indices mapping from live identity engine
    const insiderThreatActiveIndices: { [user: string]: number } = {};
    try {
      const activeIdentities = identityEngine.listIdentities?.() || [];
      activeIdentities.forEach(u => {
        // Boost insider threat risks slightly under compromised digital twin state to represent panic/chaos
        const threatIndex = Math.round(Math.min(100, (u.insiderThreatConfidence || u.riskScore || 20) * 1.15));
        insiderThreatActiveIndices[u.username] = threatIndex;
      });
    } catch (err) {
      // Fallback
      insiderThreatActiveIndices['user-alice-admin'] = 45;
      insiderThreatActiveIndices['dept-finance-workstation'] = 22;
    }

    // 4. Future governance violations count
    const govResult = governanceModel.auditCompliance(nodes);
    const governanceViolationsExpectedCount = Math.max(
      govResult.violations.length,
      govResult.violations.length + Math.round(activeInfections.length * 1.2)
    );

    // 5. Trust degradation timeline
    const primeInfection = activeInfections.length > 0 ? activeInfections[0] : null;
    const trustDegradationTimeline = trustModel.forecastTrustTimeline(nodes, primeInfection);

    // 6. Exfiltration probability
    let sensitiveAssetExposed = false;
    let criticalVaultCompromised = false;
    
    nodes.forEach(node => {
      if (node.status === 'infected') {
        if (node.containsSensitiveAssets) sensitiveAssetExposed = true;
        if (node.type === 'SECRETS_VAULT') criticalVaultCompromised = true;
      }
    });

    let exfiltrationProbability = 0.05;
    if (sensitiveAssetExposed) exfiltrationProbability += 0.45;
    if (criticalVaultCompromised) exfiltrationProbability += 0.40;
    if (activeInfections.length > 3) exfiltrationProbability += 0.10;
    exfiltrationProbability = Math.min(0.99, exfiltrationProbability);

    // 7. Instability metrics
    let cpuUnstable = false;
    let averageLoss = 0.02; // baseline

    nodes.forEach(node => {
      if (node.cpuLoad > 90) cpuUnstable = true;
      if (node.status === 'infected' || node.status === 'critical') {
        averageLoss += 0.08;
      }
    });

    return {
      nextTargetCohort,
      expectedBlastRadiusGrowth,
      insiderThreatActiveIndices,
      governanceViolationsExpectedCount,
      trustDegradationTimeline,
      exfiltrationProbability,
      instabilityMetrics: {
        cpuUnstable,
        networkLossRate: Number(Math.min(0.75, averageLoss).toFixed(3)),
        driftSeverity: Math.min(100, Math.round(activeInfections.length * 12 + 5))
      }
    };
  }
}

export const futureStateEngine = FutureStateEngine.getInstance();
