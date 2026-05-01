Actualiza las dependencias del proyecto a sus últimas versiones seguras siguiendo la convención del proyecto. Aplica patches y minors de forma automatizada y se detiene en majors o peer-deps incompatibles para que decida el usuario.

> Contexto del flujo: `CLAUDE.md` sección "Dependencias npm" / "Proceso de actualización de dependencias". Razón de existir: el proceso es repetitivo cada pocas semanas (detectar → clasificar → ng update vs npm install → fijar versiones exactas → build/test/lint/knip → commit) y tiene reglas específicas del proyecto que no se pueden delegar a `npm update`.

Argumento: $ARGUMENTS — opcional. Si el usuario pasa una lista de paquetes, limita la actualización a esos. Sin argumento, actualiza todo lo seguro.

## Paso 1 — Crear rama

Desde `master` actualizado:

```bash
git checkout master && git pull --ff-only origin master
git checkout -b chore/dependency-updates-<mes-año>
```

Ejemplo: `chore/dependency-updates-mayo-2026`. Si ya existe una rama así abierta, pregunta al usuario si la reutiliza o crea una nueva.

## Paso 2 — Detectar candidatas

Ejecuta en paralelo:

```bash
npm outdated
npx ng update
```

`npm outdated` lista todas las dependencias con versión nueva disponible. `npx ng update` lista las del ecosistema Angular gestionables atómicamente vía esa herramienta.

## Paso 3 — Clasificar por riesgo

Para cada paquete con actualización, clasifícalo usando esta tabla:

| Categoría | Criterio | Acción |
|---|---|---|
| **A — Angular patch/minor** | Dentro de la misma major (21.x → 21.y), gestionable por `ng update` | Actualizar en bloque vía `ng update` |
| **B — Resto patch/minor** | `npm outdated` muestra cambio dentro de la misma major | Instalar con `--save-exact` |
| **C — Major** | Cambio de `X.y.z` → `(X+1).0.0` o superior | **STOP** — generar informe y pedir decisión al usuario |
| **D — Bloqueado por peer-dep** | Conflicto con `@angular/build` o equivalente que Vercel no acepta | **STOP** — documentar y descartar |

### Conocimientos del proyecto a aplicar al clasificar

Antes de marcar un paquete como categoría B, comprueba si tiene un peer-dep que lo metería en D:

- **TypeScript ≥ 6**: bloqueado por `@angular/build` (peer `typescript: ">=5.9 <6.0"`). Vercel no acepta `--legacy-peer-deps`. Espera a Angular 22.
- **typescript-eslint** debe ser compatible con la versión de TS instalada (revisar peer `typescript: ">=4.8.4 <X"`).
- **knip 6.10+** introduce un check estricto de exports usados solo dentro del propio fichero. Si lo subes y no estaba ya, hay que añadir `ignoreExportsUsedInFile: true` al `knip.config.ts` (la convención del proyecto es exportar todos los tipos del schema de DB para auto-documentación).

Cuando un paquete entra en C o D, **muestra al usuario** un bloque con: paquete, versión actual, versión candidata, motivo del bloqueo o riesgo, y pregúntale si quiere saltárselo o intentar igualmente.

## Paso 4 — Aplicar las actualizaciones seguras

### 4a — Categoría A (Angular ecosystem)

Una sola invocación atómica para que `ng update` resuelva peer-deps en bloque:

```bash
npx ng update @angular/cli @angular/core @angular/material angular-eslint
```

Añade o quita paquetes de la lista según lo que `npx ng update` haya reportado.

### 4b — Categoría B (resto)

```bash
npm install --save-exact paquete-1@version paquete-2@version ...
```

Una sola invocación con todos los paquetes para que npm resuelva en una sola pasada. **`--save-exact` es obligatorio** — Vercel no acepta `--legacy-peer-deps` y los rangos abiertos causan fallos de build por desajustes de peer deps entre entornos.

## Paso 5 — Quitar rangos `^` y `~`

Después de las dos instalaciones, abre `package.json` y comprueba que **ninguna** dependencia tiene `^` o `~`. Si npm añadió alguno, quítalo manualmente. Repite hasta que el grep esté limpio:

```bash
grep -E '"\^|"~' package.json
```

## Paso 6 — Sincronizar lock file

```bash
npm install
```

Sin argumentos, para que `package-lock.json` quede consistente con el `package.json` actualizado.

## Paso 7 — Verificar

Ejecuta en este orden, parando al primer fallo:

```bash
npm run build
npm test
npm run lint
npm run check:unused
```

- **Build**: el bundle de producción debe compilar.
- **Tests**: 100 % verde.
- **Lint**: 0 errores y 0 warnings.
- **Knip**: limpio.

### Si knip falla tras subir el propio knip

Es esperable cuando se sube `knip` a una versión con un check nuevo (ej. el de exports usados solo dentro de su fichero). Antes de tocar código, valida los hallazgos:

1. Para cada export flagueado, busca si se usa en otro fichero (`grep -rn "\bSimbolo\b" src --include="*.ts"`).
2. Si **solo se usa en su propio fichero** como base de tipos derivados (`extends`, `Pick<X>`, `Partial<X>`, propiedad de otra interface), es el patrón "export redundante por convención del proyecto" — la solución es añadir `ignoreExportsUsedInFile: true` al `knip.config.ts`, **no** quitar el `export`.
3. Si **no se usa en ningún sitio**, es código muerto real — bórralo.
4. Si está **duplicado** (definición idéntica en dos ficheros), unifica importando del canónico.

## Paso 8 — Reportar y dejar listo para PR

Resume al usuario, en un único mensaje:

- Categoría A actualizada (Angular X.Y.Z → X.Y.W).
- Categoría B actualizada (lista compacta).
- Categoría C / D omitida y por qué (un párrafo por paquete).
- Resultado de los 4 checks de verificación.
- Cambios adicionales aplicados (knip config, dedups, etc.).

No hagas commit ni push. El usuario decide cuándo abrir PR (`/pr`).

## Reglas

- **Versiones exactas siempre**. Sin `^` ni `~`. Es la convención del proyecto y la única forma de evitar que Vercel falle.
- **Angular ecosystem solo vía `ng update`**. Nunca `npm install` directo para `@angular/*`, `@angular-devkit/*` ni `@angular-eslint/*` — `ng update` resuelve peer-deps de forma atómica que npm no replica.
- **Majors no se aplican automáticamente**. Aunque parezcan inocuos. Cada major requiere lectura del CHANGELOG y validación.
- **Sin `--legacy-peer-deps` jamás**. Vercel lo prohíbe; si un paquete no instala sin ese flag, va a categoría D.
- **No hacer commit ni push**. El skill deja la rama lista; el usuario lanza `/pr` cuando quiera.
