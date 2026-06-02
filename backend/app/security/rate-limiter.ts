import { Request, Response, NextFunction } from 'express';
import { redisManager } from '../core/redis';
import { logger } from '../core/logger';

interface RateLimitConfig {
  windowMs: number;
  max: number;
}

const memoryStore: Record<string, { count: number; resetTime: number }> = {};

export function createRateLimiter(config: RateLimitConfig) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const key = `ratelimit:${req.path}:${ip}`;

    const isMock = redisManager.getIsMock();
    const redisClient = redisManager.getClient();

    if (!isMock && redisClient) {
      try {
        // Redis-based sliding window or simple TTL counter
        const current = await redisClient.get(key);
        if (current && parseInt(current) >= config.max) {
          logger.warn(`[Security] Rate limit exceeded for IP ${ip} on path ${req.path}`);
          res.status(429).json({
            error: 'Too many requests',
            message: 'Rate limit exceeded. Please try again later.',
            retryAfterMs: config.windowMs
          });
          return;
        }

        if (!current) {
          await redisClient.set(key, 1, 'PX', config.windowMs);
        } else {
          await redisClient.incr(key);
        }
        next();
        return;
      } catch (err) {
        logger.error('[Security] Redis rate limiter error, falling back to local memory limit checking', err);
      }
    }

    // Fallback: Local In-Memory sliding-window rate limit check
    const now = Date.now();
    const record = memoryStore[key];
    
    if (!record || now > record.resetTime) {
      memoryStore[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };
      next();
      return;
    }

    record.count++;
    if (record.count > config.max) {
      logger.warn(`[Security - Local] Rate limit exceeded for IP ${ip} on path ${req.path}`);
      res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfterMs: record.resetTime - now
      });
      return;
    }

    next();
  };
}
