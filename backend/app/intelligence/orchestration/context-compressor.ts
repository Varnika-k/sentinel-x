import { GraphNodeState } from '../../simulation/graph-intelligence';

export class ContextCompressor {
  /**
   * Compresses topological node entities into minimalist token-efficient strings for LLM integration
   */
  public static compressNodeStates(nodes: GraphNodeState[]): string {
    return nodes
      .map(node => {
        const parts = [
          `id:${node.name}`,
          `st:${node.status}`,
          `tScore:${node.trustScore}`,
          `crit:${node.operationalCriticality}`
        ];
        
        if (node.complianceStatus && node.complianceStatus !== 'compliant') {
          parts.push(`cmp:${node.complianceStatus}`);
        }
        if (node.abnormalBehaviorScore && node.abnormalBehaviorScore > 0) {
          parts.push(`abn:${node.abnormalBehaviorScore}`);
        }
        
        return parts.join('|');
      })
      .join('\n');
  }

  /**
   * Compresses log histories or telemetry events
   */
  public static compressTelemetryHistory(events: any[]): string {
    return events
      .slice(-10) // Limit to last 10 events
      .map(e => `[${e.timestamp || ''}] src:${e.source || ''} -> ${e.targetNode || ''} | sev:${e.severity || ''} | scr:${e.threatScore || 0}`)
      .join('\n');
  }
}
