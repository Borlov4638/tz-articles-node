import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { ArticleEntity } from '../../articles/entities/article.entity';

@Entity()
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;
    @Column('character varying', { unique: true })
    email: string;
    @Column('character varying')
    username: string;
    @Column('character varying')
    password: string;
    @CreateDateColumn()
    createdAt: Date;
    @OneToMany(() => ArticleEntity, (article) => article.user)
    articles: ArticleEntity[];
}
