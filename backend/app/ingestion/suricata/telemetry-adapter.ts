import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../core/logger';
import { NormalizedSuricataEvent } from './normalizer';
import { unifiedEventBus } from '../../../core/event-bus';
import { digitalTwinEngine } from '../../simulation/twin-engine';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { eventBus } from '../../core/event-bus';
import { DatabaseService } from '../../db/service';
import { TelemetryEventType, TelemetryEvent } from '../../schemas/telemetry';
import { telemetryFusionEngine } from '../../intelligence/fusion/fusion-engine';

export class SuricataTelemetryAdapter {
  /**
   * Adapts a normalized Suricata Event into the physical systems of SentinelX.
   * Performs dynamic twin state mutation, threat propagation, and handles SentinelX compliance events.
   */
  public static async processEvent(event: NormalizedSuricataEvent) {
    logger.info(`[SuricataAdapter] Injecting Suricata Alert [${event.id}] into SentinelX Engine Core`, {
      node: event.nodeId,
      severity: event.severity,
      type: event.telemetry.raw_type
    });

    // 1. Mutate active Digital Twin Node State in-memory
    const targetNode = digitalTwinEngine.nodes.get(event.nodeId);
    if (targetNode) {
      const isAttack = event.eventType === 'attack' || event.severity === 'critical' || event.severity === 'high';
      
      // Calculate active risk scores
      const riskDelta = event.severity === 'critical' ? 45 : (event.severity === 'high' ? 25 : 8);
      targetNode.riskScore = Math.max(0, Math.min(100, targetNode.riskScore + riskDelta));
      
      // Upgrade status based on risk scores
      if (targetNode.riskScore >= 75) {
        targetNode.status = 'infected';
      } else if (targetNode.riskScore >= 40) {
        targetNode.status = 'warning';
      }

      // Mutates device loads
      targetNode.cpuLoad = Math.max(10, Math.min(100, targetNode.cpuLoad + (event.severity === 'critical' ? 40 : 15)));
      targetNode.latency = Math.max(2, Math.min(500, targetNode.latency + (event.severity === 'critical' ? 200 : 50)));
      targetNode.activeConnections = Math.max(1, targetNode.activeConnections + (event.eventType === 'attack' ? 12 : 2));

      // Rebuild and perform lateral movement/risk propagation on Graph Intelligence Engine
      graphIntelligenceEngine.rebuildGraph(Array.from(digitalTwinEngine.nodes.values()));
      graphIntelligenceEngine.propagateRiskAndTrust();

      // Emit classic node:update and attack:alert notifications for dual backward compatibility
      eventBus.publish('node:update', {
        source: 'suricata_pipeline',
        nodeId: event.nodeId,
        status: targetNode.status,
        threatScore: targetNode.riskScore,
        vulnerability: targetNode.riskScore / 100,
        lastAction: `SURICATA_${event.telemetry.raw_type.toUpperCase()}_ALARM`
      });

      if (isAttack) {
        eventBus.publish('attack:alert', {
          attackType: event.attackStage || 'Intrusion Alert',
          targetId: event.nodeId,
          severity: event.severity,
          origin: event.telemetry.attacker_node,
          vector: `EXPLOIT_${event.telemetry.raw_type.toUpperCase()}`,
          message: event.message,
          timestamp: event.timestamp
        });
      }
    }

    // 2. Format legacy telemetry model record for direct SQLite database schema compatibility
    const legacyEvent: TelemetryEvent = {
      id: event.id,
      type: event.eventType === 'attack' ? TelemetryEventType.TELEMETRY_ALERT : TelemetryEventType.K8S_AUDIT_LOG_ENTRY,
      severity: event.severity,
      source: 'SURICATA',
      message: event.message,
      timestamp: event.timestamp,
      nodeId: event.nodeId,
      payload: {
        canonical_id: event.id,
        source_type: 'network',
        threat_score: event.severity === 'critical' ? 95 : (event.severity === 'high' ? 75 : 35),
        correlation_id: event.correlationId,
        replay_sequence: 1,
        context: {
          nodeId: event.nodeId,
          ipAddress: event.telemetry.target_ip,
          attackerIp: event.telemetry.attacker_ip,
          attackerNode: event.telemetry.attacker_node,
          proto: event.telemetry.proto,
          srcPort: event.telemetry.src_port,
          destPort: event.telemetry.dest_port
        },
        mutation: {
          riskDelta: event.severity === 'critical' ? 45 : 20,
          statusChange: event.severity === 'critical' ? 'infected' : 'warning'
        },
        mitre: {
          tactics: event.attackStage ? [event.attackStage] : ['Network Intrusion'],
          techniques: [event.telemetry.raw_type],
          ids: ['T1210']
        },
        geo: {
          country: event.telemetry.attacker_ip.startsWith('185.220.') ? 'Russia' : 'Internal Workspace',
          city: 'Proxy Access Point',
          ip: event.telemetry.attacker_ip
        }
      }
    };
    
    await DatabaseService.saveTelemetry(legacyEvent);

    // 3. Inject original attack event into the newer V2 UnifiedEventBus to engage Replays/Slices
    const ingestPayload = {
      id: event.id,
      timestamp: event.timestamp,
      eventType: event.eventType as any,
      source: 'SURICATA',
      severity: event.severity,
      nodeId: event.nodeId,
      infrastructureZone: event.infrastructureZone,
      attackStage: event.attackStage,
      propagationRisk: event.propagationRisk,
      trustImpact: event.trustImpact,
      correlationId: event.correlationId,
      message: event.message,
      telemetry: event.telemetry
    };
    
    await unifiedEventBus.ingestEvent(ingestPayload);

    // Feed event into dynamic multi-source fusion engine
    try {
      telemetryFusionEngine.ingestPlatformSignal({
        id: event.id,
        timestamp: event.timestamp,
        source: 'SURICATA',
        eventType: event.telemetry.raw_type || 'alert',
        severity: event.severity,
        nodeId: event.nodeId,
        attackStage: event.attackStage,
        message: event.message,
        telemetry: event.telemetry
      });
    } catch (err) {
      logger.error('[SuricataAdapter] Telemetry fusion engine ingest failed', err);
    }

    // 4. Generate and inject Governance Telemetry Event if target node has high sensitivity
    if (event.telemetry.is_sensitive) {
      logger.info(`[SuricataAdapter] Generating compliance validation alert for high-value node: ${event.nodeId}`);
      
      const govEventId = `gov-${uuidv4()}`;
      const govEventPayload = {
        id: govEventId,
        timestamp: new Date().toISOString(),
        eventType: 'governance:policy-violation',
        source: 'GOVERNANCE_INTELLIGENCE',
        severity: 'critical',
        nodeId: event.nodeId,
        infrastructureZone: event.infrastructureZone,
        attackStage: event.attackStage,
        propagationRisk: Math.min(1.0, event.propagationRisk * 1.5),
        trustImpact: Math.max(-100, event.trustImpact * 1.5),
        correlationId: event.correlationId,
        message: `GOVERNANCE COMPLIANCE ALERT: Active signature breaching security classification rules on [${event.nodeId}] (${event.telemetry.classification})`,
        telemetry: {
          governance_type: 'asset_protection_violation',
          violation_tier: 'high-exposure',
          classification: event.telemetry.classification,
          original_event_id: event.id,
          exposure_level: 'unauthorized_communication_detected',
          recommendation: 'Autonomous isolation sequence triggered. Rotate credentials immediately.'
        }
      };

      await unifiedEventBus.ingestEvent(govEventPayload);
    }
  }
}
