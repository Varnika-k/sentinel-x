import { EnterpriseTimelineEvent } from './types';
import { eventBus } from '../core/event-bus';
import { logger } from '../core/logger';

export class OperationalContext {
  private static instance: OperationalContext;
  private timelineEvents: EnterpriseTimelineEvent[] = [];

  private constructor() {
    this.bootstrapTimeline();
    this.listenToEnterpriseEvents();
  }

  public static getInstance(): OperationalContext {
    if (!OperationalContext.instance) {
      OperationalContext.instance = new OperationalContext();
    }
    return OperationalContext.instance;
  }

  private bootstrapTimeline() {
    this.timelineEvents = [
      {
        id: 'evt-deploy-1',
        category: 'deployment',
        severity: 'low',
        title: 'Ingress Nginx Router Deployment',
        description: 'Vite & Nginx image updated to baseline v3.12.1-prod with security clusters.',
        timestamp: new Date(Date.now() - 36000000).toISOString(),
        initiator: 'Kubernetes CI/CD Pipeline',
        affectedBU: 'Customer Logistics & Delivery'
      },
      {
        id: 'evt-gov-1',
        category: 'governance',
        severity: 'high',
        title: 'Zero-Trust Multi-Factor Bypass Detected',
        description: 'Employee Evan Wright bypassed strict SSO validation during anomalous geolocation VPN session.',
        timestamp: new Date(Date.now() - 25000000).toISOString(),
        initiator: 'Okta Enforcer agent',
        affectedBU: 'Human Resource Operations'
      },
      {
        id: 'evt-incident-1',
        category: 'incident',
        severity: 'critical',
        title: 'Privileged Shell Spawning on Ingress Gateway',
        description: 'Intrusion detection flagged active interactive bash processes root access on Edge clusters.',
        timestamp: new Date(Date.now() - 12000000).toISOString(),
        initiator: 'SentinelX Falco Correlator',
        affectedBU: 'Customer Logistics & Delivery'
      },
      {
        id: 'evt-business-1',
        category: 'business',
        severity: 'medium',
        title: 'Off-hours Payroll Data Read Query Sequence',
        description: 'Payroll Core Master Database processed heavy query request sequences reading corporate bank ledgers outside working hours.',
        timestamp: new Date(Date.now() - 4000000).toISOString(),
        initiator: 'Postgres Monitoring Agent',
        affectedBU: 'Global Finance & treasury'
      }
    ];
  }

  private listenToEnterpriseEvents() {
    eventBus.subscribe('telemetry:ingested', (payload) => {
      try {
        const payloadData = typeof payload === 'string' ? JSON.parse(payload) : payload;
        if (payloadData?.severity === 'critical' || payloadData?.severity === 'high') {
          this.recordTimelineEvent({
            id: `evt-auto-${Date.now()}`,
            category: 'incident',
            severity: payloadData.severity,
            title: `Anomalous Telemetry: ${payloadData.source || 'Syslog'}`,
            description: payloadData.message || 'Correlated automated anomaly threshold match.',
            timestamp: new Date().toISOString(),
            initiator: 'Telemetry ingestion router',
            affectedBU: 'Universal Global Resource'
          });
        }
      } catch (err) {
        logger.debug('[OperationalContext] Ignored non-json operational stream');
      }
    });
  }

  public getTimelineEvents(): EnterpriseTimelineEvent[] {
    return this.timelineEvents.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  public recordTimelineEvent(event: EnterpriseTimelineEvent) {
    this.timelineEvents.push(event);
    if (this.timelineEvents.length > 100) {
      this.timelineEvents.shift();
    }
    logger.info(`[OperationalContext] Logged Enterprise timeline event: ${event.title}`);
  }
}

export const operationalContext = OperationalContext.getInstance();
