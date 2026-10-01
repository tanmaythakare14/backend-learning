import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiConsumes,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AssignmentService } from '../service/assignment.service';
import { StudentIdentityService } from '../service/student-identity.service';
import type { ListAssignmentsQuery } from '../dto/assignment.dto';
import {
  assignmentFileStorage,
  MAX_SUBMISSION_FILE_BYTES,
  submissionFileFilter,
} from '../utils/assignment-storage.util';
import { HttpStatus } from '../../../common/constants/http-status.constants';
import { generateResponse } from '../../../common/utils/response.util';

/**
 * The GET routes and the submission route are the signed-in student's own view: who they
 * are is worked out from their verified token, never from a parameter, so there is no way
 * to ask for another student's assignments. POST /assignments is the odd one out — it is
 * how an assignment is created, and is not tied to any student.
 */
@ApiTags('Assignments')
@ApiBearerAuth()
@Controller('assignments')
export class AssignmentController {
  constructor(
    private readonly service: AssignmentService,
    private readonly identity: StudentIdentityService,
  ) {}

  @Get()
  @ApiOperation({ summary: "The student's assignment table — filterable, searchable, paginated" })
  @ApiQuery({ name: 'status', required: false, enum: ['todo', 'submitted', 'overdue'] })
  @ApiQuery({ name: 'search', required: false, description: 'Matches title or course name' })
  @ApiQuery({ name: 'page', required: false, description: 'Default 1' })
  @ApiQuery({ name: 'limit', required: false, description: 'Default 20, max 100' })
  @ApiOkResponse({ description: 'Rows, plus `meta` (paging) and `counts` (per-tab totals)' })
  @ApiBadRequestResponse({ description: 'Invalid status, page or limit' })
  @ApiForbiddenResponse({ description: 'The signed-in user is not an enrolled student' })
  async list(
    @Req() req: Request,
    @Query() query: ListAssignmentsQuery,
    @Res() res: Response,
  ): Promise<Response> {
    const student = await this.identity.resolve(req);
    const { rows, meta, counts } = await this.service.list(student, query);
    return generateResponse(res, {
      statusCode: HttpStatus.OK,
      data: rows,
      additionalFields: { meta, counts },
    });
  }

  @Post()
  @ApiOperation({
    summary:
      'Create an assignment. A quiz needs at least one question (single choice, multiple choice, short paragraph or long paragraph); a written assignment has none.',
    description:
      'No role check yet — any signed-in user can call this until the app has roles. Choice questions need 2-5 options and a valid answer key; paragraph questions take no options.',
  })
  @ApiCreatedResponse({
    description: 'Created — returns the assignment with its questions and answer key',
  })
  @ApiBadRequestResponse({
    description: 'Invalid body, past due date, or the course is not active',
  })
  @ApiNotFoundResponse({ description: 'No course with that id' })
  async create(@Body() body: unknown, @Res() res: Response): Promise<Response> {
    const data = await this.service.create(body);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: 'Assignment created successfully.',
      data,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'One assignment with instructions, quiz questions (never the answer key) and my submission',
  })
  @ApiOkResponse({ description: 'Assignment detail' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiForbiddenResponse({ description: 'The signed-in user is not an enrolled student' })
  @ApiNotFoundResponse({ description: 'Not found, or not part of your course' })
  async getById(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const student = await this.identity.resolve(req);
    const data = await this.service.getById(student, id);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Get(':id/score')
  @ApiOperation({
    summary:
      'My score: choice-question marks for a quiz, with a per-question breakdown once the due date has passed',
  })
  @ApiOkResponse({ description: 'Score' })
  @ApiBadRequestResponse({ description: 'Invalid id' })
  @ApiForbiddenResponse({ description: 'The signed-in user is not an enrolled student' })
  @ApiNotFoundResponse({ description: 'Not found, or nothing submitted yet' })
  async getScore(
    @Req() req: Request,
    @Param('id') id: string,
    @Res() res: Response,
  ): Promise<Response> {
    const student = await this.identity.resolve(req);
    const data = await this.service.getScore(student, id);
    return generateResponse(res, { statusCode: HttpStatus.OK, data });
  }

  @Post(':id/submission')
  @ApiOperation({
    summary:
      'Hand in work. Written: multipart with `answerText` and/or `file` (resubmitting replaces it). Quiz: JSON `{ choices, texts }`, one attempt only.',
  })
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiCreatedResponse({ description: 'Submitted — returns the updated assignment' })
  @ApiBadRequestResponse({ description: 'Empty submission, bad file type/size, or invalid id' })
  @ApiForbiddenResponse({ description: 'The signed-in user is not an enrolled student' })
  @ApiNotFoundResponse({ description: 'Not found, or not part of your course' })
  @ApiConflictResponse({ description: 'This quiz has already been submitted' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: assignmentFileStorage,
      fileFilter: submissionFileFilter,
      limits: { fileSize: MAX_SUBMISSION_FILE_BYTES },
    }),
  )
  async submit(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() body: unknown,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res() res: Response,
  ): Promise<Response> {
    // multer has already written the file by now. The service removes it if the submission
    // fails; this covers the one failure before the service is reached — the caller turning
    // out not to be an enrolled student.
    let student;
    try {
      student = await this.identity.resolve(req);
    } catch (error) {
      if (file) await this.service.discardUploadedFile(file);
      throw error;
    }

    const data = await this.service.submit(student, id, body, file);
    return generateResponse(res, {
      statusCode: HttpStatus.CREATED,
      message: 'Submitted successfully.',
      data,
    });
  }
}
