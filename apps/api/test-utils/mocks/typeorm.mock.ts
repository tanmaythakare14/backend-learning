export const makeTypeOrmRepoMock = () => ({
  find: jest.fn() as jest.Mock,
  findOne: jest.fn() as jest.Mock,
  create: jest.fn() as jest.Mock,
  save: jest.fn() as jest.Mock,
  update: jest.fn() as jest.Mock,
  query: jest.fn() as jest.Mock,
});

export type TypeOrmRepoMock = ReturnType<typeof makeTypeOrmRepoMock>;
