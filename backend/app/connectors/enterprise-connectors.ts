import { BaseConnector, connectorRegistry } from './connector-base';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';
import { logger } from '../core/logger';

// 1. Wazuh Connector
export class WazuhConnector extends BaseConnector {
  id = 'wazuh-edr';
  name = 'Wazuh EDR Security Connector';
  sourceType = 'endpoint';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const severity = rawEvent.alert?.level >= 12 ? 'critical' : (rawEvent.alert?.level >= 8 ? 'high' : 'medium');
    const threatScore = Math.min(100, (rawEvent.alert?.level || 5) * 8);
    const targetNode = rawEvent.agent?.name || 'pc-admin-hq';

    const evt = this.generateBaseEvent('WAZUH', targetNode, severity, threatScore);
    evt.mutationPayload = {
      statusChange: severity === 'critical' ? 'infected' : 'warning',
      riskDelta: severity === 'critical' ? 40 : 15
    };
    evt.mitreDetails = {
      tactics: rawEvent.rule?.mitre?.tactics || ['Execution'],
      techniques: rawEvent.rule?.mitre?.techniques || ['Command and Scripting Interpreter'],
      ids: rawEvent.rule?.mitre?.id || ['T1059']
    };
    return evt;
  }
}

// 2. Falco Connector
export class FalcoConnector extends BaseConnector {
  id = 'falco-runtime';
  name = 'Falco Cloud Native Container Connector';
  sourceType = 'container';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const priority = rawEvent.priority?.toLowerCase();
    const severity = priority === 'critical' || priority === 'emergency' ? 'critical' : (priority === 'warning' || priority === 'error' ? 'high' : 'medium');
    const targetNode = rawEvent.container_name || 'k8s-pod-auth-api-559b';
    
    const evt = this.generateBaseEvent('FALCO', targetNode, severity, severity === 'critical' ? 95 : 60);
    evt.mutationPayload = {
      statusChange: severity === 'critical' ? 'infected' : 'warning',
      riskDelta: severity === 'critical' ? 45 : 20,
      cpuDelta: 15
    };
    return evt;
  }
}

// 3. Suricata Connector
export class SuricataConnector extends BaseConnector {
  id = 'suricata-ips';
  name = 'Suricata Network IDS Connector';
  sourceType = 'network';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const sev = rawEvent.alert?.severity || 3;
    const severity = sev === 1 ? 'critical' : (sev === 2 ? 'high' : 'medium');
    const targetNode = rawEvent.dest_ip || 'pc-admin-hq';

    const evt = this.generateBaseEvent('SURICATA', targetNode, severity, sev === 1 ? 90 : 55);
    evt.mutationPayload = {
      riskDelta: sev === 1 ? 35 : 12,
      activeConnectionsDelta: 5
    };
    return evt;
  }
}

// 4. Docker Runtime Connector
export class DockerConnector extends BaseConnector {
  id = 'docker-daemon';
  name = 'Docker Engine Daemon Connector';
  sourceType = 'infrastructure';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const severity = rawEvent.status === 'die' || rawEvent.status === 'kill' ? 'high' : 'low';
    const targetNode = rawEvent.Actor?.Attributes?.name || 'k8s-pod-auth-api-559b';

    const evt = this.generateBaseEvent('DOCKER', targetNode, severity, severity === 'high' ? 70 : 15);
    evt.mutationPayload = {
      cpuDelta: rawEvent.status === 'oom' ? 80 : 5,
      statusChange: rawEvent.status === 'die' ? 'isolated' : 'healthy'
    };
    return evt;
  }
}

// 5. System Logs Connector
export class SystemLogsConnector extends BaseConnector {
  id = 'system- syslog';
  name = 'Linux OS syslog Connector';
  sourceType = 'infrastructure';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const isFailedAuth = rawEvent.message?.includes('Failed password') || rawEvent.message?.includes('AUTH_FAIL');
    const severity = isFailedAuth ? 'high' : 'low';
    const targetNode = rawEvent.hostname || 'pc-admin-hq';

    const evt = this.generateBaseEvent('SYSLOG', targetNode, severity, isFailedAuth ? 65 : 10);
    evt.mutationPayload = {
      riskDelta: isFailedAuth ? 25 : 0
    };
    return evt;
  }
}

// 6. Cloud Audit Connector
export class CloudAuditConnector extends BaseConnector {
  id = 'cloudtrail-audit';
  name = 'Cloud Audit AWS CloudTrail Connector';
  sourceType = 'orchestration';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const errorCode = rawEvent.errorCode;
    const severity = errorCode === 'AccessDenied' ? 'high' : 'low';
    const targetNode = rawEvent.userIdentity?.arn || 'iam-root-account';

    const evt = this.generateBaseEvent('AWS_CLOUDTRAIL', targetNode, severity, severity === 'high' ? 75 : 20);
    evt.mutationPayload = {
      riskDelta: severity === 'high' ? 30 : 5,
      statusChange: severity === 'high' ? 'warning' : 'healthy'
    };
    return evt;
  }
}

// 7. Identity Provider (IdP) Connector
export class IdpConnector extends BaseConnector {
  id = 'okta-idp';
  name = 'Okta / Azure AD IdP Connector';
  sourceType = 'identity';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const isAbnormalGeo = rawEvent.outcome?.reason === 'SUSPICIOUS_GEOLOCATION';
    const severity = isAbnormalGeo ? 'critical' : (rawEvent.outcome?.result === 'FAILURE' ? 'high' : 'low');
    const targetNode = rawEvent.actor?.alternateId || 'azure-vm-ad-connector';

    const evt = this.generateBaseEvent('IDP', targetNode, severity, severity === 'critical' ? 88 : 30);
    evt.mutationPayload = {
      riskDelta: severity === 'critical' ? 50 : 10,
      statusChange: severity === 'critical' ? 'infected' : 'healthy'
    };
    return evt;
  }
}

// 8. API Gateway Connector
export class ApiGatewayConnector extends BaseConnector {
  id = 'kong-gateway';
  name = 'Kong API Security Gateway Connector';
  sourceType = 'network';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const isWafBlock = rawEvent.response?.status === 403 && rawEvent.request?.headers?.['x-waf-rule'];
    const severity = isWafBlock ? 'high' : 'low';
    const targetNode = 'k8s-pod-auth-api-559b';

    const evt = this.generateBaseEvent('API_GATEWAY', targetNode, severity, isWafBlock ? 70 : 10);
    evt.mutationPayload = {
      riskDelta: isWafBlock ? 20 : 0
    };
    return evt;
  }
}

// 9. Authentication Systems Connector
export class AuthConnector extends BaseConnector {
  id = 'vault-auth';
  name = 'HashiCorp Vault Authority Connector';
  sourceType = 'identity';

  normalize(rawEvent: any): CanonicalTelemetryEvent {
    const type = rawEvent.type || 'standard_login';
    const isSecretSteal = type === 'secret_unauthorized_read';
    const severity = isSecretSteal ? 'critical' : 'low';
    const targetNode = 'iam-root-account';

    const evt = this.generateBaseEvent('AUTH_SYSTEM', targetNode, severity, isSecretSteal ? 98 : 15);
    evt.mutationPayload = {
      riskDelta: isSecretSteal ? 60 : 0,
      statusChange: isSecretSteal ? 'infected' : 'healthy'
    };
    return evt;
  }
}

// Initialize and Register Connectors
export function initializeEnterpriseConnectors(): void {
  logger.info('[Connectors] Initializing Enterprise Cybersecurity Connectors Grid...');
  connectorRegistry.register(new WazuhConnector());
  connectorRegistry.register(new FalcoConnector());
  connectorRegistry.register(new SuricataConnector());
  connectorRegistry.register(new DockerConnector());
  connectorRegistry.register(new SystemLogsConnector());
  connectorRegistry.register(new CloudAuditConnector());
  connectorRegistry.register(new IdpConnector());
  connectorRegistry.register(new ApiGatewayConnector());
  connectorRegistry.register(new AuthConnector());
}
