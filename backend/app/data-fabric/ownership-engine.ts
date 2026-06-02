import { fabricCache } from './fabric-cache';
import { EnterpriseNode } from './types';
import { logger } from '../core/logger';

export interface OwnershipChain {
  assetId: string;
  assetName: string;
  assetType: string;
  ownerEmployee: EnterpriseNode | null;
  department: EnterpriseNode | null;
  executiveSponsor: EnterpriseNode | null;
  businessUnit: string;
}

export class OwnershipEngine {
  private static instance: OwnershipEngine;

  private constructor() {}

  public static getInstance(): OwnershipEngine {
    if (!OwnershipEngine.instance) {
      OwnershipEngine.instance = new OwnershipEngine();
    }
    return OwnershipEngine.instance;
  }

  /**
   * Tracks full ownership trajectory for a specific enterprise node.
   */
  public discoverOwnershipChain(nodeId: string): OwnershipChain | null {
    const node = fabricCache.getNode(nodeId);
    if (!node) return null;

    let ownerEmployee: EnterpriseNode | null = null;
    let department: EnterpriseNode | null = null;
    let executiveSponsor: EnterpriseNode | null = null;
    let businessUnit = 'UNASSIGNED_CORP_STATE';

    // 1. Resolve Direct Immediate Owner Node
    if (node.ownerId) {
      const parent = fabricCache.getNode(node.ownerId);
      if (parent) {
        if (parent.type === 'employee') {
          ownerEmployee = parent;
        } else if (parent.type === 'department') {
          department = parent;
        }
      }
    }

    // 2. Resolve Department Hierarchy
    const deptId = node.departmentId || (ownerEmployee ? ownerEmployee.departmentId : null);
    if (deptId) {
      const deptNode = fabricCache.getNode(deptId);
      if (deptNode && deptNode.type === 'department') {
        department = deptNode;
        businessUnit = deptNode.metadata.businessUnit || 'GLOBAL_OPERATIONS';
      }
    }

    // 3. Resolve Executive Owner Sponsored at the department boundaries
    if (department && department.metadata.executiveHeadId) {
      const exec = fabricCache.getNode(department.metadata.executiveHeadId);
      if (exec && exec.type === 'employee') {
        executiveSponsor = exec;
      }
    }

    // 4. Fallback search by outgoing relationship linkages if field assignments were left unmapped
    if (!executiveSponsor && department) {
      const links = fabricCache.getOutgoingRelations(department.id);
      const reports = links.find(l => l.type === 'OWNED_BY' || l.type === 'MANAGED_BY');
      if (reports) {
        const leader = fabricCache.getNode(reports.targetId);
        if (leader && leader.type === 'employee') {
          executiveSponsor = leader;
        }
      }
    }

    return {
      assetId: node.id,
      assetName: node.name,
      assetType: node.type,
      ownerEmployee,
      department,
      executiveSponsor,
      businessUnit
    };
  }

  /**
   * Generates a structural metrics analysis of orphan elements (unowned nodes)
   */
  public auditComplianceOwnership(): { totalNodes: number; orphanedNodesCount: number; orphans: Array<{ id: string; name: string; type: string }> } {
    const nodes = fabricCache.listNodes();
    const orphans: Array<{ id: string; name: string; type: string }> = [];

    nodes.forEach(node => {
      // Exclude natural grouping nodes from direct employee ownership checks
      if (node.type === 'employee' || node.type === 'department' || node.type === 'governance_rule') {
        return;
      }

      const chain = this.discoverOwnershipChain(node.id);
      if (!chain || (!chain.ownerEmployee && !chain.department)) {
        orphans.push({
          id: node.id,
          name: node.name,
          type: node.type
        });
      }
    });

    return {
      totalNodes: nodes.length,
      orphanedNodesCount: orphans.length,
      orphans
    };
  }
}

export const ownershipEngine = OwnershipEngine.getInstance();
