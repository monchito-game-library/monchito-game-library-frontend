Ejecuta el pipeline completo de calidad del proyecto en este orden:

1. `npm run lint` — ESLint. Si hay errores, corrígelos antes de continuar.
2. `npm run check:unused` — Knip. Si hay exports/imports sin usar, elimínalos o justifica por qué deben quedarse.
3. `npm test` — Vitest. Todos los tests deben pasar. Si alguno falla, corrígelo.

Reporta el resultado de cada paso. Si los tres pasan, confirma que el proyecto está listo para commit/PR.
No hagas commit ni push.
