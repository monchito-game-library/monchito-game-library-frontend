# retro-command-bar

Barra decorativa estilo terminal: `PATH $ --flag1 --flag2 ▋`. Solo visible en desktop ≥ 1024px.

## Componente — RetroCommandBarComponent

- **Selector:** `retro-command-bar`
- **Standalone:** sí
- **A11y:** `aria-hidden="true"` (puramente decorativa).

### Inputs

| Nombre | Tipo | Default | Descripción |
|---|---|---|---|
| `path` | `string` | `'monchito ~/library'` | Texto del prompt. |
| `flags` | `readonly string[]` | `[]` | Flags mostrados como `--flag`. |
| `cursor` | `boolean` | `true` | Cursor parpadeante al final. |

## Ejemplo

```html
<retro-command-bar path="monchito ~/games" [flags]="['list', 'verbose']" />
```
