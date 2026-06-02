import { logger } from '../core/logger';

export class DistributedCache {
  private static instance: DistributedCache;
  private store: Map<string, { value: any; expiresAt: number }> = new Map();

  private constructor() {
    // Start automated TTL cleanup interval
    setInterval(() => this.cleanupExpired(), 30000);
  }

  public static getInstance(): DistributedCache {
    if (!DistributedCache.instance) {
      DistributedCache.instance = new DistributedCache();
    }
    return DistributedCache.instance;
  }

  public set(key: string, value: any, ttlMs: number = 600000): void {
    const expiresAt = Date.now() + ttlMs;
    this.store.set(key, { value, expiresAt });
  }

  public get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  public delete(key: string): void {
    this.store.delete(key);
  }

  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  private cleanupExpired(): void {
    const now = Date.now();
    for (const [key, item] of this.store.entries()) {
      if (now > item.expiresAt) {
        this.store.delete(key);
      }
    }
    logger.debug(`[DistributedCache] Cleaned up expired cache entries. Current items count: ${this.store.size}`);
  }
}

export const distributedCache = DistributedCache.getInstance();
