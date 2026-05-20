# Testing — Librería Retro

> Este documento cubre exclusivamente la librería de componentes retro (`lib/retro/`). Para la app Angular ver [`docs/TESTING.md`](./TESTING.md).

## Configuración

- **Framework**: Vitest 4.1.0 vía `@angular/build:unit-test`
- **Entorno DOM**: happy-dom 20.8.4
- **Ejecutar tests**: `npm run test:retro` (una vez) / `npm run test:retro -- --watch` (watch mode)
- **Cobertura**: `npm run test:retro:coverage` → informe HTML en `coverage/monchito-game-library/`
- **Threshold actual**: 60% statements/lines (baseline). **Meta: 90%.**

> ⚠️ La carpeta `coverage/monchito-game-library/` es compartida con la app. Ejecutar `npm run test:app:coverage` después pisa el informe de retro. Siempre lee el lcov inmediatamente después de `npm run test:retro:coverage`.

---

## Utilidades de test (`lib/retro/testing/`)

| Fichero                  | Export              | Uso típico                                                                                                           |
| ------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `retro-snackbar.mock.ts` | `mockRetroSnackbar` | `{ provide: RetroSnackbarService, useValue: mockRetroSnackbar }` — importar con `@retro/testing/retro-snackbar.mock` |

> Llama a `vi.clearAllMocks()` en `beforeEach` para reiniciar el estado entre tests.

---

## Cobertura actual

| Métrica    | Valor | Threshold | Meta |
| ---------- | ----- | --------- | ---- |
| Statements | ~65%  | 60% ✅    | 90%  |
| Branches   | ~68%  | —         | —    |
| Functions  | ~59%  | —         | —    |
| Lines      | ~63%  | 60% ✅    | 90%  |

---

## Cobertura por componente

| Componente          | Fichero spec                                                                          | Tests |
| ------------------- | ------------------------------------------------------------------------------------- | ----- |
| retro-button        | `retro-button/retro-button.component.spec.ts`                                         | —     |
| retro-icon-button   | `retro-icon-button/retro-icon-button.component.spec.ts`                               | —     |
| retro-input         | `retro-input/retro-input.component.spec.ts`                                           | —     |
| retro-select        | `retro-select/retro-select.component.spec.ts`                                         | —     |
| retro-search        | `retro-search/retro-search.component.spec.ts`                                         | —     |
| retro-datepicker    | `retro-datepicker/retro-datepicker.component.spec.ts`                                 | —     |
| retro-textarea      | `retro-textarea/retro-textarea.component.spec.ts`                                     | —     |
| retro-form-field    | `retro-form-field/retro-form-field.component.spec.ts`                                 | —     |
| retro-list          | `retro-list/retro-list.component.spec.ts`                                             | —     |
| retro-list-item     | `retro-list/components/retro-list-item/retro-list-item.component.spec.ts`             | —     |
| retro-snackbar      | `retro-snackbar/retro-snackbar.component.spec.ts`                                     | —     |
| retro-snackbar-host | `retro-snackbar/components/retro-snackbar-host/retro-snackbar-host.component.spec.ts` | —     |
| retro-dialog        | `retro-dialog/retro-dialog.component.spec.ts`                                         | —     |
| retro-tabs          | `retro-tabs/retro-tabs.component.spec.ts`                                             | —     |
| retro-skeleton      | `retro-skeleton/retro-skeleton.component.spec.ts`                                     | —     |
| retro-command-bar   | `retro-command-bar/retro-command-bar.component.spec.ts`                               | —     |
| retro-tooltip       | `retro-tooltip/directive/retro-tooltip.directive.spec.ts`                             | —     |

> Los conteos de tests por fichero se sincronizan con `/update-testing retro`.

**Total**: 38 ficheros de spec / 291 tests

---

## Ramas sin cobertura — análisis exhaustivo

> Esta sección se rellena progresivamente con `/improve-coverage retro`. Documenta únicamente gaps analizados y clasificados.

_(Pendiente de análisis inicial con `/improve-coverage retro`)_

---

## Resumen

| Categoría                     | Ficheros | Tests   |
| ----------------------------- | -------- | ------- |
| Librería retro (`lib/retro/`) | 38       | 291     |
| **Total**                     | **38**   | **291** |
