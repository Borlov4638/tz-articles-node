import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UtilsModule } from '../utils/utils.module';
import { UserEntity } from './entities/user.entity';
import { UserService } from './services/user.service';

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity]), UtilsModule],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule {}
