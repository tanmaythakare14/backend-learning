import { Controller, Get, Post, Put, Delete, Param, Body, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiNotFoundResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ExampleService } from '../service/example.service';
import { ExampleCreateDto, ExampleUpdateDto } from '../dto/example.dto';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { SuccessMessages } from '../../../common/constants/success-messages.constants';
import { generateResponse } from '../../../common/utils/response.util';

@ApiTags('Example')
@ApiBearerAuth()
@Controller()
export class ExampleController {
  constructor(private readonly service: ExampleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all examples' })
  @ApiOkResponse({ description: 'List of examples' })
  async getAll(@Req() req: Request, @Res() res: Response): Promise<Response> {
    const data = await this.service.getAll();
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get example by ID' })
  @ApiOkResponse({ description: 'Example found' })
  @ApiNotFoundResponse({ description: 'Example not found' })
  async getById(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const data = await this.service.getById(id);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new example' })
  @ApiCreatedResponse({ description: 'Example created' })
  async create(@Body() body: ExampleCreateDto, @Res() res: Response): Promise<Response> {
    const data = await this.service.create(body);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update example by ID' })
  @ApiOkResponse({ description: 'Example updated' })
  @ApiNotFoundResponse({ description: 'Example not found' })
  async update(
    @Param('id') id: string,
    @Body() body: ExampleUpdateDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.update(id, body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.UPDATED,
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete example by ID' })
  @ApiOkResponse({ description: 'Example deleted' })
  @ApiNotFoundResponse({ description: 'Example not found' })
  async delete(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    await this.service.delete(id);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.DELETED,
    });
  }
}
