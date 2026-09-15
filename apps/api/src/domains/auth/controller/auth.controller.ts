import { Controller, Post, Body, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AuthService } from '../service/auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { SuccessMessages } from '../../../common/constants/success-messages.constants';
import { generateResponse } from '../../../common/utils/response.util';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new account' })
  @ApiCreatedResponse({ description: 'Account created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already registered' })
  async register(@Body() body: RegisterDto, @Res() res: Response): Promise<Response> {
    const data = await this.service.register(body);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate and receive a JWT' })
  @ApiOkResponse({ description: 'Authenticated' })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  async login(@Body() body: LoginDto, @Res() res: Response): Promise<Response> {
    const data = await this.service.login(body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      data,
    });
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset link by email' })
  @ApiOkResponse({ description: 'Always 200 — does not reveal whether the email is registered' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async forgotPassword(@Body() body: ForgotPasswordDto, @Res() res: Response): Promise<Response> {
    await this.service.requestPasswordReset(body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: 'If an account exists for this email, a reset link has been sent.',
    });
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Set a new password using the token from the emailed reset link' })
  @ApiOkResponse({ description: 'Password reset' })
  @ApiBadRequestResponse({ description: 'Invalid/expired token, or validation failed' })
  async resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response): Promise<Response> {
    await this.service.resetPassword(body);
    return generateResponse(res, { statusCode: HttpStatus.OK, message: SuccessMessages.UPDATED });
  }
}
