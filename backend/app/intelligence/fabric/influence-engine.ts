import { logger } from '../../core/logger';
import { relationshipEngine, FabricEntity } from './relationship-engine';

export interface InfluenceNode {
  id: string;
  name: string;
  type: string;
  directSubordinatesCount: number;
  indirectInfluenceScore: number; // calculated depth based
  degreeCentrality: number; // ratio of connections
  operationalTier: 'executive_leadership' | 'directorship' | 'team_lead' | 'specialist';
}

export class InfluenceEngine {
  /**
   * Calculates PageRank-style degree centralities and reporting depths for corporate staff
   */
  public compileOperationalInfluenceMap(): InfluenceNode[] {
    const employees = relationshipEngine.getEntities().filter(e => e.type === 'employee');
    const relations = relationshipEngine.getRelations();
    
    return employees.map(emp => {
      // 1. Direct reports count (where targetId is managers and sourceId reports to them)
      const reports = relations.filter(r => r.targetId === emp.id && r.relationType === 'reports_to');
      const directSubordinatesCount = reports.length;

      // 2. Degree Centrality (how connected they are relative to everything in the topology)
      const totalAdj = relationshipEngine.getAdjacencies(emp.id).length;
      const degreeCentrality = Number((totalAdj / relations.length * 100).toFixed(2));

      // 3. Indirect influence score is depth-based. CEO influences everyone down.
      let indirectInfluenceScore = directSubordinatesCount * 5;
      
      // Managers get bonus scores based on subordinates' subordinates
      reports.forEach(rep => {
        const subReports = relations.filter(r => r.targetId === rep.sourceId && r.relationType === 'reports_to');
        indirectInfluenceScore += subReports.length * 2.5;
      });

      // Assign Operational Tier based on authority paths
      let operationalTier: 'executive_leadership' | 'directorship' | 'team_lead' | 'specialist' = 'specialist';
      if (emp.name.includes('(CEO)') || emp.metadata.role.includes('Chief') || emp.metadata.role.includes('Head of AI')) {
        operationalTier = 'executive_leadership';
        indirectInfluenceScore += 500; // Peak master authority
      } else if (emp.metadata.role.includes('Director') || emp.metadata.role.includes('VP')) {
        operationalTier = 'directorship';
        indirectInfluenceScore += 150;
      } else if (emp.metadata.role.includes('Lead') || emp.metadata.role.includes('Manager')) {
        operationalTier = 'team_lead';
        indirectInfluenceScore += 40;
      }

      return {
        id: emp.id,
        name: emp.name,
        type: emp.type,
        directSubordinatesCount,
        indirectInfluenceScore: Math.round(indirectInfluenceScore),
        degreeCentrality,
        operationalTier
      };
    }).sort((a, b) => b.indirectInfluenceScore - a.indirectInfluenceScore);
  }

  /**
   * Discovers the reporting authority hierarchy up to Chief Executive level
   */
  public traceAccountabilityChain(employeeId: string): FabricEntity[] {
    const chain: FabricEntity[] = [];
    let current = relationshipEngine.getEntity(employeeId);

    while (current) {
      chain.push(current);
      
      const reportsAdj = relationshipEngine.getAdjacencies(current.id)
        .find(adj => adj.relation.relationType === 'reports_to' && adj.direction === 'outgoing');

      if (reportsAdj && reportsAdj.entity) {
        current = reportsAdj.entity;
      } else {
        break;
      }
    }

    return chain;
  }
}

export const influenceEngine = new InfluenceEngine();
