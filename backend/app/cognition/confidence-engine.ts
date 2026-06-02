import { Hypothesis, EvidenceChain, ReasoningContext } from './types';
import { logger } from '../core/logger';

export class ConfidenceEngine {
  private static instance: ConfidenceEngine;

  private constructor() {}

  public static getInstance(): ConfidenceEngine {
    if (!ConfidenceEngine.instance) {
      ConfidenceEngine.instance = new ConfidenceEngine();
    }
    return ConfidenceEngine.instance;
  }

  /**
   * Refines hypothesis confidence scores using historical validity rates and evidence parameters.
   */
  public calculateConfidence(
    hypothesis: Hypothesis,
    chain: EvidenceChain | undefined,
    context: ReasoningContext
  ): number {
    if (!chain) {
      return hypothesis.confidenceScore; // fallback
    }

    logger.info(`[ConfidenceEngine] Recalculating logical confidence for Hypothesis: ${hypothesis.id}`);

    // 1. Establish the baseline from the primary evidence node
    const primaryReliability = chain.primaryEvidence.reliabilityScore; // e.g. 0.95
    const primarySeverityWeight = this.getSeverityWeight(chain.primaryEvidence.severity); // 1.0 to 1.5

    let confidenceValue = primaryReliability * primarySeverityWeight * 60; // Base score around 50-90

    // 2. Incorporate supporting evidence weights
    chain.supportingEvidence.forEach(ev => {
      const weight = ev.reliabilityScore * this.getSeverityWeight(ev.severity) * 6;
      confidenceValue += weight;
    });

    // 3. Subtract counter-evidence penalties
    chain.counterEvidence.forEach(ev => {
      const weight = ev.reliabilityScore * this.getSeverityWeight(ev.severity) * 15;
      confidenceValue -= weight;
    });

    // 4. Time decay factor (penalize if evidence is ancient)
    const timeDecay = this.calculateFreshnessDecay(chain.primaryEvidence.timestamp);
    confidenceValue = confidenceValue * timeDecay;

    // 5. Governance contextual adjustments
    // If the hypothesis is about misconfiguration or insider threat, and our overall governance readiness is terrible,
    // the likelihood is elevated.
    if (hypothesis.type === 'CLOUD_MISCONFIGURATION' && context.governanceSubset.readinessScore < 80) {
      confidenceValue += (100 - context.governanceSubset.readinessScore) * 0.25;
    }

    if (hypothesis.type === 'INSIDER_ATTACK' && context.governanceSubset.zeroTrustBreaches.length > 3) {
      confidenceValue += 10;
    }

    // 6. Clamp value between 0 and 100
    const finalScore = Math.max(5, Math.min(98, Math.round(confidenceValue)));
    
    logger.debug(`[ConfidenceEngine] Computed final confidence score for ${hypothesis.id}: ${finalScore}%`);

    return finalScore;
  }

  private getSeverityWeight(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    switch (severity) {
      case 'critical': return 1.4;
      case 'high': return 1.25;
      case 'medium': return 1.0;
      case 'low': return 0.8;
      default: return 1.0;
    }
  }

  /**
   * Calculates a decay multiplier between 0.6 and 1.0 depending on age in hours.
   */
  private calculateFreshnessDecay(timestamp: string): number {
    try {
      const recordTime = new Date(timestamp).getTime();
      const now = Date.now();
      const ageHours = (now - recordTime) / (1000 * 60 * 60);

      if (ageHours <= 1) return 1.0;
      if (ageHours >= 24) return 0.6;

      // Linear decay between 1 hr and 24 hrs
      return 1.0 - ((ageHours - 1) / 23) * 0.4;
    } catch {
      return 0.9;
    }
  }
}

export const confidenceEngine = ConfidenceEngine.getInstance();
