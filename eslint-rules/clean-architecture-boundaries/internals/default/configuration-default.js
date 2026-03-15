'use strict';

/**
 * Default layers used in the clean architecture.
 */
const defaultLayers = ['data', 'di', 'domain', 'entities', 'presentation'];

/**
 * Default allowed imports between layers.
 */
const defaultAllowedImports = {
  data: ['entities'],
  di: ['data', 'domain'],
  domain: ['entities'],
  entities: [],
  presentation: ['di', 'domain', 'entities']
};

/**
 * Default exceptions per layer pair.
 *
 * - data→domain: allows '.contract' imports (repository contracts)
 * - presentation→domain: blocks 'repositories' imports (must go through use-cases)
 */
const defaultExceptions = {
  data: { di: [], domain: ['.contract'], entities: [], presentation: [] },
  di: { data: [], domain: [], entities: [], presentation: [] },
  domain: { data: [], di: [], entities: [], presentation: [] },
  entities: { data: [], di: [], domain: [], presentation: [] },
  presentation: { data: [], di: [], domain: ['repositories'], entities: [] }
};

module.exports = { defaultAllowedImports, defaultExceptions, defaultLayers };
