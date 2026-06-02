import { connectorRegistry, EnterpriseConnectorSpec } from './connector-registry';
import { connectorNormalizer } from './connector-normalizer';
import { connectorHealth } from './connector-health';
import { fabricCache } from '../data-fabric/fabric-cache';
import { metadataEngine } from '../data-fabric/metadata-engine';
import { relationshipBuilder } from '../data-fabric/relationship-builder';
import { logger } from '../core/logger';

export class ConnectorRuntime {
  private static instance: ConnectorRuntime;

  private constructor() {}

  public static getInstance(): ConnectorRuntime {
    if (!ConnectorRuntime.instance) {
      ConnectorRuntime.instance = new ConnectorRuntime();
    }
    return ConnectorRuntime.instance;
  }

  /**
   * Orchestrates the live execution of a sync job for a given connector specification.
   * Feeds discoveries seamlessly into the Enterprise Data Fabric.
   */
  public async executeSync(connectorId: string): Promise<boolean> {
    const spec = connectorRegistry.getConnectorSpec(connectorId);
    if (!spec) {
      logger.error(`[ConnectorRuntime] Execute error: Unknown connector: ${connectorId}`);
      return false;
    }

    const startTime = Date.now();
    logger.info(`[ConnectorRuntime] Initiating metadata ingestion pipeline for [${spec.name}]...`);
    connectorRegistry.updateStatus(connectorId, { status: 'SYNCING' });

    try {
      // 1. Simulate pulling third-party metadata logs safely
      const rawDummyPayload = this.acquireMockSystemPayload(spec);
      const latencyMs = Math.round(50 + Math.random() * 200);

      // 2. Normalize raw payload to clean, standard compliance blocks
      const normalized = connectorNormalizer.normalizeExternalPayload(rawDummyPayload);

      // 3. Re-inject/Suture the node inside the living Enterprise Data Fabric
      const nodeType = this.resolveClassType(spec.type);
      const nodeClass = metadataEngine.sanitizeAndClassify(
        normalized.nodeId,
        normalized.name,
        nodeType as any,
        {
          ...normalized.additionalMeta,
          recordCount: normalized.recordCount,
          piiColumns: normalized.piiColumns,
          lastModified: normalized.lastModified
        }
      );

      // Save to cache
      fabricCache.addNode(nodeClass);

      // Auto-re-link relationships so graph references update
      relationshipBuilder.resolveAutoRelations();

      const elapsedMs = Date.now() - startTime;
      
      // Update health dashboard metrics
      connectorHealth.logSyncActivity(
        connectorId,
        true,
        elapsedMs,
        `Ingested metadata footprint. Discovered node ID: ${nodeClass.id}, classified: ${nodeClass.sensitivity}`
      );

      // Update connector registry state
      connectorRegistry.updateStatus(connectorId, {
        status: 'ACTIVE',
        lastSyncTimestamp: new Date().toISOString(),
        ingestedRecordCount: spec.ingestedRecordCount + 1
      });

      logger.info(`[ConnectorRuntime] Ingestion complete for [${spec.name}] within ${elapsedMs}ms.`);
      return true;
    } catch (err: any) {
      const elapsedMs = Date.now() - startTime;
      connectorHealth.logSyncActivity(connectorId, false, elapsedMs, `Ingestion failed: ${err.message || err}`);
      connectorRegistry.updateStatus(connectorId, { status: 'ERROR' });
      logger.error(`[ConnectorRuntime] Ingestion failure on [${spec.id}]`, err);
      return false;
    }
  }

  private resolveClassType(connectorType: string): string {
    switch (connectorType) {
      case 'DATABASE':
        return 'database';
      case 'DIRECTORY_LDAP':
        return 'database';
      case 'CLOUD_API':
        return 'cloud_resource';
      case 'INFRASTRUCTURE_AGENT':
        return 'infrastructure';
      default:
        return 'application';
    }
  }

  private acquireMockSystemPayload(spec: EnterpriseConnectorSpec): Record<string, any> {
    // Generates simulated live metadata snapshots depending on target system config details
    const timestamp = new Date().toISOString();
    
    switch (spec.id) {
      case 'conn-postgres-ledgers':
        return {
          id: 'db-payroll-postgres',
          name: 'Corporate Payroll & Ledger Database Cluster',
          type: 'database',
          rowsTotal: 1645280 + Math.round(Math.random() * 500),
          schema: ['salary', 'tax_id', 'bank_routing_number'],
          updatedAt: timestamp
        };
      case 'conn-aws-iam-sync':
        return {
          id: 'cloud-aws-vpc-production',
          name: 'AWS Production Primary Secure VPC Cluster - AP-NORTHEAST-1',
          type: 'cloud_resource',
          size: 154,
          schema: ['iam_user_arn', 'security_group_rule_hash'],
          updatedAt: timestamp
        };
      case 'conn-ldap-active-directory':
        return {
          id: 'db-identities',
          name: 'Okta Federated User Directory Metadata',
          type: 'database',
          recordsCount: 125000 + Math.round(Math.random() * 20),
          schema: ['email', 'is_mfa_active'],
          updatedAt: timestamp
        };
      default:
        return {
          id: spec.targetSystem,
          name: `${spec.name} Discovered Dynamic Node`,
          type: 'application',
          size: 1000,
          updatedAt: timestamp
        };
    }
  }
}

export const connectorRuntime = ConnectorRuntime.getInstance();
