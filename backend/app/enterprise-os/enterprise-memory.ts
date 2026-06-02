import { logger } from '../core/logger';

export interface MemoryRecord {
  id: string;
  timestamp: string;
  incidentType: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigated: boolean;
  recurringCounter: number;
}

export class EnterpriseMemory {
  private static instance: EnterpriseMemory;
  private memories: Map<string, MemoryRecord> = new Map();

  private constructor() {
    this.seedMemory();
  }

  public static getInstance(): EnterpriseMemory {
    if (!EnterpriseMemory.instance) {
      EnterpriseMemory.instance = new EnterpriseMemory();
    }
    return EnterpriseMemory.instance;
  }

  private seedMemory() {
    const historical: MemoryRecord[] = [
      {
        id: 'mem-inc-1',
        timestamp: new Date(Date.now() - 604800000).toISOString(), // 7 days ago
        incidentType: 'credential_hijacking',
        description: 'Unauthorized off-hours DB reading via credential hijacked corporate account.',
        severity: 'high',
        mitigated: true,
        recurringCounter: 1
      },
      {
        id: 'mem-inc-2',
        timestamp: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
        incidentType: 'ingress_exploitation',
        description: 'Privileged root shell execution within Edge Nginx load-balancer pod.',
        severity: 'critical',
        mitigated: false,
        recurringCounter: 3
      },
      {
        id: 'mem-inc-3',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        incidentType: 'governance_drift',
        description: 'Zero-trust network policy rules disabled temporarily during Maintenance cycle.',
        severity: 'medium',
        mitigated: true,
        recurringCounter: 2
      }
    ];

    historical.forEach(m => this.memories.set(m.id, m));
  }

  public getMemories(): MemoryRecord[] {
    return Array.from(this.memories.values());
  }

  public recordMemory(incidentType: string, description: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    // Check if we have an existing similar incident to increase recurring counter
    const existing = Array.from(this.memories.values()).find(m => m.incidentType === incidentType);
    
    if (existing) {
      existing.recurringCounter += 1;
      existing.timestamp = new Date().toISOString();
      existing.description = description;
      existing.severity = severity;
      logger.info(`[EnterpriseMemory] Increased recurring flag for "${incidentType}". Hits: ${existing.recurringCounter}`);
    } else {
      const id = `mem-inc-${Date.now()}`;
      this.memories.set(id, {
        id,
        timestamp: new Date().toISOString(),
        incidentType,
        description,
        severity,
        mitigated: false,
        recurringCounter: 1
      });
      logger.info(`[EnterpriseMemory] Logged new structural incident memory: ${incidentType}`);
    }
  }

  public markMitigated(id: string) {
    const mem = this.memories.get(id);
    if (mem) {
      mem.mitigated = true;
      logger.info(`[EnterpriseMemory] Anomaly memory mitigation state toggled: ${id}`);
    }
  }
}

export const enterpriseMemory = EnterpriseMemory.getInstance();
