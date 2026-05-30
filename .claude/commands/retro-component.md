Genera un componente nuevo en `lib/retro/` siguiendo el patrón de la librería.

Argumento: $ARGUMENTS — nombre del componente sin prefijo `retro-` en kebab-case (ej: `badge`, `progress-bar`, `tooltip`). El componente final se llamará `retro-<nombre>`.

## Reglas estructurales obligatorias

- Carpeta raíz: `lib/retro/retro-<nombre>/`.
- En la raíz de la carpeta **solo** pueden vivir estos ficheros:
  - `retro-<nombre>.component.ts`
  - `retro-<nombre>.component.html`
  - `retro-<nombre>.component.scss`
  - `retro-<nombre>.component.spec.ts`
  - `retro-<nombre>.types.ts` (solo si el componente expone tipos públicos: variants, sizes, modes, etc.)
  - `README.md`
- Todo lo demás (componentes hijos, directivas, interfaces, constantes, tokens) va en subcarpetas: `components/retro-<nombre>-xxx/`, `directive/`, `interfaces/`, `constantes/`, `tokens/`.
- `lib/retro/` **no puede importar nada de `src/`** ni usar los aliases `@/*`. Solo `@retro/*`, `@retro/testing/*` o paquetes npm. Esta regla está enforzada por ESLint.

## Convenciones del componente (.component.ts)

- `standalone: true`, `changeDetection: ChangeDetectionStrategy.OnPush`.
- Selector exacto: `retro-<nombre>`.
- Inputs con `input<T>()` o `input.required<T>()`, tipados explícitamente como `InputSignal<T>`.
- Outputs con `output<T>()`, tipados explícitamente como `OutputEmitterRef<T>`.
- Signals computados con `computed<T>()`, tipados como `Signal<T>`.
- Campos y métodos `private` con prefijo `_` (incluidos los `private readonly` de inyección).
- Tipos explícitos en todas las declaraciones (nunca inferencia para `signal`, `inject`, `computed`).
- JSDoc obligatorio en:
  - Encabezado de la clase (qué hace, slots disponibles, comportamiento en mobile si aplica).
  - Cada input, output y signal público (una línea).
  - Cada método público y privado (excepto lifecycle hooks: `ngOnInit`, `ngOnDestroy`).
- Orden dentro de la clase:
  1. Inyecciones privadas (`private readonly _...`)
  2. Variables privadas
  3. Variables públicas readonly
  4. Signals públicos (inputs primero, luego computed/writable)
  5. Outputs
  6. Lifecycle hooks
  7. Métodos públicos (handlers `onXxx`)
  8. Métodos privados (`_xxx`)

## Convenciones del template (.component.html)

- Clase BEM con bloque `retro-<nombre>`, elementos `retro-<nombre>__elemento`, modificadores `retro-<nombre>--modificador` aplicados con `[class.retro-<nombre>--xxx]="condicion()"`.
- Slots con `<ng-content select="[slot=xxx]" />` y nombres semánticos (`start`, `end`, `header`, `footer`).
- Atributos ARIA condicionales según interactividad.

## Convenciones de estilos (.component.scss)

- `:host { display: contents; }` salvo que el componente necesite ser un contenedor con dimensiones propias.
- Espaciados en `rem`, múltiplos de `0.25rem` (excepción tolerada: micro-espaciados decorativos en `px`).
- Clases completas dentro de bloques, **nunca** `&__elemento`. Los modificadores `&--modificador` sí pueden usar `&`.
- Custom properties con prefijo `--retro-<nombre>-xxx` para tokens públicos consumibles desde fuera.
- Bloques `@media` al final del fichero, con comentario separador del breakpoint.

## Convenciones de tipos (.types.ts)

Solo si el componente expone variantes/tamaños/modos públicos. Cada tipo lleva JSDoc breve.

## Convenciones del spec (.component.spec.ts)

- `TestBed.configureTestingModule({ imports: [RetroXxxComponent] })`.
- Un `it` por input/variante/modificador relevante: comprueba la presencia de la clase BEM correspondiente.
- Si hay outputs: un `it` que dispara la acción y verifica `emit`.
- Si hay slots: subdescribe `'named slots'` con `TestHost` por slot que comprueba la proyección.
- Si hay estados deshabilitados/loading: un `it` por estado.
- Cobertura objetivo: 90% (threshold de la lib).

## README.md inicial

Estructura obligatoria (mismo orden):

```markdown
# retro-<nombre>

<Descripción de 1-2 líneas: qué es, comportamiento clave, breakpoints relevantes.>

## Componente — RetroXxxComponent

- **Selector:** `retro-<nombre>`
- **Standalone:** sí

### Inputs

| Nombre | Tipo | Default | Descripción |
| ------ | ---- | ------- | ----------- |
| ...    | ...  | ...     | ...         |

### Outputs

| Nombre | Tipo | Descripción |
| ------ | ---- | ----------- |
| ...    | ...  | ...         |

### Slots / ng-content

- `[slot=xxx]`: descripción.
- Default (si aplica): descripción del contenido proyectado.

### Types

- `RetroXxxVariant`, `RetroXxxSize` en `retro-<nombre>.types.ts`.

### CSS custom properties

(Solo si hay tokens públicos.)

| Variable               | Default | Descripción |
| ---------------------- | ------- | ----------- |
| `--retro-<nombre>-xxx` | `...`   | ...         |

### Dependencias

(Solo si depende de otros componentes retro.)

## Ejemplo

\`\`\`html
<retro-<nombre> ... />
\`\`\`
```

## Pasos finales

1. Añadir el export a `lib/retro/public-api.ts` en la sección `Componentes` (preservar el orden agrupado existente).
2. Si el componente expone tipos públicos, añadirlos también en la sección `Tipos expuestos a consumidores externos` con `export type { ... }`.
3. Listar los ficheros creados al usuario.
4. **No** hacer commit ni push. **No** ejecutar lint/test salvo que el usuario lo pida explícitamente.

## Referencias en el repo

- Componente simple con tipos: `lib/retro/retro-button/`.
- Componente con signals computed y handlers: `lib/retro/retro-card/`.
- Componente con icono dependiente y computed de tamaño: `lib/retro/retro-chip/`.
