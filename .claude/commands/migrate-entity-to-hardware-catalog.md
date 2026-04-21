Migra una entidad que usa campos de texto libre (marca, modelo) a usar foreign keys a las tablas de catálogo de hardware (hardware_brands, hardware_models, hardware_editions).

Argumento: $ARGUMENTS — nombre de la entidad a migrar (ej: `user-games`).

## Pasos

### 1. Análisis previo
Antes de modificar nada:
- Identifica qué campos de texto se van a reemplazar (ej: `brand: string` → `brandId: string`)
- Revisa si hay filtros activos en la UI que usen esos campos
- Revisa el formulario de creación/edición — ¿tiene ya los selectores de marca/modelo?
- Informa al usuario del impacto completo antes de proceder

### 2. Modelo y DTO
- Reemplaza los campos `string` de texto libre por `xxxId: string` (FK)
- En el DTO: `xxx_id: string | null`
- Mantén los campos de texto antiguos solo si son necesarios para join/display; si no, elimínalos

### 3. Mapper
- `brandId: dto.brand_id` en lugar de `brand: dto.brand`
- Si el repositorio hace join (`select('*, hardware_brands(*)')`), añade el mapeo del objeto anidado

### 4. Repositorio Supabase
- Actualiza el `.select()` para incluir los joins necesarios:
  `select('*, hardware_brands(id, name), hardware_models(id, name)')`
- Actualiza `.insert()` / `.update()` para enviar los IDs en lugar de strings

### 5. Formulario (si existe)
- Sustituye el campo de texto por un `mat-select` o `mat-autocomplete`
- El componente necesitará cargar las opciones disponibles desde los use-cases de hardware
- Actualiza `XxxForm` y `XxxFormValue` en `src/app/entities/interfaces/forms/`

### 6. Componente lista/filtros (si hay filtros por marca/modelo)
- Actualiza los filtros para comparar por ID en lugar de por texto
- Carga las marcas/modelos disponibles para construir los labels del filtro

### 7. Script SQL (solo como referencia — NO ejecutar automáticamente)
Genera el SQL que habría que ejecutar en Supabase:
```sql
-- Añadir columnas FK
ALTER TABLE <entity> ADD COLUMN brand_id UUID REFERENCES hardware_brands(id);
-- Migrar datos existentes si aplica
-- Eliminar columnas antiguas tras migración
```
Guarda el SQL en `docs/backend/schema/migrations/` para referencia.

### 8. Actualizar tests
- Actualiza los mocks para usar IDs en lugar de strings
- Actualiza los tests del mapper

## Importante
Este proceso implica cambios en Supabase (esquema). Coordina con el usuario el orden de ejecución del SQL respecto al despliegue del código.
