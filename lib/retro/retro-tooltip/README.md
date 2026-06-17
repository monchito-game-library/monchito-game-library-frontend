# retro-tooltip

Native tooltip directive without CDK Overlay. Creates a `<div class="retro-tooltip">` in `document.body` with `position: fixed` calculated from `getBoundingClientRect()`.

**Selector:** `[retroTooltip]` · **Standalone:** yes · **CVA:** no

## When to use / When NOT to use

- Use when: contextual help text needs to be displayed on hover or focus over an interactive element.
- Do NOT use when: the content is rich (icons, buttons, HTML) — the directive only accepts plain text.

## API — Inputs

| Name                | Angular type          | Default | Description                                                                                                                                                |
| ------------------- | --------------------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `retroTooltip`      | `InputSignal<string>` | `''`    | Tooltip text. If empty, nothing is displayed. When `RETRO_TOOLTIP_TEXT` token is provided in the injector, the token value takes priority over this input. |
| `retroTooltipDelay` | `InputSignal<number>` | `500`   | Delay in ms before showing the tooltip after mouseenter/focus.                                                                                             |

## Minimal example

```html
<retro-icon-button
  icon="info"
  ariaLabel="More information"
  [retroTooltip]="'Click to see details'"
  [retroTooltipDelay]="300" />
```

## Token RETRO_TOOLTIP_TEXT

| Name                 | Type                             | Description                                                                                                                                                                                                    |
| -------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `RETRO_TOOLTIP_TEXT` | `InjectionToken<Signal<string>>` | Token de inyección opcional. Una directiva externa puede proveerlo en el mismo elemento host para suministrar el texto dinámicamente. Cuando está presente, tiene **prioridad** sobre el input `retroTooltip`. |

Use this token when the tooltip text is controlled programmatically by a companion directive rather than being set directly in the template. `RetroEllipsisTooltipDirective` is an example: it provides this token automatically so the tooltip only appears when the text overflows.

```ts
// Example: companion directive providing dynamic text via the token
providers: [
  {
    provide: RETRO_TOOLTIP_TEXT,
    useFactory: (dir: MyDirective) => dir.tooltipText, // Signal<string>
    deps: [MyDirective]
  }
];
```

## Gotchas

- **Positioned with `requestAnimationFrame`**: the panel is positioned twice — immediately on creation and after the first layout frame to use real dimensions. This prevents position flickering that would occur when positioning before the panel has a size.
- **Active scroll/resize listeners while visible**: while the tooltip is visible, the directive subscribes to `scroll` (capture) and `resize` listeners on `window` to reposition it. They are automatically cleaned up when the tooltip is hidden.
- **Focus on touch + external keyboard**: the tooltip appears on `focusin` regardless of whether the device supports hover. This covers the case of touch devices with an external keyboard connected. On touch devices without a keyboard, hover (`mouseenter`) is ignored because `@media (hover: hover)` does not match.
- **Default position bottom-center**: if the tooltip does not fit below the host (overflows viewport), it automatically moves to top-center.
- **Accessibility**: adds `role="tooltip"` to the panel and `aria-describedby` to the host element while visible. Both attributes are removed when hidden.
- The tooltip is destroyed in `ngOnDestroy` — no orphan elements are left if the host is unmounted while the tooltip is visible.
