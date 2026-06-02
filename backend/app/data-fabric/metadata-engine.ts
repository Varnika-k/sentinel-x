import { EnterpriseNode, SensitivityLabel, EnterpriseNodeType } from './types';
import { fabricCache } from './fabric-cache';
import { logger } from '../core/logger';

export class MetadataEngine {
  private static instance: MetadataEngine;

  private constructor() {}

  public static getInstance(): MetadataEngine {
    if (!MetadataEngine.instance) {
      MetadataEngine.instance = new MetadataEngine();
    }
    return MetadataEngine.instance;
  }

  /**
   * Sanitizes any raw database record, business document, or user payload into a metadata-only manifest.
   * NEVER returns actual business secrets, financial values, or PII.
   */
  public sanitizeAndClassify(
    id: string,
    name: string,
    type: EnterpriseNodeType,
    rawPayload: Record<string, any>,
    inferredSensitivity?: SensitivityLabel
  ): EnterpriseNode {
    // 1. Calculate safe, privacy-compliant metadata
    const metadata: Record<string, any> = {
      recordCount: rawPayload.recordCount || rawPayload.rows || rawPayload.size || 0,
      lastModified: rawPayload.lastModified || new Date().toISOString(),
      formatType: rawPayload.formatType || rawPayload.extension || 'SQL_TABLE',
      complianceTags: Array.isArray(rawPayload.complianceTags) ? rawPayload.complianceTags : ['SOX', 'GDPR'],
      fusedInputsCount: rawPayload.inputsCount || 0
    };

    // Keep safe counts of PII fields if present, never the values
    if (rawPayload.piiColumns) {
      metadata.piiColumnsCount = rawPayload.piiColumns.length;
      metadata.piiFieldsDiscovered = rawPayload.piiColumns.map((col: string) => col.toUpperCase());
    }

    if (rawPayload.connectionString) {
      // Redact connection strings to metadata only
      metadata.dbType = rawPayload.connectionString.split(':')[0] || 'unknown';
      metadata.hostRedacted = true;
    }

    // 2. Classify asset sensitivity based on heuristic or given parameter
    const sensitivity = inferredSensitivity || this.inferSensitivity(type, rawPayload);

    // 3. Compute business importance score metrics (0-100)
    const businessCriticality = this.calculateCriticality(type, rawPayload, sensitivity);
    const operationalImpact = this.calculateOperationalImpact(type, rawPayload);

    // 4. Default risk score calculation
    const riskScore = this.calculateBaseRisk(sensitivity, businessCriticality, rawPayload);

    const safeNode: EnterpriseNode = {
      id,
      name: this.scrubText(name),
      type,
      sensitivity,
      riskScore,
      businessCriticality,
      operationalImpact,
      ownerId: rawPayload.ownerId || rawPayload.team || 'ORPHAN_GLOBAL',
      departmentId: rawPayload.departmentId || rawPayload.department || 'GLOBAL_HQ',
      metadata
    };

    logger.debug(`[MetadataEngine] Sanitized node schema [Type: ${type}, ID: ${id}, Sensitivity: ${sensitivity}]`);
    return safeNode;
  }

  private inferSensitivity(type: EnterpriseNodeType, rawPayload: Record<string, any>): SensitivityLabel {
    const textSignature = JSON.stringify(rawPayload).toLowerCase();
    
    // Simple heuristic rule classification
    if (textSignature.includes('highly_restricted') || textSignature.includes('salary') || textSignature.includes('payroll') || textSignature.includes('credit_card') || textSignature.includes('pci_dss')) {
      return 'HIGHLY_RESTRICTED';
    }
    if (textSignature.includes('restricted') || textSignature.includes('customer_pii') || textSignature.includes('api_key') || textSignature.includes('oauth')) {
      return 'RESTRICTED';
    }
    if (textSignature.includes('confidential') || textSignature.includes('financial') || textSignature.includes('internal_audit')) {
      return 'CONFIDENTIAL';
    }
    if (textSignature.includes('internal') || textSignature.includes('source_code') || textSignature.includes('employees_data')) {
      return 'INTERNAL';
    }
    
    // Natural structural rules
    switch (type) {
      case 'governance_rule':
      case 'database':
        return 'CONFIDENTIAL';
      case 'document':
        return 'INTERNAL';
      case 'employee':
      case 'identity':
        return 'INTERNAL';
      case 'application':
      case 'infrastructure':
      case 'cloud_resource':
        return 'INTERNAL';
      default:
        return 'PUBLIC';
    }
  }

  private calculateCriticality(type: EnterpriseNodeType, raw: Record<string, any>, sens: SensitivityLabel): number {
    let score = 30; // base score

    if (sens === 'HIGHLY_RESTRICTED') score += 40;
    else if (sens === 'RESTRICTED') score += 25;
    else if (sens === 'CONFIDENTIAL') score += 15;

    if (type === 'business_process' || type === 'database') score += 20;
    if (type === 'application' && raw.tier === 'tier-1') score += 25;
    if (raw.isSinglePointOfFailure) score += 15;

    return Math.min(100, score);
  }

  private calculateOperationalImpact(type: EnterpriseNodeType, raw: Record<string, any>): number {
    let score = 40;
    if (type === 'infrastructure' || type === 'cloud_resource') score += 20;
    if (type === 'database') score += 15;
    if (raw.activeConnectionsCount > 100) score += 15;
    if (raw.failureCascadesCount > 3) score += 20;
    return Math.min(100, score);
  }

  private calculateBaseRisk(sens: SensitivityLabel, critical: number, raw: Record<string, any>): number {
    let base = 20;
    if (sens === 'HIGHLY_RESTRICTED') base += 35;
    else if (sens === 'RESTRICTED') base += 20;
    else if (sens === 'CONFIDENTIAL') base += 10;

    base += Math.round(critical * 0.35);

    if (raw.zeroTrustViolationsCount > 0) base += Math.min(30, raw.zeroTrustViolationsCount * 10);
    if (!raw.ownerId) base += 15; // Orphan risks

    return Math.min(100, base);
  }

  private scrubText(input: string): string {
    // Keeps names tidy and removes direct system SQL queries or code blocks
    return input.replace(/[\r\n\t]+/g, ' ').trim();
  }
}

export const metadataEngine = MetadataEngine.getInstance();
