import { v4 as uuidv4 } from 'uuid';
import { logger } from '../core/logger';
import { unifiedEventBus } from '../../core/event-bus';
import { digitalTwinEngine } from '../simulation/twin-engine';
import { graphIntelligenceEngine } from '../simulation/graph-intelligence';
import { eventBus } from '../core/event-bus';
import { DatabaseService } from '../db/service';
import { TelemetryEventType, TelemetryEvent } from '../schemas/telemetry';
import { telemetryFusionEngine } from '../intelligence/fusion/fusion-engine';

// ==============================================================================
// 1. DATA CONTRACT REPRESENTATIONS FOR THIRD-PARTY SYSTEMS
// ==============================================================================

/**
 * Falco Event schema representation (Runtime Container & Host Security Alerts)
 */
export interface FalcoEvent {
  output: string;
  priority: 'Debug' | 'Informational' | 'Notice' | 'Warning' | 'Error' | 'Critical' | 'Alert' | 'Emergency';
  rule: string;
  time: string;
  output_fields: {
    container_id?: string;
    container_name?: string;
    container_image?: string;
    k8s_ns_name?: string;
    k8s_pod_name?: string;
    proc_name: string;
    proc_cmdline: string;
    user_name: string;
    fd_name?: string;
    connection_type?: string;
    sport?: number;
    dport?: number;
    src_ip?: string;
    dst_ip?: string;
    [key: string]: any;
  };
}

/**
 * Wazuh Event schema representation (Host HIDS, Sysmon & Compliance Auditing)
 */
export interface WazuhEvent {
  id: string;
  timestamp: string;
  rule: {
    id: string;
    level: number;
    description: string;
    groups: string[];
    mitre?: {
      id: string[];
      tactic: string[];
      technique: string[];
    };
    pci_dss?: string[];
    gdpr?: string[];
  };
  agent: {
    id: string;
    name: string;
    ip?: string;
  };
  data: {
    srcip?: string;
    dstip?: string;
    srcport?: number;
    dstport?: number;
    user?: string;
    sysmon?: {
      eventID: number;
      processId: number;
      image: string;
      commandLine: string;
      hashes?: string;
    };
    integration_source?: string;
    [key: string]: any;
  };
}

/**
 * Standard RFC 5424 Syslog representation (Hardware & General System Log lines)
 */
export interface SyslogEvent {
  facility: number;
  severity: number;
  version: number;
  timestamp: string;
  hostname: string;
  appName: string;
  procId?: string;
  msgId?: string;
  message: string;
  structuredData?: Record<string, Record<string, string>>;
}

/**
 * OpenTelemetry Log & Metric format representation
 */
export interface OtelSpan {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: string;
  startTimeUnixNano: number;
  endTimeUnixNano: number;
  attributes: Record<string, any>;
  status: { code: number; message?: string };
}

// ==============================================================================
// 2. PRODUCTION INGESTION PROCESSORS & ADAPTERS
// ==============================================================================

export class FalcoTelemetryAdapter {
  /**
   * Translates incoming runtime container and Kubesec audits into Digital Twin actions.
   */
  public static async processEvent(event: FalcoEvent, targetNodeId?: string) {
    const rawSeverity = event.priority;
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      Debug: 'low', Informational: 'low', Notice: 'low',
      Warning: 'medium', Error: 'high', Critical: 'high',
      Alert: 'critical', Emergency: 'critical'
    };
    const severity = severityMap[rawSeverity] || 'medium';
    
    // Auto-discover pod or cluster node matches based on payload mapping
    const nodeId = targetNodeId || event.output_fields.k8s_pod_name || event.output_fields.container_name || 'infra-kubernetes-node-1';
    const eventId = `falco-${uuidv4()}`;

    logger.info(`[FalcoAdapter] Processing runtime intrusion alert: [${event.rule}] on Node: ${nodeId}`);

    // Mutate state in active digital twin memory mapping
    const targetNode = digitalTwinEngine.nodes.get(nodeId);
    if (targetNode) {
      const riskDelta = severity === 'critical' ? 40 : (severity === 'high' ? 25 : 12);
      targetNode.riskScore = Math.max(0, Math.min(100, targetNode.riskScore + riskDelta));
      targetNode.cpuLoad = Math.min(100, targetNode.cpuLoad + (severity === 'critical' ? 30 : 10));
      
      if (targetNode.riskScore >= 70) {
        targetNode.status = 'infected';
      } else if (targetNode.riskScore >= 35) {
        targetNode.status = 'warning';
      }

      graphIntelligenceEngine.rebuildGraph(Array.from(digitalTwinEngine.nodes.values()));
      graphIntelligenceEngine.propagateRiskAndTrust();

      // Emit legacy telemetry feeds
      eventBus.publish('node:update', {
        source: 'falco_runtime',
        nodeId,
        status: targetNode.status,
        threatScore: targetNode.riskScore,
        vulnerability: targetNode.riskScore / 100,
        lastAction: `FALCO_${event.rule.toUpperCase()}`
      });
    }

    // Save standardized baseline telemetry
    const legacyEvent: TelemetryEvent = {
      id: eventId,
      type: TelemetryEventType.K8S_AUDIT_LOG_ENTRY,
      severity,
      source: 'FALCO',
      message: event.output,
      timestamp: event.time || new Date().toISOString(),
      nodeId,
      payload: {
        rule: event.rule,
        raw_output: event.output,
        priority: event.priority,
        fields: event.output_fields
      }
    };
    await DatabaseService.saveTelemetry(legacyEvent);

    // Ingest into event loop
    await unifiedEventBus.ingestEvent({
      id: eventId,
      timestamp: event.time || new Date().toISOString(),
      eventType: 'attack',
      source: 'FALCO',
      severity,
      nodeId,
      infrastructureZone: 'k8s-cluster',
      attackStage: event.rule.toLowerCase().includes('credential') ? 'Credential Access' : 'Execution',
      propagationRisk: severity === 'critical' ? 0.75 : 0.4,
      trustImpact: severity === 'critical' ? -50 : -20,
      correlationId: `corr-falco-${uuidv4().substring(0, 8)}`,
      message: `FALCO CONTAINER ALERT: ${event.output}`,
      telemetry: {
        process: event.output_fields.proc_name,
        cmdline: event.output_fields.proc_cmdline,
        user: event.output_fields.user_name,
        container_id: event.output_fields.container_id,
        rule_name: event.rule
      }
    });

    try {
      telemetryFusionEngine.ingestPlatformSignal({
        id: eventId,
        timestamp: event.time || new Date().toISOString(),
        source: 'FALCO',
        eventType: event.rule,
        severity,
        nodeId,
        attackStage: 'Runtime Intrusion',
        message: event.output,
        telemetry: event.output_fields
      });
    } catch (err) {
      logger.error('[FalcoAdapter] Threat fusion pipeline delivery failed', err);
    }
  }
}

export class WazuhTelemetryAdapter {
  /**
   * Normalizes incoming host IDS logs and Active Directory compliance scans into active SentinelX indicators.
   */
  public static async processEvent(event: WazuhEvent, defaultNode?: string) {
    const rawLevel = event.rule.level;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (rawLevel >= 12) severity = 'critical';
    else if (rawLevel >= 8) severity = 'high';
    else if (rawLevel >= 4) severity = 'medium';

    const nodeId = defaultNode || `infra-host-${event.agent.name.toLowerCase()}` || 'infra-host-sql-server';
    const eventId = `wazuh-${uuidv4()}`;

    logger.info(`[WazuhAdapter] Ingesting host IDS alert level [${rawLevel}] for System [${nodeId}]`);

    const targetNode = digitalTwinEngine.nodes.get(nodeId);
    if (targetNode) {
      const riskDelta = severity === 'critical' ? 50 : (severity === 'high' ? 30 : 15);
      targetNode.riskScore = Math.max(0, Math.min(100, targetNode.riskScore + riskDelta));
      if (targetNode.riskScore >= 80) targetNode.status = 'infected';
      else if (targetNode.riskScore >= 40) targetNode.status = 'warning';

      graphIntelligenceEngine.rebuildGraph(Array.from(digitalTwinEngine.nodes.values()));
      graphIntelligenceEngine.propagateRiskAndTrust();
    }

    const legacyEvent: TelemetryEvent = {
      id: eventId,
      type: TelemetryEventType.TELEMETRY_ALERT,
      severity,
      source: 'WAZUH',
      message: `${event.rule.description} (Agent: ${event.agent.name})`,
      timestamp: event.timestamp || new Date().toISOString(),
      nodeId,
      payload: {
        rule_id: event.rule.id,
        level: rawLevel,
        groups: event.rule.groups,
        mitre: event.rule.mitre,
        compliance: {
          pci_dss: event.rule.pci_dss,
          gdpr: event.rule.gdpr
        },
        host_ip: event.agent.ip,
        sysmon: event.data.sysmon
      }
    };
    await DatabaseService.saveTelemetry(legacyEvent);

    await unifiedEventBus.ingestEvent({
      id: eventId,
      timestamp: event.timestamp || new Date().toISOString(),
      eventType: 'alert',
      source: 'WAZUH',
      severity,
      nodeId,
      infrastructureZone: 'corporate-network',
      attackStage: event.rule.mitre?.tactic?.[0] || 'Malicious Host Behavior',
      propagationRisk: severity === 'critical' ? 0.8 : 0.45,
      trustImpact: severity === 'critical' ? -65 : -25,
      correlationId: `corr-wazuh-${uuidv4().substring(0, 8)}`,
      message: `WAZUH HOST ALERT [Level ${rawLevel}]: ${event.rule.description}`,
      telemetry: {
        agent_id: event.agent.id,
        rule_desc: event.rule.description,
        mitre_ids: event.rule.mitre?.id || [],
        user: event.data.user || 'system'
      }
    });
  }
}

export class SyslogTelemetryAdapter {
  /**
   * Maps traditional log outputs into standardized audit log lines inside the telemetry history ledger.
   */
  public static async processEvent(event: SyslogEvent, nodeHint?: string) {
    const rawSeverity = event.severity; // RFC 5424 severity (0 is Emergency, 7 is Debug)
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (rawSeverity <= 1) severity = 'critical';
    else if (rawSeverity <= 3) severity = 'high';
    else if (rawSeverity <= 4) severity = 'medium';

    const nodeId = nodeHint || `infra-node-${event.hostname.toLowerCase()}` || 'infra-host-sql-server';
    const eventId = `syslog-${uuidv4()}`;

    logger.info(`[SyslogAdapter] Processing traditional Syslog line from [${event.hostname}] app [${event.appName}]`);

    const targetNode = digitalTwinEngine.nodes.get(nodeId);
    if (targetNode && severity === 'critical') {
      targetNode.status = 'infected';
      targetNode.riskScore = Math.min(100, targetNode.riskScore + 30);
      graphIntelligenceEngine.rebuildGraph(Array.from(digitalTwinEngine.nodes.values()));
      graphIntelligenceEngine.propagateRiskAndTrust();
    }

    const legacyEvent: TelemetryEvent = {
      id: eventId,
      type: TelemetryEventType.SYSTEM_LOG,
      severity,
      source: 'SYSLOG',
      message: `[${event.appName}] ${event.message}`,
      timestamp: event.timestamp || new Date().toISOString(),
      nodeId,
      payload: {
        facility: event.facility,
        syslog_severity: event.severity,
        procId: event.procId,
        msgId: event.msgId,
        structuredData: event.structuredData
      }
    };
    await DatabaseService.saveTelemetry(legacyEvent);

    await unifiedEventBus.ingestEvent({
      id: eventId,
      timestamp: event.timestamp || new Date().toISOString(),
      eventType: 'system-event',
      source: 'SYSLOG',
      severity,
      nodeId,
      infrastructureZone: 'internal-servers',
      attackStage: 'Baseline Event Logging',
      propagationRisk: severity === 'critical' ? 0.5 : 0.1,
      trustImpact: severity === 'critical' ? -30 : 0,
      correlationId: `corr-syslog-${uuidv4().substring(0, 8)}`,
      message: `SYSLOG [${event.appName}]: ${event.message}`,
      telemetry: {
        app_name: event.appName,
        host_machine: event.hostname,
        facility_id: event.facility
      }
    });
  }
}

export class OtelTelemetryAdapter {
  /**
   * Processes distributed open-telemetry spans to calculate tracing anomaly scores.
   */
  public static async processTrace(span: OtelSpan, nodeHint?: string) {
    const errorDetected = span.status.code === 2 || span.attributes['error'] === true;
    const severity: 'low' | 'medium' | 'high' | 'critical' = errorDetected ? 'medium' : 'low';
    const nodeId = nodeHint || span.attributes['service.name'] || 'cloud-aws-vpc-production';
    const eventId = `otel-${uuidv4()}`;

    // Compute network latency anomalies
    const latencyNs = span.endTimeUnixNano - span.startTimeUnixNano;
    const latencyMs = latencyNs / 1000000;

    const targetNode = digitalTwinEngine.nodes.get(nodeId);
    if (targetNode) {
      targetNode.latency = Math.max(1, Math.min(1000, Math.round((targetNode.latency * 4 + latencyMs) / 5)));
      if (errorDetected) {
        targetNode.riskScore = Math.min(100, targetNode.riskScore + 5);
      }
    }

    const legacyEvent: TelemetryEvent = {
      id: eventId,
      type: TelemetryEventType.SYSTEM_LOG,
      severity,
      source: 'OPENTELEMETRY',
      message: `OpenTelemetry Span: ${span.name} (Latency: ${latencyMs.toFixed(2)}ms, Status: ${span.status.code === 2 ? 'ERROR' : 'OK'})`,
      timestamp: new Date(span.startTimeUnixNano / 1000000).toISOString(),
      nodeId,
      payload: {
        traceId: span.traceId,
        spanId: span.spanId,
        attributes: span.attributes,
        latency_ms: latencyMs,
        kind: span.kind
      }
    };
    await DatabaseService.saveTelemetry(legacyEvent);

    if (errorDetected && latencyMs > 250) {
      await unifiedEventBus.ingestEvent({
        id: eventId,
        timestamp: new Date().toISOString(),
        eventType: 'alert',
        source: 'OPENTELEMETRY',
        severity: 'medium',
        nodeId,
        infrastructureZone: 'distributed-microservices',
        attackStage: 'Denial of Service (Latency)',
        propagationRisk: 0.2,
        trustImpact: -15,
        correlationId: `corr-otel-${span.traceId.substring(0, 8)}`,
        message: `OTEL TRACE LATENCY WARNING: ${span.name} took ${latencyMs}ms with exception trace`,
        telemetry: {
          trace_id: span.traceId,
          span_id: span.spanId,
          service: span.attributes['service.name'] || 'unknown',
          latency: latencyMs
        }
      });
    }
  }
}
