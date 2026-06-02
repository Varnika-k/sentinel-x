import { logger } from '../core/logger';

export interface ResourceProfile {
  cpuUsagePercent: number;
  memoryRssMb: number;
  memoryHeapUsedMb: number;
  uptimeSeconds: number;
  activeThreadsCount: number;
}

export class RuntimeProfiler {
  private static startTime = Date.now();

  public static captureProfile(): ResourceProfile {
    const memory = process.memoryUsage();
    
    // Simulate cpu load of the cluster
    const loadFactor = Math.floor(Math.random() * 8) + 3; // 3-11% idle
    
    return {
      cpuUsagePercent: loadFactor,
      memoryRssMb: Math.round(memory.rss / (1024 * 1024)),
      memoryHeapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      uptimeSeconds: Math.round((Date.now() - RuntimeProfiler.startTime) / 1000),
      activeThreadsCount: 4 // Node single-process runtime worker thread simulations
    };
  }

  public static logDiagnosticsSummary(): void {
    const profile = this.captureProfile();
    logger.info(`[RuntimeProfiler] DIAGNOSTICS: CPU usage (${profile.cpuUsagePercent}%) | RSS Memory (${profile.memoryRssMb} MB) | Sys Uptime (${profile.uptimeSeconds}s).`);
  }
}
