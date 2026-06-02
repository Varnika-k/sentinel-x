import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../security/auth-guard';
import { tenantLocalStorage, TenantSession } from './tenant-context';
import { tenantManager } from './tenant-manager';
import { logger } from '../core/logger';

export interface TenantedRequest extends AuthenticatedRequest {
  tenant?: TenantSession;
  tenantId?: string;
}

/**
 * Express middleware to isolate tenant requests and attach safe contextual boundaries.
 */
export function multiTenantInterceptor(req: TenantedRequest, res: Response, next: NextFunction): void {
  // 1. Resolve tenant identity from standard enterprise headers
  let tenantId = req.headers['x-tenant-id'] as string;

  // Fallback for demo or development clients via query strings or authorization claims
  if (!tenantId && req.query.tenantId) {
    tenantId = req.query.tenantId as string;
  }

  // If no tenant context is provided, default to Acme Corp in non-production,
  // or return an un-partitioned request error in strict production profiles
  if (!tenantId) {
    if (process.env.DEPLOYMENT_PROFILE === 'production') {
      logger.error('[TenantMiddleware] Request rejected. Missing mandatory X-Tenant-ID header parameter under production constraints.');
      res.status(400).json({
        error: 'Multi-Tenant Partition Missing',
        message: 'Strict security context requires valid X-Tenant-ID header mapping.'
      });
      return;
    }
    // Safe standard fallback in test/local profiles
    tenantId = 'tenant-acme-hq';
  }

  // 2. Validate tenant status and fetch permissions / governance metadata
  const session = tenantManager.resolveTenantSession(tenantId);
  if (!session) {
    logger.warn(`[TenantMiddleware] Security Block: Access denied for unregistered or suspended tenant footprint: [${tenantId}]`);
    res.status(403).json({
      error: 'Unregistered Tennancy Workspace',
      message: 'The requested tenant identifier was either closed, suspended, or does not exist.'
    });
    return;
  }

  // 3. Attach tenant information to the Express Request payload
  req.tenant = session;
  req.tenantId = session.tenantId;

  // 4. Run downstream middleware pipeline nested fully inside the AsyncLocalStorage zone
  tenantLocalStorage.run(session, () => {
    next();
  });
}

/**
 * Access guard enforcing specific tenant-tier conditions or permissions.
 */
export function requireTenantPermission(permission: string) {
  return (req: TenantedRequest, res: Response, next: NextFunction): void => {
    if (!req.tenant) {
      res.status(403).json({
        error: 'Forbidden Policy Violaton',
        message: 'Request not correlated to an active tenant workspace.'
      });
      return;
    }

    const hasPermission = req.tenant.permissions.includes(permission);
    if (!hasPermission) {
      logger.warn(`[TenantSecurityAudit] Tenant '${req.tenantId}' was denied access to permission '${permission}' for request on ${req.originalUrl}`);
      res.status(403).json({
        error: 'Access Refused',
        message: `Tenant tier lacks requested capability clearance: '${permission}'`
      });
      return;
    }

    next();
  };
}
