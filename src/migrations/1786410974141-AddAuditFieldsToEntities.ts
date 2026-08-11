import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAuditFieldsToEntities1786410974141 implements MigrationInterface {
    name = 'AddAuditFieldsToEntities1786410974141'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deleted_by" uuid`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "deleted_by" uuid`);
        await queryRunner.query(`ALTER TABLE "auth_roles" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "auth_roles" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "auth_roles" ADD "deleted_by" uuid`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "updated_by" uuid`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "deleted_by" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "auth_roles" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "auth_roles" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "auth_roles" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_by"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_by"`);
    }

}
