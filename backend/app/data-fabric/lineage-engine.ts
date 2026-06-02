import { fabricCache } from './fabric-cache';
import { LineageTrace, EnterpriseNode } from './types';
import { logger } from '../core/logger';

export class LineageEngine {
  private static instance: LineageEngine;

  private constructor() {}

  public static getInstance(): LineageEngine {
    if (!LineageEngine.instance) {
      LineageEngine.instance = new LineageEngine();
    }
    return LineageEngine.instance;
  }

  /**
   * Discovers and visualizes a data flow pipeline starting at a source node.
   * Resolves dependencies in the direction of data propagation:
   * Source Node (Database/Storage) -> Transformed by Apps (Application/Service) -> Consumers (End Users/Dashboards/Reports)
   */
  public compileLineage(sourceId: string): LineageTrace[] {
    const startNode = fabricCache.getNode(sourceId);
    if (!startNode) return [];

    const traces: LineageTrace[] = [];

    // Use outgoing relationships to discover line pipelines
    const outgoing = fabricCache.getOutgoingRelations(sourceId);

    outgoing.forEach(rel => {
      // Direct stores or dependency relationships mean flow direction
      if (rel.type === 'STORES_DATA_FOR' || rel.type === 'DEPENDS_ON' || rel.type === 'RUNS_ON') {
        const downstreamNode = fabricCache.getNode(rel.targetId);
        if (!downstreamNode) return;

        // If downstream is an application, check what consumes that application for secondary hops
        if (downstreamNode.type === 'application') {
          const hops = fabricCache.getOutgoingRelations(downstreamNode.id);
          const consumers = hops.filter(h => h.type === 'ACCESSES' || h.type === 'DEPENDS_ON');

          if (consumers.length > 0) {
            consumers.forEach(h => {
              const consumerNode = fabricCache.getNode(h.targetId);
              if (consumerNode) {
                traces.push({
                  sourceId: startNode.id,
                  sourceName: startNode.name,
                  sourceType: startNode.type,
                  transforms: [downstreamNode.name],
                  consumerId: consumerNode.id,
                  consumerName: consumerNode.name,
                  consumerType: consumerNode.type
                });
              }
            });
          } else {
            // Application itself is the consumer terminal
            traces.push({
              sourceId: startNode.id,
              sourceName: startNode.name,
              sourceType: startNode.type,
              transforms: [],
              consumerId: downstreamNode.id,
              consumerName: downstreamNode.name,
              consumerType: downstreamNode.type
            });
          }
        } else {
          // Direct Database -> Consumer relationship
          traces.push({
            sourceId: startNode.id,
            sourceName: startNode.name,
            sourceType: startNode.type,
            transforms: [],
            consumerId: downstreamNode.id,
            consumerName: downstreamNode.name,
            consumerType: downstreamNode.type
          });
        }
      }
    });

    return traces;
  }

  /**
   * Auto-provisions simulated source transformations based on registry properties.
   */
  public generateGlobalLineageMap(): LineageTrace[] {
    const dbs = fabricCache.listNodesByType('database');
    let map: LineageTrace[] = [];

    dbs.forEach(db => {
      map = map.concat(this.compileLineage(db.id));
    });

    return map;
  }
}

export const lineageEngine = LineageEngine.getInstance();
