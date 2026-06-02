export interface EnterpriseHealthMetrics {
  overallScore: number;
  operational: number;
  security: number;
  governance: number;
  business: number;
  infrastructure: number;
  workforce: number;
  trust: number;
  dependency: number;
}

export interface EnterpriseStateModel {
  timestamp: string;
  workforceCount: number;
  activeApplicationsCount: number;
  connectedDatabasesCount: number;
  infrastructureUtilization: number; // 0 to 100%
  governanceScore: number;
  activeIncidentsCount: number;
  activeCustomersImpacted: number;
  operationalState: 'NOMINAL' | 'DEGRADED' | 'CRITICAL' | 'EMERGENCY';
  activeThreatLevel: 'LOW' | 'GUARDED' | 'ELEVATED' | 'HIGH' | 'SEVERE';
}

export interface EnterpriseTimelineEvent {
  id: string;
  category: 'incident' | 'deployment' | 'governance' | 'operational' | 'infrastructure' | 'identity' | 'business';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  initiator: string;
  affectedBU: string;
}

export interface EnterpriseImpactEvaluation {
  operationalImpactScore: number; // 0 - 100
  financialImpactUSD: number;
  organizationalImpactScore: number; // 0 - 100
  dependencyImpactScore: number; // 0 - 100
  affectedNodesCount: number;
  mitigationComplexity: 'low' | 'medium' | 'high' | 'critical';
  remedies: string[];
}

export interface EnterpriseEntityNode {
  id: string;
  type: 'employee' | 'team' | 'department' | 'bu' | 'application' | 'database' | 'infrastructure' | 'cloud' | 'business_operation';
  name: string;
  owner: string;
  status: 'nominal' | 'degraded' | 'failed';
  riskScore: number;
  parentEntityId?: string;
}

export interface EnterpriseOSRegistry {
  nodes: EnterpriseEntityNode[];
  edges: { source: string; target: string; relationship: string }[];
}
