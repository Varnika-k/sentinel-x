import { logger } from '../core/logger';
import { CanonicalTelemetryEvent } from '../telemetry/pipeline';

export class PartitionManager {
  private activePartitions: Set<string> = new Set(['prod-zone', 'corp-zone', 'internal-security', 'db-backbone']);

  public resolvePartition(event: CanonicalTelemetryEvent): string {
    const ns = event.infrastructureContext?.namespace;
    const env = event.infrastructureContext?.environment;

    if (ns === 'security' || event.targetNode === 'azure-vm-ad-connector' || event.targetNode === 'iam-root-account') {
      return 'internal-security';
    }

    if (ns === 'db-tier' || ns === 'storage') {
      return 'db-backbone';
    }

    if (env === 'aws-global' || ns === 'production') {
      return 'prod-zone';
    }

    return 'corp-zone';
  }

  public registerPartition(partitionName: string): void {
    this.activePartitions.add(partitionName);
    logger.info(`[PartitionManager] New dynamic stream partition registered: ${partitionName}`);
  }

  public getPartitions(): string[] {
    return Array.from(this.activePartitions);
  }
}

export const partitionManager = new PartitionManager();
