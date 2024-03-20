import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ArticlesController } from './controllers/articles.controller';
import { ArticleEntity } from './entities/article.entity';
import { ArticlesService } from './services/articles.service';

@Module({
    imports: [TypeOrmModule.forFeature([ArticleEntity])],
    providers: [ArticlesService],
    controllers: [ArticlesController],
})
export class ArticlesModule {}
