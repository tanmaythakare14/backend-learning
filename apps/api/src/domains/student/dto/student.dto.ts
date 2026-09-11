/** Create DTO — every field is required (mirrors the frontend's Add Student form). */
export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  course: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/**
 * Update DTO — deliberately excludes firstName/lastName. A student's name is
 * immutable after enrollment; the update route only ever reads these fields
 * (validate() also strips anything else the client sends, per
 * validate.middleware.ts's stripUnknown: true).
 */
export interface UpdateStudentDto {
  email: string;
  phone: string;
  course: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

/** Deactivate/activate DTO — `deleted` isn't accepted here, DELETE /students/:id handles that. */
export interface UpdateStudentStatusDto {
  status: 'active' | 'deactivated';
}

/**
 * List query — all optional. `status` defaults to "active" (matches the
 * frontend's default tab) if omitted. `course` accepts either a single
 * course name, a comma-separated list, or repeated query params (Express's
 * query parser turns `?course=A&course=B` into a real array already).
 */
export interface ListStudentsQuery {
  status?: string;
  course?: string | string[];
  search?: string;
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
  streetAddress: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  country: string | null;
}
