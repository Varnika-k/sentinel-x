import { WorkforceSimulationResult } from './workforce-simulator';
import { InfrastructureSimulationResult } from './infrastructure-simulator';
import { GovernanceSimulationResult } from './governance-simulator';
import { BusinessSimulationResult } from './business-simulator';
import { TimelineMilestone } from './timeline-simulator';

export interface ComprehensiveImpactReport {
  overallResilienceIndex: number; // 0-100 indicating general system immunity score
  operationalRating: 'CRITICAL_FAILURE' | 'SEVERE_DISRUPTION' | 'STRESSED_DEGRADATION' | 'NOMINAL';
  financialScoreUSD: number;     // Projected 30-day cumulative cost
  complianceSeverity: 'NONE' | 'MINOR_BYPASS' | 'REGULATORY_ALERT' | 'ENFORCEMENT_FINES';
  recoveryFrictionRating: 'EASY' | 'MODERATE' | 'COMPLEX' | 'SEVERE';
  retrospectives: string[];      // Bulleted text summarizing cascade effects
  customerFrustrationLevel: string; // Explanatory text matching scores
}

export class ImpactEngine {
  public compileImpactReport(
    workforce: WorkforceSimulationResult,
    infra: InfrastructureSimulationResult,
    governance: GovernanceSimulationResult,
    business: BusinessSimulationResult,
    timeline: TimelineMilestone[]
  ): ComprehensiveImpactReport {
    // 1. Financial Score is the projected cumulative cost at 1 month (720 hrs)
    const financialScoreUSD = timeline.find(m => m.timeframe === '1_month')?.cumulativeCostUSD || 0;

    // 2. Compute general Operational Rating
    let operationalRating: 'CRITICAL_FAILURE' | 'SEVERE_DISRUPTION' | 'STRESSED_DEGRADATION' | 'NOMINAL' = 'NOMINAL';
    if (business.operationalContinuity < 45) {
      operationalRating = 'CRITICAL_FAILURE';
    } else if (business.operationalContinuity < 75) {
      operationalRating = 'SEVERE_DISRUPTION';
    } else if (business.operationalContinuity < 98) {
      operationalRating = 'STRESSED_DEGRADATION';
    }

    // 3. Compute Compliance Severity
    let complianceSeverity: 'NONE' | 'MINOR_BYPASS' | 'REGULATORY_ALERT' | 'ENFORCEMENT_FINES' = 'NONE';
    if (governance.complianceScore < 60) {
      complianceSeverity = 'ENFORCEMENT_FINES';
    } else if (governance.complianceScore < 80) {
      complianceSeverity = 'REGULATORY_ALERT';
    } else if (governance.complianceScore < 98) {
      complianceSeverity = 'MINOR_BYPASS';
    }

    // 4. Compute Recovery Friction
    let recoveryFrictionRating: 'EASY' | 'MODERATE' | 'COMPLEX' | 'SEVERE' = 'EASY';
    if (workforce.recoveryMultiplier > 2.5 || timeline[2].recoveryPercentage < 50) {
      recoveryFrictionRating = 'SEVERE';
    } else if (workforce.recoveryMultiplier > 1.5 || timeline[1].recoveryPercentage < 75) {
      recoveryFrictionRating = 'COMPLEX';
    } else if (workforce.recoveryMultiplier > 1.0) {
      recoveryFrictionRating = 'MODERATE';
    }

    // 5. Generate descriptive retrospectives capturing cascading impact details
    const retrospectives: string[] = [];
    if (infra.disabledNodeIds.length > 0) {
      retrospectives.push(`Physical asset failure initiated at core resource dependencies.`);
    }
    if (workforce.workforceContinuity < 90) {
      retrospectives.push(`Staff availability degraded to ${workforce.workforceContinuity}%, compounding recovery duration by ${workforce.recoveryMultiplier.toFixed(1)}x.`);
    }
    if (governance.identifiedViolations.length > 0) {
      retrospectives.push(`Triggered ${governance.identifiedViolations.length} continuous compliance violations across ${governance.identifiedViolations.map(v => v.standard).join('/')} frameworks.`);
    }
    if (business.financialLossPerHrUSD > 0) {
      retrospectives.push(`Outages translated into active real-time business losses of $${business.financialLossPerHrUSD.toLocaleString()}/hour.`);
    }
    if (financialScoreUSD > 100000) {
      retrospectives.push(`Compounding 30-day corporate exposure exceeds $${financialScoreUSD.toLocaleString()} USD including potential regulatory delay fines.`);
    }

    if (retrospectives.length === 0) {
      retrospectives.push('Continuous operational baseline maintained with zero system-wide cascading impairments.');
    }

    // 6. Define Customer Frustration Text
    let customerFrustrationLevel = 'Happy / Nominal trust scores';
    if (business.customerImpactScore > 80) {
      customerFrustrationLevel = 'Critical threat / Active churn initiated / Mass ticketing SLA failures';
    } else if (business.customerImpactScore > 50) {
      customerFrustrationLevel = 'High frustration / Slow response times / Public status page updates required';
    } else if (business.customerImpactScore > 15) {
      customerFrustrationLevel = 'Mild localized latency / Operational portals slightly delayed';
    }

    // 7. Compute consolidated Overall Resilience Index (integrated average of positive drivers)
    const overallResilienceIndex = Math.max(
      10,
      Math.round(
        (business.operationalContinuity * 0.35) + 
        (governance.complianceScore * 0.25) + 
        (workforce.workforceContinuity * 0.15) + 
        ((100 - business.customerImpactScore) * 0.25)
      )
    );

    return {
      overallResilienceIndex,
      operationalRating,
      financialScoreUSD,
      complianceSeverity,
      recoveryFrictionRating,
      retrospectives,
      customerFrustrationLevel
    };
  }
}

export const impactEngine = new ImpactEngine();
