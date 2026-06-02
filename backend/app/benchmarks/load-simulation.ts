import { telemetryPipeline } from '../telemetry/pipeline';
import { logger } from '../core/logger';

export interface BenchmarkResult {
  durationMs: number;
  eventsProcessed: number;
  eventsPerSecond: number;
  averageCpuIncreasePercent: number;
}

export class LoadBenchmarkEngine {
  public static async runIngestionBenchmark(eventCount = 500): Promise<BenchmarkResult> {
    logger.info(`[Benchmark] Initializing dynamic telemetry pipeline ingestion test with ${eventCount} operations...`);
    const startTimeCount = Date.now();
    const cpuStart = process.cpuUsage();

    let processedCount = 0;
    for (let i = 0; i < eventCount; i++) {
      try {
        await telemetryPipeline.ingestFalcoAlert({
          rule: 'Benchmark Unauthorized Container Connection Spec',
          priority: 'Critical',
          output: `Syscall unauthorized network connection initiated in run step ${i}`,
          targetNode: i % 2 === 0 ? 'k8s-svc-ingress-nginx' : 'db-core-master',
          correlationId: `bench-corr-${i}`,
          namespace: 'production'
        });
        processedCount++;
      } catch (err) {
        logger.error('[Benchmark] Ingestion error', err);
      }
    }

    const durationMs = Date.now() - startTimeCount;
    const cpuEnd = process.cpuUsage(cpuStart);
    const cpuTotal = (cpuEnd.user + cpuEnd.system) / 1000; // in milliseconds
    const averageCpuIncreasePercent = (cpuTotal / durationMs) * 100;

    const eventsPerSecond = Math.round((processedCount / (durationMs / 1000)) * 100) / 100;
    
    logger.info(`[Benchmark] Ingestion benchmark finished. Processed ${processedCount} events in ${durationMs}ms (${eventsPerSecond} events/sec). CPU load index: ${averageCpuIncreasePercent.toFixed(2)}%`);

    return {
      durationMs,
      eventsProcessed: processedCount,
      eventsPerSecond,
      averageCpuIncreasePercent
    };
  }
}
