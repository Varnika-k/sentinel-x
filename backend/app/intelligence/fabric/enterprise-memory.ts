import { logger } from '../../core/logger';
import { v4 as uuidv4 } from 'uuid';

export interface MemoryEntry {
  id: string;
  timestamp: string;
  category: 'incident' | 'governance_leak' | 'bottleneck' | 'access_anomaly';
  title: string;
  description: string;
  mitigationSteps: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
}

export class EnterpriseMemory {
  private memories: MemoryEntry[] = [];

  constructor() {
    this.primeHistoricalMemories();
  }

  /**
   * Seed historical records of enterprise memory
   */
  private primeHistoricalMemories() {
    this.memories = [
      {
        id: 'mem-hist-01',
        timestamp: '2025-11-12T04:14:00Z',
        category: 'incident',
        title: 'Cascade Ransomware on Dev Namespace',
        description: 'Unauthorized service account key leakage on git-repository triggering lateral encryption flow on 14 temporary test nodes.',
        mitigationSteps: ['Rotated all IAM credentials', 'Secured kubernetes control plane keys', 'Enforced automated repository scans'],
        severity: 'high',
        resolved: true
      },
      {
        id: 'mem-hist-02',
        timestamp: '2026-02-28T11:42:00Z',
        category: 'access_anomaly',
        title: 'Heuristics Ledger Rogue Tunneling',
        description: 'Lateral authentication request sequences originated from employee credentials targeting raw DB ingress nodes without corresponding gateway triggers.',
        mitigationSteps: ['Implemented zero trust proxy bounds', 'Revoked automated session tokens over 8 hours'],
        severity: 'critical',
        resolved: true
      },
      {
        id: 'mem-hist-03',
        timestamp: '2026-04-10T16:20:00Z',
        category: 'governance_leak',
        title: 'External Banking Client Token Exposure',
        description: 'Temporary diagnostic server was deployed outside of standard VPC bounds, violating GRC containment policies.',
        mitigationSteps: ['Isolated server container', 'Staged permanent web application firewall filters'],
        severity: 'high',
        resolved: true
      },
      {
        id: 'mem-hist-04',
        timestamp: '2026-05-15T09:33:00Z',
        category: 'bottleneck',
        title: 'Oracle Finance Gateway Sync Lockup',
        description: 'Concurrent transactional database connections from executive analytics engine flooded storage buffers, causing 42% latency spikes.',
        mitigationSteps: ['Optimized connection pool bounds', 'Introduced micro-caching tier for financial book lookups'],
        severity: 'medium',
        resolved: true
      }
    ];

    logger.info(`[EnterpriseMemory] Initialized with ${this.memories.length} deeply indexed historical incidents and anomalies.`);
  }

  public getMemories(): MemoryEntry[] {
    return this.memories;
  }

  public addMemory(category: MemoryEntry['category'], title: string, description: string, severity: MemoryEntry['severity'], steps: string[] = []): MemoryEntry {
    const fresh: MemoryEntry = {
      id: `mem-dyn-${uuidv4().substring(0, 6)}`,
      timestamp: new Date().toISOString(),
      category,
      title,
      description,
      mitigationSteps: steps,
      severity,
      resolved: false
    };

    this.memories.unshift(fresh);
    logger.info(`[EnterpriseMemory] Logged new dynamic memory checkpoint: "${title}" [${severity.toUpperCase()}]`);
    return fresh;
  }

  public searchMemories(query: string): MemoryEntry[] {
    if (!query) return this.memories;
    const lc = query.toLowerCase();
    return this.memories.filter(m => 
      m.title.toLowerCase().includes(lc) || 
      m.description.toLowerCase().includes(lc) || 
      m.category.toLowerCase().includes(lc)
    );
  }
}

export const enterpriseMemory = new EnterpriseMemory();
