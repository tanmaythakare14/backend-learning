import type { Config } from 'jest';

const config: Config = {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test-utils'],
  testMatch: ['**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      diagnostics: { ignoreCodes: [151002] },
    }],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/domains/**/*.{ts,js}',
    '!src/domains/**/routes/*.ts',
    '!src/domains/**/*.module.ts',
  ],
  moduleNameMapper: {
    '.+common/utils/logger\\.service$': '<rootDir>/test-utils/logger.service.mock.ts',
    '.+db/data-source$': '<rootDir>/test-utils/connection.mock.ts',
  },
  coverageDirectory: '../../coverage/apps/api',
  coverageReporters: ['text', 'text-summary', 'lcov'],
};

export default config;
