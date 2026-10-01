import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Student } from '../../student/entities/student.entity';
import type { AssignmentKind, AssignmentStatus } from '../entities/assignment.entity';
import type { QuizQuestionType } from '../entities/quiz-question.entity';
import { QuizQuestion } from '../entities/quiz-question.entity';
import { QuizOption } from '../entities/quiz-option.entity';
import { Submission } from '../entities/submission.entity';
import { QuizAnswers, QuizAttempt, ReviewStatus } from '../entities/quiz-attempt.entity';

/** An assignment joined with its course name and this student's hand-in, if any. */
export interface AssignmentRow {
  id: string;
  kind: AssignmentKind;
  title: string;
  courseName: string;
  instructions: string;
  dueAt: Date;
  questionCount: number;
  /** True when any question is a Short/Long paragraph, i.e. needs a person to read it. */
  hasWrittenQuestion: boolean;
  submittedAt: Date | null;
  isLate: boolean | null;
}

export interface QuestionWithOptions {
  question: QuizQuestion;
  /** Includes `isCorrect` — the service must strip it before anything reaches a student. */
  options: QuizOption[];
}

export interface WrittenSubmissionData {
  assignmentId: string;
  studentId: string;
  answerText: string | null;
  file: { name: string; path: string; size: number; mimeType: string } | null;
  isLate: boolean;
}

export interface QuizAttemptData {
  assignmentId: string;
  studentId: string;
  answers: QuizAnswers;
  choiceCorrect: number;
  choiceTotal: number;
  reviewStatus: ReviewStatus;
  isLate: boolean;
}

export interface NewAssignmentData {
  kind: AssignmentKind;
  title: string;
  courseId: string;
  instructions: string;
  dueAt: Date;
  questions: Array<{
    type: QuizQuestionType;
    prompt: string;
    options: Array<{ label: string; isCorrect: boolean }>;
  }>;
}

export interface CreatedAssignmentRecord {
  assignment: { id: string; createdAt: Date; status: AssignmentStatus };
  questions: Array<{
    id: string;
    type: QuizQuestionType;
    prompt: string;
    options: Array<{ id: string; label: string; isCorrect: boolean }>;
  }>;
}

const ASSIGNMENT_ROWS_SQL = `
  SELECT
    a.id,
    a.kind,
    a.title,
    c.name                                              AS "courseName",
    a.instructions,
    a.due_at                                            AS "dueAt",
    (SELECT COUNT(*) FROM quiz_question q WHERE q.assignment_id = a.id)::int AS "questionCount",
    EXISTS (
      SELECT 1 FROM quiz_question q
      WHERE q.assignment_id = a.id AND q.type IN ('short', 'descriptive')
    )                                                   AS "hasWrittenQuestion",
    COALESCE(s.submitted_at, qa.submitted_at)           AS "submittedAt",
    COALESCE(s.is_late, qa.is_late)                     AS "isLate"
  FROM assignment a
  JOIN course c ON c.id = a.course_id AND c.status = 'active'
  LEFT JOIN submission s   ON s.assignment_id  = a.id AND s.student_id  = $1
  LEFT JOIN quiz_attempt qa ON qa.assignment_id = a.id AND qa.student_id = $1
  WHERE a.status = 'active'
    AND LOWER(c.name) = LOWER($2)
`;

@Injectable()
export class AssignmentRepository {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Student)
    private readonly students: Repository<Student>,
    @InjectRepository(QuizQuestion)
    private readonly questions: Repository<QuizQuestion>,
    @InjectRepository(QuizOption)
    private readonly options: Repository<QuizOption>,
    @InjectRepository(Submission)
    private readonly submissions: Repository<Submission>,
    @InjectRepository(QuizAttempt)
    private readonly attempts: Repository<QuizAttempt>,
  ) {}

  /** Case-insensitive, active students only. */
  async findActiveStudentByEmail(email: string): Promise<Student | null> {
    return this.students
      .createQueryBuilder('s')
      .where('LOWER(s.email) = LOWER(:email)', { email })
      .andWhere('s.status = :status', { status: 'active' })
      .getOne();
  }

  /** Every assignment for the student's course — the table view's source rows. */
  async findRowsForStudent(studentId: string, courseName: string): Promise<AssignmentRow[]> {
    return this.dataSource.query<AssignmentRow[]>(ASSIGNMENT_ROWS_SQL, [studentId, courseName]);
  }

  /** One assignment, only if it belongs to the student's course. */
  async findRowForStudent(
    assignmentId: string,
    studentId: string,
    courseName: string,
  ): Promise<AssignmentRow | null> {
    const rows = await this.dataSource.query<AssignmentRow[]>(
      `${ASSIGNMENT_ROWS_SQL} AND a.id = $3`,
      [studentId, courseName, assignmentId],
    );
    return rows[0] ?? null;
  }

  async findQuestionsWithOptions(assignmentId: string): Promise<QuestionWithOptions[]> {
    const questions = await this.questions.find({
      where: { assignmentId },
      order: { position: 'ASC' },
    });
    if (questions.length === 0) return [];

    const options = await this.options.find({
      where: { questionId: In(questions.map((question) => question.id)) },
      order: { position: 'ASC' },
    });

    return questions.map((question) => ({
      question,
      options: options.filter((option) => option.questionId === question.id),
    }));
  }

  async findSubmission(assignmentId: string, studentId: string): Promise<Submission | null> {
    return this.submissions.findOne({ where: { assignmentId, studentId } });
  }

  async findAttempt(assignmentId: string, studentId: string): Promise<QuizAttempt | null> {
    return this.attempts.findOne({ where: { assignmentId, studentId } });
  }

  /** Insert, or replace the student's earlier submission for this assignment. */
  async upsertSubmission(data: WrittenSubmissionData): Promise<Submission> {
    await this.dataSource.query(
      `INSERT INTO submission
         (assignment_id, student_id, answer_text, file_name, file_path, file_size, mime_type, submitted_at, is_late)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
       ON CONFLICT (assignment_id, student_id) DO UPDATE SET
         answer_text  = EXCLUDED.answer_text,
         file_name    = EXCLUDED.file_name,
         file_path    = EXCLUDED.file_path,
         file_size    = EXCLUDED.file_size,
         mime_type    = EXCLUDED.mime_type,
         submitted_at = NOW(),
         is_late      = EXCLUDED.is_late`,
      [
        data.assignmentId,
        data.studentId,
        data.answerText,
        data.file?.name ?? null,
        data.file?.path ?? null,
        data.file?.size ?? null,
        data.file?.mimeType ?? null,
        data.isLate,
      ],
    );

    const saved = await this.findSubmission(data.assignmentId, data.studentId);
    if (!saved) throw new Error('Submission vanished during upsert');
    return saved;
  }

  /**
   * Records the one attempt. Returns null when the student already has one — the
   * UNIQUE (assignment_id, student_id) constraint decides, so two simultaneous
   * requests cannot both succeed.
   */
  async createAttempt(data: QuizAttemptData): Promise<QuizAttempt | null> {
    const inserted = await this.dataSource.query<Array<{ id: string }>>(
      `INSERT INTO quiz_attempt
         (assignment_id, student_id, answers, choice_correct, choice_total, review_status, submitted_at, is_late)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, NOW(), $7)
       ON CONFLICT (assignment_id, student_id) DO NOTHING
       RETURNING id`,
      [
        data.assignmentId,
        data.studentId,
        JSON.stringify(data.answers),
        data.choiceCorrect,
        data.choiceTotal,
        data.reviewStatus,
        data.isLate,
      ],
    );
    if (inserted.length === 0) return null;
    return this.findAttempt(data.assignmentId, data.studentId);
  }

  async findCourseById(
    courseId: string,
  ): Promise<{ id: string; name: string; status: string } | null> {
    const rows = await this.dataSource.query<Array<{ id: string; name: string; status: string }>>(
      'SELECT id, name, status FROM course WHERE id = $1',
      [courseId],
    );
    return rows[0] ?? null;
  }

  /**
   * Saves the assignment, its questions and their options as ONE transaction, so a failure
   * part-way (a bad row, a dropped connection) leaves nothing half-created behind.
   */
  async createAssignment(data: NewAssignmentData): Promise<CreatedAssignmentRecord> {
    return this.dataSource.transaction(async (manager) => {
      const [assignment] = await manager.query<CreatedAssignmentRecord['assignment'][]>(
        `INSERT INTO assignment (kind, title, course_id, instructions, due_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, created_at AS "createdAt", status`,
        [data.kind, data.title, data.courseId, data.instructions, data.dueAt],
      );

      const questions: CreatedAssignmentRecord['questions'] = [];
      for (const [questionIndex, question] of data.questions.entries()) {
        const [savedQuestion] = await manager.query<Array<{ id: string }>>(
          `INSERT INTO quiz_question (assignment_id, position, type, prompt)
           VALUES ($1, $2, $3, $4) RETURNING id`,
          [assignment.id, questionIndex + 1, question.type, question.prompt],
        );

        const options: CreatedAssignmentRecord['questions'][number]['options'] = [];
        for (const [optionIndex, option] of question.options.entries()) {
          const [savedOption] = await manager.query<Array<{ id: string }>>(
            `INSERT INTO quiz_option (question_id, position, label, is_correct)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [savedQuestion.id, optionIndex + 1, option.label, option.isCorrect],
          );
          options.push({ id: savedOption.id, label: option.label, isCorrect: option.isCorrect });
        }

        questions.push({
          id: savedQuestion.id,
          type: question.type,
          prompt: question.prompt,
          options,
        });
      }

      return { assignment, questions };
    });
  }
}
