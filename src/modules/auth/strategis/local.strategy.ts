import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { UserDataWithoutPassword, UserService } from '../../users/services/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private userService: UserService) {
        super();
    }

    async validate(login: string, password: string): Promise<UserDataWithoutPassword> {
        const user = await this.userService.validateUser(login, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
