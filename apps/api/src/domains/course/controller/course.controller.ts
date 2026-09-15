import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CourseService } from '../service/course.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  UpdateCourseStatusDto,
  ListCoursesQuery,
} from '../dto/course.dto';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { SuccessMessages } from '../../../common/constants/success-messages.constants';
import { generateResponse } from '../../../common/utils/response.util';

@ApiTags('Courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly service: CourseService) {}

  @Get()
  @ApiOperation({ summary: 'List courses, filterable by status' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'deactivated', 'deleted'] })
  @ApiOkResponse({ description: 'List of courses' })
  @ApiBadRequestResponse({ description: 'Invalid status value' })
  async findAll(@Query() query: ListCoursesQuery, @Res() res: Response): Promise<Response> {
    const data = await this.service.findAll(query);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiCreatedResponse({ description: 'Course created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  async create(@Body() body: CreateCourseDto, @Res() res: Response): Promise<Response> {
    const data = await this.service.create(body);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: "Update a course's name, description, and thumbnail" })
  @ApiOkResponse({ description: 'Course updated' })
  @ApiBadRequestResponse({ description: 'Validation failed, or invalid id' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateCourseDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.update(id, body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.UPDATED,
      data,
    });
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate or deactivate a course' })
  @ApiOkResponse({ description: 'Status updated' })
  @ApiBadRequestResponse({ description: 'Invalid id or status' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateCourseStatusDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.updateStatus(id, body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.UPDATED,
      data,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a course (sets status to deleted)' })
  @ApiOkResponse({ description: 'Course deleted' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiNotFoundResponse({ description: 'Course not found' })
  async remove(@Param('id') id: string, @Res() res: Response): Promise<Response> {
    const data = await this.service.delete(id);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.DELETED,
      data,
    });
  }
}
