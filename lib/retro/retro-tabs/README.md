# retro-tabs

Unified tabs component supporting two operation modes: **router mode** (navigation between child routes with `<a routerLink>`) and **local mode** (content on the same page with `<button role="tab">`). Both modes share the same full-width sliding neon indicator.

**Selector:** `retro-tabs` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: switching between views within the same page (local mode) or navigating between child routes (router mode).
- Do NOT use when: guiding the user through sequential steps with per-step validation — consider a dedicated stepper instead.

## API — Inputs

| Name            | Angular type                                        | Default     | Description                                                                   |
| --------------- | --------------------------------------------------- | ----------- | ----------------------------------------------------------------------------- |
| `items`         | `InputSignal<readonly RetroTabItem[] \| undefined>` | `undefined` | Navigation items. When provided, activates router mode with `<a routerLink>`. |
| `selectedIndex` | `InputSignal<number>`                               | `0`         | Initial active tab index. Applies only in local mode.                         |
| `ariaLabel`     | `InputSignal<string \| undefined>`                  | `undefined` | Aria label for the tab container (`<nav>` or `[role=tablist]`).               |

## API — Outputs

| Name                  | Angular type               | Description                                             |
| --------------------- | -------------------------- | ------------------------------------------------------- |
| `selectedIndexChange` | `OutputEmitterRef<number>` | Emits the selected tab index. Only emits in local mode. |

## Public Signals

| Name           | Angular type      | Description                                          |
| -------------- | ----------------- | ---------------------------------------------------- |
| `isRouterMode` | `Signal<boolean>` | `true` when items are provided (router mode active). |
| `activeIndex`  | `Signal<number>`  | Active tab index in local mode.                      |

## Subcomponent — `retro-tab`

Child component for local mode. Content must be wrapped in an `<ng-template>` to guarantee lazy rendering.

**Selector:** `retro-tab` · **Standalone:** yes · **CVA:** no

### API — Inputs (`retro-tab`)

| Name    | Angular type                       | Default     | Description                                                       |
| ------- | ---------------------------------- | ----------- | ----------------------------------------------------------------- |
| `label` | `InputSignal<string> (required)`   | —           | Tab label text.                                                   |
| `icon`  | `InputSignal<string \| undefined>` | `undefined` | Material Icons icon name to display next to the label (optional). |

The `id` property is read-only (auto-generated, not an input).

## Exported Types

- `RetroTabItem` — interface for router mode:

```typescript
interface RetroTabItem {
  readonly path: string; // Route the link navigates to
  readonly label: string; // Label text (transloco key)
  readonly icon?: string; // Material Icons icon name (optional)
  readonly exact?: boolean; // Exact route match to mark as active
}
```

## Minimal example

**Router mode:**

```typescript
readonly navItems: readonly RetroTabItem[] = [
  { path: '/collection', label: 'collection.overview', icon: 'home', exact: true },
  { path: '/collection/games', label: 'collection.games', icon: 'sports_esports' },
];
```

```html
<retro-tabs [items]="navItems" ariaLabel="Collection navigation" /> <router-outlet />
```

**Local mode:**

```typescript
readonly activeTab = signal(0);
```

```html
<retro-tabs [selectedIndex]="activeTab()" (selectedIndexChange)="activeTab.set($event)">
  <retro-tab label="Sales" icon="sell">
    <ng-template>
      <!-- Sales tab content -->
    </ng-template>
  </retro-tab>
  <retro-tab label="Purchases" icon="shopping_cart">
    <ng-template>
      <!-- Purchases tab content -->
    </ng-template>
  </retro-tab>
</retro-tabs>
```

## Gotchas

- **Unique IDs with static counter**: `retro-tab` generates its `id` using a monotonic static counter (`retro-tab-1`, `retro-tab-2`…). The counter does not reset between tests; in SSR or with multiple instances on the same page, IDs are always unique.
- **Index clamping**: both `selectedIndex` and the programmatic `select(n)` method clamp the value to `[0, tabs.length - 1]`. An out-of-bounds index activates the tab closest to the limit.
- **MutationObserver scoped to `childList`**: the observer that updates the indicator only listens for addition/removal of direct children of `.retro-tabs__list`; it does not observe attribute changes or deep descendants.
- **Router mode on mobile**: the tab list is horizontally scrollable on touch devices (`overflow-x: auto` with a hidden scrollbar).
- **`prefers-reduced-motion`**: the sliding indicator transition and the neon text-shadow on the active tab are disabled.
