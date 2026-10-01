import 'reflect-metadata';
import { DataSource } from 'typeorm';
import type { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

type PostgresConnectionOptions = Extract<DataSourceOptions, { type: 'postgres' }>;

/**
 * =============================================================================
 * TypeORM DataSource — SQL-First Migration Pattern
 * =============================================================================
 *
 * CRITICAL RULES (same as original Node repo):
 * ⚠️  NEVER set synchronize: true — it will auto-modify your schema
 * ⚠️  NEVER use migration:generate — always write raw SQL migrations manually
 * ⚠️  NEVER rely on entity decorators for schema definition
 * ⚠️  ALWAYS test migrations in staging before production
 *
 * MIGRATION WORKFLOW:
 *   1. npm run migration:create -- src/migrations/YourMigrationName
 *   2. Write raw SQL in up() / down()
 *   3. npm run migration:run
 *   4. Deploy to dev → qa → staging → production
 * =============================================================================
 */

const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && !process.env.DB_HOST) {
  throw new Error(
    'DB_HOST is required in production. Set DB_* env vars or load from Secrets Manager.',
  );
}

function getConnectionOptions(): Pick<
  PostgresConnectionOptions,
  'host' | 'port' | 'username' | 'password' | 'database' | 'ssl' | 'logging' | 'extra'
> {
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'myapp_dev',
    ssl:
      process.env.DB_SSL === 'true'
        ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
        : false,
    logging: process.env.DB_LOGGING === 'true',
    extra: {
      max: parseInt(process.env.DB_POOL_MAX || '20', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000', 10),
    },
  };
}

const dataSourceOptions: PostgresConnectionOptions = {
  type: 'postgres',
  ...getConnectionOptions(),
  synchronize: false, // ⚠️ NEVER change this to true
  migrationsRun: false, // ⚠️ Run migrations explicitly via CLI
  entities: [__dirname + '/../domains/**/entities/**/*.entity.{ts,js}'],
  migrations: [__dirname + '/../migrations/**/*.{ts,js}'],
  extra: getConnectionOptions().extra,
};

/** Refreshes connection options from current env vars (for in-process credential rotation). */
export function refreshDataSourceFromEnv(): void {
  const refreshed = getConnectionOptions();
  const opts = AppDataSource.options as unknown as Record<string, unknown>;
  opts.host = refreshed.host;
  opts.port = refreshed.port;
  opts.username = refreshed.username;
  opts.password = refreshed.password;
  opts.database = refreshed.database;
  opts.ssl = refreshed.ssl;
  opts.logging = refreshed.logging;
  opts.extra = refreshed.extra;
}

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
