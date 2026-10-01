import type { Assignment, AssignmentApiDto } from '../@types';
import { getAssignmentState } from '../utils';

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
    state: getAssignmentState(dto.dueAt, dto.kind, handedIn),
  };
}
