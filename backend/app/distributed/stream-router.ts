import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';
import { partitionManager } from './partition-manager';
import { ResilientQueue } from './resilient-queue';

export class StreamRouter {
  private partitionQueues: Map<string, ResilientQueue> = new Map();

  constructor() {
    this.initializeRoutingQueues();
  }

  private initializeRoutingQueues(): void {
    const defaultPartitions = partitionManager.getPartitions();
    defaultPartitions.forEach(p => {
      this.partitionQueues.set(p, new ResilientQueue(p));
    });
  }

  public routeEvent(event: CanonicalTelemetryEvent): string {
    const partition = partitionManager.resolvePartition(event);
    let queue = this.partitionQueues.get(partition);
    
    if (!queue) {
      logger.info(`[StreamRouter] On-the-fly partition registration requested for: ${partition}`);
      queue = new ResilientQueue(partition);
      this.partitionQueues.set(partition, queue);
    }

    queue.enqueue(event);
    return partition;
  }

  public getQueueForPartition(partition: string): ResilientQueue | undefined {
    return this.partitionQueues.get(partition);
  }

  public collectAllQueues(): Map<string, ResilientQueue> {
    return this.partitionQueues;
  }
}

export const streamRouter = new StreamRouter();
