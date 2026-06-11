---
description: "Synchronizes the README.md of a retro component with its current public API by reading the source files and generating the standard AI-oriented format. Use when the user needs to update a component's documentation after API changes ('actualiza el README del componente', 'sincroniza el readme retro', 'regenera la documentación del componente')."
argument-hint: '[componente]'
---

Sincroniza el `README.md` de un componente retro con su API pública actual leyendo el código fuente y generando el formato estándar orientado a IA.

Argumento: $ARGUMENTS — nombre del componente con o sin prefijo `retro-` (ej: `button`, `retro-card`). Si va vacío, infiere el componente desde el contexto (último fichero leído/editado, rama actual, mensaje del usuario). Si no puedes inferir, pregunta al usuario.

## Objetivo

El pre-commit hook (`scripts/check-retro-readme-sync.mjs`) bloquea commits que tocan ficheros de API (`.component.ts`, `.types.ts`, `.component.html`) sin actualizar el `README.md`. Esta skill garantiza que el README refleje la API real en el formato estándar orientado a IA.

## Pasos

### 1. Localizar la carpeta del componente

- Ruta esperada: `lib/retro/retro-<nombre>/`.
- Si el componente tiene subcomponentes con README propio, preguntar al usuario cuál sincronizar o sincronizar todos los afectados.

### 2. Leer las fuentes de verdad

Leer en este orden y extraer la API:

- `retro-<nombre>.component.ts`:
  - Selector exacto del decorador.
  - `standalone` (confirmar en el decorador; siempre `sí` en esta lib pero verificar).
  - CVA: buscar `ControlValueAccessor` en `implements` o `NG_VALUE_ACCESSOR` en `providers`.
  - Cada `input<T>()` / `input.required<T>()`: nombre, tipo Angular correcto (ver reglas de tipos), default (si aplica), descripción del JSDoc.
  - Cada `output<T>()`: nombre, tipo del payload, descripción del JSDoc.
  - Signals computed expuestos públicamente (sin `_` ni `@internal`): tipo `Signal<T>`.
  - Si es CVA: cómo funciona `writeValue`, qué emite `registerOnChange`, si refleja `setDisabledState`.
- `retro-<nombre>.types.ts` (si existe): listar tipos exportados con sus valores posibles.
- `retro-<nombre>.component.html`:
  - `<ng-content select="[slot=xxx]" />`: cada slot nombrado.
  - `<ng-content />` (sin select): slot por defecto.
  - Comportamiento condicional de slots (p. ej. ocultos en `loading`).
- `retro-<nombre>.component.scss`:
  - Custom properties consumidas con `var(--retro-<nombre>-xxx, default)`: documentar como tokens públicos.
  - Ignorar variables internas que no son puntos de personalización externos.

Ignorar todo lo marcado `@internal` o con prefijo `_` (es interno).

### 3. Construir el README

Estructura fija (mismo orden siempre):

```markdown
# <nombre-componente>

<una frase: qué es + para qué sirve>

**Selector:** `<selector>` · **Standalone:** sí/no · **CVA:** sí/no

## Cuándo usar / Cuándo NO usar

- Usar cuando: <casos típicos>.
- NO usar cuando: <componente alternativo de la misma lib si existe>.

## API — Inputs

| Nombre | Tipo Angular                | Default | Descripción |
| ------ | --------------------------- | ------- | ----------- |
| `xxx`  | `InputSignal<T>`            | `valor` | ...         |
| `yyy`  | `InputSignal<T> (required)` | —       | ...         |

## API — Outputs

| Nombre | Tipo Angular                | Descripción |
| ------ | --------------------------- | ----------- |
| `xxx`  | `OutputEmitterRef<Payload>` | ...         |

## Slots

| Selector       | Tipo esperado | Descripción |
| -------------- | ------------- | ----------- |
| `[slot=start]` | icono o texto | ...         |
| _(default)_    | bloque libre  | ...         |

## Contrato CVA _(solo si implementa ControlValueAccessor)_

- `writeValue(value)`: acepta `<tipo>`; `null`/`undefined` normalizan a `<valor>`.
- `registerOnChange`: emite `<tipo>`.
- `setDisabledState`: refleja `disabled`.

## Tokens CSS expuestos _(solo si hay)_

| Variable | Default | Descripción |
| -------- | ------- | ----------- |

## Tipos exportados _(solo si hay tipos públicos)_

- `RetroXxxVariant` — `'a' \| 'b'`

## Ejemplo mínimo

\`\`\`html
<retro-x ... />
\`\`\`

## Gotchas

- <comportamiento no obvio>.
```

### 4. Reglas de tipos Angular

Usar los tipos Angular correctos en la columna "Tipo Angular":

- `input()` → `InputSignal<T>`
- `input.required()` → `InputSignal<T> (required)` (y Default = `—`)
- `output()` → `OutputEmitterRef<T>`
- `computed()` expuesto públicamente → `Signal<T>`
- Tipos union en tablas: escapar el pipe → `'a' \| 'b' \| 'c'`

### 5. Reglas de secciones opcionales

Omitir **completamente** las secciones que no apliquen. Nunca dejar una sección vacía, "N/A", ni una tabla sin filas:

- **API — Inputs**: omitir si el componente no tiene inputs públicos.
- **API — Outputs**: omitir si el componente no tiene outputs públicos.
- **Slots**: omitir si no hay `<ng-content>` en el template.
- **Contrato CVA**: incluir **SOLO** si el componente implementa `ControlValueAccessor` o tiene `NG_VALUE_ACCESSOR` en providers.
- **Tokens CSS expuestos**: incluir solo si hay custom properties consumidas con `var(--retro-xxx, default)` en el `.scss`.
- **Tipos exportados**: incluir solo si existe un `.types.ts` con tipos públicos.
- **Gotchas**: incluir solo si hay comportamientos no obvios detectables en el `.ts`/`.html`/`.scss` (p. ej. slots ocultos en ciertos estados, promoción de tamaños en mobile, restricciones de contexto).

### 6. Reglas de formato

- Línea compacta: `**Selector:** \`xx\` · **Standalone:** sí · **CVA:** sí`(o`CVA: no`).
- La columna "Default" usa `—` para required y el valor literal para opcionales: `` `false` ``, `` `'lg'` ``.
- Pipes en tablas markdown con escape: `` `'a' \| 'b'` ``.
- Sección "Cuándo NO usar" debe apuntar al componente alternativo dentro de la misma lib cuando exista.
- Si un input está `@deprecated`, marcarlo en la columna Descripción: **Deprecated** — usar `xxx`.
- El ejemplo mínimo debe ser funcional con la API real. Si ya existe un ejemplo válido, conservarlo salvo que la API lo invalide.

### 7. Verificación antes de escribir

- Comparar input por input, output por output, slot por slot: si el README tiene algo que ya no está en el código, eliminarlo; si el código tiene algo que falta, añadirlo.
- No incluir miembros con `@internal` ni con prefijo `_`.
- Confirmar que la línea `**Selector:**` usa el selector exacto del decorador `@Component`.

## Pasos finales

1. Sobrescribir `lib/retro/retro-<nombre>/README.md` con el contenido sincronizado.
2. Mostrar al usuario un resumen breve de qué se ha modificado (campos añadidos/eliminados/actualizados, secciones nuevas o eliminadas).
3. **No** hacer commit ni push. **No** lanzar lint/test salvo petición explícita.

## Referencias en el repo

- Patrón canónico: `lib/retro/retro-button/README.md`.
- Con custom properties: `lib/retro/retro-card/README.md`.
- CLAUDE.md → sección "Librería retro — sincronía de README".
