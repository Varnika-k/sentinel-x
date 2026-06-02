import { UserIdentity, UserSession, SensitiveAccessAudit } from './types';
import { behavioralProfiler } from './behavioral-profiler';
import { privilegeMonitor } from './privilege-monitor';
import { sessionCorrelator } from './session-correlator';
import { movementAnalyzer } from './movement-analyzer';
import { identityRiskScorer } from './identity-risk-scorer';
import { trustAnalyzer } from './trust-analyzer';
import { insiderThreatEngine } from './insider-threat-engine';
import { logger } from '../../core/logger';
import { eventBus } from '../../core/event-bus';

export class IdentityEngine {
  private static instance: IdentityEngine;
  private identities: Map<string, UserIdentity> = new Map();
  private audits: SensitiveAccessAudit[] = [];

  private constructor() {
    this.seedDefaultIdentities();
  }

  public static getInstance(): IdentityEngine {
    if (!IdentityEngine.instance) {
      IdentityEngine.instance = new IdentityEngine();
    }
    return IdentityEngine.instance;
  }

  private seedDefaultIdentities(): void {
    const defaultUsers: Array<Partial<UserIdentity> & { username: string; email: string }> = [
      { username: 'admin-alpha', email: 'admin-alpha@sentinelx.io', department: 'iam_root', privilegeLevel: 'root_admin', baseTrustScore: 95 },
      { username: 'analyst-dev', email: 'analyst-dev@sentinelx.io', department: 'engineering', privilegeLevel: 'medium', baseTrustScore: 80 },
      { username: 'corp-sync', email: 'corp-sync@sentinelx.io', department: 'third_party', privilegeLevel: 'low', baseTrustScore: 70 },
      { username: 'finance-lead', email: 'finance-lead@sentinelx.io', department: 'finance', privilegeLevel: 'low', baseTrustScore: 85 },
      { username: 'secops-ranger', email: 'secops-ranger@sentinelx.io', department: 'secops', privilegeLevel: 'high', baseTrustScore: 98 }
    ];

    defaultUsers.forEach(user => {
      const identity: UserIdentity = {
        username: user.username,
        email: user.email,
        department: user.department || 'engineering',
        privilegeLevel: user.privilegeLevel || 'low',
        baseTrustScore: user.baseTrustScore || 80,
        currentTrustScore: user.baseTrustScore || 80,
        riskScore: 0,
        insiderThreatConfidence: 0,
        activeSessionsCount: 1,
        lastActive: new Date().toISOString(),
        isQuarantined: false,
        behavioralAnomalyScore: 0,
        complianceViolationsCount: 0
      };

      this.identities.set(user.username, identity);
      
      // Perform initial risk scoring and continuous evaluation seed
      identityRiskScorer.recalculateIdentityRisk(identity);
      trustAnalyzer.evaluateDynamicTrust(identity);
      insiderThreatEngine.evaluateInsiderThreatIncidents(identity);
    });
  }

  public listIdentities(): UserIdentity[] {
    return Array.from(this.identities.values());
  }

  public getIdentity(username: string): UserIdentity | undefined {
    return this.identities.get(username);
  }

  public registerIdentity(identity: UserIdentity): void {
    this.identities.set(identity.username, identity);
  }

  /**
   * Main pipeline update. Triggers full assessment pipeline for the identity on any system activity
   */
  public async processIdentityActivity(
    username: string,
    sessionId: string,
    currentAssetNodeId: string,
    subnetZone: string,
    actionType: string,
    actionSeverity: 'low' | 'medium' | 'high' | 'critical',
    dataBytes: number = 0
  ): Promise<{
    identity: UserIdentity;
    isApproved: boolean;
    verificationLog: string;
    incidentReport?: any;
  }> {
    logger.info(`[IdentityEngine] Assessing telemetry activity trigger for [${username}] on asset [${currentAssetNodeId}]. Action: ${actionType.toUpperCase()}`);

    let identity = this.getIdentity(username);
    if (!identity) {
      identity = {
        username,
        email: `${username}@sentinelx.io`,
        department: 'engineering',
        privilegeLevel: 'low',
        baseTrustScore: 80,
        currentTrustScore: 80,
        riskScore: 0,
        insiderThreatConfidence: 0,
        activeSessionsCount: 1,
        lastActive: new Date().toISOString(),
        isQuarantined: false,
        behavioralAnomalyScore: 0,
        complianceViolationsCount: 0
      };
      this.identities.set(username, identity);
    }

    identity.lastActive = new Date().toISOString();

    // 1. Log Session Action
    sessionCorrelator.logSessionAction(sessionId, actionType, currentAssetNodeId, actionSeverity);
    sessionCorrelator.correlateCrossSystemSessions(sessionId);

    // 2. Track Behavioral Metrics & detect working hours/sector issues
    const hourNow = new Date().getHours();
    behavioralProfiler.trackActivity(username, subnetZone, dataBytes, hourNow);

    // 3. Coordinate risk evaluation and trust scoring
    identityRiskScorer.recalculateIdentityRisk(identity);
    trustAnalyzer.evaluateDynamicTrust(identity);

    // 4. Verify Access continuous challenge
    const challengeResult = trustAnalyzer.verifyAccessIntent(identity, currentAssetNodeId, actionSeverity);

    if (!challengeResult.isApproved) {
      identity.complianceViolationsCount++;
      // Re-evaluate in case violation count alters trust
      identityRiskScorer.recalculateIdentityRisk(identity);
      trustAnalyzer.evaluateDynamicTrust(identity);
    }

    // 5. Build full Insider Threat scenario analysis
    const incident = insiderThreatEngine.evaluateInsiderThreatIncidents(identity);

    // If access was blocked, or confidence is critical, issue live warning
    if (!challengeResult.isApproved || incident.overallConfidence > 50) {
      await eventBus.publish('identity:threat-detected', {
        username,
        riskScore: identity.riskScore,
        trustScore: identity.currentTrustScore,
        insiderConfidence: incident.overallConfidence,
        governanceLevel: incident.governanceEscalationLevel,
        actionApplied: challengeResult.actionApplied,
        reasoning: challengeResult.reasoning,
        assetNodeId: currentAssetNodeId
      });
    }

    return {
      identity,
      isApproved: challengeResult.isApproved,
      verificationLog: challengeResult.reasoning,
      incidentReport: incident
    };
  }

  /**
   * Sensitive Asset Access Audit Trail logs
   */
  public logSensitiveAccessAudit(
    username: string,
    assetNodeId: string,
    classification: SensitiveAccessAudit['classification'],
    response: SensitiveAccessAudit['accessResponse'],
    multiplier: number = 1.0
  ): SensitiveAccessAudit {
    const audit: SensitiveAccessAudit = {
      auditId: `AUD-${username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      username,
      assetNodeId,
      timestamp: new Date().toISOString(),
      classification,
      accessResponse: response,
      contextualMultiplier: multiplier
    };

    this.audits.push(audit);
    if (this.audits.length > 100) {
      this.audits.shift();
    }

    logger.warn(`[IdentityEngine] Sensitive Access Audited: User ${username} -> ${assetNodeId}. Status: ${response.toUpperCase()}`);
    return audit;
  }

  public getAudits(): SensitiveAccessAudit[] {
    return this.audits;
  }
}

export const identityEngine = IdentityEngine.getInstance();
