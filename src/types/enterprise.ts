export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  businessUnit: string;
  manager: string;
  location: string;
  devices: string[];
  applicationsUsed: string[];
  accessRights: string[];
  trustScore: number; // 0 - 100
  riskScore: number;  // 0 - 100
  activityStatus: 'active' | 'idle' | 'suspended';
}

export interface Department {
  id: string;
  name: string;
  businessUnit: string;
  head: string;
  employeesCount: number;
  riskScore: number;
  openViolations: number;
  stabilityIndex: number; // 0 - 100
  teams: string[];
}

export interface EnterpriseApplication {
  id: string;
  name: string;
  owner: string;
  usersCount: number;
  dependencies: string[]; // Related app IDs
  connectedDatabases: string[]; // Database IDs
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  operationalHealth: number; // percentage
  governanceStatus: 'compliant' | 'warning' | 'non-compliant';
}

export interface DataAsset {
  id: string;
  name: string;
  type: 'relational' | 'data-lake' | 'kv-store' | 'warehouse' | 'object-storage';
  classification: string; // e.g. "Customer PII", "Financial Books", "Heuristics Ledger"
  owner: string;
  sensitivity: 'restricted' | 'confidential' | 'internal' | 'public';
  usageTrend: 'rising' | 'stable' | 'declining';
  accessActivityCount: number; // QPS or daily accesses
  volumeGb: number;
}

export interface InfraNode {
  id: string;
  name: string;
  type: 'bare-metal' | 'vm' | 'k8s-pod' | 'container' | 'router' | 'switch';
  health: number; // percentage
  capacityCpu: number; // percentage used
  capacityRam: number; // percentage used
  utilization: number; // average load %
  availability: number; // uptime %
  provider: 'aws' | 'gcp' | 'azure' | 'on-premise';
  region: string;
}

export interface GovernanceViolation {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  department: string;
  ruleViolated: string;
  detectedAt: string;
  assignedTo: string;
  status: 'open' | 'investigating' | 'mitigated';
}

export interface CloudRegionStats {
  provider: 'aws' | 'gcp' | 'azure';
  region: string;
  instancesCount: number;
  healthyCount: number;
  monthlyCost: number;
  identitySystemCount: number;
  networkThroughputGb: number;
}

export interface EnterpriseStats {
  employeesCount: number;
  departmentsCount: number;
  applicationsCount: number;
  databasesCount: number;
  serversCount: number;
  cloudResourcesCount: number;
  devicesCount: number;
  criticalAssetsCount: number;
  
  healthScore: number;
  stabilityIndex: number;
  governanceScore: number;
  complianceScore: number;
  riskIndex: number;
  infraHealth: number;
  workforceIntelIndex: number;
  digitalTrustIndex: number;
}
