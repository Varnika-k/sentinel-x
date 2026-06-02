import { GoogleGenAI } from '@google/genai';
import { dependencySimulator, EnterpriseEntity } from './dependency-simulator';
import { workforceSimulator, WorkforceSimulationResult } from './workforce-simulator';
import { infrastructureSimulator, InfrastructureSimulationResult } from './infrastructure-simulator';
import { governanceSimulator, GovernanceSimulationResult } from './governance-simulator';
import { businessSimulator, BusinessSimulationResult } from './business-simulator';
import { timelineSimulator, TimelineMilestone } from './timeline-simulator';
import { impactEngine, ComprehensiveImpactReport } from './impact-engine';
import { outcomeEngine, StrategicRecommendations } from './outcome-engine';
import { logger } from '../core/logger';

export interface SimulatedScenarioReport {
  scenarioId: string;
  name: string;
  description: string;
  failedStartingNodes: string[];
  
  // Simulation results
  workforce: WorkforceSimulationResult;
  infrastructure: InfrastructureSimulationResult;
  governance: GovernanceSimulationResult;
  business: BusinessSimulationResult;
  timeline: TimelineMilestone[];
  impactReport: ComprehensiveImpactReport;
  strategicAdvisories: StrategicRecommendations;
  
  // Active status of all entities in the graph (calculated dynamically)
  nodesStatus: Array<{ id: string; name: string; type: string; status: 'nominal' | 'degraded' | 'disabled' }>;
  
  // AI advice generation was dynamic flag
  aiConsultationActive: boolean;
  aiAdvisorMessage?: string;
}

export class ScenarioEngine {
  private aiClient: GoogleGenAI | null = null;

  constructor() {
    this.initAIClient();
  }

  private initAIClient() {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      this.aiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build'
          }
        }
      });
      logger.info('ScenarioEngine: Gemini Strategic Advisor model initialized successfully.');
    } else {
      logger.warn('ScenarioEngine: GEMINI_API_KEY is not defined. Falling back to local Strategic Planning rules.');
    }
  }

  public async runScenario(
    scenarioType: 'ransomware_outbreak' | 'cloud_outage' | 'workforce_departure' | 'governance_drift' | 'custom_whatif',
    customTargets: string[] = [],
    customDescription: string = ''
  ): Promise<SimulatedScenarioReport> {
    
    let name = '';
    let description = '';
    let startingFailedNodeIds: string[] = [];

    // Evaluate preset simulation models
    switch (scenarioType) {
      case 'ransomware_outbreak':
        name = 'Scenario Red: Ransomware Outbreak on Database Core';
        description = customDescription || 'Models an adversarial lateral movement capturing the Core Transaction PostgreSQL databases, forcing encryption triggers and continuous outage conditions.';
        startingFailedNodeIds = ['db-transaction-core'];
        break;
      case 'cloud_outage':
        name = 'Scenario Blue: Primary AWS Cloud Region us-east-1 Outage';
        description = customDescription || 'Simulates a complete regional fail-offline of primary AWS facilities, deactivating Kubernetes production containers and customer databases.';
        startingFailedNodeIds = ['infra-aws-region-1'];
        break;
      case 'workforce_departure':
        name = 'Scenario Gold: Primary SRE & DevOps Engineering Key Leaving';
        description = customDescription || 'Simulates the sudden departure of Dmitry Petrov, the Lead DevOps Architect, who is the sole possessor of active secure Kubernetes container configurations and deployment dual-signoffs.';
        startingFailedNodeIds = ['emp-devops-lead'];
        break;
      case 'governance_drift':
        name = 'Scenario Opal: Identity Multi-Factor Authentication Bypasses';
        description = customDescription || 'Simulates the deactivation of FIDO2 zero-trust authentication controls across active identity providers, triggering compliance violations.';
        startingFailedNodeIds = ['gov-zero-trust-auth'];
        break;
      case 'custom_whatif':
        name = 'Custom Scenario: Strategic What-If Analysis';
        description = customDescription || `A customized organizational impact evaluation starting with failures on: ${customTargets.join(', ')}`;
        startingFailedNodeIds = customTargets;
        break;
      default:
        name = 'System Simulation Control Run';
        description = 'Baseline testing simulation.';
        startingFailedNodeIds = [];
        break;
    }

    // 1. Run Workforce simulator to assess clearances and staffing multipliers
    const workforce = workforceSimulator.simulateWorkforceEvent(
      scenarioType === 'workforce_departure' ? 'employee_departure' : 'nominal',
      startingFailedNodeIds[0] || ''
    );

    // 2. Run Infrastructure simulator for core hardware/network SLAS
    const infra = infrastructureSimulator.simulateInfrastructureEvent(
      scenarioType === 'cloud_outage' ? 'aws_region_outage' : (startingFailedNodeIds.includes('db-transaction-core') ? 'database_failure' : 'nominal'),
      startingFailedNodeIds[0] || ''
    );

    // 3. Run Governance simulator to measure policies, GDPR, and compliance scores
    const governance = governanceSimulator.simulateGovernanceEvent(
      scenarioType === 'governance_drift' ? 'policy_removal' : 'nominal',
      startingFailedNodeIds[0] || ''
    );

    // Aggregate starting failure nodes from sub-simulations
    const collectiveStartingFailures = Array.from(new Set([
      ...startingFailedNodeIds,
      ...workforce.disabledNodeIds,
      ...infra.disabledNodeIds,
      ...governance.disabledNodeIds
    ]));

    // 4. Run Dependency Cascade through the enterprise graph
    const cascadeResult = dependencySimulator.runCascadingSimulation(collectiveStartingFailures);
    
    // Apply any degraded nodes from simulators
    const collectiveStartingDegrades = Array.from(new Set([
      ...workforce.degradedNodeIds,
      ...infra.degradedNodeIds,
      ...governance.degradedNodeIds
    ]));
    collectiveStartingDegrades.forEach(id => {
      const activeState = cascadeResult.nodesMap.get(id);
      if (activeState === 'nominal') {
        cascadeResult.nodesMap.set(id, 'degraded');
      }
    });

    // 5. Run Business metrics calculations
    const entities = dependencySimulator.getEntities();
    const business = businessSimulator.evaluateBusinessImpact(cascadeResult.nodesMap, entities);

    // 6. Project Timeline cumulative costs
    const hasViolations = governance.identifiedViolations.length > 0 || cascadeResult.nodesMap.get('gov-zero-trust-auth') === 'disabled';
    const timeline = timelineSimulator.projectTimeline(
      business.financialLossPerHrUSD,
      governance.complianceScore,
      workforce.recoveryMultiplier,
      hasViolations
    );

    // 7. Compile overall impact and indices
    const impactReport = impactEngine.compileImpactReport(
      workforce,
      infra,
      governance,
      business,
      timeline
    );

    // 8. Generate Strategic advisories response pathways and metrics
    const strategicAdvisories = outcomeEngine.generateStrategicAdvisories(scenarioType);

    // Compile dynamic status arrays for visualization
    const nodesStatus = entities.map(e => ({
      id: e.id,
      name: e.name,
      type: e.type,
      status: cascadeResult.nodesMap.get(e.id) || 'nominal'
    }));

    // 9. Query Gemini for advanced AI reasoning recommendations if we have the authorization
    let aiConsultationActive = false;
    let aiAdvisorMessage: string | undefined = undefined;

    if (this.aiClient) {
      try {
        const promptText = `
Role: Senior Enterprise Risk Officer, CISO, and Strategic Business Continuity Advisor.
Task: Provide a concise Strategic Advisory analysis for SentinelX.

Scenario: ${name}
Description: ${description}
Primary Failure Targets: ${startingFailedNodeIds.join(', ')}

Live Simulation Metrics Compiled:
- Cumulative 30-Day Estimated Loss: $${impactReport.financialScoreUSD.toLocaleString()} USD
- Operational Continuity Score: ${business.operationalContinuity}%
- Compliance Score: ${governance.complianceScore}/100
- Workforce Staffing Level: ${workforce.workforceContinuity}%
- Recovery Duration Multiplier: ${workforce.recoveryMultiplier.toFixed(1)}x
- Identified Governance Violations: ${governance.identifiedViolations.map(v => `[${v.standard}] ${v.details}`).join('; ')}

Based on these actual metrics, please draft an executive-length brief (maximum 4 scannable paragraphs) including:
1. Best Response Action (Immediate triage steps)
2. Best long-term Mitigation
3. Identification of the Lowest-Risk Option
4. The Fastest Recovery Path vs Most Cost-Effective Path
5. General strategic continuity recommendation.

Write in a cold, professional, highly analytical corporate tone. Focus ONLY on actionable resilience. Format using clean Markdown.
`;

        const response = await this.aiClient.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptText
        });

        if (response && response.text) {
          aiAdvisorMessage = response.text.trim();
          aiConsultationActive = true;
          
          // Inject custom advice highlights into our structured advisories for the UI
          const splitLines = aiAdvisorMessage.split('\n');
          const findSection = (keyword: string): string => {
            const line = splitLines.find(l => l.toLowerCase().includes(keyword.toLowerCase()));
            if (line) {
              return line.replace(/^[*\-\s\d.]+\s*:[*\-\s]*/, '').replace(/^#+\s*/, '').trim();
            }
            return '';
          };

          const bestR = findSection('best response');
          const bestM = findSection('mitigation');
          const lowR = findSection('lowest-risk');
          const fastR = findSection('fastest');
          
          if (bestR) strategicAdvisories.bestResponse = bestR;
          if (bestM) strategicAdvisories.bestMitigation = bestM;
          if (lowR) strategicAdvisories.lowestRiskOption = lowR;
          if (fastR) strategicAdvisories.fastestRecoveryPath = fastR;
        }
      } catch (err) {
        logger.error('ScenarioEngine: Failed to reach Gemini API. Cascading onto heuristic advisories.', err);
      }
    }

    return {
      scenarioId: `scen-${scenarioType}-${Date.now().toString().slice(-4)}`,
      name,
      description,
      failedStartingNodes: startingFailedNodeIds,
      workforce,
      infrastructure: infra,
      governance,
      business,
      timeline,
      impactReport,
      strategicAdvisories,
      nodesStatus,
      aiConsultationActive,
      aiAdvisorMessage
    };
  }
}

export const scenarioEngine = new ScenarioEngine();
export default scenarioEngine;
