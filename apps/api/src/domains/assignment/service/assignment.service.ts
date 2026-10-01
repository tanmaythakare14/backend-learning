import { Injectable } from '@nestjs/common';
import { promises as fs } from 'fs';
import { basename, join } from 'path';
import type { ObjectSchema } from 'joi';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { isValidUuid } from '../../../common/utils/uuid.util';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../../../common/exceptions';
import { Student } from '../../student/entities/student.entity';
import {
  AssignmentRepository,
  type AssignmentRow,
  type QuestionWithOptions,
} from '../repository/assignment.repository';
import type { QuizAnswers, QuizAttempt } from '../entities/quiz-attempt.entity';
import type { Submission } from '../entities/submission.entity';
import type {
  AssignmentDetailOutDto,
  AssignmentRowOutDto,
  CreateAssignmentDto,
  CreatedAssignmentOutDto,
  AssignmentTab,
  ListAssignmentsQuery,
  PageMeta,
  QuizAttemptOutDto,
  QuizQuestionOutDto,
  ScoreBreakdownItemOutDto,
  ScoreOutDto,
  SubmissionOutDto,
  TabCounts,
} from '../dto/assignment.dto';
import {
  createAssignmentSchema,
  quizAnswersSchema,
  writtenSubmissionSchema,
} from '../validator/assignment.validator';
import {
  deriveState,
  isChoiceCorrect,
  isChoiceType,
  isRevealed,
  percentage,
  sortRows,
  tabForState,
} from '../utils/assignment.util';
import { ASSIGNMENT_UPLOADS_DIR } from '../utils/assignment-storage.util';

const VALID_TABS: AssignmentTab[] = ['todo', 'submitted', 'overdue'];
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface AssignmentListResult {
  rows: AssignmentRowOutDto[];
  meta: PageMeta;
  counts: TabCounts;
}

@Injectable()
export class AssignmentService {
  constructor(
    private readonly repository: AssignmentRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
  ) {}

  // ── Create (admin) ──────────────────────────────────────────────────────

  /**
   * Publishes a new assignment. The body is validated here with the Joi schema — the same
   * place the submit bodies are — so the rules hold however the service is reached. The
   * only rule on the question count is "a quiz has at least one".
   *
   * There is no role system yet, so this is open to any signed-in user; who may create
   * assignments is a decision for a role guard to enforce, not something this method knows.
   */
  async create(body: unknown): Promise<CreatedAssignmentOutDto> {
    const input = this.parse<CreateAssignmentDto>(createAssignmentSchema, body ?? {});

    const course = await this.repository.findCourseById(input.courseId);
    if (!course) throw new NotFoundException('Course not found.');
    if (course.status !== 'active') throw new BadRequestException('Choose an active course.');

    const created = await this.repository.createAssignment(input);

    this.audit.log('AssignmentService', 'Assignment created', {
      assignmentId: created.assignment.id,
      courseId: course.id,
      kind: input.kind,
      questionCount: created.questions.length,
    });

    return {
      id: created.assignment.id,
      kind: input.kind,
      title: input.title,
      courseId: course.id,
      courseName: course.name,
      instructions: input.instructions,
      dueAt: input.dueAt,
      status: created.assignment.status,
      createdAt: created.assignment.createdAt,
      questions: created.questions,
    };
  }

  // ── Table view ──────────────────────────────────────────────────────────

  /**
   * The student's assignment table. The set is small (one course's worth), so it is
   * filtered, counted and paged in memory — which also keeps the tab counts and the
   * state rules in a single place instead of repeating them in SQL.
   */
  async list(student: Student, query: ListAssignmentsQuery): Promise<AssignmentListResult> {
    const tab = this.parseTab(query.status);
    const page = this.parsePositiveInt(query.page, DEFAULT_PAGE, 'page');
    const limit = Math.min(this.parsePositiveInt(query.limit, DEFAULT_LIMIT, 'limit'), MAX_LIMIT);
    const search = query.search?.trim().toLowerCase() ?? '';

    const all = (await this.repository.findRowsForStudent(student.id, student.course)).map((row) =>
      this.toRowDto(row),
    );

    // Counts reflect the search but not the status filter, so tab badges stay accurate.
    const searched = search
      ? all.filter(
          (row) =>
            row.title.toLowerCase().includes(search) ||
            row.courseName.toLowerCase().includes(search),
        )
      : all;

    const counts: TabCounts = { todo: 0, submitted: 0, overdue: 0 };
    for (const row of searched) counts[tabForState(row.state)] += 1;

    const inTab = tab ? searched.filter((row) => tabForState(row.state) === tab) : searched;
    const sorted = sortRows(inTab, tab);

    const total = sorted.length;
    const meta: PageMeta = {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };

    return { rows: sorted.slice((page - 1) * limit, page * limit), meta, counts };
  }

  // ── One assignment ──────────────────────────────────────────────────────

  async getById(student: Student, id: string): Promise<AssignmentDetailOutDto> {
    this.requireUuid(id);
    const row = await this.requireRow(student, id);
    return this.buildDetail(student, row);
  }

  // ── Submit ──────────────────────────────────────────────────────────────

  /**
   * One route, two shapes: a written assignment takes `answerText` and/or a file
   * (and can be resubmitted); a quiz takes `{ choices, texts }` and is one attempt.
   * Any uploaded file that doesn't end up stored is deleted again.
   */
  async submit(
    student: Student,
    id: string,
    body: unknown,
    file: Express.Multer.File | undefined,
  ): Promise<AssignmentDetailOutDto> {
    let row: AssignmentRow;
    try {
      this.requireUuid(id);
      row = await this.requireRow(student, id);
      const isLate = Date.now() > row.dueAt.getTime();

      if (row.kind === 'quiz') {
        await this.submitQuiz(student, row, body, file, isLate);
      } else {
        await this.submitWritten(student, row, body, file, isLate);
      }

      this.audit.log('AssignmentService', 'Assignment submitted', {
        assignmentId: row.id,
        studentId: student.id,
        kind: row.kind,
        isLate,
      });
    } catch (error) {
      // Only the storing step is covered: once it has succeeded the file is kept.
      if (file) await this.discardFile(file.filename);
      throw error;
    }

    return this.buildDetail(student, row);
  }

  /** For a file multer stored before the request was rejected outside this service. */
  async discardUploadedFile(file: Express.Multer.File): Promise<void> {
    await this.discardFile(file.filename);
  }

  // ── Score ───────────────────────────────────────────────────────────────

  async getScore(student: Student, id: string): Promise<ScoreOutDto> {
    this.requireUuid(id);
    const row = await this.requireRow(student, id);

    if (row.kind === 'written') {
      const submission = await this.repository.findSubmission(row.id, student.id);
      if (!submission) throw new NotFoundException('You have not submitted this assignment yet.');
      return {
        assignmentId: row.id,
        kind: 'written',
        submittedAt: submission.submittedAt,
        isLate: submission.isLate,
        choiceScore: null,
        reviewStatus: 'pending',
        breakdown: null,
      };
    }

    const attempt = await this.repository.findAttempt(row.id, student.id);
    if (!attempt) throw new NotFoundException('You have not submitted this quiz yet.');

    const questions = await this.repository.findQuestionsWithOptions(row.id);
    return {
      assignmentId: row.id,
      kind: 'quiz',
      submittedAt: attempt.submittedAt,
      isLate: attempt.isLate,
      choiceScore: {
        correct: attempt.choiceCorrect,
        total: attempt.choiceTotal,
        percentage: percentage(attempt.choiceCorrect, attempt.choiceTotal),
      },
      reviewStatus: attempt.reviewStatus,
      breakdown: isRevealed(row.dueAt) ? this.buildBreakdown(questions, attempt.answers) : null,
    };
  }

  // ── Submission handlers ─────────────────────────────────────────────────

  private async submitWritten(
    student: Student,
    row: AssignmentRow,
    body: unknown,
    file: Express.Multer.File | undefined,
    isLate: boolean,
  ): Promise<void> {
    const { answerText } = this.parse<{ answerText: string }>(writtenSubmissionSchema, body ?? {});
    const text = answerText.trim() || null;

    if (!text && !file) {
      throw new BadRequestException('Write an answer or attach a file.');
    }

    const previous = await this.repository.findSubmission(row.id, student.id);
    const saved = await this.repository.upsertSubmission({
      assignmentId: row.id,
      studentId: student.id,
      answerText: text,
      file: file
        ? {
            name: file.originalname.slice(0, 255),
            path: file.filename,
            size: file.size,
            mimeType: file.mimetype,
          }
        : null,
      isLate,
    });

    // A resubmission replaces the earlier one entirely, so its old file is now orphaned.
    if (previous?.filePath && previous.filePath !== saved.filePath) {
      await this.discardFile(previous.filePath);
    }
  }

  private async submitQuiz(
    student: Student,
    row: AssignmentRow,
    body: unknown,
    file: Express.Multer.File | undefined,
    isLate: boolean,
  ): Promise<void> {
    if (file) throw new BadRequestException('Quizzes do not accept file attachments.');

    const submitted = this.parse<QuizAnswers>(quizAnswersSchema, body ?? {});
    const questions = await this.repository.findQuestionsWithOptions(row.id);

    // Keep only answers to real questions and real options — a client can send anything.
    const answers: QuizAnswers = { choices: {}, texts: {} };
    let choiceCorrect = 0;
    let choiceTotal = 0;

    for (const { question, options } of questions) {
      if (!isChoiceType(question.type)) {
        const text = (submitted.texts[question.id] ?? '').trim();
        if (text) answers.texts[question.id] = text;
        continue;
      }

      const validIds = new Set(options.map((option) => option.id));
      const picked = (submitted.choices[question.id] ?? []).filter((optionId) =>
        validIds.has(optionId),
      );
      // A single-choice question can only ever hold one answer.
      const kept = question.type === 'single' ? picked.slice(0, 1) : [...new Set(picked)];
      if (kept.length > 0) answers.choices[question.id] = kept;

      const correctIds = options.filter((option) => option.isCorrect).map((option) => option.id);
      choiceTotal += 1;
      if (isChoiceCorrect(kept, correctIds)) choiceCorrect += 1;
    }

    // Nothing for a person to mark when every question is a choice question.
    const needsReview = questions.some(({ question }) => !isChoiceType(question.type));

    const attempt = await this.repository.createAttempt({
      assignmentId: row.id,
      studentId: student.id,
      answers,
      choiceCorrect,
      choiceTotal,
      reviewStatus: needsReview ? 'pending' : 'graded',
      isLate,
    });
    if (!attempt) throw new ConflictException('You have already submitted this quiz.');
  }

  // ── Mapping ─────────────────────────────────────────────────────────────

  private toRowDto(row: AssignmentRow): AssignmentRowOutDto {
    const handedIn = row.submittedAt ? { isLate: row.isLate === true } : null;
    return {
      id: row.id,
      kind: row.kind,
      title: row.title,
      courseName: row.courseName,
      dueAt: row.dueAt,
      questionCount: row.questionCount,
      state: deriveState(row.dueAt, row.kind, handedIn, row.hasWrittenQuestion),
      submittedAt: row.submittedAt,
    };
  }

  private async buildDetail(student: Student, row: AssignmentRow): Promise<AssignmentDetailOutDto> {
    const isQuiz = row.kind === 'quiz';
    const [questions, submission, attempt] = await Promise.all([
      isQuiz ? this.repository.findQuestionsWithOptions(row.id) : Promise.resolve([]),
      isQuiz ? Promise.resolve(null) : this.repository.findSubmission(row.id, student.id),
      isQuiz ? this.repository.findAttempt(row.id, student.id) : Promise.resolve(null),
    ]);

    const handedIn = submission ?? attempt;
    return {
      id: row.id,
      kind: row.kind,
      title: row.title,
      courseName: row.courseName,
      instructions: row.instructions,
      dueAt: row.dueAt,
      state: deriveState(
        row.dueAt,
        row.kind,
        handedIn ? { isLate: handedIn.isLate } : null,
        questions.some(({ question }) => !isChoiceType(question.type)),
      ),
      submission: submission ? this.toSubmissionDto(submission) : null,
      questions: this.toQuestionDtos(questions),
      quizAttempt: attempt ? this.toAttemptDto(attempt, questions, row.dueAt) : null,
    };
  }

  /** Deliberately builds each option from `id` and `label` only — `isCorrect` is never copied. */
  private toQuestionDtos(questions: QuestionWithOptions[]): QuizQuestionOutDto[] {
    return questions.map(({ question, options }) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt,
      options: options.map((option) => ({ id: option.id, label: option.label })),
    }));
  }

  private toSubmissionDto(submission: Submission): SubmissionOutDto {
    return {
      id: submission.id,
      answerText: submission.answerText,
      fileName: submission.fileName,
      fileSize: submission.fileSize,
      submittedAt: submission.submittedAt,
      isLate: submission.isLate,
    };
  }

  private toAttemptDto(
    attempt: QuizAttempt,
    questions: QuestionWithOptions[],
    dueAt: Date,
  ): QuizAttemptOutDto {
    return {
      id: attempt.id,
      answers: attempt.answers,
      submittedAt: attempt.submittedAt,
      isLate: attempt.isLate,
      choiceScore: { correct: attempt.choiceCorrect, total: attempt.choiceTotal },
      reviewStatus: attempt.reviewStatus,
      correctAnswers: isRevealed(dueAt) ? this.correctAnswerMap(questions) : null,
    };
  }

  private correctAnswerMap(questions: QuestionWithOptions[]): Record<string, string[]> {
    return Object.fromEntries(
      questions
        .filter(({ question }) => isChoiceType(question.type))
        .map(({ question, options }) => [
          question.id,
          options.filter((option) => option.isCorrect).map((option) => option.id),
        ]),
    );
  }

  private buildBreakdown(
    questions: QuestionWithOptions[],
    answers: QuizAnswers,
  ): ScoreBreakdownItemOutDto[] {
    return questions
      .filter(({ question }) => isChoiceType(question.type))
      .map(({ question, options }) => {
        const correctOptionIds = options
          .filter((option) => option.isCorrect)
          .map((option) => option.id);
        return {
          questionId: question.id,
          isCorrect: isChoiceCorrect(answers.choices[question.id] ?? [], correctOptionIds),
          correctOptionIds,
        };
      });
  }

  // ── Guards and parsing ──────────────────────────────────────────────────

  /** 404 — not 403 — for another course's assignment, so ids can't be probed for existence. */
  private async requireRow(student: Student, id: string): Promise<AssignmentRow> {
    const row = await this.repository.findRowForStudent(id, student.id, student.course);
    if (!row) throw new NotFoundException(`Assignment with ID ${id} not found`);
    return row;
  }

  /** A malformed id must 400 here — a raw Postgres uuid error would surface as a bare 500. */
  private requireUuid(id: string): void {
    if (!isValidUuid(id)) {
      throw new BadRequestException(`"${id}" is not a valid assignment id`);
    }
  }

  private parseTab(value: string | undefined): AssignmentTab | undefined {
    if (value === undefined || value === '') return undefined;
    if (!VALID_TABS.includes(value as AssignmentTab)) {
      throw new BadRequestException(
        `"${value}" is not a valid status — use one of: ${VALID_TABS.join(', ')}`,
      );
    }
    return value as AssignmentTab;
  }

  private parsePositiveInt(value: string | undefined, fallback: number, name: string): number {
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`"${name}" must be a positive whole number`);
    }
    return parsed;
  }

  private parse<T>(schema: ObjectSchema, value: unknown): T {
    const { error, value: parsed } = schema.validate(value, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      throw new BadRequestException(error.details.map((detail) => detail.message).join('; '));
    }
    return parsed as T;
  }

  /** Best effort — a leftover file is harmless, a failed cleanup must not mask the real error. */
  private async discardFile(storedName: string): Promise<void> {
    try {
      await fs.unlink(join(ASSIGNMENT_UPLOADS_DIR, basename(storedName)));
    } catch (error) {
      this.logger.warn('Could not remove an orphaned submission file', error);
    }
  }
}
