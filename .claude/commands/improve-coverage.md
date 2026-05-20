Mejora la cobertura de tests hasta el máximo alcanzable, respetando las exclusiones documentadas en el TESTING.md del ámbito seleccionado.

El proyecto tiene dos ámbitos independientes:

| Ámbito                 | Specs                       | Script de cobertura           | Threshold              | Cobertura actual | Meta | Doc de referencia       |
| ---------------------- | --------------------------- | ----------------------------- | ---------------------- | ---------------- | ---- | ----------------------- |
| `retro` — `lib/retro/` | ~38 ficheros / ~291 tests   | `npm run test:retro:coverage` | 60% (statements/lines) | ~65%             | 90%  | `docs/TESTING-RETRO.md` |
| `app` — `src/`         | ~144 ficheros / ~2566 tests | `npm run test:app:coverage`   | 80% (statements/lines) | ~97%             | —    | `docs/TESTING.md`       |

> ⚠️ Ambas pasadas de cobertura escriben en `coverage/monchito-game-library/`. **Nunca uses `npm run test:coverage`** (encadena ambos y la segunda pisa el lcov de la primera) antes de leer los gaps. Ejecuta siempre solo el script del ámbito que vas a mejorar.

## Paso 0 — Elegir ámbito

Si no viene especificado en `$ARGUMENTS`, prioriza **`retro`**: la cobertura está muy por debajo de la meta (65% vs 90%) y casi todos los gaps son lógica testeable real. En `app` el techo está en ~99% y casi todo lo que queda son artefactos de las categorías 1–3.

## Paso 1 — Generar el informe de cobertura

Según el ámbito elegido:

- `retro` → `npm run test:retro:coverage`
- `app` → `npm run test:app:coverage`

El informe lcov se genera en `coverage/monchito-game-library/lcov.info` (solo refleja el ámbito ejecutado).

## Paso 2 — Identificar gaps reales

Lee `coverage/monchito-game-library/lcov.info`. Extrae las entradas con contador `0`:

- `BRDA:linea,bloque,rama,0` → rama no cubierta
- `DA:linea,0` → línea no ejecutada
- `FNDA:0,nombre` → función no llamada

Antes de actuar sobre cada gap, clasifícalo usando las exclusiones documentadas en el TESTING.md del ámbito:

| Categoría                                        | Descripción                                                                         | Acción     |
| ------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------- |
| **Cat. 1** — Artefactos V8 en `export class`     | Ramas fantasma en la línea de declaración de clase                                  | Ignorar    |
| **Cat. 2** — Código muerto / ramas inalcanzables | Condiciones cuyo lado nunca puede ocurrir por contrato del código                   | Ignorar    |
| **Cat. 3** — Artefactos de Angular signals       | `?.` / `??` dentro de `computed()` o `effect()` que V8 no instrumenta correctamente | Ignorar    |
| **Lógica deliberadamente no testeada**           | Ítems listados en ese TESTING.md                                                    | Ignorar    |
| **Todo lo demás**                                | Lógica real sin cobertura                                                           | **Cubrir** |

Las categorías 1–3 aplican igual en `lib/retro/`. Si encuentras un nuevo artefacto en retro no documentado aún, regístralo en `docs/TESTING-RETRO.md` al cerrar.

Cuando tengas dudas, compara el número de línea con `export class` o un bloque `computed()`/`effect()`. En caso de duda razonable, prioriza escribir el test: si pasa y la rama sigue sin cubrirse, es un artefacto.

## Paso 3 — Escribir los tests

Para cada gap real:

1. Localiza el fichero `.spec.ts` correspondiente (misma ruta, extensión `.spec.ts`).
2. Lee el spec existente para entender el patrón: mocks, helpers, `TestBed`, subjects de breakpoint, etc.
3. Lee el fichero fuente en la línea del gap.
4. Añade los `it(...)` mínimos necesarios para cubrir esa rama o línea.

Convenciones obligatorias:

- Mocks compartidos según ámbito:
  - Specs de `src/` → consulta `src/testing/` antes de declarar un mock inline.
  - Specs de `lib/retro/` → consulta `lib/retro/testing/` antes de declarar un mock inline.
- `vi.clearAllMocks()` en `beforeEach`.
- Nombres de tests en español, descriptivos del caso cubierto.
- No añadas JSDoc en `it(...)` ni en `describe(...)` internos.
- No cambies tests existentes que ya pasan.

## Paso 4 — Verificar

1. Ejecuta el script de test del ámbito tocado para ciclos rápidos: `npm run test:retro` o `npm run test:app`.
2. Antes de cerrar, ejecuta `npm test` para confirmar que el otro ámbito sigue verde.

Si un gap sigue sin cubrirse tras pasar el test, es un artefacto — documéntalo en la categoría correcta del TESTING.md del ámbito y continúa.

## Paso 5 — Actualizar el TESTING.md del ámbito

Ejecuta la lógica de `/update-testing` con el mismo ámbito para sincronizar:

- Conteos por fichero en las tablas de cada sección.
- Tabla resumen final.
- Sección "Cobertura actual" con los nuevos valores (output de `npm run test:retro:coverage` o `npm run test:app:coverage`).
- Si algún ítem de Categoría 4 ha quedado cubierto, actualiza su entrada en "Ramas sin cobertura — análisis exhaustivo".
- Si aparecen nuevos gaps no testeables, añádelos a la categoría correcta con su análisis.

No hagas commit ni push.
