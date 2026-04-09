# Dependencias — Estado y plan de actualización

## Actualizadas

| Paquete | De | A | Fecha |
|---|---|---|---|
| `@angular/*` (core, router, forms…) | 21.2.3 | 21.2.8 | 2026-04-09 |
| `@angular/cdk` + `@angular/material` | 21.2.2 | 21.2.6 | 2026-04-09 |
| `@angular-devkit/build-angular`, `@angular/build`, `@angular/cli` | 21.2.2 | 21.2.7 | 2026-04-09 |
| `@angular/compiler-cli` | 21.2.3 | 21.2.8 | 2026-04-09 |
| `rxjs` | 7.8.0 | 7.8.2 | 2026-04-09 |
| `@jsverse/transloco` | 8.2.1 | 8.3.0 | 2026-04-09 |
| `@typescript-eslint/parser` + `typescript-eslint` | 8.57.0 | 8.58.1 | 2026-04-09 |
| `@vitest/coverage-v8` + `vitest` | 4.1.0 | 4.1.4 | 2026-04-09 |
| `happy-dom` | 20.8.4 | 20.8.9 | 2026-04-09 |
| `@supabase/supabase-js` | 2.99.1 | 2.103.0 | 2026-04-09 |
| `sass` | 1.87.0 | 1.99.0 | 2026-04-09 |
| `tslib` | 2.3.0 | 2.8.1 | 2026-04-09 |

---

## Bloqueadas (bug upstream)

| Paquete | Versión actual | Disponible | Motivo del bloqueo |
|---|---|---|---|
| `@angular-eslint/*` + `angular-eslint` | 21.3.0 | 21.3.1 | `angular-eslint@21.3.1` lleva internamente `@angular-eslint/schematics@21.3.0` que fija `eslint-plugin-template` en `21.3.0`. Conflicto de peer deps irresoluble hasta que publiquen una `21.3.2`. |

---

## Pendientes — Major versions

Ordenadas de **menor a mayor impacto** en el proyecto.

| # | Paquete | De | A | Impacto | Notas |
|---|---|---|---|---|---|
| 1 | `prettier-plugin-package` | 1.4.0 | 2.x | Mínimo | Solo ordena `package.json`. Cosmético. |
| 2 | `lint-staged` | 15.5.1 | 16.x | Bajo | Herramienta de pre-commit. Puede cambiar formato de config. |
| 3 | `@types/express` | 4.17.17 | 5.x | Bajo | Solo tipos. Usamos pocas APIs de Express (SSR/scripts). |
| 4 | `@types/node` | 24.0.0 | 25.x | Bajo-medio | Solo tipos. Poco probable que rompa algo. |
| 5 | `eslint-plugin-jsdoc` | 61.7.1 | 62.x | Medio | Pueden cambiar/añadir/eliminar reglas JSDoc. Posibles nuevos errores de lint. |
| 6 | `eslint` | 9.39.4 | 10.x | Alto | Puede romper la config de eslint. ESLint 10 consolida flat config y elimina APIs legacy. |
| 7 | `typescript` | 5.9.3 | 6.x | Muy alto | Puede romper la compilación. Afecta a todo el código. |
