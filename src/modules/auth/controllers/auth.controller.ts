import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { UserDataWithoutPassword, UserService } from '../../users/services/user.service';
import { AuthService } from '../services/auth.service';
import { UserLoginAndRegistrationDTO } from '../dto/user-registration';
import { LocalAuthGuard } from '../guards/local-auth-guard.guard';
import { RefreshTokenAuthGuard } from '../guards/refresh-jwt.guard';
import { UsernameExistGuard } from '../guards/user-exists.guard';

@Controller('auth')
export class AuthController {
    constructor(private userService: UserService, private authService: AuthService) {}

    @UseGuards(UsernameExistGuard)
    @HttpCode(HttpStatus.CREATED)
    @Post('registration')
    async registerUser(
        @Body() userData: UserLoginAndRegistrationDTO,
    ): Promise<UserDataWithoutPassword> {
        return this.userService.createUser(
            userData.email,
            userData.password,
            userData.username,
        );
    }

    @UseGuards(LocalAuthGuard)
    @Post('login')
    async loginUser(@Req() req: Request, @Res() res: Response): Promise<Response> {
        const tokens = await this.authService.login(req.user['id'], req.user['username']);

        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return res.status(200).json({ accessToken: tokens.accessToken });
    }

    @UseGuards(RefreshTokenAuthGuard)
    @Post('refresh')
    async refreshToken(@Req() req: Request, @Res() res: Response): Promise<Response> {
        const tokens = await this.authService.refresh(
            req.user['id'],
            req.user['username'],
            req.user['deviceId'],
        );
        res.cookie('refreshToken', tokens.refreshToken, {
            httpOnly: true,
            secure: true,
        });
        return res.status(200).json({ accessToken: tokens.accessToken });
    }
}
