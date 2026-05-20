# Testing — Librería Retro

> Este documento cubre exclusivamente la librería de componentes retro (`lib/retro/`). Para la app Angular ver [`docs/TESTING.md`](./TESTING.md).

## Configuración

- **Framework**: Vitest 4.1.0 vía `@angular/build:unit-test`
- **Entorno DOM**: happy-dom 20.8.4
- **Ejecutar tests**: `npm run test:retro` (una vez) / `npm run test:retro -- --watch` (watch mode)
- **Cobertura**: `npm run test:retro:coverage` → informe HTML en `coverage/monchito-game-library/`
- **Threshold actual**: 90% statements/lines. ✅

> ⚠️ La carpeta `coverage/monchito-game-library/` es compartida con la app. Ejecutar `npm run test:app:coverage` después pisa el informe de retro. Siempre lee el lcov inmediatamente después de `npm run test:retro:coverage`.

---

## Utilidades de test (`lib/retro/testing/`)

| Fichero                  | Export              | Uso típico                                                                                                           |
| ------------------------ | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `retro-snackbar.mock.ts` | `mockRetroSnackbar` | `{ provide: RetroSnackbarService, useValue: mockRetroSnackbar }` — importar con `@retro/testing/retro-snackbar.mock` |

> Llama a `vi.clearAllMocks()` en `beforeEach` para reiniciar el estado entre tests.

---

## Cobertura actual

| Métrica    | Valor                | Threshold | Meta |
| ---------- | -------------------- | --------- | ---- |
| Statements | 92.15% (1350 / 1465) | 90% ✅    | 90%  |
| Branches   | 89.95% (904 / 1005)  | —         | —    |
| Functions  | 90.53% (287 / 317)   | —         | —    |
| Lines      | 94.44% (1139 / 1206) | 90% ✅    | 90%  |

---

## Cobertura por componente

| Fichero spec                                                                          | Tests |
| ------------------------------------------------------------------------------------- | ----- |
| `retro-bottom-sheet/services/retro-bottom-sheet.service.spec.ts`                      | 3     |
| `retro-button/retro-button.component.spec.ts`                                         | 13    |
| `retro-card/retro-card.component.spec.ts`                                             | 33    |
| `retro-checkbox/retro-checkbox.component.spec.ts`                                     | 17    |
| `retro-chip/retro-chip.component.spec.ts`                                             | 8     |
| `retro-command-bar/retro-command-bar.component.spec.ts`                               | 5     |
| `retro-data-row/retro-data-row.component.spec.ts`                                     | 3     |
| `retro-datepicker/retro-datepicker.component.spec.ts`                                 | 56    |
| `retro-dialog/services/retro-dialog-integration.spec.ts`                              | 6     |
| `retro-dialog/services/retro-dialog.service.spec.ts`                                  | 16    |
| `retro-empty-state/retro-empty-state.component.spec.ts`                               | 5     |
| `retro-form-field/components/retro-error/retro-error.component.spec.ts`               | 1     |
| `retro-form-field/components/retro-hint/retro-hint.component.spec.ts`                 | 1     |
| `retro-form-field/components/retro-input/retro-input.directive.spec.ts`               | 10    |
| `retro-form-field/components/retro-label/retro-label.component.spec.ts`               | 1     |
| `retro-form-field/retro-form-field.component.spec.ts`                                 | 16    |
| `retro-icon/retro-icon.component.spec.ts`                                             | 5     |
| `retro-icon-button/retro-icon-button.component.spec.ts`                               | 3     |
| `retro-input/retro-input.component.spec.ts`                                           | 21    |
| `retro-list/retro-list.component.spec.ts`                                             | 3     |
| `retro-list/components/retro-list-item/retro-list-item.component.spec.ts`             | 37    |
| `retro-menu/retro-menu.component.spec.ts`                                             | 4     |
| `retro-menu/components/retro-menu-item/retro-menu-item.component.spec.ts`             | 10    |
| `retro-menu/directive/retro-menu-trigger.directive.spec.ts`                           | 13    |
| `retro-overlay/services/retro-overlay.service.spec.ts`                                | 22    |
| `retro-search/retro-search.component.spec.ts`                                         | 36    |
| `retro-section-header/retro-section-header.component.spec.ts`                         | 4     |
| `retro-select/retro-select.component.spec.ts`                                         | 43    |
| `retro-select/components/retro-option/retro-option.component.spec.ts`                 | 3     |
| `retro-select/tokens/retro-option-parent.token.spec.ts`                               | 1     |
| `retro-skeleton/retro-skeleton.component.spec.ts`                                     | 4     |
| `retro-snackbar/services/retro-snackbar.service.spec.ts`                              | 8     |
| `retro-snackbar/components/retro-snackbar-host/retro-snackbar-host.component.spec.ts` | 5     |
| `retro-spinner/retro-spinner.component.spec.ts`                                       | 2     |
| `retro-tabs/retro-tabs.component.spec.ts`                                             | 16    |
| `retro-tabs/components/retro-tab/retro-tab.component.spec.ts`                         | 5     |
| `retro-textarea/retro-textarea.component.spec.ts`                                     | 22    |
| `retro-tooltip/directive/retro-tooltip.directive.spec.ts`                             | 4     |

**Total**: 38 ficheros de spec / 465 tests

---

## Ramas sin cobertura — análisis exhaustivo

> Esta sección se rellena progresivamente con `/improve-coverage retro`. Documenta únicamente gaps analizados y clasificados.

_(Pendiente de análisis inicial con `/improve-coverage retro`)_

---

## Resumen

| Categoría                     | Ficheros | Tests   |
| ----------------------------- | -------- | ------- |
| Librería retro (`lib/retro/`) | 38       | 465     |
| **Total**                     | **38**   | **465** |
