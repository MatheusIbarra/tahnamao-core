const baseConfig = require('./jest.base.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
};
