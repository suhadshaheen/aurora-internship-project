export default {
  preset: 'jest-preset-angular',

  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  testEnvironment: 'jsdom',

  

  moduleFileExtensions: ['ts', 'html', 'js', 'json', 'mjs'],

  testMatch: ['**/+(*.)+(spec).+(ts)'],
};