import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';
import { complianceEngine } from '../intelligence/governance/compliance-engine';
import { graphIntelligenceEngine } from '../simulation/graph-intelligence';

export interface AttackStage {
  timestamp: string;
  source: string;
  mitreTactic: string;
  description: string;
}

export interface ReconstructedAttackSequence {
  sequenceId: string;
  targetNode: string;
  stages: AttackStage[];
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
}

export class StreamProcessor {
  private static instance: StreamProcessor;
  
  private batchBuffer: CanonicalTelemetryEvent[] = [];
  private maxBatchSize = 10;
  private batchIntervalMs = 1000;
  private batchTimer: NodeJS.Timeout | null = null;

  private historicalCorrelations: CanonicalTelemetryEvent[] = [];
  private activeSequenceTracks: Map<string, ReconstructedAttackSequence> = new Map();

  private constructor() {
    this.startBatchProcessor();
  }

  public static getInstance(): StreamProcessor {
    if (!StreamProcessor.instance) {
      StreamProcessor.instance = new StreamProcessor();
    }
    return StreamProcessor.instance;
  }

  /**
   * 1. Dynamic stream batching wrapper
   */
  public queueForBatching(event: CanonicalTelemetryEvent): void {
    const enriched = this.enrichEventWithGovernance(event);
    this.batchBuffer.push(enriched);
    
    // Correlate on the fly
    this.correlateEvents(enriched);

    if (this.batchBuffer.length >= this.maxBatchSize) {
      this.flushBatch();
    }
  }

  private startBatchProcessor(): void {
    this.batchTimer = setInterval(() => {
      this.flushBatch();
    }, this.batchIntervalMs);
  }

  private flushBatch(): void {
    if (this.batchBuffer.length === 0) return;

    const currentBatch = [...this.batchBuffer];
    this.batchBuffer = [];

    logger.debug(`[StreamProcessor] Batch flushed containing ${currentBatch.length} enriched telemetry events.`);
    
    // Cross-source sequencing pipeline
    currentBatch.forEach(evt => {
      this.reconstructAttackStage(evt);
    });
  }

  /**
   * 2. Governance-aware Stream Enrichment
   */
  public enrichEventWithGovernance(event: CanonicalTelemetryEvent): CanonicalTelemetryEvent {
    const nodeState = graphIntelligenceEngine.nodes.get(event.targetNode);
    if (nodeState) {
      event.infrastructureContext = {
        ...event.infrastructureContext,
        namespace: nodeState.namespace,
        environment: nodeState.environment
      };
      
      // Inject compliance metadata on the fly
      event.mutationPayload = {
        ...event.mutationPayload,
        statusChange: nodeState.status,
        blastRadiusDelta: nodeState.operationalCriticality > 75 ? 15 : 5
      };
    }
    return event;
  }

  /**
   * 3. Temporal Event Correlation Engine
   */
  private correlateEvents(event: CanonicalTelemetryEvent): void {
    this.historicalCorrelations.push(event);
    if (this.historicalCorrelations.length > 500) {
      this.historicalCorrelations.shift();
    }

    const windowMs = 5000; // 5-second correlation window
    const now = new Date(event.timestamp).getTime();

    // Trace similar abnormal alerts in same temporal window but differing sources
    const matched = this.historicalCorrelations.filter(h => {
      if (h.eventId === event.eventId) return false;
      const hTime = new Date(h.timestamp).getTime();
      return Math.abs(now - hTime) <= windowMs && h.targetNode === event.targetNode && h.source !== event.source;
    });

    if (matched.length > 0) {
      logger.warn(`[StreamProcessor] TEMPORAL CORRELATION: ${matched.length + 1} indicators detected on [${event.targetNode}] within ${windowMs / 1000}s from cross-sources ([${event.source}], [${matched.map(m => m.source).join(', ')}]). Escalating danger score!`);
      event.threatScore = Math.min(100, (event.threatScore || 50) + 15);
      event.severity = event.threatScore >= 80 ? 'critical' : 'high';
    }
  }

  /**
   * 4. Multi-Stage Attack Sequence Reconstruction
   */
  private reconstructAttackStage(event: CanonicalTelemetryEvent): void {
    if (event.severity !== 'high' && event.severity !== 'critical') return;

    let track = this.activeSequenceTracks.get(event.targetNode);
    if (!track) {
      track = {
        sequenceId: `SEQ-${event.targetNode.slice(0, 10).toUpperCase()}-${Date.now().toString().slice(-4)}`,
        targetNode: event.targetNode,
        stages: [],
        threatLevel: event.severity
      };
    }

    const stageDesc = event.mitreDetails?.techniques.join(', ') || 'Insecure API session endpoint probe';
    const tactic = event.mitreDetails?.tactics[0] || 'Unknown Penetration Step';

    const alreadyExists = track.stages.some(s => s.mitreTactic === tactic && s.description === stageDesc);
    if (!alreadyExists) {
      track.stages.push({
        timestamp: event.timestamp,
        source: event.source,
        mitreTactic: tactic,
        description: stageDesc
      });
      
      logger.info(`[AttackSequenceReconstructor] Reconstructed step [${tactic}] for ${event.targetNode}. Sequence depth: ${track.stages.length}`);
    }

    // Set worst-case threat level
    if (event.severity === 'critical') track.threatLevel = 'critical';

    this.activeSequenceTracks.set(event.targetNode, track);
  }

  public getActiveSequences(): ReconstructedAttackSequence[] {
    return Array.from(this.activeSequenceTracks.values());
  }

  public shutdown(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }
  }
}

export const streamProcessor = StreamProcessor.getInstance();
