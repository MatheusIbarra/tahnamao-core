import baseConfig from './jest.config';

export default {
  ...baseConfig,
  displayName: 'contract',
  testMatch: ['<rootDir>/tests/contract/**/*.spec.ts'],
};
