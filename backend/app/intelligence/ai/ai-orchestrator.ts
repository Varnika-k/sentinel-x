import { GraphNodeState, GraphEdgeState, graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';
import { temporalMemoryEngine } from './memory-engine';
import { temporalReasoner } from './temporal-reasoner';
import { governanceAnalyzer } from './governance-analyzer';
import { attackNarrator } from './attack-narrator';
import { blastRadiusAnalyzer } from './blast-radius-analyzer';
import { recommendationEngine, AutonomousActionPlan } from './recommendation-engine';
import { GeminiProvider } from '../../../../src/server/ai/gemini-provider';
import { CONFIG } from '../../../../src/config';
import { identityEngine } from '../identity/identity-engine';

export interface AIReasoningOutput {
  summary: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  threatClassification: string;
  blastRadius: number;
  affectedInfrastructure: string[];
  trustDegradation: number;
  propagationProbability: number;
  operationalImpact: string;
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  temporalAnalysis: {
    isRepeatedAnomaly: boolean;
    frequencyRating: string;
    blastTrend: string;
    evolutionNarrative: string;
    priorEventsCount: number;
  };
  governanceReport: {
    complianceScore: number;
    violatedRules: number;
    instabilityByZone: Record<string, number>;
    trustBoundaryLeaking: boolean;
    violatorsDetails: string[];
  };
  narrativeSummary: string;
  stageMilestones: string[];
  remediationPlan: AutonomousActionPlan[];
  adversaryBehavior: {
    tactics: string[];
    techniques: string[];
    mitreAlignment: string;
  };
}

export class AIOrchestrator {
  private static instance: AIOrchestrator;
  private geminiProvider: GeminiProvider | null = null;

  private constructor() {
    const apiKey = CONFIG.ai.apiKey || '';
    if (apiKey) {
      this.geminiProvider = new GeminiProvider(apiKey);
      logger.info('[AIOrchestrator] Registered Server Gemini Provider for real-time deep-reasoning streams.');
    } else {
      logger.warn('[AIOrchestrator] Running in Autonomous Heuristic Mode due to missing active Gemini API key.');
    }
  }

  public static getInstance(): AIOrchestrator {
    if (!AIOrchestrator.instance) {
      AIOrchestrator.instance = new AIOrchestrator();
    }
    return AIOrchestrator.instance;
  }

  /**
   * Evaluates the entire current infrastructure state, running the cognitive reasoning orchestration pipeline.
   */
  public async analyzeInfrastructure(nodeName: string): Promise<AIReasoningOutput> {
    logger.info(`[AIOrchestrator] Commencing full-hierarchy cyber-intelligence run for node: ${nodeName}`);

    const nodes = Array.from(graphIntelligenceEngine.nodes.values());
    const edges = graphIntelligenceEngine.edges;
    const targetNode = graphIntelligenceEngine.nodes.get(nodeName);

    if (!targetNode) {
      throw new Error(`Asset target [${nodeName}] is not indexed in the real-time topological map.`);
    }

    // 1. Analyze Blast Cascade
    const blastReport = blastRadiusAnalyzer.analyzeBlastCascade(nodeName);

    // 2. Evaluate Governance Rules & Compilance Compliance
    const govReport = governanceAnalyzer.evaluateGovernanceRisk(nodes, edges);

    // 3. Resolve Temporal Anomaly Recurring History
    const temporalSummary = temporalReasoner.reasonOverTime(nodeName, targetNode.abnormalBehaviorScore || 0);

    // 4. Generate Narrative Chronology
    const narrativeResult = attackNarrator.drawNarrative(nodeName, blastReport.affectedNodes);

    // 5. Formulate Adaptive Remediation Plan
    const mitigations = recommendationEngine.formulateAutonomousRemediation(targetNode, blastReport.score);

    // Threat details classifications
    let threatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (targetNode.status === 'infected') threatLevel = 'critical';
    else if (targetNode.status === 'critical' || blastReport.score > 40) threatLevel = 'high';
    else if (targetNode.status === 'warning') threatLevel = 'medium';

    // Record this in memory
    temporalMemoryEngine.recordPattern({
      id: `PAT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      patternType: targetNode.status === 'infected' ? 'Adversary Intrusion Sequence' : 'Abnormal Diagnostic Shift',
      nodeId: nodeName,
      threatLevel,
      mitreTactic: targetNode.status === 'infected' ? 'lateral-movement' : 'reconnaissance',
      violatedPolicies: govReport.severeRiskNodesList.map(n => `Compliance boundary alert: ${n}`),
      narrativeSummary: narrativeResult.narrativeSummary
    });

    const confidence = Math.max(0.85, 1.0 - (targetNode.abnormalBehaviorScore || 0) / 300);

    // Compile Structured Output
    return {
      summary: narrativeResult.narrativeSummary,
      threatLevel,
      confidence,
      threatClassification: targetNode.status === 'infected' ? 'Multi-Stage Lateral Compromise' : 'Anomalous Gateway Ingress Probe',
      blastRadius: blastReport.score,
      affectedInfrastructure: blastReport.affectedNodes,
      trustDegradation: Math.round(100 - targetNode.trustScore),
      propagationProbability: Math.round(targetNode.compromiseProbability * 100),
      operationalImpact: blastReport.criticalSystemsRisk.length > 0 
        ? `Adversary pathways threaten high-priority services: ${blastReport.criticalSystemsRisk.map(c => c.name).join(', ')}.` 
        : `No downstream mission-critical core systems fall within immediate exposure zone boundaries.`,
      complianceStatus: targetNode.complianceStatus || 'compliant',
      temporalAnalysis: {
        isRepeatedAnomaly: temporalSummary.isRepeatedAnomaly,
        frequencyRating: temporalSummary.frequencyRating,
        blastTrend: temporalSummary.blastTrend,
        evolutionNarrative: temporalSummary.evolutionNarrative,
        priorEventsCount: temporalSummary.priorEventsCount
      },
      governanceReport: {
        complianceScore: govReport.overallComplianceScore,
        violatedRules: govReport.violatedRulesCount,
        instabilityByZone: govReport.zonesInstability,
        trustBoundaryLeaking: govReport.trustBoundaryLeaking,
        violatorsDetails: govReport.incidentExplanations
      },
      narrativeSummary: narrativeResult.narrativeSummary,
      stageMilestones: narrativeResult.stageMilestones,
      remediationPlan: mitigations,
      adversaryBehavior: {
        tactics: targetNode.status === 'infected' ? ['Initial Access', 'Command Control', 'Lateral Movement'] : ['Reconnaissance'],
        techniques: targetNode.status === 'infected' ? ['T1059 Command interpreter', 'T1021 Remote services'] : ['T1595 Active Scanning'],
        mitreAlignment: targetNode.status === 'infected' ? 'TA0008 (Lateral Movement)' : 'TA0043 (Reconnaissance)'
      }
    };
  }

  /**
   * Returns a streaming response utilizing Gemini (or a live word-by-word local cognitive heuristic generator)
   */
  public async streamReasoningMarkdown(nodeName: string, onChunk: (text: string) => void): Promise<void> {
    const analysis = await this.analyzeInfrastructure(nodeName);
    
    // Check if we can stream via the registered Gemini client API
    if (this.geminiProvider) {
      try {
        const reqContext = {
          type: 'threat',
          context: {
            targetNode: graphIntelligenceEngine.nodes.get(nodeName),
            recentActivity: temporalMemoryEngine.getHistorySummary(nodeName),
            isReplayActive: false,
            simulationScenario: 'Standard Operations',
            graphAnalytics: {
              nodes: Array.from(graphIntelligenceEngine.nodes.values()),
              edges: graphIntelligenceEngine.edges,
              blastRadius: analysis.blastRadius,
              propagationProbability: analysis.propagationProbability
            }
          }
        };
        await this.geminiProvider.stream(reqContext as any, onChunk);
        return;
      } catch (err) {
        logger.error('[AIOrchestrator] Fallback streaming triggered due to Gemini failure.', err);
      }
    }

    // Heuristics beautiful format generator
    const markdown = `
### SENTINELX AUTONOMOUS COGNITIVE REASONING REPORT
**Target Evaluated**: \`${nodeName}\` | **Threat Profile**: \`${analysis.threatClassification.toUpperCase()}\`
**Cyber Threat Level**: \`${analysis.threatLevel.toUpperCase()}\` (Score: \`${analysis.blastRadius}/100\`)
**Compliance Status**: \`${analysis.complianceStatus.toUpperCase()}\` (Zone Score: \`${analysis.governanceReport.complianceScore}%\`)

---

#### 1. CRITICAL INCIDENT CHRONOLOGY SUMMARY
*   ${analysis.summary}
*   **Adversary Objectives**: Identified systematic footprint actions aiming to maintain credential hooks.
*   **Active MITRE Technique Mapping**: Mapped to \`${analysis.adversaryBehavior.mitreAlignment}\` leveraging techniques \`${analysis.adversaryBehavior.techniques.join(', ')}\`.

#### 2. DATA GOVERNANCE & PRIVACY COMPLIANCE AUDIT
*   **Active Rules Violated**: \`${analysis.governanceReport.violatedRules}\` Policy Failures flagged in baseline audits.
*   **Trust Boundary Leakage**: \`${analysis.governanceReport.trustBoundaryLeaking ? 'WARNING: INTEGRITY COLLAPSE REACHED' : 'SECURE / ENFORCED'}\`.
*   **Zone Exposure Pressure**:
${Object.entries(analysis.governanceReport.instabilityByZone).map(([zone, weight]) => `    - **${zone.toUpperCase()}**: \`${weight}% Instability Index\``).join('\n')}

#### 3. COGNITIVE LATERAL MOVEMENT FLOW
*   **Blast Coverage Area**: \`${analysis.blastRadius}%\` exposure radius bounds.
*   **Adjacent Paths Traversed**: \`${analysis.affectedInfrastructure.join(' -> ')}\`.
*   **Crown Jewels Exposed**: \`${analysis.governanceReport.violatorsDetails.length || 'None'}\`.

#### 4. ZERO-TRUST IDENTITY REASONING & COMPLIANCE SUMMARY
*   **Dynamic Identity Risk Indexes**:
${identityEngine.listIdentities().map(u => `    - **User: ${u.username}** [${u.department.toUpperCase()}] | Zero-Trust: \`${u.currentTrustScore}%\` | Risk Score: \`${u.riskScore}/100\` | Insider Confidence: \`${u.insiderThreatConfidence}%\` ${u.isQuarantined ? '**(QUARANTINED)**' : '(ACTIVE)'}`).join('\n')}
*   **Access Control Strategy**: Enforcing Zero-Trust continuous verification with adaptive threat boundaries.

#### 5. STAGED REMEDIATION COURSE OF ACTION PLAN
${analysis.remediationPlan.map((action, idx) => `
##### RECOMMENDATION PLAN ${idx + 1}: ${action.mitigationType.toUpperCase()}
*   **Target Mitigation**: *${action.recommendationText}*
*   **Confidence Success**: \`${action.successProbability}%\` Probability.
*   **Architectural Rationale**: ${action.rationale}
*   **Operational Trade-offs**: *${action.sideEffects}*
`).join('')}

---
*Generated by SentinelX CyOps V2 Autonomous Governance Heuristics.*
    `.trim();

    // Stream word-by-word with delay to emulate responsive operational feedback
    const chunks = markdown.split(/(\s+)/);
    for (const chunk of chunks) {
      onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 8));
    }
  }
}

export const aiOrchestrator = AIOrchestrator.getInstance();
