import { MigrationInterface, QueryRunner } from "typeorm";

export class AlignSchemaWithDbmlDiagram1787802042766 implements MigrationInterface {
    name = 'AlignSchemaWithDbmlDiagram1787802042766'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cloud_transfer_status_enum" AS ENUM('Pendiente', 'En_Transito', 'Aprobada', 'Recibida', 'Cancelada', 'Error')`);
        await queryRunner.query(`CREATE TABLE "cloud_transfer" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, "cloud_transfer_id" BIGSERIAL NOT NULL, "cloud_establishment_id" bigint NOT NULL, "from_cloud_branch_id" bigint NOT NULL, "to_cloud_branch_id" bigint NOT NULL, "local_transfer_id" bigint NOT NULL, "payload" jsonb NOT NULL, "status" "public"."cloud_transfer_status_enum" NOT NULL DEFAULT 'Pendiente', CONSTRAINT "PK_62f00fc404382d0a3e4ee931289" PRIMARY KEY ("cloud_transfer_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bb159b384af3408ab89d3f8cf0" ON "cloud_transfer" ("to_cloud_branch_id", "status") `);
        await queryRunner.query(`ALTER TABLE "cloud_establishment" RENAME COLUMN "enrollmentKey" TO "enrollment_key"`);
        await queryRunner.query(`ALTER TABLE "cloud_branch_office" ADD "is_active" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "cloud_establishment" DROP CONSTRAINT "UQ_ba009d69239a10fad5797b595d8"`);
        await queryRunner.query(`ALTER TABLE "cloud_establishment" ALTER COLUMN "name" TYPE character varying(150)`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uidx_cloud_est_local_branch" ON "cloud_branch_office" ("cloud_establishment_id", "local_branch_office_id") WHERE "deleted_at" IS NULL`);
        await queryRunner.query(`ALTER TABLE "cloud_transfer" ADD CONSTRAINT "FK_d15281f72a7edd1ed19a0525b93" FOREIGN KEY ("cloud_establishment_id") REFERENCES "cloud_establishment"("cloud_establishment_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cloud_transfer" ADD CONSTRAINT "FK_0b299683c96e7f5ad7f92c8192c" FOREIGN KEY ("from_cloud_branch_id") REFERENCES "cloud_branch_office"("cloud_branch_office_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cloud_transfer" ADD CONSTRAINT "FK_eab92e960a697cba2fb618eed32" FOREIGN KEY ("to_cloud_branch_id") REFERENCES "cloud_branch_office"("cloud_branch_office_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cloud_transfer" DROP CONSTRAINT "FK_eab92e960a697cba2fb618eed32"`);
        await queryRunner.query(`ALTER TABLE "cloud_transfer" DROP CONSTRAINT "FK_0b299683c96e7f5ad7f92c8192c"`);
        await queryRunner.query(`ALTER TABLE "cloud_transfer" DROP CONSTRAINT "FK_d15281f72a7edd1ed19a0525b93"`);
        await queryRunner.query(`DROP INDEX "public"."uidx_cloud_est_local_branch"`);
        await queryRunner.query(`ALTER TABLE "cloud_establishment" ALTER COLUMN "name" TYPE character varying(250)`);
        await queryRunner.query(`ALTER TABLE "cloud_establishment" ADD CONSTRAINT "UQ_ba009d69239a10fad5797b595d8" UNIQUE ("name")`);
        await queryRunner.query(`ALTER TABLE "cloud_branch_office" DROP COLUMN "is_active"`);
        await queryRunner.query(`ALTER TABLE "cloud_establishment" RENAME COLUMN "enrollment_key" TO "enrollmentKey"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bb159b384af3408ab89d3f8cf0"`);
        await queryRunner.query(`DROP TABLE "cloud_transfer"`);
        await queryRunner.query(`DROP TYPE "public"."cloud_transfer_status_enum"`);
    }

}
