import type {
  Assignment,
  AssignmentApiDto,
  AssignmentBuilderValues,
  CourseOption,
  CreateAssignmentPayload,
} from '../@types';
import { getAssignmentState, hasWrittenQuestion, isChoiceType } from '../utils';

/** DTO → UI shape, with the derived state worked out once here. */
export function apiDtoToAssignment(dto: AssignmentApiDto): Assignment {
  const handedIn = dto.kind === 'quiz' ? dto.quizAttempt : dto.submission;

  return {
    id: dto.id,
    kind: dto.kind,
    title: dto.title,
    courseName: dto.courseName,
    instructions: dto.instructions,
    dueAt: dto.dueAt,
    submission: dto.submission,
    questions: dto.questions,
    quizAttempt: dto.quizAttempt,
    submittedAt: handedIn?.submittedAt ?? null,
    state: getAssignmentState(dto.dueAt, dto.kind, handedIn, hasWrittenQuestion(dto.questions)),
  };
}

/** FormView → create payload. Options only travel with the two choice types. */
export function builderValuesToCreatePayload(
  values: AssignmentBuilderValues,
  course: CourseOption,
): CreateAssignmentPayload {
  return {
    title: values.title.trim(),
    courseId: course.id,
    courseName: course.name,
    instructions: values.instructions.trim(),
    dueAt: new Date(values.dueAt).toISOString(),
    questions: values.questions.map((question) => ({
      type: question.type,
      prompt: question.prompt.trim(),
      options: isChoiceType(question.type)
        ? question.options.map((option) => ({
            label: option.label.trim(),
            isCorrect: option.isCorrect,
          }))
        : [],
    })),
  };
}
