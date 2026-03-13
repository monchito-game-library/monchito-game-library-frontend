-- ============================================================
-- MONCHITO GAME LIBRARY — SCHEMA ACTUAL (estado real en prod)
-- Última revisión: 2026-03-13
-- ============================================================
-- Este fichero es la fuente de verdad para recrear la base de
-- datos desde cero. Reemplaza a supabase-schema-v3-fixed.sql
-- ============================================================


-- ============================================================
-- 1. TABLA: game_catalog
--    Catálogo compartido de juegos (RAWG + manuales).
--    Un juego vive aquí una sola vez aunque varios usuarios
--    lo tengan en su colección.
-- ============================================================

CREATE TABLE IF NOT EXISTS game_catalog (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rawg_id         INTEGER     UNIQUE,           -- NULL para juegos manuales
  slug            TEXT        UNIQUE NOT NULL,

  -- Información básica
  title           TEXT        NOT NULL,
  description     TEXT,
  description_raw TEXT,                         -- Versión sin HTML
  released_date   DATE,
  tba             BOOLEAN     DEFAULT FALSE,    -- To Be Announced

  -- Imágenes
  image_url                   TEXT,
  background_image_additional TEXT,

  -- Ratings y popularidad
  rating              NUMERIC(3,2),             -- 0.00–5.00
  rating_top          INTEGER     DEFAULT 5,
  ratings_count       INTEGER     DEFAULT 0,
  reviews_count       INTEGER     DEFAULT 0,
  metacritic_score    INTEGER,                  -- 0–100
  metacritic_url      TEXT,

  -- Clasificación por edad
  esrb_rating TEXT,                             -- 'E', 'E10+', 'T', 'M', 'AO', 'RP'

  -- Plataformas
  platforms        TEXT[]  DEFAULT '{}',        -- ['PlayStation 5', 'PC', ...]
  parent_platforms TEXT[]  DEFAULT '{}',        -- ['PlayStation', 'PC', ...]

  -- Géneros y etiquetas
  genres TEXT[] DEFAULT '{}',
  tags   TEXT[] DEFAULT '{}',

  -- Desarrolladores y publishers
  developers TEXT[] DEFAULT '{}',
  publishers TEXT[] DEFAULT '{}',

  -- Tiendas digitales
  stores JSONB DEFAULT '[]',                    -- [{"id":1,"name":"Steam","url":"..."}]

  -- Capturas de pantalla (hasta 6)
  screenshots TEXT[] DEFAULT '{}',

  -- Web oficial
  website TEXT,

  -- Origen del registro
  source           TEXT NOT NULL DEFAULT 'rawg' CHECK (source IN ('rawg', 'manual')),
  added_by_user_id UUID REFERENCES auth.users(id),  -- Quién lo añadió si es manual

  -- Estadísticas de uso
  times_added_by_users INTEGER DEFAULT 0,

  -- Timestamps
  created_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at     TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE       -- Última sync con RAWG
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_game_catalog_rawg_id      ON game_catalog(rawg_id)                WHERE rawg_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_catalog_slug         ON game_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_game_catalog_source       ON game_catalog(source);
CREATE INDEX IF NOT EXISTS idx_game_catalog_rating       ON game_catalog(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_game_catalog_released     ON game_catalog(released_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_game_catalog_metacritic   ON game_catalog(metacritic_score DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_game_catalog_title_lower  ON game_catalog(LOWER(title));
-- Índices GIN para arrays
CREATE INDEX IF NOT EXISTS idx_game_catalog_platforms    ON game_catalog USING gin(platforms);
CREATE INDEX IF NOT EXISTS idx_game_catalog_genres       ON game_catalog USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_game_catalog_tags         ON game_catalog USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_game_catalog_developers   ON game_catalog USING gin(developers);


-- ============================================================
-- 2. TABLA: user_games
--    Entradas de la colección personal de cada usuario.
--    Un usuario puede tener el mismo juego del catálogo
--    en múltiples formatos/plataformas.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_games (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,

  -- Datos de compra
  price          NUMERIC(10,2),
  store          TEXT,
  platform       TEXT,
  condition      TEXT CHECK (condition IN ('new', 'used')),
  purchased_date DATE,

  -- Estado y progreso
  platinum BOOLEAN DEFAULT FALSE,
  status   TEXT    DEFAULT 'backlog' CHECK (status IN (
    'wishlist', 'backlog', 'playing', 'completed', 'platinum', 'abandoned', 'owned'
  )),

  -- Valoración personal
  personal_rating  NUMERIC(2,1) CHECK (personal_rating >= 0 AND personal_rating <= 10),
  personal_review  TEXT,

  -- Edición del ejemplar (ej: 'Deluxe Edition', 'GOTY Edition')
  edition TEXT,

  -- Fechas de tracking
  started_date   DATE,
  completed_date DATE,
  platinum_date  DATE,

  -- Notas y etiquetas personales
  description   TEXT,
  tags_personal TEXT[] DEFAULT '{}',

  -- Favorito
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_games_user_id        ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_catalog_id     ON user_games(game_catalog_id);
CREATE INDEX IF NOT EXISTS idx_user_games_platform       ON user_games(platform);
CREATE INDEX IF NOT EXISTS idx_user_games_store          ON user_games(store);
CREATE INDEX IF NOT EXISTS idx_user_games_status         ON user_games(status);
CREATE INDEX IF NOT EXISTS idx_user_games_is_favorite    ON user_games(is_favorite)  WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_games_platinum       ON user_games(platinum)     WHERE platinum = TRUE;


-- ============================================================
-- 3. TABLA: user_preferences
--    Configuración personal de cada usuario autenticado:
--    tema, idioma, avatar y banner.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme      TEXT DEFAULT 'dark'  CHECK (theme IN ('light', 'dark')),
  language   TEXT DEFAULT 'es'    CHECK (language IN ('es', 'en')),
  avatar_url TEXT,               -- URL pública del bucket 'avatars'
  banner_url TEXT,               -- URL del banner (bucket 'banners' o URL externa RAWG)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


-- ============================================================
-- 4. TABLA: user_wishlist  (definida, pendiente de uso en UI)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_wishlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
  desired_price   NUMERIC(10,2),
  priority        INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  notes           TEXT,
  notify_on_sale  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id  ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_priority ON user_wishlist(priority);


-- ============================================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================================

-- game_catalog: lectura pública, escritura autenticada
ALTER TABLE game_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game catalog"
  ON game_catalog FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert games"
  ON game_catalog FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update games"
  ON game_catalog FOR UPDATE USING (auth.uid() IS NOT NULL);

-- user_games: solo el propio usuario
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own games"
  ON user_games FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games"
  ON user_games FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games"
  ON user_games FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games"
  ON user_games FOR DELETE USING (auth.uid() = user_id);

-- user_preferences: solo el propio usuario
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON user_preferences FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert their own preferences"
  ON user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR UPDATE USING (auth.uid() = user_id);

-- user_wishlist: solo el propio usuario
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist"
  ON user_wishlist FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their wishlist"
  ON user_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their wishlist"
  ON user_wishlist FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their wishlist"
  ON user_wishlist FOR DELETE USING (auth.uid() = user_id);


-- ============================================================
-- 6. TRIGGERS — updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_game_catalog_updated_at   ON game_catalog;
CREATE TRIGGER trg_game_catalog_updated_at
  BEFORE UPDATE ON game_catalog
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_games_updated_at     ON user_games;
CREATE TRIGGER trg_user_games_updated_at
  BEFORE UPDATE ON user_games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_user_wishlist_updated_at  ON user_wishlist;
CREATE TRIGGER trg_user_wishlist_updated_at
  BEFORE UPDATE ON user_wishlist
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Contadores automáticos en game_catalog
CREATE OR REPLACE FUNCTION increment_game_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE game_catalog SET times_added_by_users = times_added_by_users + 1 WHERE id = NEW.game_catalog_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_game_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE game_catalog SET times_added_by_users = GREATEST(0, times_added_by_users - 1) WHERE id = OLD.game_catalog_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_increment_users_on_insert ON user_games;
CREATE TRIGGER trg_increment_users_on_insert
  AFTER INSERT ON user_games FOR EACH ROW EXECUTE FUNCTION increment_game_users_count();

DROP TRIGGER IF EXISTS trg_decrement_users_on_delete ON user_games;
CREATE TRIGGER trg_decrement_users_on_delete
  AFTER DELETE ON user_games FOR EACH ROW EXECUTE FUNCTION decrement_game_users_count();


-- ============================================================
-- 7. VISTA: user_games_full
--    Join de user_games + game_catalog. Es la vista principal
--    que usa el frontend para leer la colección.
-- ============================================================

CREATE OR REPLACE VIEW user_games_full AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_catalog_id,

  -- Datos del catálogo
  gc.rawg_id,
  gc.title,
  gc.slug,
  gc.description,
  gc.image_url,
  gc.released_date,
  gc.rating          AS rawg_rating,
  gc.metacritic_score,
  gc.esrb_rating,
  gc.platforms       AS available_platforms,
  gc.parent_platforms,
  gc.genres,
  gc.tags,
  gc.developers,
  gc.publishers,
  gc.source,

  -- Datos personales del usuario
  ug.price,
  ug.store,
  ug.platform        AS user_platform,
  ug.condition,
  ug.purchased_date,
  ug.status,
  ug.platinum,
  ug.personal_rating,
  ug.personal_review,
  ug.edition,
  ug.started_date,
  ug.completed_date,
  ug.description     AS user_notes,
  ug.is_favorite,

  ug.created_at,
  ug.updated_at
FROM user_games ug
INNER JOIN game_catalog gc ON ug.game_catalog_id = gc.id;


-- ============================================================
-- 8. VISTA: game_catalog_stats  (uso futuro / analítica)
-- ============================================================

CREATE OR REPLACE VIEW game_catalog_stats AS
SELECT
  gc.*,
  COUNT(DISTINCT ug.user_id)                                       AS actual_users_count,
  AVG(ug.personal_rating)                                          AS avg_personal_rating,
  COUNT(DISTINCT CASE WHEN ug.platinum     = TRUE THEN ug.user_id END) AS platinum_count,
  COUNT(DISTINCT CASE WHEN ug.is_favorite  = TRUE THEN ug.user_id END) AS favorite_count
FROM game_catalog gc
LEFT JOIN user_games ug ON gc.id = ug.game_catalog_id
GROUP BY gc.id;


-- ============================================================
-- STORAGE BUCKETS
-- (configurar en Supabase Dashboard > Storage, no en SQL)
--
-- Bucket: avatars
--   - Público: sí
--   - Política RLS: solo el propio usuario puede subir/borrar
--   - Naming: {user_id}  (un fichero por usuario, upsert)
--
-- Bucket: banners
--   - Público: sí
--   - Política RLS: solo el propio usuario puede subir/borrar
--   - Naming: {user_id}  (un fichero por usuario, upsert)
-- ============================================================
