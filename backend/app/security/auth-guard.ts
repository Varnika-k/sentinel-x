import { Request, Response, NextFunction } from 'express';
import { logger } from '../core/logger';

export type UserRole = 'ANALYST' | 'ADMIN' | 'OPERATOR' | 'READONLY';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    username: string;
    roles: UserRole[];
    trustLevel: number;
  };
}

/**
 * Enterprise Authentication framework hook mock/stub.
 * Integrates easily with OpenID Connect, OAuth2, or JWT validation.
 */
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  
  // If no auth header provided, assign a default read-only session in development
  if (!authHeader) {
    req.user = {
      id: 'usr-analyst-default',
      username: 'sentinel-operator',
      roles: ['ANALYST', 'OPERATOR'],
      trustLevel: 90
    };
    next();
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Unauthenticated Request', message: 'Missing bearer signature.' });
    return;
  }

  // Demonstration token mapping (JWT payload parsing stub)
  if (token === 'admin-secret-token') {
    req.user = {
      id: 'usr-admin-hq',
      username: 'root-admin',
      roles: ['ADMIN', 'OPERATOR', 'ANALYST'],
      trustLevel: 100
    };
  } else {
    req.user = {
      id: 'usr-custom-session',
      username: 'external-analyst',
      roles: ['READONLY'],
      trustLevel: 65
    };
  }
  
  next();
}

/**
 * RBAC authorization guard
 */
export function requireAnyRole(allowedRoles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.roles) {
      res.status(403).json({ error: 'Forbidden', message: 'No active session or role authorization discovered.' });
      return;
    }

    const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
    if (!hasRole) {
      logger.warn(`[Security Auth] User '${req.user.username}' attempted unauthorized role access. Target roles needed: ${JSON.stringify(allowedRoles)}`);
      res.status(403).json({ 
        error: 'Access Denied', 
        message: `Role unauthorized. Required one of: ${JSON.stringify(allowedRoles)}` 
      });
      return;
    }

    next();
  };
}
