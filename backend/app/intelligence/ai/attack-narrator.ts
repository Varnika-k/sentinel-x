import { GraphNodeState, GraphEdgeState } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';

export class AttackNarrator {
  public drawNarrative(infectedNodeName: string, affectedPaths: any[]): {
    narrativeSummary: string;
    stageMilestones: string[];
    adversaryFocus: string;
    incidentReport: string;
  } {
    logger.debug(`[AttackNarrator] Formulating SOC threat assessment for: ${infectedNodeName}`);

    const infectedCount = affectedPaths.length;
    const stageMilestones: string[] = [];
    let assetClass = 'standard-node';

    if (infectedNodeName === 'k8s-pod-auth-api-559b') {
      stageMilestones.push('INITIAL_FOOT_HOLD: Active microservice container processes flagged with unauthenticated command execution.');
      stageMilestones.push('ZONE_TRAVERSAL: Authenticated API token extraction polling Postgres datastores.');
      assetClass = 'Core Auth Infrastructure';
    } else if (infectedNodeName === 'pc-admin-hq') {
      stageMilestones.push('BOUNDARY_CROSSING: SSH session hijacking established from corporate VPN egress endpoints.');
      stageMilestones.push('PRIVILEGE_ATTACK: System administration terminal logged attempting IAM policy modification.');
      assetClass = 'Corporate Management Workspace';
    } else {
      stageMilestones.push(`INITIAL_ALTER: Intrusive TCP socket traffic targeting [${infectedNodeName}].`);
      stageMilestones.push(`PROPAGATION_DYNAMICS: Neighboring nodes evaluated with high lateral penetration likelihood.`);
    }

    if (infectedCount > 1) {
      stageMilestones.push(`LATERAL_SPREAD: Attack vectors successfully identified an exposure bridge traversing downstream nodes.`);
    }

    const narrativeSummary = `Active compromise identified on [${infectedNodeName}]. Grounded heuristics mapping and telemetry signals confirm cyber-attacks propagating across ${infectedCount} relational node coordinates. Threat containment highly advised.`;
    const adversaryFocus = infectedCount > 2 ? 'Crown Jewels (Data Tier / Directory Core)' : 'Local Foothold Maintenance';

    const incidentReport = `
=== SENTINELX CYBER GOVERNANCE INCIDENT ARCH TYPE ===
[TARGET IDENTIFIED]: ${infectedNodeName} (${assetClass})
[INCIDENT DESCRIPTION]: Infiltration vector spawning remote bash processes and querying active network configurations mapping routing.
[MITRE STAGE ESTIMATED]: Initial Access / Credential Reclamation / Lateral Progression.
[ADVERSARY OBJECTIVE]: ${adversaryFocus}
[KROWN JEWEL AT RISK]: Principal Active Directory systems and persistent DB infrastructure backends.
    `.trim();

    return {
      narrativeSummary,
      stageMilestones,
      adversaryFocus,
      incidentReport
    };
  }
}

export const attackNarrator = new AttackNarrator();
