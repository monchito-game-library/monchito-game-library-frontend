# Testing — Monchito Game Library

## Configuración

- **Framework**: Vitest 4.1.0 vía `@angular/build:unit-test`
- **Entorno DOM**: happy-dom 20.8.4
- **Ejecutar tests**: `npm test` (una vez) / `npm test -- --watch` (watch mode)
- **Cobertura**: `npm run test:coverage` → informe HTML en `coverage/monchito-game-library/`

---

## Utilidades de test (`src/testing/`)

Mocks centralizados reutilizables en `TestBed.providers`:

| Fichero | Export | Uso típico |
|---|---|---|
| `router.mock.ts` | `mockRouter` | `{ provide: Router, useValue: mockRouter }` |
| `dialog.mock.ts` | `mockDialog` | `{ provide: MatDialog, useValue: mockDialog }` |
| `snack-bar.mock.ts` | `mockSnackBar` | `{ provide: MatSnackBar, useValue: mockSnackBar }` |
| `transloco.mock.ts` | `mockTransloco` | `{ provide: TranslocoService, useValue: mockTransloco }` |
| `user-context.mock.ts` | `mockUserContext` | `{ provide: UserContextService, useValue: mockUserContext }` |
| `activated-route.mock.ts` | `mockActivatedRoute` | `{ provide: ActivatedRoute, useValue: mockActivatedRoute }` |
| `location.mock.ts` | `mockLocation` | `{ provide: Location, useValue: mockLocation }` |

> Llama a `vi.clearAllMocks()` en `beforeEach` para reiniciar el estado entre tests. Si un mock devuelve un valor concreto por defecto (p.ej. `mockActivatedRoute.snapshot.paramMap.get` devuelve `null`), sobreescríbelo con `.mockReturnValue(...)` después del clear.

---

## Cobertura por capa

### Capa de datos — Configuración (`src/app/data/config`)

| Fichero | Tests | Estado |
|---|---|---|
| `supabase.config.spec.ts` | 3 | ✅ Cubierto |

**Qué se cubre**: creación del cliente Supabase (singleton), devolución del mismo objeto en llamadas sucesivas, resolución del token DI `SUPABASE_CLIENT` via `TestBed`.

**Patrón de test**: importaciones estáticas sin mocks — el entorno usa credenciales reales (`environment.ts`), por lo que `createClient` no lanza error y el comportamiento del singleton es testable directamente.

---

### Capa de datos — Mappers (`src/app/data/mappers`)

| Fichero | Tests | Estado |
|---|---|---|
| `order/order.mapper.spec.ts` | 39 | ✅ Cubierto |
| `rawg/rawg.mapper.spec.ts` | 19 | ✅ Cubierto |
| `supabase/console.mapper.spec.ts` | 19 | ✅ Cubierto |
| `supabase/controller.mapper.spec.ts` | 15 | ✅ Cubierto |
| `supabase/game.mapper.spec.ts` | 45 | ✅ Cubierto |
| `supabase/hardware-brand.mapper.spec.ts` | 3 | ✅ Cubierto |
| `supabase/hardware-console-specs.mapper.spec.ts` | 10 | ✅ Cubierto |
| `supabase/hardware-edition.mapper.spec.ts` | 3 | ✅ Cubierto |
| `supabase/hardware-model.mapper.spec.ts` | 7 | ✅ Cubierto |
| `supabase/protector.mapper.spec.ts` | 7 | ✅ Cubierto |
| `supabase/store.mapper.spec.ts` | 7 | ✅ Cubierto |
| `supabase/user-preferences.mapper.spec.ts` | 8 | ✅ Cubierto |
| `supabase/wishlist.mapper.spec.ts` | 8 | ✅ Cubierto |

**Qué se cubre**: transformaciones de DTO → modelo de dominio, valores por defecto, prioridad de campos opcionales, fallbacks para null/undefined. El mapper de orders cubre mapeo de líneas, miembros, alocaciones y fechas opcionales. Los mappers de hardware cubren specs de consolas, ediciones, modelos y marcas.

---

### Capa de dominio — Use Cases (`src/app/domain/use-cases`)

| Fichero | Tests | Estado |
|---|---|---|
| `audit-log/audit-log.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `auth/auth.use-cases.spec.ts` | 21 | ✅ Cubierto |
| `catalog/catalog.use-cases.spec.ts` | 10 | ✅ Cubierto |
| `console/console.use-cases.spec.ts` | 10 | ✅ Cubierto |
| `controller/controller.use-cases.spec.ts` | 10 | ✅ Cubierto |
| `game/game.use-cases.spec.ts` | 14 | ✅ Cubierto |
| `hardware-brand/hardware-brand.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `hardware-console-specs/hardware-console-specs.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `hardware-edition/hardware-edition.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `hardware-model/hardware-model.use-cases.spec.ts` | 6 | ✅ Cubierto |
| `market/market.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `orders/orders.use-cases.spec.ts` | 28 | ✅ Cubierto |
| `protector/protector.use-cases.spec.ts` | 6 | ✅ Cubierto |
| `store/store.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `user-admin/user-admin.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `user-preferences/user-preferences.use-cases.spec.ts` | 13 | ✅ Cubierto |
| `wishlist/wishlist.use-cases.spec.ts` | 5 | ✅ Cubierto |

**Qué se cubre**: delegación a repositorios, parámetros correctos, valores por defecto, validación de archivos (tamaño/MIME), lógica de borrado condicional, paginación de screenshots. Orders cubre `getById`, `getAll`, `create`, `update`, `delete`, `addMember`, `setMemberReady`, `subscribeToOrderMembers`, `addLine`, `updateLine`, `deleteLine`, `setLinePackAndQty`, `getProducts`. Console y controller cubren además `updateSaleStatus`, `createLoan` y `returnLoan`. Hardware use cases cubren CRUD de marcas, modelos, ediciones y specs de consola.

**Patrón de test**: `TestBed.configureTestingModule` + token de repositorio mockeado con `vi.fn()`.

---

### Capa de datos — Repositorios (`src/app/data/repositories`)

| Fichero | Tests | Estado |
|---|---|---|
| `rawg.repository.spec.ts` | 20 | ✅ Cubierto |
| `supabase.repository.spec.ts` | 43 | ✅ Cubierto |
| `supabase-auth.repository.spec.ts` | 27 | ✅ Cubierto |
| `supabase-audit-log.repository.spec.ts` | 8 | ✅ Cubierto |
| `supabase-console.repository.spec.ts` | 17 | ✅ Cubierto |
| `supabase-controller.repository.spec.ts` | 17 | ✅ Cubierto |
| `supabase-hardware-brand.repository.spec.ts` | 10 | ✅ Cubierto |
| `supabase-hardware-console-specs.repository.spec.ts` | 6 | ✅ Cubierto |
| `supabase-hardware-edition.repository.spec.ts` | 10 | ✅ Cubierto |
| `supabase-hardware-model.repository.spec.ts` | 12 | ✅ Cubierto |
| `supabase-market.repository.spec.ts` | 8 | ✅ Cubierto |
| `supabase-preferences.repository.spec.ts` | 13 | ✅ Cubierto |
| `supabase-protector.repository.spec.ts` | 16 | ✅ Cubierto |
| `supabase-store.repository.spec.ts` | 9 | ✅ Cubierto |
| `supabase-user-admin.repository.spec.ts` | 5 | ✅ Cubierto |
| `supabase-wishlist.repository.spec.ts` | 14 | ✅ Cubierto |
| `supabase-order.repository.spec.ts` | — | ⏳ Pendiente |

**Qué se cubre**: llamadas correctas a Supabase (`.from()`, `.select()`, `.eq()`, `.insert()`, `.update()`, `.delete()`, `.upsert()`, `.rpc()`), paginación, reuso de entradas de catálogo existentes, manejo de errores, subida de ficheros a Storage. En `rawg.repository.spec.ts` también se cubre la rama `if (this._apiKey)` cuando no hay API key configurada. Console y controller cubren además `updateSaleStatus` (payload y manejo de error), `createLoan` (insert a `hardware_loans` + update en tabla principal, rama de error) y `returnLoan` (Promise.all con `returned_at` y limpieza de campos `active_loan_*`). Los repositorios de hardware (brand, edition, model, console-specs) cubren el CRUD básico con builder fluido.

**Patrón de test**: `SUPABASE_CLIENT` `InjectionToken` provisto en `TestBed` con `useValue: mockSupabase` (objeto compartido de `supabase-mock.ts`). El cliente mock se inyecta directamente sin `vi.mock`. Builder fluido y thenable (`makeBuilder`). Para RAWG se usa `vi.spyOn(globalThis, 'fetch')`. Para cubrir ramas de campos privados se usa `(repo as any)._field = value`.

---

### Capa de presentación — Guards (`src/app/presentation/guards`)

| Fichero | Tests | Estado |
|---|---|---|
| `admin/admin.guard.spec.ts` | 4 | ✅ Cubierto |
| `desktop-only/desktop-only.guard.spec.ts` | 4 | ✅ Cubierto |
| `user/user.guard.spec.ts` | 4 | ✅ Cubierto |
| `public/public.guard.spec.ts` | 4 | ✅ Cubierto |

**Qué se cubre**: retorno de `true`/`UrlTree` según estado de autenticación y rol de administrador. `desktop-only.guard` cubre acceso permitido en width ≥ 768px y redirección a `/` en width < 768px. `canActivatePublic` cubre la redirección a `/collection` cuando el usuario ya está autenticado (loading=false y loading=true→false).

---

### Capa de presentación — Servicios (`src/app/presentation/services`)

| Fichero | Tests | Estado |
|---|---|---|
| `auth-state/auth-state.service.spec.ts` | 19 | ✅ Cubierto |
| `pwa-update/pwa-update.service.spec.ts` | 13 | ✅ Cubierto |
| `rawg-search-state/rawg-search-state.service.spec.ts` | 6 | ✅ Cubierto |
| `theme/theme.service.spec.ts` | 8 | ✅ Cubierto |
| `user-context/user-context.service.spec.ts` | 13 | ✅ Cubierto |
| `user-preferences-init/user-preferences-init.service.spec.ts` | 17 | ✅ Cubierto |
| `user-preferences/user-preferences.service.spec.ts` | 11 | ✅ Cubierto |

**Qué se cubre**:
- `ThemeService`: señal `isDarkMode`, métodos `setDarkTheme`/`setLightTheme`/`initTheme`.
- `AuthStateService`: estado inicial, resolución asíncrona de sesión, `onAuthStateChange` y navegación al logout.
- `UserContextService`: delegación a `AuthStateService`, URL de fallback de avatar (ui-avatars.com).
- `UserPreferencesService`: valores iniciales de todos los signals, computed `isAdmin`, mutabilidad con `set()`.
- `UserPreferencesInitService`: inicialización de preferencias desde Supabase, valores por defecto cuando no existe registro.
- `RawgSearchStateService`: valores iniciales de `rawgSearchResults`, `rawgSearchLoading` y `rawgSearchQuery`.
- `PwaUpdateService`: `checkForUpdate` en init y visibilitychange, detección de `VERSION_READY`, overlay en rutas seguras, diferimiento en rutas de formulario hasta la siguiente navegación segura.

---

### Capa de presentación — Clases abstractas (`src/app/presentation/abstract`)

| Fichero | Tests | Estado |
|---|---|---|
| `auth-base/auth-base.component.spec.ts` | 15 | ✅ Cubierto |
| `crop-interaction-base/crop-interaction.base.spec.ts` | 33 | ✅ Cubierto |
| `hardware-detail-base/hardware-detail-base.component.spec.ts` | 45 | ✅ Cubierto |
| `hardware-form-base/hardware-form-base.component.spec.ts` | 34 | ✅ Cubierto |
| `hardware-list-base/hardware-list-base.component.spec.ts` | 38 | ✅ Cubierto |

**Qué se cubre**:
- `CropInteractionBase`: valores iniciales de signals, `onImageLoad` (cálculo de overflow según aspect ratio), drag con pointer events (inicio, movimiento, clamping, fin), zoom con rueda del ratón (min/max), touch de 1 dedo (pan) y 2 dedos (pinch-to-zoom), `onTouchEnd` con transición de 2 a 1 dedo.
- `HardwareDetailBase`: carga de ítem, estados de loading/error, acciones de préstamo/devolución/venta, signals derivados.
- `HardwareFormBase`: inicialización de formulario en modo create/edit, validaciones, submit, cancelación.
- `HardwareListBase`: carga de lista, filtros, selección, paginación.
- `AuthBase`: lógica compartida de formularios de autenticación, manejo de errores.

**Patrón de test**: subclase concreta (`TestXxxComponent`) que expone campos privados necesarios; helpers auxiliares (`makePointerEvent`, `makeTouchEvent`, `makeImgEvent`) para simular eventos del navegador.

---

### Capa de presentación — Componentes (`src/app/presentation`)

#### Componentes compartidos

| Fichero | Tests | Estado |
|---|---|---|
| `components/ad-hoc/badge-chip/badge-chip.component.spec.ts` | 7 | ✅ Cubierto |
| `components/ad-hoc/skeleton/skeleton.component.spec.ts` | 4 | ✅ Cubierto |
| `components/ad-hoc/toggle-switch/toggle-switch.component.spec.ts` | 21 | ✅ Cubierto |
| `components/catalog-search-panel/catalog-search-panel.component.spec.ts` | 10 | ✅ Cubierto |
| `components/confirm-dialog/confirm-dialog.component.spec.ts` | 3 | ✅ Cubierto |

#### Auth (`pages/auth`)

| Fichero | Tests | Estado |
|---|---|---|
| `pages/auth/auth.component.spec.ts` | 1 | ✅ Cubierto |
| `pages/auth/pages/forgot-password/forgot-password.component.spec.ts` | 12 | ✅ Cubierto |
| `pages/auth/pages/login/login.component.spec.ts` | 16 | ✅ Cubierto |
| `pages/auth/pages/register/register.component.spec.ts` | 19 | ✅ Cubierto |
| `pages/auth/pages/reset-password/reset-password.component.spec.ts` | 20 | ✅ Cubierto |

#### Colección (`pages/collection`)

| Fichero | Tests | Estado |
|---|---|---|
| `pages/collection/collection.component.spec.ts` | 1 | ✅ Cubierto |
| `pages/collection/components/hardware-detail-shell/hardware-detail-shell.component.spec.ts` | 57 | ✅ Cubierto |
| `pages/collection/components/hardware-form-shell/hardware-form-shell.component.spec.ts` | 16 | ✅ Cubierto |
| `pages/collection/components/hardware-list-shell/hardware-list-shell.component.spec.ts` | 25 | ✅ Cubierto |
| `pages/collection/components/hardware-loan-form/hardware-loan-form.component.spec.ts` | 20 | ✅ Cubierto |
| `pages/collection/components/list-page-header/list-page-header.component.spec.ts` | 5 | ✅ Cubierto |
| `pages/collection/components/sale-form/sale-form.component.spec.ts` | 29 | ✅ Cubierto |
| `pages/collection/pages/collection-overview/collection-overview.component.spec.ts` | 27 | ✅ Cubierto |
| `pages/collection/pages/consoles/consoles.component.spec.ts` | 3 | ✅ Cubierto |
| `pages/collection/pages/consoles/pages/console-detail/console-detail.component.spec.ts` | 15 | ✅ Cubierto |
| `pages/collection/pages/consoles/pages/create-update-console/create-update-console.component.spec.ts` | 23 | ✅ Cubierto |
| `pages/collection/pages/controllers/controllers.component.spec.ts` | 3 | ✅ Cubierto |
| `pages/collection/pages/controllers/pages/controller-detail/controller-detail.component.spec.ts` | 12 | ✅ Cubierto |
| `pages/collection/pages/controllers/pages/create-update-controller/create-update-controller.component.spec.ts` | 25 | ✅ Cubierto |
| `pages/collection/pages/games/components/game-card/game-card.component.spec.ts` | 40 | ✅ Cubierto |
| `pages/collection/pages/games/components/game-list-filters-sheet/game-list-filters-sheet.component.spec.ts` | 6 | ✅ Cubierto |
| `pages/collection/pages/games/games.component.spec.ts` | 78 | ✅ Cubierto |
| `pages/collection/pages/games/pages/create-update-game/components/game-cover-position-dialog/game-cover-position-dialog.component.spec.ts` | 17 | ✅ Cubierto |
| `pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.spec.ts` | 86 | ✅ Cubierto |
| `pages/collection/pages/games/pages/create-update-game/create-and-update-game.component.spec.ts` | 2 | ✅ Cubierto |
| `pages/collection/pages/games/pages/game-detail/components/game-loan-form/game-loan-form.component.spec.ts` | 22 | ✅ Cubierto |
| `pages/collection/pages/games/pages/game-detail/game-detail.component.spec.ts` | 56 | ✅ Cubierto |

#### Management (`pages/management`)

| Fichero | Tests | Estado |
|---|---|---|
| `pages/management/management.component.spec.ts` | 3 | ✅ Cubierto |
| `pages/management/components/catalog-item-card/catalog-item-card.component.spec.ts` | 13 | ✅ Cubierto |
| `pages/management/pages/audit-log/audit-log-management.component.spec.ts` | 14 | ✅ Cubierto |
| `pages/management/pages/hardware/hardware-management.component.spec.ts` | 2 | ✅ Cubierto |
| `pages/management/pages/hardware/components/hardware-brand-edit-panel/hardware-brand-edit-panel.component.spec.ts` | 7 | ✅ Cubierto |
| `pages/management/pages/hardware/components/hardware-edition-edit-panel/hardware-edition-edit-panel.component.spec.ts` | 7 | ✅ Cubierto |
| `pages/management/pages/hardware/components/hardware-model-edit-panel/hardware-model-edit-panel.component.spec.ts` | 11 | ✅ Cubierto |
| `pages/management/pages/hardware/pages/brands/hardware-brands-management.component.spec.ts` | 16 | ✅ Cubierto |
| `pages/management/pages/hardware/pages/editions/hardware-editions-management.component.spec.ts` | 32 | ✅ Cubierto |
| `pages/management/pages/hardware/pages/models/hardware-models-management.component.spec.ts` | 34 | ✅ Cubierto |
| `pages/management/pages/protectors/components/protector-edit-panel/protector-edit-panel.component.spec.ts` | 19 | ✅ Cubierto |
| `pages/management/pages/protectors/protectors-management.component.spec.ts` | 22 | ✅ Cubierto |
| `pages/management/pages/stores/components/store-edit-panel/store-edit-panel.component.spec.ts` | 7 | ✅ Cubierto |
| `pages/management/pages/stores/stores-management.component.spec.ts` | 19 | ✅ Cubierto |
| `pages/management/pages/users/users-management.component.spec.ts` | 16 | ✅ Cubierto |

#### Pedidos (`pages/orders`)

| Fichero | Tests | Estado |
|---|---|---|
| `pages/orders/orders.component.spec.ts` | 2 | ✅ Cubierto |
| `pages/orders/components/order-summary-card/order-summary-card.component.spec.ts` | 3 | ✅ Cubierto |
| `pages/orders/pages/order-create/order-create.component.spec.ts` | 13 | ✅ Cubierto |
| `pages/orders/pages/order-detail/order-detail.component.spec.ts` | 82 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/add-edit-line-dialog/add-edit-line-dialog.component.spec.ts` | 24 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/order-cost-summary/order-cost-summary.component.spec.ts` | 32 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/order-info-section/order-info-section.component.spec.ts` | 25 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/order-placing/order-placing.component.spec.ts` | 11 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/order-product-list/order-product-list.component.spec.ts` | 14 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/order-stepper/order-stepper.component.spec.ts` | 26 | ✅ Cubierto |
| `pages/orders/pages/order-detail/components/ready-dialog/ready-dialog.component.spec.ts` | 12 | ✅ Cubierto |
| `pages/orders/pages/order-invite/order-invite.component.spec.ts` | 26 | ✅ Cubierto |
| `pages/orders/pages/orders-list/orders-list.component.spec.ts` | 16 | ✅ Cubierto |

#### Venta, ajustes y wishlist

| Fichero | Tests | Estado |
|---|---|---|
| `pages/sale/sale.component.spec.ts` | 39 | ✅ Cubierto |
| `pages/settings/settings.component.spec.ts` | 48 | ✅ Cubierto |
| `pages/settings/components/avatar-crop-dialog/avatar-crop-dialog.component.spec.ts` | 7 | ✅ Cubierto |
| `pages/wishlist/wishlist.component.spec.ts` | 45 | ✅ Cubierto |
| `pages/wishlist/components/wishlist-card/wishlist-card.component.spec.ts` | 12 | ✅ Cubierto |
| `pages/wishlist/components/wishlist-item-dialog/wishlist-item-dialog.component.spec.ts` | 17 | ✅ Cubierto |
| `pages/wishlist/pages/wishlist-detail/wishlist-detail.component.spec.ts` | 23 | ✅ Cubierto |

**Qué se cubre** (componentes):
- `ToggleSwitchComponent`: lógica CVA (`writeValue`, `registerOnChange`, `setDisabledState`), `onToggle`, output `changed`, `getIcon`.
- `BadgeChipComponent` / `SkeletonComponent`: inputs y valores por defecto; `BadgeChipComponent` cubre además el binding de la variable CSS `--chip-bg` vía `bgColor`.
- `CatalogSearchPanelComponent`: valores iniciales, `onSearchInput`, `onSelectGame`.
- `ConfirmDialogComponent`: existencia y datos inyectados.
- `LoginComponent` / `RegisterComponent` / `ForgotPasswordComponent` / `ResetPasswordComponent`: validaciones de formulario, estados de `loading`, emisión de errores, integración con use cases. Para `RegisterComponent` y `ResetPasswordComponent` se cubren además las ramas early-return del validador privado `_passwordMatchValidator` invocándolo directamente vía `(component as any)._passwordMatchValidator(group)` con grupos sintéticos que carecen de uno de los controles.
- `CollectionComponent`: existencia.
- `HardwareDetailShell` / `HardwareFormShell` / `HardwareListShell`: shells que delegan en las clases abstractas; cubren los flujos completos a través de implementaciones concretas de consola y mando.
- `HardwareLoanFormComponent` / `SaleFormComponent`: formularios de préstamo y venta con validaciones.
- `ListPageHeaderComponent`: inputs y renderizado básico.
- `CollectionOverviewComponent`: accesos a la colección (juegos/consolas/mandos), contadores.
- `ConsolesComponent` / `ControllersComponent`: carga de lista, acciones de navegación.
- `ConsoleDetailComponent` / `ControllerDetailComponent`: carga en paralelo, `goBack`, `editItem`, `deleteItem`, estado de venta/préstamo; métodos protegidos `_getItem`, `_updateSaleStatus`, `_deleteItem`.
- `CreateUpdateConsoleComponent` / `CreateUpdateControllerComponent`: modos create/edit, `onCancel`, existencia; señales `filteredStores`, `filteredBrands`, `filteredModels` (incluyendo filtrado por input).
- `GameCardComponent`: señales computadas (`ratingStars`, `platinumIcon`, `isDigital`, `defaultImage`, `coverObjectPosition`, `coverTransform`, `platformColor`, `dominantColor`), `onFlip`; `onImageLoaded` (probe Image con `crossOrigin anonymous`, actualización de `dominantColor`, rama null cuando canvas falla, fallback a `img.src`).
- `GameListFiltersSheetComponent`: existencia, `consoles`/`gameStatuses`, `close()`, `onClearAll()`.
- `GamesComponent` (game-list): señales `filteredGames` (búsqueda, plataforma, store, estado, formato, favoritos, orden), `gameRows`, `ownedCount`, `platinumCount`, `totalPrice`, `activeFilterCount`, `formatFilterIcon`, `clearAllFilters`, `onSearchInput`; `_columnCountFromWidth` (todos los tramos de breakpoint incluyendo > 1600 px).
- `GameCoverPositionDialogComponent`: parseo de `initialPosition` (sin posición, 3 partes, 2 partes, 1 parte), clamping de escala (max 4 / min 1), `onConfirm()`, `onCancel()`.
- `GameFormComponent`: valores iniciales, `coverImages`, `openSearchMode`/`closeSearchMode`, `selectGameFromSearch`, `clearSelectedGame`, `filteredStores`, modo edición con/sin `rawgId`, efecto de re-sincronización de store, `onCancel`, `hasChanges`.
- `GameLoanFormComponent`: `isLoaned`, `ngOnInit` (parche de fecha), `onCancel`, `onLoan` (validación, `createLoan`, señal `saving`, emisión de `saved`, snackbar éxito/error), `onReturn` (guard de `activeLoanId`, `returnLoan`, emisión y snackbar).
- `GameDetailComponent`: `ngOnInit` (carga en paralelo, loading, redirección si null, error con snackbar), `goBack`, `editGame`, `deleteGame`; señales `coverUrl`, `gameStatus`, `storeName`, `formatKey`, `conditionKey`, `ratingStars`, `hasHalfStar`; `showSaleForm`/`showLoanForm` (toggle y desactivación cruzada), `onSaleFormClosed`, `onLoanFormClosed`; `onMarkForSale`, `onCancelSale`, `onSold` (incluyendo rama de error y `soldPriceFinal` null).
- `ManagementComponent` / `AuditLogManagementComponent` / `HardwareManagementComponent`: existencia, `getActionIcon`, `getActionLabel`.
- `HardwareBrandEditPanel` / `HardwareEditionEditPanel` / `HardwareModelEditPanel` / `ProtectorEditPanel` / `StoreEditPanel`: paneles de edición inline con formulario y guardado.
- `HardwareBrandsManagementComponent` / `HardwareEditionsManagementComponent` / `HardwareModelsManagementComponent`: listados de gestión con CRUD.
- `ProtectorsManagementComponent`: valores iniciales, `onAddProtector`, `onSelectProtector`, `onClosePanel`, `getCategoryLabel`, `getMinUnitPrice`, `onDeleteProtector` (éxito y error).
- `StoresManagementComponent`: valores iniciales, `onAddStore`, `onSelectStore`, `onClosePanel`, `getFormatHintLabel`.
- `UsersManagementComponent`: valores iniciales, `isCurrentUser`, `getRoleLabel`, `onRoleChange` (skip si mismo rol).
- `CatalogItemCardComponent`: inputs y slots de contenido.
- `OrdersComponent` (shell): valores iniciales, `onCreateOrder`, `onOpenOrder`, estado de `loading`.
- `OrderSummaryCardComponent`: inputs básicos.
- `OrderCreateComponent`: formulario de creación, validación, `onSubmit`, `onCancel`.
- `OrderDetailComponent`: `ngOnInit` (carga por id, status inicial), `selectingPacks`, `placingOrder`, `isOwner`, `nextStatus`/`prevStatus`, `onAdvanceStatus`, `onRegressStatus`, `onConfirmPacks`, `onToggleMemberReady`, `onShareInvitation`, `onDeleteOrder`, `onDeleteLine`, `onAddLine`, `onEditLine`, `onInfoEditingStarted`/`onInfoEditingEnded`, `onInfoHeaderSaved`, `onEditHeader`.
- `OrderCostSummaryComponent`: cálculo de subtotal por usuario, shipping, paypal fee, descuento (amount/%), total.
- `OrderInfoSectionComponent`: `onToggleSection`, `startEditing`, `onCancelEdit`, `onSaveHeader`, `sortedMembers`, `readyCount`, `allMembersReady`.
- `OrderPlacingComponent`: agrupado de líneas por producto, `quantityOrdered` null en entrada nueva y acumulador existente, producto sin packs, fallback a `suggestions[0]` cuando el precio unitario no coincide.
- `OrderProductListComponent`: `visibleLines`, `groupedLines`.
- `OrderStepperComponent`: inicialización de steps, selección de pack, auto-confirmación al navegar, `getMemberAllocations` (proporcional con Largest Remainder), output `allPacksSelectedChange`.
- `ReadyDialogComponent`: `canConfirm`, `getSelectedIndex`, `onSelectSuggestion`, `formatBreakdown`, `onConfirm`, `onCancel`.
- `AddEditLineDialogComponent`: modos add/edit, `canConfirm`, `onProductSelected`, `onConfirm`, `onCancel`.
- `OrdersListComponent`: carga de lista, `onCreateOrder`, `onOpenOrder`, estados de carga.
- `OrderInviteComponent`: carga de orden por token, unión al pedido (`onJoin`), estados de carga y error.
- `SaleComponent`: flujo de venta de juego con formulario y confirmación.
- `SettingsComponent`: valores iniciales, `getDisplayName`/`getUserEmail`/`getAvatarUrl`, edición de nombre (`onEditName`, `onCancelEditName`, `onSaveName`), `toggleTheme`, `onSelectBanner`, `logout`.
- `AvatarCropDialogComponent`: existencia, `cropW`/`cropH`, `imageUrl`, `onCancel()`, `onConfirm()` (crop real con canvas mock).
- `WishlistComponent`: señales `totalEstimatedSpend`, `itemsWithPrice`, `mobileCanConfirm`; flujo móvil (`onAddItem`, `onEditItem`, `onMobileGameSelected`, `onMobileBackToSearch`, `onMobileCancel`).
- `WishlistCardComponent`: señal computada `storeLinks` (con y sin plataforma, limpieza de caracteres especiales); outputs `editClicked`, `deleteClicked`, `ownClicked`; `onCardClick` emite `cardClicked` solo cuando `mobileMode` es true.
- `WishlistItemDialogComponent`: modos add/edit, `canConfirm`, `onGameSelected`, `onChangGame`, `onConfirm`, `onCancel`.
- `WishlistDetailComponent`: `storeLinks` (computed, con/sin plataforma), `ngOnInit` (state / fallback / notFound / error), `onBack`, `onEdit`, `onDelete` (cancel/confirm/success/error/null), `onOwn` (source rawg vs manual), `_userId` getter.

---

### Utilidades compartidas (`src/app/presentation/shared`)

| Fichero | Tests | Estado |
|---|---|---|
| `dominant-color/dominant-color.util.spec.ts` | 6 | ✅ Cubierto |
| `image-url/image-url.utils.spec.ts` | 8 | ✅ Cubierto |
| `order-member/order-member.util.spec.ts` | 19 | ✅ Cubierto |
| `pack-optimizer/pack-optimizer.util.spec.ts` | 24 | ✅ Cubierto |
| `rawg-platform/rawg-platform.utils.spec.ts` | 12 | ✅ Cubierto |
| `validators/validators.spec.ts` | 15 | ✅ Cubierto |

**Qué se cubre**:
- `dominant-color.util`: `extractDominantColor` (promedio de píxeles válidos, filtrado near-black/near-white, fallback a promedio total cuando < 50 píxeles válidos, null cuando `getContext` falla o `drawImage` lanza error CORS).
- `pack-optimizer.util`: `optimizePacks` (casos de borde, pack único, múltiples packs, deduplicación, límite de 3 sugerencias, orden del breakdown, redondeo de costes) y `formatBreakdown`.
- `order-member.util`: `sortedMembers` (owner primero), `readyCount`, `allMembersReady`.
- `rawg-platform.utils`: normalización de nombres de plataformas RAWG.

---

### App component (`src/app`)

| Fichero | Tests | Estado |
|---|---|---|
| `app.component.spec.ts` | 31 | ✅ Cubierto |

**Qué se cubre**: existencia, `isAuthenticated`, `isNavActive` (incluyendo rutas de edición), `getPageTitle`, `getDisplayName`, `getUserEmail`, `getAvatarUrl`, `logout`, `onAvatarClick` (navega a /settings), inicialización de tema y PWA, actualización de `currentRoute` en NavigationEnd; señales computadas `bottomNavItems` (con y sin admin, mobile vs desktop), `activeNavIndex`, `navItemCount`.

---

## Resumen

| Capa | Ficheros | Tests |
|---|---|---|
| Configuración | 1 | 3 |
| Mappers | 13 | 190 |
| Use Cases | 17 | 151 |
| Repositorios | 16 (+1 pendiente) | 233 |
| Guards | 4 | 16 |
| Servicios | 7 | 84 |
| Abstractas | 5 | 165 |
| App component | 1 | 31 |
| Componentes | 67 | ~1379 |
| Utilidades | 6 | 84 |
| **Total** | **137** | **2359** |

> Fuente autoritativa: `npm test`.

---

## Cobertura actual

| Métrica | Valor |
|---|---|
| Statements | 98.94 % (4608 / 4657) |
| Branches | **95.15 %** (2966 / 3117) |
| Functions | 99.05 % (1053 / 1063) |
| Lines | 99.86 % (3810 / 3815) |

```bash
npm run test:coverage
```

El informe HTML se genera en `coverage/monchito-game-library/`.

> **El 95.31 % de ramas es cercano al máximo alcanzable.** El resto de ramas sin cubrir pertenecen a las cuatro categorías descritas a continuación.

---

## Ramas sin cobertura — análisis exhaustivo

Tras examinar el fichero `lcov.info` entrada a entrada (formato `BRDA:linea,bloque,rama,contador`), las ramas sin cubrir se agrupan en cuatro categorías.

### Categoría 1 — Artefactos V8 en declaraciones de clase (~80 ramas)

V8 genera entre 2 y 4 entradas `BRDA` fantasma en la línea de cada `export class X`. Estas ramas no existen en el código TypeScript original; las introduce el propio compilador de JavaScript durante la instrumentación de cobertura. No hay ningún test que pueda cubrir una rama que no tiene código ejecutable asociado.

**Patrón en `lcov.info`:**
```
SF:src/app/.../foo.component.ts
BRDA:12,95,0,1   ← rama 0 cubierta
BRDA:12,95,1,0   ← rama 1 siempre a 0 (artefacto)
BRDA:12,96,0,0   ← bloque entero a 0 (artefacto)
BRDA:12,96,1,0   ← bloque entero a 0 (artefacto)
```

La línea 12 es `export class FooComponent implements OnInit { ... }`. Por mucho que se instancie el componente en los tests, estos bloques 95/96 no se incrementan.

**Ficheros afectados**: todos los componentes standalone (≈ 40 ficheros), cada uno con 2–4 ramas fantasma.

---

### Categoría 2 — Código muerto / ramas inalcanzables (~20 ramas)

Son ramas de condiciones cuyo lado `false` (o `true`) nunca puede ocurrir dado el contrato del código que las rodea.

| Fichero | Línea | Expresión | Rama inalcanzable | Motivo |
|---|---|---|---|---|
| `game-form.component.ts` | 235 | `parts[0] ?? '50%'` | lado `null` del `??` | `String.prototype.split()` siempre devuelve al menos 1 elemento; `parts[0]` nunca es `null`/`undefined` |
| `game-form.component.ts` | 202 | `typeof platform.labelKey` | rama `false` | el objeto siempre tiene `labelKey` por construcción |
| `game-form.component.ts` | 431, 434 | guards de validación de form | ramas imposibles | los controles se inicializan en el constructor; nunca son `null` |
| `_passwordMatchValidator` (register / reset-password) | — | `if (!password \|\| !confirmPassword)` | rama `true` | las controls siempre existen; el validador solo se aplica al `FormGroup` que las crea |
| `pack-optimizer.util.ts` | 25 | `_runDP(needed, sorted, 1)[0] ?? null` | rama `null` del `??` | `_runDP` siempre devuelve al menos un resultado para packs válidos; el array nunca está vacío |
| `pack-optimizer.util.ts` | 35 | `if (!s) continue` | rama `true` | `exact` (al que `!s` protege) solo sería `null` si `_runDP` devolviera vacío (ver fila anterior) |
| `pack-optimizer.util.ts` | 113 | `if (seen.has(key)) continue` | rama `true` | la misma combinación de packs no puede aparecer para dos valores distintos de `q` en el DP back-tracking determinista |

> **Nota sobre `_passwordMatchValidator`**: aunque la rama `true` del guard es lógicamente inalcanzable en producción, sí se ha cubierto en los tests invocando el validador directamente con un `FormGroup` sintético al que le falta uno de los controles: `(component as any)._passwordMatchValidator(new FormGroup({ confirmPassword: new FormControl('') }))`. Esto cierra la rama en el spec pero no elimina las entradas V8 de los bloques adyacentes.

---

### Categoría 3 — Artefactos de Angular signals compilados (~15 ramas)

Dentro de `computed()` y `effect()`, Angular compila las funciones a través de su propio scheduler. El optional chaining (`?.`) y el nullish coalescing (`??`) dentro de esas funciones generan entradas `BRDA` que V8 nunca marca como cubiertas aunque el código se ejecute, porque la rama se resuelve en el contexto del scheduler de Angular y no en el frame de ejecución normal del test.

**Ejemplo concreto** (`game-form.component.ts`, línea 289):
```typescript
readonly hasChanges = computed(() => {
  // ...
  return JSON.stringify(current) !== JSON.stringify(this._initialSnapshot)
    || (this.selectedGame()?.rawg_id !== this._initialSnapshot?.rawgId);
  //                       ^ BRDA:289,34,1,0 — rama "no-null" nunca cubierta por V8
});
```
El test llama a `hasChanges()` con `selectedGame()` devolviendo un objeto con `rawg_id`, pero V8 no registra la rama "objeto existe → acceder a `rawg_id`" porque el compiled signal la ejecuta fuera del stack de instrumentación normal.

**Otros ficheros afectados**:
- `create-update-console.component.ts` líneas 69, 75, 81: `this._storeInput()?.toString().toLowerCase() ?? ''` y equivalentes para brand/model dentro de `filteredStores`, `filteredBrands`, `filteredModels` (todos `computed()`).
- `create-update-controller.component.ts` líneas 76, 82, 88: mismo patrón.

**Ficheros afectados**: cualquier componente con `computed()` que contenga `?.` o `??`.

---

### Categoría 4 — Lógica real con cobertura mejorable

| Componente | Cobertura branches | Qué falta |
|---|---|---|
| `order-detail.component.ts` | 84.3 % (102/121) | Callbacks realtime (`subscribeToOrderMembers`/`subscribeToOrderLines` lines 135/139), `@ViewChild` setter (line 65). `_initStepper` y `_onAdvanceToSelectingPacks` ya cubiertos. |

---

## Lógica sin cobertura (deliberadamente no testeada)

| Componente / método | Motivo |
|---|---|
| Flujos async de management (`_loadStores`, `onSaved`, `onDeleteStore`…) | Requieren control de microtasks y spies en use-cases async; cobertura de señales y lógica pura ya cubierta. |
| `supabase.config.ts` — función `lock` (línea 17) | La función `(name, acquireTimeout, fn) => fn()` solo se invoca internamente por Supabase durante operaciones de auth. No se puede activar sin mocks que el bundler de Angular no permite re-aplicar tras `vi.resetModules()`. |
| `supabase-order.repository.ts` | Pendiente de spec. El repositorio se usa vía el contrato DI y los use cases lo mockean en sus tests. |
| `supabase-console.repository.ts` / `supabase-controller.repository.ts` — segundo `await` dentro de `createLoan` | Tras crear el préstamo en `hardware_loans`, se actualiza la tabla principal con `active_loan_*`. Esta segunda llamada no lanza aunque falle (sin `if (error)` guard), por lo que no hay rama de error testable. Los assertions de `controllerBuilder.update` y `consoleBuilder.update` en `returnLoan` y `createLoan` verifican que se invoca, pero V8 marca la rama de rechazo de `Promise.all` como no cubierta porque no hay throw. |
| `sale.component.ts` — línea 33 (`providers: [marketRepositoryProvider, marketUseCasesProvider]`) | La expresión del array de providers está en el `@Component` decorator. Angular Ivy la evalúa de forma diferida en la factory del componente; como el test reemplaza los providers con `TestBed.overrideComponent`, la expresión original nunca se ejecuta. Los providers conectan a Supabase y no se pueden instanciar en tests unitarios. |
| `app.component.ts` — callback de `addEventListener('change', …)` en `_mobileQuery` | El listener se registra en `ngOnInit` pero solo se dispara cuando el viewport cambia de tamaño. En happy-dom, `window.matchMedia` devuelve un mock que no admite dispatch de `MediaQueryListEvent`. La función es un simple `this._isMobile.set(e.matches)` sin lógica propia. |
| `app.component.ts` — `@ViewChildren(MatMenuTrigger) menuTriggers` (línea 107) | Propiedad decorada con `@ViewChildren`. Angular genera un setter interno que se llama durante la inicialización de la vista; con `template: ''` en los tests no hay view children que satisfacer. V8 registra el setter como no ejecutado. Artefacto del compilador Angular. |
| `catalog-item-card.component.ts` — `CatalogItemCardComponent_click_HostBindingHandler` | Función generada por el compilador Angular para el host binding `'(click)': 'cardClick.emit()'`. Los tests despachan un click nativo sobre `fixture.nativeElement` y el spy se activa, pero V8 no instrumenta correctamente las funciones de host binding generadas por Ivy. Artefacto del compilador. |
| `settings.component.ts` — función anónima `anonymous_15` | Callback anónimo de una suscripción RxJS en el componente de ajustes. La función es uno de los callbacks de subscribe que se ejecuta solo bajo condiciones específicas no reproducidas en los tests actuales. |
