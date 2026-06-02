import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';
import { streamRouter } from './stream-router';
import { telemetryBalancer } from './telemetry-balancer';
import { EventPriorityEngine } from './event-priority-engine';
import { digitalTwinEngine } from '../simulation/twin-engine';
import { eventBus } from '../core/event-bus';
import { partitionManager } from './partition-manager';

export class IngestionOrchestrator {
  private static instance: IngestionOrchestrator;
  
  private processedEventsCount = 0;
  private highPriorityBypasses = 0;
  private droppedEventsCount = 0;

  private constructor() {}

  public static getInstance(): IngestionOrchestrator {
    if (!IngestionOrchestrator.instance) {
      IngestionOrchestrator.instance = new IngestionOrchestrator();
    }
    return IngestionOrchestrator.instance;
  }

  public async processTelemetryEvent(event: CanonicalTelemetryEvent): Promise<{ success: boolean; partition: string; latencyMs: number }> {
    const startTime = Date.now();
    telemetryBalancer.leaseConnection();

    try {
      // 1. Evaluate load balance lease
      const evaluation = telemetryBalancer.evaluateLease(event);
      if (!evaluation.allowed) {
        this.droppedEventsCount++;
        telemetryBalancer.releaseConnection();
        return { success: false, partition: 'dropped', latencyMs: Date.now() - startTime };
      }

      // Add simulated network lease delay under heavy pool load
      if (evaluation.delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, evaluation.delayMs));
      }

      // 2. Evaluate ingestion priority status
      const priority = EventPriorityEngine.evaluatePriority(event);

      // 3. Route into appropriate partition
      const partition = streamRouter.routeEvent(event);
      this.processedEventsCount++;

      // 4. Force rapid update of state graph for high priority security and policy breaches
      if (priority === 'CRITICAL_BYPASS' || priority === 'HIGH') {
        this.highPriorityBypasses++;
        logger.info(`[IngestionOrchestrator] RAPID GRAPH PROPAGATION forced for priority Event ${event.eventId} (Severity: ${event.severity}).`);
        
        // Dynamically invoke graph intelligence mutations via twin engine
        await digitalTwinEngine.propagateThreat({
          sourceNodeId: event.targetNode,
          threatLevel: event.severity === 'critical' ? 'critical' : 'high',
          rate: 0.85
        } as any);

        // Fan out live socket signals
        await eventBus.publish('telemetry:fusion-update', {
          id: `FUSE-${Date.now().toString().slice(-4)}`,
          overallSeverity: event.severity === 'critical' ? 'critical' : 'high',
          confidenceScore: 98,
          sourcesFused: [event.source, 'Dynamic AI Sandbox Orchestrator'],
          threatNarrative: `AI Engine bypassed normal queuing lines to analyze root privilege threats matching telemetry: [${event.source}] logs.`,
          nodesAffected: [event.targetNode],
          blastRadiusScore: 68,
          riskAmplified: true,
          exposureChain: [event.targetNode, 'pc-admin-hq']
        });
      }

      telemetryBalancer.releaseConnection();
      return {
        success: true,
        partition,
        latencyMs: Date.now() - startTime
      };
    } catch (err) {
      logger.error(`[IngestionOrchestrator] Routing fault for event ${event.eventId}`, err);
      
      const q = streamRouter.getQueueForPartition(partitionManager.resolvePartition(event));
      if (q) {
        q.handleFailedIngestion(event, err);
      }
      
      telemetryBalancer.releaseConnection();
      return { success: false, partition: 'fault', latencyMs: Date.now() - startTime };
    }
  }

  public getStatistics() {
    return {
      processedEventsCount: this.processedEventsCount,
      highPriorityBypasses: this.highPriorityBypasses,
      droppedEventsCount: this.droppedEventsCount,
      loadFactor: telemetryBalancer.getLoadFactor()
    };
  }
}

export const ingestionOrchestrator = IngestionOrchestrator.getInstance();
