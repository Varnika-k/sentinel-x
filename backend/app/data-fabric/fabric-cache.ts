import { EnterpriseNode, EnterpriseRelation, EnterpriseNodeType } from './types';

export class FabricCache {
  private static instance: FabricCache;

  private nodes: Map<string, EnterpriseNode> = new Map();
  private relations: Map<string, EnterpriseRelation> = new Map();

  // Indexes for high performance
  private nodesByType: Map<EnterpriseNodeType, Set<string>> = new Map();
  private incomingRelations: Map<string, Set<string>> = new Map(); // targetId -> relationIds
  private outgoingRelations: Map<string, Set<string>> = new Map(); // sourceId -> relationIds

  private constructor() {}

  public static getInstance(): FabricCache {
    if (!FabricCache.instance) {
      FabricCache.instance = new FabricCache();
    }
    return FabricCache.instance;
  }

  public clear(): void {
    this.nodes.clear();
    this.relations.clear();
    this.nodesByType.clear();
    this.incomingRelations.clear();
    this.outgoingRelations.clear();
  }

  public addNode(node: EnterpriseNode): void {
    this.nodes.set(node.id, node);
    
    // index by type
    if (!this.nodesByType.has(node.type)) {
      this.nodesByType.set(node.type, new Set());
    }
    this.nodesByType.get(node.type)!.add(node.id);
  }

  public getNode(id: string): EnterpriseNode | undefined {
    return this.nodes.get(id);
  }

  public deleteNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;

    this.nodes.delete(id);
    this.nodesByType.get(node.type)?.delete(id);

    // Clean relations associated with it
    const incoming = Array.from(this.incomingRelations.get(id) || []);
    const outgoing = Array.from(this.outgoingRelations.get(id) || []);

    incoming.concat(outgoing).forEach(relId => this.deleteRelation(relId));
  }

  public listNodes(): EnterpriseNode[] {
    return Array.from(this.nodes.values());
  }

  public listNodesByType(type: EnterpriseNodeType): EnterpriseNode[] {
    const ids = this.nodesByType.get(type);
    if (!ids) return [];
    return Array.from(ids).map(id => this.nodes.get(id)!).filter(Boolean);
  }

  public addRelation(relation: EnterpriseRelation): void {
    this.relations.set(relation.id, relation);

    // Index outgoing (source -> targets)
    if (!this.outgoingRelations.has(relation.sourceId)) {
      this.outgoingRelations.set(relation.sourceId, new Set());
    }
    this.outgoingRelations.get(relation.sourceId)!.add(relation.id);

    // Index incoming (target <- sources)
    if (!this.incomingRelations.has(relation.targetId)) {
      this.incomingRelations.set(relation.targetId, new Set());
    }
    this.incomingRelations.get(relation.targetId)!.add(relation.id);
  }

  public getRelation(id: string): EnterpriseRelation | undefined {
    return this.relations.get(id);
  }

  public listRelations(): EnterpriseRelation[] {
    return Array.from(this.relations.values());
  }

  public deleteRelation(id: string): void {
    const rel = this.relations.get(id);
    if (!rel) return;

    this.relations.delete(id);
    this.outgoingRelations.get(rel.sourceId)?.delete(id);
    this.incomingRelations.get(rel.targetId)?.delete(id);
  }

  public getOutgoingRelations(nodeId: string): EnterpriseRelation[] {
    const ids = this.outgoingRelations.get(nodeId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.relations.get(id)!).filter(Boolean);
  }

  public getIncomingRelations(nodeId: string): EnterpriseRelation[] {
    const ids = this.incomingRelations.get(nodeId);
    if (!ids) return [];
    return Array.from(ids).map(id => this.relations.get(id)!).filter(Boolean);
  }
}

export const fabricCache = FabricCache.getInstance();
