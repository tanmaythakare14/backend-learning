export const SuccessMessages = {
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  SERVER_RUNNING: 'Server is running',
} as const;
export type SuccessMessage = (typeof SuccessMessages)[keyof typeof SuccessMessages];
