import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisManagerService } from '../../../modules/redis/services/redis-manager.service';
import { GenericFilter } from '../../utils/generic/generic-parigation-filter';
import { CreateUpdateArticleDTO } from '../dto/request/create-article.query';
import { AllArticlesViewModel } from '../dto/response/get-all-articles.viewmodel';
import { ArticleEntity } from '../entities/article.entity';

@Injectable()
export class ArticlesService {
    constructor(
        @InjectRepository(ArticleEntity) private articleRepo: Repository<ArticleEntity>,
        private redisService: RedisManagerService,
    ) {}

    async getAllArticles(query: GenericFilter): Promise<AllArticlesViewModel> {
        //check if cache exists
        const cache: string = await this.redisService.get('ALL_ARTICLES');
        if (cache) {
            return JSON.parse(cache);
        }

        const page = +query.page || 1;
        const pageSize = +query.pageSize || 10;
        const skip = (page - 1) * pageSize;
        const sortOrder = query.sortOrder || 'DESC';
        const sortBy = query.sortBy || 'title';
        const response = await this.articleRepo
            .findAndCount({
                where: {},
                order: { [sortBy]: `${sortOrder}` },
                skip: skip,
                take: pageSize,
            })
            .then(([results, total]) => ({
                meta: {
                    page,
                    pageSize,
                    totalPages: Math.ceil(total / pageSize),
                    totalRecords: total,
                    sortOrder: sortOrder === 'ASC' ? 'ascending' : 'descending',
                    sortBy: sortBy,
                },
                data: results,
            }));
        // Store in cache for 5 minutes
        this.redisService.set(`ALL_ARTICLES`, JSON.stringify(response), 300);
        return response;
    }

    async createArticle(
        userId: string,
        dto: CreateUpdateArticleDTO,
    ): Promise<ArticleEntity> {
        const article = new ArticleEntity();
        article.author = userId;
        article.description = dto.description;
        article.title = dto.title;

        return this.articleRepo.save(article);
    }

    async getOneArticle(id: number): Promise<ArticleEntity> {
        //check if cache exists
        const cache: string = await this.redisService.get(`ONE_ARTICLE/${id}`);
        if (cache) {
            return JSON.parse(cache);
        }

        const response = await this.articleRepo
            .find({ where: { id } })
            .then((articles) => {
                if (!articles[0])
                    throw new NotFoundException('Article with such id is not exist');
                else return articles[0];
            });
        // Store in cache for 5 minutes
        this.redisService.set(`ONE_ARTICLE/${id}`, JSON.stringify(response), 300);
        return response;
    }

    async updateArticle(
        userId: string,
        id: number,
        dto: CreateUpdateArticleDTO,
    ): Promise<void> {
        await this.articleRepo
            .find({ where: { id, author: userId } })
            .then((articles) => {
                if (articles.length === 0)
                    throw new NotFoundException('You are not the owner of this article');
                else this.articleRepo.update(id, dto).then(() => this.getOneArticle(id));
            });

        //invalidate cache for this article
        await this.redisService.remove(`ONE_ARTICLE/${id}`);
    }

    async deleteOneArticle(userId: string, id: number): Promise<void> {
        await this.articleRepo
            .find({ where: { author: userId, id } })
            .then((articles) => {
                if (articles.length === 0)
                    throw new NotFoundException('You are not the owner of this article');
                else this.articleRepo.delete(id);
            });

        //invalidate cache for this article
        await this.redisService.remove(`ONE_ARTICLE/${id}`);
    }
}
