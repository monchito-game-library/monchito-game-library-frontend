# RetroEllipsisTooltipDirective

Directiva que muestra el texto completo de un elemento mediante tooltip
**solo cuando su contenido se trunca horizontalmente** (`scrollWidth - clientWidth > 1`).

Compone `RetroTooltipDirective` automáticamente en el host mediante `hostDirectives`,
por lo que no es necesario añadir `#ref` ni `[retroTooltip]` en el template.

## Selector

`[retroEllipsisTooltip]`

`exportAs: 'retroEllipsisTooltip'`

## Cómo se usa

El elemento debe tener ya el CSS de truncado
(`white-space: nowrap; overflow: hidden; text-overflow: ellipsis`).
Basta con añadir el atributo al host:

```html
<span class="item-name" retroEllipsisTooltip>{{ longText }}</span>
```

Cuando el texto cabe, `tooltipText` emite `''` y la tooltip no se muestra.
Cuando el texto se trunca, emite el contenido completo recortado y la tooltip
lo muestra al hacer hover o foco.

## API pública

| Miembro       | Tipo             | Descripción                                                                                           |
| ------------- | ---------------- | ----------------------------------------------------------------------------------------------------- |
| `tooltipText` | `Signal<string>` | Señal readonly con el contenido completo del host si hay overflow horizontal, `''` en caso contrario. |

## Restricciones

- El host debe contener **texto plano en una sola línea** con layout horizontal.
- Solo se detecta **overflow horizontal**; no se activa con overflow vertical.
- La tolerancia de detección es de **1 px** (`scrollWidth - clientWidth > 1`).

## Detección de overflow

Recalcula con `ResizeObserver` (envuelto en `requestAnimationFrame` para evitar
"ResizeObserver loop limit exceeded"), en cada `mouseenter` / `focusin` y tras
el primer render (`afterNextRender`).
