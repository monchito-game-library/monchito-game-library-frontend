#!/usr/bin/env node
/**
 * Verifica que cada componente de lib/retro/ con cambios en su API pública
 * tenga también su README.md actualizado en el staged area.
 *
 * Extensiones que disparan el chequeo: .component.ts, .types.ts, .component.html
 * Extensiones excluidas: .spec.ts (no cambian API), .scss (estilos puros)
 *
 * Uso: node scripts/check-retro-readme-sync.mjs
 * Salida: 0 si OK, 1 si hay READMEs pendientes de actualizar.
 */

import { execSync } from 'node:child_process';

const TRIGGER_EXTENSIONS = ['.component.ts', '.types.ts', '.component.html'];
const RETRO_LIB_PREFIX = 'lib/retro/';

function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean);
  } catch {
    return [];
  }
}

function extractComponent(filePath) {
  if (!filePath.startsWith(RETRO_LIB_PREFIX)) return null;
  const rest = filePath.slice(RETRO_LIB_PREFIX.length);
  const component = rest.split('/')[0];
  return component?.startsWith('retro-') ? component : null;
}

function shouldTrigger(filePath) {
  return TRIGGER_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}

const staged = getStagedFiles();
const stagedSet = new Set(staged);

// Componentes con cambios en ficheros de API pública
const dirtyComponents = new Set(
  staged.filter(shouldTrigger).map(extractComponent).filter(Boolean),
);

if (dirtyComponents.size === 0) process.exit(0);

// Comprobar cuáles tienen el README también staged
const missing = [...dirtyComponents].filter((component) => {
  const readme = `${RETRO_LIB_PREFIX}${component}/README.md`;
  return !stagedSet.has(readme);
});

if (missing.length === 0) process.exit(0);

console.error('\n\x1b[31m✗ README.md desactualizado en lib/retro/\x1b[0m\n');
console.error(
  'Los siguientes componentes tienen cambios de API pero su README.md no está staged:\n',
);

for (const component of missing) {
  const readme = `${RETRO_LIB_PREFIX}${component}/README.md`;
  console.error(`  \x1b[33m${component}\x1b[0m → ${readme}`);
  console.error(`  \x1b[90mgit add ${readme}\x1b[0m\n`);
}

console.error(
  '\x1b[90mSi el cambio es trivial (typo, comentario interno, refactor sin impacto en API),\npuedes saltarte el chequeo con: git commit --no-verify\x1b[0m\n',
);

process.exit(1);
