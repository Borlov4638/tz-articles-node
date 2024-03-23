import { RedisModule } from '@liaoliaots/nestjs-redis';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { RedisManagerService } from '../../../modules/redis/services/redis-manager.service';
import { UserEntity } from '../../../modules/users/entities/user.entity';
import { ArticleEntity } from '../entities/article.entity';
import { ArticlesService } from './articles.service';

// Mock data for testing
const mockArticles = [
    {
        id: 1,
        title: 'Article 1',
        description: 'Description 1',
        createdAt: new Date().toISOString(),
        author: 'user1',
        user: {} as UserEntity,
    },
    {
        id: 2,
        title: 'Article 2',
        description: 'Description 2',
        createdAt: new Date().toISOString(),
        author: 'user2',
        user: {} as UserEntity,
    },
    {
        id: 3,
        title: 'Article 3',
        description: 'Description 3',
        createdAt: new Date().toISOString(),
        author: 'user3',
        user: {} as UserEntity,
    },
];

describe('ArticlesService', () => {
    let service: ArticlesService;
    let repository: Repository<ArticleEntity>;
    let redisService: RedisManagerService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                RedisModule.forRoot({
                    config: { host: 'localhost', port: 6379, password: 'supersecret' },
                }),
            ],
            providers: [
                ArticlesService,
                RedisManagerService,
                {
                    provide: getRepositoryToken(ArticleEntity),
                    useClass: Repository,
                },
            ],
        }).compile();

        service = module.get<ArticlesService>(ArticlesService);
        repository = module.get<Repository<ArticleEntity>>(
            getRepositoryToken(ArticleEntity),
        );
        redisService = module.get<RedisManagerService>(RedisManagerService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllArticles', () => {
        it('should return all articles', async () => {
            jest.spyOn(repository, 'findAndCount').mockResolvedValueOnce([
                mockArticles,
                mockArticles.length,
            ]);
            jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(redisService, 'set');

            const result = await service.getAllArticles({});

            expect(result.data).toEqual(mockArticles);
            expect(result.meta.totalRecords).toEqual(mockArticles.length);
            expect(redisService.set).toHaveBeenCalledWith(
                'ALL_ARTICLES',
                {
                    meta: {
                        page: 1,
                        pageSize: 10,
                        totalPages: 1,
                        totalRecords: 3,
                        sortOrder: 'descending',
                        sortBy: 'title',
                    },
                    data: mockArticles,
                },
                300,
            );
        });

        it('should return cached data if available', async () => {
            jest.spyOn(redisService, 'get').mockResolvedValueOnce({
                data: mockArticles,
                meta: { totalRecords: mockArticles.length },
            });
            jest.spyOn(redisService, 'set');
            jest.spyOn(repository, 'findAndCount');

            const result = await service.getAllArticles({});

            expect(result.data).toEqual(mockArticles);
            expect(redisService.set).not.toHaveBeenCalled();
            expect(repository.findAndCount).not.toHaveBeenCalled();
        });
    });

    describe('createArticle', () => {
        it('should create an article', async () => {
            const userId = 'user123';
            const dto = {
                title: 'New Article',
                description: 'New Description',
            };

            const savedArticle = {
                id: 1,
                author: userId,
                ...dto,
                createdAt: new Date().toISOString(),
                user: {} as UserEntity,
            };

            jest.spyOn(repository, 'save').mockResolvedValueOnce(savedArticle);

            const createdArticle = await service.createArticle(userId, dto);

            expect(createdArticle).toEqual(savedArticle);
            expect(repository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    author: userId,
                    title: dto.title,
                    description: dto.description,
                }),
            );
        });
    });

    describe('getOneArticle', () => {
        it('should return article from cache if available', async () => {
            const id = 1;
            const cachedArticle = {
                id: '1',
                title: 'Cached Article',
                description: 'Cached Description',
                author: 'cachedUser',
            };

            jest.spyOn(redisService, 'get').mockResolvedValueOnce(cachedArticle);

            const article = await service.getOneArticle(id);

            expect(article).toEqual(cachedArticle);
            expect(redisService.get).toHaveBeenCalledWith(`ONE_ARTICLE/${id}`);
        });

        it('should return article from database if not available in cache', async () => {
            const id = 1;
            const articleFromDB = {
                id,
                title: 'Database Article',
                description: 'Database Description',
                author: 'dbUser',
                createdAt: new Date().toISOString(),
                user: {} as UserEntity,
            };

            jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(redisService, 'set').mockResolvedValueOnce(undefined);
            jest.spyOn(repository, 'find').mockResolvedValueOnce([articleFromDB]);

            const article = await service.getOneArticle(id);

            expect(article).toEqual(articleFromDB);
            expect(repository.find).toHaveBeenCalledWith({ where: { id } });
            expect(redisService.set).toHaveBeenCalledWith(
                `ONE_ARTICLE/${id}`,
                articleFromDB,
                300,
            );
        });

        it('should throw NotFoundException if article not found in database', async () => {
            const id = 1;

            jest.spyOn(redisService, 'get').mockResolvedValueOnce(null);
            jest.spyOn(redisService, 'set').mockResolvedValueOnce(undefined);
            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);

            await expect(service.getOneArticle(id)).rejects.toThrow(NotFoundException);
            expect(redisService.set).not.toHaveBeenCalled();
        });
    });

    describe('updateArticle', () => {
        it('should update article if user is the owner', async () => {
            const userId = 'user123';
            const id = 1;
            const dto = {
                title: 'Updated Article',
                description: 'Updated Description',
            };

            const updatedArticle = {
                ...mockArticles[0],
                ...dto,
            };

            jest.spyOn(repository, 'find').mockResolvedValueOnce([mockArticles[0]]);
            jest.spyOn(repository, 'update').mockResolvedValueOnce(undefined);
            jest.spyOn(service, 'getOneArticle').mockResolvedValueOnce(updatedArticle);
            jest.spyOn(redisService, 'remove').mockResolvedValueOnce(undefined);

            await service.updateArticle(userId, id, dto);

            expect(repository.find).toHaveBeenCalledWith({
                where: { id, author: userId },
            });
            expect(repository.update).toHaveBeenCalledWith(id, dto);
            expect(service.getOneArticle).toHaveBeenCalledWith(id);
            expect(redisService.remove).toHaveBeenCalledWith(`ONE_ARTICLE/${id}`);
        });

        it('should throw NotFoundException if article not found for the user', async () => {
            const userId = 'user123';
            const id = 1;
            const dto = {
                title: 'Updated Article',
                description: 'Updated Description',
            };

            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
            jest.spyOn(repository, 'update');
            jest.spyOn(service, 'getOneArticle');
            jest.spyOn(redisService, 'remove');

            await expect(service.updateArticle(userId, id, dto)).rejects.toThrow(
                NotFoundException,
            );

            expect(repository.find).toHaveBeenCalledWith({
                where: { id, author: userId },
            });
            expect(repository.update).not.toHaveBeenCalled();
            expect(service.getOneArticle).not.toHaveBeenCalled();
            expect(redisService.remove).not.toHaveBeenCalled();
        });
    });

    describe('deleteOneArticle', () => {
        it('should delete article if user is the owner', async () => {
            const userId = 'user123';
            const id = 1;

            jest.spyOn(repository, 'find').mockResolvedValueOnce([mockArticles[0]]);
            jest.spyOn(repository, 'delete').mockResolvedValueOnce(undefined);
            jest.spyOn(redisService, 'remove').mockResolvedValueOnce(undefined);

            await service.deleteOneArticle(userId, id);

            expect(repository.find).toHaveBeenCalledWith({
                where: { author: userId, id },
            });
            expect(repository.delete).toHaveBeenCalledWith(id);
            expect(redisService.remove).toHaveBeenCalledWith(`ONE_ARTICLE/${id}`);
        });

        it('should throw NotFoundException if article not found for the user', async () => {
            const userId = 'user123';
            const id = 1;

            jest.spyOn(repository, 'find').mockResolvedValueOnce([]);
            jest.spyOn(repository, 'delete');
            jest.spyOn(redisService, 'remove');

            await expect(service.deleteOneArticle(userId, id)).rejects.toThrow(
                NotFoundException,
            );

            expect(repository.find).toHaveBeenCalledWith({
                where: { author: userId, id },
            });
            expect(repository.delete).not.toHaveBeenCalled();
            expect(redisService.remove).not.toHaveBeenCalled();
        });
    });
});
