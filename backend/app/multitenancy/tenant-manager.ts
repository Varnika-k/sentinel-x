import { TenantSession } from './tenant-context';
import { logger } from '../core/logger';
import { redisManager } from '../core/redis';

export interface TenantMetadata {
  id: string;
  name: string;
  tier: 'ESSENTIALS' | 'ENTERPRISE' | 'ZERO_TRUST_GOV';
  status: 'ACTIVE' | 'SUSPENDED' | 'MAINTENANCE';
  createdAt: string;
  contactEmail: string;
}

export class TenantManager {
  private static instance: TenantManager;
  
  // Real local directory of bootstrap tenants
  private tenantsList: Map<string, TenantSession & TenantMetadata> = new Map();

  private constructor() {
    this.bootstrapTenants();
  }

  public static getInstance(): TenantManager {
    if (!TenantManager.instance) {
      TenantManager.instance = new TenantManager();
    }
    return TenantManager.instance;
  }

  private bootstrapTenants() {
    // 1. Enterprise Acme Corp
    this.registerTenantInternal({
      id: "tenant-acme-hq",
      tenantId: "tenant-acme-hq",
      name: "Acme Federated Corp",
      tier: "ENTERPRISE",
      status: "ACTIVE",
      createdAt: "2026-01-10T00:00:00Z",
      contactEmail: "security-ops@acme.corp",
      permissions: ["READ_TELEMETRY", "TRIGGER_MITIGATION", "SIMULATE_SCENARIOS", "MANAGE_CONNECTORS"],
      governanceProfile: {
        dataRetentionDays: 90,
        auditLevel: "STRICT_AUDIT",
        complianceFrameworks: ["SOC2", "ISO27001"],
        encryptionKeyArn: "arn:aws:kms:us-east-1:123456789012:key/acme-master-key"
      },
      aiOverrideConfig: {
        customModelName: "gemini-2.5-pro",
        temperatureMultiplier: 0.7,
        contentFilterLevel: "HIGH"
      }
    });

    // 2. High-Assurance Zero-Trust Gov
    this.registerTenantInternal({
      id: "tenant-shield-defense",
      tenantId: "tenant-shield-defense",
      name: "Shield Cyber Defense Division",
      tier: "ZERO_TRUST_GOV",
      status: "ACTIVE",
      createdAt: "2025-05-15T00:00:00Z",
      contactEmail: "ciso@gov.defense.hq",
      permissions: ["READ_TELEMETRY", "TRIGGER_MITIGATION", "SIMULATE_SCENARIOS", "MANAGE_CONNECTORS", "BYPASS_STANDARD_ISOLATION", "HARDENED_COMPLIANCE_AUDIT"],
      governanceProfile: {
        dataRetentionDays: 365,
        auditLevel: "ZERO_TRUST",
        complianceFrameworks: ["FEDRAMP", "ISO27001"],
        encryptionKeyArn: "arn:aws:kms:us-gov-west-1:555555555555:key/shield-hardware-hsm"
      },
      aiOverrideConfig: {
        customModelName: "gemini-2.5-pro",
        temperatureMultiplier: 0.2,
        contentFilterLevel: "MAXIMUM_RESTRICTED"
      }
    });

    // 3. Essentials Startup
    this.registerTenantInternal({
      id: "tenant-novacode-dev",
      tenantId: "tenant-novacode-dev",
      name: "NovaCode Inc.",
      tier: "ESSENTIALS",
      status: "ACTIVE",
      createdAt: "2026-03-22T00:00:00Z",
      contactEmail: "ops@novacode.io",
      permissions: ["READ_TELEMETRY", "SIMULATE_SCENARIOS"],
      governanceProfile: {
        dataRetentionDays: 30,
        auditLevel: "STANDARD",
        complianceFrameworks: ["SOC2"]
      }
    });
  }

  private registerTenantInternal(tenant: TenantSession & TenantMetadata) {
    this.tenantsList.set(tenant.id, tenant);
    logger.info(`[TenantManager] Bootstrapped multi-tenant logical partitioning metadata for: [${tenant.id}] (${tenant.name})`);
  }

  /**
   * Resolve runtime tenant session context.
   */
  public resolveTenantSession(tenantId: string): TenantSession | null {
    const t = this.tenantsList.get(tenantId);
    if (!t) return null;
    if (t.status !== 'ACTIVE') {
      logger.warn(`[TenantManager] Prevented session routing to tenant [${tenantId}] - Status is ${t.status}`);
      return null;
    }
    return {
      tenantId: t.id,
      name: t.name,
      tier: t.tier,
      permissions: t.permissions,
      governanceProfile: t.governanceProfile,
      aiOverrideConfig: t.aiOverrideConfig
    };
  }

  /**
   * Lists all meta-context data for registered tenant scopes.
   */
  public listAllTenantMetadata(): TenantMetadata[] {
    return Array.from(this.tenantsList.values()).map(t => ({
      id: t.id,
      name: t.name,
      tier: t.tier,
      status: t.status,
      createdAt: t.createdAt,
      contactEmail: t.contactEmail
    }));
  }

  /**
   * Validates if a tenant is authorized for a specific resource action.
   */
  public checkTenantPermission(tenantId: string, permission: string): boolean {
    const session = this.resolveTenantSession(tenantId);
    if (!session) return false;
    return session.permissions.includes(permission);
  }

  /**
   * Retrieves separate, isolated Redis namespace indices or prefixes for keys.
   */
  public getTenantCacheNamespace(tenantId: string): string {
    const session = this.resolveTenantSession(tenantId);
    if (!session) throw new Error(`[TenantIsolationViolation] Unregistered tenant routing key: ${tenantId}`);
    return `tenant:${session.tenantId}`;
  }

  /**
   * Directs tenant-level telemetry buffers into dedicated log paths or message streams.
   */
  public getTenantTelemetryQueue(tenantId: string): string {
    const session = this.resolveTenantSession(tenantId);
    if (!session) throw new Error(`[TenantIsolationViolation] Telemetry pipeline rejected for invalid tenant key: ${tenantId}`);
    return `sentinelx:telemetry:${session.tenantId}`;
  }

  /**
   * Provides isolated AI context embeddings, injecting tenant boundaries.
   */
  public compileAiContextDirectives(tenantId: string, baseInstruction: string): string {
    const session = this.resolveTenantSession(tenantId);
    if (!session) return baseInstruction;

    const complianceStr = session.governanceProfile.complianceFrameworks.join(', ');
    const boundaryDirectives = `
========================================
MULTI-TENITY SYSTEM DIRECTIVES:
- CURRENT TENANT NAME: ${session.name}
- TENANT ID PARTITION: ${session.tenantId}
- SERVICE LEVEL TIER: ${session.tier}
- DATA RETENTION PLAN: ${session.governanceProfile.dataRetentionDays} days
- ACTIVE COMPLIANCE BOUNDARY: [${complianceStr}]
- AI SAFETY RATING: ${session.aiOverrideConfig?.contentFilterLevel || 'STANDARD'}
========================================
COMPLIANCE AND SAFETY LAW:
You MUST NOT disclose or leak information relating to other organization profiles. 
All reasoning calculations must align with ${complianceStr} policies.
Base security level set to: ${session.governanceProfile.auditLevel}.

${baseInstruction}
`;
    return boundaryDirectives;
  }
}

export const tenantManager = TenantManager.getInstance();
