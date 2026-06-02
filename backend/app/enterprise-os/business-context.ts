import { EnterpriseImpactEvaluation } from './types';
import { enterpriseRegistry } from './enterprise-registry';

export class BusinessContext {
  private static instance: BusinessContext;

  private constructor() {}

  public static getInstance(): BusinessContext {
    if (!BusinessContext.instance) {
      BusinessContext.instance = new BusinessContext();
    }
    return BusinessContext.instance;
  }

  /**
   * Translates system incidents & active node issues into clear organizational risk metrics
   */
  public evaluateImpact(nodeId: string): EnterpriseImpactEvaluation {
    const node = enterpriseRegistry.getNodeById(nodeId);
    if (!node) {
      return {
        operationalImpactScore: 10,
        financialImpactUSD: 0,
        organizationalImpactScore: 5,
        dependencyImpactScore: 10,
        affectedNodesCount: 1,
        mitigationComplexity: 'low',
        remedies: ['Verify entity exists in the registry.']
      };
    }

    let operationalImpactScore = 20;
    let financialImpactUSD = 1500;
    let organizationalImpactScore = 15;
    let dependencyImpactScore = 15;
    let mitigationComplexity: 'low' | 'medium' | 'high' | 'critical' = 'low';
    const remedies: string[] = [];

    // Calculate cascading dependencies based on targets
    const directAdjacencies = enterpriseRegistry.getEdgesForNode(nodeId);
    const affectedNodesCount = directAdjacencies.length + 1;

    switch (node.type) {
      case 'employee':
        if (node.id === 'usr-wright') {
          operationalImpactScore = 75;
          financialImpactUSD = 45000;
          organizationalImpactScore = 80;
          dependencyImpactScore = 65;
          mitigationComplexity = 'high';
          remedies.push('Trigger instant credential revocation protocol inside Okta.');
          remedies.push('Notify Security Operations of concurrent session geolocation threat.');
          remedies.push('Require secure manual credential verification with managers.');
        } else {
          operationalImpactScore = 20;
          financialImpactUSD = 2000;
          remedies.push('Conduct standard identity access logs investigation.');
        }
        break;

      case 'application':
        if (node.id === 'app-payroll') {
          operationalImpactScore = 90;
          financialImpactUSD = 125000;
          organizationalImpactScore = 85;
          dependencyImpactScore = 90;
          mitigationComplexity = 'critical';
          remedies.push('Redirect client traffic to redundant hot standby cluster.');
          remedies.push('Enforce strict VPN security access policies for all app users.');
        } else {
          operationalImpactScore = 50;
          financialImpactUSD = 15000;
          mitigationComplexity = 'medium';
          remedies.push('Analyze node CPU and transaction latency streams.');
        }
        break;

      case 'database':
        if (node.id === 'payroll-db') {
          operationalImpactScore = 95;
          financialImpactUSD = 280000;
          organizationalImpactScore = 90;
          dependencyImpactScore = 95;
          mitigationComplexity = 'critical';
          remedies.push('Perform instant cold backup snapshot validation check.');
          remedies.push('Limit read/write operations to authenticated enterprise systems exclusively.');
        } else {
          operationalImpactScore = 60;
          financialImpactUSD = 30000;
          mitigationComplexity = 'high';
          remedies.push('Check DB query thread count limits.');
        }
        break;

      case 'infrastructure':
        operationalImpactScore = 85;
        financialImpactUSD = 85000;
        organizationalImpactScore = 50;
        dependencyImpactScore = 85;
        mitigationComplexity = 'high';
        remedies.push('Implement k8s network policy quarantine parameters instantly.');
        remedies.push('Reprovision ingress pods from immutable safe master image.');
        break;

      case 'bu':
        operationalImpactScore = 95;
        financialImpactUSD = 500000;
        organizationalImpactScore = 95;
        dependencyImpactScore = 95;
        mitigationComplexity = 'critical';
        remedies.push('Notify Board of Directors regarding Line of Business operational degradation.');
        break;

      default:
        operationalImpactScore = 30;
        financialImpactUSD = 5000;
        mitigationComplexity = 'medium';
        remedies.push('Verify baseline configurations of general cloud resources.');
        break;
    }

    return {
      operationalImpactScore,
      financialImpactUSD,
      organizationalImpactScore,
      dependencyImpactScore,
      affectedNodesCount,
      mitigationComplexity,
      remedies
    };
  }
}

export const businessContext = BusinessContext.getInstance();
