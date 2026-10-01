import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { User } from './entities/user.entity';
import { AuthRepository } from './repository/auth.repository';
import { AuthService } from './service/auth.service';
import { AuthController } from './controller/auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LoggerService } from '../../common/utils/logger.service';
import { validate } from '../../common/middleware/validate.middleware';
import { syncProfileSchema } from './validator/auth.validator';

@Module({
  imports: [TypeOrmModule.forFeature([User]), PassportModule],
  providers: [AuthRepository, AuthService, LoggerService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(validate(syncProfileSchema))
      .forRoutes({ path: 'auth/sync', method: RequestMethod.POST });
  }
}
