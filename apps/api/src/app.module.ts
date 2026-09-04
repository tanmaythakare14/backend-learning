import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './config/data-source';
import { HealthCheckModule } from './domains/health-check/health-check.module';
import { AuthModule } from './domains/auth/auth.module';
import { StudentModule } from './domains/student/student.module';
import { ExampleModule } from './domains/example/example.module';
import { LoggingModule } from './common/logging.module';
import { AuditMiddleware } from './common/middleware/audit.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({ ...AppDataSource.options }),
    }),
    LoggingModule,
    HealthCheckModule,
    AuthModule,
    StudentModule,
    // ExampleModule's routes are intentionally last — its bare @Controller()
    // + @Get(':id') greedily matches ANY GET /api/v1/<one-segment> path, so
    // any sibling module with a same-shape route (e.g. this domain's
    // GET /students) must be registered before it or Express's registration-
    // order routing sends the request to Example instead. See CLAUDE.md's
    // "Known pre-existing bugs" — same root cause as the health/example
    // collision, just triggered by a different route this time.
    ExampleModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
