import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { UserEntity } from '../../users/entities/user.entity';

@Entity()
export class ArticleEntity {
    @PrimaryGeneratedColumn('increment')
    id: number;
    @Column('character varying')
    title: string;
    @Column('character varying')
    description: string;
    @CreateDateColumn()
    createdAt: string;
    @Column('uuid')
    author: string;
    @ManyToOne(() => UserEntity, (user) => user.id)
    @JoinColumn({ name: 'author' })
    user: UserEntity;
}
