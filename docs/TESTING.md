# Testing — Monchito Game Library

## Configuración

- **Framework**: Vitest 4.1.0 vía `@angular/build:unit-test`
- **Entorno DOM**: happy-dom 20.8.4
- **Ejecutar tests**: `ng test` (una vez) / `ng test --watch` (watch mode)

---

## Cobertura por capa

### Capa de datos — Mappers (`src/app/data/mappers`)

| Fichero | Tests | Estado |
|---|---|---|
| `rawg/rawg.mapper.spec.ts` | 18 | ✅ Cubierto |
| `supabase/game.mapper.spec.ts` | 28 | ✅ Cubierto |
| `supabase/protector.mapper.spec.ts` | 9 | ✅ Cubierto |
| `supabase/store.mapper.spec.ts` | 7 | ✅ Cubierto |
| `supabase/user-preferences.mapper.spec.ts` | 9 | ✅ Cubierto |
| `supabase/wishlist.mapper.spec.ts` | 11 | ✅ Cubierto |

**Qué se cubre**: transformaciones de DTO → modelo de dominio, valores por defecto, prioridad de campos opcionales, fallbacks para null/undefined.

---

### Capa de dominio — Use Cases (`src/app/domain/use-cases`)

| Fichero | Tests | Estado |
|---|---|---|
| `audit-log/audit-log.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `auth/auth.use-cases.spec.ts` | 11 | ✅ Cubierto |
| `catalog/catalog.use-cases.spec.ts` | 12 | ✅ Cubierto |
| `game/game.use-cases.spec.ts` | 9 | ✅ Cubierto |
| `protector/protector.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `store/store.use-cases.spec.ts` | 5 | ✅ Cubierto |
| `user-admin/user-admin.use-cases.spec.ts` | 4 | ✅ Cubierto |
| `user-preferences/user-preferences.use-cases.spec.ts` | 14 | ✅ Cubierto |
| `wishlist/wishlist.use-cases.spec.ts` | 5 | ✅ Cubierto |

**Qué se cubre**: delegación a repositorios, parámetros correctos, valores por defecto, validación de archivos (tamaño/MIME), lógica de borrado condicional, paginación de screenshots.

**Patrón de test**: `TestBed.configureTestingModule` + token de repositorio mockeado con `vi.fn()`.

---

### Capa de presentación — Guards (`src/app/presentation/guards`)

| Fichero | Tests | Estado |
|---|---|---|
| `admin.guard.spec.ts` | 2 | ✅ Cubierto |
| `user.guard.spec.ts` | 2 | ✅ Cubierto |

**Qué se cubre**: retorno de `true`/`UrlTree` según estado de autenticación y rol de administrador.

---

### Capa de presentación — Servicios (`src/app/presentation/services`)

| Fichero | Tests | Estado |
|---|---|---|
| `auth-state.service.spec.ts` | 13 | ✅ Cubierto |
| `pwa-update.service.spec.ts` | 11 | ✅ Cubierto |
| `theme.service.spec.ts` | 6 | ✅ Cubierto |
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
| `ad-hoc/toggle-switch/toggle-switch.component.spec.ts` | 12 | ✅ Cubierto |
| `pages/auth/forgot-password/forgot-password.component.spec.ts` | 15 | ✅ Cubierto |
| `pages/auth/login/login.component.spec.ts` | 17 | ✅ Cubierto |
| `pages/auth/register/register.component.spec.ts` | 20 | ✅ Cubierto |
| `pages/game-list/components/game-card/game-card.component.spec.ts` | 17 | ✅ Cubierto |
| `pages/wishlist/components/wishlist-card/wishlist-card.component.spec.ts` | 9 | ✅ Cubierto |
| `pages/game-list/game-list.component.spec.ts` | 43 | ✅ Cubierto |
| `pages/wishlist/wishlist.component.spec.ts` | 22 | ✅ Cubierto |
| `pages/settings/settings.component.spec.ts` | 22 | ✅ Cubierto |
| `pages/create-update-game/components/game-form/game-form.component.spec.ts` | 26 | ✅ Cubierto |
| `ad-hoc/skeleton/skeleton.component.spec.ts` | 4 | ✅ Cubierto |
| `pages/auth/auth.component.spec.ts` | 1 | ✅ Cubierto |
| `pages/create-update-game/create-and-update-game.component.spec.ts` | 1 | ✅ Cubierto |
| `components/confirm-dialog/confirm-dialog.component.spec.ts` | 3 | ✅ Cubierto |
| `pages/management/management.component.spec.ts` | 3 | ✅ Cubierto |

**Qué se cubre**:
- `ToggleSwitchComponent`: lógica CVA (`writeValue`, `registerOnChange`, `setDisabledState`), `onToggle`, output `changed`, `getIcon`.
- `LoginComponent` / `RegisterComponent` / `ForgotPasswordComponent`: validaciones de formulario, estados de `loading`, emisión de errores, integración con use cases.
- `GameCardComponent`: señales computadas (`ratingStars`, `platinumIcon`, `isDigital`, `defaultImage`, `coverObjectPosition`, `coverTransform`), método `onFlip`.
- `WishlistCardComponent`: señal computada `storeLinks` (con y sin plataforma), outputs `editClicked`, `deleteClicked`, `ownClicked`.
- `GameListComponent`: señales `filteredGames` (búsqueda, plataforma, store, estado, formato, favoritos, orden), `gameRows`, `ownedCount`, `platinumCount`, `totalPrice`, `activeFilterCount`, `formatFilterIcon`, `clearAllFilters`, `onSearchInput`.
- `WishlistComponent`: señales `totalEstimatedSpend`, `itemsWithPrice`, `mobileCanConfirm`; flujo móvil (`onAddItem`, `onEditItem`, `onMobileGameSelected`, `onMobileBackToSearch`, `onMobileCancel`).
- `SettingsComponent`: valores iniciales, `getDisplayName`/`getUserEmail`/`getAvatarUrl`, edición de nombre (`onEditName`, `onCancelEditName`, `onSaveName`), `toggleTheme`, `onSelectBanner`, `logout`.
- `GameFormComponent`: valores iniciales, señal computada `coverImages`, `openSearchMode`/`closeSearchMode`, `selectGameFromSearch`, `clearSelectedGame`, `filteredStores`.
- `SkeletonComponent`: valores por defecto de los tres inputs (`width`, `height`, `borderRadius`).
- `AuthComponent` / `CreateAndUpdateGameComponent` / `ConfirmDialogComponent` / `ManagementComponent`: existencia y datos inyectados donde aplica.

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
| `rawg.repository.spec.ts` | 8 | ✅ Cubierto |
| `supabase.repository.spec.ts` | 9 | ✅ Cubierto |
| `supabase-auth.repository.spec.ts` | 11 | ✅ Cubierto |
| `supabase-audit-log.repository.spec.ts` | 7 | ✅ Cubierto |
| `supabase-preferences.repository.spec.ts` | 9 | ✅ Cubierto |
| `supabase-protector.repository.spec.ts` | 8 | ✅ Cubierto |
| `supabase-store.repository.spec.ts` | 8 | ✅ Cubierto |
| `supabase-user-admin.repository.spec.ts` | 5 | ✅ Cubierto |
| `supabase-wishlist.repository.spec.ts` | 8 | ✅ Cubierto |

**Qué se cubre**: llamadas correctas a Supabase (`.from()`, `.select()`, `.eq()`, `.insert()`, `.update()`, `.delete()`, `.upsert()`, `.rpc()`), paginación, reuso de entradas de catálogo existentes, manejo de errores, subida de ficheros a Storage.

**Patrón de test**: `SUPABASE_CLIENT` `InjectionToken` provisto en `TestBed` con `useValue: mockSupabase` (objeto compartido de `supabase-mock.ts`). El cliente mock se inyecta directamente sin `vi.mock`. Builder fluido y thenable (`makeBuilder`). Para RAWG se usa `vi.spyOn(globalThis, 'fetch')`.

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
| Mappers | 6 | 82 |
| Use Cases | 9 | 69 |
| Repositorios | 9 | 73 |
| Guards | 2 | 4 |
| Servicios | 5 | 55 |
| Componentes | 15 | 215 |
| Abstractas | 1 | 29 |
| Utilidades | 2 | 14 |
| **Total** | **49** | **532** |

---

## Qué falta por cubrir

### Componentes sin tests

| Componente | Motivo |
|---|---|
| `GameCoverPositionDialogComponent` | Extiende `CropInteractionBase` (ya cubierta). Lógica adicional mínima. |
| `AvatarCropDialogComponent` | `_cropToBlob()` requiere canvas + HTMLImageElement real, no testeable en happy-dom. |
| `GameSearchPanelComponent` | Lógica de debounce + búsqueda asíncrona. |
| `GameListFiltersSheetComponent` | Wrapper de filtros con lógica mínima. |
| `WishlistItemDialogComponent` | Formulario de ítem con búsqueda integrada. |
| `AuditLogManagementComponent` | Valores iniciales y mapeo de iconos/labels. |
| `UsersManagementComponent` | CRUD de roles de usuario. |
| `StoresManagementComponent` | 380 líneas — formulario + CRUD inline. |
| `ProtectorsManagementComponent` | 592 líneas — formulario + packs array + CRUD inline. |
| `AppComponent` | Shell principal — requiere mocks de Router events, múltiples servicios. |

### Cobertura de código

Para obtener el informe de cobertura con v8:

```bash
ng test --coverage
```

El informe se genera en `coverage/`. La cobertura de líneas en mappers, use cases y repositorios supera el 90%.
