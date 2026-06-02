import { SuspiciousMovement } from './types';
import { logger } from '../../core/logger';
import { graphIntelligenceEngine, GraphNodeState } from '../../simulation/graph-intelligence';

export function resolveNodeSector(node: GraphNodeState): string {
  if (node.status === 'isolated') return 'ISOLATION_ZONE';
  if (node.namespace === 'db-tier' || node.name.includes('db') || node.name.includes('backup')) return 'DATA_CORE';
  if (node.name.includes('iam') || node.name.includes('ad') || node.name.includes('auth')) return 'IDENTITY';
  if (node.name.startsWith('gw') || node.name.startsWith('fw') || node.name.includes('waf') || node.name.includes('nginx')) return 'PERIMETER';
  if (node.name.startsWith('cloud') || node.name.includes('lambda') || node.name.includes('s3') || node.environment.includes('azure') || node.environment.includes('aws')) return 'CLOUD';
  return 'PRODUCTION';
}

export class MovementAnalyzer {
  private static instance: MovementAnalyzer;
  private suspiciousMovements: SuspiciousMovement[] = [];

  private constructor() {}

  public static getInstance(): MovementAnalyzer {
    if (!MovementAnalyzer.instance) {
      MovementAnalyzer.instance = new MovementAnalyzer();
    }
    return MovementAnalyzer.instance;
  }

  /**
   * Tracks and evaluates logical user navigation from a starting node to a target node
   */
  public analyzeTopologicalHop(
    username: string,
    sessionId: string,
    sourceNodeId: string,
    targetNodeId: string
  ): SuspiciousMovement | null {
    const srcNode = graphIntelligenceEngine.nodes.get(sourceNodeId);
    const dstNode = graphIntelligenceEngine.nodes.get(targetNodeId);

    if (!srcNode || !dstNode) {
      return null;
    }

    // Determine Sector differences for boundary crossing anomalies
    const srcSector = resolveNodeSector(srcNode);
    const dstSector = resolveNodeSector(dstNode);

    let anomalyType: SuspiciousMovement['anomalyType'] | null = null;
    let severity: SuspiciousMovement['severity'] = 'low';
    let mitreCode = 'T1078'; // Default Valid Accounts 

    if (srcSector !== dstSector && (dstSector === 'DATA_CORE' || dstSector === 'ISOLATION_ZONE')) {
      anomalyType = 'cross_security_sector';
      severity = 'high';
      mitreCode = 'T1021.002'; // Lateral Movement: SMB/Admin Shares
    } else if (srcNode.operationalCriticality === 1 && dstNode.operationalCriticality === 5) {
      // Criticality leap
      anomalyType = 'radial_hop_anomaly';
      severity = 'medium';
      mitreCode = 'T1090'; // Proxy connections
    }

    // Evaluate time of day
    const hour = new Date().getHours();
    if (hour < 6 || hour > 21) {
      if (anomalyType) {
        severity = 'critical'; // Combined multiplier
      } else {
        anomalyType = 'time_of_day_anomaly';
        severity = 'medium';
        mitreCode = 'T1558'; // Use of compromised credentials out of hours
      }
    }

    if (anomalyType) {
      const movement: SuspiciousMovement = {
        movementId: `MVT-${username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
        username,
        sessionId,
        timestamp: new Date().toISOString(),
        sourceNodeId,
        targetNodeId,
        anomalyType,
        severity,
        mitreTechnique: mitreCode
      };

      this.suspiciousMovements.push(movement);
      if (this.suspiciousMovements.length > 50) {
        this.suspiciousMovements.shift();
      }

      logger.warn(`[MovementAnalyzer] Detected suspicious lateral credential transfer by ${username}: ${anomalyType.toUpperCase()} (${sourceNodeId} -> ${targetNodeId})`);
      return movement;
    }

    return null;
  }

  public getSuspiciousMovements(username?: string): SuspiciousMovement[] {
    if (username) {
      return this.suspiciousMovements.filter(m => m.username === username);
    }
    return this.suspiciousMovements;
  }
}

export const movementAnalyzer = MovementAnalyzer.getInstance();
