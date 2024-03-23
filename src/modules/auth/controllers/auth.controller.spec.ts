import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { UserService } from '../../users/services/user.service';
import { AuthService } from '../services/auth.service';
import { UserLoginAndRegistrationDTO } from '../dto/user-registration.dto';
import { Response } from 'express';
import { LocalAuthGuard } from '../guards/local-auth-guard.guard';
import { RefreshTokenAuthGuard } from '../guards/refresh-jwt.guard';
import { UsernameExistGuard } from '../guards/user-exists.guard';
import { UserDataWithoutPassword } from '../../../modules/users/types/user-without-pass.type';
import { UsersRefreshTokenPayload } from '../types/refresh-token-payload.type';

describe('AuthController', () => {
    let controller: AuthController;
    let userService: UserService;
    let authService: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: UserService,
                    useValue: {
                        createUser: jest.fn(),
                    },
                },
                {
                    provide: AuthService,
                    useValue: {
                        login: jest.fn(),
                        refresh: jest.fn(),
                        logout: jest.fn(),
                    },
                },
            ],
        })
            .overrideGuard(LocalAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(RefreshTokenAuthGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .overrideGuard(UsernameExistGuard)
            .useValue({ canActivate: jest.fn(() => true) })
            .compile();

        controller = module.get<AuthController>(AuthController);
        userService = module.get<UserService>(UserService);
        authService = module.get<AuthService>(AuthService);
    });

    describe('registration', () => {
        it('should create a new user', async () => {
            const dto: UserLoginAndRegistrationDTO = {
                email: 'test@example.com',
                password: 'password',
                username: 'testuser',
            };
            const user = { id: 1, email: 'test@example.com', username: 'testuser' };
            userService.createUser = jest.fn().mockResolvedValue(user);

            const result = await controller.registerUser(dto);

            expect(userService.createUser).toHaveBeenCalledWith(
                dto.email,
                dto.password,
                dto.username,
            );
            expect(result).toEqual(user);
        });
    });

    describe('login', () => {
        it('should return access and refresh tokens', async () => {
            const userId = '1';
            const username = 'testuser';
            const accessToken = 'access-token';
            const refreshToken = 'refresh-token';
            authService.login = jest
                .fn()
                .mockResolvedValue({ accessToken, refreshToken });

            const user = {
                id: userId,
                username,
                createdAt: new Date().toISOString(),
                email: 'user@user.com',
            } as UserDataWithoutPassword;
            const res = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await controller.loginUser(user, res);

            expect(authService.login).toHaveBeenCalledWith(userId, username);
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ accessToken });
        });
    });

    describe('refresh', () => {
        it('should return new access and refresh tokens', async () => {
            const userId = '1';
            const username = 'testuser';
            const deviceId = 'device-id';
            const accessToken = 'new-access-token';
            const refreshToken = 'new-refresh-token';
            authService.refresh = jest
                .fn()
                .mockResolvedValue({ accessToken, refreshToken });

            const user = { id: userId, username, deviceId } as UsersRefreshTokenPayload;
            const res = {
                cookie: jest.fn(),
                status: jest.fn().mockReturnThis(),
                json: jest.fn(),
            } as unknown as Response;

            await controller.refreshToken(user, res);

            expect(authService.refresh).toHaveBeenCalledWith(userId, username, deviceId);
            expect(res.cookie).toHaveBeenCalledWith('refreshToken', refreshToken, {
                httpOnly: true,
                secure: true,
            });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ accessToken });
        });
    });

    describe('logout', () => {
        it('should call the logout method of the authService with the correct deviceId', async () => {
            const deviceId = 'device-id';
            const user = { deviceId } as unknown as UsersRefreshTokenPayload;

            await controller.logout(user);

            expect(authService.logout).toHaveBeenCalledWith(deviceId);
        });
    });
});
