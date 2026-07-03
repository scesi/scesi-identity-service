import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1783110575654 implements MigrationInterface {
    name = 'InitialMigration1783110575654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_academic_ranck_enum" AS ENUM('POSTULANTE', 'JUNIOR', 'INTERMEDIO', 'AVANZADO', 'HONORARIO')`);
        await queryRunner.query(`CREATE TYPE "public"."users_status_enum" AS ENUM('PENDIENTE', 'ACTIVO', 'INACTIVO')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "academic_ranck" "public"."users_academic_ranck_enum" NOT NULL DEFAULT 'POSTULANTE', "status" "public"."users_status_enum" NOT NULL DEFAULT 'PENDIENTE', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "refresh_tokens" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_hash" character varying NOT NULL, "user_id" uuid NOT NULL, "user_agent" character varying, "device_info" character varying, "is_revoked" boolean NOT NULL DEFAULT false, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_a7838d2ba25be1342091b6695f1" UNIQUE ("token_hash"), CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."audit_logs_action_enum" AS ENUM('LOGIN_SUCCESS', 'LOGIN_FAILED', 'REGISTER_SUCCESS', 'TOKEN_REFRESH', 'TOKEN_REVOKED', 'LOGOUT')`);
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token_id" uuid, "user_id" uuid, "action" "public"."audit_logs_action_enum" NOT NULL, "ip_address" character varying, "user_agent" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6e74f330e34555ae90068b03928" UNIQUE ("name"), CONSTRAINT "PK_fa9e7a265809eafa9e1f47122e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_id" uuid NOT NULL, "assigned_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_23ed6f04fe43066df08379fd034" UNIQUE ("user_id", "role_id"), CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resource" character varying NOT NULL, "action" character varying NOT NULL, CONSTRAINT "UQ_7331684c0c5b063803a425001a0" UNIQUE ("resource", "action"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "role_permissions" ("id_role_permission" uuid NOT NULL, "role_id" uuid NOT NULL, "permission_id" uuid NOT NULL, CONSTRAINT "UQ_25d24010f53bb80b78e412c9656" UNIQUE ("role_id", "permission_id"), CONSTRAINT "PK_24a4b96b060d0a0fee0f8702396" PRIMARY KEY ("id_role_permission"))`);
        await queryRunner.query(`CREATE TABLE "xp_rules" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "category" character varying NOT NULL, "activity" character varying NOT NULL, "sub_activity" character varying NOT NULL, "base_points" integer NOT NULL DEFAULT '0', "observation" character varying, "is_active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_3e20002d8a5f5b9912dd49c127b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "xp_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "rule_id" uuid NOT NULL, "amount" integer NOT NULL, "multiplier_applied" double precision, "reason" character varying NOT NULL, "allocated_by" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_c4361b4eac7662c2e46cdb164d9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "audit_logs" ADD CONSTRAINT "FK_8034cddf4f0af7fb03353d49982" FOREIGN KEY ("token_id") REFERENCES "refresh_tokens"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_178199805b901ccd220ab7740ec" FOREIGN KEY ("role_id") REFERENCES "auth_roles"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "xp_history" ADD CONSTRAINT "FK_744d5707400882ccc586f0a5d09" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "xp_history" ADD CONSTRAINT "FK_6abd4bb6cd2f34c1788614c1888" FOREIGN KEY ("rule_id") REFERENCES "xp_rules"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "xp_history" DROP CONSTRAINT "FK_6abd4bb6cd2f34c1788614c1888"`);
        await queryRunner.query(`ALTER TABLE "xp_history" DROP CONSTRAINT "FK_744d5707400882ccc586f0a5d09"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_178199805b901ccd220ab7740ec"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_8034cddf4f0af7fb03353d49982"`);
        await queryRunner.query(`ALTER TABLE "audit_logs" DROP CONSTRAINT "FK_bd2726fd31b35443f2245b93ba0"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`DROP TABLE "xp_history"`);
        await queryRunner.query(`DROP TABLE "xp_rules"`);
        await queryRunner.query(`DROP TABLE "role_permissions"`);
        await queryRunner.query(`DROP TABLE "permissions"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP TABLE "auth_roles"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
        await queryRunner.query(`DROP TYPE "public"."audit_logs_action_enum"`);
        await queryRunner.query(`DROP TABLE "refresh_tokens"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_academic_ranck_enum"`);
    }

}
