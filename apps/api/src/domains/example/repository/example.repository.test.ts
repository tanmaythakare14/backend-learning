import { ExampleRepository } from './example.repository';
import { makeExampleDbRecord } from '../../../../test-utils/factories/example.factory';
import { makeTypeOrmRepoMock, type TypeOrmRepoMock } from '../../../../test-utils/mocks/typeorm.mock';
import type { ExampleCreateDto, ExampleUpdateDto } from '../dto/example.dto';

describe('ExampleRepository', () => {
  let repository: ExampleRepository;
  let mockTypeOrmRepo: TypeOrmRepoMock;

  beforeEach(() => {
    mockTypeOrmRepo = makeTypeOrmRepoMock();
    repository = new ExampleRepository(mockTypeOrmRepo as never);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('queries only active records', async () => {
      const records = [makeExampleDbRecord()];
      mockTypeOrmRepo.find.mockResolvedValue(records);
      const result = await repository.findAll();
      expect(result).toEqual(records);
      expect(mockTypeOrmRepo.find).toHaveBeenCalledWith({ where: { isActive: true } });
    });

    it('returns empty array when no active records exist', async () => {
      mockTypeOrmRepo.find.mockResolvedValue([]);
      expect(await repository.findAll()).toEqual([]);
    });
  });

  describe('findById', () => {
    it('returns the record when found', async () => {
      const record = makeExampleDbRecord();
      mockTypeOrmRepo.findOne.mockResolvedValue(record);
      const result = await repository.findById('uuid-1');
      expect(result).toEqual(record);
      expect(mockTypeOrmRepo.findOne).toHaveBeenCalledWith({ where: { id: 'uuid-1', isActive: true } });
    });

    it('returns null when not found', async () => {
      mockTypeOrmRepo.findOne.mockResolvedValue(null);
      expect(await repository.findById('missing')).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and saves with isActive=true', async () => {
      const dto: ExampleCreateDto = { name: 'New', col1: 'a', col2: 'b', col3: 'c' };
      const entity = makeExampleDbRecord({ name: 'New' });
      mockTypeOrmRepo.create.mockReturnValue(entity);
      mockTypeOrmRepo.save.mockResolvedValue(entity);
      const result = await repository.create(dto);
      expect(mockTypeOrmRepo.create).toHaveBeenCalledWith({ ...dto, isActive: true });
      expect(result).toEqual(entity);
    });
  });

  describe('update', () => {
    it('updates the record and returns the refreshed entity', async () => {
      const dto: ExampleUpdateDto = { name: 'Updated' };
      const updated = makeExampleDbRecord({ name: 'Updated' });
      mockTypeOrmRepo.update.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepo.findOne.mockResolvedValue(updated);
      const result = await repository.update('uuid-1', dto);
      expect(mockTypeOrmRepo.update).toHaveBeenCalledWith('uuid-1', expect.objectContaining({ name: 'Updated' }));
      expect(result).toEqual(updated);
    });
  });

  describe('delete', () => {
    it('soft-deletes by setting isActive=false', async () => {
      mockTypeOrmRepo.update.mockResolvedValue({ affected: 1 });
      const result = await repository.delete('uuid-1');
      expect(mockTypeOrmRepo.update).toHaveBeenCalledWith('uuid-1', expect.objectContaining({ isActive: false }));
      expect(result).toBe(true);
    });

    it('returns false when no rows were affected', async () => {
      mockTypeOrmRepo.update.mockResolvedValue({ affected: 0 });
      expect(await repository.delete('ghost-id')).toBe(false);
    });
  });
});
