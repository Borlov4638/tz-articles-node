import {
    BadRequestException,
    CanActivate,
    ExecutionContext,
    Injectable,
} from '@nestjs/common';
import { Request } from 'express';

import { UserEntity } from '../../users/entities/user.entity';
import { UserService } from '../../users/services/user.service';

@Injectable()
export class UsernameExistGuard implements CanActivate {
    constructor(private userService: UserService) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();
        const email = req.body.email;
        if (!email) {
            throw new BadRequestException('Invalid Email');
        }
        const customer: UserEntity = await this.userService.findUserByEmail(email);

        if (customer)
            throw new BadRequestException('User with this email is already exists');
        return true;
    }
}
