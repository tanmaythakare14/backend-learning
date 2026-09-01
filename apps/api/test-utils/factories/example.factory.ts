import type { ExampleOutDto } from '../../src/domains/example/dto/example.dto';
import { Example } from '../../src/domains/example/entities/example.entity';

export const makeExample = (overrides: Partial<ExampleOutDto> = {}): ExampleOutDto => ({
  id: 'uuid-1',
  name: 'Test',
  col1: 'val1',
  col2: 'val2',
  col3: 'val3',
  isActive: true,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: null,
  ...overrides,
});

export const makeExampleDbRecord = (overrides: Partial<Example> = {}): Example =>
  Object.assign(new Example(), {
    id: 'uuid-1',
    name: 'Test',
    col1: 'val1',
    col2: 'val2',
    col3: 'val3',
    isActive: true,
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: null,
    ...overrides,
  });
