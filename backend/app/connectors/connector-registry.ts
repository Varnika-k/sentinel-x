import { logger } from '../core/logger';

export interface EnterpriseConnectorSpec {
  id: string;
  name: string;
  type: 'DATABASE' | 'CLOUD_API' | 'DIRECTORY_LDAP' | 'SAAS' | 'INFRASTRUCTURE_AGENT';
  targetSystem: string;
  config: {
    syncIntervalMinutes: number;
    metadataOnly: boolean;
    connectionEndpoint: string;
    authType: 'OAUTH' | 'TOKEN' | 'IAM_ROLE' | 'BASIC';
  };
  status: 'ACTIVE' | 'CONNECTED' | 'SYNCING' | 'ERROR' | 'IDLE';
  lastSyncTimestamp?: string;
  healthScore: number; // 0 - 100
  ingestedRecordCount: number;
}

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private specs: Map<string, EnterpriseConnectorSpec> = new Map();

  private constructor() {
    this.bootstrapRegistry();
  }

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  private bootstrapRegistry(): void {
    logger.info('[ConnectorRegistry] Bootstrapping universal metadata connectors...');
    
    const initialSpecs: EnterpriseConnectorSpec[] = [
      {
        id: 'conn-postgres-ledgers',
        name: 'PostgreSQL Ledger Broker Connection',
        type: 'DATABASE',
        targetSystem: 'db-payroll-postgres',
        config: { syncIntervalMinutes: 15, metadataOnly: true, connectionEndpoint: 'postgres://fictional-rds-hq:5432/payroll', authType: 'IAM_ROLE' },
        status: 'ACTIVE',
        lastSyncTimestamp: new Date().toISOString(),
        healthScore: 98,
        ingestedRecordCount: 1645280
      },
      {
        id: 'conn-aws-iam-sync',
        name: 'AWS CloudTrail & IAM Directory Synchronizer',
        type: 'CLOUD_API',
        targetSystem: 'cloud-aws-vpc-production',
        config: { syncIntervalMinutes: 60, metadataOnly: true, connectionEndpoint: 'arn:aws:iam::123456789012:role/SentinelXDiscovery', authType: 'IAM_ROLE' },
        status: 'ACTIVE',
        lastSyncTimestamp: new Date().toISOString(),
        healthScore: 100,
        ingestedRecordCount: 452900
      },
      {
        id: 'conn-ldap-active-directory',
        name: 'Azure Active Directory LDAP Identity Connector',
        type: 'DIRECTORY_LDAP',
        targetSystem: 'db-identities',
        config: { syncIntervalMinutes: 30, metadataOnly: true, connectionEndpoint: 'ldaps://ad.corp.internal:636', authType: 'TOKEN' },
        status: 'ACTIVE',
        lastSyncTimestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        healthScore: 95,
        ingestedRecordCount: 125000
      },
      {
        id: 'conn-entra-id-oauth',
        name: 'Microsoft Entra ID (Azure AD) OAuth/OIDC Directory',
        type: 'SAAS',
        targetSystem: 'azure-entra-directory',
        config: { syncIntervalMinutes: 15, metadataOnly: true, connectionEndpoint: 'https://graph.microsoft.com', authType: 'OAUTH' },
        status: 'IDLE',
        lastSyncTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        healthScore: 100,
        ingestedRecordCount: 0
      },
      {
        id: 'conn-aws-s3-compliance-crawler',
        name: 'AWS S3 Asset Catalog and Sensitivity Crawler',
        type: 'CLOUD_API',
        targetSystem: 'cloud-aws-s3-ledger',
        config: { syncIntervalMinutes: 120, metadataOnly: true, connectionEndpoint: 's3://ledger-regulatory-bucket', authType: 'IAM_ROLE' },
        status: 'IDLE',
        lastSyncTimestamp: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
        healthScore: 99,
        ingestedRecordCount: 885230
      }
    ];

    initialSpecs.forEach(spec => this.register(spec));
  }

  public register(spec: EnterpriseConnectorSpec): void {
    // Force enforcement of metadata-only rule:
    spec.config.metadataOnly = true;
    this.specs.set(spec.id, spec);
    logger.info(`[ConnectorRegistry] Activated Metadata Connector Specification: ${spec.name} [ID: ${spec.id}]`);
  }

  public getConnectorSpec(id: string): EnterpriseConnectorSpec | undefined {
    return this.specs.get(id);
  }

  public listSpecs(): EnterpriseConnectorSpec[] {
    return Array.from(this.specs.values());
  }

  public updateStatus(id: string, update: Partial<EnterpriseConnectorSpec>): void {
    const spec = this.specs.get(id);
    if (spec) {
      Object.assign(spec, update);
    }
  }

  public deleteSpec(id: string): void {
    this.specs.delete(id);
    logger.info(`[ConnectorRegistry] Removed connector spec entry: ${id}`);
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
