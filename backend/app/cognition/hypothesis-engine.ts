import { Hypothesis, EvidenceChain, ReasoningContext } from './types';
import { logger } from '../core/logger';

export class HypothesisEngine {
  private static instance: HypothesisEngine;
  private hypothesisStore: Map<string, Hypothesis> = new Map();

  private constructor() {
    this.bootstrapHypotheses();
  }

  public static getInstance(): HypothesisEngine {
    if (!HypothesisEngine.instance) {
      HypothesisEngine.instance = new HypothesisEngine();
    }
    return HypothesisEngine.instance;
  }

  /**
   * Pre-loads default enterprise threat hypotheses for immediate trace correlation
   */
  private bootstrapHypotheses() {
    const defaultHypotheses: Hypothesis[] = [
      {
        id: 'hyp-insider-wright',
        type: 'INSIDER_ATTACK',
        title: 'Possible Insider Information Harvesting',
        description: 'User Evan Wright exhibits suspicious activities including root commands on ingress pods combined with sensitive Payroll database reading during abnormal hours.',
        observedPattern: 'Admin shell spawn → Concurrent VPN geographically separated → Off-hours DB query',
        confidenceScore: 82,
        evidenceChainId: 'chain-wright-correlated',
        underlyingRisks: [
          'Compromised corporate identity',
          'Data theft of payroll schemas',
          'Breach of compliance auditing (GDPR/SOX)'
        ],
        cognitiveImplications: 'Indicates high threat likelihood of active data egress, suggesting lateral movement from external jumpboxes.'
      },
      {
        id: 'hyp-normal-workflow',
        type: 'NORMAL_WORKFLOW',
        title: 'Scheduled Maintenance / Approved System Testing',
        description: 'Anomalous credential accesses mapped to Evan Wright represent a routine operational penetration diagnostic run.',
        observedPattern: 'Admin execution coinciding with scheduled DR simulations',
        confidenceScore: 18,
        evidenceChainId: 'chain-wright-correlated',
        underlyingRisks: [
          'No malicious threat present',
          'Notification failure by SEC ops team'
        ],
        cognitiveImplications: 'Implies false positive warning arising from internal security validation procedures.'
      }
    ];

    defaultHypotheses.forEach(h => this.hypothesisStore.set(h.id, h));
  }

  /**
   * Generates candidate hypotheses by running comparative logical rules on active evidence structures
   */
  public generateHypotheses(chains: EvidenceChain[], context: ReasoningContext): Hypothesis[] {
    const generated: Hypothesis[] = [];

    chains.forEach(chain => {
      const primarySource = chain.primaryEvidence.source;
      const severity = chain.primaryEvidence.severity;
      const associatedEmployees = chain.primaryEvidence.associatedEntities.filter(e => e.type === 'employee');

      // Rule 1: Multi-sector movement + Critical alert -> Credential Abuse Hypothesis
      if (chain.totalWeight > 0.7 && associatedEmployees.length > 0) {
        const username = associatedEmployees[0].name;
        generated.push({
          id: `hyp-cred-abuse-${chain.id}`,
          type: 'CREDENTIAL_ABUSE',
          title: `Potential Credential Hijacking: ${username}`,
          description: `Telemetry and access logs indicate ${username} credentials might be active across multiple geographic locales or nodes concurrently.`,
          observedPattern: 'Sudo operations + Concurrent IP session mappings',
          confidenceScore: Math.floor(chain.totalWeight * 90),
          evidenceChainId: chain.id,
          underlyingRisks: [
            'Identity hijacking',
            'SaaS privilege abuse',
            'Corporate network egress'
          ],
          cognitiveImplications: 'Suggests a hostile takeover of high-privilege credentials. Critical credentials must be rotated immediately.'
        });
      }

      // Rule 2: Ingress Nginx shell access -> Potential Ransomware lateral sweep
      const hasIngressInvolvment = chain.supportingEvidence.some(ev => 
        ev.associatedEntities.some(ent => ent.id.includes('ingress') || ent.name.includes('Nginx'))
      );

      if (hasIngressInvolvment && severity === 'critical') {
        generated.push({
          id: `hyp-ransomware-sweep-${chain.id}`,
          type: 'RANSOMWARE_SWEEP',
          title: 'Active Ransomware Blast Propagation',
          description: 'Topological analysis of ingress compromise suggests malicious entities are sweep-probing backend databases.',
          observedPattern: 'Perimeter bypass → Cluster level shell spawning → Lateral DB discovery requests',
          confidenceScore: 75,
          evidenceChainId: chain.id,
          underlyingRisks: [
            'Widespread database encryption risk',
            'Business logic lockups',
            'Extended application outages'
          ],
          cognitiveImplications: 'High likelihood of network-wide propagation. Active pods must be structurally isolated immediately.'
        });
      }

      // Rule 3: Cloud resource deployment with zero trust anomalies -> Cloud Misconfiguration
      const hasCloudInvolvment = chain.primaryEvidence.associatedEntities.some(ent => ent.type === 'cloud_resource');
      if (hasCloudInvolvment && context.governanceSubset.readinessScore < 75) {
        generated.push({
          id: `hyp-misconfig-${chain.id}`,
          type: 'CLOUD_MISCONFIGURATION',
          title: 'Exposed Governance Violation & Cloud Drift',
          description: 'A cloud deployment has breached the security baseline with exposed IAM permissions without active Zero-Trust tokens.',
          observedPattern: 'Cloud security rule bypass + Declining governance score',
          confidenceScore: 68,
          evidenceChainId: chain.id,
          underlyingRisks: [
            'Public database exposures',
            'Vulnerable network channels'
          ],
          cognitiveImplications: 'Vulnerability represents structural drift rather than intentional compromise, needing policy enforcement.'
        });
      }
    });

    // Save newly generated hypotheses
    generated.forEach(hyp => {
      if (!this.hypothesisStore.has(hyp.id)) {
        this.hypothesisStore.set(hyp.id, hyp);
      }
    });

    // Return the combined collection
    return Array.from(this.hypothesisStore.values());
  }

  public getHypotheses(): Hypothesis[] {
    return Array.from(this.hypothesisStore.values());
  }

  public getHypothesisById(id: string): Hypothesis | undefined {
    return this.hypothesisStore.get(id);
  }

  public addHypothesisDirectly(hypothesis: Hypothesis) {
    this.hypothesisStore.set(hypothesis.id, hypothesis);
  }
}

export const hypothesisEngine = HypothesisEngine.getInstance();
