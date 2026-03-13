# Componentes Ad-hoc

Componentes reutilizables propios del proyecto, independientes de cualquier página.
Todos son **standalone** y **OnPush**.

Ubicación: `src/app/presentation/components/ad-hoc/`

---

## `SkeletonComponent`

Selector: `app-skeleton`

Bloque de carga con animación shimmer. Reemplaza cualquier elemento mientras su contenido está cargando.

### Inputs

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `width` | `string` | `'100%'` | Ancho del bloque (CSS: `'120px'`, `'100%'`) |
| `height` | `string` | `'1rem'` | Alto del bloque (CSS: `'1rem'`, `'48px'`) |
| `borderRadius` | `string` | `'8px'` | Radio del borde. Usar `'50%'` para círculos |

### Uso

```html
<!-- Texto genérico -->
<app-skeleton width="200px" height="1rem" />

<!-- Avatar circular -->
<app-skeleton width="40px" height="40px" borderRadius="50%" />

<!-- Imagen rectangular -->
<app-skeleton width="100%" height="120px" borderRadius="12px" />
```

---

## `ToggleSwitchComponent`

Selector: `app-toggle-switch`

Switch personalizado con icono interior. Implementa `ControlValueAccessor`, por lo que funciona tanto con `formControlName` en un formulario reactivo como de forma standalone con binding manual.

### Inputs

| Input | Tipo | Default | Descripción |
|---|---|---|---|
| `checked` | `boolean` | `false` | Estado inicial. Solo activo en modo standalone (sin `formControlName`) |
| `icon` | `string` | `'remove'` | Icono Material cuando el toggle está **apagado** |
| `iconChecked` | `string` | `'check'` | Icono Material cuando el toggle está **encendido** |
| `disabled` | `boolean` | `false` | Desactiva la interacción. Solo activo en modo standalone |

### Outputs

| Output | Tipo | Descripción |
|---|---|---|
| `changed` | `boolean` | Emite el nuevo valor tras cada interacción del usuario |

### Modo standalone (sin formulario)

```html
<app-toggle-switch
  [checked]="isDarkTheme"
  icon="light_mode"
  iconChecked="dark_mode"
  (changed)="onThemeToggle($event)" />
```

### Modo formulario reactivo (`formControlName`)

```html
<app-toggle-switch formControlName="platinum" icon="emoji_events" iconChecked="emoji_events" />
<app-toggle-switch formControlName="is_favorite" icon="favorite" iconChecked="favorite" />
```

En este modo `[checked]` y `[disabled]` son ignorados — Angular Forms controla el estado directamente a través de `ControlValueAccessor`.
