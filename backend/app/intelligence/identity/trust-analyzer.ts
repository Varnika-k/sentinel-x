import { UserIdentity } from './types';
import { logger } from '../../core/logger';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';
import { resolveNodeSector } from './movement-analyzer';

export class TrustAnalyzer {
  private static instance: TrustAnalyzer;

  private constructor() {}

  public static getInstance(): TrustAnalyzer {
    if (!TrustAnalyzer.instance) {
      TrustAnalyzer.instance = new TrustAnalyzer();
    }
    return TrustAnalyzer.instance;
  }

  /**
   * Continuous zero-trust scoring evaluating identity reliability
   */
  public evaluateDynamicTrust(identity: UserIdentity): number {
    let trustScore = identity.baseTrustScore; // Starts at baseline e.g. 95

    // Deduct for risk score
    trustScore -= (identity.riskScore * 0.45);

    // Deduct for compliance gaps
    trustScore -= (identity.complianceViolationsCount * 12);

    // If quarantined, trust instantly falls to minimum
    if (identity.isQuarantined) {
      trustScore = 5;
    }

    // Deduct if user is acting with elevated root admin credentials from suspicious networks
    const isRoot = identity.privilegeLevel === 'root_admin';
    if (isRoot && identity.riskScore > 30) {
      trustScore -= 15;
    }

    const finalTrust = Math.min(100, Math.max(5, Math.round(trustScore)));
    identity.currentTrustScore = finalTrust;

    logger.debug(`[TrustAnalyzer] Evaluated continuous Zero Trust score for [${identity.username}]: ${identity.currentTrustScore}%`);
    return finalTrust;
  }

  /**
   * Continuous Verification Check for assets and actions
   */
  public verifyAccessIntent(
    identity: UserIdentity,
    targetAssetNodeId: string,
    actionSeverity: 'low' | 'medium' | 'high' | 'critical'
  ): { isApproved: boolean; reasoning: string; actionApplied: 'grant' | 'challenge' | 'block' } {
    const assetNode = graphIntelligenceEngine.nodes.get(targetAssetNodeId);
    if (!assetNode) {
      return { isApproved: true, reasoning: 'Asset absent from active topology. Access bypassed.', actionApplied: 'grant' };
    }

    const sector = resolveNodeSector(assetNode);
    const trustClass = sector === 'DATA_CORE' ? 'sensitive' : 'normal';
    const currentTrust = identity.currentTrustScore;

    // Zero-Trust Enforcer Matrices:
    // If trust is low, reject sensitive systems entirely. Challenge highly critical actions.
    if (currentTrust < 30) {
      return { 
        isApproved: false, 
        reasoning: `Zero Trust Blocked: trust score [${currentTrust}%] is below policy limit (30%) for asset ${targetAssetNodeId}.`, 
        actionApplied: 'block' 
      };
    }

    if (trustClass === 'sensitive') {
      if (currentTrust < 60) {
        return {
          isApproved: false,
          reasoning: `Zero Trust Blocked: sensitive zones require at least 60% trust (Current: ${currentTrust}%).`,
          actionApplied: 'block'
        };
      }
      if (actionSeverity === 'critical' || actionSeverity === 'high') {
        if (currentTrust < 80) {
          return {
            isApproved: false,
            reasoning: `Zero Trust MFA Challenged: severe actions in core zones require 80% trust (Current: ${currentTrust}%).`,
            actionApplied: 'challenge'
          };
        }
      }
    }

    return {
      isApproved: true,
      reasoning: 'Access granted. Trusted verification check success.',
      actionApplied: 'grant'
    };
  }
}

export const trustAnalyzer = TrustAnalyzer.getInstance();
