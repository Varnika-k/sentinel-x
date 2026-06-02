import { UnifiedCorrelationAlert } from './types';

export class TemporalAnalyzer {
  private static defaultWindowMs = 300000; // 5 minutes sliding window

  /**
   * Evaluates if two events occur within the sliding temporal correlation window limit.
   */
  public static isWithinWindow(
    timeA: string | Date,
    timeB: string | Date,
    windowMs: number = this.defaultWindowMs
  ): boolean {
    const msA = new Date(timeA).getTime();
    const msB = new Date(timeB).getTime();
    return Math.abs(msA - msB) <= windowMs;
  }

  /**
   * Sorts and detects if there is a chronological/temporal progression of attack steps.
   */
  public static verifyStepProgression(alerts: UnifiedCorrelationAlert[]): boolean {
    if (alerts.length < 2) return false;

    // Sort chronologically
    const sorted = [...alerts].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Define chronological hierarchy mapping of MITRE tactics
    const stageWeight = {
      'recon': 1,
      'foothold': 2,
      'lateral': 3,
      'exfiltration': 4,
      'impact': 5
    };

    let progressionDetected = false;
    let highestWeight = 0;

    for (const alert of sorted) {
      if (alert.attackStage) {
        const weight = stageWeight[alert.attackStage] || 0;
        if (weight > highestWeight) {
          if (highestWeight > 0) {
            progressionDetected = true; // Stepped up stages sequentially!
          }
          highestWeight = weight;
        }
      }
    }

    return progressionDetected;
  }
}
