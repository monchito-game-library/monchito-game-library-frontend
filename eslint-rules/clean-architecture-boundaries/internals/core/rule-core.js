'use strict';

const { isImportingFromLayer } = require('../layers/layer-detection');
const { printLog } = require('../logger/boundaries-logger');
const { checkExceptions, isSelfOrUnknownImport } = require('../validation/exception-validator');

/**
 * @typedef {object} RuleContext
 * @typedef {object} ASTNode
 */

/**
 * Checks whether the current layer is allowed to import from the target layer
 * and reports a violation if not.
 *
 * Steps:
 * 1. Determines the target layer from the import path.
 * 2. Checks for self-import or unknown target.
 * 3. Validates against allowedImports rules.
 * 4. Evaluates any configured exceptions.
 * 5. Reports an ESLint error if the import is not permitted.
 *
 * @param {RuleContext} context - ESLint rule context.
 * @param {string} currentLayer - Layer of the current file.
 * @param {string} importPath - Resolved import path.
 * @param {ASTNode} node - AST node of the import declaration.
 * @param {Record<string, string[]>} allowedImports - Allowed import rules per layer.
 * @param {boolean} debug - Debug mode.
 * @param {{allowed: number, errors: number}} [counters] - Counters.
 * @param {Record<string, Record<string, string[]>>} [exceptions] - Exceptions map origin→destination→patterns.
 */
function checkViolation(context, currentLayer, importPath, node, allowedImports, debug, counters, exceptions = {}) {
  const importLayer = Object.keys(allowedImports).find((layer) => isImportingFromLayer(importPath, layer));

  if (isSelfOrUnknownImport(importLayer, currentLayer, importPath, debug, counters)) {
    return;
  }

  const isAllowedPair = (allowedImports[currentLayer] || []).includes(importLayer);

  const exceptionResult = checkExceptions(
    importPath,
    currentLayer,
    importLayer,
    debug,
    counters,
    exceptions,
    isAllowedPair
  );

  if (exceptionResult === 'allow') {
    return;
  }
  if (exceptionResult === 'block') {
    context.report({
      node,
      message: `${currentLayer} layer is not allowed to import from ${importLayer} layer (block by exception).`
    });
    return;
  }

  if (!isAllowedPair) {
    printLog(debug, `     ❌  ${currentLayer} cannot import from ${importLayer}`);
    context.report({
      node,
      message: `${currentLayer} layer is not allowed to import from ${importLayer} layer.`
    });
    if (counters) {
      counters.errors++;
    }
    return;
  }

  printLog(debug, `     ✅  Valid import from ${currentLayer} to ${importLayer}.`);
  if (counters) {
    counters.allowed++;
  }
}

module.exports = { checkViolation };
