import { Global, Module } from '@nestjs/common';
import { RedisManagerService } from './services/redis-manager.service';
import { RedisModule } from '@liaoliaots/nestjs-redis';
import { redisOptions } from './config/redis.config';

@Global()
@Module({
    imports: [RedisModule.forRootAsync(redisOptions)],
    providers: [RedisManagerService],
    exports: [RedisManagerService],
})
export class RedisManagerModule {}
