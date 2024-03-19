import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisSession } from '../types/session-redis.type';
import { RedisManagerService } from 'src/modules/redis/services/redis-manager.service';

@Injectable()
export class SessionService {
    constructor(
        private configService: ConfigService,
        private redisService: RedisManagerService,
    ) {}

    async createSession(
        userId: string,
        deviceId: string,
        refreshHash: string,
    ): Promise<void> {
        const session: RedisSession = {
            deviceId,
            lastActiveDate: new Date(),
            refreshHash,
            userId,
        };
        const ttl = +this.configService.get<string>('JWT_REFRESH_EXP');
        return await this.redisService.set(deviceId, session, ttl);
    }

    async isSessionValid(deviceId: string, refreshHash: string): Promise<boolean> {
        try {
            const session = (await this.redisService.get(deviceId)) as RedisSession;
            if (session.refreshHash !== refreshHash) return false;
            return true;
        } catch {
            return false;
        }
    }
}
