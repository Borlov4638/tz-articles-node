import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisManagerService {
    constructor(
        @InjectRedis()
        private readonly redisManager: Redis,
    ) {}

    async set<T>(key: string, value: T, ttlInSeconds?: number): Promise<void> {
        if (ttlInSeconds) {
            await this.redisManager.set(key, JSON.stringify(value), 'EX', ttlInSeconds);
            return;
        }

        await this.redisManager.set(key, JSON.stringify(value));
    }

    async get<T>(key: string): Promise<T | null> {
        const cachedResponse = await this.redisManager.get(key);

        if (cachedResponse === null) {
            return null;
        }
        return JSON.parse(cachedResponse) as T;
    }

    async remove(key: string): Promise<void> {
        await this.redisManager.del(key);
    }

    async scanWithValues(pattern: string): Promise<Record<string, string>> {
        let cursor = '0';
        const result: Record<string, string> = {};

        do {
            const res = await this.redisManager.scan(cursor, 'MATCH', pattern);
            cursor = res[0];
            const keys = res[1];

            for (const key of keys) {
                const value = await this.get<string>(key);

                if (value) {
                    result[key] = value;
                }
            }
        } while (cursor !== '0');

        return result;
    }
}
