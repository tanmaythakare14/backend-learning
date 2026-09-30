import { Controller, Get, Post, Put, Body, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { ChangePasswordDto, SyncProfileDto, UpdateProfileDto } from '../dto/auth.dto';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { generateResponse } from '../../../common/utils/response.util';

@ApiTags('Auth')
@ApiBearerAuth()
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Post('sync')
  @ApiOperation({
    summary:
      'Upsert the local profile row for the authenticated Auth0 user (just-in-time provisioning)',
  })
  @ApiOkResponse({ description: 'Profile synced' })
  async sync(
    @Req() req: Request,
    @Body() body: SyncProfileDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.syncProfile(req.user!.sub, body);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Get('me')
  @ApiOperation({ summary: 'Profile of the authenticated user' })
  @ApiOkResponse({ description: 'Profile returned' })
  async getMe(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const data = await this.service.getProfile(req.user!.sub);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Put('me')
  @ApiOperation({
    summary: 'Update the profile. An email change is written to Auth0 as well as our database.',
  })
  @ApiOkResponse({ description: 'Profile updated' })
  async updateMe(
    @Req() req: Request,
    @Body() body: UpdateProfileDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.updateProfile(req.user!.sub, body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: 'Profile updated successfully.',
      data,
    });
  }

  @Post('change-password')
  @ApiOperation({
    summary: "Change the authenticated user's Auth0 password (Settings > Change password)",
  })
  @ApiOkResponse({ description: 'Password changed' })
  async changePassword(
    @Req() req: Request,
    @Body() body: ChangePasswordDto,
    @Res() res: Response,
  ): Promise<Response> {
    await this.service.changePassword(req.user!.sub, body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: 'Password updated successfully.',
    });
  }
}
