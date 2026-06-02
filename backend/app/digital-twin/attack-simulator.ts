import { TwinNode, AttackStep, AttackSimulationReport } from './types';
import { infrastructureModel } from './infrastructure-model';
import { governanceModel } from './governance-model';
import { trustModel } from './trust-model';
import { v4 as uuidv4 } from 'uuid';

export class AttackSimulator {
  private static instance: AttackSimulator;

  private constructor() {}

  public static getInstance(): AttackSimulator {
    if (!AttackSimulator.instance) {
      AttackSimulator.instance = new AttackSimulator();
    }
    return AttackSimulator.instance;
  }

  /**
   * Forecasts predictive attack paths, dynamic blast radius grids, and compliance costs
   */
  public simulateAttackFromNode(
    scenario: string, 
    startNodeName: string
  ): AttackSimulationReport {
    const nodes = infrastructureModel.getNodes();
    const sourceNode = nodes.get(startNodeName);

    if (!sourceNode) {
      return {
        simulationId: uuidv4(),
        triggerNode: startNodeName,
        timestamp: new Date().toISOString(),
        simulatedScenario: scenario,
        pathsForecasted: [],
        blastRadiusNodes: [],
        vulnerabilitiesExploited: [],
        estimatedComplianceLoss: 0,
        governanceCollapseZoneCount: 0,
        trustDeclinePercentage: 0,
        confidenceScore: 0
      };
    }

    const blastRadiusNodes: string[] = [startNodeName];
    const pathsForecasted: AttackStep[][] = [];
    const vulnerabilitiesExploited: string[] = [];

    // Simple BFS/Dijkstra to trace paths based on relationships
    const queue: { current: string; path: string[]; currentProbability: number }[] = [
      { current: startNodeName, path: [startNodeName], currentProbability: 1.0 }
    ];
    const visited = new Set<string>([startNodeName]);

    // Track exploited vulnerabilities depending on Node Types
    const getVulnerabilitiesForType = (type: string): string => {
      switch (type) {
        case 'K8S_SERVICE': return 'CVE-2025-4552 (Ingress Controller Insecure Ingress Refection)';
        case 'K8S_POD': return 'CVE-2024-21626 (Container Breakout Priv-Escalation)';
        case 'CLOUD_EC2': return 'CVE-2024-3847 (Server-Side Request Forgery Access Credentials)';
        case 'CLOUD_S3': return 'AWS-S3-01 (Insecure Archival Bucket Policy Exposure)';
        case 'DEPARTMENT': return 'MITRE-T1566 (Phishing Spear Payload Delivery)';
        default: return 'CVE-2025-SYSTEM (Lateral Boundary Decoupling Hop)';
      }
    };

    while (queue.length > 0) {
      const { current, path, currentProbability } = queue.shift()!;
      const currentNode = nodes.get(current);

      if (!currentNode) continue;

      // Add vulnerability if not present
      const vul = getVulnerabilitiesForType(currentNode.type);
      if (!vulnerabilitiesExploited.includes(vul)) {
        vulnerabilitiesExploited.push(vul);
      }

      // Look at reachable links
      currentNode.relationships.forEach(relName => {
        const nextNode = nodes.get(relName);
        if (nextNode && !visited.has(relName)) {
          visited.add(relName);
          blastRadiusNodes.push(relName);

          const stepMultiplier = nextNode.propagationMultiplier || 1.0;
          // Calculate step probability based on trust & exposure scores
          const stepProb = Number((currentProbability * (nextNode.exposureScore / 100) * stepMultiplier).toFixed(2));
          const adjustedStepProb = Math.min(0.99, Math.max(0.1, stepProb));

          const newPath = [...path, relName];
          queue.push({
            current: relName,
            path: newPath,
            currentProbability: adjustedStepProb
          });

          // Convert into structured attack steps
          const steps: AttackStep[] = newPath.map((name, index) => {
            const stepNode = nodes.get(name)!;
            const isCrownJewel = stepNode.containsSensitiveAssets || stepNode.type === 'SECRETS_VAULT';
            return {
              stepIndex: index + 1,
              nodeName: name,
              technique: isCrownJewel ? 'MITRE-T1114 (Email Collection & DB Crypt Vault Dump)' : 'MITRE-T1078 (Lateral Proxy Credential Leakage)',
              probability: index === 0 ? 1.0 : Number((adjustedStepProb * (1.2 - (index * 0.1))).toFixed(2)),
              estimatedDurationSeconds: Math.round((500 / stepMultiplier) * (index + 1)),
              blastRadiusMultiplier: isCrownJewel ? 2.5 : 1.1,
              privilegeEscalationProb: isCrownJewel ? 0.95 : 0.25
            };
          });

          pathsForecasted.push(steps);
        }
      });

      // Break safely to avoid infinite queue explosions
      if (pathsForecasted.length >= 8) break;
    }

    // Evaluate governance damage under this simulated collapse
    const govForecast = governanceModel.forecastGovernanceCollapse(nodes, blastRadiusNodes);
    const initialGov = governanceModel.auditCompliance(nodes);
    
    const estimatedComplianceLoss = Math.max(0, initialGov.complianceScore - govForecast.projectedComplianceScore);
    const governanceCollapseZoneCount = govForecast.projectedViolationsCount;

    // Evaluate trust decline
    const originalAverageTrust = Array.from(nodes.values()).reduce((sum, n) => sum + n.trustScore, 0) / nodes.size;
    const futureTrustTimeline = trustModel.forecastTrustTimeline(nodes, startNodeName);
    const finalProjectedTrust = futureTrustTimeline[futureTrustTimeline.length - 1].averageTrust;
    const trustDeclinePercentage = Math.round(Math.max(0, originalAverageTrust - finalProjectedTrust));

    // Compile reports
    return {
      simulationId: uuidv4(),
      triggerNode: startNodeName,
      timestamp: new Date().toISOString(),
      simulatedScenario: scenario,
      pathsForecasted,
      blastRadiusNodes,
      vulnerabilitiesExploited,
      estimatedComplianceLoss,
      governanceCollapseZoneCount,
      trustDeclinePercentage,
      confidenceScore: Math.round(92 - (blastRadiusNodes.length * 2)) // Larger paths have slightly lower deterministic confidence
    };
  }
}

export const attackSimulator = AttackSimulator.getInstance();
