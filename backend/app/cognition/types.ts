export interface ReasoningContext {
  timestamp: string;
  telemetrySubset: any[];
  infraNodesSubset: any[];
  dbNodesSubset: any[];
  employeesSubset: any[];
  governanceSubset: {
    readinessScore: number;
    violationsCount: number;
    zeroTrustBreaches: any[];
  };
  twinSnapshot: any;
  dependentLinksCount: number;
  historicalIncidents: any[];
}

export interface Evidence {
  id: string;
  title: string;
  description: string;
  source: 'telemetry' | 'identity' | 'governance' | 'simulation' | 'fabric' | 'database';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  associatedEntities: { id: string; type: string; name: string }[];
  reliabilityScore: number; // 0 to 1
}

export interface EvidenceChain {
  id: string;
  summary: string;
  primaryEvidence: Evidence;
  supportingEvidence: Evidence[];
  counterEvidence: Evidence[];
  totalWeight: number;
}

export interface Hypothesis {
  id: string;
  type: 'CREDENTIAL_ABUSE' | 'INSIDER_ATTACK' | 'CLOUD_MISCONFIGURATION' | 'RANSOMWARE_SWEEP' | 'SENSITIVE_DATA_LEAK' | 'NORMAL_WORKFLOW' | 'SYSTEM_DESTRUCTION';
  title: string;
  description: string;
  observedPattern: string;
  confidenceScore: number;
  evidenceChainId: string;
  underlyingRisks: string[];
  cognitiveImplications: string;
}

export interface CognitiveExplanation {
  hypothesisId: string;
  whatHappened: string;
  whyWeBelievedIt: string[];
  evidenceSummary: string;
  affectedSystems: string[];
  affectedBUs: string[];
  governanceImplications: string[];
  detailedReportMarkdown?: string;
  businessImpactSummary: string;
}

export interface Recommendation {
  id: string;
  title: string;
  actionableStep: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  mitigationTimeMinutes: number;
  responsibleTeam: string;
}

export interface DecisionGraphNode {
  id: string;
  label: string;
  type: 'EVIDENCE' | 'HYPOTHESIS' | 'RISK' | 'IMPACT' | 'RECOMMENDATION';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

export interface DecisionGraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface DecisionGraph {
  nodes: DecisionGraphNode[];
  edges: DecisionGraphEdge[];
}

export interface Prediction {
  id: string;
  riskName: string;
  likelyFutureRisk: string;
  probability: number; // 0 to 1
  impactSeverity: 'low' | 'medium' | 'high' | 'critical';
  timeHorizon: 'Hours' | 'Days' | 'Weeks';
  mitigationComplexity: 'Simple' | 'Medium' | 'Complex';
  riskScenario: string;
}

export interface HistoricalAnomaliesSummary {
  recurrentIdentityAnomaliesCount: number;
  recurrentGovernanceBreachesCount: number;
  repeatedInfrastructureFailuresCount: number;
}

export interface ExecutiveBrief {
  timestamp: string;
  dailyIntelligenceBrief: string;
  operationalHealthSummary: string;
  governanceSummary: string;
  riskEvolutionSummary: string;
  dependencyRiskSummary: string;
  executiveInsights: string[];
}
