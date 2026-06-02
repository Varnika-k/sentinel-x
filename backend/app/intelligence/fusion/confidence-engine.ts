import { UnifiedCorrelationAlert } from './types';
import { digitalTwinEngine } from '../../simulation/twin-engine';

export class ConfidenceEngine {
  /**
   * Calculates a mathematically rigorous confidence score (0 to 100)
   * for a cluster of alerts based on indicators, threat convergence, and target sensitivity.
   */
  public static calculateConfidence(alerts: UnifiedCorrelationAlert[]): number {
    if (alerts.length === 0) return 0;
    if (alerts.length === 1) {
      const alert = alerts[0];
      const base = alert.severity === 'critical' ? 70 : alert.severity === 'high' ? 50 : alert.severity === 'medium' ? 30 : 15;
      return base;
    }

    let rawScore = 30;

    // 1. Analyze multi-source convergence (Suricata EVE + Falco container indicators)
    const sources = new Set(alerts.map(a => a.source.toUpperCase()));
    if (sources.has('SURICATA') && sources.has('FALCO')) {
      // Direct high-fidelity network-to-runtime alignment
      rawScore += 35;
    } else if (sources.size > 1) {
      rawScore += 15;
    }

    // 2. Map MITRE Attack phase escalation count
    const stages = new Set(alerts.map(a => a.attackStage).filter(Boolean));
    if (stages.size >= 3) {
      rawScore += 25; // Complex, multi-stage kill chain
    } else if (stages.size === 2) {
      rawScore += 12;
    }

    // 3. Max severity factor
    const severities = alerts.map(a => a.severity);
    if (severities.includes('critical')) {
      rawScore += 15;
    } else if (severities.includes('high')) {
      rawScore = Math.max(rawScore, rawScore + 10);
    }

    // 4. Target sensitivity amplification using governance assets in Digital Twin
    const nodes = new Set(alerts.map(a => a.nodeId));
    let sensitivityBoost = 0;
    nodes.forEach(nodeId => {
      const twin = digitalTwinEngine.nodes.get(nodeId);
      if (twin) {
        if (twin.containsSensitiveAssets || twin.securityClassification === 'restricted' || twin.securityClassification === 'confidential') {
          sensitivityBoost = Math.max(sensitivityBoost, 15);
        }
      }
    });
    rawScore += sensitivityBoost;

    // 5. Cap score strictly between 0 and 100
    return Math.max(10, Math.min(100, rawScore));
  }
}
