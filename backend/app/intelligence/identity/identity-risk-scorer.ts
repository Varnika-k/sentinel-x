import { UserIdentity } from './types';
import { privilegeMonitor } from './privilege-monitor';
import { behavioralProfiler } from './behavioral-profiler';
import { movementAnalyzer } from './movement-analyzer';
import { sessionCorrelator } from './session-correlator';
import { logger } from '../../core/logger';

export class IdentityRiskScorer {
  private static instance: IdentityRiskScorer;

  private constructor() {}

  public static getInstance(): IdentityRiskScorer {
    if (!IdentityRiskScorer.instance) {
      IdentityRiskScorer.instance = new IdentityRiskScorer();
    }
    return IdentityRiskScorer.instance;
  }

  /**
   * Synthesizes global telemetry indicators for a user identity, producing an integer risk score 0..100
   */
  public recalculateIdentityRisk(identity: UserIdentity): number {
    let riskAccumulator = 0;

    // 1. Behavior Anomaly Impact
    const profile = behavioralProfiler.getProfile(identity.username);
    const recentAnomalies = profile.historicalAnomalies.length;
    riskAccumulator += recentAnomalies * 8; // +8 per anomalous history point

    // 2. Escalations & Privileges
    const transitions = privilegeMonitor.getEscalationHistory(identity.username);
    transitions.forEach(t => {
      riskAccumulator += t.scoreDeduction; // Direct danger indicators from privilege monitor
    });

    // 3. Movement anomalies
    const suspiciousActions = movementAnalyzer.getSuspiciousMovements(identity.username);
    suspiciousActions.forEach(a => {
      if (a.severity === 'critical') riskAccumulator += 35;
      else if (a.severity === 'high') riskAccumulator += 20;
      else if (a.severity === 'medium') riskAccumulator += 10;
      else riskAccumulator += 5;
    });

    // 4. Session Correlation anomalies
    const sessions = sessionCorrelator.getSessionsByUsername(identity.username);
    let hijackedIndicators = 0;
    sessions.forEach(s => {
      if (s.tokenValidity === 'hijacked_token_anomaly') hijackedIndicators += 40;
      if (s.isCompromised) hijackedIndicators += 30;
      riskAccumulator += s.correlatedSessionIds.length * 5; // Extra systems increase target breadth
    });
    riskAccumulator += hijackedIndicators;

    // 5. Hardening clamp to 0-100 range
    const finalRisk = Math.min(100, Math.max(0, Math.round(riskAccumulator)));
    
    identity.riskScore = finalRisk;
    identity.behavioralAnomalyScore = Math.min(100, Math.round(recentAnomalies * 12 + hijackedIndicators * 0.4));
    
    logger.debug(`[IdentityRiskScorer] Recalculated dynamic risk for [${identity.username}]: ${identity.riskScore}/100`);
    return finalRisk;
  }
}

export const identityRiskScorer = IdentityRiskScorer.getInstance();
