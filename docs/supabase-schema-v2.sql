-- NUEVO ESQUEMA CON CATÁLOGO DE JUEGOS Y COLECCIÓN DE USUARIO
-- Este esquema separa el catálogo global de juegos de la colección personal del usuario

-- ============================================
-- 1. TABLA: game_catalog
-- ============================================
-- Catálogo global de juegos obtenidos de RAWG API
-- Esta tabla actúa como caché de juegos buscados

CREATE TABLE IF NOT EXISTS game_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rawg_id INTEGER UNIQUE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  image_url TEXT,
  released_date DATE,
  rating NUMERIC(3, 2),
  platforms TEXT[] DEFAULT '{}',
  genres TEXT[] DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_game_catalog_rawg_id ON game_catalog(rawg_id);
CREATE INDEX IF NOT EXISTS idx_game_catalog_title ON game_catalog USING gin(to_tsvector('spanish', title));
CREATE INDEX IF NOT EXISTS idx_game_catalog_slug ON game_catalog(slug);

-- ============================================
-- 2. TABLA: user_games
-- ============================================
-- Colección personal de juegos del usuario
-- Referencia al catálogo + datos personales (precio, tienda, etc.)

CREATE TABLE IF NOT EXISTS user_games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,

  -- Datos personales del usuario sobre este juego
  price NUMERIC(10, 2),
  store TEXT,
  platform TEXT,
  condition TEXT CHECK (condition IN ('new', 'used')),
  description TEXT,
  platinum BOOLEAN DEFAULT FALSE,
  purchased_date DATE,

  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Un usuario no puede tener el mismo juego duplicado
  UNIQUE(user_id, game_catalog_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_games_user_id ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_catalog_id ON user_games(game_catalog_id);
CREATE INDEX IF NOT EXISTS idx_user_games_platform ON user_games(platform);
CREATE INDEX IF NOT EXISTS idx_user_games_store ON user_games(store);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en ambas tablas
ALTER TABLE game_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_games ENABLE ROW LEVEL SECURITY;

-- Políticas para game_catalog (todos pueden leer, nadie puede modificar directamente)
CREATE POLICY "Anyone can read game catalog" ON game_catalog
  FOR SELECT USING (TRUE);

CREATE POLICY "Service can insert game catalog" ON game_catalog
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Service can update game catalog" ON game_catalog
  FOR UPDATE USING (TRUE);

-- Políticas para user_games (cada usuario solo ve y modifica sus propios juegos)
CREATE POLICY "Users can view their own games" ON user_games
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own games" ON user_games
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own games" ON user_games
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own games" ON user_games
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. TRIGGERS PARA UPDATED_AT
-- ============================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para game_catalog
DROP TRIGGER IF EXISTS update_game_catalog_updated_at ON game_catalog;
CREATE TRIGGER update_game_catalog_updated_at
  BEFORE UPDATE ON game_catalog
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para user_games
DROP TRIGGER IF EXISTS update_user_games_updated_at ON user_games;
CREATE TRIGGER update_user_games_updated_at
  BEFORE UPDATE ON user_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5. VISTA ÚTIL: user_games_with_catalog
-- ============================================
-- Vista que une user_games con game_catalog para consultas fáciles

CREATE OR REPLACE VIEW user_games_with_catalog AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_catalog_id,
  gc.rawg_id,
  gc.title,
  gc.slug,
  gc.image_url,
  gc.released_date,
  gc.rating,
  gc.platforms AS available_platforms,
  gc.genres,
  ug.price,
  ug.store,
  ug.platform AS user_platform,
  ug.condition,
  ug.description AS user_description,
  ug.platinum,
  ug.purchased_date,
  ug.created_at,
  ug.updated_at
FROM user_games ug
INNER JOIN game_catalog gc ON ug.game_catalog_id = gc.id;

-- ============================================
-- NOTAS DE MIGRACIÓN
-- ============================================
-- Si ya tienes una tabla 'games' existente, necesitarás migrar los datos:
-- 1. Insertar juegos únicos en game_catalog
-- 2. Crear referencias en user_games apuntando al catálogo
-- 3. Una vez confirmado, eliminar la tabla 'games' antigua
