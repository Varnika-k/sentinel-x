import { EnterpriseEntity } from './dependency-simulator';

export interface BusinessSimulationResult {
  operationalContinuity: number; // 0-100% indicating average asset uptime
  financialLossPerHrUSD: number; // accumulated hourly losses based on business outages
  customerImpactScore: number;    // 0-100% indicating customer frustration levels (0 = happy, 100 = leaving)
  executiveVisibility: 'BOARD_CRISIS' | 'C_SUITE_WAR_ROOM' | 'IMPAIRED_DIRECTOR' | 'STANDARD_MONITORING';
  slaBreachRate: number;         // 0-100% of missed service commitments
  vulnerableRevenueUSD: number;  // total vulnerable business value at risk
}

export class BusinessSimulator {
  public evaluateBusinessImpact(
    nodesState: Map<string, 'nominal' | 'degraded' | 'disabled'>,
    entities: EnterpriseEntity[]
  ): BusinessSimulationResult {
    let nominalCount = 0;
    let degradedCount = 0;
    let disabledCount = 0;
    let financialLossPerHrUSD = 0;
    let vulnerableRevenueUSD = 0;

    entities.forEach(entity => {
      const state = nodesState.get(entity.id) || 'nominal';
      if (state === 'nominal') {
        nominalCount++;
      } else if (state === 'degraded') {
        degradedCount++;
        // Degraded business functions bleed 40% of their revenue capacity
        if (entity.type === 'business_function' && entity.revenuePerHr) {
          financialLossPerHrUSD += entity.revenuePerHr * 0.4;
          vulnerableRevenueUSD += entity.revenuePerHr;
        }
      } else if (state === 'disabled') {
        disabledCount++;
        // Disabled business functions lose 100% of their revenue capacity
        if (entity.type === 'business_function' && entity.revenuePerHr) {
          financialLossPerHrUSD += entity.revenuePerHr;
          vulnerableRevenueUSD += entity.revenuePerHr;
        }
      }
    });

    const totalNodes = entities.length;
    const operationalContinuity = Math.round(
      ((nominalCount * 1.0 + degradedCount * 0.5) / totalNodes) * 100
    );

    // Calculate customer impact score based on customer-facing utilities (Checkout, Portal, Tech On-Call)
    let customerFrustration = 0;
    const checkoutState = nodesState.get('biz-merchant-checkout') || 'nominal';
    const portalState = nodesState.get('biz-onboarding') || 'nominal';
    const supportState = nodesState.get('biz-technical-on-call') || 'nominal';

    if (checkoutState === 'disabled') customerFrustration += 60;
    else if (checkoutState === 'degraded') customerFrustration += 25;

    if (portalState === 'disabled') customerFrustration += 25;
    else if (portalState === 'degraded') customerFrustration += 10;

    if (supportState === 'disabled') customerFrustration += 15;
    else if (supportState === 'degraded') customerFrustration += 5;

    const customerImpactScore = Math.min(100, customerFrustration);

    // Compute SLA breach rate
    let slaBreachRate = 0;
    if (supportState === 'disabled' || nodesState.get('dept-support') === 'disabled') {
      slaBreachRate = 100;
    } else if (supportState === 'degraded' || checkoutState === 'disabled') {
      slaBreachRate = 65;
    } else if (checkoutState === 'degraded' || portalState === 'degraded') {
      slaBreachRate = 20;
    }

    // Determine executive visibility level
    let executiveVisibility: 'BOARD_CRISIS' | 'C_SUITE_WAR_ROOM' | 'IMPAIRED_DIRECTOR' | 'STANDARD_MONITORING' = 'STANDARD_MONITORING';
    if (financialLossPerHrUSD > 10000 || disabledCount > 4) {
      executiveVisibility = 'BOARD_CRISIS';
    } else if (financialLossPerHrUSD > 3000 || degradedCount > 4) {
      executiveVisibility = 'C_SUITE_WAR_ROOM';
    } else if (financialLossPerHrUSD > 0 || disabledCount > 0) {
      executiveVisibility = 'IMPAIRED_DIRECTOR';
    }

    return {
      operationalContinuity,
      financialLossPerHrUSD,
      customerImpactScore,
      executiveVisibility,
      slaBreachRate,
      vulnerableRevenueUSD
    };
  }
}

export const businessSimulator = new BusinessSimulator();
