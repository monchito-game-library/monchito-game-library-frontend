// eslint.config.js
const angular = require('@angular-eslint/eslint-plugin');
const parser = require('@typescript-eslint/parser');
const prettier = require('eslint-config-prettier');
const jsdoc = require('eslint-plugin-jsdoc');

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
      jsdoc
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
