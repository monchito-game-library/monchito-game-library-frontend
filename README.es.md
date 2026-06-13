[English](README.md) | **Español**

> Esta es la traducción al español. La versión canónica está en [README.md](README.md).

# Monchito Game Library

Un gestor personal de colección de videojuegos construido con Angular 21. Gestiona tus juegos, consolas, mandos, accesorios, listas de deseos, ventas y pedidos en grupo — todo en un solo lugar.

## Demo

> En vivo: [https://monchito-game-library.vercel.app](https://monchito-game-library.vercel.app)

## Tabla de contenidos

- [Qué puedes hacer](#qué-puedes-hacer)
- [Flujos principales](#flujos-principales)
- [Librería UI Retro](#librería-ui-retro)
- [Stack tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Scripts](#scripts)
- [Arquitectura](#arquitectura)
- [Rendimiento](#rendimiento)
- [CI](#ci)
- [Créditos](#créditos)
- [Licencia](#licencia)

## Qué puedes hacer

### Colección de juegos

- Añade, edita y elimina juegos con portada, género, plataforma, año y puntuación personal.
- Marca juegos como completado, en progreso o pendiente.
- Filtra y busca por plataforma, género, estado y puntuación.
- Scroll virtual para colecciones grandes.

### Consolas y mandos

- Cataloga tu hardware: consolas, mandos, accesorios y fundas.
- Añade detalles de compra (tienda, precio, fecha) y notas de estado.

### Lista de deseos

- Mantén una lista de juegos que quieres comprar.
- Establece niveles de prioridad y precios objetivo.

### Ventas

- Registra ventas de segunda mano con datos del comprador y precio.
- Consulta los artículos vendidos separados de la colección activa.

### Pedidos en grupo

- Organiza compras en grupo con amigos.
- Controla quién pidió qué y el estado del pago.

### Panel de gestión

- Vista de administración: gestiona entidades de colección, plataformas, géneros y tiendas.

### Ajustes y perfil

- Actualiza tu perfil, idioma preferido (i18n con Transloco) y preferencias de la app.

## Flujos principales

| Flujo                            | Punto de entrada                    |
| -------------------------------- | ----------------------------------- |
| Añadir un juego                  | Colección → botón +                 |
| Editar hardware                  | Consolas → tarjeta de ítem → editar |
| Crear entrada en lista de deseos | Lista de deseos → botón +           |
| Registrar una venta              | Ventas → botón +                    |
| Iniciar un pedido en grupo       | Pedidos → botón +                   |

## Librería UI Retro

El proyecto incluye una librería de componentes propia en `lib/retro/` — 26 componentes Angular totalmente tipados, OnPush, con estilos SCSS BEM, diseñados para el estilo retro de la app:

`retro-button` · `retro-card` · `retro-chip` · `retro-datepicker` · `retro-dialog` · `retro-icon-button` · `retro-input` · `retro-label` · `retro-list` · `retro-loader` · `retro-menu` · `retro-navbar` · `retro-overlay` · `retro-pagination` · `retro-placeholder` · `retro-radio` · `retro-range` · `retro-scrollbar` · `retro-search` · `retro-select` · `retro-side-panel` · `retro-snackbar` · `retro-tabs` · `retro-tooltip` · `retro-upload`

La librería tiene su propia configuración ESLint, `public-api.ts` y umbral de cobertura del 90%. No puede importar nada de `src/`.

## Stack tecnológico

| Capa                       | Tecnología                                                |
| -------------------------- | --------------------------------------------------------- |
| Framework                  | Angular 21.2                                              |
| Librería UI                | `lib/retro/` propia (26 componentes) + Angular CDK 21.2.9 |
| i18n                       | Transloco (`@jsverse/transloco`) 8.3.0                    |
| Backend / BD               | Supabase (PostgreSQL + Auth + RLS) · supabase-js 2.105.1  |
| API de datos de juegos     | RAWG API                                                  |
| Seguimiento de errores     | Sentry 10.51.0                                            |
| Capa reactiva              | RxJS 7.8.2                                                |
| Estilos                    | SCSS con design tokens                                    |
| Progressive Web App        | Angular Service Worker                                    |
| Scroll virtual             | Angular CDK Virtual Scroll                                |
| Testing                    | Vitest 4.1.5 + `@vitest/coverage-v8` + happy-dom          |
| Linting                    | ESLint 10.3.0 + Angular ESLint                            |
| Formateo                   | Prettier 3.8.3                                            |
| Detección de código muerto | Knip 6.10.0                                               |
| Rendimiento                | Playwright + Lighthouse CI                                |
| Git hooks                  | Husky 9 + lint-staged 16                                  |
| CI/CD                      | GitHub Actions + Vercel                                   |
| Lenguaje                   | TypeScript 5.9.3                                          |
| Runtime                    | Node 24.x                                                 |

## Instalación

**Requisitos previos:** Node 24.x, npm 10.x, un proyecto Supabase, una clave de API de RAWG.

```bash
git clone https://github.com/monchito-game-library/monchito-game-library-frontend.git
cd monchito-game-library-frontend
npm ci
```

Copia la plantilla de entorno y rellena tus credenciales:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

`src/environments/environment.example.ts` contiene:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  rawg: {
    apiKey: 'YOUR_RAWG_API_KEY'
  },
  sentry: {
    dsn: 'YOUR_SENTRY_DSN'
  }
};
```

Para las herramientas locales de parches de BD (`npm run db:apply` / `npm run db:dump`), copia también `.env.example` a `.env` y rellena la cadena de conexión de Supabase.

Configuración de la base de datos:

```bash
# Aplicar esquema y datos de seed
npm run db:apply
```

Consulta [`docs/backend/SUPABASE_SETUP.md`](docs/backend/SUPABASE_SETUP.md) para instrucciones completas de configuración de Supabase y [`docs/backend/RAWG.md`](docs/backend/RAWG.md) para la configuración de la API RAWG.

Inicia el servidor de desarrollo:

```bash
npm start
```

## Scripts

### Desarrollo

| Script                  | Descripción                            |
| ----------------------- | -------------------------------------- |
| `npm start`             | Inicia el servidor en `localhost:4200` |
| `npm run build`         | Build de producción                    |
| `npm run vercel-build`  | Build de producción para Vercel        |
| `npm run clean:install` | Elimina `node_modules` y reinstala     |

### Testing

| Script                        | Descripción                           |
| ----------------------------- | ------------------------------------- |
| `npm test`                    | Ejecuta todos los tests (retro + app) |
| `npm run test:watch`          | Modo watch                            |
| `npm run test:retro:coverage` | Cobertura lib retro (umbral 90%)      |
| `npm run test:app:coverage`   | Cobertura app (umbral 80%)            |
| `npm run test:eslint-rules`   | Testea reglas ESLint personalizadas   |

### Linting y formateo

| Script                       | Descripción                              |
| ---------------------------- | ---------------------------------------- |
| `npm run lint`               | Lintea todo                              |
| `npm run lint:retro`         | Lintea solo `lib/retro/`                 |
| `npm run lint:app`           | Lintea solo `src/`                       |
| `npm run format`             | Formatea con Prettier                    |
| `npm run format:check`       | Verifica el formateo                     |
| `npm run check:unused`       | Detección de código muerto (retro + app) |
| `npm run check:unused:retro` | Código muerto en `lib/retro/`            |
| `npm run check:unused:app`   | Código muerto en `src/`                  |

### Base de datos

| Script             | Descripción                              |
| ------------------ | ---------------------------------------- |
| `npm run db:apply` | Aplica parches SQL pendientes a Supabase |
| `npm run db:dump`  | Vuelca el esquema actual de Supabase     |

### Documentación y rendimiento

| Script                     | Descripción                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| `npm run docs:retro-check` | Verifica que los README de componentes retro estén sincronizados |
| `npm run lighthouse`       | Ejecuta auditoría de rendimiento con Lighthouse                  |

## Arquitectura

```
presentation  ──→  domain (contratos de repositorios)  ──→  data (implementaciones de repositorios)
                          ↕                                              ↕
                       entities                                 data/dtos + mappers
```

Capas:

- **`src/app/entities/`** — modelos de dominio, interfaces, tipos, constantes.
- **`src/app/domain/`** — interfaces de casos de uso y contratos de repositorios.
- **`src/app/data/`** — implementaciones de repositorios, DTOs, mappers, cliente Supabase.
- **`src/app/di/`** — proveedores Angular DI que conectan dominio ↔ datos.
- **`src/app/presentation/`** — componentes Angular, páginas, guards, servicios.

Páginas: `auth`, `collection`, `management`, `orders`, `sale`, `settings`, `wishlist`.

Aliases de rutas (de `tsconfig.json`):

| Alias            | Apunta a                            |
| ---------------- | ----------------------------------- |
| `@/entities/*`   | `src/app/entities/*`                |
| `@/domain/*`     | `src/app/domain/*`                  |
| `@/data/*`       | `src/app/data/*`                    |
| `@/components/*` | `src/app/presentation/components/*` |
| `@/pages/*`      | `src/app/presentation/pages/*`      |
| `@retro/*`       | `lib/retro/*`                       |

## Rendimiento

- Scroll virtual en todas las listas de colección (CDK Virtual Scroll).
- Rutas Angular con lazy loading por página.
- Service Worker para caché offline.
- Auditorías Lighthouse CI en cada PR.

Consulta [`docs/operations/VERCEL_DEPLOY.md`](docs/operations/VERCEL_DEPLOY.md) para la configuración de despliegue.

## CI

Pipeline de GitHub Actions de dos jobs (`.github/workflows/ci.yml`):

```
job retro:
  lint:retro → check:unused:retro → test:retro:coverage (umbral 90%)

job app (needs: retro):
  genera environment.ts desde secrets → build → test:eslint-rules
  → lint:app → check:unused:app → test:app:coverage (umbral 80%)
```

Las PRs no pueden mergearse si algún job falla o la cobertura baja del umbral.

## Créditos

- Datos de portadas de juegos: [RAWG API](https://rawg.io/apidocs)
- Base de datos y autenticación: [Supabase](https://supabase.com)
- Despliegue: [Vercel](https://vercel.com)

## Licencia

MIT
