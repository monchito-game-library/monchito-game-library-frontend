Audita el proyecto en busca de convenciones que ESLint no detecta automáticamente, produciendo un informe en lenguaje natural. Complementa el pipeline de lint, no lo sustituye: ejecuta `/qa` primero y usa este command solo si sospechas violaciones que el lint no captura.

Argumento opcional: $ARGUMENTS — ruta a analizar. Por defecto analiza `src/app` y `lib/retro/` con las reglas que apliquen a cada ámbito.

## Qué detectar

Las categorías 1–3 del `detect-architecture-violations` original (imports entre capas, rutas relativas, privados sin `_`) ya las cubre ESLint. Este command se centra en lo que el lint **no** detecta:

### 1. Signals sin tipo explícito — `src/app`

- `signal(` sin `WritableSignal<T>` declarado explícitamente
- `computed(` sin tipo de retorno explícito donde no sea obvio
- Busca: `= signal\(` sin `WritableSignal<` en la misma línea o anterior

### 2. JSDoc — `@param` sin tipo entre llaves — `src/app` y `lib/retro/`

- Métodos con `@param nombre` sin `{tipo}` (el lint jsdoc estándar no exige el `{tipo}`)
- Busca: `@param (?!\{)` en ficheros `.ts`

### 3. SCSS — espaciados en `px` prohibidos — `src/app` y `lib/retro/`

- `gap`, `margin`, `padding` con valor en `px` donde debería ser `rem`
- Excepción aceptada: valores decorativos en chips/badges (`padding: 2px 8px`)
- Busca: `(gap|margin|padding):\s*\d+px` en ficheros `.scss`

### 4. SCSS — `&__elemento` anidado prohibido — `src/app` y `lib/retro/`

- Patrón `&__elemento` que no sea `&--modificador`
- La convención del proyecto exige clases completas (`.my-component__header`), no `&__header`
- Busca: `&__` en ficheros `.scss`

### 5. Interfaces o tipos declarados dentro de componentes — `src/app`

- `export interface` o `export type` en ficheros `.component.ts` — deben estar en `@/interfaces/` o `@/types/`
- Busca: `^export (interface|type) ` en ficheros `.component.ts`

### 6. Aislamiento `lib/retro/` ↔ `src/` — `lib/retro/`

- Ficheros bajo `lib/retro/` que importen de `src/` o usen aliases `@/*` (solo pueden usar `@retro/*`, `@retro/testing/*` o paquetes npm)
- Busca: `from '@/` o `from '.*src/` dentro de `lib/retro/**/*.ts`

## Formato del informe

Para cada violación encontrada:

- Fichero y línea
- Tipo de violación (número de categoría arriba)
- Fragmento de código afectado
- Sugerencia de corrección

Agrupa por categoría. Al final, da un resumen con el total por tipo.
Si no hay violaciones en una categoría, indícalo explícitamente.
