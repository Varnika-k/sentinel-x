import { connectorRegistry, EnterpriseConnectorSpec } from './connector-registry';
import { logger } from '../core/logger';

export class ConnectorScheduler {
  private static instance: ConnectorScheduler;
  private activeTimers: Map<string, NodeJS.Timeout> = new Map();
  private onTriggerCallback?: (connectorId: string) => Promise<void>;

  private constructor() {
    this.startGlobalScheduler();
  }

  public static getInstance(): ConnectorScheduler {
    if (!ConnectorScheduler.instance) {
      ConnectorScheduler.instance = new ConnectorScheduler();
    }
    return ConnectorScheduler.instance;
  }

  public registerSyncTrigger(callback: (connectorId: string) => Promise<void>): void {
    this.onTriggerCallback = callback;
  }

  private startGlobalScheduler(): void {
    logger.info('[ConnectorScheduler] Initializing global metadata sync loop...');
    const specs = connectorRegistry.listSpecs();

    specs.forEach(spec => {
      this.scheduleConnector(spec);
    });
  }

  public scheduleConnector(spec: EnterpriseConnectorSpec): void {
    // Drop existing timer if any
    this.cancelScheduledSync(spec.id);

    const intervalMs = spec.config.syncIntervalMinutes * 60 * 1000;
    
    // Simulate background periodic metadata sync trigger
    const timer = setInterval(async () => {
      logger.info(`[ConnectorScheduler] Chrono-Trigger: Invoking scheduled sync hook for [${spec.name}] (Interval: ${spec.config.syncIntervalMinutes}m)`);
      if (this.onTriggerCallback) {
        try {
          await this.onTriggerCallback(spec.id);
        } catch (err) {
          logger.error(`[ConnectorScheduler] Error occurred in sync callback for [${spec.id}]`, err);
        }
      }
    }, intervalMs);

    this.activeTimers.set(spec.id, timer);
    logger.info(`[ConnectorScheduler] Registered recurrent CRON timer for [${spec.name}] (Frequency: ${spec.config.syncIntervalMinutes} min)`);
  }

  public cancelScheduledSync(id: string): void {
    const timer = this.activeTimers.get(id);
    if (timer) {
      clearInterval(timer);
      this.activeTimers.delete(id);
      logger.info(`[ConnectorScheduler] De-registered scheduler cron for: ${id}`);
    }
  }

  public shutdown(): void {
    Array.from(this.activeTimers.keys()).forEach(id => this.cancelScheduledSync(id));
  }
}

export const connectorScheduler = ConnectorScheduler.getInstance();
