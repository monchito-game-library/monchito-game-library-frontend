import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['lib/retro/public-api.ts'],
  project: ['lib/**/*.ts'],
  ignoreExportsUsedInFile: true,
  angular: false,
  // Packages used by the app (src/) but not by the lib — suppressed here because
  // knip always reads package.json even when project is restricted to lib/.
  ignoreDependencies: [
    '@angular-devkit/build-angular',
    '@angular/platform-browser-dynamic',
    '@angular/build',
    '@angular/compiler-cli',
    '@angular/localize',
    '@typescript-eslint/eslint-plugin',
    '@sentry/angular',
    'angular-eslint',
    'husky',
    'playwright',
    'playwright-lighthouse',
    'prettier-plugin-package',
    'sass',
    'typescript-eslint',
    '@types/express',
    '@supabase/supabase-js',
    'lighthouse'
  ]
};

export default config;
