import { logger } from '../../core/logger';

export interface TemporalAnomalyRecord {
  id: string;
  timestamp: string;
  sourceNode: string;
  category: 'behavioral' | 'network_volume' | 'intrusion_alert' | 'governance_drift' | 'identity_fraud';
  alertText: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidenceScore: number;
}

export class AnomalyHistory {
  private static instance: AnomalyHistory;
  private anomalies: TemporalAnomalyRecord[] = [];

  private constructor() {
    this.seedHistoricAnomalies();
  }

  public static getInstance(): AnomalyHistory {
    if (!AnomalyHistory.instance) {
      AnomalyHistory.instance = new AnomalyHistory();
    }
    return AnomalyHistory.instance;
  }

  private seedHistoricAnomalies() {
    const defaultAnomalies: TemporalAnomalyRecord[] = [
      {
        id: 'temporal-a-01',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        sourceNode: 'pc-admin-hq',
        category: 'identity_fraud',
        alertText: 'Multiple consecutive API authentications from off-hours corporate workplace bounds',
        severity: 'medium',
        confidenceScore: 84
      },
      {
        id: 'temporal-a-02',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sourceNode: 'k8s-pod-auth-api-559b',
        category: 'behavioral',
        alertText: 'Sub-second privileged session renewals detected with out-of-order identity tokens',
        severity: 'high',
        confidenceScore: 91
      },
      {
        id: 'temporal-a-03',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        sourceNode: 'dept-finance-workstation',
        category: 'network_volume',
        alertText: 'Egress backup burst session initiated, transferring unexplained bulk binary packets to S3 buckets',
        severity: 'high',
        confidenceScore: 78
      }
    ];

    this.anomalies = defaultAnomalies;
  }

  public recordAnomaly(anomaly: Omit<TemporalAnomalyRecord, 'id' | 'timestamp'>) {
    const raw: TemporalAnomalyRecord = {
      id: `anom-${Math.round(Math.random() * 100000)}`,
      timestamp: new Date().toISOString(),
      ...anomaly
    };
    this.anomalies.push(raw);
    logger.info(`[AnomalyHistory] Created and mapped raw anomaly ${raw.id} targeting ${raw.sourceNode}`);
  }

  public getAnomalies(): TemporalAnomalyRecord[] {
    return this.anomalies;
  }

  /**
   * Performs temporal clustering identifying correlation indices
   */
  public clusterAnomalies(): {
    clusterName: string;
    anomalyIds: string[];
    riskFactor: number;
  }[] {
    // Group anomalies by categories
    const groups: { [key: string]: string[] } = {};
    this.anomalies.forEach(a => {
      if (!groups[a.category]) groups[a.category] = [];
      groups[a.category].push(a.id);
    });

    return Object.entries(groups).map(([cat, ids]) => {
      return {
        clusterName: `${cat.toUpperCase()}_HOURLY_CLUSTER`,
        anomalyIds: ids,
        riskFactor: ids.length * 25
      };
    });
  }
}

export const anomalyHistory = AnomalyHistory.getInstance();
