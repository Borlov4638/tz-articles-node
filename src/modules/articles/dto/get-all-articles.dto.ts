import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GenericFilter } from '../../utils/generic/generic-parigation-filter';

enum ArticlesSortByEnum {
    id = 'id',
    title = 'title',
    description = 'description',
    createdAt = 'createdAt',
    author = 'author',
}

export class GetAllArticlesQuery extends GenericFilter {
    @IsString()
    @IsEnum(ArticlesSortByEnum)
    @IsOptional()
    public sortBy?: ArticlesSortByEnum;
}
