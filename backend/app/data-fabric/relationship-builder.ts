import { EnterpriseRelation, RelationType } from './types';
import { fabricCache } from './fabric-cache';
import { logger } from '../core/logger';
import { v4 as uuidv4 } from 'uuid';

export class RelationshipBuilder {
  private static instance: RelationshipBuilder;

  private constructor() {}

  public static getInstance(): RelationshipBuilder {
    if (!RelationshipBuilder.instance) {
      RelationshipBuilder.instance = new RelationshipBuilder();
    }
    return RelationshipBuilder.instance;
  }

  /**
   * Establishes a relation securely within the fabric state cache.
   */
  public link(
    sourceId: string,
    targetId: string,
    type: RelationType,
    strength: number = 1.0,
    metadata?: Record<string, any>
  ): EnterpriseRelation {
    // Check if nodes exist. If not, log a warnings, but allow linkage for highly-dynamic Discovery
    const sourceNode = fabricCache.getNode(sourceId);
    const targetNode = fabricCache.getNode(targetId);

    if (!sourceNode) {
      logger.debug(`[RelationshipBuilder] Link warning: Source node ID ${sourceId} not found in fabric cache.`);
    }
    if (!targetNode) {
      logger.debug(`[RelationshipBuilder] Link warning: Target node ID ${targetId} not found in fabric cache.`);
    }

    const relationId = `rel-${sourceId}-${type.toLowerCase()}-${targetId}`;
    
    // Check if already exists to avoid duplication
    const existing = fabricCache.getRelation(relationId);
    if (existing) {
      existing.strength = strength;
      if (metadata) {
        existing.metadata = { ...existing.metadata, ...metadata };
      }
      return existing;
    }

    const relation: EnterpriseRelation = {
      id: relationId,
      sourceId,
      targetId,
      type,
      strength,
      metadata
    };

    fabricCache.addRelation(relation);
    logger.debug(`[RelationshipBuilder] Established link: [${sourceId}] -- ${type} --> [${targetId}] (strength: ${strength})`);
    return relation;
  }

  /**
   * Breaks/removes a relationship link
   */
  public unlink(sourceId: string, targetId: string, type: RelationType): void {
    const relationId = `rel-${sourceId}-${type.toLowerCase()}-${targetId}`;
    fabricCache.deleteRelation(relationId);
    logger.debug(`[RelationshipBuilder] Plucked relationship edge [ID: ${relationId}]`);
  }

  /**
   * Automatically discovers and binds relationships based on node properties or metadata signatures.
   */
  public resolveAutoRelations(): void {
    const nodes = fabricCache.listNodes();
    logger.info(`[RelationshipBuilder] Auto-linking active relationships across ${nodes.length} nodes...`);

    // Match databases to host infrastructure nodes
    nodes.forEach(node => {
      // 1. Employee -> Department (MEMBER_OF or REPORTS_TO)
      if (node.type === 'employee' && node.departmentId) {
        this.link(node.id, node.departmentId, 'MEMBER_OF', 1.0);
      }

      // 2. Application -> Database (STORES_DATA_FOR or DEPENDS_ON)
      if (node.type === 'application' && node.metadata.databases) {
        const dbs = Array.isArray(node.metadata.databases) ? node.metadata.databases : [node.metadata.databases];
        dbs.forEach((dbId: string) => {
          this.link(node.id, dbId, 'DEPENDS_ON', 0.9);
          // Inverse stores data relationship
          this.link(dbId, node.id, 'STORES_DATA_FOR', 1.0);
        });
      }

      // 3. Database -> Cloud Instance/Infrastructure (RUNS_ON)
      if (node.type === 'database' && node.metadata.infraNodeId) {
        this.link(node.id, node.metadata.infraNodeId, 'RUNS_ON', 1.0);
      }

      // 4. Application -> Host Server/Infrastructure (RUNS_ON)
      if (node.type === 'application' && node.metadata.hostNodeId) {
        this.link(node.id, node.metadata.hostNodeId, 'RUNS_ON', 1.0);
      }

      // 5. Cloud Resource -> Business Process/Department (PROVISIONS or OWNED_BY)
      if (node.type === 'cloud_resource' && node.departmentId) {
        this.link(node.id, node.departmentId, 'OWNED_BY', 0.8);
      }

      // 6. Identity -> Department/App (GOVERNED_BY or ACCESSES)
      if (node.type === 'identity' && node.metadata.allowedApps) {
        const apps = Array.isArray(node.metadata.allowedApps) ? node.metadata.allowedApps : [];
        apps.forEach((appId: string) => {
          this.link(node.id, appId, 'ACCESSES', 0.85);
        });
      }
    });

    logger.info(`[RelationshipBuilder] Finished topological auto-linking. Threaded total of ${fabricCache.listRelations().length} relationships.`);
  }
}

export const relationshipBuilder = RelationshipBuilder.getInstance();
