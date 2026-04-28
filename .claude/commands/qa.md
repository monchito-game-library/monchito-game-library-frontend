Ejecuta el pipeline completo de calidad del proyecto en este orden:

1. `npm run lint` — ESLint.
   - Si hay **errores**, corrígelos antes de continuar.
   - Si hay **warnings**, corrígelos también. El objetivo es 0 errores y 0 warnings.
   - Nota sobre `@typescript-eslint/member-ordering`: ESLint clasifica las arrow functions de clase (`private readonly _fn = () => {}`) como `private-method`, no como `private-readonly-field`. Si aparecen fuera de orden, muévelas al bloque de métodos privados al final de la clase, después de todos los métodos públicos.

2. `npm run check:unused` — Knip. Si hay exports/imports sin usar, elimínalos o justifica por qué deben quedarse.

3. `npm test` — Vitest. Todos los tests deben pasar. Si alguno falla, corrígelo.

Reporta el resultado de cada paso. Si los tres pasan sin ningún error ni warning, confirma que el proyecto está listo para commit/PR.
No hagas commit ni push.
