import { logger } from '../core/logger';
import { graphIntelligenceEngine, GraphNodeState } from './graph-intelligence';
import { complianceEngine } from '../intelligence/governance/compliance-engine';
import { blastRadiusAnalyzer } from '../intelligence/ai/blast-radius-analyzer';

export interface HypotheticalSimulationResult {
  scenarioId: string;
  affectedNodesList: string[];
  blastRadiusScoreDelta: number;
  expectedComplianceDrop: number;
  isGovernanceCollapseLikely: boolean;
  recommendedQuarantineNodes: string[];
  mitigatedBlastScore: number;
}

export class HypotheticalSimulator {
  private static instance: HypotheticalSimulator;

  private constructor() {}

  public static getInstance(): HypotheticalSimulator {
    if (!HypotheticalSimulator.instance) {
      HypotheticalSimulator.instance = new HypotheticalSimulator();
    }
    return HypotheticalSimulator.instance;
  }

  /**
   * Evaluates a what-if attack vector starting from a designation node coordinate
   */
  public simulateHypotheticalAttack(entryNodeName: string): HypotheticalSimulationResult {
    logger.info(`[HypotheticalSimulator] Executing speculative containment check targeting: ${entryNodeName}`);

    const nodes = Array.from(graphIntelligenceEngine.nodes.values());
    const targetNode = graphIntelligenceEngine.nodes.get(entryNodeName);

    if (!targetNode) {
      return {
        scenarioId: 'error',
        affectedNodesList: [],
        blastRadiusScoreDelta: 0,
        expectedComplianceDrop: 0,
        isGovernanceCollapseLikely: false,
        recommendedQuarantineNodes: [],
        mitigatedBlastScore: 0
      };
    }

    // 1. Blast Radius Forecasting
    const blastReport = blastRadiusAnalyzer.analyzeBlastCascade(entryNodeName);
    const affected = blastReport.affectedNodes || [];

    // 2. Compliance and Governance collapse forecasting
    // Simulate what happens to our node statuses if they were infected
    const simulatedNodes: GraphNodeState[] = nodes.map(n => {
      const isAffected = affected.includes(n.name) || n.name === entryNodeName;
      return {
        ...n,
        status: isAffected ? 'infected' : n.status,
        trustScore: isAffected ? Math.max(10, n.trustScore - 60) : n.trustScore,
        abnormalBehaviorScore: isAffected ? Math.min(100, (n.abnormalBehaviorScore || 0) + 75) : n.abnormalBehaviorScore
      };
    });

    const currentReadiness = complianceEngine.evaluateEnterpriseReadiness(nodes);
    const simulatedReadiness = complianceEngine.evaluateEnterpriseReadiness(simulatedNodes);

    const compDrop = currentReadiness.aggregatedGovernanceScore - simulatedReadiness.aggregatedGovernanceScore;
    const isGovernanceCollapseLikely = simulatedReadiness.aggregatedGovernanceScore < 60;

    // 3. Containment Strategy Modeling
    // If we preemptively quarantine the entry node cluster, how much is the score reduced?
    const recommendedQuarantine = [entryNodeName];
    // If we quarantined, affected nodes are locked down
    const mitigatedBlastScore = Math.max(12, Math.round(blastReport.score * 0.18));

    return {
      scenarioId: `HYPO-${entryNodeName.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`,
      affectedNodesList: affected,
      blastRadiusScoreDelta: blastReport.score,
      expectedComplianceDrop: compDrop,
      isGovernanceCollapseLikely,
      recommendedQuarantineNodes: recommendedQuarantine,
      mitigatedBlastScore
    };
  }
}

export const hypotheticalSimulator = HypotheticalSimulator.getInstance();
