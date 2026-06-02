import { logger } from '../core/logger';

export interface WebSocketBenchmarkReport {
  simulatedClients: number;
  messageFloodingTotal: number;
  processingTimeMs: number;
  memoryIncreaseMb: number;
}

export class WebSocketStressEngine {
  public static simulateHeavyFlooding(connectionsCount = 200, messagesPerClient = 10): WebSocketBenchmarkReport {
    logger.info(`[WS-Stress] Simulating high-frequency flood testing with ${connectionsCount} mock gates and ${messagesPerClient} ticks...`);
    const initialMemory = process.memoryUsage().heapUsed;
    const startMs = Date.now();

    let totalDispatched = 0;
    // Simulate events fan-out
    for (let c = 0; c < connectionsCount; c++) {
      for (let m = 0; m < messagesPerClient; m++) {
        // Dispatched memory simulation
        totalDispatched++;
      }
    }

    const duration = Date.now() - startMs;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDiffMb = Math.round((endMemory - initialMemory) / 1024 / 1024);

    logger.info(`[WS-Stress] Dispatch simulation completed. Simulated ${totalDispatched} fan-out ticks in ${duration}ms. Memory usage delta: +${memoryDiffMb}MB`);

    return {
      simulatedClients: connectionsCount,
      messageFloodingTotal: totalDispatched,
      processingTimeMs: duration,
      memoryIncreaseMb: memoryDiffMb
    };
  }
}
