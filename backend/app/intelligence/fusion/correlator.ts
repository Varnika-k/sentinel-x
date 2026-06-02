import { UnifiedCorrelationAlert, CorrelatedAlertCluster } from './types';
import { ConfidenceEngine } from './confidence-engine';
import { TemporalAnalyzer } from './temporal-analyzer';
import { BlastRadiusAnalyzer } from './blast-radius';
import { ThreatLinker } from './threat-linker';
import { logger } from '../../core/logger';

export class AdvancedCorrelator {
  private static instance: AdvancedCorrelator;
  private activeClusters: Map<string, CorrelatedAlertCluster> = new Map();
  private alertHistory: UnifiedCorrelationAlert[] = [];
  private clusterAlertsMap: Map<string, UnifiedCorrelationAlert[]> = new Map();
  private maxHistorySize = 1000;

  private constructor() {}

  public static getInstance(): AdvancedCorrelator {
    if (!AdvancedCorrelator.instance) {
      AdvancedCorrelator.instance = new AdvancedCorrelator();
    }
    return AdvancedCorrelator.instance;
  }

  /**
   * Registers/pushes a raw alert event into the cross-source correlation pool.
   * Scans existing clusters dynamically for correlation matches.
   */
  public correlate(alert: UnifiedCorrelationAlert): CorrelatedAlertCluster {
    // 1. Maintain slide history to avoid memory bloat
    this.alertHistory.push(alert);
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.shift();
    }

    let matchedCluster: CorrelatedAlertCluster | null = null;

    // 2. Scan active clusters in reverse chronological index for potential fusion candidates
    for (const cluster of Array.from(this.activeClusters.values()).reverse()) {
      // Check temporal alignment (within 5 minutes of cluster start or latest event)
      const matchesTime = TemporalAnalyzer.isWithinWindow(cluster.timestamp, alert.timestamp);
      
      // Check logical alignment (touches same target node, touches related nodes in exposure paths, or shares correlation IDs)
      const clusterAlerts = this.clusterAlertsMap.get(cluster.id) || [];
      const isRelatedNode = cluster.nodesAffected.includes(alert.nodeId) || 
                            clusterAlerts.some(a => a.telemetry?.original_payload?.src_ip === alert.telemetry?.original_payload?.dest_ip);

      if (matchesTime && isRelatedNode) {
        matchedCluster = cluster;
        break;
      }
    }

    // 3. Integrate alert into matched cluster, or bootstrap a new one
    if (matchedCluster) {
      const clusterAlerts = this.clusterAlertsMap.get(matchedCluster.id) || [];
      clusterAlerts.push(alert);
      this.clusterAlertsMap.set(matchedCluster.id, clusterAlerts);

      // Mutate and refresh cluster stats
      if (!matchedCluster.nodesAffected.includes(alert.nodeId)) {
        matchedCluster.nodesAffected.push(alert.nodeId);
      }
      
      if (alert.attackStage && !matchedCluster.stagesPresent.includes(alert.attackStage)) {
        matchedCluster.stagesPresent.push(alert.attackStage);
      }

      const sources = new Set(clusterAlerts.map(a => a.source));
      matchedCluster.sourcesFused = Array.from(sources);

      if (alert.severity === 'critical' || matchedCluster.overallSeverity === 'critical') {
        matchedCluster.overallSeverity = 'critical';
      } else if (alert.severity === 'high' || matchedCluster.overallSeverity === 'high') {
        matchedCluster.overallSeverity = 'high';
      } else if (alert.severity === 'medium' || matchedCluster.overallSeverity === 'medium') {
        matchedCluster.overallSeverity = 'medium';
      }

      matchedCluster.originalAlertIds.push(alert.id);
      matchedCluster.confidenceScore = ConfidenceEngine.calculateConfidence(clusterAlerts);
      
      // Re-evaluate blast radius using the primary/head target of the cluster
      const prNode = matchedCluster.nodesAffected[0];
      const blastAnalysis = BlastRadiusAnalyzer.analyzeBlastRadius(prNode);
      matchedCluster.blastRadiusScore = blastAnalysis.exposureRiskIndex;
      matchedCluster.exposureChain = blastAnalysis.path;
      matchedCluster.riskAmplified = blastAnalysis.governanceComplianceViolated;

      // Regenerate the correlated threat narrative from updated states
      matchedCluster.threatNarrative = ThreatLinker.generateNarrative({
        id: matchedCluster.id,
        alerts: clusterAlerts,
        confidenceScore: matchedCluster.confidenceScore
      });

      logger.info(`[Correlator] Fused alert ${alert.id} into existing threat cluster ${matchedCluster.id} (Confidence: ${matchedCluster.confidenceScore}%, Narrative: ${matchedCluster.threatNarrative})`);
      return matchedCluster;
    } else {
      // Initialize an entirely new correlation thread/slice
      const clusterId = `cluster-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      const newCluster: CorrelatedAlertCluster = {
        id: clusterId,
        timestamp: alert.timestamp,
        nodesAffected: [alert.nodeId],
        stagesPresent: alert.attackStage ? [alert.attackStage] : [],
        overallSeverity: alert.severity,
        confidenceScore: ConfidenceEngine.calculateConfidence([alert]),
        threatNarrative: alert.message,
        originalAlertIds: [alert.id],
        sourcesFused: [alert.source],
        riskAmplified: false,
        blastRadiusScore: 10,
        exposureChain: []
      };

      // Set initial threat calculations
      const blastAnalysis = BlastRadiusAnalyzer.analyzeBlastRadius(alert.nodeId);
      newCluster.blastRadiusScore = blastAnalysis.exposureRiskIndex;
      newCluster.exposureChain = blastAnalysis.path;
      newCluster.riskAmplified = blastAnalysis.governanceComplianceViolated;

      newCluster.threatNarrative = ThreatLinker.generateNarrative({
        id: clusterId,
        alerts: [alert],
        confidenceScore: newCluster.confidenceScore
      });

      this.activeClusters.set(clusterId, newCluster);
      this.clusterAlertsMap.set(clusterId, [alert]);

      logger.info(`[Correlator] Spawned new threat correlation cluster: ${clusterId} for node ${alert.nodeId}`);
      return newCluster;
    }
  }

  /**
   * Retrieves all evaluated active clusters across the entire unified platform.
   */
  public getClusters(): CorrelatedAlertCluster[] {
    return Array.from(this.activeClusters.values());
  }

  /**
   * Safely clears active clusters for replay/restoration purposes.
   */
  public clear() {
    this.activeClusters.clear();
    this.clusterAlertsMap.clear();
    this.alertHistory = [];
  }
}
