import { logger } from '../../core/logger';
import { 
  STATIC_CORE_EMPLOYEES, 
  DEPARTMENTS, 
  APPLICATIONS, 
  DATA_ASSETS, 
  INFRA_NODES, 
  GOVERNANCE_VIOLATIONS 
} from '../../../../src/lib/enterprise-data';

export interface FabricEntity {
  id: string;
  name: string;
  type: 'employee' | 'department' | 'application' | 'database' | 'infra_node' | 'governance_rule' | 'cloud_resource';
  metadata: any;
}

export interface FabricRelation {
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
  relationType: 'depends_on' | 'owns' | 'manages' | 'accesses' | 'complies_with' | 'deployed_on' | 'runs_on' | 'reports_to' | 'belongs_to';
  strength: number; // 0.0 to 1.0
}

export class RelationshipEngine {
  private entities: Map<string, FabricEntity> = new Map();
  private relations: FabricRelation[] = [];

  constructor() {
    this.bootstrapFabric();
  }

  /**
   * Automatically ingests existing enterprise data records to construct the initial fabric model
   */
  private bootstrapFabric() {
    logger.info('[RelationshipEngine] Initiating Enterprise Intelligence Bootstrapping...');

    // 1. Ingest Departments
    DEPARTMENTS.forEach(dept => {
      this.entities.set(dept.id, {
        id: dept.id,
        name: dept.name,
        type: 'department',
        metadata: { ...dept }
      });
    });

    // 2. Ingest Applications
    APPLICATIONS.forEach(app => {
      this.entities.set(app.id, {
        id: app.id,
        name: app.name,
        type: 'application',
        metadata: { ...app }
      });

      // App -> Databases connection
      app.connectedDatabases.forEach(dbId => {
        this.relations.push({
          sourceId: app.id,
          sourceType: 'application',
          targetId: dbId,
          targetType: 'database',
          relationType: 'accesses',
          strength: 0.9
        });
      });

      // App -> App dependencies
      app.dependencies.forEach(depAppId => {
        this.relations.push({
          sourceId: app.id,
          sourceType: 'application',
          targetId: depAppId,
          targetType: 'application',
          relationType: 'depends_on',
          strength: 0.8
        });
      });
    });

    // 3. Ingest Data Assets / Databases
    DATA_ASSETS.forEach(db => {
      this.entities.set(db.id, {
        id: db.id,
        name: db.name,
        type: 'database',
        metadata: { ...db }
      });
    });

    // 4. Ingest Infrastructure Nodes
    INFRA_NODES.forEach(infra => {
      this.entities.set(infra.id, {
        id: infra.id,
        name: infra.name,
        type: 'infra_node',
        metadata: { ...infra }
      });

      // Databases run on Infrastructure
      // Let's dynamically map database entities to specific baremetals/containers
      DATA_ASSETS.forEach((db, i) => {
        const associatedNode = INFRA_NODES[i % INFRA_NODES.length];
        this.relations.push({
          sourceId: db.id,
          sourceType: 'database',
          targetId: associatedNode.id,
          targetType: 'infra_node',
          relationType: 'runs_on',
          strength: 0.95
        });
      });
      
      // Infrastructure nodes reside in Cloud Regions
      const cloudRegionId = `cloud-${infra.provider}-${infra.region}`;
      if (!this.entities.has(cloudRegionId)) {
        this.entities.set(cloudRegionId, {
          id: cloudRegionId,
          name: `${infra.provider.toUpperCase()} (${infra.region})`,
          type: 'cloud_resource',
          metadata: { provider: infra.provider, region: infra.region }
        });
      }

      this.relations.push({
        sourceId: infra.id,
        sourceType: 'infra_node',
        targetId: cloudRegionId,
        targetType: 'cloud_resource',
        relationType: 'deployed_on',
        strength: 1.0
      });
    });

    // 5. Ingest Employees
    STATIC_CORE_EMPLOYEES.forEach(emp => {
      this.entities.set(emp.id, {
        id: emp.id,
        name: emp.name,
        type: 'employee',
        metadata: { ...emp }
      });

      // Employee -> Department relation
      const dept = DEPARTMENTS.find(d => d.name === emp.department);
      if (dept) {
        this.relations.push({
          sourceId: emp.id,
          sourceType: 'employee',
          targetId: dept.id,
          targetType: 'department',
          relationType: 'belongs_to',
          strength: 1.0
        });
      }

      // Employee -> Manager relation (if exists)
      const manager = STATIC_CORE_EMPLOYEES.find(m => m.name === emp.manager);
      if (manager) {
        this.relations.push({
          sourceId: emp.id,
          sourceType: 'employee',
          targetId: manager.id,
          targetType: 'employee',
          relationType: 'reports_to',
          strength: 0.9
        });
      }

      // Employee -> Applications Used
      emp.applicationsUsed.forEach(appName => {
        const matchingApp = APPLICATIONS.find(a => a.name.toLowerCase().includes(appName.toLowerCase()) || appName.toLowerCase().includes(a.name.toLowerCase()));
        if (matchingApp) {
          this.relations.push({
            sourceId: emp.id,
            sourceType: 'employee',
            targetId: matchingApp.id,
            targetType: 'application',
            relationType: 'accesses',
            strength: 0.75
          });
        }
      });
    });

    // 6. Ingest Governance rules/compliance linkages
    GOVERNANCE_VIOLATIONS.forEach(violation => {
      const ruleId = `rule-${violation.ruleViolated.replace(/\s+/g, '-').toLowerCase()}`;
      if (!this.entities.has(ruleId)) {
        this.entities.set(ruleId, {
          id: ruleId,
          name: violation.ruleViolated,
          type: 'governance_rule',
          metadata: { severity: violation.severity }
        });
      }

      // Department -> Governance Violation linkage
      const dept = DEPARTMENTS.find(d => d.name === violation.department);
      if (dept) {
        this.relations.push({
          sourceId: dept.id,
          sourceType: 'department',
          targetId: ruleId,
          targetType: 'governance_rule',
          relationType: 'complies_with',
          strength: 0.3 // weakened compliance relation representation
        });
      }
    });

    logger.info(`[RelationshipEngine] Successfully maps ${this.entities.size} active entities with ${this.relations.length} relationships.`);
  }

  public getEntities(): FabricEntity[] {
    return Array.from(this.entities.values());
  }

  public getEntity(id: string): FabricEntity | undefined {
    return this.entities.get(id);
  }

  public addEntity(entity: FabricEntity): void {
    this.entities.set(entity.id, entity);
  }

  public removeEntity(id: string): void {
    this.entities.delete(id);
    this.relations = this.relations.filter(r => r.sourceId !== id && r.targetId !== id);
  }

  public getRelations(): FabricRelation[] {
    return this.relations;
  }

  public addRelation(relation: FabricRelation): void {
    const exists = this.relations.some(r => 
      r.sourceId === relation.sourceId && 
      r.targetId === relation.targetId && 
      r.relationType === relation.relationType
    );
    if (!exists) {
      this.relations.push(relation);
    }
  }

  public clearRelationsBySourceOrTarget(nodeId: string, relationType?: string): void {
    this.relations = this.relations.filter(r => {
      const matchNode = r.sourceId === nodeId || r.targetId === nodeId;
      const matchType = relationType ? r.relationType === relationType : true;
      return !(matchNode && matchType);
    });
  }

  /**
   * Search and filter entities
   */
  public searchEntities(query: string): FabricEntity[] {
    if (!query) return this.getEntities();
    const lc = query.toLowerCase();
    return this.getEntities().filter(e => 
      e.name.toLowerCase().includes(lc) || 
      e.id.toLowerCase().includes(lc) || 
      e.type.toLowerCase().includes(lc)
    );
  }

  /**
   * Computes adjacent nodes of any entity ID
   */
  public getAdjacencies(id: string) {
    const directRelations = this.relations.filter(r => r.sourceId === id || r.targetId === id);
    return directRelations.map(r => {
      const isSource = r.sourceId === id;
      const connectedId = isSource ? r.targetId : r.sourceId;
      const entity = this.entities.get(connectedId);
      return {
        relation: r,
        entity,
        direction: isSource ? 'outgoing' : 'incoming' as const
      };
    }).filter(adj => adj.entity !== undefined);
  }

  /**
   * Performs path-finding (shortest path BFS) up to N hops to reveal deep hidden paths.
   */
  public tracePath(sourceId: string, targetId: string, maxHops: number = 6): FabricEntity[] | null {
    if (sourceId === targetId) return [this.entities.get(sourceId)!];
    
    const queue: Array<{ currentId: string; path: string[] }> = [{ currentId: sourceId, path: [sourceId] }];
    const visited = new Set<string>();
    visited.add(sourceId);

    while (queue.length > 0) {
      const { currentId, path } = queue.shift()!;
      if (currentId === targetId) {
        return path.map(id => this.entities.get(id)!);
      }

      if (path.length > maxHops) continue;

      const adjacencies = this.getAdjacencies(currentId);
      for (const adj of adjacencies) {
        const nextId = adj.entity!.id;
        if (!visited.has(nextId)) {
          visited.add(nextId);
          queue.push({ currentId: nextId, path: [...path, nextId] });
        }
      }
    }

    return null;
  }
}

export const relationshipEngine = new RelationshipEngine();
