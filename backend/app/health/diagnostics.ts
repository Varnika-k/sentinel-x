import { Request, Response } from 'express';
import { checkGlobalHealth } from './health';
import { TelemetryHealthIndicator } from '../observability/telemetry-health';
import { IngestionMonitor } from '../observability/ingestion-monitor';
import { RuntimeProfiler } from '../observability/runtime-profiler';

export async function handleDiagnostics(req: Request, res: Response): Promise<void> {
  try {
    const coreHealth = await checkGlobalHealth();
    
    // Harvest additional diagnostic telemetry
    const flowStats = IngestionMonitor.harvestPeriodStats();
    let diagnosticScore = 100;
    const warnings: string[] = [];

    if (coreHealth.components.database.status === 'DOWN') {
      diagnosticScore -= 50;
      warnings.push('Database interface currently unreachable.');
    }
    if (coreHealth.components.redis.isMock) {
      diagnosticScore -= 15;
      warnings.push('Operating with Mock Pub/Sub subsystem. Scale throughput may be capped.');
    }

    res.status(200).json({
      success: true,
      diagnosticScore,
      timestamp: new Date().toISOString(),
      warnings,
      systemState: {
        uptime: coreHealth.uptime,
        memoryUsage: coreHealth.memory,
        cpuUsage: process.cpuUsage(),
        nodeVersion: process.version
      },
      telemetryThroughput: {
        eventsPerSec: flowStats.eventsPerSec,
        uncompressedKbps: flowStats.uncompressedKbps,
        averageLatencyMs: flowStats.averageLatencyMs,
        activeTunnelsCount: flowStats.activeTunnels
      },
      database: coreHealth.components.database,
      pubsub: coreHealth.components.redis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
      timestamp: new Date().toISOString()
    });
  }
}
