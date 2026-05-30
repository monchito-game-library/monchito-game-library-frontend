Sincroniza el `README.md` de un componente retro con su API pública actual leyendo el código fuente.

Argumento: $ARGUMENTS — nombre del componente con o sin prefijo `retro-` (ej: `button`, `retro-card`). Si va vacío, infiere el componente desde el contexto (último fichero leído/editado, rama actual, mensaje del usuario). Si no puedes inferir, pregunta al usuario.

## Objetivo

El pre-commit hook (`scripts/check-retro-readme-sync.mjs`) bloquea commits que tocan ficheros de API (`.component.ts`, `.types.ts`, `.component.html`) sin actualizar el `README.md`. Esta skill garantiza que el README refleje la API real.

## Pasos

### 1. Localizar la carpeta del componente

- Ruta esperada: `lib/retro/retro-<nombre>/`.
- Si el componente tiene subcomponentes con README propio, preguntar al usuario cuál sincronizar o sincronizar todos los afectados.

### 2. Leer las fuentes de verdad

Leer en este orden y extraer la API:

- `retro-<nombre>.component.ts`:
  - Selector exacto del decorador.
  - `standalone` (siempre `sí` en esta lib, pero confirmar).
  - Cada `input<T>()` / `input.required<T>()`: nombre, tipo, default (si aplica), descripción del JSDoc.
  - Cada `output<T>()`: nombre, tipo del payload, descripción del JSDoc.
  - Signals computed expuestos públicamente (sin `_` ni `@internal`).
  - Dependencias importadas de otros `Retro*Component` o directivas internas relevantes.
- `retro-<nombre>.types.ts` (si existe): listar tipos exportados con su JSDoc.
- `retro-<nombre>.component.html`:
  - `<ng-content select="[slot=xxx]" />`: cada slot nombrado.
  - `<ng-content />` (sin select): slot por defecto.
  - Comportamiento condicional de slots (p. ej. ocultos en `loading`).
- `retro-<nombre>.component.scss`:
  - Custom properties consumidas con `var(--retro-<nombre>-xxx, default)`: documentar como tokens públicos.

Ignorar todo lo marcado `@internal` o con prefijo `_` (es interno).

### 3. Construir el README

Estructura fija (mismo orden siempre):

```markdown
# retro-<nombre>

<1-2 líneas: qué es y comportamiento clave.>

## Componente — RetroXxxComponent

- **Selector:** `retro-<nombre>`
- **Standalone:** sí

### Inputs

| Nombre | Tipo                           | Default   | Descripción            |
| ------ | ------------------------------ | --------- | ---------------------- |
| `xxx`  | `tipo`                         | `default` | Descripción del JSDoc. |
| `yyy`  | `'a' \| 'b' \| 'c'` (required) | —         | ...                    |

### Outputs

| Nombre | Tipo      | Descripción |
| ------ | --------- | ----------- |
| `xxx`  | `Payload` | ...         |

### Slots / ng-content

- `[slot=start]`: ...
- `[slot=end]`: ...
- Default: ... (si aplica)

### Types

- `RetroXxxVariant`, `RetroXxxSize` en `retro-<nombre>.types.ts`.

### CSS custom properties

(Solo si hay tokens consumibles. Omitir la sección entera si no hay ninguno.)

| Variable               | Default | Descripción |
| ---------------------- | ------- | ----------- |
| `--retro-<nombre>-xxx` | `valor` | ...         |

### Dependencias

(Solo si depende de otros componentes retro. Omitir si no aplica.)

## Ejemplo

\`\`\`html
<retro-<nombre> ... />
\`\`\`
```

### 4. Reglas de formato

- Tipos en backticks: `` `'primary' \| 'ghost'` `` (escapar el pipe en tablas).
- Required: marcar como `` `tipo` (required) `` con default `—`.
- Defaults literales: `` `false` ``, `` `'lg'` ``, `` `undefined` ``.
- Descripciones: copiar literalmente el JSDoc, manteniendo coherencia con otros READMEs.
- Si un input está `@deprecated`, marcarlo en negrita en la columna Descripción: **Deprecated** — usar `xxx`.
- Mantener el ejemplo simple y funcional. Si ya existe un ejemplo válido, conservarlo salvo que la API actual lo invalide.

### 5. Verificación

- Comparar input por input, output por output, slot por slot: si el README tiene algo que ya no está en el código, eliminarlo; si el código tiene algo que falta en el README, añadirlo.
- No incluir miembros con `@internal` ni con prefijo `_`.
- Si un input/size tiene múltiples valores, documentar todos en una sola fila con la sintaxis `'a' \| 'b' \| 'c'`.

## Pasos finales

1. Sobrescribir `README.md` con el contenido sincronizado.
2. Mostrar al usuario un resumen breve de qué se ha modificado (campos añadidos/eliminados/actualizados).
3. **No** hacer commit ni push. **No** lanzar lint/test salvo petición explícita.

## Referencias en el repo

- Patrón canónico: `lib/retro/retro-button/README.md`.
- Con custom properties: `lib/retro/retro-card/README.md`.
- CLAUDE.md → sección "Librería retro — sincronía de README".
