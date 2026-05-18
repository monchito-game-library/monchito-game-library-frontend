# retro-tabs

Esta carpeta contiene **dos componentes funcionalmente distintos** con la misma estética Terminal Collector.

| Componente | Selector | Para qué |
|---|---|---|
| `RetroTabsComponent` + `RetroTabComponent` | `retro-tabs` + `retro-tab` | Tabs con contenido controlado (sin cambio de ruta). |
| `RetroRouterTabsComponent` | `retro-router-tabs` | Tabs de navegación basados en `routerLink`. |

## RetroTabsComponent (tabs controlados)

- **A11y:** APG tablist/tab/tabpanel, activación automática con Arrow keys.

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `selectedIndex` | `number` | `0` | Tab seleccionado inicialmente. |
| `ariaLabel` | `string \| undefined` | `undefined` | Label del tablist. |

### Outputs: `selectedIndexChange: number`.

### Slots: se proyectan `<retro-tab>`.

## RetroTabComponent

### Inputs: `label: string` (required), `icon?: string`.

### Contenido: envuelto en `<ng-template>` (lazy render).

## RetroRouterTabsComponent

- **Hace:** `<nav>` con `<a routerLink>` + indicador deslizante sincronizado con la ruta activa (ResizeObserver + MutationObserver).
- **No incluye `<router-outlet>`** — el padre debe colocarlo tras este componente.

### Inputs: `items: readonly LibRouterTabItemInterface[]` (required), `ariaLabel?: string`.

### Interface — LibRouterTabItemInterface (interfaces/)

```typescript
interface LibRouterTabItemInterface {
  readonly path: string;
  readonly label: string;    // clave transloco
  readonly icon?: string;
  readonly exact?: boolean;
}
```

## Ejemplo (router tabs)

```typescript
readonly navItems: readonly LibRouterTabItemInterface[] = [
  { path: 'games', label: 'collection.games', icon: 'sports_esports' },
  { path: 'hardware', label: 'collection.hardware', icon: 'memory' },
];
```

```html
<retro-router-tabs [items]="navItems" />
<router-outlet />
```
