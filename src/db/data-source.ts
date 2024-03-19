import { DataSource } from 'typeorm';

export default new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'root',
    password: '12345',
    database: 'tz_artel',
    migrations: ['src/**/migrations/**/*{.ts,.js}'],
    entities: ['src/**/*.entity{.ts, .js}'],
    synchronize: false,
});
