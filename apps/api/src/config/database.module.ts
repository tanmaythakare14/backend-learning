import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './data-source';

/**
 * DatabaseModule wires the existing TypeORM DataSource into NestJS DI.
 * The DataSource itself is configured in data-source.ts following the
 * SQL-first migration pattern from the original Node repo.
 */
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        ...AppDataSource.options,
      }),
    }),
  ],
})
export class DatabaseModule {}
