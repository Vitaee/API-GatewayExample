import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache, 
  ) {}

  async get(key: string): Promise<any> {
    return this.cacheManager.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
    this.logger.debug(`Cached key=${key}, TTL=${ttl ?? 'default'}s`);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
    this.logger.debug(`Deleted cache key=${key}`);
  }

  async reset(): Promise<void> {
    await this.cacheManager.clear();
    this.logger.debug('Cache reset');
  }
}
