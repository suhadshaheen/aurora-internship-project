import type { Config } from 'jest';
import { createCjsPreset } from 'jest-preset-angular/presets';

const presetConfig = createCjsPreset({
  tsconfig: '<rootDir>/tsconfig.spec.json',
});

export default {
  ...presetConfig,

  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],

  testMatch: ['<rootDir>/frontend/**/*.spec.ts'],
} satisfies Config;