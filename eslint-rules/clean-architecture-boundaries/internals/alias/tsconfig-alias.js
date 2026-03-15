'use strict';

const fs = require('fs');
const { printLog } = require('../logger/boundaries-logger');

let tsconfigPathsMap = null;

/**
 * Loads path aliases defined in tsconfig for import resolution.
 * Tries tsconfig.json first, then tsconfig.base.json.
 *
 * @param {boolean} debug - Whether to print logs.
 * @returns {Record<string, string>} - Map of alias to resolved paths.
 */
function loadTsconfigPaths(debug = false) {
  if (tsconfigPathsMap) {
    return tsconfigPathsMap;
  }

  const tryFiles = ['tsconfig.json', 'tsconfig.base.json'];
  const errors = [];

  for (const file of tryFiles) {
    try {
      const tsconfig = JSON.parse(fs.readFileSync(file, 'utf-8'));
      const paths = tsconfig.compilerOptions?.paths;
      if (!paths) {
        continue;
      }

      tsconfigPathsMap = {};
      for (const alias in paths) {
        const realPaths = paths[alias];
        const cleanedAlias = alias.replace('/*', '');
        tsconfigPathsMap[cleanedAlias] = realPaths[0].replace('/*', '');
      }

      printLog(debug, `[RULE] Loaded tsconfig paths from ${file}:`, tsconfigPathsMap);
      return tsconfigPathsMap;
    } catch (err) {
      errors.push(`[RULE] Failed to load ${file}: ${err.message}`);
    }
  }

  if (debug) {
    for (const msg of errors) {
      printLog(debug, msg);
    }
    printLog(debug, '[RULE] No tsconfig with paths found.');
  }

  return {};
}

/**
 * Resolves an alias to its actual path using tsconfig paths.
 *
 * @param {string} importPath - Import path with alias (e.g. '@/data/foo').
 * @param {boolean} debug - Whether to print logs.
 * @returns {string} - Resolved path (e.g. 'src/app/data/foo') or the original if no alias matched.
 */
function resolveAlias(importPath, debug = false) {
  const pathsMap = loadTsconfigPaths(debug);
  const alias = Object.keys(pathsMap).find((key) => importPath.startsWith(key + '/'));

  if (!alias) {
    printLog(debug, `     ⚠️  No alias match for '${importPath}'`);
    return importPath;
  }

  const rest = importPath.substring(alias.length + 1);
  const resolved = `${pathsMap[alias]}/${rest}`;
  printLog(debug, `     🔁  Resolved alias '${importPath}' → '${resolved}'`);
  return resolved;
}

module.exports = { loadTsconfigPaths, resolveAlias };
