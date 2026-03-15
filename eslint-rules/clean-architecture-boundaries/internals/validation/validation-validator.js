'use strict';

const { printLog } = require('../logger/boundaries-logger');

/**
 * Validates the allowedImports structure (without exceptions).
 *
 * @param {string[]} layers - List of layers.
 * @param {Record<string, string[]>} allowedImports - Allowed import rules.
 * @throws {Error} - If unknown layers or circular rules are found.
 */
function validateAllowedImportsStructure(layers, allowedImports) {
  const layerSet = new Set(layers);

  for (const [layer, imports] of Object.entries(allowedImports)) {
    if (!layerSet.has(layer)) {
      throw new Error(`[layer-boundaries] Unknown layer '${layer}' in allowedImports.`);
    }
    for (const target of imports) {
      if (!layerSet.has(target)) {
        throw new Error(`[layer-boundaries] Unknown target layer '${target}' in allowedImports['${layer}']`);
      }
      if ((allowedImports[target] || []).includes(layer)) {
        throw new Error(`[layer-boundaries] Circular import rule detected between '${layer}' and '${target}'.`);
      }
    }
  }
}

/**
 * Validates the exceptions structure (origin→destination).
 *
 * @param {string[]} layers - List of layers.
 * @param {Record<string, Record<string, string[]>>} exceptions - Exceptions per layer→destination.
 * @throws {Error} - If the exceptions structure is invalid.
 */
function validateExceptionsStructure(layers, exceptions) {
  if (!exceptions) {
    return;
  }
  const layerSet = new Set(layers);

  for (const [layerName, destMap] of Object.entries(exceptions)) {
    if (!layerSet.has(layerName)) {
      printLog(true, `[RULE] Warning: exception origin layer '${layerName}' not in layers, ignoring entire key.`);
      continue;
    }

    for (const [destLayer, patterns] of Object.entries(destMap)) {
      if (!layerSet.has(destLayer)) {
        printLog(true, `[RULE] Warning: exception target layer '${destLayer}' for origin '${layerName}' not in layers, ignoring patterns ${patterns}.`);
        continue;
      }
      if (!Array.isArray(patterns)) {
        throw new Error(`[layer-boundaries] Exceptions for '${layerName}->${destLayer}' must be an array of substrings.`);
      }
    }
  }
}

/**
 * Validates that all keys in allowedImports exist in layers, that there are no
 * circular rules, and that the exceptions structure is well-formed.
 *
 * @param {string[]} layers - List of layers.
 * @param {Record<string, string[]>} allowedImports - Allowed import rules.
 * @param {Record<string, Record<string, string[]>>} exceptions - Exceptions per layer→destination.
 * @throws {Error} - If unknown layers, circular rules, or malformed exceptions are found.
 */
function validateAllowedImports(layers, allowedImports, exceptions) {
  validateAllowedImportsStructure(layers, allowedImports);
  validateExceptionsStructure(layers, exceptions);
}

module.exports = { validateAllowedImports };
