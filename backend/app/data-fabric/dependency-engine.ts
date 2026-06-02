import { fabricCache } from './fabric-cache';
import { EnterpriseNode, BusinessImpactResult, EnterpriseNodeType } from './types';
import { logger } from '../core/logger';

export class DependencyEngine {
  private static instance: DependencyEngine;

  private constructor() {}

  public static getInstance(): DependencyEngine {
    if (!DependencyEngine.instance) {
      DependencyEngine.instance = new DependencyEngine();
    }
    return DependencyEngine.instance;
  }

  /**
   * Evaluates the absolute cascading impact of a node failing.
   * Walks the incoming and outgoing topological relationships to formulate a complete dependency graph index.
   */
  public evaluateImpact(nodeId: string): BusinessImpactResult | null {
    const node = fabricCache.getNode(nodeId);
    if (!node) return null;

    const visited = new Set<string>();
    const pathFailures: string[] = [];
    
    const affectedDepts = new Set<string>();
    const affectedApps = new Set<string>();
    const affectedProcesses = new Set<string>();
    
    let maxDepth = 0;
    let directDownstream = 0;

    // Recursive helper to traverse dependencies downstream (who depends on me?)
    const traverse = (currentId: string, depth: number) => {
      if (visited.has(currentId)) return;
      visited.add(currentId);

      maxDepth = Math.max(maxDepth, depth);

      const incoming = fabricCache.getIncomingRelations(currentId);
      
      incoming.forEach(rel => {
        // If high dependency relationship is present
        if (rel.type === 'DEPENDS_ON' || rel.type === 'RUNS_ON' || rel.type === 'STORES_DATA_FOR') {
          const dependent = fabricCache.getNode(rel.sourceId);
          if (!dependent) return;

          if (depth === 1) {
            directDownstream++;
          }

          pathFailures.push(
            `Impact Wave: [${fabricCache.getNode(currentId)?.name || currentId}] Failure triggers outage on reliant [${dependent.type.toUpperCase()}: ${dependent.name}]`
          );

          // Classify affected buckets
          if (dependent.type === 'department') affectedDepts.add(dependent.name);
          if (dependent.type === 'application') affectedApps.add(dependent.name);
          if (dependent.type === 'business_process') affectedProcesses.add(dependent.name);

          traverse(dependent.id, depth + 1);
        }
      });
    };

    traverse(nodeId, 1);

    // Also trace ownership and group links to catch business lines
    const ownershipLinks = fabricCache.getOutgoingRelations(nodeId);
    ownershipLinks.forEach(rel => {
      if (rel.type === 'OWNED_BY' || rel.type === 'MEMBER_OF') {
        const owner = fabricCache.getNode(rel.targetId);
        if (owner && owner.type === 'department') {
          affectedDepts.add(owner.name);
        }
      }
    });

    // Score calculated criticality
    let recoveryComplexity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (node.businessCriticality > 85 || visited.size > 10) {
      recoveryComplexity = 'CRITICAL';
    } else if (node.businessCriticality > 60 || visited.size > 5) {
      recoveryComplexity = 'HIGH';
    } else if (node.businessCriticality > 30) {
      recoveryComplexity = 'MEDIUM';
    }

    const totalCascading = Math.max(0, visited.size - 1);

    return {
      targetId: node.id,
      targetName: node.name,
      targetType: node.type,
      failureImpactScore: Math.min(100, (totalCascading * 8) + Math.round(node.operationalImpact * 0.6)),
      recoveryComplexity,
      affectedDepartments: Array.from(affectedDepts),
      affectedApplications: Array.from(affectedApps),
      affectedBusinessProcesses: Array.from(affectedProcesses),
      dependencyDepth: maxDepth,
      directDownstreamCount: directDownstream,
      totalDownstreamCascading: totalCascading,
      failurePathways: pathFailures
    };
  }

  /**
   * Compiles single points of failure across the metadata fabric.
   * A node is identified as a SPOF if a breakdown causes cascades exceeding thresholds.
   */
  public detectSPOFs(downstreamThreshold: number = 3): Array<{ nodeId: string; name: string; type: string; score: number; reason: string }> {
    const spofs: Array<{ nodeId: string; name: string; type: string; score: number; reason: string }> = [];
    const nodes = fabricCache.listNodes();

    nodes.forEach(node => {
      // We check structural systems mainly
      if (node.type === 'employee' || node.type === 'governance_rule') return;

      const assessment = this.evaluateImpact(node.id);
      if (assessment && assessment.totalDownstreamCascading >= downstreamThreshold) {
        spofs.push({
          nodeId: node.id,
          name: node.name,
          type: node.type,
          score: assessment.failureImpactScore,
          reason: `Outage triggers cascading collapse of ${assessment.totalDownstreamCascading} total dependency layers across ${assessment.affectedDepartments.length} functional departments.`
        });
      }
    });

    return spofs.sort((a, b) => b.score - a.score);
  }
}

export const dependencyEngine = DependencyEngine.getInstance();
