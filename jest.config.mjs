export default {
  testEnvironment: 'node',

  extensionsToTreatAsEsm: ['.ts'],

  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: './tsconfig.test.json',
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  roots: ['<rootDir>/src', '<rootDir>/tests'],

  testMatch: ['**/*.test.ts'],

  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  clearMocks: true,

  collectCoverageFrom: ['src/**/*.ts', '!src/generated/**'],
};
