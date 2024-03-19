import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';

import { SessionService } from './session.service';

export type UsersRefreshTokenPayload = {
    id: string;
    username: string;
    deviceId: string;
    iat: number;
    exp: number;
};

export type UsersAccessTokenPayload = {
    id: string;
    username: string;
    iat: number;
    exp: number;
};

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
    ): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const tokens = await this.getTokens(userId, username, deviceId);
        const refreshHash = tokens.refreshToken.split('.')[2];
        await this.sessionService.createSession(userId, deviceId, refreshHash);
        return tokens;
    }

    async login(
        userId: string,
        username: string,
    ): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
        const deviceId = uuidv4();
        const tokens = await this.getTokens(userId, username, deviceId);
        const refreshHash = tokens.refreshToken.split('.')[2];
        await this.sessionService.createSession(userId, deviceId, refreshHash);
        return tokens;
    }

    private async getTokens(
        userId: string,
        username: string,
        deviceId: string,
    ): Promise<{
        accessToken: string;
        refreshToken: string;
    }> {
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
