import { MigrationInterface, QueryRunner } from "typeorm";

export class DropLocalBranchOfficeUniqueIndex1790078159386 implements MigrationInterface {
    name = 'DropLocalBranchOfficeUniqueIndex1790078159386'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."uidx_cloud_est_local_branch"`);
        await queryRunner.query(`CREATE INDEX "idx_cloud_est_local_branch" ON "cloud_branch_office" ("cloud_establishment_id", "local_branch_office_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_cloud_est_local_branch"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uidx_cloud_est_local_branch" ON "cloud_branch_office" ("cloud_establishment_id", "local_branch_office_id") WHERE (deleted_at IS NULL)`);
    }

}
