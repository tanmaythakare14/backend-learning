import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: CreateRoleTable
 * Dependencies: None
 */
export class CreateRoleTable1737480100000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);
    await queryRunner.query(`
      CREATE TABLE role (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        role VARCHAR(255) NOT NULL
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS role;`);
  }
}
