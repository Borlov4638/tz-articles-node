import { Test, TestingModule } from '@nestjs/testing';
import { ArticlesController } from './articles.controller';
import { ArticlesService } from '../services/articles.service';
import { GetAllArticlesQuery } from '../dto/get-all-articles.dto';
import { CreateUpdateArticleDTO } from '../dto/create-article.query';
import { Request } from 'express';
import { AccessTokenAuthGuard } from '../../auth/guards/access-jwt.guard';
import { of } from 'rxjs';
import { UsersAccessTokenPayload } from 'src/modules/auth/types/access-token-payload.type';

describe('ArticlesController', () => {
    let controller: ArticlesController;
    let articlesService: ArticlesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ArticlesController],
            providers: [
                {
                    provide: ArticlesService,
                    useValue: {
                        createArticle: jest.fn(),
                        getAllArticles: jest.fn(),
                        getOneArticle: jest.fn(),
                        updateArticle: jest.fn(),
                        deleteOneArticle: jest.fn(),
                    },
                },
                {
                    provide: AccessTokenAuthGuard,
                    useValue: {
                        canActivate: jest.fn(() => of(true)),
                    },
                },
            ],
        }).compile();

        controller = module.get<ArticlesController>(ArticlesController);
        articlesService = module.get<ArticlesService>(ArticlesService);
    });

    describe('createArticle', () => {
        it('should call createArticle method of ArticlesService', async () => {
            const userId = '1';
            const user: UsersAccessTokenPayload = {
                id: userId,
                username: 'username',
            };
            const dto: CreateUpdateArticleDTO = {
                title: 'title',
                description: 'description',
            };
            await controller.createArticle(user, dto);
            expect(articlesService.createArticle).toHaveBeenCalledWith(userId, dto);
        });
    });

    describe('getAllArticles', () => {
        it('should call getAllArticles method of ArticlesService', async () => {
            const query: GetAllArticlesQuery = {};
            await controller.getAllArticles(query);
            expect(articlesService.getAllArticles).toHaveBeenCalledWith(query);
        });
    });

    describe('getOneArticle', () => {
        it('should call getOneArticle method of ArticlesService', async () => {
            const id = 1;
            await controller.getOneArticle(id);
            expect(articlesService.getOneArticle).toHaveBeenCalledWith(id);
        });
    });

    describe('updateArticle', () => {
        it('should call updateArticle method of ArticlesService', async () => {
            const userId = '1';
            const dto: CreateUpdateArticleDTO = {
                title: 'new title',
                description: 'new description',
            };
            const user: UsersAccessTokenPayload = {
                id: userId,
                username: 'test',
            };
            const id = 1;
            await controller.updateArticle(user, dto, id);
            expect(articlesService.updateArticle).toHaveBeenCalledWith(user.id, id, dto);
        });
    });

    describe('deleteArticle', () => {
        it('should call deleteOneArticle method of ArticlesService', async () => {
            const userId = '1';
            const id = 1;
            const user: UsersAccessTokenPayload = {
                id: userId,
                username: 'test',
            };
            await controller.deleteArticle(user, id);
            expect(articlesService.deleteOneArticle).toHaveBeenCalledWith(user.id, id);
        });
    });
});
