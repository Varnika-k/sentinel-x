import { logger } from '../../core/logger';
import { relationshipEngine, FabricEntity } from './relationship-engine';
import { GOVERNANCE_VIOLATIONS } from '../../../../src/lib/enterprise-data';

export interface GovernanceRiskMap {
  assetId: string;
  assetName: string;
  assetType: string;
  complianceRating: number; // 0 to 100
  governanceSensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  activeIncidentVectors: string[];
}

export class GovernanceLinker {
  /**
   * Links core applications and databases with security controls or policy violations
   */
  public auditsGovernorCompliance(): GovernanceRiskMap[] {
    const assets = relationshipEngine.getEntities().filter(e => e.type === 'application' || e.type === 'database');
    
    return assets.map(asset => {
      let complianceRating = 100;
      const activeIncidentVectors: string[] = [];

      // Check for related governance violations matching this asset's owner/department
      const deptName = asset.metadata.department || '';
      const ownerName = asset.metadata.owner || '';

      const matchingViolations = GOVERNANCE_VIOLATIONS.filter(v => v.department === deptName || v.assignedTo === ownerName);
      
      matchingViolations.forEach(v => {
        if (v.status !== 'mitigated') {
          // Subtract risk weighting based on severity
          const weight = v.severity === 'critical' ? 35 : v.severity === 'high' ? 20 : v.severity === 'medium' ? 10 : 5;
          complianceRating -= weight;
          activeIncidentVectors.push(`[${v.severity.toUpperCase()}] ${v.title} - Ref ID: ${v.id}`);
        }
      });

      // Clamp rating
      complianceRating = Math.max(15, complianceRating);

      // Map sensitivity level
      let governanceSensitivity: 'public' | 'internal' | 'confidential' | 'restricted' = 'public';
      if (asset.type === 'database') {
        governanceSensitivity = asset.metadata.sensitivity || 'confidential';
      } else {
        governanceSensitivity = asset.metadata.riskLevel === 'critical' ? 'restricted' : 
                               asset.metadata.riskLevel === 'high' ? 'confidential' : 'internal';
      }

      return {
        assetId: asset.id,
        assetName: asset.name,
        assetType: asset.type,
        complianceRating,
        governanceSensitivity,
        activeIncidentVectors
      };
    });
  }

  /**
   * Audits if any non-compliant application accesses high-sensitivity databases
   */
  public auditZeroTrustAccessBreaches() {
    const apps = relationshipEngine.getEntities().filter(e => e.type === 'application');
    const breaches: string[] = [];

    apps.forEach(app => {
      if (app.metadata.governanceStatus === 'non-compliant' || app.metadata.operationalHealth < 80) {
        // Find if this application accesses any confidential or restricted database
        const adjacencies = relationshipEngine.getAdjacencies(app.id);
        const dangerousLinks = adjacencies.filter(adj => 
          adj.entity?.type === 'database' && 
          (adj.entity.metadata?.sensitivity === 'confidential' || adj.entity.metadata?.sensitivity === 'restricted')
        );

        dangerousLinks.forEach(dl => {
          breaches.push(`Non-compliant application "${app.name}" holds active connection to highly sensitive data resource "${dl.entity!.name}" (${dl.entity!.metadata?.sensitivity.toUpperCase()}).`);
        });
      }
    });

    return {
      breachesCount: breaches.length,
      breaches
    };
  }
}

export const governanceLinker = new GovernanceLinker();
