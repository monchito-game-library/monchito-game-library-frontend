# retro-segmented

Control de selección segmentada exclusiva (equivalente a un `radiogroup`) con estética terminal/neón. Permite al usuario elegir una opción de un conjunto de segmentos; solo puede haber un segmento activo a la vez.

**Selector:** `retro-segmented` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita seleccionar una opción de un conjunto pequeño y fijo de alternativas mutuamente exclusivas, visible de un vistazo.
- NO usar cuando: el conjunto de opciones es grande o dinámico — considerar `retro-select` en su lugar.

## API — Inputs

| Nombre      | Tipo Angular                                              | Default     | Descripción                                                                 |
| ----------- | --------------------------------------------------------- | ----------- | --------------------------------------------------------------------------- |
| `options`   | `InputSignal<readonly RetroSegmentedOption<T>[]>` (required) | —        | Lista de opciones a mostrar como segmentos.                                 |
| `value`     | `InputSignal<T \| undefined>`                             | `undefined` | Valor del segmento actualmente seleccionado.                                |
| `ariaLabel` | `InputSignal<string \| undefined>`                        | `undefined` | Etiqueta `aria-label` para el contenedor `[role=radiogroup]`.               |
| `disabled`  | `InputSignal<boolean>`                                    | `false`     | Cuando es `true`, el control no responde a interacciones del usuario.       |

## API — Outputs

| Nombre    | Tipo Angular          | Descripción                                                              |
| --------- | --------------------- | ------------------------------------------------------------------------ |
| `changed` | `OutputEmitterRef<T>` | Emite el valor del segmento seleccionado al hacer clic o navegar por teclado. |

## Tipos exportados

- `RetroSegmentedOption<T>` — interfaz para cada opción del control:

```typescript
interface RetroSegmentedOption<T = string> {
  readonly value: T;     // Valor asociado a la opción
  readonly label: string; // Texto visible en el segmento
  readonly icon?: string; // Nombre del icono Material Icons (opcional)
}
```

## Ejemplo básico (tipo `string`)

```typescript
readonly viewOptions: readonly RetroSegmentedOption[] = [
  { value: 'grid', label: 'Cuadrícula', icon: 'grid_view' },
  { value: 'list', label: 'Lista', icon: 'list' },
];

selected = signal<string>('grid');
```

```html
<retro-segmented
  [options]="viewOptions"
  [value]="selected()"
  ariaLabel="Modo de vista"
  (changed)="selected.set($event)"
/>
```

## Ejemplo con tipo genérico distinto de `string`

```typescript
type SortOrder = 'asc' | 'desc' | 'relevance';

readonly sortOptions: readonly RetroSegmentedOption<SortOrder>[] = [
  { value: 'relevance', label: 'Relevancia' },
  { value: 'asc',       label: 'A → Z' },
  { value: 'desc',      label: 'Z → A' },
];

sortOrder = signal<SortOrder>('relevance');
```

```html
<retro-segmented
  [options]="sortOptions"
  [value]="sortOrder()"
  ariaLabel="Orden de resultados"
  (changed)="sortOrder.set($event)"
/>
```

## Semántica ARIA y navegación por teclado

El contenedor recibe `role="radiogroup"` y cada segmento `role="radio"` con `aria-checked` reflejo del estado de selección. Se aplica **roving tabindex**: solo el segmento activo (o el primero si no hay valor) tiene `tabindex="0"`; el resto tienen `tabindex="-1"`.

| Tecla                        | Acción                                          |
| ---------------------------- | ----------------------------------------------- |
| `ArrowRight` / `ArrowDown`   | Siguiente segmento (con wrap-around) y selección automática. |
| `ArrowLeft` / `ArrowUp`      | Segmento anterior (con wrap-around) y selección automática. |
| `Home`                       | Primer segmento y selección automática.         |
| `End`                        | Último segmento y selección automática.         |

La navegación sigue el patrón APG de **activación automática**: mover el foco equivale a seleccionar. Cuando el control está deshabilitado, las interacciones de teclado y ratón no producen efecto.
