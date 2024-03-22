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
    UseGuards,
} from '@nestjs/common';
import { AccessTokenAuthGuard } from '../../auth/guards/access-jwt.guard';
import { CreateUpdateArticleDTO } from '../dto/create-article.query';
import { GetAllArticlesQuery } from '../dto/get-all-articles.dto';
import { AllArticlesViewModel } from '../response/get-all-articles.response';
import { ArticleEntity } from '../entities/article.entity';
import { ArticlesService } from '../services/articles.service';
import { UsersAccessTokenPayload } from 'src/modules/auth/types/access-token-payload.type';
import { User } from '../../../decorators/get-user-from-request.decorator';

@Controller('articles')
export class ArticlesController {
    constructor(private readonly articlesService: ArticlesService) {}

    @UseGuards(AccessTokenAuthGuard)
    @Post()
    async createArticle(
        @User() user: UsersAccessTokenPayload,
        @Body() dto: CreateUpdateArticleDTO,
    ): Promise<ArticleEntity> {
        return this.articlesService.createArticle(user.id, dto);
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
        @User() user: UsersAccessTokenPayload,
        @Body() dto: CreateUpdateArticleDTO,
        @Param('id', new ParseIntPipe()) id: number,
    ): Promise<void> {
        await this.articlesService.updateArticle(user.id, id, dto);
    }

    @UseGuards(AccessTokenAuthGuard)
    @Delete(':id')
    @HttpCode(204)
    async deleteArticle(
        @User() user: UsersAccessTokenPayload,
        @Param('id', new ParseIntPipe()) id: number,
    ): Promise<void> {
        await this.articlesService.deleteOneArticle(user.id, id);
    }
}
