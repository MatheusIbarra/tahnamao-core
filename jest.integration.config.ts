import baseConfig from './jest.config';

export default {
  ...baseConfig,
  displayName: 'integration',
  testMatch: ['<rootDir>/tests/integration/**/*.spec.ts'],
};
