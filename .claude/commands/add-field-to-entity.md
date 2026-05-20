Añade un nuevo campo a una entidad existente actualizando todos los artefactos de la arquitectura de forma consistente.

Argumento: $ARGUMENTS — entidad y campo (ej: `protector lastUpdatedAt:Date?` o `game rating:number`).

## Pasos

### 0. Verificar el estado del campo en BD

Antes de tocar artefactos de código, confirma con el usuario:

- ¿La columna ya existe en la BD desplegada? Si **no**, hay que crear un patch SQL primero con `/db-patch` — los artefactos de código sin la columna fallarán en runtime.
- ¿Hay que sincronizar `docs/backend/schema/supabase-schema-current.sql`? Si el campo es de contrato (no un fix puntual), sí.

Si el campo aún no existe en BD, **detente** y propone al usuario lanzar `/db-patch` primero. Reanuda este flujo cuando el patch esté aplicado.

### 1. Localizar todos los artefactos de la entidad

Busca en:

- `src/app/entities/models/<entity>/` — modelo
- `src/app/data/dtos/supabase/<entity>.dto.ts` — DTO
- `src/app/data/mappers/supabase/<entity>.mapper.ts` — mapper
- `src/app/domain/repositories/<entity>.repository.contract.ts` — contrato repositorio
- `src/app/domain/use-cases/<entity>/` — use-cases
- `src/app/data/repositories/supabase-<entity>.repository.ts` — implementación

### 2. Actualizar el modelo

- Añade el campo con el tipo correcto y JSDoc de una línea
- Si es opcional, usa `field?: Type` o `field: Type | null`

### 3. Actualizar el DTO

- Convierte camelCase a snake_case (ej: `lastUpdatedAt` → `last_updated_at`)
- Usa tipos primitivos de Supabase (string, number, boolean, null)

### 4. Actualizar el mapper

- Añade la transformación en `mapXxx`: `dto.last_updated_at ?? null`
- Añade la transformación en `mapXxxToInsertDto`: `last_updated_at: model.lastUpdatedAt ?? undefined`

### 5. Revisar contratos y use-cases

- Si el campo introduce lógica nueva (ej: `isDeleted` para soft delete), sugiere los métodos nuevos al usuario antes de añadirlos
- Si es un campo de datos puro, no se necesitan cambios en contratos

### 6. Actualizar la implementación del repositorio

- Si hay queries que hacen `.select(*)`, normalmente no requieren cambios
- Si hay queries que seleccionan campos explícitamente, añade el nuevo campo

### 7. Actualizar los tests del mapper

- Añade el nuevo campo al objeto DTO de prueba en el spec existente
- Verifica que el test de "mapeo completo" sigue siendo exhaustivo

## Reglas

- Mantén todos los imports vía path aliases
- Respeta el tipo Supabase correcto en el DTO (no uses tipos TypeScript complejos)
- Al terminar, lista exactamente qué ficheros se modificaron y con qué cambio
