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
import { RegisterDto, LoginDto } from '../dto/auth.dto';
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
}
