# retro-tabs

Componente de tabs unificado con selector `<retro-tabs>` que soporta dos modos de operación.

| Modo | Activación | Elemento generado | Casos de uso |
|---|---|---|---|
| **Router** | Pasar `[items]` | `<a routerLink>` en `<nav>` | Navegación entre rutas hijas |
| **Local** | Proyectar `<retro-tab>` | `<button role="tab">` en `<div role="tablist">` | Contenido en la misma página |

Ambos modos comparten el mismo indicador neón deslizante full-width.

## RetroTabsComponent

- **A11y (modo local):** APG tablist/tab/tabpanel, activación automática con Arrow keys.
- **A11y (modo router):** `<nav>` + `aria-current="page"` en el link activo.
- **Indicador:** posicionado con `ResizeObserver` + `MutationObserver` (solo `childList`, sin escuchar cambios de clase de descendientes), animado con CSS custom properties `--ind-left` / `--ind-width`.
- **Clamp de índice:** `selectedIndex` y el método programático `select(n)` clampean el valor al rango `[0, tabs.length - 1]`; un valor fuera de bounds activa el último tab disponible.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `items` | `readonly RetroTabItem[] \| undefined` | `undefined` | Items de navegación. Presencia activa el modo router. |
| `selectedIndex` | `number` | `0` | Tab activo inicial. Solo aplica en modo local. |
| `ariaLabel` | `string \| undefined` | `undefined` | Label aria del contenedor de tabs. |

### Outputs

| Nombre | Tipo | Descripción |
|---|---|---|
| `selectedIndexChange` | `number` | Índice del tab seleccionado. Solo emite en modo local. |

### Slots

En modo local se proyectan instancias de `<retro-tab>`.

## RetroTabComponent

Componente hijo para modo local. No tiene template propio; el contenido debe pasarse dentro de un `<ng-template>` (lazy render).

### Inputs: `label: string` (required), `icon?: string`.

## Interface — RetroTabItem

```typescript
interface RetroTabItem {
  readonly path: string;      // Ruta a la que navega el link
  readonly label: string;     // Texto del label (clave de transloco)
  readonly icon?: string;     // Nombre del icono Material Icons (opcional)
  readonly exact?: boolean;   // Coincidencia exacta de ruta para marcar como activo
}
```

## Ejemplo modo router

```typescript
readonly navItems: readonly RetroTabItem[] = [
  { path: '/collection', label: 'collection.overview', icon: 'home', exact: true },
  { path: '/collection/games', label: 'collection.games', icon: 'sports_esports' },
];
```

```html
<retro-tabs [items]="navItems" ariaLabel="Navegación colección" />
<router-outlet />
```

## Ejemplo modo local

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
