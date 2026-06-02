import { TwinNode, TwinEdge, TwinSnapshot, PredictionResult, AttackSimulationReport, DynamicMitigationStrategy } from './types';
import { infrastructureModel } from './infrastructure-model';
import { operationalState } from './operational-state';
import { trustModel } from './trust-model';
import { governanceModel } from './governance-model';
import { attackSimulator } from './attack-simulator';
import { propagationSimulator } from './propagation-simulator';
import { futureStateEngine } from './future-state-engine';

export class PredictiveTwinEngine {
  private static instance: PredictiveTwinEngine;

  public snapshots: Map<string, TwinSnapshot> = new Map();
  public maxSnapshots = 15;
  public simulationMode: 'live' | 'replay' = 'live';
  public currentScenario: string = 'idle';
  public activeInfections: string[] = [];
  public mitigationStrategies: DynamicMitigationStrategy[] = [];

  private constructor() {
    this.rebuildMitigations();
  }

  public static getInstance(): PredictiveTwinEngine {
    if (!PredictiveTwinEngine.instance) {
      PredictiveTwinEngine.instance = new PredictiveTwinEngine();
    }
    return PredictiveTwinEngine.instance;
  }

  /**
   * Initializes initial baseline snapshot representational states
   */
  public generateBaselineSnapshot(label: string = 'Baseline System State'): TwinSnapshot {
    infrastructureModel.refreshFromLiveGraph();
    const nodes = infrastructureModel.getNodes();
    const edges = infrastructureModel.getEdges();

    const nodeCopy: { [name: string]: TwinNode } = {};
    nodes.forEach((n, key) => {
      nodeCopy[key] = { ...n };
    });

    const audit = governanceModel.auditCompliance(nodes);
    const overallHealthScore = Math.max(20, Math.round(
      Array.from(nodes.values()).reduce((sum, n) => sum + (100 - (n.governanceRisk || 0)), 0) / nodes.size
    ));

    const snapshot: TwinSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date().toISOString(),
      label,
      description: `Checkpoint of enterprise structural graph layout. Node count: ${nodes.size}`,
      threatLevel: Math.round(100 - overallHealthScore),
      resilienceScore: Math.round((overallHealthScore * 0.7) + (audit.complianceScore * 0.3)),
      nodes: nodeCopy,
      edges: [...edges],
      governanceComplianceScore: audit.complianceScore,
      overallHealthScore
    };

    this.snapshots.set(snapshot.id, snapshot);
    if (this.snapshots.size > this.maxSnapshots) {
      const keys = Array.from(this.snapshots.keys());
      this.snapshots.delete(keys[0]); // pop oldest
    }

    return snapshot;
  }

  /**
   * Rolls back the twin engine database layout to a previously checkpointed snapshot.
   */
  public rollbackToSnapshot(snapshotId: string): boolean {
    const snap = this.snapshots.get(snapshotId);
    if (!snap) return false;

    // Flush and load snap structures
    const nodes = infrastructureModel.getNodes();
    nodes.clear();
    Object.entries(snap.nodes).forEach(([name, node]) => {
      nodes.set(name, { ...node });
    });

    // Rebuild active infection lists
    this.activeInfections = [];
    nodes.forEach(n => {
      if (n.status === 'infected') {
        this.activeInfections.push(n.name);
      }
    });

    return true;
  }

  /**
   * Advances simulation time-ticks and evaluates logical progression
   */
  public advanceSimulation(): {
    infectedCount: number;
    warningsList: string[];
    riskForecast: PredictionResult;
  } {
    const nodes = infrastructureModel.getNodes();
    
    // Simulate propagation step
    const propagation = propagationSimulator.propagateStep(nodes);

    // Recompute infections
    this.activeInfections = [];
    nodes.forEach(node => {
      // Re-evaluate trusts on each tick
      node.trustScore = trustModel.recalculateNodeTrust(node);
      if (node.status === 'infected') {
        this.activeInfections.push(node.name);
      }
    });

    // Conduct audit
    const compliance = governanceModel.auditCompliance(nodes);

    // Compute dynamic risk forecast
    const riskForecast = futureStateEngine.generateFutureRiskForecast(this.activeInfections);

    // Auto-update mitigations recommendations priority based on threat factors
    this.mitigationStrategies.forEach(mit => {
      const isTargetCompromised = mit.targetNodes.some(name => {
        const n = nodes.get(name);
        return n && (n.status === 'infected' || n.status === 'critical');
      });

      if (isTargetCompromised && mit.priority !== 'critical') {
        mit.priority = 'critical';
      }
    });

    return {
      infectedCount: this.activeInfections.length,
      warningsList: propagation.warningsTriggered,
      riskForecast
    };
  }

  /**
   * Generates dynamic automated mitigation plans (Recommendations)
   */
  public rebuildMitigations() {
    this.mitigationStrategies = [
      {
        id: 'mit-001',
        recommendationType: 'CONTAINMENT_PLAN',
        title: 'Isolate k8s Ingress Controller Traffic Segment',
        description: 'Establish ingress strict isolation vectors blocking connection pools from peripheral HQ subnet directions.',
        priority: 'high',
        targetNodes: ['k8s-svc-ingress-nginx'],
        actionToken: 'MITIGATE_ACTIVATE_INGRESS_ISOLATION',
        resilienceImpactValue: 15,
        staged: false
      },
      {
        id: 'mit-002',
        recommendationType: 'PROPAGATION_LIMIT',
        title: 'Enforce Auth API Zero-Trust Multi-Factor Check',
        description: 'Introduce immediate high-entropy ticket validation restricting automated lateral proxy credentials leakage.',
        priority: 'medium',
        targetNodes: ['k8s-pod-auth-api-559b'],
        actionToken: 'MITIGATE_ENFORCE_MFA_AUTHAPI',
        resilienceImpactValue: 12,
        staged: false
      },
      {
        id: 'mit-003',
        recommendationType: 'TRUST_REINFORCEMENT',
        title: 'Rotate Core Database Crypt Vault Keys',
        description: 'Revoke and rotate cloud KMS secrets configurations, severing active credential compromise paths.',
        priority: 'critical',
        targetNodes: ['db-core-master', 'secrets-vault-config'],
        actionToken: 'MITIGATE_KEY_ROTATION_DB',
        resilienceImpactValue: 25,
        staged: false
      },
      {
        id: 'mit-004',
        recommendationType: 'GOVERNANCE_HARDENING',
        title: 'Strict Subnet Micro-Segmentation Partitioning',
        description: 'Formally deploy Suricata egress boundaries dividing corporate HQ and serverless cloud domains.',
        priority: 'high',
        targetNodes: ['pc-admin-hq', 'aws-lambda-payment-processor'],
        actionToken: 'MITIGATE_SUBNET_SEGMENTATION',
        resilienceImpactValue: 18,
        staged: false
      },
      {
        id: 'mit-005',
        recommendationType: 'SENSITIVE_ZONE_PROTECTION',
        title: 'Quarantine compromised finance workstation domain',
        description: 'Auto-revocation of active directory profiles flagged with suspicious high risk anomaly indexes (>55%).',
        priority: 'medium',
        targetNodes: ['dept-finance-workstation'],
        actionToken: 'MITIGATE_QUARANTINE_FINANCE',
        resilienceImpactValue: 20,
        staged: false
      }
    ];
  }

  /**
   * Promotes mitigation task into 'staged' status
   */
  public stageMitigation(id: string): boolean {
    const mit = this.mitigationStrategies.find(m => m.id === id);
    if (mit) {
      mit.staged = true;

      // Apply positive resilience feedback loop to targeted node parameters as a simulated outcome
      const nodes = infrastructureModel.getNodes();
      mit.targetNodes.forEach(target => {
        const node = nodes.get(target);
        if (node) {
          node.resilienceScore = Math.min(100, node.resilienceScore + mit.resilienceImpactValue);
          node.exposureScore = Math.max(5, node.exposureScore - Math.round(mit.resilienceImpactValue * 0.8));
          if (node.status === 'warning') {
            node.status = 'healthy';
          }
        }
      });

      return true;
    }
    return false;
  }
}

export const predictiveTwinEngine = PredictiveTwinEngine.getInstance();
