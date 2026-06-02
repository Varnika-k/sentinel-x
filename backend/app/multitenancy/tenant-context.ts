import { AsyncLocalStorage } from 'async_hooks';

export interface TenantSession {
  tenantId: string;
  name: string;
  tier: 'ESSENTIALS' | 'ENTERPRISE' | 'ZERO_TRUST_GOV';
  permissions: string[];
  governanceProfile: {
    dataRetentionDays: number;
    auditLevel: 'STANDARD' | 'STRICT_AUDIT' | 'ZERO_TRUST';
    complianceFrameworks: ('SOC2' | 'ISO27001' | 'HIPAA' | 'FEDRAMP')[];
    encryptionKeyArn?: string;
  };
  aiOverrideConfig?: {
    customModelName?: string;
    temperatureMultiplier?: number;
    contentFilterLevel: 'HIGH' | 'MAXIMUM_RESTRICTED';
  };
}

export const tenantLocalStorage = new AsyncLocalStorage<TenantSession>();

/**
 * Retrieves the current safe active Tenant Session.
 */
export function getTenantContext(): TenantSession | undefined {
  return tenantLocalStorage.getStore();
}

/**
 * Runs a block of executable instructions bound to a specific tenant context.
 */
export function runWithTenantContext<T>(session: TenantSession, fn: () => T): T {
  return tenantLocalStorage.run(session, fn);
}

/**
 * Assures tenant context is registered, otherwise throws a partition violation.
 */
export function requireTenantContext(): TenantSession {
  const ctx = getTenantContext();
  if (!ctx) {
    throw new Error('[TenantIsolationViolation] Attempted process access without active multi-tenant partitioning credentials.');
  }
  return ctx;
}
