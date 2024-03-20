import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserAndSessionEntitys1709816883814 implements MigrationInterface {
    name = 'AddUserAndSessionEntitys1709816883814';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE TABLE "user_entity" ("id" SERIAL NOT NULL, "email" character varying NOT NULL, "username" character varying NOT NULL, "password" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b54f8ea623b17094db7667d8206" PRIMARY KEY ("id"))`,
        );
        await queryRunner.query(
            `CREATE TABLE "session_entity" ("deviceId" character varying NOT NULL, "lastActiveDate" TIMESTAMP NOT NULL, "expiration" TIMESTAMP NOT NULL, "refreshHash" character varying NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_8b65912a1f066919af57dcf6122" PRIMARY KEY ("deviceId"))`,
        );
        await queryRunner.query(
            `ALTER TABLE "session_entity" ADD CONSTRAINT "FK_8118675718bebb455bba4caf129" FOREIGN KEY ("userId") REFERENCES "user_entity"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "session_entity" DROP CONSTRAINT "FK_8118675718bebb455bba4caf129"`,
        );
        await queryRunner.query(`DROP TABLE "session_entity"`);
        await queryRunner.query(`DROP TABLE "user_entity"`);
    }
}
