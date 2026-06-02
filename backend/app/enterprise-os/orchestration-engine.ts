import { logger } from '../core/logger';
import { eventBus } from '../core/event-bus';
import { enterpriseState } from './enterprise-state';
import { operationalContext } from './operational-context';
import { enterpriseMemory } from './enterprise-memory';

export class OrchestrationEngine {
  private static instance: OrchestrationEngine;

  private constructor() {}

  public static getInstance(): OrchestrationEngine {
    if (!OrchestrationEngine.instance) {
      OrchestrationEngine.instance = new OrchestrationEngine();
    }
    return OrchestrationEngine.instance;
  }

  /**
   * Executes high-severity playbook response channels when anomalous enterprise triggers are detected.
   */
  public triggerCoordinatedRemediationPlaybook(incidentName: string, offendingEntityId: string) {
    logger.warn(`[OrchestrationEngine] EXECUTING COORDINATED REMEDIATION PLAYBOOK FOR: "${incidentName}" on Entity: ${offendingEntityId}`);

    // 1. Send update alert onto the system event bus
    eventBus.publish('orchestration:remediating', JSON.stringify({
      incidentName,
      targetEntityId: offendingEntityId,
      timestamp: new Date().toISOString()
    }));

    // 2. Insert trace record directly into our Enterprise memory registers
    enterpriseMemory.recordMemory(
      'automated_mitigation',
      `Auto-quarantine playbook initiated following structural compromise alert on node ${offendingEntityId}`,
      'critical'
    );

    // 3. Document on the unified global timeline
    operationalContext.recordTimelineEvent({
      id: `evt-playbook-${Date.now()}`,
      category: 'operational',
      severity: 'critical',
      title: 'Auto-Remediation Playbook Initiated',
      description: `Active system quarantine triggered. Isolating offending node ${offendingEntityId} from the enterprise backends.`,
      timestamp: new Date().toISOString(),
      initiator: 'SentinelX Orchestration Engine',
      affectedBU: 'Human Resource Operations'
    });
  }
}

export const orchestrationEngine = OrchestrationEngine.getInstance();
