# retro-data-row

Fila de datos estilo `ls -la`. Muestra LABEL (mono uppercase) a la izquierda, separador de puntos punteados, y VALUE (mono) a la derecha.

**Selector:** `retro-data-row` · **Standalone:** sí · **CVA:** no

## Cuándo usar / Cuándo NO usar

- Usar cuando: se necesita mostrar pares label/valor estáticos (ficha de detalle, metadatos de un juego, propiedades de un objeto).
- NO usar cuando: la fila necesita interactividad, acciones o zonas leading/trailing — en ese caso usar `retro-list-item`.

## API — Inputs

| Nombre       | Tipo Angular                            | Default     | Descripción                                                              |
| ------------ | --------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `label`      | `InputSignal<string> (required)`        | —           | Etiqueta del campo. Se muestra en uppercase en pantalla.                 |
| `value`      | `InputSignal<string \| number \| null>` | `null`      | Valor del campo. Si es `null`, se renderiza el `ng-content` en su lugar. |
| `icon`       | `InputSignal<string \| undefined>`      | `undefined` | Nombre del icono Material Icons mostrado junto al label. Opcional.       |
| `emphasized` | `InputSignal<boolean>`                  | `false`     | Si `true`, el valor se renderiza en tamaño y peso mayor (énfasis).       |

## Slots

| Selector    | Tipo esperado                | Descripción                                                               |
| ----------- | ---------------------------- | ------------------------------------------------------------------------- |
| _(default)_ | bloque libre (chips, stars…) | Visible solo cuando `value` es `null`. Sustituye al valor de texto plano. |

## Ejemplo mínimo

```html
<retro-data-row label="PLATFORM" [value]="game.platform" />
<retro-data-row label="ID" [value]="game.id" icon="badge" />
<retro-data-row label="RATING" [emphasized]="true" [value]="game.score" />

<!-- Valor complejo: ng-content cuando value es null -->
<retro-data-row label="RATING">
  <span class="stars">★★★★☆</span>
</retro-data-row>
```

## Gotchas

- En pantallas estrechas (< 480px) los puntos punteados se ocultan para evitar recortes; label y valor quedan alineados por grid sin separador visual.
- El slot default solo se proyecta cuando `value()` es `null`. Si se pasa `value` junto con contenido proyectado, el contenido proyectado queda oculto.
