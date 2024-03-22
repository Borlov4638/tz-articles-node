import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { AuthService } from './auth.service';
import { SessionService } from './session.service';

jest.mock('uuid', () => ({
    v4: jest.fn(() => 'f2a9e417-679a-4d21-b555-4fac7ec01570'),
}));

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;
    let configService: ConfigService;
    let sessionService: SessionService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: JwtService,
                    useValue: {
                        signAsync: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: SessionService,
                    useValue: {
                        createSession: jest.fn(),
                        deleteSession: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        configService = module.get<ConfigService>(ConfigService);
        sessionService = module.get<SessionService>(SessionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('refresh', () => {
        it('should refresh tokens', async () => {
            const userId = '123';
            const username = 'test';
            const deviceId = '456';

            const hashValue = 'hash';
            const accessToken = 'accessToken';
            const refreshToken = `refresh.Token.${hashValue}`;

            (jwtService.signAsync as jest.Mock).mockResolvedValueOnce(accessToken);
            (jwtService.signAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

            (configService.get as jest.Mock).mockReturnValueOnce('accessSecret');
            (configService.get as jest.Mock).mockReturnValueOnce(3600);

            (configService.get as jest.Mock).mockReturnValueOnce('refreshSecret');
            (configService.get as jest.Mock).mockReturnValueOnce(7200);

            await expect(service.refresh(userId, username, deviceId)).resolves.toEqual({
                accessToken,
                refreshToken,
            });

            expect(sessionService.createSession).toHaveBeenCalledWith(
                userId,
                deviceId,
                hashValue,
            );
        });
    });

    describe('login', () => {
        it('should login user and return tokens', async () => {
            const userId = '123';
            const username = 'test';

            const refreshHash = 'hash';
            const accessToken = 'accessToken';
            const refreshToken = `refresh.Token.${refreshHash}`;
            const deviceId = 'f2a9e417-679a-4d21-b555-4fac7ec01570';

            (jwtService.signAsync as jest.Mock).mockResolvedValueOnce(accessToken);
            (jwtService.signAsync as jest.Mock).mockResolvedValueOnce(refreshToken);

            (configService.get as jest.Mock).mockReturnValueOnce('accessSecret');
            (configService.get as jest.Mock).mockReturnValueOnce(3600);

            (configService.get as jest.Mock).mockReturnValueOnce('refreshSecret');
            (configService.get as jest.Mock).mockReturnValueOnce(7200);

            await expect(service.login(userId, username)).resolves.toEqual({
                accessToken,
                refreshToken,
            });

            expect(sessionService.createSession).toHaveBeenCalledWith(
                userId,
                deviceId,
                expect.any(String),
            );
        });
    });

    describe('logout', () => {
        it('should delete session', async () => {
            const deviceId = '456';
            await expect(service.logout(deviceId)).resolves.toBeUndefined();
            expect(sessionService.deleteSession).toHaveBeenCalledWith(deviceId);
        });
    });
});
