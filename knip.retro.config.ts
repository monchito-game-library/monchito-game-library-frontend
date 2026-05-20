import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: ['lib/retro/public-api.ts'],
  project: ['lib/**/*.ts'],
  ignoreExportsUsedInFile: true,
  // Packages used by the app (src/) but not by the lib — suppressed here because
  // knip still reads package.json even when project is restricted to lib/.
  // Step-5 will properly separate knip.config.ts (app-only) from this config.
  ignoreDependencies: [
    '@angular-devkit/build-angular',
    '@angular/platform-browser-dynamic',
    '@angular-eslint/builder',
    '@typescript-eslint/eslint-plugin',
    'angular-cli-ghpages',
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
