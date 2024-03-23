import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedSessionEntity1711169740063 implements MigrationInterface {
    name = 'RemovedSessionEntity1711169740063'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "author" uuid NOT NULL, CONSTRAINT "PK_362cadb16e72c369a1406924e2d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_entity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email"), CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "article_entity" ADD CONSTRAINT "FK_71ddc6d1d5749395a3f36ca60fe" FOREIGN KEY ("author") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_entity" DROP CONSTRAINT "FK_71ddc6d1d5749395a3f36ca60fe"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
        await queryRunner.query(`DROP TABLE "article_entity"`);
    }

}
