import { ArticleEntity } from '../entities/article.entity';

export class AllArticlesViewModel {
    meta: {
        page: number;
        pageSize: number;
        totalPages: number;
        totalRecords: number;
        sortOrder: string;
        sortBy: string;
    };
    data: ArticleEntity[];
}
