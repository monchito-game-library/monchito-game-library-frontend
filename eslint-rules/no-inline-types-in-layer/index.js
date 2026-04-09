'use strict';

/**
 * ESLint rule: no-inline-types-in-layer
 *
 * Forbids inline `interface` and `type` declarations in files that live under
 * one or more configurable paths. The intention is to keep type definitions
 * centralised in the entities layer (e.g. src/app/entities/interfaces/ and
 * src/app/entities/types/) and out of presentation components.
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
    type: 'problem',
    docs: {
      description:
        'Disallow inline interface and type alias declarations inside restricted layer paths; definitions must live in the entities layer.',
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
      noInlineInterface:
        'Interface "{{name}}" must be declared in the entities layer (e.g. @/interfaces/…), not inline inside a presentation file.',
      noInlineType:
        'Type alias "{{name}}" must be declared in the entities layer (e.g. @/types/…), not inline inside a presentation file.'
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
      TSInterfaceDeclaration(node) {
        context.report({ node, messageId: 'noInlineInterface', data: { name: node.id.name } });
      },
      TSTypeAliasDeclaration(node) {
        context.report({ node, messageId: 'noInlineType', data: { name: node.id.name } });
      }
    };
  }
};

module.exports = rule;
