# Monchito Game Library — Convenciones del proyecto

## Al iniciar cada conversación

1. Leer `docs/BUGS.md`.
2. Si hay bugs pendientes (no marcados como resueltos), mencionarlos brevemente al usuario.
3. Si no hay ningún bug pendiente, leer `docs/ROADMAP.md` y sugerir la siguiente mejora pendiente según prioridad.

## Idioma de comunicación

- Responder siempre en **español**.

## Git

- **Nunca hacer commit ni push** a menos que el usuario lo pida explícitamente.

## Dependencias npm

- Usar **siempre versiones exactas** en `package.json`. Nunca usar rangos con `^` o `~`.
- Al instalar con `npm install`, verificar que la versión quedó fija y corregirla manualmente si npm añadió un rango.
- Razón: Vercel no acepta `--legacy-peer-deps` y los rangos abiertos causan fallos de build por desajustes de peer deps entre entornos.

```json
// ✅ Correcto
"@angular/service-worker": "21.2.3"

// ❌ Incorrecto
"@angular/service-worker": "^21.2.3"
```

## Imports

- Usar **siempre** los path aliases definidos en `tsconfig.json`. **Nunca** usar rutas relativas con `../` o `../../`.
- Los imports del mismo directorio (`./`) son aceptables únicamente cuando el fichero referenciado está en la misma carpeta.
- Aliases principales:
  ```
  @/dtos/*         → src/app/data/dtos/*
  @/data/*         → src/app/data/*
  @/repositories/* → src/app/data/repositories/*
  @/entities/*     → src/app/entities/*
  @/interfaces/*   → src/app/entities/interfaces/*
  @/types/*        → src/app/entities/types/*
  @/constants/*    → src/app/entities/constants/*
  @/domain/*       → src/app/domain/*
  @/di/*           → src/app/di/*
  @/components/*   → src/app/presentation/components/*
  @/pages/*        → src/app/presentation/pages/*
  @/services/*     → src/app/presentation/services/*
  @/guards/*       → src/app/presentation/guards/*
  @/shared/*       → src/app/presentation/shared/*
  @/abstract/*     → src/app/presentation/abstract/*
  @/models/*       → src/app/entities/models/*
  @/mappers/*      → src/app/data/mappers/*
  @/env            → src/environments/environment
  ```

## SCSS

### Espaciados

- Usar siempre **`rem`** para `gap`, `margin` y `padding`. Nunca `px`.
- Los valores deben ser **múltiplos de 0.25rem**: `0.25`, `0.5`, `0.75`, `1`, `1.25`, `1.5`, `1.75`, `2`…
- Excepción tolerada: micro-espaciados decorativos internos de chips, badges y pills (ej. `padding: 2px 8px`) pueden mantenerse en `px`.

### Clases y modificadores

- Usar **clases completas** dentro de los bloques, nunca `&__elemento`.
- Los **modificadores** (`--modificador`) sí pueden usar `&--modificador` directamente sobre el elemento al que pertenecen.

### Breakpoints responsive

- Los bloques `@media` van al final del fichero, en una sección separada.
- Cada bloque lleva un comentario separador con la resolución de referencia.

```scss
// ────────────────────────── Responsive: < 1920x1080 ──────────────────────────
@media (max-width: 1919px) { ... }

// ────────────────────────── Responsive: ≤ 1280x720 ──────────────────────────
@media (max-width: 1280px) { ... }
```

```scss
/* ✅ Correcto */
.my-component {
  .my-component__header { ... }
  .my-component__content {
    &--active { ... }   /* modificador: OK con & */
  }
}

/* ❌ Incorrecto */
.my-component {
  &__header { ... }
}
```

## Orden en componentes Angular

Dentro de la clase del componente respetar siempre este orden:

1. **Inyecciones privadas** (`private readonly _...`)
2. **Variables privadas** (subjects, flags, etc.)
3. **Variables públicas readonly** (constantes expuestas al template)
4. **Signals públicos** (`WritableSignal<T>` con JSDoc)
5. **Configuraciones públicas** (scroll config, form, etc.)
6. **Lifecycle hooks** (`ngOnInit`, `ngOnDestroy`)
7. **Métodos públicos** (handlers de template: `onXxx`, con JSDoc)
8. **Métodos privados** (lógica interna: `_loadXxx`, `_handleXxx`, con JSDoc)

## Convenciones de nombrado

### Prefijo `_` en privados

- **Todos** los campos y métodos `private` llevan prefijo `_`, tanto en componentes como en repositorios.
- Los campos `private readonly` de inyección también llevan `_`.

```typescript
// ✅ Correcto
private readonly _router: Router = inject(Router);
private readonly _userContext: UserContextService = inject(UserContextService);
private _gameId?: number;
private _loadGames(): void { ... }

// ❌ Incorrecto
private router = inject(Router);
private gameId?: number;
```

### Tipos explícitos

- Usar siempre tipos explícitos en inyecciones y señales.
- `WritableSignal<T>` en lugar de inferencia.

```typescript
// ✅ Correcto
readonly loading: WritableSignal<boolean> = signal<boolean>(false);
private readonly _router: Router = inject(Router);

// ❌ Incorrecto
readonly loading = signal(false);
private readonly router = inject(Router);
```

## JSDoc

- Todos los métodos públicos y privados llevan JSDoc (excepto lifecycle hooks: `ngOnInit`, `ngOnDestroy`, etc.).
- Los `@param` deben incluir el tipo entre llaves: `@param {string} id`.
- Las variables públicas (signals, configs) llevan JSDoc de una línea.
- El JSDoc debe describir **qué hace el método**, no solo repetir su nombre.

```typescript
// ✅ Correcto — describe el flujo completo
/**
 * Carga los juegos del usuario y actualiza la señal allGames.
 * Si ocurre un error, muestra un snackbar con el mensaje.
 */
private async _loadGames(): Promise<void> { ... }

// ✅ Con parámetros
/**
 * Elimina un juego por ID si pertenece al usuario autenticado.
 *
 * @param {number} id - ID del juego a eliminar
 */
async onGameDeleted(id: number): Promise<void> { ... }

// ❌ Incorrecto — demasiado vago
/**
 * Carga los juegos.
 */
private async _loadGames(): Promise<void> { ... }
```

## Formularios reactivos Angular

- Crear siempre una interfaz `XxxForm` (con `FormControl<T>`) en `src/app/entities/interfaces/forms/`.
- Crear también `XxxFormValue` (con tipos planos) en el mismo fichero para tipar el resultado de `getRawValue()`.

```typescript
// entities/interfaces/forms/game-form.interface.ts
export interface GameFormValue {
  title: string | null;
  platform: PlatformType | null;
}
export interface GameForm {
  title: FormControl<string | null>;
  platform: FormControl<PlatformType | null>;
}
```

## Repositorios

- Los repositorios implementan el contrato (interface) del fichero `.repository.contract.ts` de `domain/repositories/`.
- El provider DI vive en `src/app/di/repositories/`.

## Arquitectura de capas

```
presentation  →  domain (repositorios contratos)  →  data (repositorios implementaciones)
                          ↕                                    ↕
                       entities                        data/dtos
```

- La capa `presentation` nunca importa directamente de `data`.
- Los contratos de repositorio viven en `domain/repositories/`.
