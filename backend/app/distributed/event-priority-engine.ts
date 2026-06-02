import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';

export type EventPriority = 'NORMAL' | 'HIGH' | 'CRITICAL_BYPASS';

export class EventPriorityEngine {
  public static evaluatePriority(event: CanonicalTelemetryEvent): EventPriority {
    // 1. Check severity first
    if (event.severity === 'critical') {
      return 'CRITICAL_BYPASS';
    }

    // 2. Check source / threat profile
    if (event.threatScore && event.threatScore >= 80) {
      return 'CRITICAL_BYPASS';
    }

    // 3. Check for specific sensitive systems or trust breach pathways
    const targetNode = event.targetNode || '';
    const containsSensitive = event.infrastructureContext?.namespace === 'db-tier' || 
                              event.infrastructureContext?.namespace === 'security' ||
                              targetNode === 'k8s-pod-auth-api-559b' || 
                              targetNode === 'azure-vm-ad-connector' || 
                              targetNode === 'iam-root-account';

    if (containsSensitive && (event.severity === 'high' || event.mutationPayload?.statusChange === 'infected')) {
      logger.info(`[EventPriorityEngine] Escalating event ${event.eventId} targeting critical asset [${targetNode}] to CRITICAL_BYPASS.`);
      return 'CRITICAL_BYPASS';
    }

    if (event.severity === 'high' || event.mutationPayload?.riskDelta && event.mutationPayload.riskDelta > 20) {
      return 'HIGH';
    }

    return 'NORMAL';
  }
}
