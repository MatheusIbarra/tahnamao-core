const baseConfig = require('./jest.base.config.cjs');

module.exports = {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
};
