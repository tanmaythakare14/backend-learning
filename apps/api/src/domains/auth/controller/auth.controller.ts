import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../service/auth.service';
import { SyncProfileDto } from '../dto/auth.dto';
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
}
