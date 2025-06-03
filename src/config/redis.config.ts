/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      // eslint-disable-next-line @typescript-eslint/require-await
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST'),
        port: configService.get('REDIS_PORT'),
        password: configService.get('REDIS_PASSWORD'),
        ttl: configService.get('REDIS_TTL'),
        max: 100,
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class RedisCacheModule implements OnModuleInit {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    try {
      // Test connection with detailed monitoring
      const testKey = 'test-connection';
      const startTime = Date.now();

      // Test write operation
      console.log('Testing Redis write operation...');
      await this.cacheManager.set(
        testKey,
        { test: true, timestamp: startTime },
        60,
      );

      // Test read operation
      console.log('Testing Redis read operation...');
      const testValue = await this.cacheManager.get(testKey);
      const latency = Date.now() - startTime;

      // Test delete operation
      console.log('Testing Redis delete operation...');
      await this.cacheManager.del(testKey);

      // Log detailed connection status
      console.log('Redis Connection Status:', {
        success: (testValue as { test: boolean })?.test === true,
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        latency: `${latency}ms`,
        ttl: this.configService.get('REDIS_TTL'),
        maxConnections: 100,
        operations: {
          write: 'OK',
          read: !!testValue,
          delete: 'OK',
        },
        connectionDetails: {
          secured: !!this.configService.get('REDIS_PASSWORD'),
          globalCache: true,
          defaultTTL: this.configService.get('REDIS_TTL'),
        },
      });
    } catch (error) {
      console.error('Redis Connection Failed:', {
        error: error.message,
        host: this.configService.get('REDIS_HOST'),
        port: this.configService.get('REDIS_PORT'),
        timestamp: new Date().toISOString(),
        details: {
          name: error.name,
          code: error.code,
          stack: error.stack,
        },
      });
      throw error; // Prevent app start on Redis connection failure
    }
  }
}
