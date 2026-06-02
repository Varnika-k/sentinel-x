import { CanonicalTelemetryEvent } from '../telemetry/pipeline';
import { ingestionOrchestrator } from '../distributed/ingestion-orchestrator';
import { logger } from '../core/logger';
import { v4 as uuidv4 } from 'uuid';

export interface IConnector {
  id: string;
  name: string;
  sourceType: string;
  normalize(rawEvent: any): CanonicalTelemetryEvent;
  ingest(rawEvent: any): Promise<{ success: boolean; partition: string; latencyMs: number }>;
}

export abstract class BaseConnector implements IConnector {
  abstract id: string;
  abstract name: string;
  abstract sourceType: any;

  abstract normalize(rawEvent: any): CanonicalTelemetryEvent;

  public async ingest(rawEvent: any): Promise<{ success: boolean; partition: string; latencyMs: number }> {
    try {
      const normalized = this.normalize(rawEvent);
      return await ingestionOrchestrator.processTelemetryEvent(normalized);
    } catch (err) {
      logger.error(`[Connector:${this.name}] Ingestion pipeline exception for raw payload.`, err);
      return { success: false, partition: 'error', latencyMs: 0 };
    }
  }

  protected generateBaseEvent(source: string, targetNode: string, severity: 'low' | 'medium' | 'high' | 'critical', threatScore: number): CanonicalTelemetryEvent {
    return {
      eventId: uuidv4(),
      timestamp: new Date().toISOString(),
      source,
      sourceType: this.sourceType,
      targetNode,
      eventCategory: this.sourceType,
      severity,
      threatScore,
      correlationId: `corr-${source.toLowerCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      replaySequence: 0,
      infrastructureContext: {
        nodeId: targetNode,
        namespace: this.resolveNamespace(targetNode),
        environment: 'production'
      },
      mutationPayload: {}
    };
  }

  private resolveNamespace(nodeId: string): string {
    if (nodeId.includes('auth') || nodeId.includes('ad') || nodeId.includes('key')) {
      return 'security';
    }
    if (nodeId.includes('db') || nodeId.includes('sql') || nodeId.includes('postgres')) {
      return 'db-tier';
    }
    return 'production';
  }
}

export class ConnectorRegistry {
  private static instance: ConnectorRegistry;
  private connectors: Map<string, IConnector> = new Map();

  private constructor() {}

  public static getInstance(): ConnectorRegistry {
    if (!ConnectorRegistry.instance) {
      ConnectorRegistry.instance = new ConnectorRegistry();
    }
    return ConnectorRegistry.instance;
  }

  public register(connector: IConnector): void {
    this.connectors.set(connector.id, connector);
    logger.info(`[ConnectorRegistry] Registered hot-pluggable connector: ${connector.name} [ID: ${connector.id}]`);
  }

  public deregister(connectorId: string): void {
    if (this.connectors.has(connectorId)) {
      const name = this.connectors.get(connectorId)?.name;
      this.connectors.delete(connectorId);
      logger.info(`[ConnectorRegistry] Deregistered connector: ${name}`);
    }
  }

  public getConnector(connectorId: string): IConnector | undefined {
    return this.connectors.get(connectorId);
  }

  public listConnectors(): IConnector[] {
    return Array.from(this.connectors.values());
  }
}

export const connectorRegistry = ConnectorRegistry.getInstance();
