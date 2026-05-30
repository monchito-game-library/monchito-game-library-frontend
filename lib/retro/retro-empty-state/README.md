# retro-empty-state

Estado vacío estilo terminal ASCII de la lib Terminal Collector. Muestra un bloque ASCII art fijo + título + subtítulo opcional + hint de prompt. Acepta botones de acción proyectados tras el hint.

**Selector:** `retro-empty-state` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: una lista o sección no tiene resultados que mostrar y se quiere comunicar el estado vacío al usuario con estilo terminal.
- NO usar cuando: el estado vacío forma parte de un proceso de carga — en ese caso mostrar `retro-spinner` mientras `loading()` sea `true` y reservar `retro-empty-state` para cuando la carga haya terminado con cero resultados.

## API — Inputs

| Nombre     | Tipo Angular                     | Default                     | Descripción                                                          |
| ---------- | -------------------------------- | --------------------------- | -------------------------------------------------------------------- |
| `title`    | `InputSignal<string> (required)` | —                           | Título principal del estado vacío. Se muestra en uppercase.          |
| `subtitle` | `InputSignal<string>`            | `''`                        | Subtítulo o descripción adicional. Oculto si es cadena vacía.        |
| `hint`     | `InputSignal<string>`            | `'$ try a different query'` | Hint en estilo prompt de terminal (fuente mono, color accent-green). |

## Slots

| Selector    | Tipo esperado         | Descripción                                             |
| ----------- | --------------------- | ------------------------------------------------------- |
| _(default)_ | botones u otro bloque | Acciones proyectadas tras el hint (ej. botón "AÑADIR"). |

## Ejemplo mínimo

```html
<!-- Mínimo: solo título -->
<retro-empty-state title="NO HAY RESULTADOS" />

<!-- Con subtítulo y hint personalizado -->
<retro-empty-state
  title="BIBLIOTECA VACÍA"
  subtitle="Aún no has añadido ningún juego."
  hint="$ get-started --add-game" />

<!-- Con acción proyectada -->
<retro-empty-state title="NO HAY JUEGOS" subtitle="Tu biblioteca está vacía.">
  <retro-button label="AÑADIR JUEGO" variant="primary" (clicked)="onAdd()" />
</retro-empty-state>
```

## Gotchas

- El bloque ASCII (`NO RESULTS / 0 RECORDS FOUND`) es fijo en el template y no es configurable vía input ni slot. Si se necesita un arte distinto, crear un componente derivado.
- `subtitle` solo se renderiza si no es cadena vacía (guard `@if (subtitle())`). Pasar `''` equivale a no pasarlo.
