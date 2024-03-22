import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Param,
    ParseIntPipe,
    Post,
    Put,
    Query,
    Req,
    UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { AccessTokenAuthGuard } from '../../auth/guards/access-jwt.guard';
import { CreateUpdateArticleDTO } from '../dto/create-article.query';
import { GetAllArticlesQuery } from '../dto/get-all-articles.dto';
import { AllArticlesViewModel } from '../response/get-all-articles.response';
import { ArticleEntity } from '../entities/article.entity';
import { ArticlesService } from '../services/articles.service';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @UseGuards(AccessTokenAuthGuard)
    @Post()
    async createArticle(
        @Req() req: Request,
        @Body() dto: CreateUpdateArticleDTO,
    ): Promise<ArticleEntity> {
        return this.articlesService.createArticle(req.user['id'], dto);
    }

    @Get()
    async getAllArticles(
        @Query() query: GetAllArticlesQuery,
    ): Promise<AllArticlesViewModel> {
        return this.articlesService.getAllArticles(query);
    }

    @Get(':id')
    async getOneArticle(
        @Param('id', new ParseIntPipe()) id: number,
    ): Promise<ArticleEntity> {
        return this.articlesService.getOneArticle(id);
    }

    @UseGuards(AccessTokenAuthGuard)
    @Put(':id')
    @HttpCode(204)
    async updateArticle(
        @Req() req: Request,
        @Body() dto: CreateUpdateArticleDTO,
        @Param('id', new ParseIntPipe()) id: number,
    ): Promise<void> {
        await this.articlesService.updateArticle(req.user['id'], id, dto);
    }

    @UseGuards(AccessTokenAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteArticle(
        @Req() req: Request,
        @Param('id', new ParseIntPipe()) id: number,
    ): Promise<void> {
        await this.articlesService.deleteOneArticle(req.user['id'], id);
    }
}
