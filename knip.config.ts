import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  entry: [
    'src/app/app.config.ts',
    'src/app/app.routes.ts',
    'src/environments/**/*.ts',
    'eslint-rules/**/*.js',
    'scripts/**/*.js'
  ],
  project: ['src/**/*.ts', 'eslint-rules/**/*.js'],
  ignoreDependencies: [
    // Used by Angular CLI / builder internally, not imported in source
    '@angular-devkit/build-angular',
    '@angular/platform-browser-dynamic',
    'angular-cli-ghpages',
    // SCSS compilation handled by Angular builder
    'sass',
    // Git hooks runner — invoked via .husky/pre-commit, not imported in source
    'husky',
    // ESLint toolchain loaded by config dynamically, not explicit imports
    'angular-eslint',
    'typescript-eslint',
    'prettier-plugin-package',
    // Transitive deps used indirectly via Angular / ESLint config
    '@angular-eslint/builder',
    '@typescript-eslint/eslint-plugin',
    // Node types used in scripts
    '@types/express'
  ]
};

export default config;
