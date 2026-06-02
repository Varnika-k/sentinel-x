export interface EnterpriseEntity {
  id: string;
  name: string;
  type: 'employee' | 'department' | 'application' | 'database' | 'infrastructure' | 'business_function' | 'governance' | 'identity' | 'telemetry';
  status: 'nominal' | 'degraded' | 'disabled';
  owner?: string;
  location?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  revenuePerHr?: number; // for business functions
  recoveryTimeHrs?: number; // default recovery time
}

export interface DependencyLink {
  from: string; // The dependent node (e.g. App depends on DB)
  to: string;   // The node depended upon (e.g. DB)
  strength: 'hard' | 'soft'; // soft dependencies degrade, hard dependencies disable
}

export class DependencySimulator {
  private entities: Map<string, EnterpriseEntity> = new Map();
  private links: DependencyLink[] = [];

  constructor() {
    this.initializeBaseline();
  }

  private initializeBaseline() {
    // 1. Departments
    const depts: EnterpriseEntity[] = [
      { id: 'dept-eng', name: 'Engineering & DevOps', type: 'department', status: 'nominal', criticality: 'high' },
      { id: 'dept-finance', name: 'Finance & Accounts', type: 'department', status: 'nominal', criticality: 'high' },
      { id: 'dept-ops', name: 'IT Infrastructure Operations', type: 'department', status: 'nominal', criticality: 'critical' },
      { id: 'dept-legal', name: 'Legal, Risk & Compliance', type: 'department', status: 'nominal', criticality: 'medium' },
      { id: 'dept-sales', name: 'Revenue Operations & Sales', type: 'department', status: 'nominal', criticality: 'medium' },
      { id: 'dept-support', name: 'Global Technical Support', type: 'department', status: 'nominal', criticality: 'high' },
    ];

    // 2. Employees
    const emps: EnterpriseEntity[] = [
      { id: 'emp-cto', name: 'Sarah Jenkins (CTO)', type: 'employee', status: 'nominal', criticality: 'critical', owner: 'dept-eng' },
      { id: 'emp-ciso', name: 'Marcus Vance (CISO)', type: 'employee', status: 'nominal', criticality: 'critical', owner: 'dept-legal' },
      { id: 'emp-devops-lead', name: 'Dmitry Petrov (Principal DevOps Arch)', type: 'employee', status: 'nominal', criticality: 'critical', owner: 'dept-eng' },
      { id: 'emp-compl-officer', name: 'Helen Carter (Compl Officer)', type: 'employee', status: 'nominal', criticality: 'high', owner: 'dept-legal' },
      { id: 'emp-sre-lead', name: 'Alex Chen (Lead SRE)', type: 'employee', status: 'nominal', criticality: 'high', owner: 'dept-ops' },
      { id: 'emp-support-dir', name: 'Niko Bellic (Global Support Director)', type: 'employee', status: 'nominal', criticality: 'medium', owner: 'dept-support' }
    ];

    // 3. Infrastructure & Cloud Resources
    const infra: EnterpriseEntity[] = [
      { id: 'infra-aws-region-1', name: 'AWS Cloud us-east-1 (Primary)', type: 'infrastructure', status: 'nominal', criticality: 'critical', location: 'Northern Virginia, USA' },
      { id: 'infra-aws-region-2', name: 'AWS Cloud us-west-2 (Dr / Failover)', type: 'infrastructure', status: 'nominal', criticality: 'high', location: 'Oregon, USA' },
      { id: 'infra-k8s-cluster', name: 'EKS Production Kubernetes Cluster', type: 'infrastructure', status: 'nominal', criticality: 'critical', location: 'infra-aws-region-1' },
      { id: 'infra-azure-ad', name: 'Azure AD Federated Directory Service', type: 'infrastructure', status: 'nominal', criticality: 'critical', location: 'Global Azure' },
      { id: 'infra-border-router', name: 'Boundary core multi-gigabit routing link', type: 'infrastructure', status: 'nominal', criticality: 'high', location: 'Corp HQ Data Center' }
    ];

    // 4. Databases
    const dbs: EnterpriseEntity[] = [
      { id: 'db-transaction-core', name: 'PostgreSQL Aurora Core Transaction Database', type: 'database', status: 'nominal', criticality: 'critical', location: 'infra-aws-region-1', recoveryTimeHrs: 8 },
      { id: 'db-customer-metastore', name: 'RDS MySQL Customer Profiler Metadata', type: 'database', status: 'nominal', criticality: 'high', location: 'infra-aws-region-1', recoveryTimeHrs: 4 },
      { id: 'db-payroll-internal', name: 'PostgreSQL Payroll & Employee ledger', type: 'database', status: 'nominal', criticality: 'medium', location: 'infra-aws-region-2', recoveryTimeHrs: 12 },
      { id: 'db-cold-backups', name: 'S3 Object storage - Snapshot archive vaults', type: 'database', status: 'nominal', criticality: 'high', location: 'infra-aws-region-2', recoveryTimeHrs: 24 }
    ];

    // 5. Applications
    const apps: EnterpriseEntity[] = [
      { id: 'app-checkout-gateway', name: 'Merchant Payment Checkout Engine', type: 'application', status: 'nominal', criticality: 'critical', recoveryTimeHrs: 2 },
      { id: 'app-portal-client', name: 'SentinelX Active Operations Client Portal', type: 'application', status: 'nominal', criticality: 'high', recoveryTimeHrs: 3 },
      { id: 'app-erp-enterprise', name: 'SAP Enterprise Resource Optimizer', type: 'application', status: 'nominal', criticality: 'medium', recoveryTimeHrs: 6 },
      { id: 'app-crm-salesforce', name: 'Customer Engagement CRM Hub', type: 'application', status: 'nominal', criticality: 'medium', recoveryTimeHrs: 4 },
      { id: 'app-recurring-billing', name: 'Stripe SaaS Recurring Billing Daemon', type: 'application', status: 'nominal', criticality: 'high', recoveryTimeHrs: 3 }
    ];

    // 6. Business Functions
    const functions: EnterpriseEntity[] = [
      { id: 'biz-merchant-checkout', name: 'Real-time Customer Payment Transactions', type: 'business_function', status: 'nominal', criticality: 'critical', revenuePerHr: 12500 },
      { id: 'biz-onboarding', name: 'Automated Client Tenant Provisioning', type: 'business_function', status: 'nominal', criticality: 'high', revenuePerHr: 3200 },
      { id: 'biz-payroll-schedule', name: 'Employee Compensation Cycle Execution', type: 'business_function', status: 'nominal', criticality: 'medium', revenuePerHr: 1500 },
      { id: 'biz-technical-on-call', name: 'Support SLA Ticket Incident Response', type: 'business_function', status: 'nominal', criticality: 'high', revenuePerHr: 1000 },
      { id: 'biz-compliance-audit', name: 'Continuous Security Governance Attestation', type: 'business_function', status: 'nominal', criticality: 'medium', revenuePerHr: 0 }
    ];

    // 7. Governance Controls
    const gov: EnterpriseEntity[] = [
      { id: 'gov-zero-trust-auth', name: 'FIDO2 Zero-Trust MFA Verification Policy', type: 'governance', status: 'nominal', criticality: 'critical' },
      { id: 'gov-suricata-falco-logs', name: 'Falco Call watch & Suricata Border logging standards', type: 'governance', status: 'nominal', criticality: 'high' },
      { id: 'gov-hipaa-gdpr-crypt', name: 'AES-256 Customer PII Encryption Compliance', type: 'governance', status: 'nominal', criticality: 'high' },
      { id: 'gov-dual-signoff', name: 'CI/CD Cluster Code deployment dual sign-off', type: 'governance', status: 'nominal', criticality: 'medium' }
    ];

    // 8. Identity Systems
    const ids: EnterpriseEntity[] = [
      { id: 'id-domain-controller', name: 'Active Directory Domain core controller', type: 'identity', status: 'nominal', criticality: 'critical' },
      { id: 'id-saml-sso', name: 'Federated SSO Web Gateway (Okta SSO Link)', type: 'identity', status: 'nominal', criticality: 'high' }
    ];

    // 9. Telemetry Sources
    const tel: EnterpriseEntity[] = [
      { id: 'tel-suricata-daemons', name: 'Suricata border telemetry ingest streams', type: 'telemetry', status: 'nominal', criticality: 'high' },
      { id: 'tel-falco-daemons', name: 'Falco cluster host system-call sensors', type: 'telemetry', status: 'nominal', criticality: 'high' }
    ];

    allEntities().concat(depts, emps, infra, dbs, apps, functions, gov, ids, tel).forEach(e => {
      this.entities.set(e.id, e);
    });

    function allEntities(): EnterpriseEntity[] { return []; }

    // Define Dependency Links
    // 1. Infrastructure dependencies
    this.links.push(
      { from: 'infra-k8s-cluster', to: 'infra-aws-region-1', strength: 'hard' },
      { from: 'db-transaction-core', to: 'infra-aws-region-1', strength: 'hard' },
      { from: 'db-customer-metastore', to: 'infra-aws-region-1', strength: 'hard' },
      { from: 'db-payroll-internal', to: 'infra-aws-region-2', strength: 'hard' },
      { from: 'db-cold-backups', to: 'infra-aws-region-2', strength: 'hard' }
    );

    // 2. Application Core dependencies
    this.links.push(
      { from: 'app-checkout-gateway', to: 'infra-k8s-cluster', strength: 'hard' },
      { from: 'app-checkout-gateway', to: 'db-transaction-core', strength: 'hard' },
      { from: 'app-checkout-gateway', to: 'infra-border-router', strength: 'hard' },
      
      { from: 'app-portal-client', to: 'infra-k8s-cluster', strength: 'hard' },
      { from: 'app-portal-client', to: 'db-customer-metastore', strength: 'hard' },
      { from: 'app-portal-client', to: 'infra-azure-ad', strength: 'hard' },
      
      { from: 'app-erp-enterprise', to: 'infra-k8s-cluster', strength: 'soft' },
      { from: 'app-erp-enterprise', to: 'db-customer-metastore', strength: 'hard' },

      { from: 'app-recurring-billing', to: 'app-checkout-gateway', strength: 'hard' },
      { from: 'app-recurring-billing', to: 'db-transaction-core', strength: 'hard' }
    );

    // 3. Business Function dependencies
    this.links.push(
      { from: 'biz-merchant-checkout', to: 'app-checkout-gateway', strength: 'hard' },
      { from: 'biz-merchant-checkout', to: 'gov-zero-trust-auth', strength: 'soft' },

      { from: 'biz-onboarding', to: 'app-portal-client', strength: 'hard' },
      
      { from: 'biz-payroll-schedule', to: 'app-erp-enterprise', strength: 'hard' },
      { from: 'biz-payroll-schedule', to: 'db-payroll-internal', strength: 'hard' },

      { from: 'biz-technical-on-call', to: 'app-portal-client', strength: 'soft' },
      { from: 'biz-technical-on-call', to: 'emp-sre-lead', strength: 'hard' },

      { from: 'biz-compliance-audit', to: 'gov-suricata-falco-logs', strength: 'hard' },
      { from: ' biz-compliance-audit', to: 'emp-compl-officer', strength: 'hard' }
    );

    // 4. Governance & Telemetry Links
    this.links.push(
      { from: 'gov-suricata-falco-logs', to: 'tel-suricata-daemons', strength: 'hard' },
      { from: 'gov-suricata-falco-logs', to: 'tel-falco-daemons', strength: 'hard' },
      { from: 'gov-zero-trust-auth', to: 'infra-azure-ad', strength: 'hard' },
      { from: 'id-saml-sso', to: 'infra-azure-ad', strength: 'hard' },
      { from: 'gov-zero-trust-auth', to: 'id-saml-sso', strength: 'hard' }
    );

    // 5. Personnel Clearance/Department operations linking
    this.links.push(
      { from: 'dept-ops', to: 'emp-sre-lead', strength: 'hard' },
      { from: 'dept-eng', to: 'emp-devops-lead', strength: 'hard' },
      { from: 'dept-eng', to: 'emp-cto', strength: 'hard' },
      { from: 'dept-legal', to: 'emp-ciso', strength: 'hard' },
      { from: 'dept-legal', to: 'emp-compl-officer', strength: 'hard' }
    );
  }

  public getEntities(): EnterpriseEntity[] {
    return Array.from(this.entities.values());
  }

  public getLinks(): DependencyLink[] {
    return this.links;
  }

  public runCascadingSimulation(failedNodeIds: string[]): {
    nodesMap: Map<string, 'nominal' | 'degraded' | 'disabled'>;
    cascades: Array<{ sourceId: string; targetId: string; type: 'degraded' | 'disabled'; reason: string }>;
  } {
    const nodesState = new Map<string, 'nominal' | 'degraded' | 'disabled'>();
    
    // Set up active base states
    for (const id of this.entities.keys()) {
      nodesState.set(id, 'nominal');
    }

    failedNodeIds.forEach(id => {
      if (nodesState.has(id)) {
        nodesState.set(id, 'disabled');
      }
    });

    const cascades: Array<{ sourceId: string; targetId: string; type: 'degraded' | 'disabled'; reason: string }> = [];
    const queue = [...failedNodeIds];
    const visited = new Set<string>();

    let limitSafety = 0;
    while (queue.length > 0 && limitSafety < 500) {
      limitSafety++;
      const currentFailed = queue.shift()!;
      if (visited.has(currentFailed)) continue;
      visited.add(currentFailed);

      const currentState = nodesState.get(currentFailed) || 'nominal';
      if (currentState === 'nominal') continue;

      // Find nodes that depend on this currentFailed node
      const impacts = this.links.filter(l => l.to === currentFailed);

      for (const link of impacts) {
        const dependentId = link.from;
        const dependentEntity = this.entities.get(dependentId);
        if (!dependentEntity) continue;

        const originalState = nodesState.get(dependentId) || 'nominal';
        let targetState: 'nominal' | 'degraded' | 'disabled' = originalState;

        if (currentState === 'disabled') {
          if (link.strength === 'hard') {
            targetState = 'disabled';
          } else if (link.strength === 'soft' && originalState !== 'disabled') {
            targetState = 'degraded';
          }
        } else if (currentState === 'degraded') {
          if (originalState === 'nominal') {
            targetState = 'degraded';
          }
        }

        if (targetState !== originalState) {
          nodesState.set(dependentId, targetState);
          
          let actionName = targetState === 'disabled' ? 'disabled' : 'degraded';
          cascades.push({
            sourceId: currentFailed,
            targetId: dependentId,
            type: targetState === 'disabled' ? 'disabled' : 'degraded',
            reason: `Direct upstream ${this.entities.get(currentFailed)?.name} is ${currentState} (${link.strength} relationship)`
          });

          queue.push(dependentId);
        }
      }
    }

    return {
      nodesMap: nodesState,
      cascades
    };
  }
}

export const dependencySimulator = new DependencySimulator();
