# Claude Code Skills — Monchito Game Library

Las skills del proyecto viven en `.claude/skills/` (fuente de verdad: el frontmatter `description` de cada `SKILL.md`).
Se invocan con `/nombre` o las activa Claude automáticamente cuando el prompt encaja con su `description`.
Conviven con las skills del plugin **atenea-arsenal** (`create-plan`, `execute-plan`, `review`, `create-mr`…), que aporta la infraestructura de orquestación.

---

## Skills del proyecto

| Skill                  | Argumento                      | Qué hace                                                                                                                                                                                                                                            |
| ---------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `audit-conventions`    | `[ruta]`                       | Audita el código en busca de violaciones de convenciones que ESLint no detecta (signals sin tipo explícito, `@param` sin tipo, `px` prohibidos en SCSS, `&__` anidado, tipos en componentes, aislamiento `lib/retro/` ↔ `src/`)                     |
| `create-domain-entity` | `[nombre-entidad] [campos...]` | Genera los 10 artefactos de una entidad de dominio: modelo, DTO, mapper, contrato repositorio, contrato/implementación use-cases, providers DI y specs básicos                                                                                      |
| `db-patch`             | `[descripcion-corta]`          | Crea un patch SQL incremental idempotente en `docs/backend/patches/` y opcionalmente lo aplica vía `npm run db:apply`; sincroniza el schema canónico si el contrato cambia                                                                          |
| `improve-coverage`     | `[retro\|app]`                 | Genera el informe lcov del ámbito elegido, identifica gaps reales (descartando artefactos V8/signals documentados), escribe los tests mínimos necesarios y registra las exclusiones justificadas en el catálogo interno (`reference/exclusions.md`) |
| `next`                 | —                              | Lee `BUGS.md` (bugs pendientes tienen prioridad) y luego `ROADMAP.md`; propone la siguiente tarea con ficheros afectados y complejidad estimada; no implementa hasta confirmación                                                                   |
| `pr`                   | `[descripción]`                | Verifica el estado del repo, hace rebase sobre `master` si hay commits nuevos, abre la PR con `gh pr create` y activa auto-merge squash automáticamente                                                                                             |
| `qa`                   | —                              | Ejecuta el pipeline completo: `lint:retro` → `lint:app` → `check:unused:retro` → `check:unused:app` → `test:retro` → `test:app`; aborta si la lib falla antes de los checks de la app                                                               |
| `retro-component`      | `[nombre]`                     | Genera un componente nuevo en `lib/retro/retro-<nombre>/` con todas las convenciones de la lib (standalone OnPush, BEM, inputs/outputs tipados, spec con target 90% de cobertura, README inicial) y lo exporta en `public-api.ts`                   |
| `retro-readme`         | `[componente]`                 | Sincroniza el `README.md` de un componente retro con su API pública actual leyendo `.component.ts`, `.types.ts` y `.component.html`; garantiza que el pre-commit hook no bloquee el commit                                                          |
| `update-deps`          | `[paquete1 paquete2...]`       | Detecta dependencias desactualizadas, aplica patches/minors de forma segura (Angular vía `ng update`, resto con `--save-exact`), para en majors o peer-deps incompatibles, elimina `^`/`~` y verifica build/test/lint/knip                          |

---

## Skills de terceros (auto-activadas)

Estas skills **no se invocan con `/comando`**: se activan automáticamente cuando el prompt encaja con su `description`. No requieren ninguna acción explícita del usuario.

| Skill                              | Qué aporta                                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `supabase`                         | Guía de referencia para tareas Supabase: schema, Auth/RLS/JWT, Edge Functions, Realtime, Storage, cliente `supabase-js` y CLI/MCP; incluye checklist de seguridad y flujo para commits de migraciones                              |
| `supabase-postgres-best-practices` | Guía de optimización Postgres en 8 categorías (rendimiento de queries, gestión de conexiones, seguridad RLS, diseño de schema…) con ejemplos SQL y planes de ejecución                                                             |
| `ui-ux-pro-max`                    | Motor de diseño con 67 estilos, 96 paletas de color, 57 pairings tipográficos y 99 directrices UX para Angular; se activa con palabras como `diseño`, `UI`, `componente`, `color`, `tipografía`, `layout`, `paleta`, `responsive`… |

Para actualizar `ui-ux-pro-max` a la última versión publicada en npm:

```bash
npx uipro-cli update --ai claude
```
