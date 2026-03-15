'use strict';

/**
 * Prints log messages when debug mode is enabled.
 *
 * @param {boolean} debug - Whether to print the log.
 * @param {...any} args - Message(s) to print.
 */
function printLog(debug, ...args) {
  if (debug) {
    console.log(...args);
  }
}

module.exports = { printLog };
