Sincroniza `docs/TESTING.md` con los conteos reales de tests del proyecto.

> Skill de documentación pura. `/improve-coverage` la ejecuta internamente al terminar de escribir tests. Úsala directamente cuando hayas añadido tests a mano y solo necesites actualizar los números.

## Pasos

1. Ejecuta `npm test` y anota el número total de tests y ficheros.
2. Para cada fichero `.spec.ts` del proyecto, cuenta los bloques `it(` para obtener el número de tests por fichero.
3. Compara con los valores actuales en `docs/TESTING.md`.
4. Actualiza únicamente los conteos que hayan cambiado (tablas por fichero y tabla resumen final).
5. Si se han añadido tests que cubren funcionalidad no descrita en la sección "Qué se cubre", añade una línea breve al texto.
6. Si los números de cobertura han cambiado, ejecuta `npm run test:coverage` y actualiza la sección "Cobertura actual" con los nuevos valores.

No cambies la estructura del documento ni las secciones de análisis de cobertura.
No hagas commit.
