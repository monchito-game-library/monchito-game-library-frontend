# Monchito Game Library — Convenciones del proyecto

## Idioma de comunicación

Responder siempre en **español**.

## Git

- **Nunca hacer commit ni push** a menos que el usuario lo pida explícitamente.
- Rama descriptiva desde `master`: `git checkout -b tipo/descripcion-corta`.
- Hacer push y abrir PR contra `master`; CI debe pasar (tests + cobertura ≥ 80%) antes de mergear.
- Mergear con **squash merge**. No existe rama `develop`.
- Prefijos de rama: `feat/ fix/ chore/ test/ docs/ refactor/`

## Dependencias npm

- Usar **siempre versiones exactas** en `package.json`. Nunca `^` ni `~` (Vercel no acepta `--legacy-peer-deps`; los rangos abiertos causan fallos de peer deps entre entornos).
- Tras `npm install`, verificar que la versión quedó fija y corregirla si npm añadió un rango.
- Para el proceso completo de actualización → ver skill `update-deps`.

## Imports

- Usar **siempre** los path aliases de `tsconfig.json`. Nunca rutas relativas con `../` o `../../`.
- `./` solo es aceptable cuando el fichero está en la misma carpeta.

```
@/dtos/*         → src/app/data/dtos/*
@/data/*         → src/app/data/*
@/repositories/* → src/app/data/repositories/*
@/entities/*     → src/app/entities/*
@/interfaces/*   → src/app/entities/interfaces/*
@/types/*        → src/app/entities/types/*
@/constants/*    → src/app/entities/constants/*
@/domain/*       → src/app/domain/*
@/di/*           → src/app/di/*
@/components/*   → src/app/presentation/components/*
@/pages/*        → src/app/presentation/pages/*
@/services/*     → src/app/presentation/services/*
@/guards/*       → src/app/presentation/guards/*
@/shared/*       → src/app/presentation/shared/*
@/abstract/*     → src/app/presentation/abstract/*
@/models/*       → src/app/entities/models/*
@/mappers/*      → src/app/data/mappers/*
@/env            → src/environments/environment
```

## SCSS

- Usar siempre **`rem`** para `gap`, `margin` y `padding`. Nunca `px`.
- Valores deben ser **múltiplos de 0.25rem**: `0.25`, `0.5`, `0.75`, `1`, `1.25`, `1.5`, `1.75`, `2`…
- Excepción tolerada: micro-espaciados decorativos en chips, badges y pills (`padding: 2px 8px`) pueden ser `px`.
- Usar **clases completas** dentro de los bloques, nunca `&__elemento`.
- Los **modificadores** (`--mod`) sí pueden usar `&--modificador` sobre el elemento al que pertenecen.
- Los bloques `@media` van al **final del fichero**, con comentario separador: `// ── Responsive: < 1920x1080 ──`.

## Orden en componentes Angular

Dentro de la clase del componente respetar siempre este orden:

1. **Inyecciones privadas** (`private readonly _...`)
2. **Variables privadas** (subjects, flags, etc.)
3. **Variables públicas readonly** (constantes expuestas al template)
4. **Signals públicos** (`WritableSignal<T>` con JSDoc)
5. **Configuraciones públicas** (scroll config, form, etc.)
6. **Lifecycle hooks** (`ngOnInit`, `ngOnDestroy`)
7. **Métodos públicos** (handlers de template: `onXxx`, con JSDoc)
8. **Métodos privados** (lógica interna: `_loadXxx`, `_handleXxx`, con JSDoc)

## Convenciones de nombrado

- **Todos** los campos y métodos `private` llevan prefijo `_`, incluidas las inyecciones `private readonly`.
- Usar siempre **tipos explícitos** en inyecciones y señales: `WritableSignal<T>`, tipo explícito en `inject()`.
- Ejemplo mínimo: `private readonly _router: Router = inject(Router);` / `readonly loading: WritableSignal<boolean> = signal<boolean>(false);`

## JSDoc

- Todos los métodos públicos y privados llevan JSDoc, **excepto** lifecycle hooks (`ngOnInit`, `ngOnDestroy`, etc.).
- `@param` con tipo entre llaves: `@param {string} id - descripción`.
- Variables públicas (signals, configs) llevan JSDoc de una línea.
- El JSDoc debe describir **qué hace** el método, no repetir su nombre.

## Formularios reactivos Angular

- Crear interfaz `XxxForm` (con `FormControl<T>`) y `XxxFormValue` (tipos planos) en `src/app/entities/interfaces/forms/`.
- Referencia de interfaz: `console-form.interface.ts`; referencia de componente: `hardware-form-shell/`.
- Esquema del componente: inputs `initialValues` (`Partial<XxxModel> | null`) y `saving` (`boolean`); outputs `save` (`XxxFormValue`) y `cancel` (`void`); `FormGroup<XxxForm>` en constructor; patch en `ngOnInit`; `onSubmit()` valida y emite; `onCancel()` emite cancel.

## Repositorios y Arquitectura de capas

- Los repositorios implementan el contrato del fichero `.repository.contract.ts` en `domain/repositories/`.
- El provider DI vive en `src/app/di/repositories/`.

```
presentation  →  domain (repositorios contratos)  →  data (repositorios implementaciones)
                          ↕                                    ↕
                       entities                        data/dtos
```

- La capa `presentation` **nunca** importa directamente de `data`.

## Estructura de pages y components

- **`pages/`** — vistas con ruta propia: cada subcarpeta lleva `*.routes.ts` con `path: ''`; el padre la monta con `loadChildren`.
- **`components/`** — piezas reutilizables sin ruta: se importan directamente en el template del padre; no tienen `*.routes.ts`.

## Tests — mocks compartidos

Los mocks reutilizables viven en `src/testing/`. **Antes de declarar un mock inline, comprobar si ya existe aquí.**

| Fichero                                    | Exporta              | Uso                                                                                                                  |
| ------------------------------------------ | -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `activated-route.mock.ts`                  | `mockActivatedRoute` | `{ provide: ActivatedRoute, useValue: mockActivatedRoute }`                                                          |
| `dialog.mock.ts`                           | `mockDialog`         | `{ provide: RetroDialogService, useValue: mockDialog }`                                                              |
| `lib/retro/testing/retro-snackbar.mock.ts` | `mockRetroSnackbar`  | `{ provide: RetroSnackbarService, useValue: mockRetroSnackbar }` — importar con `@retro/testing/retro-snackbar.mock` |
| `location.mock.ts`                         | `mockLocation`       | `{ provide: Location, useValue: mockLocation }`                                                                      |
| `router.mock.ts`                           | `mockRouter`         | `{ provide: Router, useValue: mockRouter }`                                                                          |
| `transloco.mock.ts`                        | `mockTransloco`      | `{ provide: TranslocoService, useValue: mockTransloco }`                                                             |
| `user-context.mock.ts`                     | `mockUserContext`    | `{ provide: UserContextService, useValue: mockUserContext }`                                                         |

Si se necesita un nuevo mock reutilizable, añadirlo a esta carpeta y actualizar la tabla.

> Los mocks de `lib/retro/` viven en `lib/retro/testing/` y se importan con `@retro/testing/*`. Los mocks de la app siguen en `src/testing/`.

## Librería retro — sincronía de README

- Al modificar `.component.ts`, `.types.ts` o `.component.html` de un componente retro, actualizar su `README.md` en el mismo commit (ver skill `retro-readme`).
- Requieren README: nuevo input/output, slot, tipo, cambio de default o ejemplo obsoleto. No requieren: refactors internos, `*.spec.ts`, `*.scss`.
- El pre-commit hook `scripts/check-retro-readme-sync.mjs` bloquea commits que tocan ficheros de API sin el README en staged. `--no-verify` solo si el cambio no afecta a la API.

## Estructura de carpetas en lib/retro/

En `lib/retro/retro-xxx/`, la raíz contiene únicamente el component (`.ts/.html/.scss/.spec.ts`), `retro-xxx.types.ts` (si existe) y `README.md`. Todo lo demás en subcarpetas:

- Componentes/directivas hijos → `components/retro-xxx-yyy/`
- Directivas auxiliares → `directive/`
- Interfaces → `interfaces/` | Constantes → `constants/` | Tokens → `tokens/`

## Pipeline de calidad

- `lib/retro/` se valida **siempre antes** que `src/`; si la lib falla los checks de la app no se ejecutan.
- Scripts con sufijo `:retro`/`:app` para lint, test, coverage y check:unused — detalle completo en skill `qa`.
- Thresholds de cobertura: lib **90%** (`angular.json` → `retro-coverage.coverageThresholds`), app **80%**.
- `lib/retro/` **no puede importar nada de `src/`** ni usar aliases `@/*`; solo `@retro/*`, `@retro/testing/*` o paquetes npm — enforzado por ESLint (`no-restricted-imports` en `lib/retro/eslint.config.js`).
- La lib es **carpeta con configs propias**, no proyecto `ng-packagr` (intencional; se formalizaría solo si se publicara a npm).
- CI: job `retro` (lint + cobertura) → job `app` (`needs: retro`; build + lint + cobertura con secrets Supabase/RAWG/Sentry).
