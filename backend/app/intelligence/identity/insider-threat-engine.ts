import { InsiderThreatIncident, UserIdentity } from './types';
import { behavioralProfiler } from './behavioral-profiler';
import { privilegeMonitor } from './privilege-monitor';
import { movementAnalyzer } from './movement-analyzer';
import { sessionCorrelator } from './session-correlator';
import { logger } from '../../core/logger';

export class InsiderThreatEngine {
  private static instance: InsiderThreatEngine;
  private threatIncidents: Map<string, InsiderThreatIncident> = new Map();

  private constructor() {}

  public static getInstance(): InsiderThreatEngine {
    if (!InsiderThreatEngine.instance) {
      InsiderThreatEngine.instance = new InsiderThreatEngine();
    }
    return InsiderThreatEngine.instance;
  }

  /**
   * Performs advanced indicator matching to isolate stealth enterprise saboteurs or compromised accounts
   */
  public evaluateInsiderThreatIncidents(identity: UserIdentity): InsiderThreatIncident {
    const username = identity.username;
    
    // Retrieve indicators
    const profile = behavioralProfiler.getProfile(username);
    const escalations = privilegeMonitor.getEscalationHistory(username);
    const movements = movementAnalyzer.getSuspiciousMovements(username);
    const sessions = sessionCorrelator.getSessionsByUsername(username);

    const indicators: string[] = [];
    const sessionIds: string[] = sessions.map(s => s.sessionId);
    const timeline: InsiderThreatIncident['timelineReconstruction'] = [];

    // Indicator 1: Off-hours operation + sensitive zone access
    const hour = new Date().getHours();
    const isNightWork = hour < 6 || hour > 20;

    let confidenceValue = 0;

    if (profile.historicalAnomalies.length > 0) {
      indicators.push('ABNORMAL_BEHAVIORAL_METRICS');
      confidenceValue += profile.historicalAnomalies.length * 10;
      profile.historicalAnomalies.forEach(a => {
        timeline.push({
          timestamp: a.timestamp,
          step: 'Behavioral Anomaly Recorded',
          impact: a.description
        });
      });
    }

    if (escalations.some(e => e.isSuspicious)) {
      indicators.push('SUSPICIOUS_PRIVILEGE_ESCALATION');
      confidenceValue += 35;
      escalations.forEach(e => {
        timeline.push({
          timestamp: new Date().toISOString(),
          step: `Privilege Alteration: ${e.previousLevel} -> ${e.requestedLevel}`,
          impact: `Triggered suspicion score jump representing unauthorized administration rights.`
        });
      });
    }

    if (movements.length > 0) {
      indicators.push('LATERAL_ACCESS_PROPAGATION');
      confidenceValue += movements.length * 15;
      movements.forEach(m => {
        timeline.push({
          timestamp: m.timestamp,
          step: `Suspicious Step Transit: ${m.anomalyType}`,
          impact: `Credential navigation discovered moving from ${m.sourceNodeId} straight to ${m.targetNodeId}.`
        });
      });
    }

    if (sessions.some(s => s.tokenValidity === 'hijacked_token_anomaly')) {
      indicators.push('HIJACKED_SESSION_INDICATORS');
      confidenceValue += 40;
      timeline.push({
        timestamp: new Date().toISOString(),
        step: 'Session Token Invalidated',
        impact: 'Active sessions verified with hijacked token anomalies.'
      });
    }

    if (isNightWork && profile.historicalAnomalies.length > 2) {
      indicators.push('STEALTH_OFF_HOURS_FOOTPRINT');
      confidenceValue += 20;
    }

    const confidence = Math.min(100, Math.round(confidenceValue));
    identity.insiderThreatConfidence = confidence;

    // Determine governance auto-escalation based on threat confidence check
    let governanceLevel: InsiderThreatIncident['governanceEscalationLevel'] = 'none';
    if (confidence > 80) {
      governanceLevel = 'full_domain_lockdown';
      identity.isQuarantined = true;
    } else if (confidence > 55) {
      governanceLevel = 'quarantine';
      identity.isQuarantined = true;
    } else if (confidence > 30) {
      governanceLevel = 'alert';
    }

    // Build concise, clear AI context narration
    const indicatorsList = indicators.length > 0 ? indicators.join(', ') : 'none';
    const aiContext = `
IDENTITY ANALYSIS FOR [${username}]:
- Overall Insider Threat Confidence is calculated at: ${confidence}%
- Identified Indicators of Threat Patterns: [${indicatorsList}]
- Active Session Count: ${sessions.length}
- Current Zero Trust Enforcer Level: ${governanceLevel.toUpperCase()}
- Key Dangers: lateral propagation, off-hours execution patterns, abnormal segment crossings.
    `.trim();

    const incident: InsiderThreatIncident = {
      incidentId: `INC-${username.toUpperCase()}-${Date.now().toString().slice(-4)}`,
      username,
      overallConfidence: confidence,
      primaryIndicators: indicators,
      sessionChains: sessionIds,
      governanceEscalationLevel: governanceLevel,
      timelineReconstruction: timeline.sort((a,b) => a.timestamp.localeCompare(b.timestamp)),
      aiReasoningContext: aiContext
    };

    this.threatIncidents.set(username, incident);
    logger.info(`[InsiderThreatEngine] Calculated threat confidence for [${username}]: ${confidence}%. Governance level active: ${governanceLevel.toUpperCase()}`);
    return incident;
  }

  public getIncident(username: string): InsiderThreatIncident | undefined {
    return this.threatIncidents.get(username);
  }
}

export const insiderThreatEngine = InsiderThreatEngine.getInstance();
