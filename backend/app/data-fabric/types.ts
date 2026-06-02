export type SensitivityLabel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED' | 'HIGHLY_RESTRICTED';

export type EnterpriseNodeType = 
  | 'employee' 
  | 'department' 
  | 'application' 
  | 'database' 
  | 'document' 
  | 'cloud_resource' 
  | 'identity' 
  | 'infrastructure' 
  | 'business_process'
  | 'governance_rule';

export interface EnterpriseNode {
  id: string;
  name: string;
  type: EnterpriseNodeType;
  sensitivity: SensitivityLabel;
  riskScore: number;            // 0 - 100
  businessCriticality: number;  // 0 - 100
  operationalImpact: number;    // 0 - 100
  ownerId?: string;             // ID of employee or department
  departmentId?: string;        // Department ID context
  metadata: Record<string, any>; // Strictly metadata-only (no raw data)
}

export type RelationType = 
  | 'OWNED_BY'
  | 'REPORTS_TO'
  | 'MEMBER_OF'
  | 'DEPENDS_ON'
  | 'RUNS_ON'
  | 'STORES_DATA_FOR'
  | 'ACCESSES'
  | 'TRANSFORMS_TO'
  | 'PART_OF_PROCESS'
  | 'GOVERNED_BY'
  | 'MANAGED_BY'
  | 'PROVISIONS';

export interface EnterpriseRelation {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  strength: number; // 0.0 to 1.0
  metadata?: Record<string, any>;
}

export interface LineageTrace {
  sourceId: string;
  sourceName: string;
  sourceType: EnterpriseNodeType;
  transforms: string[]; // Intermediate application / service IDs
  consumerId: string;
  consumerName: string;
  consumerType: EnterpriseNodeType;
}

export interface BusinessImpactResult {
  targetId: string;
  targetName: string;
  targetType: EnterpriseNodeType;
  failureImpactScore: number;
  recoveryComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  affectedDepartments: string[];
  affectedApplications: string[];
  affectedBusinessProcesses: string[];
  dependencyDepth: number;
  directDownstreamCount: number;
  totalDownstreamCascading: number;
  failurePathways: string[];
}

export interface SearchResult {
  nodeId: string;
  name: string;
  type: EnterpriseNodeType;
  sensitivity: SensitivityLabel;
  riskScore: number;
  businessCriticality: number;
  ownerName: string;
  departmentName: string;
  dependencyCount: number;
  relationCount: number;
  governanceScore: number;
}
