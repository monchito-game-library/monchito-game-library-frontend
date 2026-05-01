Crea un patch SQL incremental para la BD de Supabase y opcionalmente lo aplica con `npm run db:apply`.

Argumento: $ARGUMENTS — descripción corta del cambio (ej: `tighten-rls-products` o `add-column-game-rating`). Si está vacío, pregunta al usuario.

> Contexto del flujo: `docs/backend/patches/README.md`. Razón de existir: el schema canónico `docs/backend/schema/supabase-schema-current.sql` es solo documentación — para aplicar cambios incrementales a la BD ya desplegada hace falta este patch versionado.

## Pasos

### 1. Determinar el número del patch
- Lista `docs/backend/patches/` (ignorando el subdirectorio `diagnostics/`) y detecta el último número usado.
- El nuevo patch usa el siguiente entero, formateado a 3 dígitos: `003`, `004`, …

### 2. Pedir el SQL al usuario
- Si no está claro por el argumento, pregunta qué cambio quiere hacer (RLS, columna, RPC, índice, etc.).
- Si afecta a tablas existentes, antes de escribir nada pídele al usuario que pegue el resultado de un diagnóstico en el SQL Editor (ver `docs/backend/patches/diagnostics/`) para que no escribas a ciegas.

### 3. Crear el fichero del patch
Crear `docs/backend/patches/NNN-<descripcion>.sql` con esta estructura:

```sql
-- ============================================================
-- NNN — <descripción humana del cambio>
-- ============================================================
-- <Contexto en 1-3 líneas: qué se cambia y por qué.>
-- ============================================================

-- SQL idempotente del cambio aquí.

NOTIFY pgrst, 'reload schema';
```

**El SQL debe ser siempre idempotente** (re-ejecutable sin romper):
- Policies: `DROP POLICY IF EXISTS … ON …;` **antes** de cada `CREATE POLICY …`. Si renombras una policy, drop tanto el nombre antiguo como el nuevo.
- Tablas / columnas: `CREATE TABLE IF NOT EXISTS …`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS …`.
- Datos puntuales: `INSERT … ON CONFLICT DO NOTHING` (o `DO UPDATE` si toca).
- Funciones / vistas: `CREATE OR REPLACE …`.

### 4. Sincronizar el schema canónico
Si el cambio modifica el contrato de la BD (no es solo un fix puntual), actualizar también `docs/backend/schema/supabase-schema-current.sql` para reflejar el nuevo estado. Ambos ficheros van en el mismo PR.

### 5. Aplicar (opcional, preguntar al usuario)
Pregunta si quiere aplicarlo ahora.

Si dice sí:
- Verifica que `.env` existe y contiene `SUPABASE_DB_URL=postgresql://…`. Si no, indica los pasos: copiar de `.env.example`, pegar la connection string del Session pooler de Supabase Dashboard.
- Ejecuta: `npm run db:apply -- docs/backend/patches/NNN-<descripcion>.sql`
- Reporta el resultado al usuario.

Si dice no:
- Indica el comando para aplicarlo cuando quiera.

### 6. Verificación post-aplicación
- Si tocaba RLS o algo auditable, sugiere correr el diagnóstico relevante de `docs/backend/patches/diagnostics/` en el SQL Editor.

## Reglas
- **No hacer commit ni push**. El patch queda listo y el usuario decide cuándo abrir PR (`/pr`).
- Si al aplicar el patch falla por idempotencia incompleta (típico: olvidar dropear un nombre nuevo), **arregla el fichero** en lugar de aplicar un workaround manual. Es lo que tiene que hacer el patch.
- Si el cambio toca el schema canónico, ambos ficheros deben quedar coherentes en el mismo PR.
- Si la red bloquea Postgres (red corporativa con DPI, IPv6 only…), pegar el SQL en el SQL Editor de Supabase es alternativa válida. El script es preferente pero no obligatorio.
