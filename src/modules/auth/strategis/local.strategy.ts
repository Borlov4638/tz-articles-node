import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

import { UserService } from '../../users/services/user.service';
import { UserDataWithoutPassword } from '../../../modules/users/types/user-without-pass.type';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
    constructor(private userService: UserService) {
        super({
            usernameField: 'email',
        });
    }

    async validate(login: string, password: string): Promise<UserDataWithoutPassword> {
        const user = await this.userService.validateUser(login, password);
        if (!user) {
            throw new UnauthorizedException();
        }
        return user;
    }
}
