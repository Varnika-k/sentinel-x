export interface UnifiedCorrelationAlert {
  id: string;
  timestamp: string;
  source: 'SURICATA' | 'FALCO' | string;
  eventType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  nodeId: string;
  attackStage?: 'recon' | 'foothold' | 'lateral' | 'exfiltration' | 'impact';
  message: string;
  telemetry: any;
}

export interface CorrelatedAlertCluster {
  id: string;
  timestamp: string;
  nodesAffected: string[];
  stagesPresent: Array<'recon' | 'foothold' | 'lateral' | 'exfiltration' | 'impact'>;
  overallSeverity: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number; // 0 to 100
  threatNarrative: string;
  originalAlertIds: string[];
  sourcesFused: string[];
  riskAmplified: boolean;
  blastRadiusScore: number; // 0 to 100
  exposureChain: string[]; // sequence of nodes affected in the flow path
}

export interface ExposureChain {
  headNodeId: string;
  path: string[];
  criticalAssetsAtRisk: string[];
  exposureRiskIndex: number; // 0 to 100
  governanceComplianceViolated: boolean;
}

export interface PredictionOutcome {
  sourceNodeId: string;
  targetNodeId: string;
  probability: number; // 0.0 to 1.0
  predictedAttackStage: 'recon' | 'foothold' | 'lateral' | 'exfiltration' | 'impact';
  explanation: string;
}
