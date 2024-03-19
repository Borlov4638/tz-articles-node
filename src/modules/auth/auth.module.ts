import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from '../users/entities/user.entity';
import { UserModule } from '../users/user.module';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { SessionService } from './services/session.service';
import { JwtStrategy } from './strategis/jwt.strategy';
import { LocalStrategy } from './strategis/local.strategy';

@Module({
    controllers: [AuthController],
    providers: [LocalStrategy, JwtStrategy, AuthService, SessionService],
    imports: [
        PassportModule,
        UserModule,
        TypeOrmModule.forFeature([UserEntity]),
        JwtModule.register({
            global: true,
        }),
    ],
})
export class AuthModule {}
