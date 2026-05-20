Orquesta la ejecución de un plan multi-paso descrito en un fichero `.md` de la raíz del proyecto, usando los subagentes `senior` (planificación y supervisión) y `tech` (implementación).

Argumento opcional: $ARGUMENTS — ruta relativa o absoluta al fichero del plan. Si está vacío, usa `PLAN.md` en la raíz del proyecto.

## Reglas no negociables

- El fichero del plan **no se commitea jamás**. No lo añadas al staging, no lo modifiques salvo para anotaciones internas que el usuario revise, y avisa si detectas que está trackeado por git.
- Todos los commits van en una **rama dedicada**, nunca en `master`. Si la rama actual es `master`, crea una nueva antes de cualquier commit (`feat/...`, `fix/...`, `refactor/...`, `chore/...` según corresponda).
- Comunicación con el usuario **siempre en español**.
- Respeta `CLAUDE.md` del proyecto en todo momento (path aliases, prefijo `_` en privados, tipos explícitos, JSDoc, SCSS en `rem`, formularios reactivos tipados, arquitectura de capas, sincronía de READMEs en `lib/retro/`).
- No hagas `git push` ni abras PR como parte de este comando: este flujo termina con los commits locales hechos. La PR se abre después con `/pr`.

## Flujo de orquestación

### Paso 0 — Localizar el plan

1. Resuelve el fichero del plan:
   - Si `$ARGUMENTS` viene, úsalo (ruta tal cual, relativa al cwd o absoluta).
   - Si está vacío, usa `PLAN.md` en la raíz del proyecto.
2. Si el fichero **no existe**, detente y pídele al usuario que cree el plan o que pase la ruta correcta como argumento.
3. Comprueba con `git ls-files --error-unmatch <ruta-del-plan>` si el fichero está trackeado:
   - Si lo está, **avisa al usuario** y pregunta si quiere que lo añadas a `.gitignore` antes de continuar. No procedas hasta tener respuesta.
   - Si **no** lo está, continúa en silencio — es el caso normal y esperado; no lo menciones al usuario.
4. Lee el contenido completo del plan con la herramienta `Read` (no resumas todavía, eso lo hace `senior`).

### Paso 1 — `senior` estructura el plan

Lanza el subagente `senior` con el contenido del plan. Su tarea:

1. Parsear el `.md` y producir un **plan estructurado** con:
   - Lista ordenada de **pasos/commits** (uno por bloque lógico).
   - Para cada paso:
     - `id` (`step-1`, `step-2`…)
     - `objetivo` (qué consigue el paso)
     - `mensaje de commit sugerido` (siguiendo conventional commits del proyecto, en imperativo)
     - `ficheros estimados a tocar`
     - `criterios de aceptación verificables` (qué tests, lint, tipados o checks deben pasar)
     - `riesgos o decisiones de diseño` que `tech` debe respetar sin reabrir
2. Identificar la **rama de trabajo** apropiada (tipo + nombre kebab-case) si todavía no se ha creado.
3. Detectar y avisar de **ambigüedades**: si algún paso del plan no es accionable o falta información, listarlas antes de empezar para que el usuario las resuelva.

Persiste este plan estructurado en memoria de la conversación (no en disco). Muéstraselo al usuario y **espera confirmación** antes de pasar al Paso 2. Si el usuario pide ajustes, vuelve a llamar a `senior` con el feedback.

### Paso 2 — Preparar rama

1. Comprueba la rama actual con `git rev-parse --abbrev-ref HEAD`.
2. Si es `master`, crea la rama propuesta por `senior` con `git checkout -b <tipo>/<descripcion>`.
3. Si ya estamos en otra rama, pregunta al usuario si quiere usar la actual o crear una nueva.
4. Verifica que el árbol de trabajo está limpio (`git status --porcelain`). Si hay cambios sin commitear que **no** pertenecen al plan, pídele al usuario que los gestione antes (commit aparte, stash o descarte).

### Paso 3 — Ejecución iterativa de cada paso

Para cada `step-N` del plan estructurado, en orden:

1. **Lanza el subagente `tech`** con un prompt que incluya:
   - El `objetivo` del paso.
   - Los `criterios de aceptación`.
   - Los `riesgos / decisiones de diseño` que `senior` marcó como cerradas.
   - Recordatorio de convenciones críticas: path aliases, prefijo `_`, tipos explícitos, JSDoc, SCSS en `rem`, sincronía de READMEs en `lib/retro/` si toca esa librería.
   - Instrucción de **no hacer commit todavía** — el commit lo gestiona este orquestador tras la revisión.
2. Cuando `tech` termine, ejecuta los **checks locales del paso** según el scope de los cambios:
   - Si el paso toca **solo `lib/retro/`**: `npm run lint:retro` y `npm run test:retro` (0 errores, todos pasan).
   - Si el paso toca **solo `src/`**: `npm run lint:app` y `npm run test:app` (0 errores, todos pasan).
   - Si el paso toca **ambos ámbitos**: `npm run lint` y `npm test` (ejecutan lib-primero internamente).
   - Si el paso toca componentes de `lib/retro/`: `node scripts/check-retro-readme-sync.mjs` no debe quejarse.
   - Si el paso toca dependencias: `npm run check:unused` (ejecuta retro-primero internamente).
3. **Lanza `senior` en modo revisión** sobre el diff (`git diff` del trabajo no commiteado). Debe certificar:
   - Que se ha cubierto el `objetivo` del paso.
   - Que todos los `criterios de aceptación` se cumplen.
   - Que no se han introducido violaciones de convenciones.
   - Que no se han tocado ficheros fuera del alcance del paso sin justificación.
4. **Bucle de corrección**:
   - Si `senior` detecta carencias o desviaciones, vuelve a invocar `tech` con la lista concreta de correcciones (sin reabrir decisiones de diseño cerradas).
   - Repite checks + revisión.
   - Máximo **3 iteraciones** por paso. Si tras la tercera `senior` sigue rechazando, **detente y reporta al usuario** el bloqueo con detalle: qué falta, qué intentó `tech`, qué exige `senior`. No avances al siguiente paso.
5. Cuando `senior` certifique el paso:
   - Haz `git add` **solo de los ficheros del paso** (nunca `git add -A`, nunca el fichero del plan).
   - Crea el commit con el mensaje sugerido por `senior` (ajustado si el usuario lo pidió). Usa `git commit` normal (sin `--no-verify` salvo que el usuario lo pida explícitamente).
   - Si el pre-commit hook falla, **no uses `--amend`**: corrige el problema con `tech`, vuelve a `git add` y crea un **commit nuevo** (que luego se squashea al mergear la PR).
6. Reporta al usuario el avance del paso: id, mensaje de commit, hash corto, ficheros tocados.

### Paso 4 — Revisión final certificante

Cuando todos los pasos del plan estén commiteados:

1. Ejecuta el pipeline de QA completo en orden lib-primero (los scripts compuestos ya garantizan el orden):
   - `npm run lint` — lint retro primero, luego app
   - `npm run check:unused` — knip retro primero, luego app
   - `npm test` — tests retro primero, luego app
2. Lanza una **última invocación de `senior`** con:
   - El plan estructurado original.
   - El listado de commits creados (`git log master..HEAD --oneline`).
   - El diff acumulado (`git diff master...HEAD`).
   - Los resultados del QA.
3. `senior` debe emitir un **veredicto final** en uno de tres estados:
   - **OK**: todo el plan se ha cumplido. Reporta al usuario el resumen: pasos cubiertos, commits creados, rama lista para `/pr`.
   - **OK con observaciones**: el plan se ha cumplido pero hay mejoras o follow-ups recomendados. Lístalos como tareas opcionales, no las apliques sin confirmación.
   - **No conforme**: falta algo del plan o hay regresiones. Detalla qué falta y pregunta al usuario si quiere que se reabra el ciclo (vuelta al Paso 3 sobre los pasos afectados) o si prefiere terminar aquí.

### Paso 5 — Cierre

1. Recuerda al usuario:
   - El fichero del plan **no se ha commiteado** (verifícalo con `git status --porcelain <ruta-del-plan>`).
   - Puede borrarlo manualmente o dejarlo para historial local.
   - Para abrir la PR: `/pr`.
2. **No** hagas push automático.
3. **No** abras PR automática.

## Cómo invocar a los subagentes

Usa la herramienta `Agent` con `subagent_type` igual a `senior` o `tech`. Pasa siempre un prompt en español que incluya:

- El contexto necesario (plan estructurado, paso actual, diff, criterios).
- Lo que esperas como salida (estructura, formato, decisión binaria si aplica).
- Recordatorio de convenciones del proyecto cuando sea relevante para `tech`.

No invoques `tech` sin haber pasado primero por `senior` para ese paso. No invoques `senior` para escribir código.

## Manejo de errores

- Si el plan tiene pasos vagos: detente en el Paso 1 y pide concreción al usuario.
- Si `tech` rompe el build/tests y no consigue arreglarlo en 3 iteraciones: detente y reporta.
- Si el pre-commit hook falla repetidamente por la misma causa: investiga la raíz con `tech`, no uses `--no-verify`.
- Si en mitad del flujo el usuario cancela: deja la rama y los commits hechos hasta el momento, no hagas `reset --hard`.
