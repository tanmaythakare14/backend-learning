/** Create DTO — every field is required (mirrors the frontend's Add Student form). */
export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
}

/**
 * Update DTO — deliberately excludes firstName/lastName. A student's name is
 * immutable after enrollment; the update route only ever reads these three
 * fields (validate() also strips anything else the client sends, per
 * validate.middleware.ts's stripUnknown: true).
 */
export interface UpdateStudentDto {
  email: string;
  phone: string;
  course: string;
}

/** Output DTO — shape returned to the client. */
export interface StudentOutDto {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  status: string;
  assignedOn: Date;
  createdAt: Date;
}
