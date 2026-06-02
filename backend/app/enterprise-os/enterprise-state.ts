import { EnterpriseStateModel } from './types';
import { graphIntelligenceEngine } from '../simulation/graph-intelligence';
import { complianceEngine } from '../intelligence/governance/compliance-engine';
import { trustEnforcer } from '../intelligence/governance/trust-enforcer';

export class EnterpriseState {
  private static instance: EnterpriseState;

  private constructor() {}

  public static getInstance(): EnterpriseState {
    if (!EnterpriseState.instance) {
      EnterpriseState.instance = new EnterpriseState();
    }
    return EnterpriseState.instance;
  }

  public getLiveState(): EnterpriseStateModel {
    // Dynamically retrieve active state parameters from other subsystems safely
    const liveNodes = Array.from(graphIntelligenceEngine.nodes.values());
    const compromisedNodes = liveNodes.filter(n => n.status === 'infected' || n.status === 'critical');
    const warningNodes = liveNodes.filter(n => n.status === 'warning');

    const totalNodes = liveNodes.length || 1;
    const readiness = complianceEngine.evaluateEnterpriseReadiness(liveNodes);
    const governanceScore = readiness.aggregatedGovernanceScore || 85;

    // Assess overall business operational severity levels
    let operationalState: 'NOMINAL' | 'DEGRADED' | 'CRITICAL' | 'EMERGENCY' = 'NOMINAL';
    let activeThreatLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE' = 'LOW';

    if (compromisedNodes.length > 2) {
      operationalState = 'EMERGENCY';
      activeThreatLevel = 'SEVERE';
    } else if (compromisedNodes.length > 0) {
      operationalState = 'CRITICAL';
      activeThreatLevel = 'HIGH';
    } else if (warningNodes.length > 0 || governanceScore < 75) {
      operationalState = 'DEGRADED';
      activeThreatLevel = 'ELEVATED';
    }

    return {
      timestamp: new Date().toISOString(),
      workforceCount: 154,
      activeApplicationsCount: 14,
      connectedDatabasesCount: 8,
      infrastructureUtilization: Math.floor(65 + Math.random() * 12),
      governanceScore,
      activeIncidentsCount: compromisedNodes.length + warningNodes.length,
      activeCustomersImpacted: compromisedNodes.length > 0 ? 15000 : 0,
      operationalState,
      activeThreatLevel
    };
  }
}

export const enterpriseState = EnterpriseState.getInstance();
