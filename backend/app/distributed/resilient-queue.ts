import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';

export class ResilientQueue {
  private queue: CanonicalTelemetryEvent[] = [];
  private deadLetterQueue: CanonicalTelemetryEvent[] = [];
  private retryAttempts: Map<string, number> = new Map();
  private maxRetries = 3;

  constructor(private queueName: string) {}

  public enqueue(event: CanonicalTelemetryEvent): void {
    this.queue.push(event);
    logger.debug(`[ResilientQueue:${this.queueName}] Enqueued event ${event.eventId}. Active length: ${this.queue.length}`);
  }

  public dequeue(): CanonicalTelemetryEvent | undefined {
    return this.queue.shift();
  }

  public getLength(): number {
    return this.queue.length;
  }

  public handleFailedIngestion(event: CanonicalTelemetryEvent, error: any): void {
    const currentRetries = this.retryAttempts.get(event.eventId) || 0;
    if (currentRetries < this.maxRetries) {
      const nextRetries = currentRetries + 1;
      this.retryAttempts.set(event.eventId, nextRetries);
      logger.warn(`[ResilientQueue:${this.queueName}] Ingestion failed for ${event.eventId} (Attempt ${nextRetries}/${this.maxRetries}). Re-enqueueing... Error: ${error.message || error}`);
      
      // Re-add to head of queue for priority retry
      this.queue.unshift(event);
    } else {
      logger.error(`[ResilientQueue:${this.queueName}] Max retries exceeded for event ${event.eventId}. Moving to Dead Letter Queue.`);
      this.deadLetterQueue.push(event);
      this.retryAttempts.delete(event.eventId);
    }
  }

  public getDeadLetterQueue(): CanonicalTelemetryEvent[] {
    return this.deadLetterQueue;
  }

  public purgeDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }
}
