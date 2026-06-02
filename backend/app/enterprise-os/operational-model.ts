import { EnterpriseHealthMetrics } from './types';
import { graphIntelligenceEngine } from '../simulation/graph-intelligence';
import { complianceEngine } from '../intelligence/governance/compliance-engine';

export class OperationalModel {
  private static instance: OperationalModel;

  private constructor() {}

  public static getInstance(): OperationalModel {
    if (!OperationalModel.instance) {
      OperationalModel.instance = new OperationalModel();
    }
    return OperationalModel.instance;
  }

  /**
   * Computes individual health scores dynamically mapping back to underlying configurations.
   */
  public generateHealthMetrics(): EnterpriseHealthMetrics {
    const liveNodes = Array.from(graphIntelligenceEngine.nodes.values());
    const compromisedCount = liveNodes.filter(n => n.status === 'infected' || n.status === 'critical').length;
    const warnsCount = liveNodes.filter(n => n.status === 'warning').length;

    // 1. Governance & trust health assessment
    const complianceGoal = complianceEngine.evaluateEnterpriseReadiness(liveNodes);
    const governance = complianceGoal.aggregatedGovernanceScore || 85;

    // 2. Infrastructural penalty computation
    const totalNodesCount = liveNodes.length || 1;
    const infraBase = 95 - ((compromisedCount * 20) + (warnsCount * 10)) / totalNodesCount * 4;
    const infrastructure = Math.max(10, Math.min(99, Math.round(infraBase)));

    // 3. Operational stability score
    const operational = Math.max(5, Math.min(98, Math.round(infrastructure * 0.95 - compromisedCount * 8)));

    // 4. Security postures
    const security = Math.max(5, Math.min(99, Math.round(98 - (compromisedCount * 15 + warnsCount * 4))));

    // 5. Business delivery SLA conversion
    const business = compromisedCount > 0 ? 55 : 88;

    // 6. Workforce resilience indexes
    const workforce = warnsCount > 2 ? 72 : 95;

    // 7. Trust vector
    const trust = Math.max(10, Math.min(99, Math.round((governance * 0.6) + (security * 0.4))));

    // 8. Dependency robustness
    const dependency = Math.max(10, Math.min(99, Math.round(94 - compromisedCount * 5)));

    // 9. Overall aggregated organizational rating
    const overallScore = Math.round(
      (operational + security + governance + business + infrastructure + workforce + trust + dependency) / 8
    );

    return {
      overallScore,
      operational,
      security,
      governance,
      business,
      infrastructure,
      workforce,
      trust,
      dependency
    };
  }
}

export const operationalModel = OperationalModel.getInstance();
