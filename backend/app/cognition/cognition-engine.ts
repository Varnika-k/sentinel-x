import { 
  ReasoningContext, 
  Evidence, 
  EvidenceChain, 
  Hypothesis, 
  CognitiveExplanation, 
  DecisionGraph, 
  Prediction, 
  ExecutiveBrief 
} from './types';
import { contextEngine } from './context-engine';
import { evidenceEngine } from './evidence-engine';
import { hypothesisEngine } from './hypothesis-engine';
import { confidenceEngine } from './confidence-engine';
import { inferenceEngine } from './inference-engine';
import { explanationEngine } from './explanation-engine';
import { decisionEngine } from './decision-engine';
import { reasoningEngine } from './reasoning-engine';
import { azureAdService } from '../connectors/azure-ad-service';
import { logger } from '../core/logger';

export class CognitionEngine {
  private static instance: CognitionEngine;

  // Organizational Memory: Tracks historical summaries and repeated failures
  private organizationalMemoryList: {
    timestamp: string;
    description: string;
    category: string;
    recurrentSeverityGrade: number;
  }[] = [
    {
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      description: 'Repeated off-hours SQL Read scans mapped to privileged employee accounts.',
      category: 'identity_anomaly',
      recurrentSeverityGrade: 2
    },
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      description: 'Recurring cluster ingress namespace escalation attempts flagged by wazuh systems.',
      category: 'telemetry_failure',
      recurrentSeverityGrade: 3
    }
  ];

  private constructor() {}

  public static getInstance(): CognitionEngine {
    if (!CognitionEngine.instance) {
      CognitionEngine.instance = new CognitionEngine();
    }
    return CognitionEngine.instance;
  }

  /**
   * Performs an autonomous cognitive execution cycle of all logic structures.
   */
  public async executeCognitiveCycle() {
    try {
      logger.info('[CognitionEngine] Initiating Autonomous Enterprise Cognitive Reasoning cycle...');

      // 1. Load active reasoning context
      const context = await contextEngine.compileReasoningContext();

      // 2. Generate active evidence from current context
      const newEvidence = evidenceEngine.generateEvidenceFromContext(
        context.telemetrySubset,
        context.governanceSubset.zeroTrustBreaches,
        []
      );

      // 3. Compile evidence chains
      const chains = evidenceEngine.constructEvidenceChains();

      // 4. Formulate threat hypotheses
      const hypotheses = hypothesisEngine.generateHypotheses(chains, context);

      // 5. Compute math-based confidence index on each hypothesis
      hypotheses.forEach(hyp => {
        const matchingChain = chains.find(c => c.id === hyp.evidenceChainId);
        hyp.confidenceScore = confidenceEngine.calculateConfidence(hyp, matchingChain, context);
      });

      logger.info(`[CognitionEngine] Mind cycle completed. ${hypotheses.length} candidate hypotheses are active.`);
    } catch (err) {
      logger.error('[CognitionEngine] Mind iteration failure', err);
    }
  }

  /**
   * Retrieves structural facts & historical patterns for decision-support queries
   */
  public getOrganizationalMemory() {
    return this.organizationalMemoryList;
  }

  /**
   * Records a new memory footprint into long-term organizational memory.
   */
  public recordMemory(description: string, category: string) {
    this.organizationalMemoryList.push({
      timestamp: new Date().toISOString(),
      description,
      category,
      recurrentSeverityGrade: 1
    });
    logger.info(`[CognitionEngine] Recorded new long-term operational memory footprint: "${description}"`);
  }

  /**
   * Answers executive intelligence questions on-demand (Decision Support System)
   */
  public async answerDecisionSupportQuery(query: string): Promise<{
    answerMarkdown: string;
    relevantEntities: string[];
    riskScore: number;
  }> {
    const context = await contextEngine.compileReasoningContext();
    const hypotheses = hypothesisEngine.getHypotheses();
    const activeThreatsCount = hypotheses.filter(h => h.confidenceScore > 60).length;

    let matchedAnswer = '';
    let matchedEntities: string[] = [];
    let riskScore = activeThreatsCount > 0 ? 88 : 42;

    const normalQuery = query.toLowerCase();

    if (normalQuery.includes('risky') || normalQuery.includes('why')) {
      matchedAnswer = `### Why is this currently critical?
1. **Unapproved Root-Privilege Escalation**: Telemetry flagged privileged shells running within core ingress clusters on the microservices topology.
2. **Cooccurring Geographical VPN logins**: Simultaneous access tokens requested across overlapping geographic endpoints.
3. **Downward Governance Trend**: Compliance readiness dropped to **${context.governanceSubset.readinessScore}%** following unauthorized payroll database read scans.`;
      matchedEntities = ['k8s-svc-ingress-nginx', 'payroll-db', 'usr-wright'];
    } else if (normalQuery.includes('depend') || normalQuery.includes('what depends')) {
      matchedAnswer = `### Enterprise Topology Dependencies
- **Ingress Layer**: Acts as the single entry route mapping user traffic to internal billing APIs.
- **Billing Service**: Depends directly on the **Enterprise Database Core Tier (Payroll-DB)**.
- **Affected Business Units**: If a cascading ransomware event blocks the db tier, both **Human Resources / Payroll Operations** and **Finance** departments fall into immediate work stoppage since they depend on real-time payroll reconciliation data.`;
      matchedEntities = ['payroll-db', 'app-payroll'];
    } else if (normalQuery.includes('priority') || normalQuery.includes('prioritize')) {
      matchedAnswer = `### Suggested Mitigation Priority List
* **[CRITICAL - Priority 1]**: Execute Namespace Quarantine on node **k8s-svc-ingress-nginx** to block shell escalation propagation.
* **[HIGH - Priority 2]**: Flush state credentials and issue MFA challenges for user **Evan Wright**.
* **[MEDIUM - Priority 3]**: Audit Cloud Security rule baselines to close off-hours database access holes on sensitive Payroll databases.`;
      matchedEntities = ['k8s-svc-ingress-nginx', 'usr-wright'];
    } else if (normalQuery.includes('entra') || normalQuery.includes('azure') || normalQuery.includes('active directory') || normalQuery.includes('oidc') || normalQuery.includes('oauth')) {
      const azureAd = azureAdService.getConfig();
      matchedAnswer = `### Microsoft Entra ID (Azure AD) Unified Connector Status
- **Active Directory Status**: **${azureAd.syncStats.status}**
- **Connected Mode**: ${azureAd.isConfigured ? 'Production (Dedicated Corporate Tenant Gateway)' : 'Interactive Sandbox Enterprise Adapter'}
- **Synchronized Entities Count**:
  - **Identities / Users**: **${azureAd.syncStats.syncedUsersCount} accounts** registered inside Identity Intel.
  - **Entitlement Groups**: **${azureAd.syncStats.syncedGroupsCount} security groups** mapped.
  - **Corporate Roles**: **${azureAd.syncStats.syncedRolesCount} definitions** synced.
  - **Department Suture Mappings**: **${azureAd.syncStats.mappedDepartmentsCount} corporate departments** mapped.
- **Enterprise Graph Grounding**:
  Directory bindings are loaded directly inside the **Knowledge Fabric** graph and Workforce Intelligence databases. These accounts are continuous-challenge assets monitored by Zero-Trust GRC rules.`;
      matchedEntities = ['conn-entra-id-oauth'];
    } else {
      matchedAnswer = `### SentinelX Core Status Report
- **Reasoning Baseline**: Clean.
- **Active Anomalies**: Mapped ${context.governanceSubset.zeroTrustBreaches.length} zero-trust warnings.
- **Resilience Score**: Mapped at **${context.twinSnapshot.resilienceScore}%**.
If you would like to run a targeted vulnerability trace, explore the **AI Reasoning Studio** to visualize current Evidence -> Hypothesis propagation layouts.`;
      matchedEntities = [];
    }

    return {
      answerMarkdown: matchedAnswer,
      relevantEntities: matchedEntities,
      riskScore
    };
  }

  /**
   * Formulates a Daily Executive Intelligence Brief
   */
  public generateExecutiveBrief(
    context: ReasoningContext,
    hypotheses: Hypothesis[],
    predictions: Prediction[]
  ): ExecutiveBrief {
    logger.info('[CognitionEngine] Summarizing daily executive business intelligence brief...');

    const highConfidenceHyp = hypotheses.filter(h => h.confidenceScore > 60);
    const criticalPredictions = predictions.filter(p => p.impactSeverity === 'critical');

    return {
      timestamp: new Date().toISOString(),
      dailyIntelligenceBrief: `Daily security audit indicates localized identity anomalies. Multiple systems flagged possible credential abuse for administrator levels, requiring critical MFA verification policies.`,
      operationalHealthSummary: `Systems are operational (continuity score estimated at ${context.twinSnapshot.resilienceScore}%). Internal service latency is standard, but container privilege access must be audited.`,
      governanceSummary: `Enterprise compliance rating is marked at ${context.governanceSubset.readinessScore}%. There are currently ${context.governanceSubset.violationsCount} active compliance rule Violations recorded.`,
      riskEvolutionSummary: `Threat score rose slightly over the past 24 hours. The primary vector involves outer VPN sessions linking directly into root commands on internal application nodes.`,
      dependencyRiskSummary: `A total of ${context.dependentLinksCount} structural dependencies exist. Core data schemas (Payroll Database) present high vulnerability propagation risk if their underlying Kubernetes hosts are compromised.`,
      executiveInsights: [
        `Identity hijacked access on admin accounts represents high likelihood of targeted data harvesting.`,
        criticalPredictions.length > 0 
          ? `SRE teams should proactively brace for potential database encryption cascades forecasted to occur within 4 hours.`
          : `Maintain proactive audits of sensitive cloud resource deployments.`
      ]
    };
  }
}

export const cognitionEngine = CognitionEngine.getInstance();
