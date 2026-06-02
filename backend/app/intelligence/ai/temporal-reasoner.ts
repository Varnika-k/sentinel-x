import { temporalMemoryEngine } from './memory-engine';
import { logger } from '../../core/logger';

export class TemporalReasoner {
  public reasonOverTime(nodeId: string, currentAbnormalScore: number): {
    isRepeatedAnomaly: boolean;
    frequencyRating: 'low' | 'medium' | 'high' | 'chronic';
    blastTrend: 'rising' | 'clamping' | 'stable';
    evolutionNarrative: string;
    priorEventsCount: number;
  } {
    logger.debug(`[TemporalReasoner] Reasoning over time for asset node: ${nodeId}`);

    const history = temporalMemoryEngine.getBlastEvolution(nodeId) || [];
    const priors = temporalMemoryEngine.getPriorPatterns().filter(p => p.nodeId === nodeId);

    // Analyze blast evolution trends
    let trend: 'rising' | 'clamping' | 'stable' = 'stable';
    if (history.length >= 2) {
      const first = history[0];
      const last = history[history.length - 1];
      if (last > first + 10) {
        trend = 'rising';
      } else if (last < first - 10) {
        trend = 'clamping';
      }
    }

    const priorityScore = currentAbnormalScore;
    const count = priors.length;
    let frequency: 'low' | 'medium' | 'high' | 'chronic' = 'low';
    if (count > 5) frequency = 'chronic';
    else if (count > 3) frequency = 'high';
    else if (count > 1) frequency = 'medium';

    let evolutionNarrative = '';
    if (count > 0) {
      evolutionNarrative = `Asset coordinates have flagged repeated tactical indicators with ${count} logged compromises. Blast evolution trend is currently ${trend}.`;
    } else {
      evolutionNarrative = `Baseline compliance integrity checks are steady. Blast evolution registers as stable.`;
    }

    return {
      isRepeatedAnomaly: count > 0,
      frequencyRating: frequency,
      blastTrend: trend,
      evolutionNarrative,
      priorEventsCount: count
    };
  }
}

export const temporalReasoner = new TemporalReasoner();
