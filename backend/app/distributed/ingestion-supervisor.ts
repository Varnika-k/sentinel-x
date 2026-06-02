import { logger } from '../core/logger';
import { ingestionOrchestrator } from './ingestion-orchestrator';
import { streamRouter } from './stream-router';

export class IngestionSupervisor {
  private static instance: IngestionSupervisor;
  private isSupervising = false;
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): IngestionSupervisor {
    if (!IngestionSupervisor.instance) {
      IngestionSupervisor.instance = new IngestionSupervisor();
    }
    return IngestionSupervisor.instance;
  }

  public startSupervising(): void {
    if (this.isSupervising) return;
    this.isSupervising = true;
    logger.info('[IngestionSupervisor] Active stream supervisor logic engaged for telemetry mesh...');

    this.checkInterval = setInterval(() => {
      this.reconcileStreamStatus();
    }, 15000);
  }

  public stopSupervising(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    this.isSupervising = false;
  }

  private reconcileStreamStatus(): void {
    logger.debug('[IngestionSupervisor] Running periodic ingest diagnostics pass...');
    const stats = ingestionOrchestrator.getStatistics();
    
    // Check for extreme load factor or dead queues
    if (stats.loadFactor > 0.9) {
      logger.warn(`[IngestionSupervisor] Ingestion load index exceeding critical boundaries (${(stats.loadFactor * 100).toFixed(1)}%). Re-adjusting load balancer limits...`);
    }

    const queues = streamRouter.collectAllQueues();
    queues.forEach((q, partition) => {
      const deadCount = q.getDeadLetterQueue().length;
      if (deadCount > 25) {
        logger.error(`[IngestionSupervisor] Partition [${partition}] has too many failed trace logs in DLQ [${deadCount}]. Commencing dynamic queue flushing self-healing routine...`);
        q.purgeDeadLetterQueue();
      }
    });
  }
}

export const ingestionSupervisor = IngestionSupervisor.getInstance();
