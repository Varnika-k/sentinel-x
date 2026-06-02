import { v4 as uuidv4 } from 'uuid';
import { logger } from '../../core/logger';
import { SuricataPayload } from './types';
import { SuricataMapper } from './mapper';
import { digitalTwinEngine } from '../../simulation/twin-engine';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';

export interface NormalizedSuricataEvent {
  id: string;
  timestamp: string;
  eventType: 'attack' | 'telemetry' | 'governance' | string;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  nodeId: string;
  infrastructureZone: string;
  attackStage?: 'recon' | 'foothold' | 'lateral' | 'exfiltration' | 'impact';
  propagationRisk: number;
  trustImpact: number;
  correlationId: string;
  message: string;
  telemetry: any;
}

export class SuricataNormalizer {
  /**
   * Normalizes a Suricata event payload into SentinelX Unified Operational Event format.
   * Integrates governance thresholds, risk amplification, and enterprise classifications.
   */
  public static normalize(raw: SuricataPayload): NormalizedSuricataEvent {
    const id = `suricata-${uuidv4()}`;
    const timestamp = raw.timestamp || new Date().toISOString();
    const correlationId = `corr-suricata-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // 1. Map source & destination IPs to node names
    const targetNodeName = SuricataMapper.getOrCreateNodeForIp(raw.dest_ip, 'target');
    const attackerNodeName = SuricataMapper.getOrCreateNodeForIp(raw.src_ip, 'attacker', targetNodeName);

    // 2. Fetch target node state to run Sensitivity Context evaluations
    const targetNode = digitalTwinEngine.nodes.get(targetNodeName);
    const isSensitiveAsset = targetNode?.containsSensitiveAssets || 
                             targetNode?.securityClassification === 'confidential' || 
                             targetNode?.securityClassification === 'restricted';
    const propagationMultiplier = targetNode?.propagationMultiplier || 1.0;

    // 3. Evaluate specific fields based on Suricata event_type
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    let attackStage: 'recon' | 'foothold' | 'lateral' | 'exfiltration' | 'impact' | undefined = undefined;
    let message = `Suricata telemetry captured on [${targetNodeName}]`;
    let category = 'network';
    let riskDelta = 5;

    switch (raw.event_type) {
      case 'alert':
        category = 'attack';
        const signature = raw.alert?.signature || 'Unknown attack pattern detected';
        message = `[Suricata IDS Alert] ${signature} from IP ${raw.src_ip} targeting ${targetNodeName}`;
        
        // Base severity mapping
        const rawSeverity = raw.alert?.severity || 3;
        if (rawSeverity === 1) severity = 'critical';
        else if (rawSeverity === 2) severity = 'high';
        else if (rawSeverity === 3) severity = 'medium';
        else severity = 'low';

        // Infer MITRE Attack stages from Suricata categorizations/signatures
        const signatureLower = signature.toLowerCase();
        if (signatureLower.includes('scan') || signatureLower.includes('port') || raw.alert?.category?.toLowerCase().includes('recon')) {
          attackStage = 'recon';
          riskDelta = 10;
        } else if (signatureLower.includes('exploit') || signatureLower.includes('shellcode') || signatureLower.includes('injection')) {
          attackStage = 'foothold';
          riskDelta = 30;
        } else if (signatureLower.includes('lateral') || signatureLower.includes('ssh brute') || signatureLower.includes('smb') || signatureLower.includes('remote execution')) {
          attackStage = 'lateral';
          riskDelta = 25;
        } else if (signatureLower.includes('exfiltrat') || signatureLower.includes('tunnel') || signatureLower.includes('leak')) {
          attackStage = 'exfiltration';
          riskDelta = 35;
        } else if (signatureLower.includes('ddos') || signatureLower.includes('ransom') || signatureLower.includes('encrypt') || signatureLower.includes('flood')) {
          attackStage = 'impact';
          riskDelta = 40;
        } else {
          attackStage = 'foothold';
          riskDelta = 15;
        }
        break;

      case 'dns':
        category = 'telemetry';
        const queryName = raw.dns?.rrname || 'unknown-query';
        message = `[Suricata DNS] Query: ${queryName} via ${raw.proto.toUpperCase()} port ${raw.src_port}->${raw.dest_port}`;
        
        const isSuspiciousDns = queryName.includes('malware') || 
                               queryName.includes('onion') || 
                               queryName.includes('botnet') || 
                               queryName.includes('tunnel') || 
                               queryName.length > 60; // Potential DGA
        
        if (isSuspiciousDns) {
          severity = 'high';
          attackStage = 'recon';
          message = `[Suricata DNS Threat] Suspicious DNS query resolved: ${queryName} (Potential DGA/Tunneling)`;
          riskDelta = 20;
        } else {
          severity = 'low';
          riskDelta = 2;
        }
        break;

      case 'http':
        category = 'telemetry';
        const urlPath = raw.http?.url || '/';
        const method = raw.http?.http_method || 'GET';
        message = `[Suricata HTTP] ${method} ${raw.http?.hostname || raw.dest_ip}${urlPath}`;
        
        const isSuspiciousHttp = urlPath.includes('etc/passwd') || 
                                urlPath.includes('cmd.exe') || 
                                urlPath.includes('wp-admin') || 
                                urlPath.includes('.php') ||
                                method === 'PUT' || method === 'DELETE';
        
        if (isSuspiciousHttp) {
          severity = 'high';
          attackStage = 'foothold';
          message = `[Suricata HTTP Warning] Malicious web payload signature: ${method} to ${urlPath}`;
          riskDelta = 25;
        } else {
          severity = 'low';
          riskDelta = 3;
        }
        break;

      case 'tls':
        category = 'telemetry';
        const subject = raw.tls?.subject || 'unknown-subject';
        message = `[Suricata TLS] Handshake established with subject: ${subject}`;
        
        const isSuspiciousTls = subject.includes('self-signed') || 
                                subject.includes('untrusted') || 
                                subject === 'localhost' ||
                                raw.tls?.issuerdn?.includes('Let\'s Encrypt') === false && raw.tls?.issuerdn?.includes('CN=') === false;

        if (isSuspiciousTls) {
          severity = 'medium';
          message = `[Suricata TLS Verification] Self-signed/Non-trusted certificate exchanged: ${subject}`;
          riskDelta = 8;
        } else {
          severity = 'low';
          riskDelta = 1;
        }
        break;

      case 'anomaly':
        category = 'telemetry';
        message = `[Suricata Protocol Anomaly] ${raw.anomaly?.event || 'unusual header sizes'}`;
        severity = 'medium';
        riskDelta = 12;
        break;

      case 'flow':
      default:
        category = 'telemetry';
        message = `[Suricata Flow Log] Protocol ${raw.proto.toUpperCase()} packet exchange: ${raw.src_ip}:${raw.src_port} -> ${raw.dest_ip}:${raw.dest_port}`;
        severity = 'low';
        riskDelta = 1;
        break;
    }

    // 4. Governance sensitivity amplification
    let trustImpact = severity === 'critical' ? -45 : severity === 'high' ? -20 : severity === 'medium' ? -8 : -1;
    let propagationRisk = severity === 'critical' ? 0.95 : severity === 'high' ? 0.75 : severity === 'medium' ? 0.35 : 0.05;

    if (isSensitiveAsset) {
      logger.info(`[SuricataNormalizer] Amplifying risk: Security policy violation on high trust asset Node: ${targetNodeName}`);
      
      // Upgrade severity to high/critical for sensitive assets
      if (severity === 'low') severity = 'medium';
      else if (severity === 'medium') severity = 'high';
      else if (severity === 'high') severity = 'critical';

      // Multiply factors
      riskDelta = Math.min(100, riskDelta * propagationMultiplier);
      trustImpact = Math.max(-100, trustImpact * propagationMultiplier);
      propagationRisk = Math.min(1.0, propagationRisk * propagationMultiplier);
      message += ` (!!! GOVERNANCE OUTLIER !!! - Touching asset [${targetNodeName}] classified as ${targetNode?.securityClassification?.toUpperCase()})`;
    }

    // 5. Build our normalized SentinelX Unified Operational Event
    return {
      id,
      timestamp,
      eventType: category === 'attack' ? 'attack' : 'telemetry',
      source: 'SURICATA_IDS_SENSOR',
      severity,
      nodeId: targetNodeName,
      infrastructureZone: targetNode?.namespace || 'external',
      attackStage,
      propagationRisk,
      trustImpact,
      correlationId,
      message,
      telemetry: {
        raw_type: raw.event_type,
        attacker_node: attackerNodeName,
        attacker_ip: raw.src_ip,
        target_ip: raw.dest_ip,
        proto: raw.proto,
        src_port: raw.src_port,
        dest_port: raw.dest_port,
        flow_id: raw.flow_id,
        is_sensitive: isSensitiveAsset,
        classification: targetNode?.securityClassification || 'public',
        original_payload: {
          alert: raw.alert,
          dns: raw.dns,
          http: raw.http,
          tls: raw.tls,
          anomaly: raw.anomaly
        }
      }
    };
  }
}
