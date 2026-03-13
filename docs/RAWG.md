# RAWG API — Integración

> Documentación oficial: https://api.rawg.io/docs/

---

## Configuración

La API key se configura en `src/environments/environment.ts`:

```typescript
rawg: {
  apiUrl: 'https://api.rawg.io/api',
  apiKey: 'TU_API_KEY'   // vacío → funciona sin key pero con rate limit más bajo
}
```

Sin key la API funciona igualmente pero con un límite más restrictivo.
Con key registrada (gratuita): **20.000 requests/mes**.

---

## Endpoints usados

| Método | Endpoint | Uso en la app |
|---|---|---|
| GET | `/games?search=...&page=1&page_size=20` | Búsqueda de juegos en el formulario add/edit |
| GET | `/games?ordering=-rating&page_size=12` | Top juegos para el selector de banner en Settings |
| GET | `/games/{id}` | Detalle completo de un juego (no usado actualmente en UI) |

---

## Flujo de búsqueda (formulario add/edit)

```
Usuario escribe en el input
        ↓ debounce 400ms
RawgRepository.searchGames(query)
        ↓ GET /games?search=...
mapRawgGame(dto)  →  GameCatalogDto[]
        ↓
Se muestran como cards en el panel de búsqueda inline
        ↓ usuario selecciona
selectedGame signal  →  rellena el formulario
        ↓ al guardar
_getOrCreateGameCatalog()  →  inserta en game_catalog si no existe
```

---

## Mapping RAWG → GameCatalogDto

### `GET /games` (búsqueda) — `mapRawgGame`

| Campo RAWG | Campo local | Notas |
|---|---|---|
| `id` | `rawg_id` | |
| `slug` | `slug` | |
| `name` | `title` | |
| `released` | `released_date` | |
| `tba` | `tba` | |
| `background_image` | `image_url` | |
| `rating` | `rating` | |
| `rating_top` | `rating_top` | |
| `ratings_count` | `ratings_count` | |
| `metacritic` | `metacritic_score` | |
| `esrb_rating.name` | `esrb_rating` | |
| `platforms[].platform.name` | `platforms` | Array de nombres |
| `parent_platforms[].platform.name` | `parent_platforms` | |
| `genres[].name` | `genres` | |
| `tags[].name` (primeros 10) | `tags` | Limitado a 10 |
| `stores[]` | `stores` | `{id, name, url}` |
| `short_screenshots[].image` | `screenshots` | |
| — | `developers` | Vacío en búsqueda (solo en detalle) |
| — | `publishers` | Vacío en búsqueda (solo en detalle) |

### `GET /games/{id}` (detalle) — `mapRawgGameDetail`

Igual que la búsqueda más:

| Campo RAWG | Campo local | Notas |
|---|---|---|
| `description` | `description` | Con HTML |
| `description_raw` | `description_raw` | Sin HTML |
| `metacritic_url` | `metacritic_url` | |
| `developers[].name` | `developers` | |
| `publishers[].name` | `publishers` | |
| `stores[].store.domain` | `stores[].domain` | |
| `website` | `website` | |
| `tags[].name` (primeros 15) | `tags` | 15 en detalle vs 10 en búsqueda |

---

## Ficheros relevantes

```
src/app/
├── data/
│   ├── repositories/rawg.repository.ts       — implementación (fetch nativo)
│   ├── dtos/rawg/rawg-game.dto.ts            — tipos de la respuesta RAWG
│   └── mappers/rawg/rawg.mapper.ts           — RAWG → GameCatalogDto
├── domain/
│   └── repositories/rawg.repository.contract.ts  — contrato (interfaz)
└── di/
    └── repositories/rawg.provider.ts         — provider DI
```
