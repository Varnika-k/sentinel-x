import { connectorRegistry, EnterpriseConnectorSpec } from './connector-registry';
import { connectorRuntime } from './connector-runtime';
import { connectorScheduler } from './connector-scheduler';
import { connectorHealth } from './connector-health';
import { logger } from '../core/logger';

export class ConnectorEngine {
  private static instance: ConnectorEngine;

  private constructor() {
    this.initializeRoutingSchedules();
  }

  public static getInstance(): ConnectorEngine {
    if (!ConnectorEngine.instance) {
      ConnectorEngine.instance = new ConnectorEngine();
    }
    return ConnectorEngine.instance;
  }

  private initializeRoutingSchedules(): void {
    logger.info('[ConnectorEngine] Splicing scheduler trigger pathways...');
    
    // Wire scheduler triggers direct into the run engine
    connectorScheduler.registerSyncTrigger(async (id: string) => {
      logger.info(`[ConnectorEngine] Triggering background synchronization cycle for: ${id}`);
      await connectorRuntime.executeSync(id);
    });
  }

  /**
   * Retrieves all registered connector specs paired with dynamic health diagnostics.
   */
  public getConnectorDashboard() {
    const specs = connectorRegistry.listSpecs();

    return specs.map(spec => {
      const health = connectorHealth.getHealth(spec.id);
      return {
        ...spec,
        uptimePercentage: health.uptimePercentage,
        avgLatencyMs: health.avgLatencyMs,
        p95LatencyMs: health.p95LatencyMs,
        successRate: health.transactionSuccessRate,
        syncedCount: health.totalSyncedEvents,
        lastErrorStatus: health.lastSyncedStatus,
        logs: health.syncLogs
      };
    });
  }

  /**
   * Triggers an on-demand, instant metadata sweep for a connector.
   */
  public async executeManualIngestionSync(id: string): Promise<boolean> {
    logger.info(`[ConnectorEngine] Manual sweep requested on connector channel [ID: ${id}]`);
    return await connectorRuntime.executeSync(id);
  }

  /**
   * Updates connector configuration specs on the fly and reschedules.
   */
  public updateConnectorConfig(
    id: string,
    endpoint: string,
    intervalMin: number,
    authType: 'OAUTH' | 'TOKEN' | 'IAM_ROLE' | 'BASIC'
  ): boolean {
    const spec = connectorRegistry.getConnectorSpec(id);
    if (!spec) return false;

    connectorRegistry.updateStatus(id, {
      config: {
        ...spec.config,
        connectionEndpoint: endpoint,
        syncIntervalMinutes: intervalMin,
        authType
      }
    });

    const updatedSpec = connectorRegistry.getConnectorSpec(id)!;
    // Reschedule timer immediately with the updated interval
    connectorScheduler.scheduleConnector(updatedSpec);
    return true;
  }
}

export const connectorEngine = ConnectorEngine.getInstance();
