import { DecisionGraph, DecisionGraphNode, DecisionGraphEdge, Recommendation, Hypothesis, Evidence } from './types';
import { logger } from '../core/logger';
import { v4 as uuidv4 } from 'uuid';

export class DecisionEngine {
  private static instance: DecisionEngine;

  private constructor() {}

  public static getInstance(): DecisionEngine {
    if (!DecisionEngine.instance) {
      DecisionEngine.instance = new DecisionEngine();
    }
    return DecisionEngine.instance;
  }

  /**
   * Generates actionable enterprise recommendations for active threat scenarios
   */
  public generateRecommendationsForHypothesis(hypothesis: Hypothesis): Recommendation[] {
    const list: Recommendation[] = [];

    if (hypothesis.type === 'INSIDER_ATTACK' || hypothesis.type === 'CREDENTIAL_ABUSE') {
      list.push({
        id: `rec-usr-revoke-${uuidv4().substring(0,6)}`,
        title: 'Revoke and Reset Target Employee Accounts',
        actionableStep: 'Force an immediate global token revocation on Okta and active VPN instances.',
        priority: 'critical',
        mitigationTimeMinutes: 5,
        responsibleTeam: 'Security Operations & IAM Team'
      });
      list.push({
        id: `rec-db-lock-${uuidv4().substring(0,6)}`,
        title: 'Rotate Sensitive Database Connection Credentials',
        actionableStep: 'Redeploy the Payroll microservice secrets via Vault key rotation.',
        priority: 'high',
        mitigationTimeMinutes: 15,
        responsibleTeam: 'Database Administration (DBA)'
      });
    } else if (hypothesis.type === 'RANSOMWARE_SWEEP') {
      list.push({
        id: `rec-node-isolate-${uuidv4().substring(0,6)}`,
        title: 'Topologically Isolate Ingress Pods',
        actionableStep: 'Execute immediate network policy rule to quarantine Nginx-ingress node namespace.',
        priority: 'critical',
        mitigationTimeMinutes: 3,
        responsibleTeam: 'DevOps / Kubernetes SRE'
      });
      list.push({
        id: `rec-backup-verify-${uuidv4().substring(0,6)}`,
        title: 'Perform Snapshot Integrity Diagnostics',
        actionableStep: 'Verify database cold storage backup hashes are uncorrupted.',
        priority: 'high',
        mitigationTimeMinutes: 30,
        responsibleTeam: 'Backup & Disaster Recovery Team'
      });
    } else {
      list.push({
        id: `rec-audit-policy-${uuidv4().substring(0,6)}`,
        title: 'Review Least-Privilege Policies',
        actionableStep: 'Audit active service accounts permissions matching structural rules.',
        priority: 'medium',
        mitigationTimeMinutes: 120,
        responsibleTeam: 'Compliance & Governance Officers'
      });
    }

    return list;
  }

  /**
   * Combines evidences, resolved hypotheses, and recommendations into a unified, clean traceable graph.
   */
  public buildDecisionGraph(
    hypotheses: Hypothesis[],
    evidences: Evidence[]
  ): DecisionGraph {
    logger.info('[DecisionEngine] Assembling traceable Enterprise Decision Graph...');

    const nodes: DecisionGraphNode[] = [];
    const edges: DecisionGraphEdge[] = [];

    // 1. Add Evidence Nodes
    evidences.forEach(ev => {
      nodes.push({
        id: ev.id,
        label: ev.title,
        type: 'EVIDENCE',
        severity: ev.severity,
        metadata: { source: ev.source, reliability: ev.reliabilityScore }
      });
    });

    // 2. Add Hypothesis Nodes
    hypotheses.forEach(hyp => {
      nodes.push({
        id: hyp.id,
        label: hyp.title,
        type: 'HYPOTHESIS',
        severity: hyp.confidenceScore > 75 ? 'critical' : hyp.confidenceScore > 40 ? 'high' : 'medium',
        metadata: { confidence: hyp.confidenceScore, type: hyp.type }
      });

      // Link matched evidence to hypotheses
      // To connect, look up if hypothesis evidence chain includes evidence links, or trace via pattern matches
      evidences.forEach(ev => {
        // Broad tracing for demo: if evidence and hypothesis share keywords (like 'ingress' or employee names)
        const evDesc = ev.title.toLowerCase() + ev.description.toLowerCase();
        const hypDesc = hyp.title.toLowerCase() + hyp.description.toLowerCase();

        const shareEntity = ev.associatedEntities.some(evEnt => 
          hyp.description.toLowerCase().includes(evEnt.name.toLowerCase()) ||
          hyp.title.toLowerCase().includes(evEnt.name.toLowerCase())
        );

        if (shareEntity || evDesc.includes('vpn') && hypDesc.includes('credential') || evDesc.includes('ingress') && hypDesc.includes('ransomware')) {
          edges.push({
            id: `edge-${ev.id}-${hyp.id}`,
            source: ev.id,
            target: hyp.id,
            label: 'Supports'
          });
        }
      });

      // 3. Add Risk Nodes
      hyp.underlyingRisks.forEach((risk, i) => {
        const riskId = `risk-${hyp.id}-${i}`;
        nodes.push({
          id: riskId,
          label: risk,
          type: 'RISK',
          severity: hyp.confidenceScore > 50 ? 'high' : 'medium'
        });

        edges.push({
          id: `edge-${hyp.id}-${riskId}`,
          source: hyp.id,
          target: riskId,
          label: 'Incurs'
        });

        // 4. Add Impact Nodes
        const impactId = `impact-${hyp.id}-${i}`;
        nodes.push({
          id: impactId,
          label: `Business Threat of ${risk.substring(0, 30)}...`,
          type: 'IMPACT',
          severity: hyp.confidenceScore > 70 ? 'critical' : 'high'
        });

        edges.push({
          id: `edge-${riskId}-${impactId}`,
          source: riskId,
          target: impactId,
          label: 'Impacts'
        });
      });

      // 5. Add Recommendations
      const recs = this.generateRecommendationsForHypothesis(hyp);
      recs.forEach(rec => {
        nodes.push({
          id: rec.id,
          label: rec.title,
          type: 'RECOMMENDATION',
          severity: rec.priority,
          metadata: { steps: rec.actionableStep, team: rec.responsibleTeam }
        });

        // Connect recommendation from active hypotheses or impact nodes
        edges.push({
          id: `edge-${hyp.id}-${rec.id}`,
          source: hyp.id,
          target: rec.id,
          label: 'Remediates'
        });
      });
    });

    return { nodes, edges };
  }
}

export const decisionEngine = DecisionEngine.getInstance();
