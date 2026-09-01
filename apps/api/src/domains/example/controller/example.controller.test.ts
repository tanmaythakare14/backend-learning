import type { Request, Response } from 'express';
import { ExampleController } from './example.controller';
import { NotFoundException } from '../../../common/exceptions';
import { makeExample } from '../../../../test-utils/factories/example.factory';
import { makeExampleServiceMock } from '../../../../test-utils/mocks/example.mocks';
import { mockReq, mockRes } from '../../../../test-utils/mocks/express.mock';
import type { ExampleCreateDto, ExampleUpdateDto } from '../dto/example.dto';

describe('ExampleController', () => {
  let controller: ExampleController;
  let service: ReturnType<typeof makeExampleServiceMock>;

  beforeEach(() => {
    service = makeExampleServiceMock();
    controller = new ExampleController(service as never);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('responds 200 with all records', async () => {
      const records = [makeExample()];
      service.getAll.mockResolvedValue(records);
      const res = mockRes();
      await controller.getAll(mockReq() as Request, res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: records }));
    });

    it('responds 200 with empty array when no records exist', async () => {
      service.getAll.mockResolvedValue([]);
      const res = mockRes();
      await controller.getAll(mockReq() as Request, res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: [] }));
    });
  });

  describe('getById', () => {
    it('responds 200 with the found record', async () => {
      const example = makeExample();
      service.getById.mockResolvedValue(example);
      const res = mockRes();
      await controller.getById('uuid-1', res as unknown as Response);
      expect(service.getById).toHaveBeenCalledWith('uuid-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ data: example }));
    });

    it('propagates NotFoundException when service throws', async () => {
      service.getById.mockRejectedValue(new NotFoundException('Example with ID x not found'));
      await expect(
        controller.getById('x', mockRes() as unknown as Response),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('responds 201 with the created record and success message', async () => {
      const dto: ExampleCreateDto = { name: 'New', col1: 'a', col2: 'b', col3: 'c' };
      const created = makeExample({ name: 'New' });
      service.create.mockResolvedValue(created);
      const res = mockRes();
      await controller.create(dto, res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: created, message: 'Created successfully' }),
      );
    });
  });

  describe('update', () => {
    it('responds 200 with the updated record', async () => {
      const dto: ExampleUpdateDto = { name: 'Updated' };
      const updated = makeExample({ name: 'Updated' });
      service.update.mockResolvedValue(updated);
      const res = mockRes();
      await controller.update('uuid-1', dto, res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ data: updated, message: 'Updated successfully' }),
      );
    });

    it('propagates NotFoundException', async () => {
      service.update.mockRejectedValue(new NotFoundException('Example with ID x not found'));
      await expect(
        controller.update('x', { name: 'y' }, mockRes() as unknown as Response),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('responds 200 with success message', async () => {
      service.delete.mockResolvedValue(undefined);
      const res = mockRes();
      await controller.delete('uuid-1', res as unknown as Response);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Deleted successfully' }),
      );
    });

    it('propagates NotFoundException', async () => {
      service.delete.mockRejectedValue(new NotFoundException('Example with ID x not found'));
      await expect(
        controller.delete('x', mockRes() as unknown as Response),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
