import baseConfig from './jest.config';

export default {
  ...baseConfig,
  displayName: 'unit',
  testMatch: ['<rootDir>/tests/unit/**/*.spec.ts'],
};
