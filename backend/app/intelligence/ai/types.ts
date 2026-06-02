import { GraphNodeState, GraphEdgeState } from '../../simulation/graph-intelligence';

export interface ThreatStateContext {
  telemetryMetadata: any;
  graphNodes: GraphNodeState[];
  graphEdges: GraphEdgeState[];
  governanceComplianceViolated: boolean;
  propagationContext: any;
  attackSequences: any[];
}

export interface AIRecordedPattern {
  id: string;
  timestamp: string;
  patternType: string;
  nodeId: string;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  mitreTactic: string;
  violatedPolicies: string[];
  narrativeSummary: string;
}

export interface AIForensicSnapshot {
  sessionId: string;
  timestamp: string;
  narrative: string;
  blastRadiusScore: number;
  criticalAssetsExposed: string[];
  escalationSteps: string[];
}
