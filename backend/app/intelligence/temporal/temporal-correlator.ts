import { operationalMemory, MemoryTrace } from './operational-memory';
import { anomalyHistory, TemporalAnomalyRecord } from './anomaly-history';
import { driftDetector, DriftReport } from './drift-detector';
import { attackEvolution, EvolutionStage } from './attack-evolution';
import { sequenceEngine } from './sequence-engine';
import { TwinSnapshot } from '../../digital-twin/types';

export class TemporalCorrelator {
  private static instance: TemporalCorrelator;

  private constructor() {}

  public static getInstance(): TemporalCorrelator {
    if (!TemporalCorrelator.instance) {
      TemporalCorrelator.instance = new TemporalCorrelator();
    }
    return TemporalCorrelator.instance;
  }

  /**
   * Compiles the complete temporal reasoning context for both AI evaluation and live frontend indicators
   */
  public compileTemporalContext(baselineSnapshot: TwinSnapshot | null): {
    memories: MemoryTrace[];
    anomalies: TemporalAnomalyRecord[];
    clusters: any[];
    drift: DriftReport | null;
    evolution: EvolutionStage[];
    matchingSequences: any[];
  } {
    const memories = operationalMemory.getMemories();
    const anomalies = anomalyHistory.getAnomalies();
    const clusters = anomalyHistory.clusterAnomalies();
    const evolution = attackEvolution.getTimeline();

    // Compile active actions for sequence analysis
    const actionsPool: string[] = [];
    anomalies.forEach(a => {
      actionsPool.push(a.alertText);
    });
    const matchingSequences = sequenceEngine.matchSequence(actionsPool);

    // Compute drift if a baseline snapshot is supplied
    let drift: DriftReport | null = null;
    if (baselineSnapshot) {
      drift = driftDetector.calculateDrift(baselineSnapshot);
    }

    return {
      memories,
      anomalies,
      clusters,
      drift,
      evolution,
      matchingSequences
    };
  }

  /**
   * Records a snapshot of the current state metrics to the operational memory trace log
   */
  public commitOperationalSnapshot(
    threatLevel: number,
    averageCpu: number,
    activeConnections: number,
    unhealthyCount: number,
    eventsCount: number
  ) {
    let state: MemoryTrace['reconciliationState'] = 'stable';
    if (threatLevel > 60) state = 'chaos';
    else if (threatLevel > 20) state = 'degraded';

    operationalMemory.recordTrace({
      threatLevel,
      averageCpuLoad: averageCpu,
      activeConnCount: activeConnections,
      unhealthyNodeCount: unhealthyCount,
      eventsCount,
      reconciliationState: state
    });
  }
}

export const temporalCorrelator = TemporalCorrelator.getInstance();
