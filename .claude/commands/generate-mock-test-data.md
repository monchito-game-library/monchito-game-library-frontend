Genera mocks tipados y factories de test data para una entidad del proyecto.

Argumento: $ARGUMENTS — nombre de la entidad en kebab-case (ej: `protector` o `game`).

## Qué generar

Revisa primero si ya existe algún mock en `src/testing/` para la entidad indicada. Si existe, actualízalo en lugar de crear uno nuevo.

### 1. Mock singleton — `src/testing/<entity>.mock.ts`

```typescript
import { XxxModel } from '@/models/<entity>/<entity>.model';

export const mock<Xxx>: XxxModel = {
  id: 'mock-<entity>-id-1',
  // todos los campos con valores realistas
  // strings descriptivos, números dentro de rangos válidos
  // fechas como strings ISO
};

export const mock<Xxx>List: XxxModel[] = [
  mock<Xxx>,
  { ...mock<Xxx>, id: 'mock-<entity>-id-2', /* variación */ },
  { ...mock<Xxx>, id: 'mock-<entity>-id-3', /* variación */ },
];
```

### 2. Factory function — `src/testing/factories/<entity>.factory.ts`

```typescript
export function create<Xxx>(overrides: Partial<XxxModel> = {}): XxxModel {
  return {
    id: 'factory-<entity>-' + Math.random().toString(36).slice(2),
    // campos con valores por defecto razonables
    ...overrides,
  };
}
```

### 3. Mock del DTO (si el repositorio lo necesita)
Si existe `src/app/data/dtos/supabase/<entity>.dto.ts`, genera también:

```typescript
export const mock<Xxx>Dto: <Xxx>Dto = {
  id: 'mock-<entity>-id-1',
  // campos en snake_case con valores equivalentes al mock modelo
};
```

### 4. Actualizar la tabla de mocks en CLAUDE.md
Si se crea un nuevo fichero de mock en `src/testing/`, añade una fila a la tabla de "Tests — mocks compartidos" en `CLAUDE.md`.

## Valores por defecto recomendados
- IDs: strings descriptivos tipo `'mock-protector-id-1'`
- Fechas: strings ISO `'2024-01-15T10:00:00.000Z'`
- Booleanos opcionales: `false`
- Arrays: arrays vacíos `[]` o con 1-2 elementos de ejemplo
- Enums/tipos union: el valor por defecto o más común del proyecto
- Precios: números con decimales razonables (ej: `29.99`)
