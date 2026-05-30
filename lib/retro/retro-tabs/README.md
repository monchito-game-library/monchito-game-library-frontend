# retro-tabs

Componente de tabs unificado con soporte para dos modos de operación: **modo router** (navegación entre rutas hijas con `<a routerLink>`) y **modo local** (contenido en la misma página con `<button role="tab">`). Ambos modos comparten el mismo indicador neón deslizante full-width.

**Selector:** `retro-tabs` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita cambiar entre vistas dentro de la misma página (modo local) o navegar entre rutas hijas (modo router).
- NO usar cuando: se necesita guiar al usuario a través de pasos secuenciales con validación por paso — considerar un stepper dedicado en su lugar.

## API — Inputs

| Nombre          | Tipo Angular                                        | Default     | Descripción                                                                |
| --------------- | --------------------------------------------------- | ----------- | -------------------------------------------------------------------------- |
| `items`         | `InputSignal<readonly RetroTabItem[] \| undefined>` | `undefined` | Items de navegación. Si se pasan, activa modo router con `<a routerLink>`. |
| `selectedIndex` | `InputSignal<number>`                               | `0`         | Índice del tab activo inicial. Solo aplica en modo local.                  |
| `ariaLabel`     | `InputSignal<string \| undefined>`                  | `undefined` | Label aria para el contenedor de tabs (`<nav>` o `[role=tablist]`).        |

## API — Outputs

| Nombre                | Tipo Angular               | Descripción                                                     |
| --------------------- | -------------------------- | --------------------------------------------------------------- |
| `selectedIndexChange` | `OutputEmitterRef<number>` | Emite el índice del tab seleccionado. Solo emite en modo local. |

## Señales públicas

| Nombre         | Tipo Angular      | Descripción                                       |
| -------------- | ----------------- | ------------------------------------------------- |
| `isRouterMode` | `Signal<boolean>` | `true` si hay items pasados (modo router activo). |
| `activeIndex`  | `Signal<number>`  | Índice del tab activo en modo local.              |

## Subcomponente — `retro-tab`

Componente hijo para modo local. El contenido debe pasarse envuelto en un `<ng-template>` para garantizar lazy render.

**Selector:** `retro-tab` · **Standalone:** sí · **CVA:** no

### API — Inputs de `retro-tab`

| Nombre  | Tipo Angular                       | Default     | Descripción                                                          |
| ------- | ---------------------------------- | ----------- | -------------------------------------------------------------------- |
| `label` | `InputSignal<string> (required)`   | —           | Texto del label del tab.                                             |
| `icon`  | `InputSignal<string \| undefined>` | `undefined` | Nombre del icono Material Icons a mostrar junto al label (opcional). |

La propiedad `id` es de solo lectura (generada automáticamente, no es un input).

## Tipos exportados

- `RetroTabItem` — interfaz para modo router:

```typescript
interface RetroTabItem {
  readonly path: string; // Ruta a la que navega el link
  readonly label: string; // Texto del label (clave de transloco)
  readonly icon?: string; // Nombre del icono Material Icons (opcional)
  readonly exact?: boolean; // Coincidencia exacta de ruta para marcar como activo
}
```

## Ejemplo mínimo

**Modo router:**

```typescript
readonly navItems: readonly RetroTabItem[] = [
  { path: '/collection', label: 'collection.overview', icon: 'home', exact: true },
  { path: '/collection/games', label: 'collection.games', icon: 'sports_esports' },
];
```

```html
<retro-tabs [items]="navItems" ariaLabel="Navegación colección" /> <router-outlet />
```

**Modo local:**

```typescript
readonly activeTab = signal(0);
```

```html
<retro-tabs [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)">
  <retro-tab label="Ventas" icon="sell">
    <ng-template>
      <!-- contenido del tab Ventas -->
    </ng-template>
  </retro-tab>
  <retro-tab label="Compras" icon="shopping_cart">
    <ng-template>
      <!-- contenido del tab Compras -->
    </ng-template>
  </retro-tab>
</retro-tabs>
```

## Gotchas

- **IDs únicos con contador estático**: `retro-tab` genera su `id` con un contador estático monotónico (`retro-tab-1`, `retro-tab-2`…). El contador no se resetea entre tests; en SSR o en múltiples instancias en la misma página los IDs son siempre únicos.
- **Clamp de índice**: tanto `selectedIndex` como el método programático `select(n)` clampean el valor al rango `[0, tabs.length - 1]`. Un índice fuera de bounds activa el tab más cercano al límite.
- **MutationObserver acotado a `childList`**: el observer que actualiza el indicador solo escucha adición/eliminación de nodos hijos directos de `.retro-tabs__list`; no observa cambios de atributos ni descendientes profundos.
- **Modo router en mobile**: la lista de tabs es scrollable horizontalmente en dispositivos táctiles (`overflow-x: auto` con scrollbar oculta).
- **`prefers-reduced-motion`**: la transición del indicador deslizante y el text-shadow neón del tab activo se desactivan.
