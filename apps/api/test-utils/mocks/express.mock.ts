import type { Request } from 'express';

export const mockReq = (overrides: Partial<Request> = {}): Partial<Request> => ({
  params: {},
  body: {},
  query: {},
  ...overrides,
});

export const mockRes = (): { status: jest.Mock; json: jest.Mock } => {
  const res = {} as { status: jest.Mock; json: jest.Mock };
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};
