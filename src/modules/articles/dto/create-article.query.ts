import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUpdateArticleDTO {
    @IsString()
    @IsNotEmpty()
    description: string;
    @IsString()
    @IsNotEmpty()
    title: string;
}
