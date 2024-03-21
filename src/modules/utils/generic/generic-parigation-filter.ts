import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsPositive } from 'class-validator';

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export class GenericFilter {
    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: ' "page" atrribute should be a number' })
    @IsPositive()
    @IsOptional()
    public page?: number;

    @Transform(({ value }) => parseInt(value))
    @IsNumber({}, { message: ' "pageSize" attribute should be a number ' })
    @IsPositive()
    @IsOptional()
    public pageSize?: number;

    @IsOptional()
    public sortBy?: string;

    @IsEnum(SortOrder)
    @IsOptional()
    public sortOrder?: SortOrder = SortOrder.DESC;
}
