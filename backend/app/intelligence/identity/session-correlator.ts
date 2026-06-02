import { UserSession } from './types';
import { logger } from '../../core/logger';

export class SessionCorrelator {
  private static instance: SessionCorrelator;
  private activeSessions: Map<string, UserSession> = new Map();

  private constructor() {
    this.seedDefaultSessions();
  }

  public static getInstance(): SessionCorrelator {
    if (!SessionCorrelator.instance) {
      SessionCorrelator.instance = new SessionCorrelator();
    }
    return SessionCorrelator.instance;
  }

  private seedDefaultSessions(): void {
    const sessions = [
      { id: 'sess-ad-001', name: 'admin-alpha', node: 'k8s-pod-auth-api-559b', ip: '10.150.12.44', ua: 'Go-http-client/2.0' },
      { id: 'sess-falco-012', name: 'analyst-dev', node: 'pc-admin-hq', ip: '192.168.1.102', ua: 'Mozilla/5.0 (Macintosh)' },
      { id: 'sess-aws-078', name: 'corp-sync', node: 'aws-s3-compliance-bucket', ip: '54.210.12.89', ua: 'aws-cli/1.22.4' }
    ];

    sessions.forEach(s => {
      this.activeSessions.set(s.id, {
        sessionId: s.id,
        username: s.name,
        startedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        ipAddress: s.ip,
        userAgent: s.ua,
        currentNodeId: s.node,
        tokenValidity: 'valid',
        isCompromised: false,
        actionSequence: [
          { timestamp: new Date().toISOString(), actionType: 'login', targetAsset: s.node, severity: 'low', zeroTrustVerified: true }
        ],
        correlatedSessionIds: [s.id]
      });
    });
  }

  public getSession(sessionId: string): UserSession | undefined {
    return this.activeSessions.get(sessionId);
  }

  public getSessionsByUsername(username: string): UserSession[] {
    return Array.from(this.activeSessions.values()).filter(s => s.username === username);
  }

  public registerSession(session: UserSession): void {
    this.activeSessions.set(session.sessionId, session);
    logger.info(`[SessionCorrelator] Registered session ${session.sessionId} for ${session.username}`);
  }

  public logSessionAction(
    sessionId: string,
    actionType: string,
    targetAsset: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    ztVerified: boolean = true
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.actionSequence.push({
        timestamp: new Date().toISOString(),
        actionType,
        targetAsset,
        severity,
        zeroTrustVerified: ztVerified
      });
      if (session.actionSequence.length > 30) {
        session.actionSequence.shift();
      }
      logger.debug(`[SessionCorrelator] Logged action to session ${sessionId}: ${actionType}`);
    }
  }

  /**
   * Correlates sessions having the same IP address or user-agent to detect credential hijacking
   */
  public correlateCrossSystemSessions(sessionId: string): string[] {
    const targetSession = this.activeSessions.get(sessionId);
    if (!targetSession) return [];

    const matches: string[] = [];
    for (const [id, value] of this.activeSessions.entries()) {
      if (id === sessionId) continue;

      // Correlate on IP or user identity with weird overlaps
      const ipMatch = value.ipAddress === targetSession.ipAddress;
      const userOverlap = value.username === targetSession.username;

      if (ipMatch || userOverlap) {
        matches.push(id);
        if (!targetSession.correlatedSessionIds.includes(id)) {
          targetSession.correlatedSessionIds.push(id);
        }
        if (!value.correlatedSessionIds.includes(sessionId)) {
          value.correlatedSessionIds.push(sessionId);
        }
      }
    }

    if (matches.length > 0) {
      logger.info(`[SessionCorrelator] Session correlation detected for [${sessionId}]. Intersecting systems: [${matches.join(', ')}]`);
    }

    return targetSession.correlatedSessionIds;
  }
}

export const sessionCorrelator = SessionCorrelator.getInstance();
