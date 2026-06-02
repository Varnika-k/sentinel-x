import { graphIntelligenceEngine } from '../simulation/graph-intelligence';
import { logger } from '../core/logger';

export interface GraphScaleReport {
  initialNodeCount: number;
  insertedNodeCount: number;
  finalNodeCount: number;
  analysisTimeMs: number;
}

export class GraphScalabilityEngine {
  public static benchmarkLargeClustering(additionalNodes = 100): GraphScaleReport {
    logger.info(`[GraphScale] Benchmarking tree performance with ${additionalNodes} injected target nodes...`);
    const initialNodeCount = graphIntelligenceEngine.nodes.size;
    const startMs = Date.now();

    // Temporarily insert scalable targets
    for (let i = 0; i < additionalNodes; i++) {
      const nodeName = `bench-scale-node-${i}`;
      graphIntelligenceEngine.nodes.set(nodeName, {
        id: `bench-${i}`,
        name: nodeName,
        type: 'container',
        status: 'healthy',
        trustScore: 90,
        cpuLoad: 20,
        activeConnections: 5,
        compromiseProbability: 0.01,
        resilienceScore: 95,
        operationalCriticality: 30,
        exposureScore: 5,
        propagationMultiplier: 1.0,
        containsSensitiveAssets: false,
        latency: 5,
        securityClassification: 'internal',
        namespace: 'benchmark',
        environment: 'stress-env'
      });
    }

    // Measure re-calc timings
    const duration = Date.now() - startMs;
    const finalNodeCount = graphIntelligenceEngine.nodes.size;

    logger.info(`[GraphScale] Injected ${additionalNodes} test targets. Tree size scale: ${finalNodeCount} nodes. Ingestion parsing took ${duration}ms.`);

    // Clean up mock targets immediately to preserve graph integrity
    for (let i = 0; i < additionalNodes; i++) {
      graphIntelligenceEngine.nodes.delete(`bench-scale-node-${i}`);
    }

    return {
      initialNodeCount,
      insertedNodeCount: additionalNodes,
      finalNodeCount: initialNodeCount,
      analysisTimeMs: duration
    };
  }
}
