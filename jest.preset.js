const nxPreset = require('@nx/jest/preset').default;
module.exports = {
  ...nxPreset,
  coverageReporters: ['html', 'lcov', 'text', 'text-summary'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/*.test.{ts,tsx}',
    '!src/main.{ts,tsx}',
  ],
};
