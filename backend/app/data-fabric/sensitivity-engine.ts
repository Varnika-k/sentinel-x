import { fabricCache } from './fabric-cache';
import { SensitivityLabel, EnterpriseNode } from './types';
import { logger } from '../core/logger';

export interface SensitivityScanResult {
  nodeId: string;
  name: string;
  type: string;
  sensitivity: SensitivityLabel;
  isCompliant: boolean;
  violationsCount: number;
  violations: string[];
}

export class SensitivityEngine {
  private static instance: SensitivityEngine;

  private constructor() {}

  public static getInstance(): SensitivityEngine {
    if (!SensitivityEngine.instance) {
      SensitivityEngine.instance = new SensitivityEngine();
    }
    return SensitivityEngine.instance;
  }

  /**
   * Assesses the compliance and authorization envelope around a specific sensitive node.
   * Ensures that Zero-Trust controls are active (e.g., databases containing Highly Restricted data are only accessed by validated, authorized accounts).
   */
  public evaluateSensitivityConstraints(nodeId: string): SensitivityScanResult {
    const node = fabricCache.getNode(nodeId);
    const violations: string[] = [];

    if (!node) {
      return {
        nodeId,
        name: 'UNKNOWN',
        type: 'UNKNOWN',
        sensitivity: 'PUBLIC',
        isCompliant: true,
        violationsCount: 0,
        violations: []
      };
    }

    const incoming = fabricCache.getIncomingRelations(nodeId);

    // Rule 1: HIGHLY_RESTRICTED or RESTRICTED databases must be governed by at least one active governance rule
    if (node.sensitivity === 'HIGHLY_RESTRICTED' || node.sensitivity === 'RESTRICTED') {
      const isGoverned = incoming.some(rel => rel.type === 'GOVERNED_BY');
      if (!isGoverned) {
        violations.push(`Security Breach: Sensitive assets [${node.name}] marked ${node.sensitivity} lack mandatory Governance Policy bindings.`);
      }
    }

    // Rule 2: Identify access lines from untrusted or general identities
    const accessRelations = incoming.filter(rel => rel.type === 'ACCESSES');
    accessRelations.forEach(rel => {
      const accessor = fabricCache.getNode(rel.sourceId);
      if (accessor && accessor.type === 'identity') {
        const accessorSensitivity = accessor.sensitivity;
        
        // Non-compliances where low accessor authority breaches highly protected space
        if (node.sensitivity === 'HIGHLY_RESTRICTED' && accessorSensitivity !== 'HIGHLY_RESTRICTED') {
          violations.push(
            `Zero Trust Violation: Identity [${accessor.name}] with authority level ${accessorSensitivity} is accessing HIGHLY_RESTRICTED cluster [${node.name}].`
          );
        } else if (node.sensitivity === 'RESTRICTED' && (accessorSensitivity === 'PUBLIC' || accessorSensitivity === 'INTERNAL')) {
          violations.push(
            `Zero Trust Violation: Identity [${accessor.name}] with authority level ${accessorSensitivity} is accessing RESTRICTED database resource [${node.name}].`
          );
        }
      }
    });

    // Rule 3: Highly Restricted cloud resources should not be orphaned (lack an owner department)
    if (node.sensitivity === 'HIGHLY_RESTRICTED' && !node.ownerId && !node.departmentId) {
      violations.push(`Compliance Failure: Isolated HIGHLY_RESTRICTED Node [${node.name}] is completely orphaned (lacks department or executive owner).`);
    }

    return {
      nodeId: node.id,
      name: node.name,
      type: node.type,
      sensitivity: node.sensitivity,
      isCompliant: violations.length === 0,
      violationsCount: violations.length,
      violations
    };
  }

  /**
   * Scans the entire active inventory for Zero Trust violations.
   */
  public compileGlobalZeroTrustAudit(): { totalScanned: number; violationCount: number; violations: string[] } {
    const nodes = fabricCache.listNodes();
    let violationCount = 0;
    const violations: string[] = [];

    nodes.forEach(node => {
      const scan = this.evaluateSensitivityConstraints(node.id);
      if (!scan.isCompliant) {
        violationCount += scan.violationsCount;
        violations.push(...scan.violations);
      }
    });

    return {
      totalScanned: nodes.length,
      violationCount,
      violations
    };
  }
}

export const sensitivityEngine = SensitivityEngine.getInstance();
