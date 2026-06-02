import { AIRecordedPattern, AIForensicSnapshot } from './types';
import { logger } from '../../core/logger';

export class TemporalMemoryEngine {
  private static instance: TemporalMemoryEngine;
  
  private priorPatterns: AIRecordedPattern[] = [];
  private historicalViolations: any[] = [];
  private identityRiskHistory: Map<string, any[]> = new Map();
  private propagationRuns: any[] = [];
  private blastEvolution: Map<string, number[]> = new Map();
  private forensicReconstructions: Map<string, AIForensicSnapshot[]> = new Map();

  private constructor() {
    this.seedInitialHistory();
  }

  public static getInstance(): TemporalMemoryEngine {
    if (!TemporalMemoryEngine.instance) {
      TemporalMemoryEngine.instance = new TemporalMemoryEngine();
    }
    return TemporalMemoryEngine.instance;
  }

  /**
   * Seeds historical operational memory for authentic-feeling enterprise cyber governance.
   */
  private seedInitialHistory() {
    logger.info('[MemoryEngine] Initializing temporal cognitive state storage with historical records...');
    
    // Seed standard simulated prior attack patterns
    this.priorPatterns.push({
      id: 'MEM-001',
      timestamp: new Date(Date.now() - 3600000 * 24 * 3).toISOString(), // 3 days ago
      patternType: 'Credential Harvesting Attempt',
      nodeId: 'pc-admin-hq',
      threatLevel: 'high',
      mitreTactic: 'credential-access',
      violatedPolicies: ['POL-SEC-04: Credential Boundary Restriction'],
      narrativeSummary: 'Failed privilege escalation attempts detected polling LDAP directory keys.'
    });

    this.historicalViolations.push({
      id: 'VIOL-088',
      nodeId: 'dept-finance-workstation',
      policyId: 'POL-COMP-10',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
      rule: 'Confidential asset routing integrity checkpoint failure',
      severity: 'medium'
    });

    this.blastEvolution.set('k8s-pod-auth-api-559b', [10, 25, 45, 60]);
    this.blastEvolution.set('pc-admin-hq', [15, 30, 65, 85]);
  }

  public recordPattern(pattern: AIRecordedPattern) {
    this.priorPatterns.push(pattern);
    if (this.priorPatterns.length > 200) {
      this.priorPatterns.shift();
    }
    
    // Record blast evolution values
    const currentList = this.blastEvolution.get(pattern.nodeId) || [];
    currentList.push(pattern.threatLevel === 'critical' ? 85 : (pattern.threatLevel === 'high' ? 60 : 30));
    if (currentList.length > 20) currentList.shift();
    this.blastEvolution.set(pattern.nodeId, currentList);
  }

  public getHistorySummary(nodeId?: string): string {
    let summary = 'TEMPORAL MEMORY DIGEST:\n';
    
    const relevantPatterns = nodeId 
      ? this.priorPatterns.filter(p => p.nodeId === nodeId)
      : this.priorPatterns;

    if (relevantPatterns.length > 0) {
      summary += `- Detected ${relevantPatterns.length} prior historical recurring pattern alignments on targeted systems.\n`;
      relevantPatterns.slice(-3).forEach(p => {
        summary += `  * [${p.timestamp}] Stage: ${p.mitreTactic}. Severity: ${p.threatLevel}. Synopsis: ${p.narrativeSummary}\n`;
      });
    } else {
      summary += `- No matching baseline anomalies historically recorded within current asset node coordinates.\n`;
    }

    const matchedViolations = this.historicalViolations.filter(v => !nodeId || v.nodeId === nodeId);
    if (matchedViolations.length > 0) {
      summary += `- Registered ${matchedViolations.length} compliance/governance violations within active trace window.\n`;
    }

    return summary;
  }

  public recordGovernanceViolation(violation: any) {
    this.historicalViolations.push(violation);
    if (this.historicalViolations.length > 500) this.historicalViolations.shift();
  }

  public recordIdentityRisk(identityId: string, riskScore: number, abnormalDetails: string) {
    const history = this.identityRiskHistory.get(identityId) || [];
    history.push({ timestamp: new Date().toISOString(), riskScore, abnormalDetails });
    if (history.length > 100) history.shift();
    this.identityRiskHistory.set(identityId, history);
  }

  public recordPropagation(run: any) {
    this.propagationRuns.push(run);
    if (this.propagationRuns.length > 100) this.propagationRuns.shift();
  }

  public recordForensicSnapshot(sessionId: string, snapshot: AIForensicSnapshot) {
    const list = this.forensicReconstructions.get(sessionId) || [];
    list.push(snapshot);
    this.forensicReconstructions.set(sessionId, list);
  }

  public getPriorPatterns() {
    return this.priorPatterns;
  }

  public getHistoricalViolations() {
    return this.historicalViolations;
  }

  public getIdentityRiskHistory(id: string) {
    return this.identityRiskHistory.get(id) || [];
  }

  public getBlastEvolution(id: string) {
    return this.blastEvolution.get(id) || [10];
  }

  public getForensicReconstructions(sessionId: string) {
    return this.forensicReconstructions.get(sessionId) || [];
  }

  public clearAll() {
    this.priorPatterns = [];
    this.historicalViolations = [];
    this.identityRiskHistory.clear();
    this.propagationRuns = [];
    this.blastEvolution.clear();
    this.forensicReconstructions.clear();
    this.seedInitialHistory();
  }
}

export const temporalMemoryEngine = TemporalMemoryEngine.getInstance();
