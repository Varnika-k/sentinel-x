import { logger } from '../../core/logger';

export interface EvolutionStage {
  stageIndex: number;
  stageName: 'recon' | 'ingress' | 'lateral_movement' | 'privilege_escalation' | 'data_exfiltration' | 'system_lockdown';
  timestamp: string;
  triggeredByNode: string;
  description: string;
  affectedAssetsCount: number;
}

export class AttackEvolution {
  private static instance: AttackEvolution;
  private timeline: EvolutionStage[] = [];

  private constructor() {
    this.seedEvolTimeline();
  }

  public static getInstance(): AttackEvolution {
    if (!AttackEvolution.instance) {
      AttackEvolution.instance = new AttackEvolution();
    }
    return AttackEvolution.instance;
  }

  private seedEvolTimeline() {
    this.timeline = [
      {
        stageIndex: 1,
        stageName: 'recon',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        triggeredByNode: 'pc-admin-hq',
        description: 'Reconnaissance activities mapped: internal port scans from workstation subnets matching corporate ranges.',
        affectedAssetsCount: 1
      },
      {
        stageIndex: 2,
        stageName: 'ingress',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        triggeredByNode: 'k8s-pod-auth-api-559b',
        description: 'Compromised ingress proxy tunnel session mapped. Credentials established with elevated IAM role tags.',
        affectedAssetsCount: 2
      }
    ];
  }

  /**
   * Pushes a new active stage of attack evolution
   */
  public logEvolutionStage(
    stageName: EvolutionStage['stageName'],
    triggeredByNode: string,
    description: string,
    affectedAssetsCount: number
  ) {
    const nextIndex = this.timeline.length + 1;
    this.timeline.push({
      stageIndex: nextIndex,
      stageName,
      timestamp: new Date().toISOString(),
      triggeredByNode,
      description,
      affectedAssetsCount
    });
    logger.info(`[AttackEvolution] Advanced to stage [${stageName.toUpperCase()}] triggered by node: ${triggeredByNode}`);
  }

  public getTimeline(): EvolutionStage[] {
    return this.timeline;
  }

  public clearTimeline() {
    this.seedEvolTimeline();
  }
}

export const attackEvolution = AttackEvolution.getInstance();
