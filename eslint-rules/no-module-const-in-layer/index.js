'use strict';

/**
 * ESLint rule: no-module-const-in-layer
 *
 * Forbids top-level (module-level) `const` variable declarations in files that
 * live under one or more configurable restricted paths.
 *
 * The intention is to keep shared constants centralized in the entities layer
 * (src/app/entities/constants/) and out of presentation services, components
 * and guards, where they have no business being defined.
 *
 * A "module-level const" is any VariableDeclaration whose parent node is the
 * Program root — i.e. not inside a class, function, or block.
 *
 * Options (all optional):
 *   restrictedPaths    {string[]}  Path substrings that trigger the rule.
 *                                  Default: ['src/app/presentation']
 *   excludeFilePatterns {string[]} Substrings; files whose path contains any of
 *                                  these are ignored entirely.
 *                                  Default: ['.spec.ts']
 */

const DEFAULT_RESTRICTED_PATHS = ['src/app/presentation'];
const DEFAULT_EXCLUDE_PATTERNS = ['.spec.ts'];

/** @type {import('eslint').Rule.RuleModule} */
const rule = {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Disallow module-level const declarations inside restricted layer paths; constants must live in the entities layer.',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          restrictedPaths: {
            type: 'array',
            items: { type: 'string' },
            description: 'Path substrings that activate the restriction (matched against the full file path).'
          },
          excludeFilePatterns: {
            type: 'array',
            items: { type: 'string' },
            description: 'File-path substrings that exempt a file from the rule (e.g. ".spec.ts").'
          }
        },
        additionalProperties: false
      }
    ],
    messages: {
      noModuleConst:
        'Constant "{{name}}" must be declared in the entities layer (e.g. @/constants/…), not at module level inside a presentation file.'
    }
  },

  create(context) {
    const options = context.options[0] || {};
    const restrictedPaths = options.restrictedPaths ?? DEFAULT_RESTRICTED_PATHS;
    const excludeFilePatterns = options.excludeFilePatterns ?? DEFAULT_EXCLUDE_PATTERNS;

    // Normalize to forward slashes so the rule works on Windows too.
    const filePath = (context.filename ?? context.getFilename()).replace(/\\/g, '/');

    const isRestricted = restrictedPaths.some((p) => filePath.includes(p));
    if (!isRestricted) return {};

    const isExcluded = excludeFilePatterns.some((p) => filePath.includes(p));
    if (isExcluded) return {};

    return {
      VariableDeclaration(node) {
        // Only flag `const` declarations at program (module) level.
        if (node.kind !== 'const') return;
        if (node.parent.type !== 'Program') return;

        for (const declarator of node.declarations) {
          if (declarator.id && declarator.id.type === 'Identifier') {
            context.report({ node, messageId: 'noModuleConst', data: { name: declarator.id.name } });
          }
        }
      }
    };
  }
};

module.exports = rule;
