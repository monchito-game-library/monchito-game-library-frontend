Sincroniza el TESTING.md del ámbito indicado con los conteos reales de tests del proyecto.

> Skill de documentación pura. `/improve-coverage` la ejecuta internamente al terminar de escribir tests. Úsala directamente cuando hayas añadido tests a mano y solo necesites actualizar los números.

El proyecto tiene dos ficheros de testing independientes:

| Ámbito                 | Specs                    | Script de test       | TESTING.md              |
| ---------------------- | ------------------------ | -------------------- | ----------------------- |
| `retro` — `lib/retro/` | `lib/retro/**/*.spec.ts` | `npm run test:retro` | `docs/TESTING-RETRO.md` |
| `app` — `src/`         | `src/**/*.spec.ts`       | `npm run test:app`   | `docs/TESTING.md`       |

Si se invoca sin argumento en `$ARGUMENTS`, ejecuta ambos ámbitos en secuencia (`retro` primero).

> ⚠️ La sub-sección "Librería `lib/` (Terminal Collector)" en `docs/TESTING.md` se refiere a `src/app/presentation/components/lib/` — **no** a la librería retro. No la mezcles con `docs/TESTING-RETRO.md`.

## Pasos

1. Determina el ámbito desde `$ARGUMENTS` (`retro`, `app` o vacío = ambos).

2. Para cada ámbito a procesar:
   - Ejecuta su script de test (`npm run test:retro` o `npm run test:app`) y anota el total de ficheros y tests del resumen final de Vitest.
   - Para cada fichero `.spec.ts` del ámbito, cuenta los bloques `it(` para obtener el número de tests por fichero.

3. Compara con los valores del TESTING.md correspondiente y actualiza únicamente los conteos que hayan cambiado:
   - Tablas por fichero en cada sub-sección.
   - Tabla resumen final.

4. Si se han añadido tests que cubren funcionalidad no descrita en la sección "Qué se cubre", añade una línea breve al texto.

5. Si los números de cobertura han cambiado, actualiza la sección "Cobertura actual":
   - **`retro`**: ejecuta `npm run test:retro:coverage`, lee el output y actualiza `docs/TESTING-RETRO.md`. Threshold: 90%.
   - **`app`**: ejecuta `npm run test:app:coverage`, lee el output y actualiza `docs/TESTING.md`. Threshold: 80%.
   - ⚠️ Nunca uses `npm run test:coverage` aquí: encadena ambos y la segunda pasada pisa el lcov de la primera.

No cambies la estructura de los documentos ni las secciones de análisis de cobertura (Cat. 1–4).
No hagas commit.
