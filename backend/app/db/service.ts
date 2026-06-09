import { AppDataSource, resetSqljsDatabase } from './data-source';
import { TelemetryEventEntity } from './entities/TelemetryEvent';
import { IncidentEntity } from './entities/Incident';
import { ReplaySessionEntity } from './entities/ReplaySession';
import { InfrastructureNodeEntity } from './entities/InfrastructureNode';
import { SimulationSessionEntity } from './entities/SimulationSession';
import { UnifiedOperationalEventEntity } from './entities/UnifiedOperationalEventEntity';
import { GraphSnapshotEntity } from './entities/GraphSnapshotEntity';
import { TelemetryEvent, InfraEntityType } from '../schemas/telemetry';
import { logger } from '../core/logger';
import { Between } from 'typeorm';

export class DatabaseService {
  private static get telemetryRepo() {
    return AppDataSource.getRepository(TelemetryEventEntity);
  }
  private static get incidentRepo() {
    return AppDataSource.getRepository(IncidentEntity);
  }
  private static get replayRepo() {
    return AppDataSource.getRepository(ReplaySessionEntity);
  }
  private static get infraRepo() {
    return AppDataSource.getRepository(InfrastructureNodeEntity);
  }
  private static get simulationRepo() {
    return AppDataSource.getRepository(SimulationSessionEntity);
  }
  private static get unifiedEventRepo() {
    return AppDataSource.getRepository(UnifiedOperationalEventEntity);
  }
  private static get graphSnapshotRepo() {
    return AppDataSource.getRepository(GraphSnapshotEntity);
  }

  static async saveSimulationSession(session: Partial<SimulationSessionEntity>) {
    try {
      if (session.stateCheckpoint && Array.isArray(session.stateCheckpoint)) {
        if (session.stateCheckpoint.length > 3) {
          session.stateCheckpoint = session.stateCheckpoint.slice(0, 3);
        }
      }

      if (session.id) {
        const existing = await this.simulationRepo.findOneBy({ id: session.id });
        if (existing) {
          this.simulationRepo.merge(existing, session);
          const saved = await this.simulationRepo.save(existing);
          await this.pruneTelemetryAndSessions();
          return saved;
        }
      }
      const newSession = this.simulationRepo.create(session);
      const saved = await this.simulationRepo.save(newSession);
      await this.pruneTelemetryAndSessions();
      return saved;
    } catch (err) {
      logger.error('Failed to save simulation session', err);
    }
  }

  static async getSimulationSessions() {
    return await this.simulationRepo.find({ order: { updatedAt: 'DESC' } });
  }

  static async getSimulationSession(id: string) {
    return await this.simulationRepo.findOneBy({ id });
  }

  static async saveInfrastructureNodes(nodes: Partial<InfrastructureNodeEntity>[]) {
    try {
      const names = nodes.map(n => n.name).filter(Boolean) as string[];
      if (names.length === 0) return [];

      const existingNodes = await this.infraRepo.find();
      const existingMap = new Map(existingNodes.map(n => [n.name, n]));

      const toSave: InfrastructureNodeEntity[] = [];
      for (const node of nodes) {
        if (!node.name) continue;
        const existing = existingMap.get(node.name);
        if (existing) {
          this.infraRepo.merge(existing, node);
          toSave.push(existing);
        } else {
          toSave.push(this.infraRepo.create(node));
        }
      }

      if (toSave.length > 0) {
        return await this.infraRepo.save(toSave);
      }
      return [];
    } catch (err) {
      logger.error('Failed to save batch infrastructure nodes', err);
      return [];
    }
  }

  static async saveInfrastructureNode(node: Partial<InfrastructureNodeEntity>) {
    const existing = await this.infraRepo.findOneBy({ name: node.name });
    if (existing) {
      this.infraRepo.merge(existing, node);
      return await this.infraRepo.save(existing);
    }
    const newNode = this.infraRepo.create(node);
    return await this.infraRepo.save(newNode);
  }

  static async getInfrastructureTopology() {
    return await this.infraRepo.find();
  }

  static async getInfrastructureByNamespace(namespace: string) {
    return await this.infraRepo.findBy({ namespace });
  }

  static async updateNodeRisk(nodeName: string, riskDelta: number) {
    const node = await this.infraRepo.findOneBy({ name: nodeName });
    if (node) {
      node.riskScore = Math.max(0, Math.min(100, node.riskScore + riskDelta));
      if (node.riskScore > 80) node.status = 'critical';
      else if (node.riskScore > 40) node.status = 'warning';
      else node.status = 'healthy';
      return await this.infraRepo.save(node);
    }
  }

  private static telemetryBuffer: any[] = [];
  private static flushTimeout: NodeJS.Timeout | null = null;
  private static isPruning = false;
  private static telemetryInMemoryCache: TelemetryEventEntity[] = [];

  private static async ensureCacheLoaded() {
    if (this.telemetryInMemoryCache.length === 0) {
      try {
        const initial = await this.telemetryRepo.find({
          order: { timestamp: 'DESC' },
          take: 100
        });
        this.telemetryInMemoryCache = initial;
      } catch (err) {
        logger.error('Failed to load initial telemetry cache from database', err);
        this.telemetryInMemoryCache = [];
        const errStr = String(err).toLowerCase();
        if (errStr.includes('out of memory') || errStr.includes('oom') || errStr.includes('failed')) {
          logger.warn('SQL.js/SQLite database query failed under memory pressure. Initiating absolute database reset to recover virtual memory...');
          try {
            await resetSqljsDatabase();
            this.telemetryInMemoryCache = [];
            logger.info('Database successfully reset and re-initialized under memory pressure.');
          } catch (resetErr) {
            logger.error('Database reset failure during out-of-memory recovery', resetErr);
          }
        }
      }
    }
  }

  static async saveTelemetry(event: TelemetryEvent) {
    try {
      const entity = this.telemetryRepo.create({
        ...event,
        timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
        payload: event.payload
      });
      
      // Update in-memory cache instantly
      this.telemetryInMemoryCache.unshift(entity);
      if (this.telemetryInMemoryCache.length > 500) {
        this.telemetryInMemoryCache = this.telemetryInMemoryCache.slice(0, 500);
      }
      
      // Buffer the entity for batch inserts, dramatic I/O optimization
      this.telemetryBuffer.push(entity);
      
      if (this.telemetryBuffer.length >= 35) {
        await this.flushTelemetry();
      } else if (!this.flushTimeout) {
        // Lazy-timer initialization
        this.flushTimeout = setTimeout(() => {
          this.flushTelemetry().catch(err => logger.error('Async telemetry flush failed', err));
        }, 2000);
      }
      
      return entity;
    } catch (error) {
      logger.error('Failed to buffer telemetry event for batching', error);
    }
  }

  private static async flushTelemetry() {
    if (this.flushTimeout) {
      clearTimeout(this.flushTimeout);
      this.flushTimeout = null;
    }

    if (this.telemetryBuffer.length === 0) return;

    const batch = [...this.telemetryBuffer];
    this.telemetryBuffer = [];

    try {
      await this.telemetryRepo.save(batch);
      await this.pruneTelemetryAndSessions();
    } catch (error) {
      logger.error(`Critical telemetry batch save failed. Executing graceful self-recovering individual writes...`, error);
      // Save individually to avoid complete packet drops
      for (const entity of batch) {
        try {
          await this.telemetryRepo.save(entity);
        } catch (individualError) { 
if (String(individualError).includes('UNIQUE constraint failed')){
logger.warn('Duplicate telemetry event ignored: ${entity.id}');
continue;
}

          logger.error('Failed to write individual fallback telemetry event', individualError);
          if (String(individualError).includes('out of memory')) {
            try {
              await resetSqljsDatabase();
              this.telemetryInMemoryCache = [];
              logger.info('Forced telemetry database reset during out of memory save recovery');
              break;
            } catch (clearErr) {
              logger.error('Failed to reset database under panic mode', clearErr);
            }
          }
        }
      }
    }
  }

  static async getTelemetryHistory(limit = 100, skip = 0) {
    try {
      if (AppDataSource.options.type === 'sqljs') {
        await this.ensureCacheLoaded();
        return this.telemetryInMemoryCache.slice(skip, skip + limit);
      }
      return await this.telemetryRepo.find({
        order: { timestamp: 'DESC' },
        take: limit,
        skip: skip
      });
    } catch (err) {
      logger.error('Failed to get telemetry history from database, falling back to in-memory cache', err);
      try {
        await this.ensureCacheLoaded();
        return this.telemetryInMemoryCache.slice(skip, skip + limit);
      } catch (fallbackErr) {
        return [];
      }
    }
  }

  static async getEventsInRange(start: Date, end: Date, limit = 100) {
    try {
      if (AppDataSource.options.type === 'sqljs') {
        await this.ensureCacheLoaded();
        const startMs = start.getTime();
        const endMs = end.getTime();
        const filtered = this.telemetryInMemoryCache.filter(ev => {
          const evTime = ev.timestamp ? new Date(ev.timestamp).getTime() : 0;
          return evTime >= startMs && evTime <= endMs;
        });
        return filtered.map(item => item).reverse().slice(0, limit);
      }

      let actualStart = start;
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (actualStart.getTime() < oneHourAgo.getTime()) {
        actualStart = oneHourAgo;
      }

      const startStr = actualStart.toISOString();
      const endStr = end.toISOString();

      const startStrAlt = startStr.replace('T', ' ').substring(0, 23);
      const endStrAlt = endStr.replace('T', ' ').substring(0, 23);

      return await this.telemetryRepo.createQueryBuilder('te')
        .where(
          '(te.timestamp >= :startStr AND te.timestamp <= :endStr) OR (te.timestamp >= :startStrAlt AND te.timestamp <= :endStrAlt)',
          { startStr, endStr, startStrAlt, endStrAlt }
        )
        .orderBy('te.timestamp', 'ASC')
        .take(limit)
        .getMany();
    } catch (err) {
      logger.error('Failed to get events in range from database, falling back to in-memory cache', err);
      try {
        await this.ensureCacheLoaded();
        const startMs = start.getTime();
        const endMs = end.getTime();
        const filtered = this.telemetryInMemoryCache.filter(ev => {
          const evTime = ev.timestamp ? new Date(ev.timestamp).getTime() : 0;
          return evTime >= startMs && evTime <= endMs;
        });
        return filtered.map(item => item).reverse().slice(0, limit);
      } catch (fallbackErr) {
        logger.error('Database fallback queries failed', fallbackErr);
        return [];
      }
    }
  }

  static async createIncident(data: Partial<IncidentEntity>) {
    const incident = this.incidentRepo.create(data);
    return await this.incidentRepo.save(incident);
  }

  static async getIncidents() {
    return await this.incidentRepo.find({ order: { startTime: 'DESC' } });
  }

  static async createReplaySession(name: string, start: Date, end: Date, description?: string) {
    const session = this.replayRepo.create({
      name,
      startTime: start,
      endTime: end,
      description
    });
    return await this.replayRepo.save(session);
  }

  static async getReplaySessions() {
    return await this.replayRepo.find({ order: { createdAt: 'DESC' } });
  }

  static async getSessionEvents(sessionId: string) {
    const session = await this.replayRepo.findOneBy({ id: sessionId });
    if (!session) return [];
    return await this.getEventsInRange(session.startTime, session.endTime);
  }

  static async pruneTelemetryAndSessions() {
    if (this.isPruning) return;
    this.isPruning = true;
    try {
      if (AppDataSource.options.type === 'sqljs') {
        try {
          const count = await this.telemetryRepo.count();
          if (count > 120) {
            try {
              await this.telemetryRepo.query(`
                DELETE FROM telemetry_events 
                WHERE id NOT IN (
                  SELECT id FROM (
                    SELECT id FROM telemetry_events 
                    ORDER BY timestamp DESC 
                    LIMIT 100
                  )
                )
              `);
            } catch (queryErr) {
              const oldestEventToKeep = await this.telemetryRepo.find({
                order: { timestamp: 'DESC' },
                skip: 100,
                take: 1
              });
              if (oldestEventToKeep.length > 0) {
                const cutoff = oldestEventToKeep[0].timestamp;
                await this.telemetryRepo.createQueryBuilder()
                  .delete()
                  .where("timestamp < :cutoff", { cutoff })
                  .execute();
              }
            }
          }
        } catch (sqliteErr) {
          logger.warn('Pruning telemetry events failed. Attempting hard database truncation to free up virtual memory.', sqliteErr);
          try {
            await this.telemetryRepo.clear();
            this.telemetryInMemoryCache = [];
            logger.info('Successfully cleared telemetry table to recover from memory pressure');
          } catch (clearErr) {
            logger.error('Failed to execute hard clear on telemetry database', clearErr);
          }
        }

        try {
          const count = await this.simulationRepo.count();
          if (count > 5) {
            try {
              await this.simulationRepo.query(`
                DELETE FROM simulation_sessions 
                WHERE id NOT IN (
                  SELECT id FROM (
                    SELECT id FROM simulation_sessions 
                    ORDER BY updatedAt DESC 
                    LIMIT 5
                  )
                )
              `);
            } catch (queryErr) {
              const oldestSessionToKeep = await this.simulationRepo.find({
                order: { updatedAt: 'DESC' },
                skip: 5,
                take: 1
              });
              if (oldestSessionToKeep.length > 0) {
                const cutoff = oldestSessionToKeep[0].updatedAt;
                await this.simulationRepo.createQueryBuilder()
                  .delete()
                  .where("updatedAt < :cutoff", { cutoff })
                  .execute();
              }
            }
          }
        } catch (sessionPruneErr) {
          logger.error('Failed to prune simulation sessions', sessionPruneErr);
        }

        // Prune UnifiedOperationalEvents (essential to prevent memory leak/OOM in sql.js)
        try {
          const count = await this.unifiedEventRepo.count();
          if (count > 120) {
            try {
              await this.unifiedEventRepo.query(`
                DELETE FROM unified_operational_events 
                WHERE id NOT IN (
                  SELECT id FROM (
                    SELECT id FROM unified_operational_events 
                    ORDER BY replaySequence DESC 
                    LIMIT 100
                  )
                )
              `);
            } catch (queryErr) {
              const oldestEventToKeep = await this.unifiedEventRepo.find({
                order: { replaySequence: 'DESC' },
                skip: 100,
                take: 1
              });
              if (oldestEventToKeep.length > 0) {
                const cutoff = oldestEventToKeep[0].replaySequence;
                await this.unifiedEventRepo.createQueryBuilder()
                  .delete()
                  .where("replaySequence < :cutoff", { cutoff })
                  .execute();
              }
            }
          }
        } catch (eventPruneErr) {
          logger.error('Failed to prune unified operational events', eventPruneErr);
        }

        // Prune GraphSnapshots (extremely heavy table containing JSON arrays of nodes and edges)
        try {
          const count = await this.graphSnapshotRepo.count();
          if (count > 10) {
            try {
              await this.graphSnapshotRepo.query(`
                DELETE FROM graph_snapshots 
                WHERE id NOT IN (
                  SELECT id FROM (
                    SELECT id FROM graph_snapshots 
                    ORDER BY replaySequence DESC 
                    LIMIT 10
                  )
                )
              `);
            } catch (queryErr) {
              const oldestSnapshotToKeep = await this.graphSnapshotRepo.find({
                order: { replaySequence: 'DESC' },
                skip: 10,
                take: 1
              });
              if (oldestSnapshotToKeep.length > 0) {
                const cutoff = oldestSnapshotToKeep[0].replaySequence;
                await this.graphSnapshotRepo.createQueryBuilder()
                  .delete()
                  .where("replaySequence < :cutoff", { cutoff })
                  .execute();
              }
            }
          }
        } catch (snapshotPruneErr) {
          logger.error('Failed to prune graph snapshots', snapshotPruneErr);
        }
      }
    } catch (err) {
      logger.error('Database pruning failed', err);
    } finally {
      this.isPruning = false;
    }
  }
}
