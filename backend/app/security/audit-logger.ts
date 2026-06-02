import { redisManager } from '../core/redis';
import { logger } from '../core/logger';

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  resource: string;
  status: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  payloadMetadata?: Record<string, any>;
}

export class AuditLogManager {
  private static instance: AuditLogManager;

  private constructor() {}

  public static getInstance(): AuditLogManager {
    if (!AuditLogManager.instance) {
      AuditLogManager.instance = new AuditLogManager();
    }
    return AuditLogManager.instance;
  }

  public async record(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const fullLog: AuditLog = {
      ...log,
      id: `audit-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString()
    };

    // 1. Log JSON formatted to standard process output
    logger.info(`[AUDIT_TRAIL] ${JSON.stringify(fullLog)}`);

    // 2. Publish to redis if active
    const client = redisManager.getClient();
    if (client && !redisManager.getIsMock()) {
      try {
        await client.publish('sentinelx:audit', JSON.stringify(fullLog));
        await client.lpush('sentinelx:audit:list', JSON.stringify(fullLog));
        await client.ltrim('sentinelx:audit:list', 0, 9999); // Ring buffer caps list
      } catch (err) {
        logger.error('Failed to log audit details to stream server', err);
      }
    }
  }
}

export const auditLogManager = AuditLogManager.getInstance();
