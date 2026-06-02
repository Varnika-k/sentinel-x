import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';

export class TelemetryBalancer {
  private inFlightConnections = 0;
  private maxInFlight = 200;
  private dropRatio = 0.05; // Drop factor simulation under load shedding

  public evaluateLease(event: CanonicalTelemetryEvent): { allowed: boolean; delayMs: number } {
    if (this.inFlightConnections >= this.maxInFlight) {
      if (Math.random() < this.dropRatio && event.severity !== 'critical') {
        logger.error(`[TelemetryBalancer] Load shedding active! Low-priority event ${event.eventId} dropped to enforce ingestion stability.`);
        return { allowed: false, delayMs: 0 };
      }
      
      const backoffDelay = Math.min(2500, (this.inFlightConnections - this.maxInFlight) * 25);
      return { allowed: true, delayMs: backoffDelay };
    }

    return { allowed: true, delayMs: 0 };
  }

  public leaseConnection(): void {
    this.inFlightConnections++;
  }

  public releaseConnection(): void {
    this.inFlightConnections = Math.max(0, this.inFlightConnections - 1);
  }

  public getLoadFactor(): number {
    return Math.min(1.0, this.inFlightConnections / this.maxInFlight);
  }
}

export const telemetryBalancer = new TelemetryBalancer();
