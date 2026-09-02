import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import AppDataSource from './config/data-source';
import { HealthCheckModule } from './domains/health-check/health-check.module';
import { ExampleModule } from './domains/example/example.module';
import { AuthModule } from './domains/auth/auth.module';
import { StudentModule } from './domains/student/student.module';
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
    ExampleModule,
    AuthModule,
    StudentModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AuditMiddleware).forRoutes('*');
  }
}
