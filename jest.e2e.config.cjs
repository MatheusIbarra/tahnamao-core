const baseConfig = require('./jest.base.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'e2e',
  testMatch: ['<rootDir>/tests/e2e/**/*.spec.ts'],
};
