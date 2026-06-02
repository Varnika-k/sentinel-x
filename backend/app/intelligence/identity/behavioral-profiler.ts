import { BehavioralProfile } from './types';
import { logger } from '../../core/logger';

export class BehavioralProfiler {
  private static instance: BehavioralProfiler;
  private profiles: Map<string, BehavioralProfile> = new Map();

  private constructor() {
    this.seedDefaultProfiles();
  }

  public static getInstance(): BehavioralProfiler {
    if (!BehavioralProfiler.instance) {
      BehavioralProfiler.instance = new BehavioralProfiler();
    }
    return BehavioralProfiler.instance;
  }

  private seedDefaultProfiles(): void {
    const seedUsers = [
      { name: 'admin-alpha', hrs: { start: 7, end: 20 }, sectors: ['PERIMETER', 'DATA_CORE', 'ISOLATION_ZONE'] },
      { name: 'analyst-dev', hrs: { start: 9, end: 18 }, sectors: ['PERIMETER'] },
      { name: 'corp-sync', hrs: { start: 0, end: 24 }, sectors: ['PERIMETER', 'DATA_CORE'] }, // Daemon user
      { name: 'finance-lead', hrs: { start: 8, end: 17 }, sectors: ['PERIMETER'] },
      { name: 'secops-ranger', hrs: { start: 6, end: 22 }, sectors: ['PERIMETER', 'DATA_CORE', 'ISOLATION_ZONE'] }
    ];

    seedUsers.forEach(user => {
      this.profiles.set(user.name, {
        username: user.name,
        averageSessionsPerDay: 4,
        normalWorkingHours: user.hrs,
        authorizedSectors: user.sectors,
        averageBytesTransferred: 50 * 1024 * 1024, // 50MB
        highRiskActionsCount: 0,
        historicalAnomalies: []
      });
    });
  }

  public getProfile(username: string): BehavioralProfile {
    let profile = this.profiles.get(username);
    if (!profile) {
      profile = {
        username,
        averageSessionsPerDay: 2,
        normalWorkingHours: { start: 9, end: 18 },
        authorizedSectors: ['PERIMETER'],
        averageBytesTransferred: 10 * 1024 * 1024,
        highRiskActionsCount: 0,
        historicalAnomalies: []
      };
      this.profiles.set(username, profile);
    }
    return profile;
  }

  public trackActivity(username: string, sector: string, sizeBytes: number, hour: number): { isHourAnomaly: boolean; isSectorAnomaly: boolean } {
    const profile = this.getProfile(username);
    
    // Check operating hours
    const isHourAnomaly = hour < profile.normalWorkingHours.start || hour > profile.normalWorkingHours.end;
    
    // Check sector permissions
    const isSectorAnomaly = !profile.authorizedSectors.includes(sector);

    if (isHourAnomaly || isSectorAnomaly) {
      const anomalyText = `${isHourAnomaly ? 'Off-hours access' : ''}${isHourAnomaly && isSectorAnomaly ? ' and ' : ''}${isSectorAnomaly ? 'Unauthorized sector footprint' : ''}`;
      
      profile.historicalAnomalies.push({
        timestamp: new Date().toISOString(),
        description: `${anomalyText} detected in zone ${sector}`,
        severity: isSectorAnomaly ? 'high' : 'medium'
      });
      if (profile.historicalAnomalies.length > 20) {
        profile.historicalAnomalies.shift();
      }
      
      profile.highRiskActionsCount++;
      logger.warn(`[BehavioralProfiler] Anomaly tracked for ${username}: ${anomalyText}`);
    }

    // Accumulate metrics
    profile.averageBytesTransferred = Math.round((profile.averageBytesTransferred * 9 + sizeBytes) / 10);
    return { isHourAnomaly, isSectorAnomaly };
  }
}

export const behavioralProfiler = BehavioralProfiler.getInstance();
