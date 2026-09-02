import type { Student } from '../@types';

export function generateNextStudentId(students: Student[]): string {
  const maxSeq = students.reduce((max, s) => {
    const match = s.studentId.match(/(\d+)$/);
    const num = match ? parseInt(match[1], 10) : 0;
    return Math.max(max, num);
  }, 2400);
  return `STU-${maxSeq + 1}`;
}
