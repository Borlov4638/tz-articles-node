import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionService } from '../services/session.service';
import { UsersRefreshTokenPayload } from '../types/refresh-token-payload.type';

@Injectable()
export class RefreshTokenAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private sessionService: SessionService,
        private configService: ConfigService,
    ) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const refreshToken: string = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token is missing in the request');
        }
        let payload: UsersRefreshTokenPayload;
        try {
            payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });
        } catch {
            throw new UnauthorizedException('Token is malformed');
        }
        const isUsersTokenPresent = await this.sessionService.isSessionValid(
            payload.deviceId,
            refreshToken.split('.')[2],
        );
        if (!isUsersTokenPresent) {
            throw new UnauthorizedException('This users token is not actual token');
        }
        req.user = {
            id: payload.id,
            username: payload.username,
            deviceId: payload.deviceId,
        };
        return true;
    }
}
