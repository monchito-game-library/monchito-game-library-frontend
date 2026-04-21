Sincroniza docs/TESTING.md con los conteos reales de tests del proyecto.

Pasos:
1. Ejecuta `npm test` y anota el número total de tests y ficheros.
2. Para cada fichero `.spec.ts` del proyecto, cuenta los bloques `it(` para obtener el número de tests por fichero.
3. Compara con los valores actuales en `docs/TESTING.md`.
4. Actualiza únicamente los conteos que hayan cambiado (tanto en las tablas por fichero como en la tabla resumen final).
5. Si se han añadido tests nuevos que cubren funcionalidad no descrita en la sección "Qué se cubre", añade una línea breve al texto.
6. Actualiza el total en la tabla resumen.

No cambies la estructura del documento ni las secciones de análisis de cobertura.
No hagas commit.
