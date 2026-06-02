import { prometheusRegistry } from './metrics';
import { ingestionOrchestrator } from '../distributed/ingestion-orchestrator';

export interface IngestionHealthStatus {
  status: 'optimal' | 'degraded' | 'critical';
  throughputLastMin: number;
  unresolvedDropsCount: number;
  bufferUsageRatio: number;
  healthFactorScore: number;
}

export class TelemetryHealthIndicator {
  public static getOverallHealth(): IngestionHealthStatus {
    const stats = ingestionOrchestrator.getStatistics();
    
    const bufferUsageRatio = stats.loadFactor;
    const throughput = stats.processedEventsCount;
    const drops = stats.droppedEventsCount;

    // Evaluate health score out of 100
    let healthFactorScore = 100;
    healthFactorScore -= (drops * 5); // Deduct for load drops
    if (bufferUsageRatio > 0.8) {
      healthFactorScore -= 15; // Deduct for high buffer usage
    }
    healthFactorScore = Math.max(10, healthFactorScore);

    let status: 'optimal' | 'degraded' | 'critical' = 'optimal';
    if (healthFactorScore < 50) {
      status = 'critical';
    } else if (healthFactorScore < 85) {
      status = 'degraded';
    }

    // Sync metadata to global gauges
    prometheusRegistry.set('sentinelx_queue_depth_events', Math.round(bufferUsageRatio * 100));

    return {
      status,
      throughputLastMin: throughput,
      unresolvedDropsCount: drops,
      bufferUsageRatio,
      healthFactorScore
    };
  }
}
