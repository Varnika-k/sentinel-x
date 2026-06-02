import { UnifiedCorrelationAlert, CorrelatedAlertCluster } from './types';
import { BlastRadiusAnalyzer } from './blast-radius';

export class ThreatLinker {
  /**
   * Translates a collection of correlated raw alerts into a concise, unified operational threat narrative.
   */
  public static generateNarrative(
    cluster: {
      id: string;
      alerts: UnifiedCorrelationAlert[];
      confidenceScore: number;
    }
  ): string {
    const { alerts, confidenceScore } = cluster;
    if (alerts.length === 0) return 'No active threat identified.';

    const sources = Array.from(new Set(alerts.map(a => a.source)));
    const targetNodes = Array.from(new Set(alerts.map(a => a.nodeId)));
    const stages = Array.from(new Set(alerts.map(a => a.attackStage).filter(Boolean)));
    const severities = Array.from(new Set(alerts.map(a => a.severity)));

    // 1. Identify primary host/target
    const mainTarget = targetNodes[0] || 'Unresolved Core Host';

    // 2. Draft the threat lifecycle trace summary
    let summary = `Unified Intelligence fusion of ${alerts.length} sensor events spanning [${sources.join(' + ')}] indicates a `;
    
    if (severities.includes('critical') || severities.includes('high')) {
      summary += `highly disruptive cyber campaign on target system [${mainTarget}]. `;
    } else {
      summary += `potential early-stage compromise threat targeting [${mainTarget}]. `;
    }

    // 3. Elaborate on tactical progress
    if (stages.length > 0) {
      summary += `The attack chain pattern reveals tactical evolution from [${stages.join(' ➔ ')}] stages. `;
    }

    // 4. Trace blast impact prediction
    const analysis = BlastRadiusAnalyzer.analyzeBlastRadius(mainTarget);
    if (analysis.exposureRiskIndex > 60) {
      summary += `Exposure index scored at ${analysis.exposureRiskIndex}%. `;
      if (analysis.criticalAssetsAtRisk.length > 0) {
        summary += `Neighboring high sensitivity nodes like [${analysis.criticalAssetsAtRisk.slice(0, 3).join(', ')}] are currently threatened. `;
      }
      if (analysis.governanceComplianceViolated) {
        summary += 'Critical governance zones (RESTRICTED/CONFIDENTIAL classifications) are within immediate lateral path reach, violating compliance policies.';
      }
    } else {
      summary += `Lateral footprint remains localized, maintaining default risk profile levels.`;
    }

    return summary;
  }
}
