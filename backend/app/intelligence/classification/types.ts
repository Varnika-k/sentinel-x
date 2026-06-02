export type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant';

export interface ClassificationMatch {
  patternType: string;
  count: number;
}

export interface ClassificationResult {
  containsSecrets: boolean;
  piiRisk: number; // 0 to 100
  abnormalAccessScore: number; // 0 to 100
  sensitivityLevel: SensitivityLevel;
  complianceStatus: ComplianceStatus;
  classificationSummary: string;
  governanceRisk: number; // 0 to 100
  secretsFound: string[]; // list of classified types of secrets found, e.g. ["API_KEY", "PRIVATE_KEY"], never raw values
  piiFound: string[]; // list of classified types of PII found, e.g. ["EMAIL", "SSN", "PHONE"], never raw values
  matches: ClassificationMatch[];
}
