import { logger } from '../core/logger';
import { enterpriseState } from './enterprise-state';
import { operationalModel } from './operational-model';
import { enterpriseRegistry } from './enterprise-registry';
import { dependencyCoordinator } from './dependency-coordinator';
import { operationalContext } from './operational-context';
import { businessContext } from './business-context';
import { enterpriseMemory } from './enterprise-memory';
import { coordinationEngine } from './coordination-engine';
import { orchestrationEngine } from './orchestration-engine';

export class EnterpriseOS {
  private static instance: EnterpriseOS;

  private constructor() {
    logger.info('[EnterpriseOS] Bootstrap initialized safely.');
  }

  public static getInstance(): EnterpriseOS {
    if (!EnterpriseOS.instance) {
      EnterpriseOS.instance = new EnterpriseOS();
    }
    return EnterpriseOS.instance;
  }

  /**
   * Universal search and explorer function.
   * Matches nodes, files, employees, or governance rules and instantly shows relations, ownership, risk, and impact.
   */
  public searchEnterpriseOS(query: string) {
    const list = enterpriseRegistry.getRegistry();
    const cleanQuery = query.toLowerCase().trim();

    if (!cleanQuery) return [];

    // Filter nodes matching search criteria
    const matchedNodes = list.nodes.filter(n => 
      n.id.toLowerCase().includes(cleanQuery) || 
      n.name.toLowerCase().includes(cleanQuery) ||
      n.owner.toLowerCase().includes(cleanQuery) ||
      n.type.toLowerCase().includes(cleanQuery)
    );

    return matchedNodes.map(node => {
      const edges = enterpriseRegistry.getEdgesForNode(node.id);
      const impact = businessContext.evaluateImpact(node.id);
      const cascading = dependencyCoordinator.traceCascadeDownstream(node.id);

      return {
        node,
        linkedRelations: edges,
        impactEvaluation: impact,
        affectedDownstreamCount: cascading.nodesAffected.length - 1, // minus self
        cascadingVulnerabilityLevel: cascading.maxSeverityPropagated
      };
    });
  }

  /**
   * Gathers unified summary data representing the health, state, and timeline of the full enterprise.
   */
  public getExecutiveVisualsDump() {
    const liveState = enterpriseState.getLiveState();
    const healthScores = operationalModel.generateHealthMetrics();
    const timeline = operationalContext.getTimelineEvents();
    const memories = enterpriseMemory.getMemories();
    const structuralRegistry = enterpriseRegistry.getRegistry();
    const activeSubsystems = coordinationEngine.queryModuleReadiness();

    return {
      liveState,
      healthScores,
      timeline,
      memories,
      structuralRegistry,
      activeSubsystems
    };
  }
}

export const enterpriseOS = EnterpriseOS.getInstance();
export {
  enterpriseState,
  operationalModel,
  enterpriseRegistry,
  dependencyCoordinator,
  operationalContext,
  businessContext,
  enterpriseMemory,
  coordinationEngine,
  orchestrationEngine
};
