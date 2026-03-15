'use strict';

const { printLog } = require('../logger/boundaries-logger');

/**
 * Checks whether an import is a self-import or targets an unknown layer.
 *
 * @param {string|null} importLayer - Detected target layer, or null if not found.
 * @param {string} currentLayer - Layer of the current file.
 * @param {string} importPath - Import path.
 * @param {boolean} debug - Debug mode.
 * @param {{allowed: number, errors: number}} [counters] - Counters object.
 * @returns {boolean} - True if it is a self-import or unknown target and should be allowed.
 */
function isSelfOrUnknownImport(importLayer, currentLayer, importPath, debug, counters) {
  if (!importLayer || importLayer === currentLayer) {
    printLog(debug, `     ✅  Self-import or unknown target from ${currentLayer} to ${importPath}`);
    if (counters) {
      counters.allowed++;
    }
    return true;
  }
  return false;
}

/**
 * Evaluates the exceptions defined for a given origin→destination pair.
 *
 * Returns 'block' if a pattern blocks a normally-allowed import.
 * Returns 'allow' if a pattern permits a normally-forbidden import.
 * Returns null if no pattern matches.
 *
 * @param {string} importPath - Import path.
 * @param {string} currentLayer - Layer of the current file.
 * @param {string} importLayer - Target layer.
 * @param {boolean} debug - Debug mode.
 * @param {{allowed: number, errors: number}} [counters] - Counters object.
 * @param {Record<string, Record<string, string[]>>} exceptions - Exceptions map origin→destination→patterns.
 * @param {boolean} isAllowedPair - Whether allowedImports[currentLayer] already includes importLayer.
 * @returns {'allow'|'block'|null}
 */
function checkExceptions(importPath, currentLayer, importLayer, debug, counters, exceptions, isAllowedPair) {
  const originExceptions = exceptions[currentLayer] || {};
  const patternsForThisDest = originExceptions[importLayer] || [];

  for (const pattern of patternsForThisDest) {
    if (importPath.includes(pattern)) {
      if (isAllowedPair) {
        printLog(debug, `     🔶 Blocking exception: source='${currentLayer}', destination='${importLayer}', pattern='${pattern}'.`);
        printLog(debug, `     🔶 Import '${importPath}' is pattern-locked.`);
        if (counters) {
          counters.errors++;
        }
        return 'block';
      }
      printLog(debug, `     🔶 Permission exception: source='${currentLayer}', destination='${importLayer}', pattern='${pattern}'.`);
      printLog(debug, `     🔶 Import '${importPath}' allowed by exception.`);
      if (counters) {
        counters.allowed++;
      }
      return 'allow';
    }
  }
  return null;
}

module.exports = { checkExceptions, isSelfOrUnknownImport };
