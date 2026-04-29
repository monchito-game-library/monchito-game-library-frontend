'use strict';

const fs = require('node:fs');
const path = require('node:path');

/**
 * ESLint rule: require-spec-file
 *
 * Reports `.ts` files that have testable behaviour but are missing a sibling
 * `.spec.ts` file. Files with no logic (DTOs, interfaces, types, constants,
 * models, contracts, providers, routes, configs, modules), test helpers/mocks
 * and framework boilerplate are exempt from the requirement.
 *
 * The rule walks the file system once per linted file (single fs.existsSync)
 * and emits at most one diagnostic per missing spec, anchored at the program
 * node.
 *
 * Options (all optional):
 *   restrictedPaths    {string[]}  Path substrings that activate the rule.
 *                                  Default: ['src/app']
 *   excludeSuffixes    {string[]}  File-name suffixes that exempt a file.
 *                                  Default: see DEFAULT_EXCLUDE_SUFFIXES below.
 *   excludePatterns    {string[]}  Substrings (anywhere in the file path)
 *                                  that exempt a file. Default: see
 *                                  DEFAULT_EXCLUDE_PATTERNS below.
 *   excludeBasenames   {string[]}  Exact basenames that exempt a file.
 *                                  Default: see DEFAULT_EXCLUDE_BASENAMES.
 */

const DEFAULT_RESTRICTED_PATHS = ['src/app'];

const DEFAULT_EXCLUDE_SUFFIXES = [
  '.spec.ts',
  '.dto.ts',
  '.interface.ts',
  '.type.ts',
  '.constant.ts',
  '.model.ts',
  '.contract.ts',
  '.provider.ts',
  '.routes.ts',
  '.config.ts',
  '.module.ts',
  '.mock.ts'
];

const DEFAULT_EXCLUDE_PATTERNS = ['-mock.', '.helpers.'];

const DEFAULT_EXCLUDE_BASENAMES = ['index.ts', 'transloco-loader.ts', 'main.ts', 'polyfills.ts'];

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require a sibling .spec.ts file for every .ts file with testable behaviour.',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          restrictedPaths: { type: 'array', items: { type: 'string' } },
          excludeSuffixes: { type: 'array', items: { type: 'string' } },
          excludePatterns: { type: 'array', items: { type: 'string' } },
          excludeBasenames: { type: 'array', items: { type: 'string' } }
        },
        additionalProperties: false
      }
    ],
    messages: {
      missingSpec:
        'Missing test file: "{{specName}}" not found next to "{{fileName}}". Every component, service, guard, repository, use-case, mapper, util, directive, pipe, resolver and abstract base must have a sibling .spec.ts file.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const restrictedPaths = options.restrictedPaths ?? DEFAULT_RESTRICTED_PATHS;
    const excludeSuffixes = options.excludeSuffixes ?? DEFAULT_EXCLUDE_SUFFIXES;
    const excludePatterns = options.excludePatterns ?? DEFAULT_EXCLUDE_PATTERNS;
    const excludeBasenames = options.excludeBasenames ?? DEFAULT_EXCLUDE_BASENAMES;

    const filePath = (context.filename ?? context.getFilename()).replace(/\\/g, '/');

    if (!restrictedPaths.some((p) => filePath.includes(p))) return {};

    const fileName = path.basename(filePath);

    if (excludeBasenames.includes(fileName)) return {};
    if (excludeSuffixes.some((s) => fileName.endsWith(s))) return {};
    if (excludePatterns.some((p) => filePath.includes(p))) return {};

    const specPath = filePath.replace(/\.ts$/, '.spec.ts');
    if (fs.existsSync(specPath)) return {};

    const specName = path.basename(specPath);

    return {
      Program(node) {
        context.report({
          node,
          messageId: 'missingSpec',
          data: { specName, fileName }
        });
      }
    };
  }
};

module.exports = rule;
