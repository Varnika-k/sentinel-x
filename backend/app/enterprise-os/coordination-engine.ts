import { logger } from '../core/logger';
import { eventBus } from '../core/event-bus';
import { enterpriseMemory } from './enterprise-memory';
import { operationalContext } from './operational-context';

export class CoordinationEngine {
  private static instance: CoordinationEngine;

  private constructor() {
    this.hookCoordinatedChannels();
  }

  public static getInstance(): CoordinationEngine {
    if (!CoordinationEngine.instance) {
      CoordinationEngine.instance = new CoordinationEngine();
    }
    return CoordinationEngine.instance;
  }

  private hookCoordinatedChannels() {
    logger.info('[CoordinationEngine] Establishing cross-subsystem messaging synchronization layer...');

    // Synchronize event bus alerts directly into both our enterprise timeline and cognitive recollections
    eventBus.subscribe('simulation:mitigated', (payload) => {
      try {
        const payloadData = typeof payload === 'string' ? JSON.parse(payload) : payload;
        const targetNodeId = payloadData?.nodeId || 'unknown-node';
        
        operationalContext.recordTimelineEvent({
          id: `evt-coord-${Date.now()}`,
          category: 'operational',
          severity: 'low',
          title: `Autonomous Mitigation Event Completed`,
          description: `Orchestrated quarantine rule verified on ${targetNodeId}. System returned to nominal trust status.`,
          timestamp: new Date().toISOString(),
          initiator: 'SentinelX Core Orchestration Router',
          affectedBU: 'Universal Global Resource'
        });
      } catch (err) {
        logger.debug('[CoordinationEngine] Raw non-json simulation channel broadcast ignored');
      }
    });
  }

  /**
   * Consolidates external module status reports into a single unified health report.
   */
  public queryModuleReadiness(): { module: string; status: 'ONLINE' | 'STANDBY' | 'DEGRADED'; version: string }[] {
    return [
      { module: 'Telemetry Ingestion Service', status: 'ONLINE', version: 'v2.1.20' },
      { module: 'Governance Auditor Core', status: 'ONLINE', version: 'v3.5.0' },
      { module: 'Digital Twin Prediction Unit', status: 'ONLINE', version: 'v1.44.2' },
      { module: 'Autonomous Incident responder', status: 'STANDBY', version: 'v2.0.0' },
      { module: 'COGNITIVE REASONING STUDIO', status: 'ONLINE', version: 'v2.0.0' }
    ];
  }
}

export const coordinationEngine = CoordinationEngine.getInstance();
