import { AdvancedCorrelator } from './correlator';
import { UnifiedCorrelationAlert, CorrelatedAlertCluster } from './types';
import { logger } from '../../core/logger';
import { eventBus } from '../../core/event-bus';
import { realtimeBroadcastSystem } from '../../../core/realtime';

export class IngestionFusionEngine {
  private static instance: IngestionFusionEngine;
  private correlator = AdvancedCorrelator.getInstance();

  private constructor() {
    this.bindEvents();
  }

  public static getInstance(): IngestionFusionEngine {
    if (!IngestionFusionEngine.instance) {
      IngestionFusionEngine.instance = new IngestionFusionEngine();
    }
    return IngestionFusionEngine.instance;
  }

  /**
   * Safe binding wrapper to automatically ingest live signals from existing pub/sub buses
   */
  private bindEvents() {
    logger.info('[FusionEngine] Auto-wiring pubsub event binds for local real-time correlation matches...');

    // Live hook on node updates or attack updates to trigger real-time telemetry correlation matches
    eventBus.subscribe('node:update', (data: any) => {
      try {
        this.ingestPlatformSignal({
          id: `sig-${Math.random().toString(36).substring(2, 8)}`,
          timestamp: new Date().toISOString(),
          source: data.source || 'PLATFORM',
          eventType: 'telemetry_heartbeat',
          severity: data.threatScore > 75 ? 'critical' : (data.threatScore > 40 ? 'high' : 'medium'),
          nodeId: data.nodeId,
          message: data.lastAction || 'Posturing heartbeat update'
        });
      } catch (err) {
        // Suppress background errors
      }
    });

    eventBus.subscribe('attack:alert', (data: any) => {
      try {
        this.ingestPlatformSignal({
          id: `sig-att-${Math.random().toString(36).substring(2, 8)}`,
          timestamp: data.timestamp || new Date().toISOString(),
          source: data.origin === 'SURICATA' ? 'SURICATA' : 'FALCO',
          eventType: 'attack_trigger',
          severity: data.severity || 'high',
          nodeId: data.targetId,
          attackStage: data.attackType,
          message: data.message
        });
      } catch (err) {
        // Suppress background errors
      }
    });
  }

  /**
   * Core entry point to process a new telemetry signal (either Suricata, Falco, or Platform event)
   */
  public ingestPlatformSignal(rawSignal: {
    id: string;
    timestamp: string;
    source: string;
    eventType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    nodeId: string;
    attackStage?: any;
    message: string;
    telemetry?: any;
  }): CorrelatedAlertCluster {
    const alert: UnifiedCorrelationAlert = {
      id: rawSignal.id,
      timestamp: rawSignal.timestamp,
      source: rawSignal.source,
      eventType: rawSignal.eventType,
      severity: rawSignal.severity,
      nodeId: rawSignal.nodeId,
      attackStage: rawSignal.attackStage,
      message: rawSignal.message,
      telemetry: rawSignal.telemetry || {}
    };

    // Correlate
    const cluster = this.correlator.correlate(alert);

    // Broadcast the updated cluster instantly globally via WebSocket so Frontend graph displays can dynamically light up
    eventBus.publish('telemetry:fusion-update', cluster);

    return cluster;
  }

  /**
   * Retrieves active correlated clusters.
   */
  public getActiveClusters(): CorrelatedAlertCluster[] {
    return this.correlator.getClusters();
  }

  /**
   * Resets correlation caches during testing or session transitions.
   */
  public clearAll() {
    this.correlator.clear();
  }
}

export const telemetryFusionEngine = IngestionFusionEngine.getInstance();
