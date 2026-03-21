-- ============================================================
-- MONCHITO GAME LIBRARY — SCHEMA ACTUAL (estado real en prod)
-- Última revisión: 2026-03-19
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
-- 2. TABLA: stores
--    Tiendas disponibles para la colección de cada usuario.
--    Gestionadas desde el panel de administración.
-- ============================================================

CREATE TABLE IF NOT EXISTS stores (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label      TEXT NOT NULL,
  format_hint TEXT CHECK (format_hint IN ('physical', 'digital')),  -- sugiere el formato por defecto
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_stores_created_by ON stores(created_by);

-- RLS
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stores"
  ON stores FOR SELECT USING (TRUE);

CREATE POLICY "Admins can insert stores"
  ON stores FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update stores"
  ON stores FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can delete stores"
  ON stores FOR DELETE USING (auth.uid() IS NOT NULL);

DROP TRIGGER IF EXISTS trg_stores_updated_at ON stores;
CREATE TRIGGER trg_stores_updated_at
  BEFORE UPDATE ON stores
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 3. TABLA: user_games
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
  store          UUID REFERENCES stores(id) ON DELETE SET NULL,
  platform       TEXT,
  condition      TEXT CHECK (condition IN ('new', 'used')),
  purchased_date DATE,
  format         TEXT CHECK (format IN ('physical', 'digital')),

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
CREATE INDEX IF NOT EXISTS idx_user_games_format         ON user_games(format);
CREATE INDEX IF NOT EXISTS idx_user_games_status         ON user_games(status);
CREATE INDEX IF NOT EXISTS idx_user_games_is_favorite    ON user_games(is_favorite)  WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_games_platinum       ON user_games(platinum)     WHERE platinum = TRUE;


-- ============================================================
-- 4. TABLA: user_preferences
--    Configuración personal de cada usuario autenticado:
--    tema, idioma, avatar, banner y rol.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme      TEXT DEFAULT 'dark'  CHECK (theme IN ('light', 'dark')),
  language   TEXT DEFAULT 'es'    CHECK (language IN ('es', 'en')),
  avatar_url TEXT,               -- URL pública del bucket 'avatars'
  banner_url TEXT,               -- URL del banner (bucket 'banners' o URL externa RAWG)
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nota: el campo `role` solo debe modificarse via service role (SQL directo).
-- El cliente nunca envía `role` en el payload de upsert.


-- ============================================================
-- 5. TABLA: user_wishlist  (definida, pendiente de uso en UI)
-- ============================================================

CREATE TABLE IF NOT EXISTS user_wishlist (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL DEFAULT '',   -- plataforma para la que se busca el juego
  desired_price   NUMERIC(10,2),
  priority        INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  notes           TEXT,
  notify_on_sale  BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, game_catalog_id, platform)  -- mismo juego en distinta plataforma = item separado
);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id  ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_priority ON user_wishlist(priority);


-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
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

-- user_wishlist: solo el propio usuario (stores RLS ya definido arriba junto a su tabla)
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
-- 7. TRIGGERS — updated_at automático
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
-- 8. VISTA: user_games_full
--    Join de user_games + game_catalog.
--    Es la vista principal que usa el frontend para leer la colección.
--    security_invoker = on → respeta el RLS del usuario autenticado.
-- ============================================================

CREATE OR REPLACE VIEW user_games_full WITH (security_invoker = on) AS
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
  ug.format,
  ug.status,
  ug.platinum,
  ug.personal_rating,
  ug.personal_review,
  ug.edition,
  ug.description     AS user_notes,
  ug.is_favorite,
  ug.cover_position,

  ug.created_at,
  ug.updated_at
FROM user_games ug
JOIN game_catalog gc ON ug.game_catalog_id = gc.id;


-- ============================================================
-- 9. VISTA: user_wishlist_full
--    Join de user_wishlist + game_catalog.
--    security_invoker = on → respeta el RLS del usuario autenticado.
-- ============================================================

CREATE OR REPLACE VIEW user_wishlist_full WITH (security_invoker = on) AS
SELECT
  uw.id,
  uw.user_id,
  uw.game_catalog_id,
  uw.platform,
  uw.desired_price,
  uw.priority,
  uw.notes,
  uw.created_at,
  gc.title,
  gc.slug,
  gc.image_url,
  gc.rawg_id,
  gc.released_date,
  gc.rating,
  gc.metacritic_score,
  gc.platforms,
  gc.genres
FROM user_wishlist uw
JOIN game_catalog gc ON uw.game_catalog_id = gc.id;

-- ============================================================
-- 10. MIGRACIÓN: status 'wishlist' → user_wishlist
--     Ejecutar antes de aplicar el nuevo CHECK en user_games.
-- ============================================================

-- Paso 0: añadir columna platform si no existe (para bases de datos ya creadas)
ALTER TABLE user_wishlist ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT '';
ALTER TABLE user_wishlist DROP CONSTRAINT IF EXISTS user_wishlist_user_id_game_catalog_id_key;
ALTER TABLE user_wishlist ADD CONSTRAINT user_wishlist_user_id_game_catalog_id_platform_key
  UNIQUE(user_id, game_catalog_id, platform);

-- Paso 1: mover registros existentes con status='wishlist' a user_wishlist
INSERT INTO user_wishlist (user_id, game_catalog_id, created_at)
SELECT user_id, game_catalog_id, created_at
FROM user_games
WHERE status = 'wishlist'
ON CONFLICT (user_id, game_catalog_id, platform) DO NOTHING;

-- Paso 2: eliminar esos registros de user_games
DELETE FROM user_games WHERE status = 'wishlist';

-- Paso 3: actualizar el CHECK de status en user_games (eliminar 'wishlist')
ALTER TABLE user_games DROP CONSTRAINT IF EXISTS user_games_status_check;
ALTER TABLE user_games ADD CONSTRAINT user_games_status_check
  CHECK (status IN ('backlog', 'playing', 'completed', 'platinum', 'abandoned'));




-- ============================================================
-- 11. TABLA: order_products
--     Catálogo global de productos para pedidos grupales.
--     Gestionado por admins desde /management/products.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_products (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  unit_price      NUMERIC(10,4) NOT NULL CHECK (unit_price > 0),
  available_packs INTEGER[]   NOT NULL DEFAULT '{}',
  category        TEXT        NOT NULL DEFAULT 'box'
                              CHECK (category IN ('box', 'console', 'other')),
  notes           TEXT,
  is_active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_products_active
  ON order_products (is_active);

DROP TRIGGER IF EXISTS trg_order_products_updated_at ON order_products;
CREATE TRIGGER trg_order_products_updated_at
  BEFORE UPDATE ON order_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE order_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read active products"
  ON order_products FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins can read all products"
  ON order_products FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = auth.uid()
        AND user_preferences.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert products"
  ON order_products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = auth.uid()
        AND user_preferences.role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON order_products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_preferences
      WHERE user_preferences.user_id = auth.uid()
        AND user_preferences.role = 'admin'
    )
  );


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
