import { TwinNode, TwinEdge } from './types';
import { GraphIntelligenceEngine } from '../simulation/graph-intelligence';

export class InfrastructureModel {
  private static instance: InfrastructureModel;
  private nodes: Map<string, TwinNode> = new Map();
  private edges: TwinEdge[] = [];

  private constructor() {
    this.refreshFromLiveGraph();
  }

  public static getInstance(): InfrastructureModel {
    if (!InfrastructureModel.instance) {
      InfrastructureModel.instance = new InfrastructureModel();
    }
    return InfrastructureModel.instance;
  }

  /**
   * Synchronize the infrastructure twin from the live graph intelligence mesh
   */
  public refreshFromLiveGraph() {
    this.nodes.clear();
    this.edges = [];

    const graphEngine = GraphIntelligenceEngine.getInstance();
    const liveNodes = Array.from(graphEngine.nodes.values());
    const liveEdges = graphEngine.edges;

    // Map live nodes to TwinNode records
    liveNodes.forEach(node => {
      this.nodes.set(node.name, {
        id: node.id || `infra-${node.name}`,
        name: node.name,
        type: node.type || 'K8S_POD',
        namespace: node.namespace || 'default',
        environment: node.environment || 'aws-east',
        status: node.status || 'healthy',
        cpuLoad: node.cpuLoad ?? 15,
        latency: node.latency ?? 10,
        activeConnections: node.activeConnections ?? 5,
        trustScore: node.trustScore ?? 90,
        compromiseProbability: node.compromiseProbability ?? 0.05,
        resilienceScore: node.resilienceScore ?? 80,
        operationalCriticality: node.operationalCriticality ?? 70,
        exposureScore: node.exposureScore ?? 30,
        containsSecrets: node.containsSecrets ?? false,
        sensitivityLevel: node.sensitivityLevel ?? 'medium',
        governanceRisk: node.governanceRisk ?? 10,
        complianceStatus: node.complianceStatus ?? 'compliant',
        abnormalBehaviorScore: node.abnormalBehaviorScore ?? 0,
        identityRisk: node.identityRisk ?? 5,
        propagationMultiplier: node.propagationMultiplier ?? 1.0,
        securityClassification: node.securityClassification ?? 'internal',
        containsSensitiveAssets: node.containsSensitiveAssets ?? false,
        relationships: this.getRelationshipsForNode(node.name, liveEdges),
        lastTelemetryTimestamp: new Date().toISOString()
      });
    });

    // Map live edges to TwinEdge records
    liveEdges.forEach(edge => {
      this.edges.push({
        id: edge.id || `edge-${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        type: edge.type,
        status: edge.status || 'active',
        riskWeight: edge.riskWeight ?? 0.1
      });
    });
  }

  private getRelationshipsForNode(nodeName: string, edges: any[]): string[] {
    const relationships: string[] = [];
    edges.forEach(edge => {
      if (edge.source === nodeName) {
        relationships.push(edge.target);
      } else if (edge.target === nodeName) {
        relationships.push(edge.source);
      }
    });
    return Array.from(new Set(relationships));
  }

  public getNodes(): Map<string, TwinNode> {
    if (this.nodes.size === 0) {
      this.refreshFromLiveGraph();
    }
    return this.nodes;
  }

  public getEdges(): TwinEdge[] {
    if (this.edges.length === 0) {
      this.refreshFromLiveGraph();
    }
    return this.edges;
  }

  public getNode(name: string): TwinNode | undefined {
    return this.nodes.get(name);
  }

  public updateNode(name: string, fields: Partial<TwinNode>) {
    const node = this.nodes.get(name);
    if (node) {
      this.nodes.set(name, { ...node, ...fields, lastTelemetryTimestamp: new Date().toISOString() });
    }
  }

  public setNodeStatus(name: string, status: TwinNode['status']) {
    const node = this.nodes.get(name);
    if (node) {
      node.status = status;
      this.nodes.set(name, node);
    }
  }
}

export const infrastructureModel = InfrastructureModel.getInstance();
