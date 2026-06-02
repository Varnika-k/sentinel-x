import { GOVERNANCE_RE_PATTERNS } from './patterns';
import { scanHighEntropyTokens } from './entropy';
import { ClassificationResult, SensitivityLevel, ComplianceStatus, ClassificationMatch } from './types';

export class SensitiveDataClassifier {
  /**
   * Scans a text block for confidential indicators in a strictly privacy-preserving manner.
   * Discards raw matching text immediately, reporting only count, type, and aggregated risk levels.
   */
  public static classify(content: string, nameContext = ''): ClassificationResult {
    const matches: ClassificationMatch[] = [];
    const secretsFoundSet = new Set<string>();
    const piiFoundSet = new Set<string>();
    
    // 1. Scan Regular Expression Patterns
    for (const pattern of GOVERNANCE_RE_PATTERNS) {
      // Find matches
      const regex = new RegExp(pattern.regex);
      let count = 0;
      
      if (regex.global) {
        let match;
        // Be safe with infinite loops in regex execution
        let attempts = 0;
        while ((match = regex.exec(content)) !== null && attempts++ < 1000) {
          count++;
        }
      } else {
        if (regex.test(content)) {
          count = 1;
        }
      }

      if (count > 0) {
        matches.push({
          patternType: pattern.name,
          count
        });

        if (pattern.category === 'secret') {
          secretsFoundSet.add(pattern.name);
        } else if (pattern.category === 'pii') {
          piiFoundSet.add(pattern.name);
        } else if (pattern.category === 'financial') {
          piiFoundSet.add(pattern.name); // financial shares PII container
        }
      }
    }

    // 2. Scan Entropy Candidates
    const highEntropyTokens = scanHighEntropyTokens(content);
    if (highEntropyTokens.length > 0) {
      matches.push({
        patternType: 'HIGH_ENTROPY_SECRET_CANDIDATE',
        count: highEntropyTokens.length
      });
      secretsFoundSet.add('HIGH_ENTROPY_SECRET_CANDIDATE');
    }

    // 2b. Filename/name context heuristic analysis (.env files, key folders, wallet keys)
    const normalizedName = nameContext.toLowerCase();
    if (normalizedName.includes('.env') || normalizedName.endsWith('.pem') || normalizedName.endsWith('.key') || normalizedName.includes('id_rsa')) {
      const nameMatchIndex = matches.findIndex(m => m.patternType === 'ENVIRONMENT_OR_SSH_FILENAME');
      if (nameMatchIndex === -1) {
        matches.push({
          patternType: 'ENVIRONMENT_OR_SSH_FILENAME',
          count: 1
        });
      }
      secretsFoundSet.add('FILE_SYSTEM_EXPOSED_SECRET');
    }

    // Convert sets to lists
    const secretsFound = Array.from(secretsFoundSet);
    const piiFound = Array.from(piiFoundSet);
    const containsSecrets = secretsFound.length > 0;

    // 3. Compute Heuristics (PII risk, Governance Risk, and Abnormal Access Score)
    const piiRisk = this.calculatePiiRisk(piiFound, matches);
    const governanceRisk = this.calculateGovernanceRisk(secretsFound, piiFound, matches, normalizedName);
    const abnormalAccessScore = 0; // Default baseline node access anomalies, computed dynamically in telemetry pipelines

    // 4. Map Risk Scores to corporate classifications
    let sensitivityLevel: SensitivityLevel = 'low';
    let complianceStatus: ComplianceStatus = 'compliant';
    let classificationSummary = 'Standard operational asset. No critical credentials or personal files detected.';

    if (governanceRisk >= 80) {
      sensitivityLevel = 'critical';
      complianceStatus = 'non-compliant';
      classificationSummary = `CRITICAL COMPLIANCE THREAT: Discovered ${secretsFound.length} explicit secret vectors and ${piiFound.length} raw identity records. Immediate isolation recommended.`;
    } else if (governanceRisk >= 50) {
      sensitivityLevel = 'high';
      complianceStatus = 'warning';
      classificationSummary = `EVALUATION EXPOSURE: Significant data concentration. Discovered keys or compliance-sensitive files in staging directory structure.`;
    } else if (governanceRisk >= 20) {
      sensitivityLevel = 'medium';
      complianceStatus = 'compliant';
      classificationSummary = `MODERATE RISK: Minor records or general telemetry parameters checked without severe cryptographic credentials.`;
    }

    return {
      containsSecrets,
      piiRisk,
      abnormalAccessScore,
      sensitivityLevel,
      complianceStatus,
      classificationSummary,
      governanceRisk,
      secretsFound,
      piiFound,
      matches
    };
  }

  private static calculatePiiRisk(piiFound: string[], matches: ClassificationMatch[]): number {
    if (piiFound.length === 0) return 0;
    
    let score = 0;
    for (const type of piiFound) {
      if (type === 'SOCIAL_SECURITY_NUMBER') score += 40;
      if (type === 'CREDIT_CARD_PAN') score += 35;
      if (type === 'IBAN_CODE') score += 30;
      if (type === 'EMAIL_ADDRESS') score += 10;
      if (type === 'TELEPHONE_NUMBER') score += 10;
    }

    const matchesCount = matches.filter(m => ['SOCIAL_SECURITY_NUMBER', 'CREDIT_CARD_PAN', 'IBAN_CODE', 'EMAIL_ADDRESS', 'TELEPHONE_NUMBER'].includes(m.patternType))
      .reduce((sum, current) => sum + current.count, 0);
    
    score += Math.min(25, matchesCount * 2); // scale by occurrence

    return Math.min(100, score);
  }

  private static calculateGovernanceRisk(secretsFound: string[], piiFound: string[], matches: ClassificationMatch[], filename: string): number {
    let score = 0;
    
    // Heavily penalize cryptographic secrets, databases, or cloud keys
    for (const secret of secretsFound) {
      if (secret === 'PRIVATE_KEY') score += 50;
      if (secret === 'AWS_API_KEY') score += 45;
      if (secret === 'DB_PASSWORD_URI') score += 40;
      if (secret === 'BEARER_JWT_TOKEN') score += 30;
      if (secret === 'PASSWORD_ASSIGNMENT') score += 35;
      if (secret === 'GENERIC_API_KEY') score += 25;
      if (secret === 'HIGH_ENTROPY_SECRET_CANDIDATE') score += 20;
    }

    // Penalize PII
    for (const pii of piiFound) {
      if (pii === 'SOCIAL_SECURITY_NUMBER') score += 25;
      if (pii === 'CREDIT_CARD_PAN') score += 30;
      if (pii === 'IBAN_CODE') score += 20;
      if (pii === 'LEGAL_CLASSIFICATION') score += 15;
    }

    // Add filename penalty
    if (filename.includes('.env') || filename.endsWith('.pem') || filename.endsWith('.key')) {
      score += 25;
    }

    return Math.min(100, Math.round(score));
  }
}
