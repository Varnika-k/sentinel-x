import { logger } from '../../core/logger';
import { digitalTwinEngine, SimulatedNode } from '../../simulation/twin-engine';
import { graphIntelligenceEngine } from '../../simulation/graph-intelligence';

export class SuricataMapper {
  private static ipToNodeMap: Record<string, string> = {
    '10.244.0.1': 'k8s-svc-ingress-nginx',
    '10.244.18.52': 'k8s-pod-auth-api-559b',
    '10.244.18.5': 'k8s-pod-auth-api-559b',
    '10.244.24.88': 'k8s-pod-payment-gw-88c2',
    '10.244.24.8': 'k8s-pod-payment-gw-88c2',
    '10.45.1.4': 'db-core-master',
    '10.45.2.14': 'pc-admin-hq',
    '100.80.12.1': 'secrets-vault-config',
    '10.45.1.1': 'api-internal-gateway',
    '127.0.0.1': 'pc-admin-hq'
  };

  /**
   * Translates an IP to a SentinelX Node Name. If the IP belongs to a new external entity,
   * it dynamically registers it into the system's Digital Twin mesh and Graph Engine.
   */
  public static getOrCreateNodeForIp(ip: string, category: 'attacker' | 'target' = 'target', targetNodeName?: string): string {
    if (!ip) return 'pc-admin-hq';

    // 1. Check direct static IP translations
    if (this.ipToNodeMap[ip]) {
      return this.ipToNodeMap[ip];
    }

    // 2. Discover / Create a dynamic external node dynamically in the Digital Twin
    const nodeName = `host-${ip.replace(/\./g, '-')}`;

    if (!digitalTwinEngine.nodes.has(nodeName)) {
      logger.info(`[SuricataMapper] Dynamically discovering new operational IP address: ${ip}. Registering Node: ${nodeName}`);

      const isThreatActor = category === 'attacker' || ip.startsWith('185.220.') || ip.startsWith('82.102.') || ip.startsWith('45.18.');
      
      const newDynamicNode: SimulatedNode = {
        id: `dyn-${nodeName}`,
        name: nodeName,
        type: isThreatActor ? 'API_ENDPOINT' : 'WORKSTATION',
        namespace: isThreatActor ? 'threat-actor' : 'external-network',
        environment: isThreatActor ? 'tor-proxy' : 'wan',
        status: isThreatActor ? 'infected' : 'healthy',
        cpuLoad: 2,
        latency: 15,
        activeConnections: 1,
        relationships: targetNodeName ? [targetNodeName] : [],
        riskScore: isThreatActor ? 85 : 10,
        trustScore: isThreatActor ? 15 : 90,
        compromiseProbability: isThreatActor ? 0.85 : 0.10,
        resilienceScore: 40,
        operationalCriticality: isThreatActor ? 50 : 20,
        exposureScore: 90,
        abnormalBehaviorScore: isThreatActor ? 90 : 0,
        identityRisk: isThreatActor ? 80 : 5,
        propagationMultiplier: isThreatActor ? 1.6 : 1.0,
        securityClassification: 'public',
        containsSensitiveAssets: false
      };

      digitalTwinEngine.nodes.set(nodeName, newDynamicNode);

      // Force instant graph intelligence rebuild with dynamic nodes and edges mapped!
      graphIntelligenceEngine.rebuildGraph(Array.from(digitalTwinEngine.nodes.values()));
    } else if (targetNodeName) {
      // Node already exists, ensure relationships define communication link if traffic went there
      const nodeObj = digitalTwinEngine.nodes.get(nodeName)!;
      if (!nodeObj.relationships.includes(targetNodeName)) {
        nodeObj.relationships.push(targetNodeName);
        graphIntelligenceEngine.rebuildGraph(Array.from(digitalTwinEngine.nodes.values()));
      }
    }

    return nodeName;
  }
}
