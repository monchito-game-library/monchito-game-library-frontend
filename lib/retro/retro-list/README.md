# retro-list — Contenedor flex-column para listas Terminal Collector

Componente de solo layout: apila sus hijos en columna con un `gap` configurable. No gestiona estados (loading, vacío, error) — eso es responsabilidad del consumidor mediante `@if`/`@for`.

## Inputs

Ninguno.

## Outputs

Ninguno.

## Slots

| Slot | Descripción |
|---|---|
| Default | Ítems de la lista (típicamente `<retro-list-item>` o cualquier elemento hijo). |

## CSS custom properties

| Propiedad | Default | Descripción |
|---|---|---|
| `--retro-list-gap` | `0.5rem` | Espaciado entre ítems de la lista. |

## Ejemplos

### Uso básico

```html
<retro-list>
  @for (it of items(); track it.id; let i = $index) {
    <retro-list-item [interactive]="true" [staggered]="true" [style.--i]="i" (itemClicked)="onSelect(it)">
      {{ it.label }}
    </retro-list-item>
  }
</retro-list>
```

### Manejo de estados externo

```html
@if (loading()) {
  <retro-spinner />
} @else if (items().length === 0) {
  <retro-empty-state title="Sin resultados" />
} @else {
  <retro-list>
    @for (it of items(); track it.id) {
      <retro-list-item>{{ it.label }}</retro-list-item>
    }
  </retro-list>
}
```

## Contrato con retro-list-item

`<retro-list-item>` solo puede renderizarse dentro de un `<retro-list>`. Usarlo fuera lanza:

> RetroListItemComponent must be used inside a \<retro-list\> container.

`RetroListComponent` se auto-provee bajo el token interno `RETRO_LIST_PARENT` (no expuesto en la API pública). Este mecanismo permite en el futuro exponer configuración compartida (densidad, padding por defecto) sin cambiar la API externa.
