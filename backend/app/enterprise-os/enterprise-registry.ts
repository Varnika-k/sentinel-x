import { EnterpriseOSRegistry, EnterpriseEntityNode } from './types';

export class EnterpriseRegistry {
  private static instance: EnterpriseRegistry;
  private registry: EnterpriseOSRegistry = { nodes: [], edges: [] };

  private constructor() {
    this.initializeTopology();
  }

  public static getInstance(): EnterpriseRegistry {
    if (!EnterpriseRegistry.instance) {
      EnterpriseRegistry.instance = new EnterpriseRegistry();
    }
    return EnterpriseRegistry.instance;
  }

  private initializeTopology() {
    // 1. Business Units & Departments
    const bus: EnterpriseEntityNode[] = [
      { id: 'bu-hr', type: 'bu', name: 'Human Resource Operations', owner: 'Sarah Jenkins', status: 'nominal', riskScore: 12 },
      { id: 'bu-finance', type: 'bu', name: 'Global Finance & treasury', owner: 'Richard Cole', status: 'nominal', riskScore: 18 },
      { id: 'bu-cust', type: 'bu', name: 'Customer Logistics & Delivery', owner: 'Clara Oswald', status: 'nominal', riskScore: 25 }
    ];

    const depts: EnterpriseEntityNode[] = [
      { id: 'dept-payroll', type: 'department', name: 'Payroll & Compensation', owner: 'Evan Wright', status: 'nominal', riskScore: 78, parentEntityId: 'bu-hr' },
      { id: 'dept-procure', type: 'department', name: 'Global Procurement', owner: 'Marcus Aurelius', status: 'nominal', riskScore: 15, parentEntityId: 'bu-finance' },
      { id: 'dept-ops', type: 'department', name: 'Logistics Fleet', owner: 'Clara Oswald', status: 'nominal', riskScore: 22, parentEntityId: 'bu-cust' }
    ];

    // 2. Teams
    const teams: EnterpriseEntityNode[] = [
      { id: 'team-payroll-ops', type: 'team', name: 'Payroll Operations Team', owner: 'Evan Wright', status: 'nominal', riskScore: 75, parentEntityId: 'dept-payroll' },
      { id: 'team-audit', type: 'team', name: 'Treasury Audit Team', owner: 'Alan Turing', status: 'nominal', riskScore: 10, parentEntityId: 'dept-procure' }
    ];

    // 3. Employees (People)
    const employees: EnterpriseEntityNode[] = [
      { id: 'usr-wright', type: 'employee', name: 'Evan Wright', owner: 'Sarah Jenkins', status: 'nominal', riskScore: 82, parentEntityId: 'team-payroll-ops' },
      { id: 'usr-alan', type: 'employee', name: 'Alan Turing', owner: 'Marcus Aurelius', status: 'nominal', riskScore: 5, parentEntityId: 'team-audit' }
    ];

    // 4. Applications & Services
    const applications: EnterpriseEntityNode[] = [
      { id: 'app-payroll', type: 'application', name: 'Enterprise Payroll Portal', owner: 'Evan Wright', status: 'nominal', riskScore: 80, parentEntityId: 'team-payroll-ops' },
      { id: 'app-procurement', type: 'application', name: 'Oracle Treasury ERP', owner: 'Alan Turing', status: 'nominal', riskScore: 20, parentEntityId: 'team-audit' }
    ];

    // 5. Databases
    const databases: EnterpriseEntityNode[] = [
      { id: 'payroll-db', type: 'database', name: 'Payroll Core Master Database', owner: 'Sarah Jenkins', status: 'nominal', riskScore: 85, parentEntityId: 'app-payroll' },
      { id: 'procure-db', type: 'database', name: 'Procurement Transaction DB', owner: 'Richard Cole', status: 'nominal', riskScore: 15, parentEntityId: 'app-procurement' }
    ];

    // 6. Infrastructure & Clusters
    const infra: EnterpriseEntityNode[] = [
      { id: 'k8s-svc-ingress-nginx', type: 'infrastructure', name: 'Admin Edge Gateway Ingress', owner: 'Marcus Aurelius', status: 'nominal', riskScore: 35 },
      { id: 'k8s-pod-payroll-auth', type: 'infrastructure', name: 'Payroll Authentication Pod', owner: 'Evan Wright', status: 'nominal', riskScore: 65, parentEntityId: 'app-payroll' }
    ];

    // 7. Cloud Resources
    const cloud: EnterpriseEntityNode[] = [
      { id: 'aws-s3-payroll-snapshots', type: 'cloud', name: 'Secure Payroll Backup S3 bucket', owner: 'Sarah Jenkins', status: 'nominal', riskScore: 90, parentEntityId: 'payroll-db' },
      { id: 'gcp-sql-financial-reconcile', type: 'cloud', name: 'Cloud SQL Corporate Ledger', owner: 'Richard Cole', status: 'nominal', riskScore: 10, parentEntityId: 'procure-db' }
    ];

    // 8. Business Operations
    const bizOps: EnterpriseEntityNode[] = [
      { id: 'biz-op-distribution', type: 'business_operation', name: 'Direct Deposit Account Settlement', owner: 'Sarah Jenkins', status: 'nominal', riskScore: 92 },
      { id: 'biz-op-balancing', type: 'business_operation', name: 'Treasury Cashflow Margin Allocation', owner: 'Richard Cole', status: 'nominal', riskScore: 15 }
    ];

    // Load nodes
    this.registry.nodes.push(
      ...bus, ...depts, ...teams, ...employees, ...applications, ...databases, ...infra, ...cloud, ...bizOps
    );

    // Build standard edges mapping: People -> Teams -> Depts -> BUs -> Apps -> DBs -> Infra -> Cloud -> Biz operations
    this.registry.edges = [
      { source: 'usr-wright', target: 'team-payroll-ops', relationship: 'MEMBER_OF' },
      { source: 'usr-alan', target: 'team-audit', relationship: 'MEMBER_OF' },
      { source: 'team-payroll-ops', target: 'dept-payroll', relationship: 'REPORTS_TO' },
      { source: 'team-audit', target: 'dept-procure', relationship: 'REPORTS_TO' },
      { source: 'dept-payroll', target: 'bu-hr', relationship: 'PART_OF' },
      { source: 'dept-procure', target: 'bu-finance', relationship: 'PART_OF' },
      { source: 'dept-ops', target: 'bu-cust', relationship: 'PART_OF' },

      // BUs to Applications
      { source: 'bu-hr', target: 'app-payroll', relationship: 'OWNER_OF' },
      { source: 'bu-finance', target: 'app-procurement', relationship: 'OWNER_OF' },

      // Applications to Databases
      { source: 'app-payroll', target: 'payroll-db', relationship: 'READ_WRITE' },
      { source: 'app-procurement', target: 'procure-db', relationship: 'READ_WRITE' },

      // Databases to Infrastructure
      { source: 'payroll-db', target: 'k8s-pod-payroll-auth', relationship: 'BACKED_BY' },
      { source: 'procure-db', target: 'k8s-svc-ingress-nginx', relationship: 'COMMUNICATES' },

      // Infrastructure to Cloud Resources
      { source: 'k8s-pod-payroll-auth', target: 'aws-s3-payroll-snapshots', relationship: 'REPLICATES' },
      { source: 'k8s-svc-ingress-nginx', target: 'gcp-sql-financial-reconcile', relationship: 'EXTERNAL_ROUTE' },

      // Cloud Resources to Business Operations
      { source: 'aws-s3-payroll-snapshots', target: 'biz-op-distribution', relationship: 'REQUISITE_FOR' },
      { source: 'gcp-sql-financial-reconcile', target: 'biz-op-balancing', relationship: 'SUPPORTED_BY' }
    ];
  }

  public getRegistry(): EnterpriseOSRegistry {
    return this.registry;
  }

  public getNodeById(id: string): EnterpriseEntityNode | undefined {
    return this.registry.nodes.find(n => n.id === id);
  }

  public getEdgesForNode(nodeId: string) {
    return this.registry.edges.filter(e => e.source === nodeId || e.target === nodeId);
  }
}

export const enterpriseRegistry = EnterpriseRegistry.getInstance();
