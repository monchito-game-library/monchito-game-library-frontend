# Guía de Migración al Schema V3 Mejorado

## 📋 Resumen de cambios

El Schema V3 introduce mejoras significativas para aprovechar al máximo la API de RAWG.io y soportar juegos añadidos manualmente por usuarios.

---

## 🆕 Nuevas características

### 1. **Juegos añadidos manualmente**
- ✅ Campo `rawg_id` ahora es **NULLABLE**
- ✅ Campo `source` ('rawg' | 'manual')
- ✅ Campo `added_by_user_id` para saber quién añadió el juego
- ✅ Permite añadir juegos que no están en RAWG (indies, retro, regionales)

### 2. **Más campos de RAWG**
- ✅ `metacritic_score` y `metacritic_url`
- ✅ `esrb_rating` (clasificación por edad)
- ✅ `parent_platforms` (PlayStation, Xbox, PC, Nintendo)
- ✅ `tags` (Singleplayer, Story Rich, Open World, etc.)
- ✅ `developers` y `publishers`
- ✅ `stores` (tiendas digitales: Steam, PSN, etc.)
- ✅ `screenshots` (hasta 6 capturas)
- ✅ `website` (sitio oficial del juego)
- ✅ `tba` (To Be Announced - fecha no confirmada)

### 3. **Sistema de estados del juego**
- ✅ Campo `status` en `user_games`:
  - `backlog` - Sin empezar
  - `playing` - Jugando actualmente
  - `completed` - Completado
  - `platinum` - Platino conseguido
  - `abandoned` - Abandonado
  - `owned` - Solo lo tengo

### 4. **Rating y reviews personales**
- ✅ `personal_rating` (0-10)
- ✅ `personal_review` (texto)

### 5. **Tracking de gameplay**
- ✅ `hours_played`
- ✅ `started_date`
- ✅ `completed_date`
- ✅ `platinum_date`

### 6. **Sistema de favoritos**
- ✅ `is_favorite` en `user_games`

### 7. **Wishlist dedicada**
- ✅ Nueva tabla `user_wishlist`
- ✅ `desired_price` - Precio objetivo
- ✅ `priority` (1-5)
- ✅ `notify_on_sale` - Alertas de precio

### 8. **Estadísticas automáticas**
- ✅ `times_added_by_users` en `game_catalog`
- ✅ Triggers para mantener contadores actualizados

### 9. **Búsqueda mejorada**
- ✅ Índices GIN para arrays (plataformas, géneros, tags)
- ✅ Full-text search en múltiples campos
- ✅ Función `search_game_catalog()` con relevancia

### 10. **Vistas útiles**
- ✅ `user_games_full` - user_games + game_catalog
- ✅ `game_catalog_stats` - Estadísticas del catálogo
- ✅ `user_wishlist_full` - wishlist + game_catalog

---

## 📊 Comparación de schemas

### **game_catalog**

| Campo | V2 | V3 | Notas |
|-------|----|----|-------|
| `rawg_id` | INTEGER UNIQUE NOT NULL | INTEGER UNIQUE | Ahora permite NULL |
| `source` | ❌ | ✅ TEXT | 'rawg' o 'manual' |
| `description_raw` | ❌ | ✅ TEXT | Versión sin HTML |
| `tba` | ❌ | ✅ BOOLEAN | Fecha no confirmada |
| `metacritic_score` | ❌ | ✅ INTEGER | Score 0-100 |
| `metacritic_url` | ❌ | ✅ TEXT | URL de Metacritic |
| `esrb_rating` | ❌ | ✅ TEXT | E, T, M, etc. |
| `parent_platforms` | ❌ | ✅ TEXT[] | PlayStation, Xbox, PC |
| `tags` | ❌ | ✅ TEXT[] | Story Rich, RPG, etc. |
| `developers` | ❌ | ✅ TEXT[] | FromSoftware, etc. |
| `publishers` | ❌ | ✅ TEXT[] | Bandai Namco, etc. |
| `stores` | ❌ | ✅ JSONB | Tiendas digitales |
| `screenshots` | ❌ | ✅ TEXT[] | URLs de capturas |
| `website` | ❌ | ✅ TEXT | Sitio oficial |
| `added_by_user_id` | ❌ | ✅ UUID | Quién lo añadió |
| `times_added_by_users` | ❌ | ✅ INTEGER | Popularidad |
| `ratings_count` | ❌ | ✅ INTEGER | Número de ratings |
| `reviews_count` | ❌ | ✅ INTEGER | Número de reviews |
| `rating_top` | ❌ | ✅ INTEGER | Rating máximo |
| `last_synced_at` | ❌ | ✅ TIMESTAMP | Última sync RAWG |

### **user_games**

| Campo | V2 | V3 | Notas |
|-------|----|----|-------|
| `status` | ❌ | ✅ TEXT | Estado del juego |
| `personal_rating` | ❌ | ✅ NUMERIC(2,1) | Rating 0-10 |
| `personal_review` | ❌ | ✅ TEXT | Review personal |
| `hours_played` | ❌ | ✅ INTEGER | Horas jugadas |
| `started_date` | ❌ | ✅ DATE | Fecha inicio |
| `completed_date` | ❌ | ✅ DATE | Fecha completado |
| `platinum_date` | ❌ | ✅ DATE | Fecha platino |
| `tags_personal` | ❌ | ✅ TEXT[] | Tags personales |
| `is_favorite` | ❌ | ✅ BOOLEAN | Favorito |

### **user_wishlist** (NUEVA TABLA)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | PK |
| `user_id` | UUID | FK auth.users |
| `game_catalog_id` | UUID | FK game_catalog |
| `desired_price` | NUMERIC(10,2) | Precio objetivo |
| `priority` | INTEGER | 1-5 (1=max) |
| `notes` | TEXT | Notas |
| `notify_on_sale` | BOOLEAN | Alertas |
| `created_at` | TIMESTAMP | Creación |
| `updated_at` | TIMESTAMP | Actualización |

---

## 🔄 Pasos de migración

### **Opción A: Migración desde V2 existente**

Si ya tienes datos en producción con el schema V2:

```sql
-- 1. Hacer backup
pg_dump -h <host> -U <user> -d <database> > backup_before_v3.sql

-- 2. Añadir columnas nuevas a game_catalog
ALTER TABLE game_catalog ALTER COLUMN rawg_id DROP NOT NULL;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'rawg' CHECK (source IN ('rawg', 'manual'));
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS description_raw TEXT;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS tba BOOLEAN DEFAULT FALSE;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS background_image_additional TEXT;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS rating_top INTEGER DEFAULT 5;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS ratings_count INTEGER DEFAULT 0;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS reviews_count INTEGER DEFAULT 0;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS metacritic_score INTEGER;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS metacritic_url TEXT;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS esrb_rating TEXT;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS parent_platforms TEXT[] DEFAULT '{}';
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS developers TEXT[] DEFAULT '{}';
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS publishers TEXT[] DEFAULT '{}';
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS stores JSONB DEFAULT '[]';
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}';
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS added_by_user_id UUID REFERENCES auth.users(id);
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS times_added_by_users INTEGER DEFAULT 0;
ALTER TABLE game_catalog ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- 3. Añadir columnas nuevas a user_games
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'owned' CHECK (status IN ('wishlist', 'backlog', 'playing', 'completed', 'platinum', 'abandoned', 'owned'));
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS personal_rating NUMERIC(2,1) CHECK (personal_rating >= 0 AND personal_rating <= 10);
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS personal_review TEXT;
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS hours_played INTEGER DEFAULT 0;
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS started_date DATE;
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS completed_date DATE;
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS platinum_date DATE;
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS tags_personal TEXT[] DEFAULT '{}';
ALTER TABLE user_games ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE;

-- 4. Actualizar datos existentes
-- Actualizar status basado en platinum
UPDATE user_games SET status = 'platinum' WHERE platinum = TRUE;

-- Calcular times_added_by_users
UPDATE game_catalog gc
SET times_added_by_users = (
  SELECT COUNT(DISTINCT user_id)
  FROM user_games ug
  WHERE ug.game_catalog_id = gc.id
);

-- 5. Crear tabla user_wishlist
-- (ejecutar desde supabase-schema-v3-enhanced.sql líneas 103-127)

-- 6. Crear índices nuevos
-- (ejecutar desde supabase-schema-v3-enhanced.sql líneas 25-51)

-- 7. Crear triggers
-- (ejecutar desde supabase-schema-v3-enhanced.sql líneas 154-193)

-- 8. Crear vistas
-- (ejecutar desde supabase-schema-v3-enhanced.sql líneas 198-251)

-- 9. Crear funciones
-- (ejecutar desde supabase-schema-v3-enhanced.sql líneas 256-285)

-- 10. Verificar migración
SELECT COUNT(*) FROM game_catalog;
SELECT COUNT(*) FROM user_games;
SELECT * FROM user_games_full LIMIT 5;
```

### **Opción B: Instalación limpia**

Si estás empezando desde cero:

```bash
# Ejecutar el schema completo
psql -h <host> -U <user> -d <database> -f docs/supabase-schema-v3-enhanced.sql
```

---

## 🎯 Ejemplos de uso

### **1. Añadir juego de RAWG al catálogo**

```typescript
// Buscar en RAWG
const rawgGame = await rawgService.searchGames('Elden Ring');
const game = rawgGame.results[0];

// Convertir y guardar en catálogo
const catalogGame: GameCatalogV3 = {
  rawg_id: game.id,
  slug: game.slug,
  title: game.name,
  description_raw: game.description_raw,
  released_date: game.released,
  tba: game.tba,
  image_url: game.background_image,
  rating: game.rating,
  rating_top: game.rating_top,
  ratings_count: game.ratings_count,
  metacritic_score: game.metacritic,
  esrb_rating: game.esrb_rating?.name || null,
  platforms: game.platforms.map(p => p.platform.name),
  parent_platforms: game.parent_platforms.map(pp => pp.platform.name),
  genres: game.genres.map(g => g.name),
  tags: game.tags.slice(0, 10).map(t => t.name),
  developers: game.developers?.map(d => d.name) || [],
  publishers: game.publishers?.map(p => p.name) || [],
  stores: game.stores?.map(s => ({
    id: s.store.id,
    name: s.store.name,
    url: s.url
  })) || [],
  screenshots: game.short_screenshots?.map(ss => ss.image) || [],
  website: game.website,
  source: 'rawg'
};

await supabase.from('game_catalog').insert(catalogGame);
```

### **2. Añadir juego manual al catálogo**

```typescript
const manualGame: GameCatalogV3 = {
  rawg_id: null,  // ¡NULL para juegos manuales!
  slug: 'pokemon-esmeralda',
  title: 'Pokémon Esmeralda',
  released_date: '2004-09-16',
  image_url: null,
  rating: 0,
  platforms: ['Game Boy Advance'],
  genres: ['RPG', 'Adventure'],
  source: 'manual',
  added_by_user_id: currentUserId
};

await supabase.from('game_catalog').insert(manualGame);
```

### **3. Añadir juego a MI colección**

```typescript
const userGame: UserGame = {
  user_id: currentUserId,
  game_catalog_id: catalogGameId,
  price: 69.99,
  store: 'gm-ibe',
  platform: 'PS5',
  condition: 'new',
  purchased_date: '2024-02-12',
  status: 'playing',
  platinum: false,
  personal_rating: 9.5,
  personal_review: '¡Increíble juego! Muy difícil pero satisfactorio.',
  hours_played: 45,
  started_date: '2024-02-15',
  is_favorite: true
};

await supabase.from('user_games').insert(userGame);
```

### **4. Añadir a wishlist**

```typescript
const wishlistItem: UserWishlist = {
  user_id: currentUserId,
  game_catalog_id: catalogGameId,
  desired_price: 39.99,
  priority: 2,  // Alta prioridad
  notes: 'Esperar a que baje de precio',
  notify_on_sale: true
};

await supabase.from('user_wishlist').insert(wishlistItem);
```

### **5. Buscar en catálogo**

```typescript
// Búsqueda simple
const { data } = await supabase
  .from('game_catalog')
  .select('*')
  .ilike('title', '%elden%');

// Búsqueda full-text con relevancia
const { data } = await supabase
  .rpc('search_game_catalog', { search_query: 'dark souls rpg' });

// Filtrar por género y plataforma
const { data } = await supabase
  .from('game_catalog')
  .select('*')
  .contains('genres', ['RPG'])
  .contains('platforms', ['PlayStation 5']);
```

### **6. Obtener mis juegos con datos del catálogo**

```typescript
const { data } = await supabase
  .from('user_games_full')
  .select('*')
  .eq('user_id', currentUserId)
  .order('created_at', { ascending: false });
```

### **7. Estadísticas del catálogo**

```typescript
const { data } = await supabase
  .from('game_catalog_stats')
  .select('*')
  .order('actual_users_count', { ascending: false })
  .limit(10);
// Top 10 juegos más populares
```

---

## 🚀 Próximos pasos

1. **Ejecutar migración** en Supabase
2. **Actualizar interfaces** en el código (usar game-catalog-v3.interface.ts)
3. **Actualizar RawgService** para mapear todos los campos nuevos
4. **Actualizar SupabaseRepository** para trabajar con el nuevo schema
5. **Crear componentes**:
   - `AddManualGameDialogComponent`
   - `GameCatalogSearchComponent` (mejorado)
   - `GlobalCatalogPageComponent`
   - `WishlistPageComponent`
   - `GameStatsComponent`

---

## ❓ Preguntas frecuentes

**P: ¿Qué pasa con los datos existentes?**
R: La migración añade columnas nuevas pero no elimina nada. Tus datos actuales se mantienen intactos.

**P: ¿Puedo revertir a V2?**
R: Sí, simplemente elimina las columnas nuevas. Por eso es importante hacer backup primero.

**P: ¿Cuánto espacio adicional ocupa?**
R: Aproximadamente 30-40% más por juego debido a los campos adicionales (tags, developers, screenshots, etc.).

**P: ¿Afecta al rendimiento?**
R: No. Los índices GIN y full-text search mejoran el rendimiento de búsquedas.

**P: ¿Necesito API key de RAWG?**
R: No es obligatoria, pero recomendada para evitar rate limits.

---

## 📚 Referencias

- [Documentación RAWG API](https://api.rawg.io/docs/)
- [Supabase Full-Text Search](https://supabase.com/docs/guides/database/full-text-search)
- [PostgreSQL GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
- [PostgreSQL Array Functions](https://www.postgresql.org/docs/current/functions-array.html)
