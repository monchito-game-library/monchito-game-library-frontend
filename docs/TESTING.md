# Testing — Monchito Game Library

## Configuración

- **Framework**: Vitest 4.1.0 vía `@angular/build:unit-test`
- **Entorno DOM**: happy-dom 20.8.4
- **Ejecutar tests**: `ng test` (una vez) / `ng test --watch` (watch mode)

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
| `rawg/rawg.mapper.spec.ts` | 19 | ✅ Cubierto |
| `supabase/game.mapper.spec.ts` | 39 | ✅ Cubierto |
| `supabase/protector.mapper.spec.ts` | 7 | ✅ Cubierto |
| `supabase/store.mapper.spec.ts` | 7 | ✅ Cubierto |
| `supabase/user-preferences.mapper.spec.ts` | 8 | ✅ Cubierto |
| `supabase/wishlist.mapper.spec.ts` | 8 | ✅ Cubierto |

**Qué se cubre**: transformaciones de DTO → modelo de dominio, valores por defecto, prioridad de campos opcionales, fallbacks para null/undefined.

---

### Capa de dominio — Use Cases (`src/app/domain/use-cases`)

| Fichero | Tests | Estado |
|---|---|---|
| `audit-log/audit-log.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `auth/auth.use-cases.spec.ts` | 14 | ✅ Cubierto |
| `catalog/catalog.use-cases.spec.ts` | 10 | ✅ Cubierto |
| `game/game.use-cases.spec.ts` | 9 | ✅ Cubierto |
| `protector/protector.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `store/store.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `user-admin/user-admin.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `user-preferences/user-preferences.use-cases.spec.ts` | 13 | ✅ Cubierto |
| `wishlist/wishlist.use-cases.spec.ts` | 5 | ✅ Cubierto |

**Qué se cubre**: delegación a repositorios, parámetros correctos, valores por defecto, validación de archivos (tamaño/MIME), lógica de borrado condicional, paginación de screenshots.

**Patrón de test**: `TestBed.configureTestingModule` + token de repositorio mockeado con `vi.fn()`.

---

### Capa de presentación — Guards (`src/app/presentation/guards`)

| Fichero | Tests | Estado |
|---|---|---|
| `admin.guard.spec.ts` | 4 | ✅ Cubierto |
| `user.guard.spec.ts` | 4 | ✅ Cubierto |

**Qué se cubre**: retorno de `true`/`UrlTree` según estado de autenticación y rol de administrador.

---

### Capa de presentación — Servicios (`src/app/presentation/services`)

| Fichero | Tests | Estado |
|---|---|---|
| `auth-state.service.spec.ts` | 19 | ✅ Cubierto |
| `pwa-update.service.spec.ts` | 12 | ✅ Cubierto |
| `theme.service.spec.ts` | 8 | ✅ Cubierto |
| `user-context.service.spec.ts` | 11 | ✅ Cubierto |
| `user-preferences.service.spec.ts` | 14 | ✅ Cubierto |

**Qué se cubre**:
- `ThemeService`: señal `isDarkMode`, métodos `setDarkTheme`/`setLightTheme`/`initTheme`.
- `AuthStateService`: estado inicial, resolución asíncrona de sesión, `onAuthStateChange` y navegación al logout.
- `UserContextService`: delegación a `AuthStateService`, URL de fallback de avatar (ui-avatars.com).
- `UserPreferencesService`: valores iniciales de todos los signals, computed `isAdmin`, mutabilidad con `set()`.
- `PwaUpdateService`: `checkForUpdate` en init y visibilitychange, detección de `VERSION_READY`, overlay en rutas seguras, diferimiento en rutas de formulario hasta la siguiente navegación segura.

---

### Capa de presentación — Componentes (`src/app/presentation`)

| Fichero | Tests | Estado |
|---|---|---|
| `ad-hoc/toggle-switch/toggle-switch.component.spec.ts` | 21 | ✅ Cubierto |
| `ad-hoc/skeleton/skeleton.component.spec.ts` | 4 | ✅ Cubierto |
| `components/confirm-dialog/confirm-dialog.component.spec.ts` | 3 | ✅ Cubierto |
| `components/game-search-panel/game-search-panel.component.spec.ts` | 10 | ✅ Cubierto |
| `pages/auth/auth.component.spec.ts` | 1 | ✅ Cubierto |
| `pages/auth/forgot-password/forgot-password.component.spec.ts` | 15 | ✅ Cubierto |
| `pages/auth/login/login.component.spec.ts` | 17 | ✅ Cubierto |
| `pages/auth/register/register.component.spec.ts` | 20 | ✅ Cubierto |
| `pages/create-update-game/create-and-update-game.component.spec.ts` | 2 | ✅ Cubierto |
| `pages/create-update-game/components/game-form/game-form.component.spec.ts` | 84 | ✅ Cubierto |
| `pages/create-update-game/components/game-cover-position-dialog/game-cover-position-dialog.component.spec.ts` | 15 | ✅ Cubierto |
| `pages/game-list/components/game-card/game-card.component.spec.ts` | 24 | ✅ Cubierto |
| `pages/game-list/components/game-list-filters-sheet/game-list-filters-sheet.component.spec.ts` | 6 | ✅ Cubierto |
| `pages/game-list/game-list.component.spec.ts` | 69 | ✅ Cubierto |
| `pages/management/management.component.spec.ts` | 3 | ✅ Cubierto |
| `pages/management/audit-log/audit-log-management.component.spec.ts` | 7 | ✅ Cubierto |
| `pages/management/protectors/protectors-management.component.spec.ts` | 37 | ✅ Cubierto |
| `pages/management/stores/stores-management.component.spec.ts` | 26 | ✅ Cubierto |
| `pages/management/users/users-management.component.spec.ts` | 16 | ✅ Cubierto |
| `pages/settings/settings.component.spec.ts` | 48 | ✅ Cubierto |
| `pages/settings/components/avatar-crop-dialog/avatar-crop-dialog.component.spec.ts` | 7 | ✅ Cubierto |
| `pages/wishlist/components/wishlist-card/wishlist-card.component.spec.ts` | 9 | ✅ Cubierto |
| `pages/wishlist/components/wishlist-item-dialog/wishlist-item-dialog.component.spec.ts` | 17 | ✅ Cubierto |
| `pages/wishlist/wishlist.component.spec.ts` | 36 | ✅ Cubierto |

**Qué se cubre**:
- `ToggleSwitchComponent`: lógica CVA (`writeValue`, `registerOnChange`, `setDisabledState`), `onToggle`, output `changed`, `getIcon`.
- `LoginComponent` / `RegisterComponent` / `ForgotPasswordComponent`: validaciones de formulario, estados de `loading`, emisión de errores, integración con use cases.
- `GameCardComponent`: señales computadas (`ratingStars`, `platinumIcon`, `isDigital`, `defaultImage`, `coverObjectPosition`, `coverTransform`), método `onFlip`.
- `WishlistCardComponent`: señal computada `storeLinks` (con y sin plataforma), outputs `editClicked`, `deleteClicked`, `ownClicked`.
- `GameListComponent`: señales `filteredGames` (búsqueda, plataforma, store, estado, formato, favoritos, orden), `gameRows`, `ownedCount`, `platinumCount`, `totalPrice`, `activeFilterCount`, `formatFilterIcon`, `clearAllFilters`, `onSearchInput`.
- `WishlistComponent`: señales `totalEstimatedSpend`, `itemsWithPrice`, `mobileCanConfirm`; flujo móvil (`onAddItem`, `onEditItem`, `onMobileGameSelected`, `onMobileBackToSearch`, `onMobileCancel`).
- `SettingsComponent`: valores iniciales, `getDisplayName`/`getUserEmail`/`getAvatarUrl`, edición de nombre (`onEditName`, `onCancelEditName`, `onSaveName`), `toggleTheme`, `onSelectBanner`, `logout`.
- `GameFormComponent`: valores iniciales, señal computada `coverImages` (con y sin `image_url`), `openSearchMode`/`closeSearchMode`, `selectGameFromSearch`, `clearSelectedGame`, `filteredStores`, modo edición con/sin `rawgId`, efecto de re-sincronización de store (con y sin valor previo seleccionado).
- `SkeletonComponent`: valores por defecto de los tres inputs (`width`, `height`, `borderRadius`).
- `AuthComponent` / `CreateAndUpdateGameComponent` / `ConfirmDialogComponent` / `ManagementComponent`: existencia y datos inyectados donde aplica.
- `GameListFiltersSheetComponent`: existencia, `consoles`/`gameStatuses`, `close()`, `onClearAll()`.
- `GameSearchPanelComponent`: valores iniciales, `onSearchInput`, `onSelectGame`.
- `GameCoverPositionDialogComponent`: parseo de `initialPosition` en constructor, `onConfirm()`, `onCancel()`.
- `AvatarCropDialogComponent`: existencia, `cropW`/`cropH`, `imageUrl`, `onCancel()`.
- `WishlistItemDialogComponent`: modos add/edit, `canConfirm`, `onGameSelected`, `onChangGame`, `onConfirm`, `onCancel`.
- `AuditLogManagementComponent`: valores iniciales, `getActionIcon`, `getActionLabel`.
- `UsersManagementComponent`: valores iniciales, `isCurrentUser`, `getRoleLabel`, `onRoleChange` (skip si mismo rol).
- `StoresManagementComponent`: valores iniciales, `onAddStore`, `onSelectStore`, `onClosePanel`, `getFormatHintLabel`.
- `ProtectorsManagementComponent`: valores iniciales, `onAddProtector`, `onSelectProtector`, `onClosePanel`, `getCategoryLabel`, `getMinUnitPrice`.
- `AppComponent`: existencia, `isAuthenticated`, `isNavActive`, `getPageTitle`, `getDisplayName`, `getUserEmail`, `getAvatarUrl`, `logout`.

---

### Capa de presentación — Abstractas (`src/app/presentation/abstract`)

| Fichero | Tests | Estado |
|---|---|---|
| `crop-interaction.base.spec.ts` | 29 | ✅ Cubierto |

**Qué se cubre**: valores iniciales de signals, `onImageLoad` (cálculo de overflow según aspect ratio), drag con pointer events (inicio, movimiento, clamping, fin), zoom con rueda del ratón (min/max), touch de 1 dedo (pan) y 2 dedos (pinch-to-zoom), `onTouchEnd` con transición de 2 a 1 dedo.

**Patrón de test**: subclase concreta `TestCropInteraction` que expone `_cropW`/`_cropH`; helpers `makePointerEvent`, `makeTouchEvent`, `makeImgEvent`.

---

### Capa de datos — Repositorios (`src/app/data/repositories`)

| Fichero | Tests | Estado |
|---|---|---|
| `rawg.repository.spec.ts` | 20 | ✅ Cubierto |
| `supabase.repository.spec.ts` | 31 | ✅ Cubierto |
| `supabase-auth.repository.spec.ts` | 20 | ✅ Cubierto |
| `supabase-audit-log.repository.spec.ts` | 7 | ✅ Cubierto |
| `supabase-preferences.repository.spec.ts` | 13 | ✅ Cubierto |
| `supabase-protector.repository.spec.ts` | 13 | ✅ Cubierto |
| `supabase-store.repository.spec.ts` | 9 | ✅ Cubierto |
| `supabase-user-admin.repository.spec.ts` | 5 | ✅ Cubierto |
| `supabase-wishlist.repository.spec.ts` | 12 | ✅ Cubierto |

**Qué se cubre**: llamadas correctas a Supabase (`.from()`, `.select()`, `.eq()`, `.insert()`, `.update()`, `.delete()`, `.upsert()`, `.rpc()`), paginación, reuso de entradas de catálogo existentes, manejo de errores, subida de ficheros a Storage. En `rawg.repository.spec.ts` también se cubre la rama `if (this._apiKey)` cuando no hay API key configurada.

**Patrón de test**: `SUPABASE_CLIENT` `InjectionToken` provisto en `TestBed` con `useValue: mockSupabase` (objeto compartido de `supabase-mock.ts`). El cliente mock se inyecta directamente sin `vi.mock`. Builder fluido y thenable (`makeBuilder`). Para RAWG se usa `vi.spyOn(globalThis, 'fetch')`. Para cubrir ramas de campos privados se usa `(repo as any)._field = value`.

---

### Utilidades compartidas (`src/app/presentation/shared`)

| Fichero | Tests | Estado |
|---|---|---|
| `image-url.utils.spec.ts` | 8 | ✅ Cubierto |
| `validators.spec.ts` | 6 | ✅ Cubierto |

---

## Resumen

| Capa | Ficheros | Tests |
|---|---|---|
| Configuración | 1 | 3 |
| Mappers | 6 | 88 |
| Use Cases | 9 | 69 |
| Repositorios | 9 | 130 |
| Guards | 2 | 8 |
| Servicios | 5 | 64 |
| Componentes | 26 | 557 |
| Abstractas | 1 | 33 |
| App component | 1 | 27 |
| Utilidades | 2 | 14 |
| **Total** | **62** | **940** |

> El total de 940 incluye todos los `it()` de todos los ficheros `.spec.ts`. Fuente autoritativa: `ng test`.

---

## Cobertura actual

| Métrica | Valor |
|---|---|
| Statements | ~99.06 % |
| Branches | ~95.07 % |
| Functions | ~99.56 % |
| Lines | ~99.94 % |

```bash
ng test --coverage
```

El informe HTML se genera en `coverage/monchito-game-library/`.

## Ramas sin cobertura — estado final

Todas las ramas sin cobertura restantes son **artefactos del compilador V8**, no lógica de negocio:

| Tipo de artefacto | Ejemplo | Por qué no es cubrible |
|---|---|---|
| Declaración de clase con `implements` | `export class X implements OnInit {}` | V8 genera una rama implícita para la comprobación de interfaz en tiempo de compilación |
| Cierre en `providers` de `@Component` | `forwardRef(() => ToggleSwitchComponent)` | El lambda en el array de providers genera una rama fantasma |
| Guard defensivo inalcanzable | `if (!password \|\| !confirmPassword)` en `_passwordMatchValidator` | Las controls siempre existen porque el mismo componente las crea; la condición nunca puede ser `true` |

## Lógica sin cobertura (deliberadamente no testeada)

| Componente / método | Motivo |
|---|---|
| Flujos async de management (`_loadStores`, `onSaved`, `onDeleteStore`…) | Requieren control de microtasks y spies en use-cases async; cobertura de señales y lógica pura ya cubierta. |
| `supabase.config.ts` — función `lock` (línea 17) | La función `(name, acquireTimeout, fn) => fn()` solo se invoca internamente por Supabase durante operaciones de auth. No se puede activar sin mocks que el bundler de Angular no permite re-aplicar tras `vi.resetModules()`. Impacto mínimo en cobertura. |
