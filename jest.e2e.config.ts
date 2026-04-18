import baseConfig from './jest.config';

export default {
  ...baseConfig,
  displayName: 'e2e',
  testMatch: ['<rootDir>/tests/e2e/**/*.spec.ts'],
};
