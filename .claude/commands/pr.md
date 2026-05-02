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
4. **Asume que el usuario ya ha hecho push de la rama** (Claude no tiene permisos para `git push` en este sandbox; el usuario lo lanza antes de invocar `/pr`). Verifica con `git log @{u}..HEAD --oneline` que no hay commits locales sin pushear y que la rama existe en remoto. Si faltan commits por pushear o la rama aún no está publicada, **detente y pídele al usuario que haga el push** antes de continuar.
5. **Comprueba si la rama está al día con master**: ejecuta `git fetch origin master --quiet` y luego `git log HEAD..origin/master --oneline`. Si imprime algún commit, master ha avanzado desde que se creó la rama. En ese caso:
   - Intenta rebasear automáticamente: `git rebase origin/master`.
   - Si el rebase termina limpio, vuelve a verificar `git log @{u}..HEAD --oneline` — quedan commits locales sin pushear (los rebaseados); **detente y pídele al usuario que haga `git push --force-with-lease`** antes de continuar.
   - Si el rebase tiene conflictos, **aborta con `git rebase --abort`** y pide al usuario que rebase manualmente; no intentes resolver conflictos automáticamente.
   - Si master no ha avanzado, sigue con el siguiente paso sin tocar nada.
6. Abre la PR con `gh pr create` contra `master`, con título y body en español, siguiendo el formato:
   - Título: corto y descriptivo (≤ 70 caracteres)
   - Body: secciones `## Resumen` (bullets) y `## Plan de pruebas` (checklist)
7. **Activa auto-merge squash automáticamente** sin preguntar: `gh pr merge <numero> --auto --squash`. Reporta el número y URL de la PR.

Argumento opcional: $ARGUMENTS — úsalo como descripción o título sugerido de la PR si se proporciona.
