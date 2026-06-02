import { logger } from '../../core/logger';

export interface MemoryTrace {
  timestamp: string;
  threatLevel: number;
  averageCpuLoad: number;
  activeConnCount: number;
  eventsCount: number;
  unhealthyNodeCount: number;
  reconciliationState: 'stable' | 'degraded' | 'chaos';
}

export class OperationalMemory {
  private static instance: OperationalMemory;
  private memories: MemoryTrace[] = [];
  private maxMemorySize = 100;

  private constructor() {
    this.seedInitialMemories();
  }

  public static getInstance(): OperationalMemory {
    if (!OperationalMemory.instance) {
      OperationalMemory.instance = new OperationalMemory();
    }
    return OperationalMemory.instance;
  }

  private seedInitialMemories() {
    // Populate some pseudo-historic memories for dynamic analytical graphs on frontend
    const basetime = Date.now();
    for (let i = 12; i >= 1; i--) {
      const timeOffset = i * 10 * 60 * 1000; // block steps of 10 min
      const simulatedTime = new Date(basetime - timeOffset).toISOString();
      
      this.memories.push({
        timestamp: simulatedTime,
        threatLevel: Math.round(15 + Math.random() * 8),
        averageCpuLoad: Math.round(18 + Math.random() * 5),
        activeConnCount: Math.round(140 + Math.random() * 30),
        eventsCount: Math.round(5 + Math.random() * 8),
        unhealthyNodeCount: 0,
        reconciliationState: 'stable'
      });
    }
    logger.info('[TemporalMemory] Initialized operational memory traces seed.');
  }

  /**
   * Commits a new memory trace into the history log
   */
  public recordTrace(trace: Omit<MemoryTrace, 'timestamp'>) {
    const freshTrace: MemoryTrace = {
      ...trace,
      timestamp: new Date().toISOString()
    };
    
    this.memories.push(freshTrace);
    if (this.memories.length > this.maxMemorySize) {
      this.memories.shift();
    }
  }

  public getMemories(): MemoryTrace[] {
    return this.memories;
  }

  public clearMemory() {
    this.memories = [];
    this.seedInitialMemories();
  }
}

export const operationalMemory = OperationalMemory.getInstance();
