import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import getConfig from './db/config';
import { DatabaseModule } from './db/database.module';
import { ArticlesModule } from './modules/articles/articles.module';
import { AuthModule } from './modules/auth/auth.module';
import { RedisManagerModule } from './modules/redis/redis-manager.module';
import { UserModule } from './modules/users/user.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, load: [getConfig] }),
        RedisManagerModule,
        DatabaseModule,
        AuthModule,
        UserModule,
        ArticlesModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
