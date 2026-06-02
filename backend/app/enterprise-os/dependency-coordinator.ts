import { enterpriseRegistry } from './enterprise-registry';

export class DependencyCoordinator {
  private static instance: DependencyCoordinator;

  private constructor() {}

  public static getInstance(): DependencyCoordinator {
    if (!DependencyCoordinator.instance) {
      DependencyCoordinator.instance = new DependencyCoordinator();
    }
    return DependencyCoordinator.instance;
  }

  /**
   * Explores the full registry and traces downstream nodes affected by the failures of startNode.
   */
  public traceCascadeDownstream(startNodeId: string): { nodesAffected: string[]; maxSeverityPropagated: 'low' | 'medium' | 'high' } {
    const list = enterpriseRegistry.getRegistry();
    const affectedSet = new Set<string>();
    
    const bfsQueue: string[] = [startNodeId];
    affectedSet.add(startNodeId);

    while (bfsQueue.length > 0) {
      const current = bfsQueue.shift()!;
      
      // Find downstream targets where current is the source
      const edges = list.edges.filter(e => e.source === current);
      edges.forEach(e => {
        if (!affectedSet.has(e.target)) {
          affectedSet.add(e.target);
          bfsQueue.push(e.target);
        }
      });
    }

    // Determine highest risk level corresponding to node vulnerabilities
    let maxSeverity: 'low' | 'medium' | 'high' = 'low';
    affectedSet.forEach(nodeId => {
      const node = enterpriseRegistry.getNodeById(nodeId);
      if (node && node.riskScore > 75) {
        maxSeverity = 'high';
      } else if (node && node.riskScore > 35 && maxSeverity !== 'high') {
        maxSeverity = 'medium';
      }
    });

    return {
      nodesAffected: Array.from(affectedSet),
      maxSeverityPropagated: maxSeverity
    };
  }
}

export const dependencyCoordinator = DependencyCoordinator.getInstance();
