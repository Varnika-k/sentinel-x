import { GraphNodeState } from '../../simulation/graph-intelligence';
import { logger } from '../../core/logger';
import { temporalMemoryEngine } from '../ai/memory-engine';

export interface SecurityPolicy {
  id: string;
  name: string;
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  validate(node: GraphNodeState): { valid: boolean; message: string };
}

export class PolicyEngine {
  private policies: SecurityPolicy[] = [];

  constructor() {
    this.registerDefaultPolicies();
  }

  private registerDefaultPolicies() {
    // Policy 1: Authentication API boundaries
    this.policies.push({
      id: 'POL-SEC-01',
      name: 'Authentication API boundary isolation',
      category: 'Network Isolation',
      severity: 'critical',
      validate: (node: GraphNodeState) => {
        if (node.name === 'k8s-pod-auth-api-559b' && node.status === 'infected') {
          return { valid: false, message: 'Core Auth container has infected status - violates isolation.' };
        }
        return { valid: true, message: 'Auth containment boundary is intact.' };
      }
    });

    // Policy 2: Sensitive asset vulnerability threshold
    this.policies.push({
      id: 'POL-SEC-02',
      name: 'Crown Jewel vulnerability lock',
      category: 'Vulnerability Management',
      severity: 'high',
      validate: (node: GraphNodeState) => {
        if (node.containsSensitiveAssets && node.trustScore < 50) {
          return { valid: false, message: `Sensitive asset [${node.name}] trust score dropped below 50 requirement.` };
        }
        return { valid: true, message: 'All sensitive asset trust metrics comply with enterprise guidelines.' };
      }
    });

    // Policy 3: Abnormal behavior activity limits
    this.policies.push({
      id: 'POL-SEC-03',
      name: 'Credential abuse risk blocker',
      category: 'Identity Access',
      severity: 'high',
      validate: (node: GraphNodeState) => {
        if (node.abnormalBehaviorScore && node.abnormalBehaviorScore > 70) {
          return { valid: false, message: `Identity / asset [${node.name}] exhibits severe abnormal behavior [${node.abnormalBehaviorScore}/100].` };
        }
        return { valid: true, message: 'Abnormal behavior risk bounds are within nominal levels.' };
      }
    });
  }

  public auditNodePolicies(node: GraphNodeState): {
    nodeId: string;
    compliant: boolean;
    brokenPolicies: string[];
    severityLevel: 'low' | 'medium' | 'high' | 'critical';
  } {
    const brokenPolicies: string[] = [];
    let worstSeverity: 'low' | 'medium' | 'high' | 'critical' = 'low';

    this.policies.forEach(policy => {
      const result = policy.validate(node);
      if (!result.valid) {
        brokenPolicies.push(`[${policy.id}] ${policy.name}: ${result.message}`);
        worstSeverity = this.escalateSeverity(worstSeverity, policy.severity);
        
        // Record policy violation in memory engine
        temporalMemoryEngine.recordGovernanceViolation({
          id: `VIOL-${Date.now().toString().slice(-4)}`,
          nodeId: node.name,
          policyId: policy.id,
          timestamp: new Date().toISOString(),
          rule: policy.name,
          severity: policy.severity
        });
      }
    });

    return {
      nodeId: node.name,
      compliant: brokenPolicies.length === 0,
      brokenPolicies,
      severityLevel: worstSeverity
    };
  }

  private escalateSeverity(
    current: 'low' | 'medium' | 'high' | 'critical',
    next: 'low' | 'medium' | 'high' | 'critical'
  ): 'low' | 'medium' | 'high' | 'critical' {
    const order = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    return (order[next] > order[current]) 
      ? next 
      : current;
  }
}

export const policyEngine = new PolicyEngine();
