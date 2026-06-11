---
description: "Runs the full project quality pipeline in order: lint (retro first, then app), unused exports check, and tests (retro then app). Aborts if the retro lib fails before running app checks. Use when the user wants to validate the project before committing or opening a PR ('pasa el QA', 'ejecuta la pipeline de calidad', 'valida el proyecto')."
---

Ejecuta el pipeline completo de calidad del proyecto en este orden. La librería retro se valida siempre primero: si falla, se aborta sin ejecutar los checks de la app.

## 1. Lint

```
npm run lint:retro
```

Si hay errores o warnings, corrígelos antes de continuar. Si pasa, ejecuta:

```
npm run lint:app
```

Objetivo: 0 errores y 0 warnings en ambos ámbitos.

> Nota sobre `@typescript-eslint/member-ordering`: ESLint clasifica las arrow functions de clase (`private readonly _fn = () => {}`) como `private-method`, no como `private-readonly-field`. Si aparecen fuera de orden, muévelas al bloque de métodos privados al final de la clase, después de todos los métodos públicos.

## 2. Exports sin usar

```
npm run check:unused:retro
```

Si hay exports/imports sin usar, elimínalos o justifica por qué deben quedarse. Si pasa:

```
npm run check:unused:app
```

## 3. Tests

```
npm run test:retro
```

Todos los tests de la librería deben pasar. Si alguno falla, corrígelo antes de continuar. Si pasa:

```
npm run test:app
```

Todos los tests de la app deben pasar.

---

Reporta el resultado de cada paso. Si los seis pasan sin ningún error ni warning, confirma que el proyecto está listo para commit/PR.
No hagas commit ni push.
