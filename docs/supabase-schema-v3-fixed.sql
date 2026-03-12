-- ============================================
-- ESQUEMA V3 - VERSIÓN CORREGIDA (SIN ERROR IMMUTABLE)
-- ============================================
-- Corrección: Índice full-text sin función no-inmutable

-- ============================================
-- 1. TABLA: game_catalog (MEJORADA)
-- ============================================

CREATE TABLE IF NOT EXISTS game_catalog (
  -- Identificadores
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rawg_id INTEGER UNIQUE,  -- NULL para juegos añadidos manualmente
  slug TEXT UNIQUE NOT NULL,

  -- Información básica
  title TEXT NOT NULL,
  description TEXT,
  description_raw TEXT,  -- Versión sin HTML
  released_date DATE,
  tba BOOLEAN DEFAULT FALSE,  -- To Be Announced (fecha no confirmada)

  -- Imágenes
  image_url TEXT,  -- background_image principal
  background_image_additional TEXT,  -- Imagen adicional

  -- Ratings y popularidad
  rating NUMERIC(3, 2),  -- Rating promedio (0.00 - 5.00)
  rating_top INTEGER DEFAULT 5,  -- Rating máximo posible
  ratings_count INTEGER DEFAULT 0,  -- Número total de ratings
  reviews_count INTEGER DEFAULT 0,  -- Número de reviews
  metacritic_score INTEGER,  -- Score de Metacritic (0-100)
  metacritic_url TEXT,

  -- Clasificación por edad
  esrb_rating TEXT,  -- 'E', 'E10+', 'T', 'M', 'AO', 'RP'

  -- Plataformas (arrays de strings)
  platforms TEXT[] DEFAULT '{}',  -- Plataformas específicas: ['PlayStation 5', 'PC', 'Xbox Series S/X']
  parent_platforms TEXT[] DEFAULT '{}',  -- Plataformas generales: ['PlayStation', 'PC', 'Xbox']

  -- Géneros y etiquetas
  genres TEXT[] DEFAULT '{}',  -- ['Action', 'RPG', 'Adventure']
  tags TEXT[] DEFAULT '{}',  -- ['Singleplayer', 'Story Rich', 'Open World']

  -- Desarrolladores y publishers
  developers TEXT[] DEFAULT '{}',  -- ['FromSoftware', 'Bandai Namco']
  publishers TEXT[] DEFAULT '{}',  -- ['Bandai Namco Entertainment']

  -- Tiendas digitales donde está disponible
  stores JSONB DEFAULT '[]',  -- [{"id": 1, "name": "Steam", "url": "https://..."}]

  -- Screenshots (hasta 6 capturas)
  screenshots TEXT[] DEFAULT '{}',  -- URLs de capturas de pantalla

  -- Website oficial
  website TEXT,

  -- Metadata de origen
  source TEXT NOT NULL DEFAULT 'rawg' CHECK (source IN ('rawg', 'manual')),
  added_by_user_id UUID REFERENCES auth.users(id),  -- Usuario que añadió si es manual

  -- Estadísticas de uso
  times_added_by_users INTEGER DEFAULT 0,  -- Cuántos usuarios tienen este juego

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE  -- Última sincronización con RAWG
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_game_catalog_rawg_id ON game_catalog(rawg_id) WHERE rawg_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_game_catalog_slug ON game_catalog(slug);
CREATE INDEX IF NOT EXISTS idx_game_catalog_source ON game_catalog(source);
CREATE INDEX IF NOT EXISTS idx_game_catalog_rating ON game_catalog(rating DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_game_catalog_released_date ON game_catalog(released_date DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_game_catalog_metacritic ON game_catalog(metacritic_score DESC NULLS LAST);

-- Índices GIN para búsquedas en arrays
CREATE INDEX IF NOT EXISTS idx_game_catalog_platforms ON game_catalog USING gin(platforms);
CREATE INDEX IF NOT EXISTS idx_game_catalog_genres ON game_catalog USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_game_catalog_tags ON game_catalog USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_game_catalog_developers ON game_catalog USING gin(developers);

-- Índice simple para búsqueda por título (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_game_catalog_title_lower ON game_catalog(LOWER(title));

-- ============================================
-- 2. TABLA: user_games
-- ============================================

CREATE TABLE IF NOT EXISTS user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,

  -- Datos de compra
  price NUMERIC(10, 2),
  store TEXT,  -- Tienda física donde lo compró
  platform TEXT,  -- Plataforma específica del usuario
  condition TEXT CHECK (condition IN ('new', 'used')),
  purchased_date DATE,

  -- Estado del juego
  platinum BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'backlog' CHECK (status IN ('wishlist', 'backlog', 'playing', 'completed', 'platinum', 'abandoned', 'owned')),

  -- Rating y review personal
  personal_rating NUMERIC(2, 1) CHECK (personal_rating >= 0 AND personal_rating <= 10),
  personal_review TEXT,

  -- Gameplay tracking
  hours_played INTEGER DEFAULT 0,
  started_date DATE,
  completed_date DATE,
  platinum_date DATE,

  -- Notas personales
  description TEXT,
  tags_personal TEXT[] DEFAULT '{}',

  -- Favorito
  is_favorite BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario no puede tener el mismo juego duplicado
  UNIQUE(user_id, game_catalog_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_catalog_id ON user_games(game_catalog_id);
CREATE INDEX IF NOT EXISTS idx_user_games_platform ON user_games(platform);
CREATE INDEX IF NOT EXISTS idx_user_games_store ON user_games(store);
CREATE INDEX IF NOT EXISTS idx_user_games_status ON user_games(status);
CREATE INDEX IF NOT EXISTS idx_user_games_is_favorite ON user_games(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_games_platinum ON user_games(platinum) WHERE platinum = TRUE;

-- ============================================
-- 3. TABLA: user_wishlist
-- ============================================

CREATE TABLE IF NOT EXISTS user_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,

  -- Precio deseado
  desired_price NUMERIC(10, 2),

  -- Prioridad
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),

  -- Notas
  notes TEXT,

  -- Notificaciones
  notify_on_sale BOOLEAN DEFAULT FALSE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, game_catalog_id)
);

CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_wishlist_priority ON user_wishlist(priority);

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE game_catalog ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read game catalog" ON game_catalog
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can insert games" ON game_catalog
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update games" ON game_catalog
  FOR UPDATE USING (auth.uid() IS NOT NULL);

ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own games" ON user_games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" ON user_games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games" ON user_games
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games" ON user_games
  FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own wishlist" ON user_wishlist
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert to their wishlist" ON user_wishlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their wishlist" ON user_wishlist
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete from their wishlist" ON user_wishlist
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_game_catalog_updated_at ON game_catalog;
CREATE TRIGGER update_game_catalog_updated_at
  BEFORE UPDATE ON game_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_games_updated_at ON user_games;
CREATE TRIGGER update_user_games_updated_at
  BEFORE UPDATE ON user_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_wishlist_updated_at ON user_wishlist;
CREATE TRIGGER update_user_wishlist_updated_at
  BEFORE UPDATE ON user_wishlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION increment_game_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE game_catalog
  SET times_added_by_users = times_added_by_users + 1
  WHERE id = NEW.game_catalog_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_game_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE game_catalog
  SET times_added_by_users = GREATEST(0, times_added_by_users - 1)
  WHERE id = OLD.game_catalog_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_users_on_insert ON user_games;
CREATE TRIGGER increment_users_on_insert
  AFTER INSERT ON user_games
  FOR EACH ROW
  EXECUTE FUNCTION increment_game_users_count();

DROP TRIGGER IF EXISTS decrement_users_on_delete ON user_games;
CREATE TRIGGER decrement_users_on_delete
  AFTER DELETE ON user_games
  FOR EACH ROW
  EXECUTE FUNCTION decrement_game_users_count();

-- ============================================
-- 6. VISTAS ÚTILES
-- ============================================

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
  gc.rating AS rawg_rating,
  gc.metacritic_score,
  gc.esrb_rating,
  gc.platforms AS available_platforms,
  gc.parent_platforms,
  gc.genres,
  gc.tags,
  gc.developers,
  gc.publishers,
  gc.source,

  -- Datos personales del usuario
  ug.price,
  ug.store,
  ug.platform AS user_platform,
  ug.condition,
  ug.purchased_date,
  ug.status,
  ug.platinum,
  ug.personal_rating,
  ug.personal_review,
  ug.hours_played,
  ug.started_date,
  ug.completed_date,
  ug.description AS user_notes,
  ug.is_favorite,

  ug.created_at,
  ug.updated_at
FROM user_games ug
INNER JOIN game_catalog gc ON ug.game_catalog_id = gc.id;

CREATE OR REPLACE VIEW game_catalog_stats AS
SELECT
  gc.*,
  COUNT(DISTINCT ug.user_id) as actual_users_count,
  AVG(ug.personal_rating) as avg_personal_rating,
  COUNT(DISTINCT CASE WHEN ug.platinum = TRUE THEN ug.user_id END) as platinum_count,
  COUNT(DISTINCT CASE WHEN ug.is_favorite = TRUE THEN ug.user_id END) as favorite_count
FROM game_catalog gc
LEFT JOIN user_games ug ON gc.id = ug.game_catalog_id
GROUP BY gc.id;

CREATE OR REPLACE VIEW user_wishlist_full AS
SELECT
  uw.id,
  uw.user_id,
  uw.game_catalog_id,
  uw.desired_price,
  uw.priority,
  uw.notes,
  uw.created_at,

  -- Datos del catálogo
  gc.title,
  gc.slug,
  gc.image_url,
  gc.released_date,
  gc.rating,
  gc.metacritic_score,
  gc.platforms,
  gc.genres
FROM user_wishlist uw
INNER JOIN game_catalog gc ON uw.game_catalog_id = gc.id;

-- ============================================
-- 7. FUNCIÓN DE BÚSQUEDA SIMPLE (SIN FULL-TEXT)
-- ============================================

-- Función simplificada para buscar juegos (sin índice full-text problemático)
CREATE OR REPLACE FUNCTION search_game_catalog(search_query TEXT)
RETURNS TABLE (
  id UUID,
  rawg_id INTEGER,
  title TEXT,
  slug TEXT,
  image_url TEXT,
  released_date DATE,
  rating NUMERIC,
  metacritic_score INTEGER,
  platforms TEXT[],
  genres TEXT[],
  source TEXT,
  relevance INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id,
    gc.rawg_id,
    gc.title,
    gc.slug,
    gc.image_url,
    gc.released_date,
    gc.rating,
    gc.metacritic_score,
    gc.platforms,
    gc.genres,
    gc.source,
    CASE
      WHEN LOWER(gc.title) = LOWER(search_query) THEN 100
      WHEN LOWER(gc.title) LIKE LOWER(search_query || '%') THEN 90
      WHEN LOWER(gc.title) LIKE LOWER('%' || search_query || '%') THEN 70
      WHEN LOWER(gc.description_raw) LIKE LOWER('%' || search_query || '%') THEN 50
      ELSE 10
    END AS relevance
  FROM game_catalog gc
  WHERE
    LOWER(gc.title) LIKE LOWER('%' || search_query || '%')
    OR LOWER(gc.description_raw) LIKE LOWER('%' || search_query || '%')
    OR search_query = ANY(
      SELECT LOWER(unnest(gc.developers))
      UNION ALL
      SELECT LOWER(unnest(gc.publishers))
    )
  ORDER BY relevance DESC, gc.rating DESC NULLS LAST
  LIMIT 50;
END;
$$ LANGUAGE plpgsql STABLE;
