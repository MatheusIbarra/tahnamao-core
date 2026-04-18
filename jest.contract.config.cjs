const baseConfig = require('./jest.base.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'contract',
  testMatch: ['<rootDir>/tests/contract/**/*.spec.ts'],
};
