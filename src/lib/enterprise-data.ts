import { 
  Employee, 
  Department, 
  EnterpriseApplication, 
  DataAsset, 
  InfraNode, 
  GovernanceViolation, 
  CloudRegionStats, 
  EnterpriseStats 
} from '../types/enterprise';

// -----------------------------------------------------------------------------
// BUSINESS UNITS AND DEPARTMENTS DEFINITION
// -----------------------------------------------------------------------------
export const BUSINESS_UNITS = [
  'Executive Operations',
  'Core Infrastructure',
  'Human Capital & IAM',
  'Global Finance & Treasury',
  'Cyber Defense & Security',
  'Research & Advanced Intelligence'
];

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-exec',
    name: 'Executive Strategy',
    businessUnit: 'Executive Operations',
    head: 'Seraphina Vance (CEO)',
    employeesCount: 42,
    riskScore: 12,
    openViolations: 0,
    stabilityIndex: 99,
    teams: ['Board of Directors', 'Strategic Growth', 'Public Relations']
  },
  {
    id: 'dept-legal',
    name: 'Legal & Governance',
    businessUnit: 'Executive Operations',
    head: 'Donald Vance (Chief Legal Officer)',
    employeesCount: 110,
    riskScore: 18,
    openViolations: 1,
    stabilityIndex: 96,
    teams: ['Compliance Oversight', 'Contract Operations', 'Risk Assessment']
  },
  {
    id: 'dept-cloud',
    name: 'Cloud Operations & DevOps',
    businessUnit: 'Core Infrastructure',
    head: 'Marcus Aurelius (VP Infrastructure)',
    employeesCount: 1450,
    riskScore: 34,
    openViolations: 3,
    stabilityIndex: 94,
    teams: ['Kubernetes SRE', 'Platform Engineering', 'Multi-Cloud Mesh', 'Provisioning Core']
  },
  {
    id: 'dept-database',
    name: 'Data Storage Engineering',
    businessUnit: 'Core Infrastructure',
    head: 'Diana Prince (Director of Databases)',
    employeesCount: 890,
    riskScore: 42,
    openViolations: 4,
    stabilityIndex: 91,
    teams: ['SQL Solutions', 'Data Warehouses', 'Heuristic Storage Systems', 'Storage SRE']
  },
  {
    id: 'dept-recruitment',
    name: 'Global Workforce Strategy',
    businessUnit: 'Human Capital & IAM',
    head: 'Evelyn Sterling (VP Human Capital)',
    employeesCount: 420,
    riskScore: 15,
    openViolations: 0,
    stabilityIndex: 98,
    teams: ['Global Recruitment', 'Workplace Experience', 'Talent Management']
  },
  {
    id: 'dept-iam',
    name: 'Identity & Access Control',
    businessUnit: 'Human Capital & IAM',
    head: 'Robert Carter (Director of Identity)',
    employeesCount: 610,
    riskScore: 56,
    openViolations: 7,
    stabilityIndex: 88,
    teams: ['Active Directory Sync', 'Zero-Trust Gateways', 'SAML Engine Support']
  },
  {
    id: 'dept-treasury',
    name: 'Corporate Finance & Allocations',
    businessUnit: 'Global Finance & Treasury',
    head: 'Alistair Kane (Chief Financial Officer)',
    employeesCount: 310,
    riskScore: 24,
    openViolations: 1,
    stabilityIndex: 95,
    teams: ['Investment desk', 'Treasury flow', 'Global audits']
  },
  {
    id: 'dept-soc',
    name: 'Autonomous SOC Operations',
    businessUnit: 'Cyber Defense & Security',
    head: 'Viktor Thorne (Chief Security Officer)',
    employeesCount: 2150,
    riskScore: 48,
    openViolations: 2,
    stabilityIndex: 89,
    teams: ['Incident Containment', 'Threat Hunting', 'Malware Forensics', 'Heuristics Audit']
  },
  {
    id: 'dept-intel',
    name: 'Cyber Threat Intelligence',
    businessUnit: 'Cyber Defense & Security',
    head: 'Katarina Petrov (Director of Intel)',
    employeesCount: 1200,
    riskScore: 29,
    openViolations: 1,
    stabilityIndex: 95,
    teams: ['Campaign Attribution', 'Zero-Day Research', 'Threat Feed Synthesizer']
  },
  {
    id: 'dept-heuristics',
    name: 'Applied Neural Intelligence',
    businessUnit: 'Research & Advanced Intelligence',
    head: 'Dr. Evelyn Stark (Head of AI Research)',
    employeesCount: 780,
    riskScore: 26,
    openViolations: 2,
    stabilityIndex: 97,
    teams: ['Generative Forensics', 'SIR Epistemic Models', 'Gemini Operations Tuning']
  }
];

// -----------------------------------------------------------------------------
// APPLICATIONS
// -----------------------------------------------------------------------------
export const APPLICATIONS: EnterpriseApplication[] = [
  {
    id: 'app-ingress-portal',
    name: 'SentinelX Core Gateway Ingress',
    owner: 'Viktor Thorne',
    usersCount: 82142,
    dependencies: ['app-iam-directory', 'app-risk-auditor'],
    connectedDatabases: ['db-ingress-ledger'],
    riskLevel: 'critical',
    operationalHealth: 99.4,
    governanceStatus: 'compliant'
  },
  {
    id: 'app-oracle-exchange',
    name: 'Oracle Matrix Finance Exchange',
    owner: 'Alistair Kane',
    usersCount: 12450,
    dependencies: ['app-iam-directory'],
    connectedDatabases: ['db-ledger-warehouse'],
    riskLevel: 'high',
    operationalHealth: 88.2,
    governanceStatus: 'warning'
  },
  {
    id: 'app-iam-directory',
    name: 'Zero-Trust AD Identity Gateway',
    owner: 'Robert Carter',
    usersCount: 98150,
    dependencies: [],
    connectedDatabases: ['db-active-directory'],
    riskLevel: 'critical',
    operationalHealth: 92.5,
    governanceStatus: 'compliant'
  },
  {
    id: 'app-neural-copilot',
    name: 'Applied AI Cognitive Intelligence Core',
    owner: 'Dr. Evelyn Stark',
    usersCount: 4210,
    dependencies: ['app-ingress-portal', 'app-iam-directory'],
    connectedDatabases: ['db-neural-lake'],
    riskLevel: 'medium',
    operationalHealth: 98.6,
    governanceStatus: 'compliant'
  },
  {
    id: 'app-customer-portal',
    name: 'External Banking Access Client Portal',
    owner: 'Seraphina Vance',
    usersCount: 104500,
    dependencies: ['app-ingress-portal', 'app-iam-directory'],
    connectedDatabases: ['db-customer-pii'],
    riskLevel: 'high',
    operationalHealth: 79.1,
    governanceStatus: 'non-compliant'
  },
  {
    id: 'app-risk-auditor',
    name: 'Enterprise GRC Compliance Ledger',
    owner: 'Donald Vance',
    usersCount: 1800,
    dependencies: ['app-iam-directory'],
    connectedDatabases: ['db-ledger-warehouse'],
    riskLevel: 'low',
    operationalHealth: 95.0,
    governanceStatus: 'compliant'
  },
  {
    id: 'app-wps',
    name: 'Global Workforce Directory & Slack Integration',
    owner: 'Evelyn Sterling',
    usersCount: 102421,
    dependencies: ['app-iam-directory'],
    connectedDatabases: ['db-active-directory'],
    riskLevel: 'low',
    operationalHealth: 97.2,
    governanceStatus: 'compliant'
  }
];

// -----------------------------------------------------------------------------
// DATA ASSETS
// -----------------------------------------------------------------------------
export const DATA_ASSETS: DataAsset[] = [
  {
    id: 'db-ingress-ledger',
    name: 'Core Traffic Ingress Ledger',
    type: 'relational',
    classification: 'Operational Threat Telemetry',
    owner: 'Viktor Thorne',
    sensitivity: 'restricted',
    usageTrend: 'rising',
    accessActivityCount: 15420,
    volumeGb: 12450
  },
  {
    id: 'db-ledger-warehouse',
    name: 'Enterprise Financial Books Warehouse',
    type: 'warehouse',
    classification: 'Corporate Treasury Records',
    owner: 'Alistair Kane',
    sensitivity: 'restricted',
    usageTrend: 'stable',
    accessActivityCount: 4120,
    volumeGb: 48200
  },
  {
    id: 'db-active-directory',
    name: 'IAM Active Directory Core Database',
    type: 'object-storage',
    classification: 'Identity Profiles & Hash Ledger',
    owner: 'Robert Carter',
    sensitivity: 'restricted',
    usageTrend: 'stable',
    accessActivityCount: 124102,
    volumeGb: 840
  },
  {
    id: 'db-neural-lake',
    name: 'Applied Gemini Vector Data Lake',
    type: 'data-lake',
    classification: 'AI Heuristic Weight Logs',
    owner: 'Dr. Evelyn Stark',
    sensitivity: 'confidential',
    usageTrend: 'rising',
    accessActivityCount: 22450,
    volumeGb: 145800
  },
  {
    id: 'db-customer-pii',
    name: 'Customer Profile Account PII',
    type: 'relational',
    classification: 'Client Accounts & Credit Records',
    owner: 'Seraphina Vance',
    sensitivity: 'restricted',
    usageTrend: 'rising',
    accessActivityCount: 44210,
    volumeGb: 8900
  },
  {
    id: 'db-infrastructure-logs',
    name: 'Daemon Monitor System Logs Storage',
    type: 'data-lake',
    classification: 'Server Health Heuristics Logs',
    owner: 'Marcus Aurelius',
    sensitivity: 'internal',
    usageTrend: 'rising',
    accessActivityCount: 98120,
    volumeGb: 341000
  }
];

// -----------------------------------------------------------------------------
// INFRASTRUCTURE NODES
// -----------------------------------------------------------------------------
export const INFRA_NODES: InfraNode[] = [
  {
    id: 'infra-bm-1',
    name: 'On-Prem Core Domain Controller DC01',
    type: 'bare-metal',
    health: 98.4,
    capacityCpu: 42,
    capacityRam: 78,
    utilization: 62.4,
    availability: 99.98,
    provider: 'on-premise',
    region: 'ny-office-basement'
  },
  {
    id: 'infra-vm-aws-1',
    name: 'aws-us-east-proxy-ingress-02',
    type: 'vm',
    health: 99.8,
    capacityCpu: 28,
    capacityRam: 45,
    utilization: 31.5,
    availability: 99.95,
    provider: 'aws',
    region: 'us-east-1'
  },
  {
    id: 'infra-vm-aws-2',
    name: 'aws-eu-west-oracle-host',
    type: 'vm',
    health: 84.2,
    capacityCpu: 82,
    capacityRam: 89,
    utilization: 87.4,
    availability: 98.74,
    provider: 'aws',
    region: 'eu-west-1'
  },
  {
    id: 'infra-k8s-pod-1',
    name: 'gcp-asia-ingress-podx01',
    type: 'k8s-pod',
    health: 100.0,
    capacityCpu: 12,
    capacityRam: 35,
    utilization: 15.2,
    availability: 99.99,
    provider: 'gcp',
    region: 'asia-east1'
  },
  {
    id: 'infra-k8s-pod-2',
    name: 'gcp-asia-ingress-podx02',
    type: 'k8s-pod',
    health: 100.0,
    capacityCpu: 14,
    capacityRam: 33,
    utilization: 16.4,
    availability: 99.99,
    provider: 'gcp',
    region: 'asia-east1'
  },
  {
    id: 'infra-container-azure-1',
    name: 'azure-seal-customer-docker-14',
    type: 'container',
    health: 74.5,
    capacityCpu: 91,
    capacityRam: 96,
    utilization: 94.2,
    availability: 99.12,
    provider: 'azure',
    region: 'westeurope'
  },
  {
    id: 'infra-router-1',
    name: 'Zero-Trust Border Router CoreGW-01',
    type: 'router',
    health: 99.9,
    capacityCpu: 35,
    capacityRam: 42,
    utilization: 39.4,
    availability: 99.999,
    provider: 'on-premise',
    region: 'palo-alto-datacenter'
  },
  {
    id: 'infra-switch-db',
    name: 'Autonomous High-Throughput DB Switch-04',
    type: 'switch',
    health: 97.4,
    capacityCpu: 52,
    capacityRam: 58,
    utilization: 55.0,
    availability: 99.95,
    provider: 'on-premise',
    region: 'palo-alto-datacenter'
  }
];

// -----------------------------------------------------------------------------
// GOVERNANCE VIOLATIONS
// -----------------------------------------------------------------------------
export const GOVERNANCE_VIOLATIONS: GovernanceViolation[] = [
  {
    id: 'gov-01',
    title: 'Public S3 Bucket Leak Risk Detected',
    severity: 'critical',
    department: 'Legal & Governance',
    ruleViolated: 'Asset Containment Directive v12 (No Public S3 Buckets allowed)',
    detectedAt: '2026-05-30T10:42:01Z',
    assignedTo: 'Robert Carter',
    status: 'investigating'
  },
  {
    id: 'gov-02',
    title: 'Highly-Sensitive Database accessed from non-VPN subnet',
    severity: 'high',
    department: 'Autonomous SOC Operations',
    ruleViolated: 'Secure Topology Ring Regulation (Zero-Trust Outer Firewalls)',
    detectedAt: '2026-05-29T14:12:35Z',
    assignedTo: 'Viktor Thorne',
    status: 'open'
  },
  {
    id: 'gov-03',
    title: 'Non-compliant Client Web Container Utilization Spikes',
    severity: 'medium',
    department: 'Cloud Operations & DevOps',
    ruleViolated: 'Capacity Envelope Allocation v4 (Container limits exceeded)',
    detectedAt: '2026-05-31T08:00:12Z',
    assignedTo: 'Marcus Aurelius',
    status: 'mitigated'
  },
  {
    id: 'gov-04',
    title: 'Orphaned Administration Access Credentials Detected',
    severity: 'high',
    department: 'Identity & Access Control',
    ruleViolated: 'Identity Lifecycle Pruning Standard (180day credential rotation)',
    detectedAt: '2026-05-30T18:22:45Z',
    assignedTo: 'Robert Carter',
    status: 'open'
  }
];

// -----------------------------------------------------------------------------
// CLOUD REGIONS COST & STATS
// -----------------------------------------------------------------------------
export const CLOUD_REGIONS_STATS: CloudRegionStats[] = [
  {
    provider: 'aws',
    region: 'us-east-1 (N. Virginia)',
    instancesCount: 1450,
    healthyCount: 1448,
    monthlyCost: 284500,
    identitySystemCount: 4,
    networkThroughputGb: 12450
  },
  {
    provider: 'aws',
    region: 'eu-west-1 (Ireland)',
    instancesCount: 820,
    healthyCount: 812,
    monthlyCost: 165000,
    identitySystemCount: 2,
    networkThroughputGb: 6100
  },
  {
    provider: 'gcp',
    region: 'asia-east1 (Taiwan)',
    instancesCount: 1890,
    healthyCount: 1890,
    monthlyCost: 312000,
    identitySystemCount: 6,
    networkThroughputGb: 19412
  },
  {
    provider: 'gcp',
    region: 'us-central1 (Iowa)',
    instancesCount: 1120,
    healthyCount: 1115,
    monthlyCost: 198000,
    identitySystemCount: 3,
    networkThroughputGb: 11200
  },
  {
    provider: 'azure',
    region: 'westeurope (Amsterdam)',
    instancesCount: 640,
    healthyCount: 625,
    monthlyCost: 142000,
    identitySystemCount: 2,
    networkThroughputGb: 4820
  }
];

// -----------------------------------------------------------------------------
// HIGH INTENSITIES OVERALL STATS
// -----------------------------------------------------------------------------
export const INITIAL_ENTERPRISE_STATS: EnterpriseStats = {
  employeesCount: 102451,
  departmentsCount: 10,
  applicationsCount: 7,
  databasesCount: 6,
  serversCount: 8,
  cloudResourcesCount: 5920,
  devicesCount: 204910,
  criticalAssetsCount: 4,
  
  healthScore: 94,
  stabilityIndex: 93.8,
  governanceScore: 89,
  complianceScore: 88.5,
  riskIndex: 22,
  infraHealth: 91.2,
  workforceIntelIndex: 98.2,
  digitalTrustIndex: 96.5
};

// -----------------------------------------------------------------------------
// PREFERRED NAMES FOR EMPLOYEES TO POPULATE HIGH QUALITY 100 RECORDS
// -----------------------------------------------------------------------------
const TYPICAL_FIRST_NAMES = [
  'Emma', 'Oliver', 'Amelia', 'Sophia', 'Thomas', 'Grace', 'Benjamin', 'John', 'Sarah', 'Rachel',
  'David', 'James', 'Katarina', 'Robert', 'Diana', 'Viktor', 'Alistair', 'Seraphina', 'Evelyn', 'Marcus',
  'Leo', 'Julian', 'Isabella', 'Charlotte', 'Theodore', 'Alexander', 'Elena', 'Lucas', 'Daniel', 'Victoria',
  'Aaron', 'Fiona', 'Nathan', 'Chloe', 'Arthur', 'Gavin', 'Nora', 'Stella', 'Adrian', 'Beatrice',
  'Silas', 'Owen', 'Iris', 'Felix', 'Zara', 'Clara', 'Jasper', 'Louis', 'Cora', 'Matilda'
];

const TYPICAL_LAST_NAMES = [
  'Vance', 'Aurelius', 'Prince', 'Thorne', 'Kane', 'Sterling', 'Carter', 'Petrov', 'Stark', 'Kane',
  'Foster', 'Mercer', 'Wade', 'Bennett', 'Russo', 'Lovelace', 'Curie', 'Boyle', 'Hawking', 'Fleming',
  'Gibbs', 'Sloane', 'Sinclair', 'Gatsby', 'Finch', 'Darcy', 'Eyre', 'Rochester', 'Keats', 'Shelley',
  'Byron', 'Tennyson', 'Wilde', 'Orwell', 'Huxley', 'Turing', 'Shannon', 'Hamilton', 'Ride', 'Jemison',
  'Aldrin', 'Armstrong', 'Collins', 'Glenn', 'Shepard', 'Lovell', 'Webb', 'Sagan', 'Tyson', 'Nye'
];

const TYPICAL_ROLES: { [deptId: string]: string[] } = {
  'dept-exec': ['Chief Strategy Officer', 'Executive Liaison', 'VP Global Policy', 'Chief Communications Officer', 'Chief of Staff'],
  'dept-legal': ['Senior Compliance Officer', 'Governance Specialist', 'GDPR Auditor', 'Trade Legal Counsel', 'Risk Assessor'],
  'dept-cloud': ['Senior DevOps Kubernetes Architect', 'Platform Site Reliability Engineer', 'Cloud Network Engineer', 'IAC Automation SRE'],
  'dept-database': ['Data Lake Solutions Architect', 'Senior PostgreSQL DBA', 'Warehouse Query Optimizer', 'NoSQL Storage Engineer'],
  'dept-recruitment': ['IAM Privilege Assessor', 'Workforce Analyst', 'Global Talent Lead', 'Corporate Onboarding Specialist'],
  'dept-iam': ['Zero-Trust Policy Administrator', 'Okta Systems Integrator', 'Privilege Lifecycle Engineer', 'Active Directory SRE'],
  'dept-treasury': ['Capital Allocation Auditor', 'Global Currency Strategist', 'Internal Treasury Controller', 'Financial Risk Officer'],
  'dept-soc': ['Lead Threat Containment Officer', 'Autonomic SOC Controller', 'Senior Malware Forensics Analyst', 'Threat Hunter Tier III'],
  'dept-intel': ['Nation-State Campaign Attributer', 'Zero-Day Exploitation Assessor', 'Advanced Attack Graph Modeler'],
  'dept-heuristics': ['Senior NLP Diagnostics Expert', 'Heuristics SIR Model Analyst', 'Google Gemini Operations SRE']
};

const TYPICAL_LOCATIONS = [
  'Palo Alto Main HQ', 'New York Financial Sector', 'London City Hub', 'Tokyo Research Center', 'Munich Cyber Node',
  'Singapore Gateway Node', 'Dublin Cloud Base', 'Sydney Regional Post'
];

const ACCESS_RIGHTS_POOL = [
  'AWS_ADMIN', 'IAM_SUPERUSER', 'PG_WRITE_LEGAL', 'K8S_PROD_ROOT', 'ZERO_TRUST_INGRESS_OVERRIDE',
  'CUSTOMER_PII_DECRYPT', 'TREASURY_GATEWAY_SIGNER', 'GEMINI_RAW_VECTOR_MODIFIER', 'ROOT_CLI_ACCESS'
];

// Helper to deterministic pseudo-random numbers based on employee ID seed
const seededRandom = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(Math.sin(hash)) * 1000 % 1;
};

// -----------------------------------------------------------------------------
// DYNAMIC 100,000+ VIRTUALIZATION GENERATION AND SEARCH ENGINE
// -----------------------------------------------------------------------------

// We hardcode 100 high-fidelity top executives and professionals to provide immediate, ultra-rich details,
// and synthesize any of the remaining 99,901 records deterministically based on employee ID / search strings on-the-fly.
// This gives the exact performance and storage scale of 100,000+ items without consuming actual operational memory!
export const STATIC_CORE_EMPLOYEES: Employee[] = [
  {
    id: "EMP-000001",
    name: "Seraphina Vance",
    role: "Chief Executive Officer (CEO)",
    department: "Executive Strategy",
    businessUnit: "Executive Operations",
    manager: "None (Board of Directors)",
    location: "Palo Alto Main HQ",
    devices: ["CEO-SecurePhone-01", "CEO-TitanBook-Mac", "CEO-AirTablet"],
    applicationsUsed: ["SentinelX Core Gateway Ingress", "External Banking Access Client Portal", "Enterprise GRC Compliance Ledger"],
    accessRights: ["AWS_ADMIN", "IAM_SUPERUSER", "ZERO_TRUST_INGRESS_OVERRIDE", "CUSTOMER_PII_DECRYPT", "TREASURY_GATEWAY_SIGNER"],
    trustScore: 99,
    riskScore: 2,
    activityStatus: "active"
  },
  {
    id: "EMP-000002",
    name: "Viktor Thorne",
    role: "Chief Security Officer (CSO)",
    department: "Autonomous SOC Operations",
    businessUnit: "Cyber Defense & Security",
    manager: "Seraphina Vance",
    location: "Palo Alto Main HQ",
    devices: ["SOC-Thorne-Cons-01", "SOC-Thorne-Laptop"],
    applicationsUsed: ["SentinelX Core Gateway Ingress", "Zero-Trust AD Identity Gateway", "Applied AI Cognitive Intelligence Core"],
    accessRights: ["ZERO_TRUST_INGRESS_OVERRIDE", "ROOT_CLI_ACCESS", "IAM_SUPERUSER"],
    trustScore: 98,
    riskScore: 11,
    activityStatus: "active"
  },
  {
    id: "EMP-000003",
    name: "Dr. Evelyn Stark",
    role: "Head of AI Research",
    department: "Applied Neural Intelligence",
    businessUnit: "Research & Advanced Intelligence",
    manager: "Seraphina Vance",
    location: "Tokyo Research Center",
    devices: ["AI-Stark-SuperServer", "AI-Stark-Notebook"],
    applicationsUsed: ["Applied AI Cognitive Intelligence Core", "SentinelX Core Gateway Ingress"],
    accessRights: ["GEMINI_RAW_VECTOR_MODIFIER", "ROOT_CLI_ACCESS"],
    trustScore: 97,
    riskScore: 8,
    activityStatus: "active"
  },
  {
    id: "EMP-000004",
    name: "Alistair Kane",
    role: "Chief Financial Officer (CFO)",
    department: "Corporate Finance & Allocations",
    businessUnit: "Global Finance & Treasury",
    manager: "Seraphina Vance",
    location: "New York Financial Sector",
    devices: ["FIN-Kane-Term-01", "FIN-Kane-SecStore"],
    applicationsUsed: ["Oracle Matrix Finance Exchange", "Enterprise GRC Compliance Ledger"],
    accessRights: ["TREASURY_GATEWAY_SIGNER", "PG_WRITE_LEGAL"],
    trustScore: 96,
    riskScore: 6,
    activityStatus: "active"
  },
  {
    id: "EMP-000005",
    name: "Robert Carter",
    role: "Director of Identity",
    department: "Identity & Access Control",
    businessUnit: "Human Capital & IAM",
    manager: "Evelyn Sterling",
    location: "Dublin Cloud Base",
    devices: ["IAM-Carter-Station", "IAM-Carter-Token"],
    applicationsUsed: ["Zero-Trust AD Identity Gateway", "Global Workforce Directory & Slack Integration"],
    accessRights: ["IAM_SUPERUSER", "AWS_ADMIN"],
    trustScore: 85,
    riskScore: 45,
    activityStatus: "active"
  }
];

// Initialize remaining deterministic employees up to 120 key static records to populate visual lists
for (let i = 6; i <= 150; i++) {
  const seed = `EMP-${String(i).padStart(6, '0')}`;
  const rIdxFN = Math.floor(seededRandom(seed + 'fname') * TYPICAL_FIRST_NAMES.length);
  const rIdxLN = Math.floor(seededRandom(seed + 'lname') * TYPICAL_LAST_NAMES.length);
  const fName = TYPICAL_FIRST_NAMES[rIdxFN];
  const lName = TYPICAL_LAST_NAMES[rIdxLN];
  
  const deptIdx = Math.floor(seededRandom(seed + 'dept') * DEPARTMENTS.length);
  const dept = DEPARTMENTS[deptIdx];
  
  const rolePool = TYPICAL_ROLES[dept.id] || ['Principal Operations Associate'];
  const roleIdx = Math.floor(seededRandom(seed + 'role') * rolePool.length);
  const role = rolePool[roleIdx];
  
  const locIdx = Math.floor(seededRandom(seed + 'loc') * TYPICAL_LOCATIONS.length);
  const location = TYPICAL_LOCATIONS[locIdx];
  
  const trustScore = Math.floor(seededRandom(seed + 'trust') * 40) + 60; // 60 - 100
  const riskScore = Math.floor(seededRandom(seed + 'risk') * 70); // 0 - 70
  
  // manager
  let manager = 'Seraphina Vance';
  if (dept.id === 'dept-cloud' || dept.id === 'dept-database') manager = 'Marcus Aurelius';
  else if (dept.id === 'dept-recruitment' || dept.id === 'dept-iam') manager = 'Evelyn Sterling';
  else if (dept.id === 'dept-treasury') manager = 'Alistair Kane';
  else if (dept.id === 'dept-soc' || dept.id === 'dept-intel') manager = 'Viktor Thorne';
  else if (dept.id === 'dept-heuristics') manager = 'Dr. Evelyn Stark';
  else if (dept.id === 'dept-legal') manager = 'Donald Vance';

  const apps = APPLICATIONS.filter(a => a.owner === manager || seededRandom(seed + a.id) > 0.52).map(a => a.name);
  const accessRights = ACCESS_RIGHTS_POOL.filter(ar => seededRandom(seed + ar) > 0.85);
  
  STATIC_CORE_EMPLOYEES.push({
    id: seed,
    name: `${fName} ${lName}`,
    role,
    department: dept.name,
    businessUnit: dept.businessUnit,
    manager,
    location,
    devices: [`${seed}-Device-A`, `${seed}-Mobile`],
    applicationsUsed: apps.length > 0 ? apps : ["Global Workforce Directory & Slack Integration"],
    accessRights,
    trustScore,
    riskScore,
    activityStatus: seededRandom(seed + 'status') > 0.95 ? 'idle' : seededRandom(seed + 'status') > 0.98 ? 'suspended' : 'active'
  });
}

// Deterministically resolves ANY employee dynamically up to 100,000+ indexed IDs.
// This provides genuine infinite list capabilities without memory load!
export const getEmployeeDataById = (empId: string): Employee => {
  // Check static list first
  const existing = STATIC_CORE_EMPLOYEES.find(e => e.id === empId);
  if (existing) return existing;

  // Synthesize mathematically and deterministically
  const numericId = parseInt(empId.replace('EMP-', '')) || 998;
  const seed = empId;
  const rIdxFN = Math.floor(seededRandom(seed + 'fname1') * TYPICAL_FIRST_NAMES.length);
  const rIdxLN = Math.floor(seededRandom(seed + 'lname1') * TYPICAL_LAST_NAMES.length);
  const fName = TYPICAL_FIRST_NAMES[rIdxFN];
  const lName = TYPICAL_LAST_NAMES[rIdxLN];
  
  const deptIdx = Math.floor(seededRandom(seed + 'dept1') * DEPARTMENTS.length);
  const dept = DEPARTMENTS[deptIdx];
  const rolePool = TYPICAL_ROLES[dept.id] || ['Operational Mesh Analyst'];
  const roleIdx = Math.floor(seededRandom(seed + 'role1') * rolePool.length);
  const role = rolePool[roleIdx];
  const locIdx = Math.floor(seededRandom(seed + 'loc1') * TYPICAL_LOCATIONS.length);
  const location = TYPICAL_LOCATIONS[locIdx];
  
  const trustScore = Math.floor(seededRandom(seed + 'trust1') * 45) + 55; // 55 - 100
  const riskScore = Math.round(100 - trustScore + (seededRandom(seed + 'variance') * 15));
  
  let manager = 'Viktor Thorne';
  if (dept.id === 'dept-cloud') manager = 'Marcus Aurelius';
  else if (dept.id === 'dept-recruitment') manager = 'Evelyn Sterling';

  const rights = ACCESS_RIGHTS_POOL.filter(ar => seededRandom(seed + ar + 'acc') > 0.82);

  return {
    id: empId,
    name: `${fName} ${lName}`,
    role,
    department: dept.name,
    businessUnit: dept.businessUnit,
    manager,
    location,
    devices: [`${empId}-Workspace`, `${empId}-MobileY`],
    applicationsUsed: ["Global Workforce Directory & Slack Integration", "SentinelX Core Gateway Ingress"],
    accessRights: rights,
    trustScore: Math.min(100, Math.max(0, trustScore)),
    riskScore: Math.min(100, Math.max(0, riskScore)),
    activityStatus: seededRandom(seed + 'acts') > 0.8 ? 'idle' : 'active'
  };
};

/**
 * High performance search mapping that handles search queries and paging
 * over 100,000+ virtual records beautifully.
 */
export const queryVirtualEmployees = (
  searchQuery: string,
  filters: { department?: string; businessUnit?: string; status?: string; maxRisk?: number },
  page: number = 0,
  pageSize: number = 20
): { employees: Employee[]; totalMatches: number } => {
  // Filter core list
  const filteredCore = STATIC_CORE_EMPLOYEES.filter(e => {
    if (filters.department && e.department !== filters.department) return false;
    if (filters.businessUnit && e.businessUnit !== filters.businessUnit) return false;
    if (filters.status && e.activityStatus !== filters.status) return false;
    if (filters.maxRisk && e.riskScore > filters.maxRisk) return false;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = e.name.toLowerCase().includes(q) || 
                    e.id.toLowerCase().includes(q) || 
                    e.role.toLowerCase().includes(q) ||
                    e.location.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Calculate total virtual results length
  // (We blow up the total match count mathematically to represent the 100,000 enterprise scale
  // and dynamically create virtualized matching records the user can scan through).
  let scaleFactor = 1;
  if (!filters.department && !filters.businessUnit && !searchQuery) {
    scaleFactor = 100000 / STATIC_CORE_EMPLOYEES.length; // 100,000 records virtual scale
  } else if (searchQuery) {
    scaleFactor = 25; // Synthesize up to 25x matches to show high efficiency virtualization
  } else {
    scaleFactor = 150; // Business unit filters show thousands of employees
  }

  const totalMatches = Math.round(filteredCore.length * scaleFactor);
  
  // Resolve page slices
  const pagesStartIdx = page * pageSize;
  const matchedSlice: Employee[] = [];

  for (let i = 0; i < pageSize; i++) {
    const globalIdx = pagesStartIdx + i;
    if (globalIdx >= totalMatches) break;

    // Map globalIdx into deterministic seeded employee
    const coreListIdx = globalIdx % filteredCore.length;
    const baseEmp = filteredCore[coreListIdx];
    
    if (globalIdx < filteredCore.length) {
      matchedSlice.push(baseEmp);
    } else {
      // Synthesize a cousin employee deterministically
      const virtualId = `EMP-${String(10000 + globalIdx).padStart(6, '0')}`;
      matchedSlice.push(getEmployeeDataById(virtualId));
    }
  }

  return {
    employees: matchedSlice,
    totalMatches
  };
};

// -----------------------------------------------------------------------------
// DYNAMIC AI ASSISTANT INTELLIGENCE COPILOT QUERIES RESPONSES
// -----------------------------------------------------------------------------
export const processExecutiveCopilotQuery = (query: string): { 
  type: 'department-risk' | 'asset-access' | 'app-dependency' | 'governance-violations' | 'unrecognized';
  summary: string;
  chartsData: any[];
  visualComponentType: string;
} => {
  const q = query.toLowerCase();

  if (q.includes('risk') || q.includes('department') || q.includes('rising')) {
    return {
      type: 'department-risk',
      summary: 'AUTONOMIC THREAT SWEEP REPORT: Identified 3 business units exhibiting elevated risk score vectors. Identity and Access Control (dept-iam) remains at maximum compliance escalation (Risk Score: 56) due to 7 open privilege lease violations, followed closely by Data Storage Engineering (Risk Score: 42) with unregistered object-storage attachments in AWS us-east region.',
      chartsData: DEPARTMENTS.map(d => ({ name: d.name, risk: d.riskScore, violations: d.openViolations })),
      visualComponentType: 'RISK_MATRIX'
    };
  }

  if (q.includes('access') || q.includes('asset') || q.includes('sensitive') || q.includes('frequently')) {
    return {
      type: 'asset-access',
      summary: 'ACCESS AUDIT INDEX: "Core Profile Account PII" is currently accessed most frequently, registering 44,210 requests inside this billing iteration. Peak credential pulls are attributed to "External Banking Access Client Portal", accounting for 72.4% of total traffic. Legal Oversight triggers alarms since 124 requests bypassed VPN gateways (Refer to Incident Center Gov-02).',
      chartsData: DATA_ASSETS.map(d => ({ name: d.name, activity: d.accessActivityCount, usage: d.usageTrend === 'rising' ? 80 : 35 })),
      visualComponentType: 'DATA_FLOW_MAP'
    };
  }

  if (q.includes('application') || q.includes('dependency') || q.includes('highest')) {
    return {
      type: 'app-dependency',
      summary: 'ORGANIZATIONAL DEPENDENCY SYNTHESIS: "Zero-Trust AD Identity Gateway (app-iam-directory)" holds critical dependency vectors. Modern platform maps track 98,150 active routing handshakes across 4 secondary databases and the entire Workforce Directory Suite. System failure in this node would isolate 92.4% of corporate resources inside 180 seconds.',
      chartsData: APPLICATIONS.map(a => ({ name: a.name.split(' ')[0], deps: a.dependencies.length, users: a.usersCount / 1000 })),
      visualComponentType: 'DEPENDENCY_GRID'
    };
  }

  if (q.includes('governance') || q.includes('violation')) {
    return {
      type: 'governance-violations',
      summary: 'GOVERNANCE AUDIT LEDGER: Policy infractions increased 15% this quarter, primarily driven by AWS public endpoint leaks and legacy AD token drift. 2 Critical and 1 High threat violations remain active across Cloud SRE and Identity Teams. Estimated incident mitigation velocity averages 12.4 hours.',
      chartsData: GOVERNANCE_VIOLATIONS.map((g, idx) => ({ name: `INF-${idx+1}`, level: g.severity === 'critical' ? 90 : g.severity === 'high' ? 65 : 40, status: g.status })),
      visualComponentType: 'VIOLATION_LEDGER'
    };
  }

  return {
    type: 'unrecognized',
    summary: `COGNITIVE HEURISTICS REDIRECT: Evaluated command request: "${query}". Did not map to hardcoded audit parameters. However, scanning active enterprise twin state: Platform integrity remains robust at 94.2% with 0 active network intrusions and 1 active S3 leak investigation. What metrics should I synthesize for you?`,
    chartsData: [
      { name: 'POSTURE_STABLE', value: 94 },
      { name: 'INFRA_HEALTH', value: 91.2 },
      { name: 'ZERO_TRUST', value: 98 }
    ],
    visualComponentType: 'KPI_CIRCLES'
  };
};
