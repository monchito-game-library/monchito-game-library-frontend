#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdirSync, createWriteStream, existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('Falta SUPABASE_DB_URL en .env (Settings → Database → Connection string).');
  process.exit(2);
}

const rawLabel = process.argv[2] ?? 'manual';
const label = rawLabel.replace(/[^a-z0-9._-]/gi, '-');
const stamp = new Date()
  .toISOString()
  .replace(/[:T]/g, '-')
  .replace(/\..+$/, '')
  .slice(0, 16);

const dir = resolve(process.cwd(), 'backups');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

const out = resolve(dir, `pre-${label}-${stamp}.sql`);

const masked = url.replace(/:[^:@/]+@/, ':***@');
console.log(`→ Volcando schema 'public' de ${masked}`);
console.log(`→ Destino: ${out}`);

const stream = createWriteStream(out);
const child = spawn(
  'pg_dump',
  [url, '--schema=public', '--no-owner', '--no-acl', '--quote-all-identifiers'],
  { stdio: ['ignore', 'pipe', 'inherit'] }
);

child.stdout.pipe(stream);

child.on('error', (err) => {
  if (err.code === 'ENOENT') {
    console.error('✗ pg_dump no está instalado. Instalar con: brew install postgresql');
  } else {
    console.error('✗', err.message);
  }
  process.exit(1);
});

child.on('exit', (code) => {
  stream.end(() => {
    if (code === 0) {
      const size = statSync(out).size;
      console.log(`✔ Backup creado (${(size / 1024).toFixed(1)} KB)`);
      console.log(`  Restaurar con: psql "$SUPABASE_DB_URL" < ${out}`);
    } else {
      console.error(`✗ pg_dump terminó con exit code ${code}`);
      process.exit(code ?? 1);
    }
  });
});
