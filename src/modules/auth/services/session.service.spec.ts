import { Test, TestingModule } from '@nestjs/testing';
import { SessionService } from './session.service';
import { ConfigService } from '@nestjs/config';
import { RedisManagerService } from '../../../modules/redis/services/redis-manager.service';
import { RedisSession } from '../types/session-redis.type';

describe('SessionService', () => {
    let service: SessionService;
    let redisManagerService: RedisManagerService;
    let configService: ConfigService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionService,
                ConfigService,
                {
                    provide: RedisManagerService,
                    useValue: {
                        set: jest.fn(),
                        get: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<SessionService>(SessionService);
        redisManagerService = module.get<RedisManagerService>(RedisManagerService);
        configService = module.get<ConfigService>(ConfigService);
    });

    describe('createSession', () => {
        it('should create a new session with the correct data', async () => {
            const userId = 'user-id';
            const deviceId = 'device-id';
            const refreshHash = 'refresh-hash';
            const ttl = 3600;

            jest.spyOn(configService, 'get').mockReturnValue(ttl);

            await service.createSession(userId, deviceId, refreshHash);

            const expectedSession: RedisSession = {
                deviceId,
                lastActiveDate: expect.any(Date),
                refreshHash,
                userId,
            };

            expect(redisManagerService.set).toHaveBeenCalledWith(
                deviceId,
                expectedSession,
                ttl,
            );
        });
    });

    describe('deleteSession', () => {
        it('should delete the session with the correct deviceId', async () => {
            const deviceId = 'device-id';

            await service.deleteSession(deviceId);

            expect(redisManagerService.remove).toHaveBeenCalledWith(deviceId);
        });
    });

    describe('isSessionValid', () => {
        it('should return true if the session is valid', async () => {
            const deviceId = 'device-id';
            const refreshHash = 'refresh-hash';
            const session: RedisSession = {
                deviceId,
                lastActiveDate: new Date(),
                refreshHash,
                userId: 'user-id',
            };

            jest.spyOn(redisManagerService, 'get').mockResolvedValue(session);

            const result = await service.isSessionValid(deviceId, refreshHash);

            expect(result).toBe(true);
        });

        it('should return false if the session is invalid', async () => {
            const deviceId = 'device-id';
            const refreshHash = 'refresh-hash';

            jest.spyOn(redisManagerService, 'get').mockRejectedValue(new Error());

            const result = await service.isSessionValid(deviceId, refreshHash);

            expect(result).toBe(false);
        });
    });
});
