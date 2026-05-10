import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1778258324407 implements MigrationInterface {
    name = 'InitialSchema1778258324407'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cloud_establishment" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "cloud_establishment_id" BIGSERIAL NOT NULL, "name" character varying(250) NOT NULL, "enrollmentKey" character varying(255) NOT NULL, CONSTRAINT "UQ_ba009d69239a10fad5797b595d8" UNIQUE ("name"), CONSTRAINT "UQ_25e6a033f828817854bab6e5ca5" UNIQUE ("enrollmentKey"), CONSTRAINT "PK_b09cefd94bafe20573b5b6bd95c" PRIMARY KEY ("cloud_establishment_id"))`);
        await queryRunner.query(`CREATE TABLE "cloud_branch_office" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "cloud_branch_office_id" BIGSERIAL NOT NULL, "local_branch_office_id" bigint NOT NULL, "cloud_establishment_id" bigint NOT NULL, "name" character varying(250) NOT NULL, CONSTRAINT "PK_a87791e172ee569353e5740663e" PRIMARY KEY ("cloud_branch_office_id"))`);
        await queryRunner.query(`ALTER TABLE "cloud_branch_office" ADD CONSTRAINT "FK_c9d890ec16e5dabf4dc79508da0" FOREIGN KEY ("cloud_establishment_id") REFERENCES "cloud_establishment"("cloud_establishment_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cloud_branch_office" DROP CONSTRAINT "FK_c9d890ec16e5dabf4dc79508da0"`);
        await queryRunner.query(`DROP TABLE "cloud_branch_office"`);
        await queryRunner.query(`DROP TABLE "cloud_establishment"`);
    }

}
