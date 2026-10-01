import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration: AddAddressToStudentTable
 * Dependencies: CreateStudentTable
 *
 * Columns are nullable — existing student rows predate this feature and have
 * no address on file. New creates/updates always send all five (enforced by
 * Joi in student.validator.ts), so NULL only ever shows up on historical rows.
 *
 * ⚠️ Write raw SQL only. Never use migration:generate.
 */
export class AddAddressToStudentTable1737480500000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE student
        ADD COLUMN street_address VARCHAR(255),
        ADD COLUMN city           VARCHAR(255),
        ADD COLUMN state          VARCHAR(255),
        ADD COLUMN zip_code       VARCHAR(20),
        ADD COLUMN country        VARCHAR(255);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE student
        DROP COLUMN IF EXISTS street_address,
        DROP COLUMN IF EXISTS city,
        DROP COLUMN IF EXISTS state,
        DROP COLUMN IF EXISTS zip_code,
        DROP COLUMN IF EXISTS country;
    `);
  }
}
