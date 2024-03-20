import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddArticleEntity1709964220674 implements MigrationInterface {
    name = 'AddArticleEntity1709964220674';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "article_entity" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "author" uuid NOT NULL, CONSTRAINT "PK_362cadb16e72c369a1406924e2d" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "session_entity" DROP CONSTRAINT "FK_8118675718bebb455bba4caf129"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_entity" DROP CONSTRAINT "PK_b54f8ea623b17094db7667d8206"`,
        );
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "id"`);
        await queryRunner.query(
            `ALTER TABLE "user_entity" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_entity" ADD CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_entity" ADD CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5" UNIQUE ("email")`,
        );
        await queryRunner.query(`ALTER TABLE "session_entity" DROP COLUMN "userId"`);
        await queryRunner.query(
            `ALTER TABLE "session_entity" ADD "userId" uuid NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "article_entity" ADD CONSTRAINT "FK_71ddc6d1d5749395a3f36ca60fe" FOREIGN KEY ("author") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(
            `ALTER TABLE "session_entity" ADD CONSTRAINT "FK_8118675718bebb455bba4caf129" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "session_entity" DROP CONSTRAINT "FK_8118675718bebb455bba4caf129"`,
        );
        await queryRunner.query(
            `ALTER TABLE "article_entity" DROP CONSTRAINT "FK_71ddc6d1d5749395a3f36ca60fe"`,
        );
        await queryRunner.query(`ALTER TABLE "session_entity" DROP COLUMN "userId"`);
        await queryRunner.query(
            `ALTER TABLE "session_entity" ADD "userId" integer NOT NULL`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_entity" DROP CONSTRAINT "UQ_415c35b9b3b6fe45a3b065030f5"`,
        );
        await queryRunner.query(
            `ALTER TABLE "user_entity" DROP CONSTRAINT "PK_b54f8ea623b17094db7667d8206"`,
        );
        await queryRunner.query(`ALTER TABLE "user_entity" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "user_entity" ADD "id" SERIAL NOT NULL`);
        await queryRunner.query(
            `ALTER TABLE "user_entity" ADD CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id")`,
        );
        await queryRunner.query(
            `ALTER TABLE "session_entity" ADD CONSTRAINT "FK_8118675718bebb455bba4caf129" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
        await queryRunner.query(`DROP TABLE "article_entity"`);
    }
}
