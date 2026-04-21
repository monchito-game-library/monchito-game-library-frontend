Genera todos los artefactos necesarios para una nueva entidad de dominio siguiendo la arquitectura del proyecto.

Argumento: $ARGUMENTS — nombre de la entidad en kebab-case (ej: `game-review`) y opcionalmente sus campos (ej: `game-review rating:number comment:string?`).

## Artefactos a generar

Usa como referencia el patrón de `protector` (src/app/entities/models/protector/, src/app/data/mappers/supabase/protector.mapper.ts, etc.) para respetar la estructura exacta.

### 1. Modelo — `src/app/entities/models/<entity>/<entity>.model.ts`
- Interface `XxxModel` con JSDoc en cada campo
- Exportar desde un barrel si existe

### 2. DTO — `src/app/data/dtos/supabase/<entity>.dto.ts`
- Interface `XxxDto` con campos en snake_case
- Tipos Supabase (string, number, boolean, null)

### 3. Mapper — `src/app/data/mappers/supabase/<entity>.mapper.ts`
- Función `mapXxx(dto: XxxDto): XxxModel`
- Función `mapXxxToInsertDto(model: Partial<XxxModel>): Partial<XxxDto>`
- JSDoc en ambas funciones

### 4. Contrato repositorio — `src/app/domain/repositories/<entity>.repository.contract.ts`
- Interface `IXxxRepository` con métodos CRUD básicos: `getAll`, `getById`, `create`, `update`, `delete`
- `InjectionToken<IXxxRepository>` exportado como `XXX_REPOSITORY`

### 5. Contrato use-cases — `src/app/domain/use-cases/<entity>/<entity>.use-cases.contract.ts`
- Interface `IXxxUseCases` con los mismos métodos que el repositorio
- `InjectionToken<IXxxUseCases>` exportado como `XXX_USE_CASES`

### 6. Implementación use-cases — `src/app/domain/use-cases/<entity>/<entity>.use-cases.ts`
- Clase `XxxUseCases` que implementa `IXxxUseCases`
- Inyecta `XXX_REPOSITORY` via `inject()`
- Delega directamente en el repositorio
- JSDoc en cada método
- `@Injectable({ providedIn: 'root' })` NO — el provider va en DI

### 7. Provider repositorio — `src/app/di/repositories/<entity>.repository.provider.ts`
- Array `xxxRepositoryProvider` con `{ provide: XXX_REPOSITORY, useClass: SupabaseXxxRepository }` (la clase de implementación aún no existe — indícalo como TODO)

### 8. Provider use-cases — `src/app/di/use-cases/<entity>.use-cases.provider.ts`
- Array `xxxUseCasesProvider` con `{ provide: XXX_USE_CASES, useClass: XxxUseCases }`

### 9. Spec de mapper — `src/app/data/mappers/supabase/<entity>.mapper.spec.ts`
- Suite básica con 3-5 tests: mapeo completo, campos opcionales/null, mapeo inverso

### 10. Spec de use-cases — `src/app/domain/use-cases/<entity>/<entity>.use-cases.spec.ts`
- Suite básica con un test por método: verifica delegación al repositorio

## Reglas a respetar
- Todos los imports vía path aliases (`@/entities/*`, `@/domain/*`, etc.), nunca rutas relativas
- Campos y métodos `private` con prefijo `_`
- Tipos explícitos en todas las declaraciones
- JSDoc en todos los métodos públicos y privados
- Al terminar, lista todos los ficheros creados y menciona que falta crear la implementación del repositorio Supabase (`src/app/data/repositories/supabase-<entity>.repository.ts`)
