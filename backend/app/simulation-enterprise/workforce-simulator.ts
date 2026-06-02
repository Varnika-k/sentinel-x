import { dependencySimulator, EnterpriseEntity } from './dependency-simulator';

export interface WorkforceSimulationResult {
  disabledNodeIds: string[];
  degradedNodeIds: string[];
  recoveryMultiplier: number;
  unauthorizedAccessEvents: Array<{ employeeName: string; action: string; severity: 'critical' | 'high' | 'medium' }>;
  workforceContinuity: number; // Percentage 0-100 indicating active staffing level
}

export class WorkforceSimulator {
  public simulateWorkforceEvent(eventType: string, targetId: string): WorkforceSimulationResult {
    const disabledNodeIds: string[] = [];
    const degradedNodeIds: string[] = [];
    let recoveryMultiplier = 1.0;
    const unauthorizedAccessEvents: any[] = [];
    let workforceContinuity = 100;

    switch (eventType) {
      case 'employee_departure': {
        // Find corresponding employee
        if (targetId === 'emp-devops-lead') {
          // Principal DevOps Architect leaves - critical impact on EKS clusters and deployment approvals!
          disabledNodeIds.push('gov-dual-signoff'); // Cannot deploy without his sign-off
          degradedNodeIds.push('infra-k8s-cluster'); // Kubernetes configuration is degraded
          recoveryMultiplier = 3.5; // Massive drag on code recoveries without deployment architect
          workforceContinuity = 85; 
        } else if (targetId === 'emp-compl-officer') {
          disabledNodeIds.push('biz-compliance-audit'); // Compliance audit fails completely
          recoveryMultiplier = 2.0; 
          workforceContinuity = 90;
        } else {
          degradedNodeIds.push('biz-technical-on-call');
          recoveryMultiplier = 1.5;
          workforceContinuity = 95;
        }
        break;
      }
      case 'department_reduction': {
        // Staff Downsizing in Engineering or IT operations
        if (targetId === 'dept-eng') {
          degradedNodeIds.push('app-checkout-gateway');
          degradedNodeIds.push('app-portal-client');
          recoveryMultiplier = 2.0;
          workforceContinuity = 60;
        } else if (targetId === 'dept-ops') {
          degradedNodeIds.push('infra-k8s-cluster');
          degradedNodeIds.push('infra-border-router');
          recoveryMultiplier = 2.5;
          workforceContinuity = 50;
        } else {
          workforceContinuity = 75;
        }
        break;
      }
      case 'access_revocation': {
        // Administrative accounts locked out
        disabledNodeIds.push('gov-zero-trust-auth');
        disabledNodeIds.push('id-saml-sso');
        recoveryMultiplier = 2.0; // Nobody can log in to fix issues!
        workforceContinuity = 90;
        break;
      }
      case 'insider_threat': {
        // Rogue employee actions
        disabledNodeIds.push('gov-soc2-logging'); // Insider disables logging to cover tracks
        degradedNodeIds.push('db-customer-metastore');
        degradedNodeIds.push('id-domain-controller');
        unauthorizedAccessEvents.push({
          employeeName: 'compromised-insider',
          action: 'Extracted 4.2GB Customer profile files to external hosting',
          severity: 'critical'
        });
        workforceContinuity = 95;
        break;
      }
      case 'identity_compromise': {
        // Rogue session hijacking
        disabledNodeIds.push('id-domain-controller');
        disabledNodeIds.push('id-saml-sso');
        degradedNodeIds.push('infra-azure-ad');
        unauthorizedAccessEvents.push({
          employeeName: 'External Adversary (Hijacked Marcus Vance Session)',
          action: 'Bypassed FIDO2 MFA using session token injection',
          severity: 'high'
        });
        workforceContinuity = 98;
        break;
      }
      default:
        break;
    }

    return {
      disabledNodeIds,
      degradedNodeIds,
      recoveryMultiplier,
      unauthorizedAccessEvents,
      workforceContinuity
    };
  }
}

export const workforceSimulator = new WorkforceSimulator();
