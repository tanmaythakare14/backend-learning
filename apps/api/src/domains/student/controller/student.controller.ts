import { Controller, Post, Put, Param, Body, Res } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { StudentService } from '../service/student.service';
import { CreateStudentDto, UpdateStudentDto } from '../dto/student.dto';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { SuccessMessages } from '../../../common/constants/success-messages.constants';
import { generateResponse } from '../../../common/utils/response.util';

@ApiTags('Students')
@Controller('students')
export class StudentController {
  constructor(private readonly service: StudentService) {}

  @Post()
  @ApiOperation({ summary: 'Enroll a new student' })
  @ApiCreatedResponse({ description: 'Student created' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email already enrolled' })
  async create(@Body() body: CreateStudentDto, @Res() res: Response): Promise<Response> {
    const data = await this.service.create(body);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: SuccessMessages.CREATED,
      data,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: "Update a student's email, phone, and course — name is immutable" })
  @ApiOkResponse({ description: 'Student updated' })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Student not found' })
  @ApiConflictResponse({ description: 'Email already used by another student' })
  async update(
    @Param('id') id: string,
    @Body() body: UpdateStudentDto,
    @Res() res: Response,
  ): Promise<Response> {
    const data = await this.service.update(id, body);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      message: SuccessMessages.UPDATED,
      data,
    });
  }
}
