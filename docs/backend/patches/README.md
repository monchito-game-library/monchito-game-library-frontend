# Patches SQL para Supabase

Cambios incrementales (DDL, RLS, RPC, datos puntuales) que hay que aplicar al
Supabase desplegado. Sirven para evitar la deriva entre
`docs/backend/schema/supabase-schema-current.sql` (canónico) y la base real.

## Convención

- Cada patch es **idempotente** (`DROP … IF EXISTS` antes de `CREATE`,
  `INSERT … ON CONFLICT DO NOTHING`, etc.) — se debe poder re-ejecutar sin romper
  nada.
- Nombre: `NNN-descripcion-corta.sql`, donde `NNN` es un secuencial de 3 dígitos.
- Una vez aplicado, **no se borra ni se modifica**: queda como histórico para
  poder reconstruir un entorno fresco aplicando todos los patches en orden.
- Si el cambio modifica el schema canónico, actualizar también
  `docs/backend/schema/supabase-schema-current.sql` en el mismo PR.

## Aplicar un patch

```bash
cp .env.example .env   # solo la primera vez — añadir tu SUPABASE_DB_URL
npm run db:apply -- docs/backend/patches/001-hardware-rls-admin-owner.sql
```

El script ejecuta el fichero entero dentro de una transacción. Si falla, hace
rollback y devuelve exit code 1.

## Diagnósticos

`docs/backend/patches/diagnostics/` contiene queries de **solo lectura** para
auditar el estado del Supabase desplegado. Pega su contenido en el SQL Editor
de Supabase (no las apliques con `db:apply`, no hace falta).
