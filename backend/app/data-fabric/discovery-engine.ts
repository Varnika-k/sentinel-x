import { fabricCache } from './fabric-cache';
import { metadataEngine } from './metadata-engine';
import { relationshipBuilder } from './relationship-builder';
import { logger } from '../core/logger';

export class DiscoveryEngine {
  private static instance: DiscoveryEngine;

  private constructor() {}

  public static getInstance(): DiscoveryEngine {
    if (!DiscoveryEngine.instance) {
      DiscoveryEngine.instance = new DiscoveryEngine();
    }
    return DiscoveryEngine.instance;
  }

  /**
   * Discovers and bootstraps core metadata entities, stitching relationships automatically.
   */
  public discoverAndBootstrap(): void {
    logger.info('[DiscoveryEngine] Running automatic enterprise asset discovery scan...');
    fabricCache.clear();

    // 1. Create Core Human Departments
    const deptFinance = metadataEngine.sanitizeAndClassify(
      'dept-finance-hq',
      'Finance & Payroll Operations Division',
      'department',
      { departmentId: 'dept-finance-hq', team: 'dept-finance-hq', businessUnit: 'CORPORATE_SERVICES', executiveHeadId: 'emp-cfo-sarah' }
    );
    const deptEngineering = metadataEngine.sanitizeAndClassify(
      'dept-engineering-hq',
      'Unified Engineering & Platforms',
      'department',
      { departmentId: 'dept-engineering-hq', team: 'dept-engineering-hq', businessUnit: 'TECHNOLOGY', executiveHeadId: 'emp-cto-clara' }
    );
    const deptOps = metadataEngine.sanitizeAndClassify(
      'dept-ops-hq',
      'Global Infrastructure & Custodial Operations',
      'department',
      { departmentId: 'dept-ops-hq', team: 'dept-ops-hq', businessUnit: 'OPERATIONS', executiveHeadId: 'emp-coo-marcus' }
    );
    const deptLegal = metadataEngine.sanitizeAndClassify(
      'dept-legal-hq',
      'Regulatory, GRC & Compliance Office',
      'department',
      { departmentId: 'dept-legal-hq', team: 'dept-legal-hq', businessUnit: 'GOVERNANCE', executiveHeadId: 'emp-chief-compliance' }
    );

    fabricCache.addNode(deptFinance);
    fabricCache.addNode(deptEngineering);
    fabricCache.addNode(deptOps);
    fabricCache.addNode(deptLegal);

    // 2. Create Core Executive & Lead Employees (The People)
    const executives = [
      { id: 'emp-cfo-sarah', name: 'Sarah Jenkins', dId: 'dept-finance-hq', metadata: { role: 'Chief Financial Officer' } },
      { id: 'emp-cto-clara', name: 'Clara Vance', dId: 'dept-engineering-hq', metadata: { role: 'Chief Technology Officer' } },
      { id: 'emp-coo-marcus', name: 'Marcus Brody', dId: 'dept-ops-hq', metadata: { role: 'VP Operations' } },
      { id: 'emp-chief-compliance', name: 'Helen GRC-Lead', dId: 'dept-legal-hq', metadata: { role: 'Chief Compliance Officer' } },
      { id: 'emp-dev-ricky', name: 'Ricky Bobby', dId: 'dept-engineering-hq', metadata: { role: 'Lead Platform Engineer' } },
      { id: 'emp-billing-analyst', name: 'John Doe Billing-Analyst', dId: 'dept-finance-hq', metadata: { role: 'Senior Billing Auditor' } }
    ];

    executives.forEach(exec => {
      const node = metadataEngine.sanitizeAndClassify(
        exec.id,
        exec.name,
        'employee',
        { ...exec.metadata, departmentId: exec.dId, team: exec.dId }
      );
      fabricCache.addNode(node);
    });

    // 3. Create Key Applications (The Systems)
    const apps = [
      { id: 'app-billing-hub', name: 'Enterprise Billing Gateway', dept: 'dept-finance-hq', owner: 'emp-billing-analyst', payload: { tier: 'tier-1', databases: ['db-payroll-postgres'] } },
      { id: 'app-ingress-portal', name: 'SentinelX External Ingress Gateway', dept: 'dept-engineering-hq', owner: 'emp-dev-ricky', payload: { tier: 'tier-1', databases: ['db-logs-mongo'], hostNodeId: 'infra-kubernetes-node-1' } },
      { id: 'app-identity-authenticator', name: 'AD Federated Okta Identity Gateway', dept: 'dept-ops-hq', owner: 'emp-chief-compliance', payload: { tier: 'tier-1', databases: ['db-identities'] } }
    ];

    apps.forEach(app => {
      const node = metadataEngine.sanitizeAndClassify(
        app.id,
        app.name,
        'application',
        { ...app.payload, departmentId: app.dept, ownerId: app.owner }
      );
      fabricCache.addNode(node);
    });

    // 4. Create Databases
    const dbs = [
      { id: 'db-payroll-postgres', name: 'Corporate Payroll & Ledger Database Cluster', dept: 'dept-finance-hq', owner: 'emp-cfo-sarah', payload: { formats: 'PostgreSQL', recordCount: 1645280, piiColumns: ['salary', 'credit_card_bin', 'bank_routing_number'], infraNodeId: 'infra-host-sql-server' } },
      { id: 'db-logs-mongo', name: 'Internal Audit Syslog Raw Store', dept: 'dept-engineering-hq', owner: 'emp-dev-ricky', payload: { formats: 'MongoDB', recordCount: 85270041, infraNodeId: 'infra-host-nas' } },
      { id: 'db-identities', name: 'Okta Federated User Directory Metadata', dept: 'dept-ops-hq', owner: 'emp-coo-marcus', payload: { formats: 'LDAP', recordCount: 125000, piiColumns: ['email', 'auth_token_hash'], infraNodeId: 'infra-host-sql-server' } }
    ];

    dbs.forEach(db => {
      const node = metadataEngine.sanitizeAndClassify(
        db.id,
        db.name,
        'database',
        { ...db.payload, departmentId: db.dept, ownerId: db.owner }
      );
      fabricCache.addNode(node);
    });

    // 5. Create Cloud Resources & Physical Host Infrastructure
    const infraDevices = [
      { id: 'infra-kubernetes-node-1', name: 'EKS Cloud Node Group - Kube AWS Worker - Tokyo-1', type: 'infrastructure', dId: 'dept-engineering-hq', payload: { activeConnectionsCount: 1250 } },
      { id: 'infra-host-sql-server', name: 'AWS Dedicated RDS r6g.4xlarge DB Host Instance', type: 'infrastructure', dId: 'dept-ops-hq', payload: { activeConnectionsCount: 6512 } },
      { id: 'infra-host-nas', name: 'On-Premises Dedicated Network Active Storage Array (NAS)', type: 'infrastructure', dId: 'dept-ops-hq', payload: { activeConnectionsCount: 120 } },
      { id: 'cloud-aws-s3-ledger', name: 'AWS S3 Financial Statements Regulatory Cold Bucket', type: 'cloud_resource', dId: 'dept-finance-hq', payload: { bucketSizeGb: 145000 } },
      { id: 'cloud-aws-vpc-production', name: 'AWS Production Primary Secure VPC Cluster - AP-NORTHEAST-1', type: 'cloud_resource', dId: 'dept-engineering-hq', payload: { subnets: ['public-subnet-1a', 'private-subnet-2b'] } }
    ];

    infraDevices.forEach(inf => {
      const node = metadataEngine.sanitizeAndClassify(
        inf.id,
        inf.name,
        inf.type as any,
        { ...inf.payload, departmentId: inf.dId }
      );
      fabricCache.addNode(node);
    });

    // 6. Create Sensitive Access Identities Map
    const identities = [
      { id: 'identity-john-doe-finance', name: 'Okta-ID: john.doe@payroll.corp', dept: 'dept-finance-hq', payload: { allowedApps: ['app-billing-hub'], authType: 'Okta MFA' } },
      { id: 'identity-ricky-platform', name: 'Okta-ID: ricky.b@engineering.corp', dept: 'dept-engineering-hq', payload: { allowedApps: ['app-ingress-portal'], authType: 'YubiKey Hardware Key' } },
      { id: 'identity-external-contractor-temp', name: 'AD-LDAP: ext-guest-collaborator', dept: 'dept-engineering-hq', payload: { allowedApps: ['app-ingress-portal'], authType: 'Password-Only' } }
    ];

    identities.forEach(idp => {
      const node = metadataEngine.sanitizeAndClassify(
        idp.id,
        idp.name,
        'identity',
        { ...idp.payload, departmentId: idp.dept }
      );
      fabricCache.addNode(node);
    });

    // 7. Create Governance Compliance Rules
    const policies = [
      { id: 'gov-rule-sox-compliance', name: 'SOX (Section 404) Regulatory Controls Binding', dId: 'dept-legal-hq' },
      { id: 'gov-rule-gdpr-data-isolation', name: 'GDPR Directive (EU) PII Privacy Shield', dId: 'dept-legal-hq' },
      { id: 'gov-rule-iso-27001-zero-trust', name: 'ISO-27001 Core Access Isolation Mandate', dId: 'dept-legal-hq' }
    ];

    policies.forEach(pol => {
      const node = metadataEngine.sanitizeAndClassify(
        pol.id,
        pol.name,
        'governance_rule',
        { departmentId: pol.dId }
      );
      fabricCache.addNode(node);
    });

    // 8. Bind Everything with Relationships
    relationshipBuilder.resolveAutoRelations();

    // Ensure dedicated governance rules are linked to their corresponding resources
    relationshipBuilder.link('gov-rule-sox-compliance', 'db-payroll-postgres', 'GOVERNED_BY', 1.0);
    relationshipBuilder.link('gov-rule-gdpr-data-isolation', 'db-payroll-postgres', 'GOVERNED_BY', 1.0);
    relationshipBuilder.link('gov-rule-gdpr-data-isolation', 'db-identities', 'GOVERNED_BY', 0.95);
    relationshipBuilder.link('gov-rule-iso-27001-zero-trust', 'infra-host-sql-server', 'GOVERNED_BY', 1.0);

    // Track cloud resources to infrastructure
    relationshipBuilder.link('infra-kubernetes-node-1', 'cloud-aws-vpc-production', 'PART_OF_PROCESS', 1.0);
    relationshipBuilder.link('infra-host-sql-server', 'cloud-aws-vpc-production', 'PART_OF_PROCESS', 1.0);

    // Trace deep department processes
    relationshipBuilder.link('dept-finance-hq', 'emp-cfo-sarah', 'MANAGED_BY', 1.0);
    relationshipBuilder.link('dept-engineering-hq', 'emp-cto-clara', 'MANAGED_BY', 1.0);
    relationshipBuilder.link('dept-ops-hq', 'emp-coo-marcus', 'MANAGED_BY', 1.0);
    relationshipBuilder.link('dept-legal-hq', 'emp-chief-compliance', 'MANAGED_BY', 1.0);

    logger.info(`[DiscoveryEngine] Successfully populated Living Enterprise Topology Cache [Total Nodes: ${fabricCache.listNodes().length}]`);
  }
}

export const discoveryEngine = DiscoveryEngine.getInstance();
