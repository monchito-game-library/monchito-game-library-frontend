'use strict';

const path = require('path');

/**
 * Determines which layer a file belongs to based on its path.
 *
 * @param {string} filePath - Absolute path to the file.
 * @param {string[]} layers - List of valid layers.
 * @returns {string|null} - The matching layer, or null if none found.
 */
function determineLayer(filePath, layers) {
  const normalizedPath = filePath.split(path.sep).join('/');
  return layers.find((layer) => normalizedPath.includes(`/${layer}/`)) || null;
}

/**
 * Checks whether an import path points to a specific layer.
 *
 * @param {string} importPath - The resolved import path.
 * @param {string} layer - Target layer name ('data', 'domain', etc.).
 * @returns {boolean} - True if the path points to the given layer.
 */
function isImportingFromLayer(importPath, layer) {
  const normalizedImport = importPath.replace(/\\/g, '/');
  return (
    normalizedImport.includes(`/${layer}/`) ||
    normalizedImport.includes(`../${layer}`) ||
    new RegExp(`(?:^|/)${layer}/`).test(normalizedImport)
  );
}

module.exports = { determineLayer, isImportingFromLayer };
