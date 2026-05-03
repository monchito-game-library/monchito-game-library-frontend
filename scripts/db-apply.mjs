#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';

const file = process.argv[2];
if (!file) {
  console.error('Uso: npm run db:apply -- <ruta/al/fichero.sql>');
  process.exit(2);
}

const url = process.env.SUPABASE_DB_URL;
if (!url) {
  console.error('Falta SUPABASE_DB_URL en .env (Settings → Database → Connection string).');
  process.exit(2);
}

const path = resolve(process.cwd(), file);
const sql = readFileSync(path, 'utf8');

const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
await client.connect();

console.log(`→ Aplicando ${path}`);
try {
  await client.query('BEGIN');
  await client.query(sql);
  await client.query('COMMIT');
  console.log('✔ OK');

  // Notificar a PostgREST que recargue el schema cache. Si no se hace, las tablas
  // o columnas nuevas devuelven CORS "Method not allowed" en el preflight hasta
  // el siguiente reload manual desde el dashboard.
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('✔ PostgREST schema reload disparado');
} catch (err) {
  await client.query('ROLLBACK').catch(() => {});
  console.error('✗ Falló — transacción revertida.');
  console.error(err.message);
  process.exit(1);
} finally {
  await client.end();
}
