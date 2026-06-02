export interface TimelineMilestone {
  timeframe: '1_hour' | '1_day' | '1_week' | '1_month' | '3_months';
  label: string;
  cumulativeCostUSD: number;
  recoveryPercentage: number; // 0-100 indicating operational restoration
  activeLossRatePerHr: number;
  complianceDriftIndex: number; // 0-100 where higher is worse
  customerSatisfaction: number; // 0-100 where higher is better
  alertLevel: 'INFO' | 'WARNING' | 'CRITICAL' | 'CATASTROPHIC';
}

export class TimelineSimulator {
  public projectTimeline(
    initialLossRatePerHr: number,
    initialComplianceScore: number,
    recoveryMultiplier: number,
    hasActiveViolations: boolean
  ): TimelineMilestone[] {
    const milestones: TimelineMilestone[] = [];
    
    // Estimate standard nominal recovery speed in hours based on complexity
    // e.g., if there's an initial loss of $12,500/hr, it is high complexity. If $0, it is minor.
    let baseRecoveryTimeHrs = 12;
    if (initialLossRatePerHr > 10000) baseRecoveryTimeHrs = 72; // AWS cluster / major DB failure
    else if (initialLossRatePerHr > 3000) baseRecoveryTimeHrs = 36;
    else if (initialLossRatePerHr > 0) baseRecoveryTimeHrs = 18;

    if (initialComplianceScore < 70) baseRecoveryTimeHrs += 48; // Policy audits delay restoration

    // Final total recovery time in hours adjusted by the workforce multiplier (e.g. key employee vacancy)
    const activeRecoveryHrs = baseRecoveryTimeHrs * recoveryMultiplier;

    // Define intervals to simulate in elapsed hours
    const intervals: Array<{ id: '1_hour' | '1_day' | '1_week' | '1_month' | '3_months'; value: number; label: string }> = [
      { id: '1_hour', value: 1, label: '1 Hour' },
      { id: '1_day', value: 24, label: '1 Day' },
      { id: '1_week', value: 168, label: '1 Week' },
      { id: '1_month', value: 720, label: '1 Month' },
      { id: '3_months', value: 2160, label: '3 Months' }
    ];

    let runningCost = 0;
    let prevHours = 0;

    intervals.forEach(interval => {
      const hours = interval.value;
      const hoursDiff = hours - prevHours;

      // Calculate state at this elapsed hour
      // 1. Recovery Curve: logarithmic restoration
      let recoveryPercentage = Math.min(100, Math.round((hours / activeRecoveryHrs) * 100));
      if (hours >= activeRecoveryHrs) {
        recoveryPercentage = 100;
      }

      // 2. Active Loss Rate: as recovery progresses, loss matches active exposure left
      // e.g., if 80% recovered, we only bleed 20% of initial rate.
      const activeLossRatePerHr = recoveryPercentage === 100 ? 0 : initialLossRatePerHr * (1 - (recoveryPercentage / 100));

      // 3. Cumulate finance damage over this timeframe interval (average loss during interval)
      const avgLossInInterval = ( (initialLossRatePerHr * (1 - (Math.min(prevHours, activeRecoveryHrs) / activeRecoveryHrs))) + 
                                  (initialLossRatePerHr * (1 - (Math.min(hours, activeRecoveryHrs) / activeRecoveryHrs))) ) / 2;
      
      const intervalCostUSD = (hours > activeRecoveryHrs && prevHours < activeRecoveryHrs)
        ? (activeRecoveryHrs - prevHours) * ((initialLossRatePerHr + 0) / 2) // only bleed up to completion
        : hoursDiff * activeLossRatePerHr;

      runningCost += intervalCostUSD;

      // Check external compliance compounding laws (fines kick in after prolonged neglect)
      let complianceFines = 0;
      if (hasActiveViolations) {
        if (hours >= 24) complianceFines += 5000; // FTC filing delay penalty
        if (hours >= 168) complianceFines += 25000; // HIPAA audit launch fine
        if (hours >= 720) complianceFines += 100000; // GDPR penalty fine
        if (hours >= 2160) complianceFines += 350000; // Catastrophic non-compliance board penalties
      }
      runningCost += complianceFines;

      // 4. Compliance Drift Index (higher numbers indicate escalating security exposure/audit failure)
      let complianceDriftIndex = 100 - initialComplianceScore;
      if (hours < activeRecoveryHrs) {
        // drift gets worse due to hurried diagnostic bypasses and temporary backdoors
        complianceDriftIndex = Math.min(100, complianceDriftIndex * 1.3);
      } else {
        // once recovered, security postures reset slowly
        complianceDriftIndex = Math.max(0, Math.round((100 - initialComplianceScore) * 0.3));
      }

      // 5. Customer Satisfaction Curve: drops based on downtime length
      let customerSatisfaction = 100;
      if (hours < activeRecoveryHrs) {
        // ongoing downtime drops satisfaction quickly
        const dropFactor = initialLossRatePerHr > 10000 ? 0.4 : 0.15;
        customerSatisfaction = Math.max(10, Math.round(100 - (hours * dropFactor)));
      } else {
        // after system comes back, client satisfaction recovers only partially (trust is broken)
        const penaltyAtRecovery = Math.max(10, Math.round(100 - (activeRecoveryHrs * (initialLossRatePerHr > 10000 ? 0.3 : 0.1))));
        customerSatisfaction = Math.round(penaltyAtRecovery + ((100 - penaltyAtRecovery) * 0.4));
      }

      // 6. Set Alert Level matching Cost & Downtime
      let alertLevel: 'INFO' | 'WARNING' | 'CRITICAL' | 'CATASTROPHIC' = 'INFO';
      if (runningCost > 1500000 || customerSatisfaction < 30) {
        alertLevel = 'CATASTROPHIC';
      } else if (runningCost > 250000 || customerSatisfaction < 60) {
        alertLevel = 'CRITICAL';
      } else if (runningCost > 10000) {
        alertLevel = 'WARNING';
      }

      milestones.push({
        timeframe: interval.id,
        label: interval.label,
        cumulativeCostUSD: Math.round(runningCost),
        recoveryPercentage,
        activeLossRatePerHr: Math.round(activeLossRatePerHr),
        complianceDriftIndex: Math.round(complianceDriftIndex),
        customerSatisfaction,
        alertLevel
      });

      prevHours = hours;
    });

    return milestones;
  }
}

export const timelineSimulator = new TimelineSimulator();
