Mejora la cobertura de tests hasta el máximo alcanzable, respetando las exclusiones documentadas en `docs/TESTING.md`.

## Paso 1 — Generar el informe de cobertura

Ejecuta `npm run test:coverage`. El informe lcov se genera en `coverage/monchito-game-library/lcov.info`.

## Paso 2 — Identificar gaps reales

Lee `coverage/monchito-game-library/lcov.info`. Extrae las entradas con contador `0`:
- `BRDA:linea,bloque,rama,0` → rama no cubierta
- `DA:linea,0` → línea no ejecutada
- `FNDA:0,nombre` → función no llamada

Antes de actuar sobre cada gap, clasifícalo usando las exclusiones documentadas en `docs/TESTING.md`:

| Categoría | Descripción | Acción |
|---|---|---|
| **Cat. 1** — Artefactos V8 en `export class` | Ramas fantasma en la línea de declaración de clase | Ignorar |
| **Cat. 2** — Código muerto / ramas inalcanzables | Condiciones cuyo lado nunca puede ocurrir por contrato del código | Ignorar |
| **Cat. 3** — Artefactos de Angular signals | `?.` / `??` dentro de `computed()` o `effect()` que V8 no instrumenta correctamente | Ignorar |
| **Lógica deliberadamente no testeada** | Ítems listados en esa tabla de TESTING.md | Ignorar |
| **Todo lo demás** | Lógica real sin cobertura | **Cubrir** |

Cuando tengas dudas sobre si un gap pertenece a Cat. 1–3, compara el número de línea con la declaración `export class` o con un bloque `computed()`/`effect()` del fichero fuente. En caso de duda razonable, prioriza escribir el test: si el test pasa y la rama sigue sin cubrirse, es un artefacto.

## Paso 3 — Escribir los tests

Para cada gap real:

1. Localiza el fichero `.spec.ts` correspondiente (misma ruta, extensión `.spec.ts`).
2. Lee el spec existente para entender el patrón usado: mocks, helpers, configuración de `TestBed`, subjects de breakpoint, etc.
3. Lee el fichero fuente en la línea del gap para entender exactamente qué rama falta.
4. Añade los `it(...)` mínimos necesarios para cubrir esa rama o línea.

Convenciones obligatorias:
- Consulta `src/testing/` antes de declarar un mock inline — si ya existe, úsalo.
- `vi.clearAllMocks()` en `beforeEach`.
- Nombres de tests en español, descriptivos del caso cubierto.
- No añadas JSDoc en `it(...)` ni en `describe(...)` internos.
- No cambies tests existentes que ya pasan.

## Paso 4 — Verificar

Ejecuta `npm test`. Todos los tests deben pasar. Si alguno falla, corrígelo antes de continuar.

Si un gap que intentaste cubrir sigue marcado como no cubierto tras pasar el test, es un artefacto de V8 o de signals — documéntalo en la categoría correspondiente de TESTING.md y continúa.

## Paso 5 — Actualizar TESTING.md

Ejecuta la lógica de `/update-testing` para sincronizar:
- Conteos por fichero en las tablas de cada sección.
- Tabla resumen final.
- Sección "Cobertura actual" con los nuevos valores (leer el output de `npm run test:coverage`).
- Si algún ítem de Categoría 4 ha quedado cubierto, actualiza su entrada en "Ramas sin cobertura — análisis exhaustivo".
- Si aparecen nuevos gaps no testeables descubiertos durante el proceso, añádelos a la categoría correcta con su análisis.

No hagas commit ni push.
