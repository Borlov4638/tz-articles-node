import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { SessionService } from './session.service';
import { TokenPair } from '../types/token-pair.type';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private sessionService: SessionService,
    ) {}

    async refresh(
        userId: string,
        username: string,
        deviceId: string,
    ): Promise<TokenPair> {
        const tokens = await this.getTokens(userId, username, deviceId);
        const refreshHash = tokens.refreshToken.split('.')[2];
        await this.sessionService.createSession(userId, deviceId, refreshHash);
        return tokens;
    }

    async login(userId: string, username: string): Promise<TokenPair> {
        const deviceId = uuidv4();
        const tokens = await this.getTokens(userId, username, deviceId);
        const refreshHash = tokens.refreshToken.split('.')[2];
        await this.sessionService.createSession(userId, deviceId, refreshHash);
        return tokens;
    }

    async logout(deviceId: string): Promise<void> {
        await this.sessionService.deleteSession(deviceId);
    }

    private async getTokens(
        userId: string,
        username: string,
        deviceId: string,
    ): Promise<TokenPair> {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                {
                    id: userId,
                    username,
                },
                {
                    secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: +this.configService.get<number>('JWT_ACCESS_EXP'),
                },
            ),
            this.jwtService.signAsync(
                {
                    id: userId,
                    username,
                    deviceId,
                },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: +this.configService.get<number>('JWT_REFRESH_EXP'),
                },
            ),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }
}
