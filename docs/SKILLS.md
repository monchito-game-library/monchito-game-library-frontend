# Claude Code Skills — Monchito Game Library

Skills personalizadas disponibles en este proyecto. Se invocan desde Claude Code con `/nombre-del-skill`.
Los ficheros de definición viven en `.claude/commands/`.

---

## Índice

- [Diseño y UI/UX (auto-activados)](#diseño-y-uiux-auto-activados)
- [Workflow general](#workflow-general)
- [Arquitectura y generación de código](#arquitectura-y-generación-de-código)
- [Tests](#tests)
- [Refactoring y mantenimiento](#refactoring-y-mantenimiento)

---

## Diseño y UI/UX (auto-activados)

Skills que no se invocan con `/comando` — se activan automáticamente cuando el prompt contiene palabras clave relacionadas con su dominio. Los ficheros viven en `.claude/skills/`.

---

### `ui-ux-pro-max`

**Ficheros:** `.claude/skills/ui-ux-pro-max/` (SKILL.md + data/ + scripts/)
**Instalación:** ámbito de proyecto (no global). Para actualizar a la última versión publicada en npm:

```bash
npx uipro-cli update --ai claude
```

**Qué aporta:**
- 67 estilos UI (glassmorphism, claymorphism, dark mode OLED, cyberpunk…)
- 161 paletas de color especializadas por industria
- 57 pairings de tipografías (Google Fonts)
- 99 directrices UX + directrices específicas de Angular
- Motor de búsqueda BM25 + generador de design systems

**Se activa automáticamente con** palabras como: `diseño`, `UI`, `componente`, `color`, `tipografía`, `layout`, `card`, `formulario`, `dashboard`, `paleta`, `estilo`, `responsive`…

**Para usarlo explícitamente**, describe lo que quieres construir o mejorar en lenguaje natural:

```
Mejora el diseño de las game-cards para que tengan más identidad gaming
Elige una paleta de color más apropiada para la app
Analiza el diseño completo de la página de wishlist y propón mejoras
```

**Audit realizado:** ver [Identidad visual y sistema de diseño](ROADMAP.md#identidad-visual-y-sistema-de-diseño) en el ROADMAP.

---

## Workflow general

### `/qa`
Ejecuta el pipeline completo de calidad en orden: lint → check:unused → tests.
Si algún paso falla, Claude corrige los errores antes de continuar.

```
/qa
```

**Cuándo usarlo:** antes de cualquier commit o al terminar una feature.

---

### `/pr [descripción opcional]`
Crea una pull request siguiendo las convenciones del proyecto: rama bien nombrada, título y body en español, squash merge. Pregunta si activar auto-merge.

```
/pr añadir campo de notas al formulario de juego
```

**Cuándo usarlo:** cuando los cambios están listos para revisión.

---

### `/next`
Lee `docs/BUGS.md` y `docs/ROADMAP.md` y propone la siguiente tarea según prioridad. No implementa nada hasta confirmación.

```
/next
```

**Cuándo usarlo:** al iniciar una sesión de trabajo y no tener tarea clara.

---

### `/update-testing`
Sincroniza los conteos de `docs/TESTING.md` con la salida real de `npm test`. Actualiza tablas y resumen final.

```
/update-testing
```

**Cuándo usarlo:** después de añadir o eliminar tests.

---

## Arquitectura y generación de código

### `/create-domain-entity <nombre> [campos]`
Genera los 10 artefactos completos de una nueva entidad: modelo, DTO, mapper, contrato repositorio, contrato use-cases, implementación use-cases, provider repositorio, provider use-cases y specs de mapper y use-cases.

```
/create-domain-entity game-review
/create-domain-entity game-review rating:number comment:string?
```

**Artefactos generados:**

| Fichero | Descripción |
|---|---|
| `src/app/entities/models/<entity>/<entity>.model.ts` | Interface del modelo de dominio |
| `src/app/data/dtos/supabase/<entity>.dto.ts` | DTO con tipos Supabase y snake_case |
| `src/app/data/mappers/supabase/<entity>.mapper.ts` | Funciones de mapeo bidireccional |
| `src/app/domain/repositories/<entity>.repository.contract.ts` | Interface + InjectionToken del repositorio |
| `src/app/domain/use-cases/<entity>/<entity>.use-cases.contract.ts` | Interface + InjectionToken de use-cases |
| `src/app/domain/use-cases/<entity>/<entity>.use-cases.ts` | Implementación que delega en el repositorio |
| `src/app/di/repositories/<entity>.repository.provider.ts` | Provider DI del repositorio |
| `src/app/di/use-cases/<entity>.use-cases.provider.ts` | Provider DI de use-cases |
| `src/app/data/mappers/supabase/<entity>.mapper.spec.ts` | Spec básico del mapper |
| `src/app/domain/use-cases/<entity>/<entity>.use-cases.spec.ts` | Spec básico de use-cases |

**Nota:** la implementación del repositorio Supabase (`supabase-<entity>.repository.ts`) queda como TODO.

---

### `/add-field-to-entity <entidad> <campo:tipo>`
Añade un campo a una entidad existente actualizando todos sus artefactos de forma consistente: modelo, DTO (con conversión camelCase→snake_case), mapper (transformación bidireccional), repositorio e implementación.

```
/add-field-to-entity protector last-updated-at:Date?
/add-field-to-entity game rating:number
```

**Cuándo usarlo:** cada vez que el schema de Supabase añade una columna nueva o el dominio evoluciona.

---

### `/scaffold-reactive-form <nombre> [campos]`
Genera la interface `XxxForm` + `XxxFormValue` en `src/app/entities/interfaces/forms/` y el componente de formulario reactivo completo con template, SCSS y spec.

```
/scaffold-reactive-form game-review rating:number comment:string?
```

**Artefactos generados:**
- `src/app/entities/interfaces/forms/<entity>-form.interface.ts`
- `src/app/presentation/components/<entity>-form/<entity>-form.component.ts`
- `<entity>-form.component.html`
- `<entity>-form.component.scss`
- `<entity>-form.component.spec.ts`

---

### `/generate-component-with-dialog <nombre> [ubicación]`
Genera un dialog Angular Material standalone con su interface de datos, template estructurado, SCSS, spec y un snippet de apertura desde el componente padre.

```
/generate-component-with-dialog game-review-dialog pages/games/components
/generate-component-with-dialog confirm-sale-dialog
```

**Artefactos generados:**
- `<ubicacion>/<name>/<name>.component.ts` (con `XxxDialogData` y `XxxDialogResult`)
- `<name>.component.html`
- `<name>.component.scss`
- `<name>.component.spec.ts`
- Snippet de uso en el componente padre

---

### `/migrate-entity-to-hardware-catalog <entidad>`
Migra una entidad que usa campos de texto libre (marca, modelo) a usar foreign keys a las tablas de catálogo (`hardware_brands`, `hardware_models`, `hardware_editions`). Incluye script SQL de referencia, actualización de mapper, repositorio, formulario y tests.

```
/migrate-entity-to-hardware-catalog user-games
```

**Cuándo usarlo:** cuando se amplía la Fase 3 del ROADMAP (catálogo de hardware) a nuevas entidades.

---

## Tests

### `/generate-mock-test-data <entidad>`
Genera mocks tipados (`mockXxx`, `mockXxxList`) y una factory function (`createXxx(overrides?)`) en `src/testing/` para usar en specs. También genera el mock del DTO si existe.

```
/generate-mock-test-data protector
/generate-mock-test-data game
```

**Artefactos generados:**
- `src/testing/<entity>.mock.ts`
- `src/testing/factories/<entity>.factory.ts`
- `src/testing/<entity>.dto.mock.ts` (si existe el DTO)

---

## Refactoring y mantenimiento

### `/detect-architecture-violations [ruta]`
Escanea el código en busca de violaciones de arquitectura y convenciones, complementando ESLint con un informe en lenguaje natural agrupado por categoría.

```
/detect-architecture-violations
/detect-architecture-violations src/app/presentation/pages/games
```

**Qué detecta:**

| Categoría | Qué busca |
|---|---|
| Capas | `presentation/` importando de `data/` directamente |
| Imports | Rutas relativas (`../`) fuera del mismo directorio |
| Nombrado | Privados sin prefijo `_`, signals sin tipo explícito |
| JSDoc | Métodos públicos/privados sin JSDoc o con `@param` sin tipo |
| SCSS | `gap`/`margin`/`padding` en `px`, clases con `&__` anidado |
| Tipos | Interfaces o tipos declarados dentro de componentes |

---

### `/refactor-component-to-signals <ruta>`
Refactoriza un componente que usa RxJS (`BehaviorSubject`, `Observable`, `subscribe`) a la API moderna de Angular Signals (`signal`, `computed`, `effect`).

```
/refactor-component-to-signals src/app/presentation/pages/games/games.component.ts
```

**Transformaciones que aplica:**
- `BehaviorSubject<T>` → `WritableSignal<T>`
- `.subscribe()` para derivar estado → `computed()`
- `combineLatest([...])` → `computed(() => ({ ... }))`
- `async pipe` en template → llamada directa a signal
- Limpieza de imports RxJS no usados

**Nota:** las suscripciones a fuentes externas (Router, Supabase realtime, BreakpointObserver) se mantienen o se migran a `toSignal()` según el caso.
