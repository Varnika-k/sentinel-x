export type OperationalEventType = 
  | 'telemetry' 
  | 'attack' 
  | 'defense' 
  | 'replay' 
  | 'ai' 
  | 'simulation'
  | 'governance'
  | 'governance:credential-detected'
  | 'governance:secret-exposure'
  | 'governance:pii-risk'
  | 'governance:abnormal-access'
  | 'governance:data-zone-risk'
  | 'governance:policy-violation';
export type OperationalLevel = 'low' | 'medium' | 'high' | 'critical';
export type IncidentMitigationState = 'triggered' | 'active' | 'resolved' | 'failed';

export interface UnifiedOperationalEvent {
  id: string;
  timestamp: string;
  eventType: OperationalEventType;
  source: string;
  severity: OperationalLevel;
  nodeId?: string;
  infrastructureZone?: string;
  attackStage?: 'recon' | 'foothold' | 'lateral' | 'exfiltration' | 'impact';
  propagationRisk?: number; // 0.0 to 1.0
  trustImpact?: number; // delta change to trust state (-100 to 100)
  graphMutation?: GraphMutationPayload;
  telemetry?: Record<string, any>;
  replaySequence: number;
  mitigationState?: IncidentMitigationState;
  correlationId?: string;
}

export interface GraphMutationPayload {
  nodesToUpdate?: Array<Partial<RuntimeNodeState> & { id: string }>;
  edgesToUpdate?: Array<Partial<RuntimeEdgeState> & { id: string }>;
}

export interface RuntimeNodeState {
  id: string;
  name: string;
  type: string;
  namespace: string;
  environment: string;
  status: 'healthy' | 'warning' | 'critical' | 'infected' | 'isolated' | 'compromised' | 'safe' | 'degraded';
  trustScore: number;            // 0 to 100
  compromiseProbability: number; // 0.0 to 1.0
  resilienceScore: number;       // 0 to 100
  operationalCriticality: number; // 0 to 100
  exposureScore: number;         // 0 to 100
  cpuLoad: number;
  latency: number;
  activeConnections: number;
  riskScore: number;             // 0 to 100
  
  // Enterprise Data Governance & Sensitivity Layers
  vulnerability?: number;         // 0 to 1
  sensitivityLevel?: 'low' | 'medium' | 'high' | 'critical';
  governanceRisk?: number;       // 0 to 100
  containsSecrets?: boolean;
  piiRisk?: number;              // 0 to 100
  abnormalAccessScore?: number;  // 0 to 100
  complianceStatus?: 'compliant' | 'warning' | 'non-compliant';
  trustLevel?: number;           // 0 to 100
  classificationSummary?: string;
  metadata?: Record<string, any>;

  // Living enterprise intelligence mesh attributes
  abnormalBehaviorScore?: number; // 0 to 100
  identityRisk?: number;          // 0 to 100
  propagationMultiplier?: number; // 1.0 to 3.0
  securityClassification?: 'public' | 'internal' | 'confidential' | 'restricted';
  containsSensitiveAssets?: boolean;
}

export interface RuntimeEdgeState {
  id: string;
  source: string;
  target: string;
  type: 'TRUST_PATH' | 'COMMUNICATION_LINK' | 'SERVICE_DEPENDENCY' | 'AUTH_ROUTE' | 'DATA_FLOW';
  status: 'active' | 'compromised' | 'severed';
  riskWeight: number; // 0.0 to 1.0
}

export interface GraphSnapshot {
  id: string;
  timestamp: string;
  replaySequence: number;
  nodes: RuntimeNodeState[];
  edges: RuntimeEdgeState[];
}
