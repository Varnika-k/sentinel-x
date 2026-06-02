import { AppDataSource } from '../db/data-source';
import { redisManager } from '../core/redis';
import { unifiedEventBus } from '../../core/event-bus';

export interface HealthState {
  status: 'UP' | 'DOWN' | 'DEGRADED';
  timestamp: string;
  uptime: number;
  memory: NodeJS.MemoryUsage;
  components: {
    database: { status: 'UP' | 'DOWN'; type: string };
    redis: { status: 'UP' | 'DOWN' | 'MOCK'; isMock: boolean };
    eventBus: { status: 'UP' | 'DOWN' };
  };
}

export async function checkGlobalHealth(): Promise<HealthState> {
  const uptime = process.uptime();
  const memory = process.memoryUsage();
  
  // Checking Database Connection
  let dbStatus: 'UP' | 'DOWN' = 'DOWN';
  try {
    if (AppDataSource.isInitialized) {
      dbStatus = 'UP';
    }
  } catch (err) {
    dbStatus = 'DOWN';
  }

  // Checking Redis Connection
  const isMock = redisManager.getIsMock();
  const redisClient = redisManager.getClient();
  let redisStatus: 'UP' | 'DOWN' | 'MOCK' = 'DOWN';
  if (isMock) {
    redisStatus = 'MOCK';
  } else if (redisClient && redisClient.status === 'ready') {
    redisStatus = 'UP';
  }

  // Checking Event Bus (always up due to in-memory fallbacks)
  const eventBusStatus: 'UP' | 'DOWN' = 'UP';

  const isDegraded = redisStatus === 'DOWN' || dbStatus === 'DOWN';
  const overallStatus = isDegraded ? 'DEGRADED' : 'UP';

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    uptime,
    memory,
    components: {
      database: { status: dbStatus, type: AppDataSource.options.type },
      redis: { status: redisStatus === 'MOCK' ? 'UP' : redisStatus, isMock },
      eventBus: { status: eventBusStatus }
    }
  };
}
