'use strict';

const { loadTsconfigPaths, resolveAlias } = require('./internals/alias/tsconfig-alias');
const { checkViolation } = require('./internals/core/rule-core');
const { defaultAllowedImports, defaultExceptions, defaultLayers } = require('./internals/default/configuration-default');
const { determineLayer } = require('./internals/layers/layer-detection');
const { printLog } = require('./internals/logger/boundaries-logger');
const { validateAllowedImports } = require('./internals/validation/validation-validator');

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce clean architecture layer boundaries (presentation → domain → data)',
      recommended: true
    },
    schema: [
      {
        type: 'object',
        properties: {
          layers: { type: 'array', items: { type: 'string' } },
          allowedImports: {
            type: 'object',
            additionalProperties: { type: 'array', items: { type: 'string' } }
          },
          exceptions: {
            type: 'object',
            additionalProperties: {
              type: 'object',
              additionalProperties: { type: 'array', items: { type: 'string' } }
            }
          },
          debug: { type: 'boolean' }
        },
        additionalProperties: false
      }
    ]
  },

  create(context) {
    const options = context.options[0] || {};
    const layers = options.layers || defaultLayers;
    const allowedImports = options.allowedImports || defaultAllowedImports;
    const exceptions = options.exceptions || defaultExceptions;
    const debug = options.debug || false;
    const counters = { allowed: 0, errors: 0 };

    try {
      validateAllowedImports(layers, allowedImports, exceptions);
    } catch (error) {
      context.report({
        loc: { line: 1, column: 0 },
        message: error.message
      });
      return {};
    }

    printLog(debug, '[RULE] Loading tsconfig paths...');
    loadTsconfigPaths(debug);

    // context.filename (flat config) with fallback to context.getFilename() (legacy)
    const filePath = context.filename ?? context.getFilename();
    printLog(debug, `\n[RULE] Analyzing file: ${filePath}`);

    const currentLayer = determineLayer(filePath, layers);
    printLog(debug, `[RULE] Current layer: ${currentLayer ?? 'UNKNOWN'}`);

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;
        printLog(debug, `  └── Analyzing import: ${importPath}`);

        if (!currentLayer) {
          printLog(debug, '     ⚠️  File is outside known layers. Skipping...');
          return;
        }

        const resolvedImportPath = resolveAlias(importPath, debug);
        checkViolation(context, currentLayer, resolvedImportPath, node, allowedImports, debug, counters, exceptions);
      },

      'Program:exit'() {
        printLog(debug, `\n[RULE] Import summary: ✅  ${counters.allowed} valid, ❌  ${counters.errors} errors.`);
      }
    };
  }
};

module.exports = rule;
