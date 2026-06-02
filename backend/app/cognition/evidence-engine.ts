import { Evidence, EvidenceChain } from './types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../core/logger';

export class EvidenceEngine {
  private static instance: EvidenceEngine;
  private evidenceStore: Map<string, Evidence> = new Map();
  private chainsStore: Map<string, EvidenceChain> = new Map();

  private constructor() {
    this.bootstrapEvidenceStore();
  }

  public static getInstance(): EvidenceEngine {
    if (!EvidenceEngine.instance) {
      EvidenceEngine.instance = new EvidenceEngine();
    }
    return EvidenceEngine.instance;
  }

  /**
   * Pre-loads default correlated operational samples for instant intelligence.
   */
  private bootstrapEvidenceStore() {
    const defaultEvidences: Evidence[] = [
      {
        id: 'ev-wazuh-root-001',
        title: 'Unauthorized Sudo Attempt on Kubernetes Node',
        description: 'Syslog flag from wazuh indicated user evan.wright executing sudo -i inside pod boundary.',
        source: 'telemetry',
        severity: 'high',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        associatedEntities: [
          { id: 'k8s-svc-ingress-nginx', type: 'infra_node', name: 'Nginx-Ingress' },
          { id: 'usr-wright', type: 'employee', name: 'Evan Wright' }
        ],
        reliabilityScore: 0.95
      },
      {
        id: 'ev-identity-vpn-002',
        title: 'Anomalous Concurrent VPN Session',
        description: 'VPN connector logged simultaneous logins for evan.wright from London and Singapore within 11 minutes.',
        source: 'identity',
        severity: 'critical',
        timestamp: new Date(Date.now() - 3400000).toISOString(),
        associatedEntities: [
          { id: 'usr-wright', type: 'employee', name: 'Evan Wright' },
          { id: 'corporate-network', type: 'cloud_resource', name: 'Gov VPN Connector' }
        ],
        reliabilityScore: 0.85
      },
      {
        id: 'ev-gov-gcp-003',
        title: 'Sensitive DB Access Outside Scheduled Hours',
        description: 'Audit database logged read scan on Payroll sensitive Tables at 03:14 AM local time.',
        source: 'governance',
        severity: 'high',
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        associatedEntities: [
          { id: 'payroll-db', type: 'database', name: 'Enterprise Payroll Core' },
          { id: 'usr-wright', type: 'employee', name: 'Evan Wright' }
        ],
        reliabilityScore: 0.9
      },
      {
        id: 'ev-falco-bash-004',
        title: 'Falco Privileged Shell Spawned',
        description: 'Docker process supervisor raised a critical alarm indicating namespace isolation bypass on core cluster node.',
        source: 'telemetry',
        severity: 'critical',
        timestamp: new Date().toISOString(),
        associatedEntities: [
          { id: 'k8s-svc-ingress-nginx', type: 'infra_node', name: 'Nginx-Ingress' }
        ],
        reliabilityScore: 0.98
      }
    ];

    defaultEvidences.forEach(ev => this.evidenceStore.set(ev.id, ev));

    // Compile an initial chain
    const firstChain: EvidenceChain = {
      id: 'chain-wright-credential-compromise',
      summary: 'Aggregated signs of credential compromise for user Evan Wright, spanning perimeter VPN and core DB services.',
      primaryEvidence: defaultEvidences[1],
      supportingEvidence: [defaultEvidences[0], defaultEvidences[2]],
      counterEvidence: [],
      totalWeight: 0.89
    };
    this.chainsStore.set(firstChain.id, firstChain);
  }

  /**
   * Translates active telemetry and security logs into structured digital evidence.
   */
  public generateEvidenceFromContext(
    telemetryData: any[],
    identityAnomalies: any[],
    governanceViolations: any[]
  ): Evidence[] {
    const list: Evidence[] = [];

    // Convert raw telemetry alerts
    telemetryData.forEach((t, i) => {
      const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
        low: 'low',
        medium: 'medium',
        high: 'high',
        critical: 'critical'
      };
      
      const targetSeverity = severityMap[String(t.severity).toLowerCase()] || 'medium';

      list.push({
        id: `ev-telemetry-${t.id || i}-${Math.floor(Math.random() * 10000)}`,
        title: t.message ? t.message.substring(0, 50) : `Telemetry alert from ${t.source}`,
        description: t.message || `An alert of type ${t.eventType} was compiled.`,
        source: 'telemetry',
        severity: targetSeverity,
        timestamp: t.timestamp || new Date().toISOString(),
        associatedEntities: t.nodeId ? [{ id: t.nodeId, type: 'infra_node', name: t.nodeId }] : [],
        reliabilityScore: t.reliability || 0.8
      });
    });

    // Convert Identity Anomalies
    identityAnomalies.forEach((idAnom, i) => {
      list.push({
        id: `ev-identity-${idAnom.id || i}-${Math.floor(Math.random() * 10000)}`,
        title: `Anomaly for ${idAnom.username || 'System Principal'}`,
        description: idAnom.riskDescription || idAnom.reason || 'Unexpected access pattern detected.',
        source: 'identity',
        severity: idAnom.riskScore > 80 ? 'critical' : idAnom.riskScore > 50 ? 'high' : 'medium',
        timestamp: idAnom.timestamp || new Date().toISOString(),
        associatedEntities: [
          { id: idAnom.username || 'unknown', type: 'employee', name: idAnom.username || 'Principal' }
        ],
        reliabilityScore: 0.83
      });
    });

    // Convert Governance violations
    governanceViolations.forEach((viol, i) => {
      list.push({
        id: `ev-gov-${viol.id || i}-${Math.floor(Math.random() * 10000)}`,
        title: `Governance Violation: ${viol.rule || 'Zero-Trust Breach'}`,
        description: viol.description || 'Enterprise security schema compliance warning.',
        source: 'governance',
        severity: 'high',
        timestamp: viol.timestamp || new Date().toISOString(),
        associatedEntities: viol.nodeName ? [{ id: viol.nodeName, type: 'infra_node', name: viol.nodeName }] : [],
        reliabilityScore: 0.91
      });
    });

    // Merge into our operational cache
    list.forEach(ev => this.evidenceStore.set(ev.id, ev));
    return list;
  }

  /**
   * Re-evaluates all evidence nodes and automatically clusters them into unified chains
   */
  public constructEvidenceChains(): EvidenceChain[] {
    const list = Array.from(this.evidenceStore.values());
    const chains: EvidenceChain[] = [];

    // Grouping by associated Employee ID or service names
    const clusterMap: Record<string, Evidence[]> = {};

    list.forEach(ev => {
      ev.associatedEntities.forEach(ent => {
        const clusterKey = ent.id;
        if (!clusterMap[clusterKey]) {
          clusterMap[clusterKey] = [];
        }
        if (!clusterMap[clusterKey].includes(ev)) {
          clusterMap[clusterKey].push(ev);
        }
      });
    });

    Object.entries(clusterMap).forEach(([entityId, evidences]) => {
      if (evidences.length >= 2) {
        // Find highest reliability/severity item to lead the chain
        const sorted = [...evidences].sort((a, b) => {
          const weightA = a.severity === 'critical' ? 4 : a.severity === 'high' ? 3 : 2;
          const weightB = b.severity === 'critical' ? 4 : b.severity === 'high' ? 3 : 2;
          return (weightB + b.reliabilityScore) - (weightA + a.reliabilityScore);
        });

        const primary = sorted[0];
        const supporting = sorted.slice(1);

        const sumWeight = supporting.reduce((acc, ev) => acc + (ev.reliabilityScore * (ev.severity === 'critical' ? 1.0 : 0.8)), primary.reliabilityScore);
        const normalizedWeight = Math.min(1.0, sumWeight / (supporting.length + 1));

        const chainId = `chain-${entityId.toLowerCase()}-correlated`;
        const existing = this.chainsStore.get(chainId);

        const newChain: EvidenceChain = {
          id: chainId,
          summary: `Correlated behavioral and alert trace linked to entity identity (${entityId}) across ${[...new Set(evidences.map(e => e.source))].join(', ')}.`,
          primaryEvidence: primary,
          supportingEvidence: supporting,
          counterEvidence: existing ? existing.counterEvidence : [],
          totalWeight: Number(normalizedWeight.toFixed(2))
        };

        chains.push(newChain);
        this.chainsStore.set(chainId, newChain);
      }
    });

    // Add bootstrapped chains if no new clusters are compiled
    if (chains.length === 0) {
      return Array.from(this.chainsStore.values());
    }

    return chains;
  }

  public getEvidenceById(id: string): Evidence | undefined {
    return this.evidenceStore.get(id);
  }

  public getEvidenceList(): Evidence[] {
    return Array.from(this.evidenceStore.values());
  }

  public getChainById(id: string): EvidenceChain | undefined {
    return this.chainsStore.get(id);
  }

  public getChains(): EvidenceChain[] {
    return Array.from(this.chainsStore.values());
  }

  public addManualEvidence(evidence: Evidence) {
    this.evidenceStore.set(evidence.id, evidence);
    logger.info(`[EvidenceEngine] Dynamic Evidence node recorded manually: ${evidence.title}`);
  }
}

export const evidenceEngine = EvidenceEngine.getInstance();
