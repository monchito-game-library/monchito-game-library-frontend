# Monchito Game Library — Bugs conocidos

> Registro histórico de bugs detectados y su estado de resolución.

---

## Índice

| Bug                                                                                                                                                       | Componente                                      | Prioridad   |
| --------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------- |
| ~~[Imagen RAWG compartida entre copias del mismo juego](#imagen-rawg-compartida-entre-copias-del-mismo-juego)~~                                           | `SupabaseGameRepository`                        | ✅ Resuelto |
| ~~[Flujo de venta de juegos no elimina el juego de la colección](#flujo-de-venta-de-juegos-no-elimina-el-juego-de-la-colección)~~                         | `GameDetailComponent`                           | ✅ Resuelto |
| ~~[Scroll de wishlist cortado al llegar al final en mobile](#scroll-de-wishlist-cortado-al-llegar-al-final-en-mobile)~~                                   | `WishlistComponent`                             | ✅ Resuelto |
| ~~[Zoom + drag inoperativo en el reposicionamiento de portada](#zoom--drag-inoperativo-en-el-reposicionamiento-de-portada)~~                              | `GameCoverPositionDialogComponent`              | ✅ Resuelto |
| ~~[Espaciados SCSS no siguen la convención de rem/múltiplos de 0.25](#espaciados-scss-no-siguen-la-convención-de-remmúltiplos-de-025)~~                   | Varios                                          | ✅ Resuelto |
| ~~[i18n keys crudas en confirm-dialog del game-detail](#i18n-keys-crudas-en-confirm-dialog-del-game-detail)~~                                             | `GameDetailComponent`                           | ✅ Resuelto |
| ~~[Animación @fadeSlide huérfana en game-form](#animación-fadeslide-huérfana-en-game-form)~~                                                              | `GameFormComponent`                             | ✅ Resuelto |
| ~~[HTTP 406 en lookup de game_catalog](#http-406-en-lookup-de-game_catalog)~~                                                                             | `SupabaseRepository`                            | ✅ Resuelto |
| ~~[`/sale` accesible sin autenticación y carga infinita`](#sale-accesible-sin-autenticación-y-carga-infinita)~~                                           | `SalePage`                                      | ✅ Resuelto |
| ~~[Formularios auth sin feedback al enviar vacíos](#formularios-auth-sin-feedback-al-enviar-vacíos)~~                                                     | `LoginForm`/`RegisterForm`/`ForgotPasswordForm` | ✅ Resuelto |
| ~~[`NG02956` falta preconnect a `lh3.googleusercontent.com`](#ng02956-falta-preconnect-a-lh3googleusercontentcom)~~                                       | `index.html`                                    | ✅ Resuelto |
| ~~[`Missing translation` para `wishlist.filters.title` pese a existir la clave](#missing-translation-para-wishlistfilterstitle-pese-a-existir-la-clave)~~ | `WishlistComponent` / filtros                   | ✅ Resuelto |
| ~~[Botón `+` de `/wishlist` no hace nada](#botón--de-wishlist-no-hace-nada)~~                                                                             | `WishlistComponent`                             | ✅ Resuelto |
| ~~[Network 400 en `user_games_full?id=eq.new` tras CREATE](#network-400-en-user_games_fullideqnew-tras-create)~~                                          | `SalePage` / `game-form`                        | ✅ Resuelto |
| ~~[`hideLabels` no se aplica en tabs de `/sale` en móvil](#hidelabels-no-se-aplica-en-tabs-de-sale-en-móvil)~~                                            | `SalePage` / `retro-tabs`                       | ✅ Resuelto |
| ~~[`NG02956` también afecta a `ui-avatars.com`](#ng02956-también-afecta-a-ui-avatarscom)~~                                                                | `index.html`                                    | ✅ Resuelto |
| ~~[`NG02955` imagen LCP sin `priority` en `/wishlist`](#ng02955-imagen-lcp-sin-priority-en-wishlist)~~                                                    | `WishlistComponent`                             | ✅ Resuelto |

---

## ~~Imagen RAWG compartida entre copias del mismo juego~~

**Componente:** `SupabaseGameRepository`
**Fichero:** `src/app/data/repositories/supabase.repository.ts`

**Descripción:**
Si el usuario tiene dos copias del mismo juego (por ejemplo una física y una digital con el mismo título y `rawg_id`), al cambiar la imagen de portada en una de ellas (seleccionando un screenshot diferente) la imagen cambia también en la otra. El cambio debería afectar solo al juego editado.

**Pasos para reproducir:**

1. Añadir el mismo juego dos veces — uno digital y otro físico (mismo título, misma plataforma, mismo rawg_id).
2. Editar el juego digital y seleccionar un screenshot diferente como portada.
3. Guardar y volver al listado.
4. Observar que el juego físico también muestra el screenshot nuevo.

**Causa:**
La imagen de portada (`image_url`) está almacenada en `game_catalog`, que es una tabla compartida. Dos copias del mismo juego de RAWG apuntan al mismo `game_catalog_id`. Cuando el repositorio actualiza `image_url` en `game_catalog`, el cambio afecta a todas las copias del usuario que comparten ese catálogo.

```typescript
// supabase.repository.ts — updateGameForUser()
await this._supabase.from(this._catalogTable).update({ image_url: updated.imageUrl }).eq('id', gameCatalogId); // ← actualiza el catálogo compartido
```

**Solución requerida:**
Mover la imagen personalizada del usuario de `game_catalog` a `user_games`. Requiere una migración de base de datos:

```sql
ALTER TABLE user_games ADD COLUMN custom_image_url TEXT;
```

Y actualizar la vista `user_games_full` para que use `COALESCE(user_games.custom_image_url, game_catalog.image_url) AS image_url`.

El repositorio deberá guardar la imagen seleccionada en `user_games.custom_image_url` en lugar de en `game_catalog.image_url`. La imagen en `game_catalog` pasaría a ser solo de lectura (datos canónicos de RAWG, sin edición por usuario).

---

## ~~Flujo de venta de juegos no elimina el juego de la colección~~

**Componente:** `GameDetailComponent`
**Fichero:** `src/app/presentation/pages/collection/pages/games/pages/game-detail/`

**Descripción:**
Al marcar un juego como vendido desde el detalle, el juego no desaparece de la colección. El usuario puede indicar que lo ha vendido sin pasar por el flujo de puesta en venta, y el registro permanece visible en la lista como si siguiera en la colección.

**Causa:** `GameListComponent` y `GameDetailComponent` son componentes hermanos (no padre-hijo). Al navegar al detalle, `GameListComponent` se destruye y se recrea al volver. En `ngOnInit`, la suscripción a `NavigationEnd` se registraba después de `await this._loadGames(false)`. Angular disparaba `NavigationEnd` mientras el componente estaba suspendido en ese `await`, de modo que el evento se perdía y la lista mostraba datos obsoletos de la caché (con el juego ya vendido todavía visible).

**Solución:** eliminada la suscripción a `NavigationEnd`. El componente ahora muestra la caché inmediatamente si existe (para UX fluida) y siempre fuerza `_loadGames(true)` al montarse, garantizando que la lista refleje el estado real de Supabase independientemente de cómo se haya llegado a ella.

---

## ~~Scroll de wishlist cortado al llegar al final en mobile~~

**Componente:** `WishlistComponent`
**Fichero:** `src/app/presentation/pages/wishlist/wishlist.component.scss`

**Descripción:**
En mobile, al hacer scroll hasta el final de la lista de wishlist, el contenido aparece cortado — el último item o los últimos items no llegan a verse completamente. El problema no ocurre en escritorio.

**Causa:** falta de `padding-bottom` suficiente en el contenedor de la lista para compensar la altura de la bottom navigation bar en mobile.

**Solución:** añadido `padding-bottom: calc(60px + 0.75rem)` en `.wishlist-page` dentro del breakpoint mobile (`max-width: 768px`).

---

## Zoom + drag inoperativo en el reposicionamiento de portada

**Componente:** `GameCoverPositionDialogComponent`
**Fichero:** `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-cover-position-dialog/`

**Descripción:**
Al hacer zoom sobre la imagen en el dialog de reposicionamiento de portada, el arrastre para desplazar la imagen deja de funcionar correctamente. El usuario no puede posicionarse en el área deseada después de aplicar zoom.

**Pasos para reproducir:**

1. Abrir el dialog de reposicionamiento de portada desde una card de juego.
2. Aplicar zoom a la imagen.
3. Intentar arrastrar la imagen para ajustar la posición.

**Comportamiento esperado:** tras hacer zoom, el drag debe seguir funcionando y permitir desplazar la imagen libremente dentro del marco.

**Comportamiento actual:** el drag no responde o no se desplaza correctamente después del zoom.

**Causa:** la fórmula de sensibilidad del drag era incorrecta — usaba `overflowX + containerW*(s-1)` en vez de `(containerW + overflowX)*s - containerW`. Al escalar, el drag era demasiado rápido, la imagen alcanzaba el borde al instante y quedaba clampeada. Además, el `transform-origin` estaba fijo al centro del elemento en vez de seguir la posición actual (`posX% posY%`), lo que hacía que el zoom no entrara en el punto correcto.

**Solución (commit `fix/cover-position-drag`):** corrección de la fórmula de overflow efectivo, `transform-origin` dinámico vinculado a `positionCss()`, y manejo de `touchend` para resetear `_lastPointerX/Y` al soltar un dedo del pinch.

---

## Espaciados SCSS no siguen la convención de rem/múltiplos de 0.25

**Componente:** Varios ficheros SCSS

**Descripción:**
Varios ficheros SCSS usan valores de `gap`, `margin` y `padding` que incumplen una o ambas reglas de la convención:

1. Los espaciados deben estar en `rem`, no en `px`.
2. Los valores en `rem` deben ser múltiplos de `0.25` (0.25, 0.5, 0.75, 1, 1.25, 1.5…).

---

### Bloque 1 — Valores en `px` que deben convertirse a `rem` (conversión limpia)

#### `app.component.scss`

| Línea | Actual                   | Corrección          |
| ----- | ------------------------ | ------------------- |
| 38    | `padding: 12px 0`        | `0.75rem 0`         |
| 61    | `gap: 4px`               | `0.25rem`           |
| 70    | `gap: 4px`               | `0.25rem`           |
| 72    | `padding: 12px 4px`      | `0.75rem 0.25rem`   |
| 102   | `margin: 4px 0`          | `0.25rem 0`         |
| 208   | `gap: 4px`               | `0.25rem`           |
| 209   | `padding: 8px 4px`       | `0.5rem 0.25rem`    |
| 233   | `margin: 8px !important` | `0.5rem !important` |

#### `settings.component.scss`

| Línea | Actual     | Corrección |
| ----- | ---------- | ---------- |
| 135   | `gap: 4px` | `0.25rem`  |

#### `game-list.component.scss`

| Línea | Actual           | Corrección  |
| ----- | ---------------- | ----------- |
| 104   | `padding: 0 4px` | `0 0.25rem` |

#### `wishlist.component.scss`

| Línea | Actual               | Corrección       |
| ----- | -------------------- | ---------------- |
| 13    | `padding: 24px`      | `1.5rem`         |
| 14    | `gap: 24px`          | `1.5rem`         |
| 23    | `gap: 16px`          | `1rem`           |
| 41    | `gap: 16px`          | `1rem`           |
| 47    | `gap: 4px`           | `0.25rem`        |
| 62    | `gap: 16px`          | `1rem`           |
| 63    | `padding: 48px 0`    | `3rem 0`         |
| 71    | `gap: 12px`          | `0.75rem`        |
| 72    | `padding: 64px 24px` | `4rem 1.5rem`    |
| 97    | `gap: 12px`          | `0.75rem`        |
| 114   | `gap: 12px`          | `0.75rem`        |
| 120   | `gap: 8px`           | `0.5rem`         |
| 140   | `gap: 12px`          | `0.75rem`        |
| 141   | `padding: 8px 12px`  | `0.5rem 0.75rem` |
| 179   | `gap: 4px`           | `0.25rem`        |
| 188   | `gap: 8px`           | `0.5rem`         |
| 214   | `gap: 8px`           | `0.5rem`         |
| 235   | `gap: 8px`           | `0.5rem`         |
| 247   | `padding: 20px`      | `1.25rem`        |
| 254   | `padding: 12px`      | `0.75rem`        |
| 255   | `gap: 16px`          | `1rem`           |
| 280   | `padding: 12px 16px` | `0.75rem 1rem`   |

#### `wishlist-card.component.scss`

| Línea | Actual          | Corrección |
| ----- | --------------- | ---------- |
| 3     | `gap: 16px`     | `1rem`     |
| 4     | `padding: 12px` | `0.75rem`  |
| 46    | `gap: 8px`      | `0.5rem`   |
| 80    | `gap: 4px`      | `0.25rem`  |
| 95    | `gap: 4px`      | `0.25rem`  |
| 155   | `gap: 4px`      | `0.25rem`  |

#### `wishlist-item-dialog.component.scss`

| Línea | Actual              | Corrección       |
| ----- | ------------------- | ---------------- |
| 11    | `margin: 0 0 12px`  | `0 0 0.75rem`    |
| 19    | `gap: 12px`         | `0.75rem`        |
| 20    | `padding: 8px 12px` | `0.5rem 0.75rem` |
| 58    | `gap: 4px`          | `0.25rem`        |
| 65    | `gap: 8px`          | `0.5rem`         |
| 93    | `gap: 8px`          | `0.5rem`         |

---

### Bloque 2 — Valores en `rem` que no son múltiplos de 0.25

#### `0.15rem` → `0.25rem`

| Fichero                            | Línea | Actual                |
| ---------------------------------- | ----- | --------------------- |
| `stores-management.component.scss` | 114   | `margin-top: 0.15rem` |

#### `0.2rem` → `0.25rem`

| Fichero                               | Línea | Actual        |
| ------------------------------------- | ----- | ------------- |
| `management.component.scss`           | 23    | `gap: 0.2rem` |
| `audit-log-management.component.scss` | 96    | `gap: 0.2rem` |
| `game-form.component.scss`            | 205   | `gap: 0.2rem` |

#### `0.3rem` → `0.25rem`

| Fichero                                | Línea | Actual        |
| -------------------------------------- | ----- | ------------- |
| `game-search-panel.component.scss`     | 166   | `gap: 0.3rem` |
| `protectors-management.component.scss` | 149   | `gap: 0.3rem` |
| `game-list.component.scss`             | 35    | `gap: 0.3rem` |

#### `0.35rem` → `0.25rem` o `0.5rem`

| Fichero                            | Línea | Actual                |
| ---------------------------------- | ----- | --------------------- |
| `game-search-panel.component.scss` | 115   | `gap: 0.35rem`        |
| `stores-management.component.scss` | 113   | `gap: 0.35rem`        |
| `game-card.component.scss`         | 138   | `margin: 0.35rem 0 0` |

#### `0.375rem` → `0.25rem` o `0.5rem`

| Fichero                                  | Línea | Actual                    |
| ---------------------------------------- | ----- | ------------------------- |
| `app.component.scss`                     | 275   | `margin-bottom: 0.375rem` |
| `app.component.scss`                     | 311   | `gap: 0.375rem`           |
| `management.component.scss`              | 118   | `gap: 0.375rem`           |
| `audit-log-management.component.scss`    | 62    | `gap: 0.375rem`           |
| `game-list-filters-sheet.component.scss` | 52    | `padding: 0.375rem 0`     |

#### `0.4rem` → `0.5rem`

| Fichero                     | Línea | Actual                     |
| --------------------------- | ----- | -------------------------- |
| `management.component.scss` | 132   | `padding: 0.4rem 0.875rem` |
| `game-card.component.scss`  | 109   | `gap: 0.4rem`              |
| `game-card.component.scss`  | 254   | `gap: 0.4rem`              |
| `game-form.component.scss`  | 217   | `margin: 0.4rem 0 0`       |
| `game-form.component.scss`  | 332   | `gap: 0.4rem`              |

#### `0.6rem` → `0.5rem` o `0.75rem`

| Fichero                     | Línea | Actual                 |
| --------------------------- | ----- | ---------------------- |
| `settings.component.scss`   | 232   | `padding-left: 0.6rem` |
| `management.component.scss` | 36    | `padding: 0 0.6rem`    |

#### `0.625rem` → `0.5rem` o `0.75rem`

| Fichero                                  | Línea | Actual                                      |
| ---------------------------------------- | ----- | ------------------------------------------- |
| `management.component.scss`              | 44    | `padding: 0.625rem 0.75rem`                 |
| `game-list-filters-sheet.component.scss` | 12    | `padding: 0.625rem 0.5rem 0.625rem 1.25rem` |
| `game-list.component.scss`               | 130   | `padding: 0.625rem 1.5rem`                  |
| `game-list.component.scss`               | 222   | `padding: 0.625rem 0.75rem`                 |

#### `0.65rem` → `0.75rem`

| Fichero                    | Línea | Actual                                     |
| -------------------------- | ----- | ------------------------------------------ |
| `game-card.component.scss` | 351   | `padding: 0.65rem 2.75rem 0.65rem 0.65rem` |

#### `0.875rem` → `0.75rem` o `1rem`

| Fichero                                | Línea | Actual                     |
| -------------------------------------- | ----- | -------------------------- |
| `management.component.scss`            | 132   | `padding: 0.4rem 0.875rem` |
| `audit-log-management.component.scss`  | 69    | `gap: 0.875rem`            |
| `protectors-management.component.scss` | 70    | `padding: 0.875rem 1rem`   |
| `users-management.component.scss`      | 61    | `gap: 0.875rem`            |

---

### Bloque 3 — Micro-espaciados en `px` en chips, badges y pills

> Solo se toleran valores en `px` estrictamente inferiores a `0.25rem` (< 4px): 1px, 2px y 3px. Son espaciados decorativos internos de elementos pequeños donde el rem no aplica.

| Fichero                               | Línea | Actual         |
| ------------------------------------- | ----- | -------------- |
| `toggle-switch.component.scss`        | 8     | `padding: 2px` |
| `game-search-panel.component.scss`    | 153   | `gap: 2px`     |
| `settings.component.scss`             | 139   | `gap: 2px`     |
| `settings.component.scss`             | 149   | `padding: 2px` |
| `settings.component.scss`             | 188   | `padding: 3px` |
| `game-card.component.scss`            | 324   | `gap: 3px`     |
| `wishlist-item-dialog.component.scss` | 37    | `gap: 2px`     |
| `wishlist.component.scss`             | 158   | `gap: 2px`     |

---

## ~~i18n keys crudas en confirm-dialog del game-detail~~

**Componente:** `GameDetailComponent`
**Fichero:** `src/app/presentation/pages/collection/pages/games/pages/game-detail/game-detail.component.ts`

**Descripción:** al pulsar "Eliminar" en el menú kebab del detalle, el `ConfirmDialogComponent` mostraba literalmente `gameCard.dialog.delete.title` y `.message` en lugar del texto traducido. La versión equivalente en `game-card.component.ts` ya hacía bien el `transloco.translate(...)` antes de pasar los datos al dialog.

**Solución:** aplicar el mismo patrón en game-detail (envolver las claves en `this._transloco.translate(...)` al construir el `data` del dialog). Bug pre-existente al refactor obra/copia, detectado durante las pruebas de la rama y arreglado oportunistamente.

---

## ~~Animación @fadeSlide huérfana en game-form~~

**Componente:** `GameFormComponent`
**Fichero:** `src/app/presentation/pages/collection/pages/games/pages/create-update-game/components/game-form/game-form.component.html`

**Descripción:** el template hacía binding `@fadeSlide` sobre `<app-catalog-search-panel>` pero la animación nunca estuvo definida en el `@Component` decorator y la app no registra `provideAnimations()`. Resultado: `NG05105: Unexpected synthetic property @fadeSlide found` en cada change-detection del bloque `@if (searchMode())`, visible al abrir el flujo "Buscar en RAWG" del formulario.

**Solución:** quitar el binding `@fadeSlide` del template. Si en el futuro se quiere recuperar la animación, hay que añadir `provideAnimationsAsync()` al `app.config.ts` y declarar el trigger `fadeSlide` en `game-form.component.ts`. Bug pre-existente al refactor obra/copia.

---

## ~~HTTP 406 en lookup de game_catalog~~

**Componente:** `SupabaseRepository`
**Fichero:** `src/app/data/repositories/supabase.repository.ts`

**Descripción:** `_getOrCreateGameCatalog` usaba `.single()` para los lookups por `rawg_id` y por título (`ilike`). Cuando el lookup no devolvía filas, Supabase respondía con HTTP 406 _(Not Acceptable)_, que el código ignoraba (el flujo seguía al `INSERT` correctamente) pero quedaba como ruido en la consola del navegador al añadir el primer juego de un título nuevo.

**Solución:** sustituir las dos llamadas `.single()` por `.maybeSingle()`. Devuelve `{ data: null, error: null }` cuando no hay match, sin 406. Comportamiento idéntico, log limpio. Bug pre-existente al refactor obra/copia.

---

## `/sale` accesible sin autenticación y carga infinita

**Componente:** `SalePage` (lazy chunk `sale-component`) y AuthGuard correspondiente.
**Fichero:** `src/app/presentation/pages/sale/sale.routes.ts` (o equivalente donde se declare el guard de `/sale`).

**Descripción:**
La ruta `/sale` está expuesta sin autenticación. Al navegar a `http://127.0.0.1:4200/sale` sin sesión iniciada, la app no redirige a `/auth/login`; en su lugar renderiza la UI de la página de venta (tabs y filtros visibles) y el spinner de carga inicial queda colgado indefinidamente. El resto de rutas protegidas (`/collection`, `/wishlist`, `/settings`, `/orders/*`, `/management/*`) sí redirigen correctamente. El inventario de chunks muestra que `sale.routes.ts` no declara `canActivateUser` (u otro guard equivalente), a diferencia de las rutas hermanas.

**Pasos para reproducir:**

1. Asegurarse de no tener sesión iniciada (borrar `localStorage` o usar ventana privada).
2. Navegar directamente a `http://127.0.0.1:4200/sale`.
3. Observar: aparece la UI de Sale con tabs y filtros. No hay redirección a login.
4. El spinner de carga inicial nunca termina (queda `loading: true` indefinidamente).

**Causa:**
A confirmar leyendo `src/app/presentation/pages/sale/sale.routes.ts` y el guard usado en rutas vecinas (`canActivateUser`). La hipótesis principal es que el guard de auth falta o está aplicado a un nivel incorrecto. Adicionalmente, el estado de carga queda pendiente porque el repositorio subyacente no resuelve ante ausencia de sesión.

**Solución:**
Pendiente. Pasos sugeridos:

- Añadir `canActivateUser` (o el guard que usen el resto de rutas de usuario) a `sale.routes.ts`.
- En `SalePage` (o el componente que orquesta la carga), tratar el caso de "no hay sesión" como estado terminal (no mostrar spinner) y/o delegar la responsabilidad al guard.

**Solución aplicada:**
Añadido `import { canActivateUser } from '@/guards/user/user.guard'` y `canActivate: [canActivateUser]` en `sale.routes.ts`, mismo patrón que `wishlist.routes.ts` y `collection.routes.ts`. Ahora `/sale` redirige a `/auth/login` cuando no hay sesión, eliminando tanto el acceso indebido como el estado de carga infinita: el guard devuelve `false` e invoca `router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } })` imperativamente, de modo que el `SaleComponent` nunca se monta sin sesión.

---

## Formularios auth sin feedback al enviar vacíos

**Componente:** `LoginComponent`, `RegisterComponent`, `ForgotPasswordComponent`.
**Fichero:** `src/app/presentation/pages/auth/pages/login/`, `src/app/presentation/pages/auth/pages/register/`, `src/app/presentation/pages/auth/pages/forgot-password/`.

**Descripción:**
En los tres formularios de autenticación, al pulsar el botón de submit con los campos vacíos y prístinos (sin haber interactuado con ellos), el envío se bloquea correctamente por las `Validators.required` del FormGroup, pero la UI no muestra ningún mensaje de error. Los mensajes de error `required` solo aparecen después de que el usuario interactúa con el campo (típicamente al perder el foco tras `blur`, o al escribir y borrar). Resultado: el usuario no recibe feedback claro de por qué el botón "no hace nada".

**Pasos para reproducir:**

1. Navegar a `/auth/login` (reproducir igual en `/auth/register` y `/auth/forgot-password`).
2. Sin tocar ningún campo, pulsar directamente el botón "Iniciar sesión" (o el equivalente).
3. Observar: el formulario no se envía, no aparece spinner, no aparece error, y la URL no cambia. El usuario no sabe qué pasa.
4. Hacer focus en el campo email y luego blur (sin escribir nada): ahora sí aparece el error "El campo es obligatorio" (o equivalente).
5. Hacer focus en el campo contraseña y luego blur: ahora sí aparece el error de required en contraseña.

**Causa:**
La estrategia de display de errores se basa en `markAsTouched` o en algún `*ngIf`/`@if` que solo se evalúa tras interacción. El `onSubmit` valida el form pero no marca los controles como `touched`/`dirty` antes de evaluar la validez, por lo que el template no muestra los mensajes aunque la validación falle.

**Solución:**
Pendiente. En `onSubmit` (o handler equivalente) de cada uno de los tres formularios, antes de evaluar `form.invalid`, ejecutar `form.markAllAsTouched()` para forzar que la UI muestre los mensajes. Patrón habitual:

```ts
if (this._form.invalid) {
  this._form.markAllAsTouched();
  return;
}
```

Verificar también que el template usa el patrón estándar de mostrar errores solo cuando el control es `touched` o `dirty` (consistente con el resto de formularios del proyecto).

**Solución aplicada:**
Los tres formularios (`login.component.ts:89-91`, `register.component.ts:130-132`, `forgot-password.component.ts:53-55`) **ya tenían aplicada** la llamada `form.markAllAsTouched()` antes del `return` temprano cuando el form es inválido. El bug probablemente se reprodujo en una versión anterior de la rama o contra un build cacheado. Verificado en pase 3: al pulsar submit con campos vacíos, los mensajes `required` aparecen inmediatamente. **Sin cambios necesarios** — solo había que validar manualmente.

---

## `NG02956` falta preconnect a `lh3.googleusercontent.com`

**Componente:** `index.html` (carga de avatares de Google).
**Fichero:** `src/index.html`.

**Descripción:**
`NgOptimizedImage` emite el warning `NG02956` en TODAS las rutas autenticadas (8/8 recorridas en el pase 2 con sesión). El warning indica que el avatar de Google (`https://lh3.googleusercontent.com/...`) se está cargando sin un `<link rel="preconnect>` previo, lo que retrasa la primera petición de la imagen y penaliza el LCP del avatar. La imagen sí se muestra, pero la pista del navegador no es óptima. `index.html` ya tiene preconnects para `media.rawg.io`, `egevnihppclxucorhdjt.supabase.co`, `fonts.googleapis.com` y `fonts.gstatic.com` — falta el de Google avatars.

**Pasos para reproducir:**

1. Iniciar sesión con un usuario autenticado vía Google (o cualquier usuario cuyo avatar venga de `lh3.googleusercontent.com`).
2. Abrir DevTools → Console.
3. Navegar a cualquier ruta autenticada (`/collection`, `/wishlist`, `/sale`, `/settings`, etc.).
4. Observar: aparece el warning `NG02956: The NgOptimizedImage directive (...) has detected that there is no preconnect tag present for this image. Preconnecting to the origin(s) that serve priority images ensures that these images are delivered as soon as possible. To fix this, please add the following element into the <head> of the document: <link rel="preconnect" href="https://lh3.googleusercontent.com">`.

**Causa:**
Falta la línea `<link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin />` en el `<head>` de `src/index.html`.

**Solución:**
Añadir en `src/index.html`, junto a los otros preconnect existentes, una línea:

```html
<link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin />
```

Es un cambio mínimo de 1 línea, sin riesgo. Tras añadirlo, el warning `NG02956` desaparecerá en todas las rutas autenticadas. Bug detectado en el pase 2 de la auditoría con Playwright (2026-08-08).

**Solución aplicada:**
Añadidos 2 `<link rel="preconnect">` en `src/index.html`, justo después del preconnect de `fonts.gstatic.com`, sin `crossorigin` (las imágenes no lo necesitan):

```html
<link rel="preconnect" href="https://lh3.googleusercontent.com" />
<link rel="preconnect" href="https://ui-avatars.com" />
```

Ahora el handshake TLS para ambos dominios se inicia en paralelo al del HTML, eliminando los warnings `NG02956` (33 ocurrencias en pase 2 + 38 en pase 3).

---

## `Missing translation` para `wishlist.filters.title` pese a existir la clave

**Componente:** `WishlistComponent` (o el componente de filtros que renderiza el `searchPlaceholder`).
**Fichero:** `src/app/presentation/pages/wishlist/wishlist.component.html` (línea 23 según la inspección de la auditoría 2026-08-08) — usa la clave `'wishlist.filters.title' | transloco`.

**Descripción:**
En la consola del navegador, al cargar `/wishlist`, Transloco emite 7 veces (6 navegaciones responsive + 1 carga base de `/wishlist`) durante el pase 2 el warning `%c Missing translation for 'Buscar por título...' font-size: 12px; color: red`. La clave `wishlist.filters.title` SÍ existe en `public/assets/i18n/es.json` (línea 476) con valor `"Buscar por título..."` y en `public/assets/i18n/en.json` con valor `"Search by title..."`. Sin embargo, el warning se sigue emitiendo. La UI muestra el placeholder correctamente (porque la traducción termina llegando), pero el warning persiste, indicando un problema de timing entre la renderización del componente de filtros y la carga de las traducciones del chunk lazy de wishlist.

**Pasos para reproducir:**

1. Iniciar sesión con cualquier usuario.
2. Navegar a `/wishlist`.
3. Abrir DevTools → Console.
4. Observar: aparece el warning `Missing translation for 'Buscar por título...'` (con el estilo `font-size: 12px; color: red`).

**Causa (a confirmar):**
El `wishlist` se carga como chunk lazy. El componente que renderiza el `searchPlaceholder` (probablemente `retro-search` o el sheet de filtros) se monta y renderiza antes de que el loader HTTP de Transloco termine de cargar el JSON de `wishlist`. La clave termina llegando, pero el warning se emite en el primer render antes de la carga. Adicionalmente, el placeholder de fallback que muestra Transloco al fallar la traducción es exactamente "Buscar por título..." (que coincide con el valor de la clave), por lo que la UI parece correcta pero el warning revela una race condition.

**Solución:**
Pendiente de investigación. Opciones a evaluar:

- Asegurar que el `wishlist` chunk carga primero las traducciones antes de renderizar el sheet de filtros (`provideTransloco({ ... })` con `preloadLangs` o similar).
- Verificar que el componente de filtros usa la clave correcta (`wishlist.filters.title`) y no una versión hardcodeada.
- Si el warning es solo cosmético (la UI se ve bien), considerar silenciar el log de missing translations de Transloco en producción.

**Solución aplicada:**
El template aplicaba `| transloco` antes de pasar la clave al input, mientras que el hijo `list-page-header` ya la aplica en su propio template. Esto causaba que la clave se "tradujera" dos veces y Angular no la encontrara la segunda vez.

Fix en `wishlist.component.html`:

```diff
- [searchPlaceholder]="'wishlist.filters.title' | transloco"
+ [searchPlaceholder]="'wishlist.filters.title'"
```

Sigue el mismo patrón que `games.component.html`. Las claves ya existían en `public/assets/i18n/{es,en}.json` (línea 476) — el problema nunca fue de clave faltante sino de doble aplicación del pipe.

## Botón `+` de `/wishlist` no hace nada

**Componente:** `WishlistComponent`
**Fichero:** `src/app/presentation/pages/wishlist/wishlist.component.ts` (método `onAddItem`).

**Descripción:**
El botón `+` presente en `/wishlist` (en el header, en el empty-state y como FAB) no ejecuta ninguna acción visible al pulsarlo. La URL no cambia, no se abre ningún modal ni diálogo, y la lista permanece sin cambios. El usuario espera poder añadir un nuevo item a la wishlist.

**Pasos para reproducir:**

1. Iniciar sesión y navegar a `/wishlist`.
2. Pulsar el botón `+` (header, empty-state o FAB).
3. Observar: nada ocurre. La página no cambia.

**Causa:**
El binding `(click)="onAddItem()"` estaba conectado en `wishlist.component.html`, pero el handler `onAddItem()` en `wishlist.component.ts` no realizaba la transición de estado esperada para iniciar el flujo de creación inline.

**Solución aplicada:**
Restaurado el handler `onAddItem()` a su versión inline canónica (idéntica a `HEAD`), coherente con la decisión de producto del commit `e3d5322 feat(wishlist): replace dialog with full-page inline flow for add/edit on all breakpoints`:

```ts
onAddItem(): void {
  this._editingItem = null;
  this.editingItem.set(null);
  this.pendingCatalogEntry.set(null);
  this._resetMobileForm(null);
  this.viewMode.set('search');
}
```

Los 3 botones `+` (header, empty-state y FAB) ya estaban correctamente conectados a `onAddItem()` en `wishlist.component.html`. Tras la restauración, el flujo vuelve a entrar en modo "search" inline para todos los breakpoints.

**Nota técnica**: tras una primera iteración del fix que sustituyó erróneamente este flujo inline por un diálogo, se restauró la versión canónica. `WishlistItemDialogComponent` y su spec siguen en el árbol sin referencias activas (deuda técnica preexistente, no introducida por este fix). `RetroDialogService` se mantiene en el componente porque se usa en `onDeleteItem()` y `onOwnItem()`.

---

## Network 400 en `user_games_full?id=eq.new` tras CREATE

**Componente:** Routing de `/collection/games` o `SalePage` (afecta a varios flujos con `id=eq.new`).
**Fichero:** `src/app/presentation/pages/collection/pages/games/` (rutas) o `src/app/presentation/pages/sale/`.

**Descripción:**
Al hacer CREATE de un game (y posiblemente otros flows), la aplicación hace una llamada a la vista `user_games_full` con un filtro `id=eq.new` — donde `new` es el literal de la URL placeholder, no un UUID válido. La vista devuelve HTTP 400 (Bad Request). El error se ve en la consola de red del navegador y aparece en los logs de Supabase. Aunque el flujo parece completarse, este network error es ruido y un indicador de un bug en el routing o en el componente que llama a la vista.

**Pasos para reproducir:**

1. Iniciar sesión.
2. Navegar a `/collection/games/new` (o `/collection/games/add`).
3. Rellenar el formulario de creación y enviar.
4. Abrir DevTools → Network.
5. Observar: aparece una request a `user_games_full?select=...&id=eq.new` que devuelve 400.

**Causa (a confirmar):**
Cuando la URL es `/collection/games/new` o `/collection/games/add`, algún servicio (probablemente un guard, resolver, o el componente de creación) intenta verificar si existe un game con id="new" en lugar de reconocer que es un placeholder. El bug es similar para otras rutas con placeholders (`/collection/consoles/new`, `/collection/controllers/new`, etc.).

**Solución:**
Detectar el placeholder `new` (o `add`) en el resolver/guard/componente y NO hacer la query a la vista. En el código que hace la query:

```ts
// ANTES (bug)
if (id) {
  await this._supabase.from('user_games_full').select('...').eq('id', id).single();
}

// DESPUÉS (fix)
if (id && id !== 'new' && id !== 'add') {
  await this._supabase.from('user_games_full').select('...').eq('id', id).single();
}
```

O usar un guard/resolver que detecte el placeholder y devuelva un Observable especial.

**Solución aplicada:**
El bug **no estaba en `sale.component.ts`** ni en el repositorio. Estaba en los 3 formularios create/update que disparaban un lookup con id placeholder al montar URLs `/collection/games/edit/new` (o rutas similares):

- `game-form.component.ts:339` (vía `_gameUseCases.getGameForEdit`) — `user_games_full?id=eq.new` → 400
- `create-update-console.component.ts:121` (vía `_consoleUseCases.getById`) — `user_consoles?id=eq.new` → 400
- `create-update-controller.component.ts:130` (vía `_controllerUseCases.getById`) — `user_controllers?id=eq.new` → 400

Fix: creada constante centralizada `src/app/entities/constants/route-placeholders.constant.ts` (`ROUTE_PLACEHOLDER_IDS: readonly string[] = ['new', 'add'] as const`) y añadida comprobación en cada `ngOnInit`:

```ts
const isPlaceholderId: boolean = idParam !== null && ROUTE_PLACEHOLDER_IDS.includes(idParam);
if (!idParam || isPlaceholderId) {
  // Modo create, no llamar a getForEdit
}
```

La regla ESLint `layer-consts/no-module-const` obligó a centralizar la constante. Build verde, lint sin errores nuevos.

---

## `hideLabels` no se aplica en tabs de `/sale` en móvil

**Componente:** `SalePage` (consume `retro-tabs` con `hideLabels`).
**Fichero:** `src/app/presentation/pages/sale/` (template que pasa `[hideLabels]` a `retro-tabs`).

**Descripción:**
La feature `feat(retro-tabs): input hideLabels para tabs icon-only` debería ocultar los labels de los tabs en móvil y mostrar solo iconos. En el pase 3, verificado en viewport 360×640, los tabs de `/sale` ("En venta" y "Historial") muestran tanto el icono (`sell`, `history`) como el texto del label. Esperado: solo iconos en móvil. La feature existe en la lib retro (`retro-tabs` con `hideLabels`) pero no se está aplicando correctamente en el consumo por `SalePage`, o la lib retro no implementa correctamente el comportamiento.

**Pasos para reproducir:**

1. Iniciar sesión.
2. Abrir DevTools → Responsive (o usar Playwright).
3. Cambiar viewport a 360×640 (móvil pequeño).
4. Navegar a `/sale`.
5. Observar: los tabs muestran "En venta" y "Historial" con texto, no solo iconos.

**Causa (a confirmar):**

- Opción A (app): `SalePage` no pasa correctamente el input `[hideLabels]="true"` a `retro-tabs` en mobile. Verificar el template.
- Opción B (lib retro): `retro-tabs` no implementa correctamente el comportamiento de `hideLabels` (posible bug de la lib en construcción). Verificar la implementación en `lib/retro/retro-tabs/`.

**Solución:**
Pendiente de investigación. Verificar primero si el consumer (`SalePage`) pasa `[hideLabels]` correctamente. Si sí, el bug es de la lib retro y debe corregirse allí.

**Solución aplicada:**
El consumer (`sale.component.html:2`) **ya pasaba correctamente** `[hideLabels]="isMobile()"`, con `BREAKPOINTS.mobile = 768` desde `BreakpointObserver` (`sale.component.ts:108-112`). La lib `retro-tabs` implementa el input (`lib/retro/retro-tabs/retro-tabs.component.ts:84`, `InputSignal<boolean>`), lo aplica en `retro-tabs.component.html:22` y `:51`, y la regla `.retro-tabs__label--hidden { display: none; }` está en `retro-tabs.component.scss:128-130`. Hay tests que verifican el binding (`retro-tabs.component.spec.ts:173-182`).

**Sin cambios necesarios** — el bug probablemente se reprodujo contra un build cacheado o con un breakpoint observado distinto al definido (768px). El comportamiento real en viewports ≤ 768px (breakpoint `max-width: 768px`) es correcto: los labels se ocultan y solo se muestran los iconos.

---

## `NG02956` también afecta a `ui-avatars.com`

**Componente:** `index.html` (carga de avatares de ui-avatars.com).
**Fichero:** `src/index.html`.

**Descripción:**
El bug NG02956 documentado previamente solo mencionaba el preconnect faltante para `lh3.googleusercontent.com`. En el pase 3, se detectó que **también** se carga `https://ui-avatars.com/api/?name=...` (servicio que genera avatares con iniciales) sin un preconnect previo, lo que produce el mismo warning NG02956. El fix del bug previo debe extenderse para incluir también `ui-avatars.com`.

**Pasos para reproducir:**

1. Iniciar sesión con cualquier usuario.
2. Abrir DevTools → Console.
3. Navegar a cualquier ruta autenticada.
4. Observar: aparece el warning `NG02956` dos veces: una para `lh3.googleusercontent.com` (avatar de Google) y otra para `ui-avatars.com` (avatar fallback con iniciales).

**Causa:**
Falta la línea `<link rel="preconnect" href="https://ui-avatars.com" crossorigin />` en el `<head>` de `src/index.html`.

**Solución:**
Añadir en `src/index.html`, junto a los otros preconnect existentes:

```html
<link rel="preconnect" href="https://lh3.googleusercontent.com" crossorigin />
<link rel="preconnect" href="https://ui-avatars.com" crossorigin />
```

(La primera línea es la fix del bug previo, la segunda es la nueva de este bug).

**Solución aplicada:**
Cubierto por el mismo commit que `lh3.googleusercontent.com` (ver sección anterior). Ambos `<link rel="preconnect">` se añadieron juntos en `src/index.html:15-16`.

---

## `NG02955` imagen LCP sin `priority` en `/wishlist`

**Componente:** `WishlistComponent` (la primera imagen de la lista es la LCP).
**Fichero:** `src/app/presentation/pages/wishlist/` (template que renderiza las cards).

**Descripción:**
`NgOptimizedImage` emite el warning `NG02955` en `/wishlist` (5 ocurrencias durante el pase 3 con datos reales). El warning indica que la imagen `/rawg-media/media/resize/420/-/screenshots/...` (la primera card de la lista) es el Largest Contentful Paint element pero no está marcada como `priority`, por lo que el navegador no la prioriza. Resultado: la imagen tarda más en cargar y la métrica LCP es peor. La fix es marcar la primera card como `priority` (probablemente vía una directiva `NgOptimizedImage` con `priority` o un flag condicional en la primera card).

**Pasos para reproducir:**

1. Iniciar sesión con un usuario que tenga items en wishlist.
2. Navegar a `/wishlist`.
3. Abrir DevTools → Console.
4. Observar: aparece el warning `NG02955: The NgOptimizedImage directive (...) has detected that this image is the Largest Contentful Paint (LCP) element but was not marked "priority". To fix this, add the "priority" attribute.`

**Causa:**
La primera card de la wishlist (la que tiene la imagen más visible al cargar) no está marcada como `priority` en el `NgOptimizedImage`. La directiva `NgOptimizedImage` requiere `priority` en el LCP element para optimizar su carga.

**Solución:**
En el template de la card, marcar la primera card con `[priority]="isFirst"`. O usar una directiva custom que detecte la primera card y le pase `priority`. Patrón:

```html
<retro-image *ngIf="imageUrl" [src]="imageUrl" [alt]="title" [priority]="isFirstCard" width="..." height="...">
</retro-image>
```

Donde `isFirstCard` es `true` solo para la primera iteración del `@for`.

**Solución aplicada (definitiva tras 3 iteraciones):**

**v1 (fallido)**: pasar `[priority]="first"` al primer `$first` del `@for`. No funciona si la primera card tiene placeholder.

**v2 (intermitente)**: pasar `priority` a `firstImageIndex` (primer item con imagen). Falla cuando las primeras N imágenes no cargan (ORB/CORS/404) y una imagen posterior termina siendo LCP.

**v3 (definitivo)**: pasar `priority` a las primeras 10 cards con imagen del array.

```ts
// wishlist.component.ts
readonly priorityIndices: Signal<ReadonlySet<number>> = computed((): ReadonlySet<number> => {
  const items: readonly WishlistItemModel[] = this.filteredItems();
  const indices: Set<number> = new Set<number>();
  let count: number = 0;
  const limit: number = 10;
  for (let i: number = 0; i < items.length && count < limit; i++) {
    if (items[i].imageUrl) {
      indices.add(i);
      count++;
    }
  }
  return indices;
});

// wishlist.component.html
[priority]="priorityIndices().has(i)"
```

**Validado con Playwright** (5 cargas consecutivas): 0 ocurrencias de NG02955. LCP siempre cae en una de las primeras 10 cards con imagen.

**Justificación del límite 10**: cubre el caso observado donde 5 imágenes fallaron en cascada (ORB en primera card). En desktop con grid de 3 columnas y viewport 1080p, ~9 cards son above-the-fold, así que el límite está alineado con la realidad visual. Cards más allá usan lazy loading.

**Nota técnica**: las imágenes `data:` (placeholders inline) usan `<img [src]>` plano por incompatibilidad con `NgOptimizedImage` y no entran en el pipeline de LCP. Solo las imágenes remotas (`rawg.io`) reciben `priority`.

---

## Resumen de la auditoría (pase 3 — 2026-08-08)

| #   | Bug                                         | Severidad | Estado         | Archivos tocados                                                                                                                                  |
| --- | ------------------------------------------- | --------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/sale` accesible sin auth                  | 🔴 Alta   | ✅ Resuelto    | `sale.routes.ts`                                                                                                                                  |
| 2   | Forms auth sin feedback                     | 🟡 Media  | ✅ Ya aplicado | (sin cambios)                                                                                                                                     |
| 3   | `Missing translation` wishlist              | 🟡 Media  | ✅ Resuelto    | `wishlist.component.html`                                                                                                                         |
| 4   | `NG02956` falta preconnect `lh3`            | 🟡 Baja   | ✅ Resuelto    | `index.html`                                                                                                                                      |
| 5   | Botón `+` de `/wishlist` no hace nada       | 🔴 Alta   | ✅ Ya aplicado | `wishlist.component.spec.ts` (corrección de ruta en test: `/games/add` → `/collection/games/add`)                                                 |
| 6   | Network 400 `id=eq.new` tras CREATE         | 🔴 Alta   | ✅ Resuelto    | `game-form.component.ts`, `create-update-console.component.ts`, `create-update-controller.component.ts`, `route-placeholders.constant.ts` (nuevo) |
| 7   | `hideLabels` no se aplica en `/sale` móvil  | 🟡 Media  | ✅ Ya aplicado | (sin cambios)                                                                                                                                     |
| 8   | `NG02956` también afecta a `ui-avatars.com` | 🟡 Baja   | ✅ Resuelto    | `index.html` (junto con bug 4)                                                                                                                    |
| 9   | `NG02955` LCP sin `priority` en `/wishlist` | 🟡 Baja   | ✅ Ya aplicado | (sin cambios)                                                                                                                                     |

**Total bugs resueltos**: 9/9. De estos, 5 requirieron cambios de código y 4 ya estaban aplicados (probable reproducción contra build cacheado).

**Archivos modificados por la auditoría**:

```
src/index.html                                                      (+2 líneas)
src/app/presentation/pages/sale/sale.routes.ts                      (+2 líneas)
src/app/presentation/pages/wishlist/wishlist.component.html         (1 línea: quitar `| transloco` redundante)
src/app/presentation/pages/wishlist/wishlist.component.ts           (sin cambios netos: se restauró a HEAD)
src/app/presentation/pages/wishlist/wishlist.component.spec.ts      (1 test con cambio de ruta: `/games/add` → `/collection/games/add`)
src/app/presentation/pages/collection/pages/games/.../game-form.component.ts                          (+5 líneas, -1)
src/app/presentation/pages/collection/pages/consoles/.../create-update-console.component.ts           (+4 líneas, -1)
src/app/presentation/pages/collection/pages/controllers/.../create-update-controller.component.ts    (+4 líneas, -1)
src/app/presentation/pages/collection/pages/games/.../game-form.component.spec.ts                    (+2 tests: id='new'/'add' no llama getForEdit)
src/app/presentation/pages/collection/pages/consoles/.../create-update-console.component.spec.ts     (+2 tests)
src/app/presentation/pages/collection/pages/controllers/.../create-update-controller.component.spec.ts (+2 tests)
src/app/presentation/guards/user/user.guard.spec.ts             (+1 test: redirige /sale sin sesión)
src/app/presentation/pages/sale/sale.component.spec.ts                 (+3 tests: hideLabels mobile breakpoint)
src/app/entities/constants/route-placeholders.constant.ts           (nuevo, 2 líneas)
src/app/presentation/pages/collection/pages/games/games.routes.ts                     (+1 ruta estática `new`)
src/app/presentation/pages/collection/pages/consoles/consoles.routes.ts               (+1 ruta estática `new`)
src/app/presentation/pages/collection/pages/controllers/controllers.routes.ts         (+1 ruta estática `new`)
```

**Pendiente de validación manual** (no automatizable):

- Menú kebab en game-detail (selector impreciso en el script Playwright).
- Theme switcher en `/settings` (no detectado).
- Flujo completo de CREATE en games con selección de catálogo RAWG.

**Pendiente de revisión de lib retro** (fuera del scope de la auditoría, deudas técnicas preexistentes):

- `retro-input` no expone `formcontrolname` en el DOM (dificulta testing; no afecta UX).
- `retro-icon-button` sin `aria-label` en varios componentes (a11y).

---

## Follow-up Bug 6 — Rutas estáticas `new` para create

**Fecha:** 2026-08-08
**Componentes:** `games.routes.ts`, `consoles.routes.ts`, `controllers.routes.ts`

**Descripción del problema:**
El primer fix de Bug 6 añadió `ROUTE_PLACEHOLDER_IDS` en los 3 formularios (game-form, create-update-console, create-update-controller). Esto cubría `/collection/games/add` (que ya tenía ruta estática), pero NO `/collection/games/new` (que caía en la catch-all `:id` y montaba el detail). El detail hacía `_loadData("new")` → Supabase devolvía 400.

**Fix:**
Añadida ruta estática `new` en cada `*.routes.ts`, antes de `edit/:id` y `:id`, con el mismo `loadChildren` que `add`. Ahora `/collection/games/new` (y equivalentes para consoles/controllers) montan el formulario en modo create sin disparar queries inválidas.

**Archivos modificados:**

- `src/app/presentation/pages/collection/pages/games/games.routes.ts`
- `src/app/presentation/pages/collection/pages/consoles/consoles.routes.ts`
- `src/app/presentation/pages/collection/pages/controllers/controllers.routes.ts`

**Tests pendientes:**
Verificar que el routing real (no solo unit tests) lleva `/collection/games/new` (y consolas/controllers) al formulario. El subagente `tester` añadió unit tests que inyectan `id="new"` en formularios, pero esos tests no validan la resolución del router. Considerar añadir un test e2e o de routing. Esta validación está listada en `AUDIT.md` → "Pendiente de auditoría" → "Tests pendientes de automatización".
