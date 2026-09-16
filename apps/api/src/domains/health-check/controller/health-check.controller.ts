import { Controller, Get, Req, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { SuccessMessages } from '../../../common/constants/success-messages.constants';
import { generateResponse } from '../../../common/utils/response.util';
import { Public } from '../../../common/decorators/public.decorator';

@ApiTags('Health')
@Controller()
@Public()
export class HealthCheckController {
  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  @ApiOkResponse({ description: 'Service is healthy' })
  healthCheck(@Req() req: Request, @Res() res: Response): Response {
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.SERVER_RUNNING,
      data: { status: 'active' },
      additionalFields: { timestamp: Date.now() },
    });
  }
}
