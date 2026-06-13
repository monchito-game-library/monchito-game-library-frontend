---
description: "Generates all necessary artifacts for a new domain entity following the project architecture: model, DTO, mapper, repository contract, use-cases contract/implementation, DI providers, and basic specs. Use when the user wants to add a new entity to the domain layer ('crea la entidad', 'genera los artefactos para', 'aniade la entidad de dominio')."
argument-hint: '[entity-name] [fields...]'
---

**Argument:** `$ARGUMENTS` — entity name in kebab-case (e.g. `game-review`) and optionally its fields (e.g. `game-review rating:number comment:string?`).

Use the `protector` entity as reference pattern (`src/app/entities/models/protector/`, `src/app/data/mappers/supabase/protector.mapper.ts`, etc.) to follow the exact project structure.

## Artifacts to generate

| #   | Artifact                 | Path                                                               |
| --- | ------------------------ | ------------------------------------------------------------------ |
| 1   | Model                    | `src/app/entities/models/<entity>/<entity>.model.ts`               |
| 2   | DTO                      | `src/app/data/dtos/supabase/<entity>.dto.ts`                       |
| 3   | Mapper                   | `src/app/data/mappers/supabase/<entity>.mapper.ts`                 |
| 4   | Repository contract      | `src/app/domain/repositories/<entity>.repository.contract.ts`      |
| 5   | Use-cases contract       | `src/app/domain/use-cases/<entity>/<entity>.use-cases.contract.ts` |
| 6   | Use-cases implementation | `src/app/domain/use-cases/<entity>/<entity>.use-cases.ts`          |
| 7   | Repository provider      | `src/app/di/repositories/<entity>.repository.provider.ts`          |
| 8   | Use-cases provider       | `src/app/di/use-cases/<entity>.use-cases.provider.ts`              |
| 9   | Mapper spec              | `src/app/data/mappers/supabase/<entity>.mapper.spec.ts`            |
| 10  | Use-cases spec           | `src/app/domain/use-cases/<entity>/<entity>.use-cases.spec.ts`     |

### 1. Model

- Interface `XxxModel` with JSDoc on every field.

### 2. DTO

- Interface `XxxDto` with snake_case fields.
- Supabase-compatible types: `string`, `number`, `boolean`, `null`.

### 3. Mapper

- Function `mapXxx(dto: XxxDto): XxxModel`
- Function `mapXxxToInsertDto(model: Partial<XxxModel>): Partial<XxxDto>`
- JSDoc on both functions.

### 4. Repository contract

- Interface `IXxxRepository` with basic CRUD methods: `getAll`, `getById`, `create`, `update`, `delete`.
- Export `InjectionToken<IXxxRepository>` as `XXX_REPOSITORY`.

### 5. Use-cases contract

- Interface `IXxxUseCases` with the same methods as the repository.
- Export `InjectionToken<IXxxUseCases>` as `XXX_USE_CASES`.

### 6. Use-cases implementation

- Class `XxxUseCases` implementing `IXxxUseCases`.
- Inject `XXX_REPOSITORY` via `inject()`.
- Delegate directly to the repository; no business logic here.
- JSDoc on every method.
- Decorate with `@Injectable()` (no `providedIn`). The provider lives in `di/use-cases/` (step 8), not in the decorator.

### 7. Repository provider

- Array `xxxRepositoryProvider` with `{ provide: XXX_REPOSITORY, useClass: SupabaseXxxRepository }`.
- The Supabase implementation class does not exist yet — mark it with a `TODO` comment.

### 8. Use-cases provider

- Array `xxxUseCasesProvider` with `{ provide: XXX_USE_CASES, useClass: XxxUseCases }`.

### 9. Mapper spec

- Basic suite with 3-5 tests: full mapping, optional/null fields, reverse mapping.

### 10. Use-cases spec

- Basic suite with one test per method: verifies delegation to the repository.

## Rules

- All imports via path aliases (`@/entities/*`, `@/domain/*`, etc.) — never relative paths.
- All `private` fields and methods prefixed with `_`.
- Explicit types on every declaration.
- JSDoc on all public and private methods.
- When done, list every created file and note that the following still need to be created:
  - `src/app/data/repositories/supabase-<entity>.repository.ts` (Supabase implementation)
  - `src/app/data/repositories/supabase-<entity>.repository.spec.ts` (spec; app coverage threshold: 80%)
