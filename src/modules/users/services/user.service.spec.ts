import { Repository } from 'typeorm';
import { CryptoService } from '../../../modules/utils/crypto/crypto.service';
import { UserService } from './user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserDataWithoutPassword } from '../types/user-without-pass.type';
import { UnauthorizedException } from '@nestjs/common';

describe('UserService', () => {
    let service: UserService;
    let cryptoService: CryptoService;
    let userRepo: Repository<UserEntity>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                CryptoService,
                {
                    provide: getRepositoryToken(UserEntity),
                    useClass: Repository,
                },
            ],
        }).compile();
        service = module.get<UserService>(UserService);
        cryptoService = module.get<CryptoService>(CryptoService);
        userRepo = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createUser', () => {
        it('shoud create user', async () => {
            const dto = {
                username: 'username1',
                email: 'test@mail.com',
                password: 'Password123',
            };
            const hashedPassword = 'hashed-password';
            const user = {
                id: 'uuid',
                email: dto.email,
                username: dto.username,
                createdAt: new Date().toISOString(),
                articles: [],
            };

            jest.spyOn(cryptoService, 'hashData').mockResolvedValue('hashed-password');
            jest.spyOn(userRepo, 'save').mockResolvedValueOnce({
                ...user,
                password: hashedPassword,
            });

            const result = await service.createUser(
                dto.email,
                dto.password,
                dto.username,
            );

            expect(result).toEqual(user);
            expect(userRepo.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: dto.email,
                    username: dto.username,
                    password: 'hashed-password',
                }),
            );
        });
    });

    describe('findUserByEmail', () => {
        it('shoud find  user by email', async () => {
            const email = 'test@example.com';

            const user: UserEntity = {
                id: 'uuid',
                email,
                username: 'test',
                createdAt: new Date().toISOString(),
                articles: [],
                password: 'hashed-password',
            };

            jest.spyOn(userRepo, 'findOne').mockResolvedValueOnce(user);

            const result = await service.findUserByEmail(email);

            expect(result).toEqual(user);
            expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email } });
        });
    });

    describe('validateUser', () => {
        const email = 'email@com.com';
        const pass = 'password';

        const user: UserDataWithoutPassword = {
            id: 'uuid',
            email,
            username: 'username',
            createdAt: new Date().toISOString(),
        };
        const hashedPassword = 'hashed-pass';

        it('shoud return user with correct login  and password', async () => {
            jest.spyOn(service, 'findUserByEmail').mockResolvedValueOnce({
                ...user,
                password: hashedPassword,
                articles: [],
            });
            jest.spyOn(cryptoService, 'compareHash').mockResolvedValue(true);

            const result = await service.validateUser(email, pass);
            expect(result).toEqual({ ...user, articles: [] });
            expect(service.findUserByEmail).toHaveBeenCalledWith(email);
            expect(cryptoService.compareHash).toHaveBeenCalledWith(pass, hashedPassword);
        });

        it('shoud throw unathorized error if user not found', () => {
            jest.spyOn(service, 'findUserByEmail').mockResolvedValue(undefined);

            jest.spyOn(cryptoService, 'compareHash').mockResolvedValueOnce(true);

            const result = service.validateUser(email, pass);

            expect(result).rejects.toThrow(UnauthorizedException);
            expect(service.findUserByEmail).toHaveBeenCalledWith(email);
            expect(cryptoService.compareHash).toHaveBeenCalledTimes(0);
        });

        it('shoud throw unathorized error if hash is not match', () => {
            jest.spyOn(service, 'findUserByEmail').mockResolvedValue({
                ...user,
                password: hashedPassword,
                articles: [],
            });
            jest.spyOn(cryptoService, 'compareHash').mockResolvedValue(false);
            const result = service.validateUser(email, 'wrong-password');

            expect(result).rejects.toThrow(UnauthorizedException);
            expect(service.findUserByEmail).toHaveBeenCalledWith(email);
        });
    });
});
