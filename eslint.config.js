// eslint.config.js
const angular = require('@angular-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const tseslint = require('@typescript-eslint/eslint-plugin');
const prettier = require('eslint-config-prettier');
const jsdoc = require('eslint-plugin-jsdoc');
const cleanArchRule = require('./eslint-rules/clean-architecture-boundaries/index.js');
const noInlineTypesRule = require('./eslint-rules/no-inline-types-in-layer/index.js');
const noModuleConstRule = require('./eslint-rules/no-module-const-in-layer/index.js');
const requireSpecFileRule = require('./eslint-rules/require-spec-file/index.js');

// Angular lifecycle hooks that are exempt from the JSDoc requirement.
const LIFECYCLE_HOOKS = [
  'ngOnInit',
  'ngOnDestroy',
  'ngOnChanges',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngDoCheck'
];

const lifecyclePattern = LIFECYCLE_HOOKS.join('|');

module.exports = [
  {
    ignores: ['coverage/**', '.angular/**', 'dist/**', 'node_modules/**']
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser,
      parserOptions: {
        project: ['./tsconfig.json'],
        sourceType: 'module'
      }
    },
    plugins: {
      '@angular-eslint': angular,
      '@typescript-eslint': tseslint,
      jsdoc,
      'clean-arch': { rules: { boundaries: cleanArchRule } },
      'layer-types': { rules: { 'no-inline': noInlineTypesRule } },
      'layer-consts': { rules: { 'no-module-const': noModuleConstRule } },
      'spec-coverage': { rules: { 'require-spec-file': requireSpecFileRule } }
    },
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: 'app', style: 'camelCase' }
      ],
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: 'app', style: 'kebab-case' }
      ],

      // ── Unused vars / imports ────────────────────────────────────────────────

      // Warn on variables, parameters and imports declared but never used
      // within the same file. Does NOT catch exported symbols that are never
      // imported elsewhere — use knip (npm run knip) for cross-file analysis.
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_'
        }
      ],

      // ── Naming convention ────────────────────────────────────────────────────

      // Private class members (fields, methods, accessors) must start with _.
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: ['classProperty', 'classMethod', 'accessor'],
          modifiers: ['private'],
          format: null,
          custom: {
            regex: '^_',
            match: true
          }
        }
      ],

      // ── Member ordering ──────────────────────────────────────────────────────

      // Enforces the class member order defined in CLAUDE.md:
      // private readonly fields → private fields → public readonly fields →
      // public fields → constructor → public methods → private methods.
      // Note: signals and configs both map to public-readonly-field so their
      // relative order within that group is left to convention.
      '@typescript-eslint/member-ordering': [
        'warn',
        {
          default: {
            memberTypes: [
              'private-readonly-field',
              'private-field',
              'public-readonly-field',
              'public-field',
              'constructor',
              'public-method',
              'private-method'
            ]
          }
        }
      ],

      // ── JSDoc rules ──────────────────────────────────────────────────────────

      // Require JSDoc on all class methods, excluding constructors, getters/setters
      // and Angular lifecycle hooks (exempted via contexts AST selector).
      'jsdoc/require-jsdoc': [
        'warn',
        {
          publicOnly: false,
          require: {
            FunctionDeclaration: false,
            MethodDefinition: false,
            ClassDeclaration: false,
            ArrowFunctionExpression: false,
            FunctionExpression: false
          },
          contexts: [
            // All method definitions except lifecycle hooks and constructors.
            `MethodDefinition:not([key.name=/^(constructor|${lifecyclePattern})$/])`
          ],
          checkConstructors: false,
          exemptEmptyFunctions: true,
          exemptEmptyConstructors: true,
          checkGetters: false,
          checkSetters: false,
          enableFixer: false
        }
      ],

      // Require a non-empty description block.
      'jsdoc/require-description': ['warn', { descriptionStyle: 'body' }],

      // Require @param for every parameter.
      'jsdoc/require-param': [
        'warn',
        {
          checkDestructured: false,
          exemptedBy: ['inheritdoc', 'override'],
          // Skip lifecycle hooks
          contexts: [
            {
              comment: 'JsdocBlock',
              context: `MethodDefinition:not([key.name=/^(${lifecyclePattern})$/])`
            }
          ]
        }
      ],

      // @param must include a {type}.
      'jsdoc/require-param-type': 'warn',

      // @param names must match the actual function signature.
      'jsdoc/check-param-names': [
        'warn',
        {
          checkDestructured: false,
          disableExtraPropertyReporting: true
        }
      ],

      // JSDoc tag names must be valid (no typos like @params).
      'jsdoc/check-tag-names': [
        'warn',
        {
          definedTags: ['remarks', 'internal']
        }
      ],

      // Types in JSDoc must use valid syntax (no mixed | and & without parens).
      'jsdoc/check-types': 'warn',

      // No duplicate block tags (e.g. two @returns).
      'jsdoc/no-multi-asterisks': ['warn', { allowWhitespace: true }],

      // ── Clean architecture boundaries ────────────────────────────────────────

      // Prevents imports across forbidden layer boundaries.
      // presentation → domain/entities/di only (never data directly)
      // data → entities only (uses domain contracts via .contract exception)
      // domain → entities only
      'clean-arch/boundaries': 'error',

      // Forbids inline interface/type declarations inside the presentation layer.
      // All types and interfaces must live in src/app/entities.
      // Configurable: restrictedPaths (default: ['src/app/presentation'])
      //               excludeFilePatterns (default: ['.spec.ts'])
      'layer-types/no-inline': [
        'error',
        {
          restrictedPaths: ['src/app/presentation'],
          excludeFilePatterns: ['.spec.ts']
        }
      ],

      // Forbids module-level (top-level, outside any class or function) `const`
      // declarations inside the presentation layer. Constants must live in
      // src/app/entities/constants/ and be imported via @/constants/….
      'layer-consts/no-module-const': [
        'error',
        {
          restrictedPaths: ['src/app/presentation'],
          excludeFilePatterns: ['.spec.ts']
        }
      ],

      // Requires a sibling .spec.ts file for every .ts file with testable
      // behaviour (components, services, guards, repositories, use-cases,
      // mappers, utils, directives, pipes, resolvers, abstract bases).
      // Pure type/interface/DTO/model/contract/provider/route/config/module
      // files, test helpers (.helpers., -mock.) and framework boilerplate
      // (transloco-loader, main, polyfills, index barrels) are exempt.
      'spec-coverage/require-spec-file': 'error',

      ...prettier.rules
    }
  },
  {
    files: ['**/*.html'],
    plugins: {
      '@angular-eslint/template': require('@angular-eslint/eslint-plugin-template')
    },
    languageOptions: {
      parser: require('@angular-eslint/template-parser')
    },
    rules: {
      '@angular-eslint/template/banana-in-box': 'error',
      '@angular-eslint/template/no-negated-async': 'warn'
    }
  }
];
