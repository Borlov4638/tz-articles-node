import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CryptoService } from '../../utils/crypto/crypto.service';
import { UserEntity } from '../entities/user.entity';

export interface UserDataWithoutPassword {
    id: number;
    username: string;
    createdAt: Date;
}

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) private userRepo: Repository<UserEntity>,
        private cryptoService: CryptoService,
    ) {}

    async createUser(
        email: string,
        password: string,
        username: string,
    ): Promise<UserDataWithoutPassword> {
        const user = new UserEntity();
        user.email = email;
        user.username = username;
        user.password = await this.cryptoService.hashData(password);
        return this.userRepo.save(user).then((u) => {
            const { password, ...userData } = u;
            return userData;
        });
    }

    async findUserByEmail(email: string): Promise<UserEntity> {
        return this.userRepo.findOne({ where: { email } });
    }

    async validateUser(login: string, pass: string): Promise<UserDataWithoutPassword> {
        const user = await this.userRepo.findOne({ where: { username: login } });
        if (!user || !(await this.cryptoService.compareHash(pass, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const { password, ...userData } = user;
        return userData;
    }
}
