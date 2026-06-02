import { temporalReasoner } from '../ai/temporal-reasoner';
import { temporalMemoryEngine } from '../ai/memory-engine';

export class TemporalContextEngine {
  public static stitchTemporalContext(nodeId: string, currentScore: number): string {
    const reasoning = temporalReasoner.reasonOverTime(nodeId, currentScore);
    const evolution = temporalMemoryEngine.getBlastEvolution(nodeId) || [10];

    let context = `TEMPORAL THREAT CONTEXT HISTORY & PROPAGATION PATTERNS:\n`;
    context += `- Chronological Anomaly Recurrence Level: ${reasoning.frequencyRating.toUpperCase()} (${reasoning.priorEventsCount} historical alarms logged).\n`;
    context += `- Threat Exposure Velocity Vector: ${reasoning.blastTrend.toUpperCase()}\n`;
    context += `- Dynamic Blast Radius Historic Evolution: [${evolution.join(' -> ')}]\n`;
    context += `- Temporal Synopsis: ${reasoning.evolutionNarrative}\n`;

    return context;
  }
}
