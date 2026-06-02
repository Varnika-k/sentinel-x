import { logger } from '../../core/logger';
import { relationshipEngine } from './relationship-engine';

export interface OrgNode {
  id: string;
  name: string;
  role: string;
  department: string;
  businessUnit: string;
  manager: string;
  trustScore: number;
  riskScore: number;
  activityStatus: string;
}

export class OrganizationalGraph {
  /**
   * Compiles and resolves the full structural workforce reporting schema
   */
  public generateFullOrgGraph() {
    const employees = relationshipEngine.getEntities().filter(e => e.type === 'employee');
    const nodes: OrgNode[] = employees.map(emp => ({
      id: emp.id,
      name: emp.name,
      role: emp.metadata.role,
      department: emp.metadata.department,
      businessUnit: emp.metadata.businessUnit,
      manager: emp.metadata.manager,
      trustScore: emp.metadata.trustScore,
      riskScore: emp.metadata.riskScore,
      activityStatus: emp.metadata.activityStatus
    }));

    // Find links where reporting is true
    const links: Array<{ source: string; target: string; type: string }> = [];
    nodes.forEach(node => {
      if (node.manager) {
        const mgr = nodes.find(n => n.name === node.manager);
        if (mgr) {
          links.push({
            source: node.id,
            target: mgr.id,
            type: 'REPORTS_TO'
          });
        }
      }
    });

    return {
      nodes,
      links
    };
  }
}

export const organizationalGraph = new OrganizationalGraph();
