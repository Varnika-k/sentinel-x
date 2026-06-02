import { UserIdentity } from './types';
import { logger } from '../../core/logger';

export interface PrivilegeEscalationSignal {
  username: string;
  previousLevel: string;
  requestedLevel: string;
  sourceNodeId: string;
  isSuspicious: boolean;
  scoreDeduction: number;
}

export class PrivilegeMonitor {
  private static instance: PrivilegeMonitor;
  private escalations: PrivilegeEscalationSignal[] = [];

  private constructor() {}

  public static getInstance(): PrivilegeMonitor {
    if (!PrivilegeMonitor.instance) {
      PrivilegeMonitor.instance = new PrivilegeMonitor();
    }
    return PrivilegeMonitor.instance;
  }

  /**
   * Evaluates if a credential privilege change represents an escalation attack
   */
  public evaluatePrivilegeTransition(
    identity: UserIdentity, 
    newLevel: 'none' | 'low' | 'medium' | 'high' | 'root_admin', 
    sourceNodeId: string
  ): PrivilegeEscalationSignal {
    const weights = { none: 0, low: 1, medium: 2, high: 3, root_admin: 4 };
    const prevWeight = weights[identity.privilegeLevel];
    const newWeight = weights[newLevel];

    let isSuspicious = false;
    let scoreDeduction = 0;

    if (newWeight > prevWeight) {
      // Escalation occurred
      const levelGap = newWeight - prevWeight;
      
      // Suspicious situations:
      // 1. Extreme jumps (e.g. low straight to root_admin)
      // 2. High-critical zone nodes initiating root conversions (e.g., from public-domain perimeter)
      const isPublicZone = sourceNodeId.startsWith('pc-visitor') || sourceNodeId.startsWith('dmz-');
      
      if (levelGap >= 2 || (newLevel === 'root_admin' && isPublicZone)) {
        isSuspicious = true;
        scoreDeduction = levelGap * 20 + (isPublicZone ? 30 : 10);
      } else {
        scoreDeduction = levelGap * 5;
      }

      logger.warn(`[PrivilegeMonitor] Privilege altered for [${identity.username}]. ${identity.privilegeLevel.toUpperCase()} -> ${newLevel.toUpperCase()} on node [${sourceNodeId}]. Suspicious: ${isSuspicious}`);
    }

    const signal: PrivilegeEscalationSignal = {
      username: identity.username,
      previousLevel: identity.privilegeLevel,
      requestedLevel: newLevel,
      sourceNodeId,
      isSuspicious,
      scoreDeduction
    };

    this.escalations.push(signal);
    if (this.escalations.length > 50) {
      this.escalations.shift();
    }

    return signal;
  }

  public getEscalationHistory(username?: string): PrivilegeEscalationSignal[] {
    if (username) {
      return this.escalations.filter(e => e.username === username);
    }
    return this.escalations;
  }
}

export const privilegeMonitor = PrivilegeMonitor.getInstance();
