# Coverage exclusions catalog

Hand-curated, non-derivable exclusion data extracted from `docs/TESTING.md` and `docs/TESTING-RETRO.md`.
Do **not** add coverage percentages or per-file counts here — those belong in the source docs.

---

## Excluded artifact catalog

### App (`src/`) — Category 1: V8 artifacts on class declarations

V8 generates 2–4 phantom `BRDA` entries on the line of each `export class X`. No test can cover a branch that has no associated executable code.

**Pattern**: line containing `export class FooComponent implements OnInit { ... }` shows blocks with count always 0.

**Affected files**: all standalone components (approx. 40 files), each with 2–4 phantom branches. No individual file enumeration needed — any `export class` line in a component file may carry these artifacts.

---

### App (`src/`) — Category 2: Dead code / unreachable branches

| File                                                  | Line     | Expression                                                     | Unreachable branch             | Reason                                                                                                                                      |
| ----------------------------------------------------- | -------- | -------------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `game-form.component.ts`                              | 235      | `parts[0] ?? '50%'`                                            | `null` side of `??`            | `String.prototype.split()` always returns at least 1 element; `parts[0]` is never `null`/`undefined`                                        |
| `game-form.component.ts`                              | 202      | `typeof platform.labelKey`                                     | `false` branch                 | the object always has `labelKey` by construction                                                                                            |
| `game-form.component.ts`                              | 431, 434 | form validation guards                                         | impossible branches            | controls are initialised in the constructor; they are never `null`                                                                          |
| `_passwordMatchValidator` (register / reset-password) | —        | `if (!password \|\| !confirmPassword)`                         | `true` branch                  | controls always exist; the validator is only applied to the `FormGroup` that creates them                                                   |
| `pack-optimizer.util.ts`                              | 25       | `_runDP(needed, sorted, 1)[0] ?? null`                         | `null` side of `??`            | `_runDP` always returns at least one result for valid packs; the array is never empty                                                       |
| `pack-optimizer.util.ts`                              | 35       | `if (!s) continue`                                             | `true` branch                  | `exact` (which `!s` guards) would only be `null` if `_runDP` returned an empty array (see previous row)                                     |
| `pack-optimizer.util.ts`                              | 113      | `if (seen.has(key)) continue`                                  | `true` branch                  | the same pack combination cannot appear for two distinct values of `q` in the deterministic DP back-tracking                                |
| `hardware-loan-form.component.ts`                     | 127      | `raw.loanedAt ? raw.loanedAt.toLocaleDateString('sv-SE') : ''` | `false` branch (loanedAt null) | `loanedAt` is a `required` field; `onLoan()` has a `if (this.form.invalid) return` guard that prevents reaching this line with a null value |
| `game-loan-form.component.ts`                         | 112      | `raw.loanedAt ? raw.loanedAt.toLocaleDateString('sv-SE') : ''` | `false` branch (loanedAt null) | same reason as `hardware-loan-form`: required field with invalid form guard                                                                 |
| `sale-form.component.ts`                              | 182      | `raw.soldAt ? raw.soldAt.toLocaleDateString('sv-SE') : null`   | `false` branch (soldAt null)   | `onMarkAsSold()` has a `if (!this.canMarkAsSold) return` guard and `canMarkAsSold` requires `soldAt !== null`                               |

> **Note on `_passwordMatchValidator`**: although the `true` branch of the guard is logically unreachable in production, it has been covered in tests by invoking the validator directly with a synthetic `FormGroup` missing one of the controls.

---

### App (`src/`) — Category 3: Angular compiled signal artifacts

Inside `computed()` and `effect()`, Angular compiles functions through its own scheduler. Optional chaining (`?.`) and nullish coalescing (`??`) inside those functions generate `BRDA` entries that V8 never marks as covered.

| File                                    | Lines / patterns                                                                                    |
| --------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `game-form.component.ts`                | line 289: `this.selectedGame()?.rawg_id !== this._initialSnapshot?.rawgId` inside `computed()`      |
| `create-update-console.component.ts`    | lines 69, 75, 81: `this._storeInput()?.toString().toLowerCase() ?? ''` inside `filteredStores` etc. |
| `create-update-controller.component.ts` | lines 76, 82, 88: same pattern as console                                                           |

**Affected broadly**: any component with `computed()` containing `?.` or `??`.

---

### App (`src/`) — Category 4: Real logic with improvable coverage

> After the latest iterations all real branches worth covering are closed. The remaining gaps in `order-detail.component.ts` are Cat. 2 branches (`o ? {...} : o` with `o` non-null by contract of `signal.update`) and Ivy artefacts (`@ViewChild` setter at line 65). This section is kept empty to record future detections.

> After the work/copy refactor (May 2026), specific tests were added for: `mapUserWork` with null/undefined fields, `selectCopyByUuid` and `addAnotherCopy` in `game-detail`, the "Add another copy" prefills in `game-form` (status / rating / favourite / opposite format), and the error paths of `addGameForUser` with `targetWorkId` (broken lookup, failed UPDATE work). The branches still appearing in `lcov` for those files (`supabase.repository.ts:99,153`, `game-form.component.ts:582`, `game-detail.component.ts:188-189`) are Cat. 3 artefacts (callback of `Image.onload` with `crossOrigin` and comparators inside `.sort()` that V8 does not instrument consistently).

---

### Retro lib (`lib/retro/`) — Cat. 1: V8 artifacts in class declarations and metadata

Ghost branches that V8 generates on the `export class` line or in `providers: [forwardRef(...)]`. There is no executable code on that line.

| File                             | Lines                              |
| -------------------------------- | ---------------------------------- |
| `retro-chip.component.ts`        | L33 (`input.required`)             |
| `retro-icon-button.component.ts` | L21 (`input.required`)             |
| `retro-list.component.ts`        | L21 (empty class)                  |
| `retro-error.component.ts`       | L23 (empty class)                  |
| `retro-hint.component.ts`        | L21 (empty class)                  |
| `retro-label.component.ts`       | L21-22 (empty class)               |
| `retro-input.component.ts`       | L59 (`providers: [forwardRef...]`) |
| `retro-textarea.component.ts`    | L51 (`providers: [forwardRef...]`) |
| `retro-select.component.ts`      | L86 (`providers: [forwardRef...]`) |
| `retro-search.component.ts`      | L88 (`providers: [forwardRef...]`) |
| `retro-datepicker.component.ts`  | L83 (`providers: [forwardRef...]`) |
| `retro-snackbar.service.ts`      | L19 (private `Map` field)          |

---

### Retro lib (`lib/retro/`) — Cat. 3: Angular signals artifacts (`?.` and `??` in computed/effect)

V8 does not correctly instrument `?.` and `??` operators inside `computed()` or `effect()`.

| File                              | Non-instrumented pattern                                         |
| --------------------------------- | ---------------------------------------------------------------- |
| `retro-checkbox.component.ts`     | `effect(() => { if (!this._cvaMode) ... })` (L71, L78)           |
| `retro-tabs.component.ts`         | `computed(() => this.tabs?.toArray() ?? [])` (L109)              |
| `retro-menu-item.component.ts`    | `textContent?.trim() ?? ''` (L81)                                |
| `retro-input.component.ts`        | `?.control` (L82)                                                |
| `retro-textarea.component.ts`     | `?.control` (L76)                                                |
| `retro-select.component.ts`       | optional chains in CVA (L139, L449, L472)                        |
| `retro-search.component.ts`       | optional chains in CVA (L388-417)                                |
| `retro-datepicker.component.ts`   | optional chains in CVA (L117, L282, L441-476)                    |
| `retro-overlay.service.ts`        | `??` in config; CDK callbacks (L125, L146-168, L182)             |
| `retro-dialog.service.ts`         | optional chains; empty directives (L93, L138, L152)              |
| `retro-form-field.component.ts`   | `contentChild`; `ngControl?.statusChanges` (L64, L121-122)       |
| `retro-menu-trigger.directive.ts` | `?.menuItems` (L147)                                             |
| `retro-tooltip.directive.ts`      | `matchMedia` (jsdom); `getBoundingClientRect` = 0 (L72-73, L133) |
| `retro-option.component.ts`       | `?.trim()` (L90)                                                 |

---

### Retro lib (`lib/retro/`) — Cat. 2: Dead code / CDK branches unreachable in tests

Branches that require a real CDK environment (Overlay, Portal, TemplateRef) that happy-dom does not reproduce.

| File                            | Reason                                                            |
| ------------------------------- | ----------------------------------------------------------------- |
| `retro-select.component.ts`     | Inside `_openPanel()` — CDK Overlay does not render in jsdom      |
| `retro-search.component.ts`     | Inside `_openPanel()` — same                                      |
| `retro-datepicker.component.ts` | Inside `_openPanel()` — same                                      |
| `retro-form-field.component.ts` | `_updateInvalid` branch unreachable due to CD ordering (L180-181) |

---

## Deliberately untested logic

Registry of methods and functions that are intentionally not tested, with the rationale for each.

| Component / method                                                                                                                         | Reason                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pwa-update.service.ts` — callback `() => document.location.reload()` (line 72) and callback of `setTimeout(_applyUpdate, 400)` (line 102) | The test stubs `activateUpdate` with a `Promise` that never resolves, so the `.then()` never fires `reload()`; and by not using fake timers in the overlay test, the `setTimeout` is cancelled when the test ends. A real reload would close the happy-dom environment.                                                                                                                                                        |
| Management async flows (`_loadStores`, `onSaved`, `onDeleteStore`...)                                                                      | Require microtask control and async use-case spies; signal coverage and pure logic already covered.                                                                                                                                                                                                                                                                                                                            |
| `supabase.config.ts` — `lock` function (line 17)                                                                                           | The function `(name, acquireTimeout, fn) => fn()` is only invoked internally by Supabase during auth operations. It cannot be triggered without mocks that the Angular bundler does not allow re-applying after `vi.resetModules()`.                                                                                                                                                                                           |
| `supabase-console.repository.ts` / `supabase-controller.repository.ts` — second `await` inside `createLoan`                                | After creating the loan in `hardware_loans`, the main table is updated with `active_loan_*`. This second call does not throw even if it fails (no `if (error)` guard), so there is no testable error branch. The `controllerBuilder.update` and `consoleBuilder.update` assertions in `returnLoan` and `createLoan` verify invocation, but V8 marks the `Promise.all` rejection branch as uncovered because there is no throw. |
| `sale.component.ts` — line 33 (`providers: [marketRepositoryProvider, marketUseCasesProvider]`)                                            | The providers array expression is in the `@Component` decorator. Angular Ivy evaluates it lazily in the component factory; since the test replaces providers with `TestBed.overrideComponent`, the original expression never executes. The providers connect to Supabase and cannot be instantiated in unit tests.                                                                                                             |
| `app.component.ts` — `addEventListener('change', ...)` callback in `_mobileQuery`                                                          | The listener is registered in `ngOnInit` but only fires when the viewport is resized. In happy-dom, `window.matchMedia` returns a mock that does not support dispatching `MediaQueryListEvent`. The function is a simple `this._isMobile.set(e.matches)` with no logic of its own.                                                                                                                                             |
| `app.component.ts` — `@ViewChildren(MatMenuTrigger) menuTriggers` (line 107)                                                               | Property decorated with `@ViewChildren`. Angular generates an internal setter that is called during view initialisation; with `template: ''` in tests there are no view children to satisfy. V8 records the setter as not executed. Angular compiler artefact.                                                                                                                                                                 |
| `catalog-item-card.component.ts` — `CatalogItemCardComponent_click_HostBindingHandler`                                                     | Function generated by the Angular compiler for the host binding `'(click)': 'cardClick.emit()'`. Tests dispatch a native click on `fixture.nativeElement` and the spy activates, but V8 does not correctly instrument host binding functions generated by Ivy. Compiler artefact.                                                                                                                                              |
| `settings.component.ts` — anonymous function `anonymous_15`                                                                                | Anonymous callback of an RxJS subscription in the settings component. The function is one of the subscribe callbacks that only executes under specific conditions not reproduced in the current tests.                                                                                                                                                                                                                         |
| `game-detail.component.ts` — callback `probe.onload` (lines 178-179) and `if (color) ...`                                                  | The constructor effect creates a `new Image()` to sample the dominant colour of the cover. In tests there is no real canvas or image to fire `onload`; happy-dom assertions do not allow controlling the load cycle. The `if (color)` branch (truthy color / null) is also not covered without mocking the global `Image` constructor, which would add more fragility to the spec than real value.                             |
