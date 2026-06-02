import { dependencySimulator } from './dependency-simulator';

export interface InfrastructureSimulationResult {
  disabledNodeIds: string[];
  degradedNodeIds: string[];
  networkLatencyMs: number;
  dataReplicationSyncPct: number; // Percentage 0-100 indicating active database synchronization
  activeInfrastructureSLA: number; // Percentage 0-100 of online systems
}

export class InfrastructureSimulator {
  public simulateInfrastructureEvent(eventType: string, targetId: string): InfrastructureSimulationResult {
    const disabledNodeIds: string[] = [];
    const degradedNodeIds: string[] = [];
    let networkLatencyMs = 45; // Nominal ping
    let dataReplicationSyncPct = 100;
    let activeInfrastructureSLA = 100;

    switch (eventType) {
      case 'aws_region_outage': {
        // Core primary Cloud Region goes offline (e.g., us-east-1 massive S3 outage or blackout)
        disabledNodeIds.push('infra-aws-region-1');
        networkLatencyMs = 999; // Total interruption
        dataReplicationSyncPct = 0; // Sync severed
        activeInfrastructureSLA = 40; // 60% of core assets are in Region 1
        break;
      }
      case 'azure_service_failure': {
        // Azure Active Directory federated links fail
        disabledNodeIds.push('infra-azure-ad');
        networkLatencyMs = 150; // Retries increase ping times
        dataReplicationSyncPct = 95;
        activeInfrastructureSLA = 80;
        break;
      }
      case 'database_failure': {
        // Specific database crash or exhaustion
        if (targetId) {
          disabledNodeIds.push(targetId);
        } else {
          disabledNodeIds.push('db-transaction-core');
        }
        networkLatencyMs = 60;
        dataReplicationSyncPct = 0;
        activeInfrastructureSLA = 90;
        break;
      }
      case 'kubernetes_failure': {
        // Pod eviction storms, API-server deadlock
        disabledNodeIds.push('infra-k8s-cluster');
        networkLatencyMs = 350; // Infinite retries
        dataReplicationSyncPct = 85;
        activeInfrastructureSLA = 70;
        break;
      }
      case 'network_segmentation': {
        // Boundary core links cut off (e.g. firewall misconfiguration or physical fiber cut)
        disabledNodeIds.push('infra-border-router');
        networkLatencyMs = 1200; // Complete client timeout
        dataReplicationSyncPct = 30; // Cannot reach sync targets
        activeInfrastructureSLA = 50;
        break;
      }
      default:
        break;
    }

    return {
      disabledNodeIds,
      degradedNodeIds,
      networkLatencyMs,
      dataReplicationSyncPct,
      activeInfrastructureSLA
    };
  }
}

export const infrastructureSimulator = new InfrastructureSimulator();
