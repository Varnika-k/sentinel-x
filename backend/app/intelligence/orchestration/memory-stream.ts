import { logger } from '../../core/logger';
import { temporalMemoryEngine } from '../ai/memory-engine';

export interface MemoryAnchor {
  key: string;
  intensity: number;
  description: string;
}

export class MemoryStream {
  private static instance: MemoryStream;
  private memoryAnchors: Map<string, MemoryAnchor[]> = new Map();

  private constructor() {}

  public static getInstance(): MemoryStream {
    if (!MemoryStream.instance) {
      MemoryStream.instance = new MemoryStream();
    }
    return MemoryStream.instance;
  }

  public writeAnchor(nodeId: string, anchor: MemoryAnchor): void {
    const anchors = this.memoryAnchors.get(nodeId) || [];
    anchors.push(anchor);
    if (anchors.length > 50) anchors.shift();
    this.memoryAnchors.set(nodeId, anchors);
    logger.debug(`[MemoryStream] Appended memory anchor to [${nodeId}]: ${anchor.description}`);
  }

  public getCognitiveOverlay(nodeId: string): string {
    const anchors = this.memoryAnchors.get(nodeId) || [];
    const historicalSummary = temporalMemoryEngine.getHistorySummary(nodeId);

    if (anchors.length === 0) {
      return `${historicalSummary}\n- Cognitive status: Baseline operations steady. No repetitive behavioral anchors.`;
    }

    let summary = `${historicalSummary}\nCOGNITIVE BEHAVIOR ANCHORS:\n`;
    anchors.forEach(a => {
      summary += `  * [${a.key.toUpperCase()}] Intensity: ${a.intensity}/100 - ${a.description}\n`;
    });
    return summary;
  }
}

export const memoryStream = MemoryStream.getInstance();
