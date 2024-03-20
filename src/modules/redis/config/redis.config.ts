import { RedisModuleAsyncOptions, RedisModuleOptions } from '@liaoliaots/nestjs-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const redisOptions: RedisModuleAsyncOptions = {
    imports: [ConfigModule],
    inject: [ConfigService],

    useFactory: async (configService: ConfigService): Promise<RedisModuleOptions> => {
        const config = {
            host: configService.get('REDIS_HOST'),
            port: parseInt(configService.get('REDIS_PORT')),
            password: configService.get('REDIS_PASS'),
        };
        return {
            config,
        };
    },
};
