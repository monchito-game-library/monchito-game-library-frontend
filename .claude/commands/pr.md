Crea una pull request para los cambios actuales siguiendo las convenciones del proyecto.

Pasos:
1. Comprueba el estado del repo: `git status` y `git diff`.
2. Si hay cambios sin commitear, pregunta al usuario si quiere incluirlos o si ya están listos.
3. Asegúrate de que la rama actual NO es `master`. Si es `master`, crea una rama nueva con el nombre adecuado según el tipo de cambio:
   - `feat/descripcion-corta` para nuevas funcionalidades
   - `fix/descripcion-del-bug` para correcciones
   - `chore/tarea` para mantenimiento
   - `docs/descripcion` para documentación
   - `refactor/descripcion` para refactorizaciones
   - `test/descripcion` para mejoras de cobertura
4. Haz push de la rama al remoto si no está ya publicada.
5. Abre la PR con `gh pr create` contra `master`, con título y body en español, siguiendo el formato:
   - Título: corto y descriptivo (≤ 70 caracteres)
   - Body: secciones `## Resumen` (bullets) y `## Plan de pruebas` (checklist)
6. Pregunta al usuario si quiere activar auto-merge (`gh pr merge --auto --squash`).

Argumento opcional: $ARGUMENTS — úsalo como descripción o título sugerido de la PR si se proporciona.
