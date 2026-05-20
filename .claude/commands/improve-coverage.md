Mejora la cobertura de tests hasta el máximo alcanzable, respetando las exclusiones documentadas en el TESTING.md del ámbito seleccionado.

El proyecto tiene dos ámbitos independientes:

| Ámbito                 | Specs                       | Script de cobertura           | Threshold              | Cobertura actual            | Estado          | Doc de referencia       |
| ---------------------- | --------------------------- | ----------------------------- | ---------------------- | --------------------------- | --------------- | ----------------------- |
| `retro` — `lib/retro/` | ~38 ficheros / ~523 tests   | `npm run test:retro:coverage` | 90% (statements/lines) | 95.35% stmts / 97.09% lines | Techo alcanzado | `docs/TESTING-RETRO.md` |
| `app` — `src/`         | ~144 ficheros / ~2566 tests | `npm run test:app:coverage`   | 80% (statements/lines) | ~97%                        | —               | `docs/TESTING.md`       |

> ⚠️ Ambas pasadas de cobertura escriben en `coverage/monchito-game-library/`. **Nunca uses `npm run test:coverage`** (encadena ambos y la segunda pisa el lcov de la primera) antes de leer los gaps. Ejecuta siempre solo el script del ámbito que vas a mejorar.

## Paso 0 — Elegir ámbito

Si no viene especificado en `$ARGUMENTS`, prioriza **`app`**: `retro` ya está en su techo máximo (95.35% statements, 97.09% lines — el resto son artefactos V8/signals documentados en `docs/TESTING-RETRO.md`). En `retro` no hay margen real de mejora; cualquier "gap" restante cae en las categorías de exclusión documentadas.

Si `$ARGUMENTS` indica `retro`, antes de empezar revisa `docs/TESTING-RETRO.md` § "Ramas sin cobertura" para confirmar que el gap detectado no cae ya en las exclusiones documentadas. Si cae, detente y reporta al usuario en lugar de invertir esfuerzo.

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

Sincroniza el TESTING.md del ámbito trabajado con los conteos y valores reales:

1. Ejecuta el script de test del ámbito (`npm run test:retro` o `npm run test:app`) y anota el total de ficheros y tests del resumen final de Vitest.
2. Para cada fichero `.spec.ts` del ámbito, cuenta los bloques `it(` y actualiza los conteos en las tablas por fichero.
3. Actualiza la tabla resumen final y la sección "Cobertura actual" con los nuevos valores de coverage:
   - `retro` → `npm run test:retro:coverage`, actualiza `docs/TESTING-RETRO.md`. Threshold: 90% (verificar que coincide con `angular.json` → `configurations.retro-coverage.coverageThresholds`).
   - `app` → `npm run test:app:coverage`, actualiza `docs/TESTING.md`. Threshold: 80% (verificar que coincide con `angular.json`).
   - Si el threshold de `angular.json` y el reportado en el TESTING.md no coinciden, alinéalos al valor de `angular.json` y avisa al usuario.
   - ⚠️ Nunca uses `npm run test:coverage` aquí: encadena ambos y la segunda pasada pisa el lcov de la primera.
4. Si algún ítem de Categoría 4 ha quedado cubierto, actualiza su entrada en "Ramas sin cobertura — análisis exhaustivo".
5. Si aparecen nuevos gaps no testeables, añádelos a la categoría correcta con su análisis.

No hagas commit ni push.
