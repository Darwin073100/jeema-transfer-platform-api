import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTransferStateMachineColumns1790040505831
  implements MigrationInterface
{
  name = 'AddTransferStateMachineColumns1790040505831';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "cloud_transfer" ADD "notes" text`);
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" ADD "error_message" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" ADD "in_transit_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" ADD "approved_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" ADD "received_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" ADD "cancelled_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" ADD "error_at" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_ee6d4b77778251eaa7fcf2f365" ON "cloud_transfer" ("from_cloud_branch_id", "local_transfer_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ee6d4b77778251eaa7fcf2f365"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" DROP COLUMN "error_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" DROP COLUMN "cancelled_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" DROP COLUMN "received_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" DROP COLUMN "approved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" DROP COLUMN "in_transit_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cloud_transfer" DROP COLUMN "error_message"`,
    );
    await queryRunner.query(`ALTER TABLE "cloud_transfer" DROP COLUMN "notes"`);
  }
}
