import { logger } from '../../core/logger';

export interface SequencePattern {
  name: string;
  signatureActions: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitreAlignment: string;
}

export class SequenceEngine {
  private static instance: SequenceEngine;
  private predefinedPatterns: SequencePattern[] = [];

  private constructor() {
    this.predefinedPatterns = [
      {
        name: 'APT_CREDENTIAL_DUMPING_FLOW',
        signatureActions: ['Phishing spear', 'Renew auth token', 'Dump credentials data'],
        severity: 'critical',
        mitreAlignment: 'MITRE-T1110 (Credential Access)'
      },
      {
        name: 'LATERAL_DATABASE_RECON_FLOW',
        signatureActions: ['Execute shell ingress', 'Read database crypt', 'Write database records'],
        severity: 'high',
        mitreAlignment: 'MITRE-T1046 (Network Service Discovery)'
      },
      {
        name: 'POLICY_ESCAPE_TUNNELLING_FLOW',
        signatureActions: ['Modify security policy', 'Execute shell ingress'],
        severity: 'medium',
        mitreAlignment: 'MITRE-T1071 (Application Layer Protocol)'
      }
    ];
  }

  public static getInstance(): SequenceEngine {
    if (!SequenceEngine.instance) {
      SequenceEngine.instance = new SequenceEngine();
    }
    return SequenceEngine.instance;
  }

  /**
   * Matches an incoming chronologically-ordered stream of action types against our ATP signatures
   */
  public matchSequence(actions: string[]): {
    matched: boolean;
    pattern?: SequencePattern;
    completenessPercentage: number;
  }[] {
    const results: { matched: boolean; pattern?: SequencePattern; completenessPercentage: number }[] = [];

    this.predefinedPatterns.forEach(pattern => {
      let matchedCount = 0;
      
      pattern.signatureActions.forEach(sigAction => {
        const contains = actions.some(act => act.toLowerCase().includes(sigAction.toLowerCase()));
        if (contains) {
          matchedCount++;
        }
      });

      const completenessPercentage = pattern.signatureActions.length > 0 
        ? Math.round((matchedCount / pattern.signatureActions.length) * 100)
        : 0;

      results.push({
        matched: completenessPercentage === 100,
        pattern,
        completenessPercentage
      });
    });

    return results;
  }
}

export const sequenceEngine = SequenceEngine.getInstance();
