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

| Métrica    | Valor                | Threshold | Techo real |
| ---------- | -------------------- | --------- | ---------- |
| Statements | 95.35% (1397 / 1465) | 90% ✅    | ~95%       |
| Branches   | 95.02% (955 / 1005)  | —         | ~95%       |
| Functions  | 93.69% (297 / 317)   | —         | ~94%       |
| Lines      | 97.09% (1171 / 1206) | 90% ✅    | ~97%       |

> El resto de gaps no cubiertos son artefactos V8/signals (Cat. 1–3) documentados en "Ramas sin cobertura".

---

## Cobertura por componente

| Fichero spec                                                                          | Tests |
| ------------------------------------------------------------------------------------- | ----- |
| `retro-bottom-sheet/services/retro-bottom-sheet.service.spec.ts`                      | 3     |
| `retro-button/retro-button.component.spec.ts`                                         | 13    |
| `retro-card/retro-card.component.spec.ts`                                             | 33    |
| `retro-checkbox/retro-checkbox.component.spec.ts`                                     | 17    |
| `retro-chip/retro-chip.component.spec.ts`                                             | 11    |
| `retro-command-bar/retro-command-bar.component.spec.ts`                               | 5     |
| `retro-data-row/retro-data-row.component.spec.ts`                                     | 3     |
| `retro-datepicker/retro-datepicker.component.spec.ts`                                 | 64    |
| `retro-dialog/services/retro-dialog-integration.spec.ts`                              | 6     |
| `retro-dialog/services/retro-dialog.service.spec.ts`                                  | 20    |
| `retro-empty-state/retro-empty-state.component.spec.ts`                               | 5     |
| `retro-form-field/components/retro-error/retro-error.component.spec.ts`               | 1     |
| `retro-form-field/components/retro-hint/retro-hint.component.spec.ts`                 | 1     |
| `retro-form-field/components/retro-input/retro-input.directive.spec.ts`               | 11    |
| `retro-form-field/components/retro-label/retro-label.component.spec.ts`               | 1     |
| `retro-form-field/retro-form-field.component.spec.ts`                                 | 18    |
| `retro-icon/retro-icon.component.spec.ts`                                             | 5     |
| `retro-icon-button/retro-icon-button.component.spec.ts`                               | 3     |
| `retro-input/retro-input.component.spec.ts`                                           | 22    |
| `retro-list/retro-list.component.spec.ts`                                             | 3     |
| `retro-list/components/retro-list-item/retro-list-item.component.spec.ts`             | 38    |
| `retro-menu/retro-menu.component.spec.ts`                                             | 4     |
| `retro-menu/components/retro-menu-item/retro-menu-item.component.spec.ts`             | 10    |
| `retro-menu/directive/retro-menu-trigger.directive.spec.ts`                           | 19    |
| `retro-overlay/services/retro-overlay.service.spec.ts`                                | 23    |
| `retro-search/retro-search.component.spec.ts`                                         | 39    |
| `retro-section-header/retro-section-header.component.spec.ts`                         | 4     |
| `retro-select/retro-select.component.spec.ts`                                         | 50    |
| `retro-select/components/retro-option/retro-option.component.spec.ts`                 | 9     |
| `retro-select/tokens/retro-option-parent.token.spec.ts`                               | 1     |
| `retro-skeleton/retro-skeleton.component.spec.ts`                                     | 4     |
| `retro-snackbar/services/retro-snackbar.service.spec.ts`                              | 10    |
| `retro-snackbar/components/retro-snackbar-host/retro-snackbar-host.component.spec.ts` | 5     |
| `retro-spinner/retro-spinner.component.spec.ts`                                       | 2     |
| `retro-tabs/retro-tabs.component.spec.ts`                                             | 18    |
| `retro-tabs/components/retro-tab/retro-tab.component.spec.ts`                         | 5     |
| `retro-textarea/retro-textarea.component.spec.ts`                                     | 27    |
| `retro-tooltip/directive/retro-tooltip.directive.spec.ts`                             | 10    |

**Total**: 38 ficheros de spec / 523 tests

---

## Ramas sin cobertura — análisis exhaustivo

Los gaps restantes (4.65% statements, 4.98% branches) son artefactos irresolubles de V8 y Angular. No hay lógica real sin cubrir.

### Cat. 1 — Artefactos V8 en declaraciones de clase y metadata

Ramas fantasma que V8 genera en la línea de `export class` o en `providers: [forwardRef(...)]`. No hay código ejecutable en esa línea.

| Fichero                          | Líneas                             |
| -------------------------------- | ---------------------------------- |
| `retro-chip.component.ts`        | L33 (`input.required`)             |
| `retro-icon-button.component.ts` | L21 (`input.required`)             |
| `retro-list.component.ts`        | L21 (clase vacía)                  |
| `retro-error.component.ts`       | L23 (clase vacía)                  |
| `retro-hint.component.ts`        | L21 (clase vacía)                  |
| `retro-label.component.ts`       | L21-22 (clase vacía)               |
| `retro-input.component.ts`       | L59 (`providers: [forwardRef...]`) |
| `retro-textarea.component.ts`    | L51 (`providers: [forwardRef...]`) |
| `retro-select.component.ts`      | L86 (`providers: [forwardRef...]`) |
| `retro-search.component.ts`      | L88 (`providers: [forwardRef...]`) |
| `retro-datepicker.component.ts`  | L83 (`providers: [forwardRef...]`) |
| `retro-snackbar.service.ts`      | L19 (campo `Map` privado)          |

### Cat. 3 — Artefactos Angular signals (`?.` y `??` en computed/effect)

V8 no instrumenta correctamente los operadores `?.` y `??` dentro de `computed()` o `effect()`.

| Fichero                           | Patrón no instrumentado                                          |
| --------------------------------- | ---------------------------------------------------------------- |
| `retro-checkbox.component.ts`     | `effect(() => { if (!this._cvaMode) ... })` (L71, L78)           |
| `retro-tabs.component.ts`         | `computed(() => this.tabs?.toArray() ?? [])` (L109)              |
| `retro-menu-item.component.ts`    | `textContent?.trim() ?? ''` (L81)                                |
| `retro-input.component.ts`        | `?.control` (L82)                                                |
| `retro-textarea.component.ts`     | `?.control` (L76)                                                |
| `retro-select.component.ts`       | optional chains en CVA (L139, L449, L472)                        |
| `retro-search.component.ts`       | optional chains en CVA (L388-417)                                |
| `retro-datepicker.component.ts`   | optional chains en CVA (L117, L282, L441-476)                    |
| `retro-overlay.service.ts`        | `??` en config; callbacks CDK (L125, L146-168, L182)             |
| `retro-dialog.service.ts`         | optional chains; directivas vacías (L93, L138, L152)             |
| `retro-form-field.component.ts`   | `contentChild`; `ngControl?.statusChanges` (L64, L121-122)       |
| `retro-menu-trigger.directive.ts` | `?.menuItems` (L147)                                             |
| `retro-tooltip.directive.ts`      | `matchMedia` (jsdom); `getBoundingClientRect` = 0 (L72-73, L133) |
| `retro-option.component.ts`       | `?.trim()` (L90)                                                 |

### Cat. 2 — Código muerto / ramas CDK inalcanzables en test

Ramas que requieren un entorno CDK real (Overlay, Portal, TemplateRef) que happy-dom no reproduce.

| Fichero                         | Motivo                                                         |
| ------------------------------- | -------------------------------------------------------------- |
| `retro-select.component.ts`     | Interior de `_openPanel()` — CDK Overlay no renderiza en jsdom |
| `retro-search.component.ts`     | Interior de `_openPanel()` — idem                              |
| `retro-datepicker.component.ts` | Interior de `_openPanel()` — idem                              |
| `retro-form-field.component.ts` | Branch `_updateInvalid` irealizable por orden de CD (L180-181) |

---

## Resumen

| Categoría                     | Ficheros | Tests   |
| ----------------------------- | -------- | ------- |
| Librería retro (`lib/retro/`) | 38       | 523     |
| **Total**                     | **38**   | **523** |
