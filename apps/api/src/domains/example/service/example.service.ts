import { Injectable } from '@nestjs/common';
import { ExampleRepository } from '../repository/example.repository';
import { LoggerService } from '../../../common/utils/logger.service';
import { AuditLogger } from '../../../common/utils/audit-logger.service';
import { NotFoundException } from '../../../common/exceptions';
import { ExampleOutDto, ExampleCreateDto, ExampleUpdateDto } from '../dto/example.dto';

@Injectable()
export class ExampleService {
  constructor(
    private readonly repository: ExampleRepository,
    private readonly logger: LoggerService,
    private readonly audit: AuditLogger,
  ) {}

  async getAll(): Promise<ExampleOutDto[]> {
    this.logger.debug('Fetching all examples');
    return this.repository.findAll();
  }

  async getById(id: string): Promise<ExampleOutDto> {
    this.audit.log('ExampleService', 'Get example by id started', { exampleId: id });
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundException(`Example with ID ${id} not found`);
    this.audit.log('ExampleService', 'Get example by id succeeded', { exampleId: id });
    return item;
  }

  async create(data: ExampleCreateDto): Promise<ExampleOutDto> {
    this.audit.log('ExampleService', 'Example creation started', { name: data.name });
    const created = await this.repository.create(data);
    this.audit.log(
      'ExampleService',
      'Example creation succeeded',
      { exampleId: created.id },
      'info',
    );
    return created;
  }

  async update(id: string, data: ExampleUpdateDto): Promise<ExampleOutDto> {
    this.logger.info(`Updating example: ${id}`);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Example with ID ${id} not found`);
    return this.repository.update(id, data) as Promise<ExampleOutDto>;
  }

  async delete(id: string): Promise<void> {
    this.logger.info(`Deleting example: ${id}`);
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException(`Example with ID ${id} not found`);
    await this.repository.delete(id);
  }
}
