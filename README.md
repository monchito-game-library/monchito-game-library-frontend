**English** | [Español](README.es.md)

> This is the canonical version. The Spanish translation is in [README.es.md](README.es.md).

# Monchito Game Library

A personal video game collection manager built with Angular 21. Track your games, consoles, controllers, accessories, wishlists, sales, and group orders — all in one place.

## Demo

> Live: [https://monchito-game-library.vercel.app](https://monchito-game-library.vercel.app)

## Table of Contents

- [What you can do](#what-you-can-do)
- [Main flows](#main-flows)
- [Retro UI library](#retro-ui-library)
- [Tech stack](#tech-stack)
- [Installation](#installation)
- [Scripts](#scripts)
- [Architecture](#architecture)
- [Performance](#performance)
- [CI](#ci)
- [Credits](#credits)
- [License](#license)

## What you can do

### Game collection

- Add, edit, and delete games with cover art, genre, platform, year, and personal rating.
- Mark games as completed, in progress, or pending.
- Filter and search by platform, genre, status, and rating.
- Virtual scroll for large collections.

### Consoles & controllers

- Catalog your hardware: consoles, controllers, accessories, and protectors.
- Attach purchase details (store, price, date) and condition notes.

### Wishlist

- Keep a wishlist of games you want to buy.
- Set priority levels and target prices.

### Sales

- Record second-hand sales with buyer info and price.
- See sold items separately from the active collection.

### Group orders

- Organize group purchases with friends.
- Track who ordered what and the payment status.

### Management panel

- Admin view: manage all collection entities, platforms, genres, and stores.

### Settings & profile

- Update your profile, preferred language (i18n via Transloco), and app preferences.

## Main flows

| Flow                    | Entry point                 |
| ----------------------- | --------------------------- |
| Add a game              | Collection → + button       |
| Edit hardware           | Consoles → item card → edit |
| Create a wishlist entry | Wishlist → + button         |
| Record a sale           | Sales → + button            |
| Start a group order     | Orders → + button           |

## Retro UI library

The project ships an in-house component library at `lib/retro/` — 26 fully-typed, OnPush Angular components with SCSS BEM styles, designed to match the app's retro aesthetic:

`retro-button` · `retro-icon` · `retro-card` · `retro-list` · `retro-list-item` · `retro-chip` · `retro-data-row` · `retro-section-header` · `retro-command-bar` · `retro-empty-state` · `retro-icon-button` · `retro-spinner` · `retro-skeleton` · `retro-checkbox` · `retro-snackbar-host` · `retro-input` · `retro-textarea` · `retro-select` · `retro-option` · `retro-search` · `retro-datepicker` · `retro-menu` · `retro-menu-item` · `retro-tabs` · `retro-tab` · `retro-segmented`

The library has its own ESLint config, `public-api.ts`, and 90% test-coverage threshold. It cannot import anything from `src/`.

## Tech stack

| Layer               | Technology                                                 |
| ------------------- | ---------------------------------------------------------- |
| Framework           | Angular 21.2                                               |
| UI library          | In-house `lib/retro/` (26 components) + Angular CDK 21.2.9 |
| i18n                | Transloco (`@jsverse/transloco`) 8.3.0                     |
| Backend / DB        | Supabase (PostgreSQL + Auth + RLS) · supabase-js 2.105.1   |
| Game data API       | RAWG API                                                   |
| Error tracking      | Sentry 10.51.0                                             |
| Reactive layer      | RxJS 7.8.2                                                 |
| Styles              | SCSS with design tokens                                    |
| Progressive Web App | Angular Service Worker                                     |
| Virtual scroll      | Angular CDK Virtual Scroll                                 |
| Testing             | Vitest 4.1.5 + `@vitest/coverage-v8` + happy-dom           |
| Linting             | ESLint 10.3.0 + Angular ESLint                             |
| Formatting          | Prettier 3.8.3                                             |
| Dead-code detection | Knip 6.10.0                                                |
| Performance         | Playwright + Lighthouse CI                                 |
| Git hooks           | Husky 9 + lint-staged 16                                   |
| CI/CD               | GitHub Actions + Vercel                                    |
| Language            | TypeScript 5.9.3                                           |
| Runtime             | Node 24.x                                                  |

## Installation

**Prerequisites:** Node 24.x, npm 10.x, a Supabase project, a RAWG API key.

```bash
git clone https://github.com/monchito-game-library/monchito-game-library-frontend.git
cd monchito-game-library-frontend
npm ci
```

Copy the environment template and fill in your credentials:

```bash
cp src/environments/environment.example.ts src/environments/environment.ts
```

`src/environments/environment.example.ts` contains:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'YOUR_SUPABASE_URL',
    anonKey: 'YOUR_SUPABASE_ANON_KEY'
  },
  rawg: {
    apiUrl: 'https://api.rawg.io/api',
    apiKey: 'YOUR_RAWG_API_KEY'
  },
  sentry: {
    dsn: '',
    enabled: false,
    release: ''
  }
};
```

For local DB-patch tooling (`npm run db:apply` / `npm run db:dump`), also copy `.env.example` to `.env` and fill in the Supabase connection string.

Database setup:

```bash
# Apply schema and seed data
npm run db:apply
```

See [`docs/backend/SUPABASE_SETUP.md`](docs/backend/SUPABASE_SETUP.md) for full Supabase setup instructions and [`docs/backend/RAWG.md`](docs/backend/RAWG.md) for RAWG API configuration.

Start the dev server:

```bash
npm start
```

## Scripts

### Development

| Script                  | Description                          |
| ----------------------- | ------------------------------------ |
| `npm start`             | Start dev server at `localhost:4200` |
| `npm run build`         | Production build                     |
| `npm run vercel-build`  | Vercel production build              |
| `npm run clean:install` | Remove `node_modules` and reinstall  |

### Testing

| Script                        | Description                        |
| ----------------------------- | ---------------------------------- |
| `npm test`                    | Run all tests (retro + app)        |
| `npm run test:watch`          | Watch mode                         |
| `npm run test:retro:coverage` | Retro lib coverage (threshold 90%) |
| `npm run test:app:coverage`   | App coverage (threshold 80%)       |
| `npm run test:eslint-rules`   | Test custom ESLint rules           |

### Linting & formatting

| Script                       | Description                   |
| ---------------------------- | ----------------------------- |
| `npm run lint`               | Lint everything               |
| `npm run lint:retro`         | Lint `lib/retro/` only        |
| `npm run lint:app`           | Lint `src/` only              |
| `npm run format`             | Format with Prettier          |
| `npm run format:check`       | Check formatting              |
| `npm run check:unused`       | Dead-code check (retro + app) |
| `npm run check:unused:retro` | Dead-code check `lib/retro/`  |
| `npm run check:unused:app`   | Dead-code check `src/`        |

### Database

| Script             | Description                           |
| ------------------ | ------------------------------------- |
| `npm run db:apply` | Apply pending SQL patches to Supabase |
| `npm run db:dump`  | Dump current schema from Supabase     |

### Documentation & performance

| Script                     | Description                                |
| -------------------------- | ------------------------------------------ |
| `npm run docs:retro-check` | Verify retro component READMEs are in sync |
| `npm run lighthouse`       | Run Lighthouse performance audit           |

## Architecture

```
presentation  ──→  domain (repository contracts)  ──→  data (repository implementations)
                          ↕                                         ↕
                       entities                              data/dtos + mappers
```

Layers:

- **`src/app/entities/`** — domain models, interfaces, types, constants.
- **`src/app/domain/`** — use-case interfaces and repository contracts.
- **`src/app/data/`** — repository implementations, DTOs, mappers, Supabase client.
- **`src/app/di/`** — Angular DI providers wiring domain ↔ data.
- **`src/app/presentation/`** — Angular components, pages, guards, services.

Pages: `auth`, `collection`, `management`, `orders`, `sale`, `settings`, `wishlist`.

Path aliases (from `tsconfig.json`):

| Alias            | Maps to                             |
| ---------------- | ----------------------------------- |
| `@/entities/*`   | `src/app/entities/*`                |
| `@/domain/*`     | `src/app/domain/*`                  |
| `@/data/*`       | `src/app/data/*`                    |
| `@/components/*` | `src/app/presentation/components/*` |
| `@/pages/*`      | `src/app/presentation/pages/*`      |
| `@retro/*`       | `lib/retro/*`                       |

## Performance

- Virtual scroll on all collection lists (CDK Virtual Scroll).
- Angular lazy-loaded routes per page.
- Service Worker for offline caching.
- Lighthouse CI audits run on every PR.

See [`docs/operations/VERCEL_DEPLOY.md`](docs/operations/VERCEL_DEPLOY.md) for deployment configuration.

## CI

Two-job GitHub Actions pipeline (`.github/workflows/ci.yml`):

```
retro job:
  lint:retro → check:unused:retro → test:retro:coverage (threshold 90%)

app job (needs: retro):
  generate environment.ts from secrets → build → test:eslint-rules
  → lint:app → check:unused:app → test:app:coverage (threshold 80%)
```

PRs cannot merge if either job fails or coverage drops below threshold.

## Credits

- Game cover data: [RAWG API](https://rawg.io/apidocs)
- Database & auth: [Supabase](https://supabase.com)
- Deployment: [Vercel](https://vercel.com)

## License

MIT
