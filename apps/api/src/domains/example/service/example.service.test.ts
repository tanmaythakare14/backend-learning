import { ExampleService } from './example.service';
import { NotFoundException } from '../../../common/exceptions';
import { makeExample } from '../../../../test-utils/factories/example.factory';
import { makeExampleRepoMock } from '../../../../test-utils/mocks/example.mocks';
import { makeLoggerMock } from '../../../../test-utils/mocks/logger.mock';
import { makeAuditLoggerMock } from '../../../../test-utils/mocks/audit-logger.mock';
import type { ExampleCreateDto, ExampleUpdateDto } from '../dto/example.dto';

describe('ExampleService', () => {
  let service: ExampleService;
  let repo: ReturnType<typeof makeExampleRepoMock>;
  let logger: ReturnType<typeof makeLoggerMock>;
  let audit: ReturnType<typeof makeAuditLoggerMock>;

  beforeEach(() => {
    repo = makeExampleRepoMock();
    logger = makeLoggerMock();
    audit = makeAuditLoggerMock();
    service = new ExampleService(repo as never, logger as never, audit as never);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('returns all examples from the repository', async () => {
      const examples = [makeExample(), makeExample({ id: 'uuid-2', name: 'Second' })];
      repo.findAll.mockResolvedValue(examples);
      const result = await service.getAll();
      expect(result).toEqual(examples);
      expect(repo.findAll).toHaveBeenCalledTimes(1);
    });

    it('returns an empty array when no records exist', async () => {
      repo.findAll.mockResolvedValue([]);
      expect(await service.getAll()).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns the example when found', async () => {
      repo.findById.mockResolvedValue(makeExample());
      const result = await service.getById('uuid-1');
      expect(result).toEqual(makeExample());
      expect(repo.findById).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.getById('missing-id')).rejects.toThrow(NotFoundException);
      await expect(service.getById('missing-id')).rejects.toThrow(
        'Example with ID missing-id not found',
      );
    });
  });

  describe('create', () => {
    it('delegates to the repository and returns the created record', async () => {
      const dto: ExampleCreateDto = { name: 'New', col1: 'a', col2: 'b', col3: 'c' };
      const created = makeExample({ name: 'New' });
      repo.create.mockResolvedValue(created);
      const result = await service.create(dto);
      expect(result).toEqual(created);
      expect(repo.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('returns the updated record when found', async () => {
      const dto: ExampleUpdateDto = { name: 'Updated' };
      const updated = makeExample({ name: 'Updated' });
      repo.findById.mockResolvedValue(makeExample());
      repo.update.mockResolvedValue(updated);
      const result = await service.update('uuid-1', dto);
      expect(result).toEqual(updated);
      expect(repo.update).toHaveBeenCalledWith('uuid-1', dto);
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.update('missing-id', { name: 'x' })).rejects.toThrow(NotFoundException);
      expect(repo.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('soft-deletes the record when found', async () => {
      repo.findById.mockResolvedValue(makeExample());
      repo.delete.mockResolvedValue(true);
      await expect(service.delete('uuid-1')).resolves.toBeUndefined();
      expect(repo.delete).toHaveBeenCalledWith('uuid-1');
    });

    it('throws NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.delete('missing-id')).rejects.toThrow(NotFoundException);
      expect(repo.delete).not.toHaveBeenCalled();
    });
  });
});
