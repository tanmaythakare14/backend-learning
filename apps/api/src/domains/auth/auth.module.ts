import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthRepository } from './repository/auth.repository';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { LoggerService } from '../../common/utils/logger.service';
import { validate, validateLogin } from '../../common/middleware/validate.middleware';
import { registerSchema, loginSchema } from './validator/auth.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthRepository, AuthService, LoggerService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // Explicit per rules/api.md-style validation wiring — validate() isn't automatic.
    // Scoped per-route (not .forRoutes(AuthController)) since register and login
    // each need a different schema and a different failure status (400 vs 401).
    consumer
      .apply(validate(registerSchema))
      .forRoutes({ path: 'auth/register', method: RequestMethod.POST });
    consumer
      .apply(validateLogin(loginSchema))
      .forRoutes({ path: 'auth/login', method: RequestMethod.POST });
  }
}
