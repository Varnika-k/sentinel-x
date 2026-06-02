export interface TwinNode {
  id: string;
  name: string;
  type: string;
  namespace: string;
  environment: string;
  status: 'healthy' | 'warning' | 'critical' | 'infected' | 'isolated';
  
  // Real-time telemetry values
  cpuLoad: number; // 0 to 100
  latency: number; // ms
  activeConnections: number;

  // Quantitative trust & structural properties
  trustScore: number;            // 0 to 100
  compromiseProbability: number; // 0.0 to 1.0 (probability of compromise in next 60m)
  resilienceScore: number;       // 0 to 100
  operationalCriticality: number; // 0 to 100
  exposureScore: number;         // 0 to 100
  
  // Living mesh metadata
  containsSecrets: boolean;
  sensitivityLevel: 'low' | 'medium' | 'high' | 'critical';
  governanceRisk: number;         // 0 to 100
  complianceStatus: 'compliant' | 'warning' | 'non-compliant';
  abnormalBehaviorScore: number;  // 0 to 100
  identityRisk: number;           // 0 to 100
  propagationMultiplier: number;  // Multiplier for lateral movement speed
  securityClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  containsSensitiveAssets: boolean;
  
  // Connected relations
  relationships: string[]; // names of other nodes
  lastTelemetryTimestamp: string;
}

export interface TwinEdge {
  id: string;
  source: string;
  target: string;
  type: 'TRUST_PATH' | 'COMMUNICATION_LINK' | 'SERVICE_DEPENDENCY' | 'AUTH_ROUTE' | 'DATA_FLOW';
  status: 'active' | 'compromised' | 'severed';
  riskWeight: number; // 0.0 to 1.0
}

export interface TwinSnapshot {
  id: string;
  timestamp: string;
  label: string;
  description: string;
  threatLevel: number;
  resilienceScore: number;
  nodes: { [name: string]: TwinNode };
  edges: TwinEdge[];
  governanceComplianceScore: number;
  overallHealthScore: number;
}

export interface AttackStep {
  stepIndex: number;
  nodeName: string;
  technique: string;
  probability: number; // 0-1
  estimatedDurationSeconds: number;
  blastRadiusMultiplier: number;
  privilegeEscalationProb: number;
}

export interface AttackSimulationReport {
  simulationId: string;
  triggerNode: string;
  timestamp: string;
  simulatedScenario: string;
  pathsForecasted: AttackStep[][];
  blastRadiusNodes: string[];
  vulnerabilitiesExploited: string[];
  estimatedComplianceLoss: number;
  governanceCollapseZoneCount: number;
  trustDeclinePercentage: number;
  confidenceScore: number; // 0-100
}

export interface PredictionResult {
  nextTargetCohort: string[];
  expectedBlastRadiusGrowth: number; // %.
  insiderThreatActiveIndices: { [user: string]: number };
  governanceViolationsExpectedCount: number;
  trustDegradationTimeline: { timeOffsetMinutes: number; averageTrust: number }[];
  exfiltrationProbability: number; // 0-1
  instabilityMetrics: {
    cpuUnstable: boolean;
    networkLossRate: number;
    driftSeverity: number;
  };
}

export interface DynamicMitigationStrategy {
  id: string;
  recommendationType: 'CONTAINMENT_PLAN' | 'PROPAGATION_LIMIT' | 'TRUST_REINFORCEMENT' | 'GOVERNANCE_HARDENING' | 'SENSITIVE_ZONE_PROTECTION';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetNodes: string[];
  actionToken: string;
  resilienceImpactValue: number; // Positive contribution to overall score
  staged: boolean;
}
