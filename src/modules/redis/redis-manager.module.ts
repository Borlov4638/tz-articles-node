import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Global, Module } from '@nestjs/common';

import { redisOptions } from './config/redis.config';
import { RedisManagerService } from './services/redis-manager.service';

@Global()
@Module({
    imports: [RedisModule.forRootAsync(redisOptions)],
    providers: [RedisManagerService],
    exports: [RedisManagerService],
})
export class RedisManagerModule {}
