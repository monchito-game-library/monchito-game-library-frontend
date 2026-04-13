-- ============================================================
-- MONCHITO GAME LIBRARY — SCHEMA ACTUAL (estado real en prod)
-- Última revisión: 2026-04-13
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

-- Nota: no hay índices adicionales en producción para stores (solo PK).

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

  -- Posición de la portada (punto focal configurable en la card)
  cover_position VARCHAR(20),

  -- Venta
  for_sale         BOOLEAN      NOT NULL DEFAULT FALSE,
  sale_price       NUMERIC(10,2),          -- precio deseado
  sold_at          DATE,                   -- fecha de venta real (NULL = en colección activa)
  sold_price_final NUMERIC(10,2),          -- precio final obtenido

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_user_games_user_id             ON user_games(user_id);
CREATE INDEX IF NOT EXISTS idx_user_games_game_catalog_id     ON user_games(game_catalog_id);
CREATE INDEX IF NOT EXISTS idx_user_games_platform            ON user_games(platform);
CREATE INDEX IF NOT EXISTS idx_user_games_status              ON user_games(status);
CREATE INDEX IF NOT EXISTS idx_user_games_is_favorite    ON user_games(is_favorite)  WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_games_platinum       ON user_games(platinum)     WHERE platinum = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_games_for_sale       ON user_games(for_sale)     WHERE for_sale = TRUE;
CREATE INDEX IF NOT EXISTS idx_user_games_sold_at        ON user_games(sold_at)      WHERE sold_at IS NOT NULL;

-- Unicidad solo en juegos activos (sold_at IS NULL); los vendidos no computan
CREATE UNIQUE INDEX IF NOT EXISTS user_games_unique_per_platform
  ON user_games(user_id, game_catalog_id, platform, format, edition)
  WHERE sold_at IS NULL;


-- ============================================================
-- 4. TABLA: user_preferences
--    Configuración personal de cada usuario autenticado:
--    tema, idioma, avatar, banner y rol.
-- ============================================================

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme      TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language   TEXT DEFAULT 'es'    CHECK (language IN ('es', 'en')),
  avatar_url TEXT,               -- URL pública del bucket 'avatars'
  banner_url TEXT,               -- URL del banner (bucket 'banners' o URL externa RAWG)
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin'))
);

-- Nota: user_preferences NO tiene columnas created_at ni updated_at en producción.
-- El campo `role` debe modificarse via el RPC set_user_role (SECURITY DEFINER).
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
-- 6. TABLA: game_loans
--    Historial de préstamos de juegos físicos.
--    El préstamo activo es la fila con returned_at IS NULL.
--    RLS: solo el propietario del user_games puede leer/escribir.
-- ============================================================

CREATE TABLE IF NOT EXISTS game_loans (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_game_id UUID NOT NULL REFERENCES user_games(id) ON DELETE CASCADE,
  loaned_to    TEXT NOT NULL,                          -- v1: texto libre
  loaned_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  returned_at  DATE,                                   -- NULL mientras siga prestado
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_game_loans_user_game_id
  ON game_loans(user_game_id);
CREATE INDEX IF NOT EXISTS idx_game_loans_active
  ON game_loans(user_game_id) WHERE returned_at IS NULL;

-- RLS
ALTER TABLE game_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own loans"
  ON game_loans FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_games
      WHERE user_games.id = game_loans.user_game_id
        AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own loans"
  ON game_loans FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_games
      WHERE user_games.id = game_loans.user_game_id
        AND user_games.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own loans"
  ON game_loans FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_games
      WHERE user_games.id = game_loans.user_game_id
        AND user_games.user_id = auth.uid()
    )
  );


-- ============================================================
-- 7. ROW LEVEL SECURITY (RLS)
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

DROP VIEW IF EXISTS user_games_full;
CREATE VIEW user_games_full WITH (security_invoker = on) AS
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

  ug.for_sale,
  ug.sale_price,
  ug.sold_at,
  ug.sold_price_final,

  -- Préstamo activo (NULL si no está prestado)
  al.id          AS active_loan_id,
  al.loaned_to   AS active_loan_to,
  al.loaned_at   AS active_loan_at,

  ug.created_at,
  ug.updated_at
FROM user_games ug
JOIN game_catalog gc ON ug.game_catalog_id = gc.id
LEFT JOIN LATERAL (
  SELECT id, loaned_to, loaned_at
  FROM   game_loans
  WHERE  user_game_id = ug.id
    AND  returned_at IS NULL
  LIMIT  1
) al ON TRUE;


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
--     Cada producto define sus opciones de pack disponibles como
--     un array JSONB: [{ url, price, quantity }, ...].
--     Gestionado por admins desde /management/products.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_products (
  id         UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT    NOT NULL,
  category   TEXT    NOT NULL DEFAULT 'box'
                     CHECK (category IN ('box', 'console', 'other')),
  notes      TEXT,
  packs      JSONB   NOT NULL DEFAULT '[]',  -- [{url, price, quantity}]
  is_active  BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
-- 12. TABLA: orders
--     Pedido grupal. Tiene un owner que lo gestiona y avanza
--     su estado a lo largo del ciclo de vida.
--
--     Ciclo de vida:
--       draft → selecting_packs → ordering → ordered → received
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
  id              UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id        UUID    NOT NULL REFERENCES auth.users(id),
  title           TEXT,
  status          TEXT    NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft', 'selecting_packs', 'ordering', 'ordered', 'received')),
  order_date      DATE,
  received_date   DATE,
  shipping_cost   NUMERIC(10,2),
  paypal_fee      NUMERIC(10,2),
  discount_amount NUMERIC(10,2),
  discount_type   TEXT    NOT NULL DEFAULT 'amount'
                          CHECK (discount_type IN ('amount', 'percentage')),
  notes           TEXT,
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nota: no hay índices adicionales en producción para orders (solo PK).

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Solo los miembros del pedido pueden verlo
CREATE POLICY "Order members can read their orders"
  ON orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_members
      WHERE order_members.order_id = orders.id
        AND order_members.user_id = auth.uid()
    )
  );

-- Cualquier usuario autenticado puede crear un pedido
CREATE POLICY "Authenticated users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (owner_id = auth.uid());

-- Solo el owner puede actualizar el pedido
CREATE POLICY "Order owner can update their order"
  ON orders FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid());

-- Solo el owner puede borrar el pedido
CREATE POLICY "Order owner can delete their order"
  ON orders FOR DELETE
  TO authenticated
  USING (owner_id = auth.uid());


-- ============================================================
-- 13. TABLA: order_members
--     Miembros de un pedido (owner + participants).
--     display_name se denormaliza desde auth.users en el momento
--     de unirse para no depender de joins con auth.users en RLS.
--     email y avatar_url se obtienen vía RPC get_order_members_info.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES auth.users(id),
  role         TEXT NOT NULL DEFAULT 'member'
                    CHECK (role IN ('owner', 'member')),
  display_name TEXT,
  is_ready     BOOLEAN NOT NULL DEFAULT FALSE,
  joined_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (order_id, user_id)
);

-- Nota: no hay índices adicionales en producción para order_members (solo PK + UNIQUE).

ALTER TABLE order_members ENABLE ROW LEVEL SECURITY;

-- Un miembro puede ver los registros del pedido al que pertenece
CREATE POLICY "Members can view members of their orders"
  ON order_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- El sistema inserta el row al crear el pedido o aceptar invitación
CREATE POLICY "Authenticated users can join as member"
  ON order_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Solo el propio miembro puede actualizar su registro (is_ready, display_name)
CREATE POLICY "Member can update their own membership"
  ON order_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- El owner puede expulsar miembros (o el propio miembro puede salir)
CREATE POLICY "Owner or self can delete membership"
  ON order_members FOR DELETE
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_members.order_id
        AND orders.owner_id = auth.uid()
    )
  );


-- ============================================================
-- 14. TABLA: order_invitations
--     Tokens de invitación de un solo uso para unirse a un pedido.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_invitations (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id   UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE,
  used_by    UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nota: no hay índices adicionales en producción para order_invitations (solo PK + UNIQUE token).

ALTER TABLE order_invitations ENABLE ROW LEVEL SECURITY;

-- Cualquier usuario autenticado puede leer una invitación (para unirse)
CREATE POLICY "Authenticated users can read invitations"
  ON order_invitations FOR SELECT
  TO authenticated
  USING (TRUE);

-- El owner del pedido puede crear invitaciones
CREATE POLICY "Order owner can create invitations"
  ON order_invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_invitations.order_id
        AND orders.owner_id = auth.uid()
    )
  );

-- El sistema puede marcar la invitación como usada
CREATE POLICY "Authenticated users can mark invitation as used"
  ON order_invitations FOR UPDATE
  TO authenticated
  USING (TRUE);


-- ============================================================
-- 15. TABLA: order_lines
--     Una línea por producto y miembro. Un miembro puede pedir
--     varios productos en el mismo pedido (una línea por cada uno).
--     El owner puede añadir líneas en nombre de cualquier miembro.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_lines (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID         NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id       UUID         NOT NULL REFERENCES order_products(id),
  requested_by     UUID         REFERENCES auth.users(id),
  quantity_needed  INTEGER,
  unit_price       NUMERIC(10,4) NOT NULL DEFAULT 0,
  pack_chosen      INTEGER,
  quantity_ordered INTEGER,
  notes            TEXT,
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nota: no hay índices adicionales en producción para order_lines (solo PK).

ALTER TABLE order_lines ENABLE ROW LEVEL SECURITY;

-- Cualquier miembro del pedido puede ver todas las líneas
CREATE POLICY "Order members can read lines"
  ON order_lines FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_members
      WHERE order_members.order_id = order_lines.order_id
        AND order_members.user_id = auth.uid()
    )
  );

-- Cualquier miembro puede añadir sus propias líneas
CREATE POLICY "Order members can insert lines"
  ON order_lines FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_members
      WHERE order_members.order_id = order_lines.order_id
        AND order_members.user_id = auth.uid()
    )
  );

-- El autor de la línea o el owner puede actualizarla
CREATE POLICY "Author or owner can update lines"
  ON order_lines FOR UPDATE
  TO authenticated
  USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_lines.order_id
        AND orders.owner_id = auth.uid()
    )
  );

-- El autor de la línea o el owner puede borrarla
CREATE POLICY "Author or owner can delete lines"
  ON order_lines FOR DELETE
  TO authenticated
  USING (
    requested_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_lines.order_id
        AND orders.owner_id = auth.uid()
    )
  );


-- ============================================================
-- 16. TABLA: order_line_allocations
--     Distribución de unidades de una línea entre los miembros.
--     El stepper usa el método de resto mayor para garantizar que
--     la suma sea exactamente quantity_ordered.
-- ============================================================

CREATE TABLE IF NOT EXISTS order_line_allocations (
  id                  UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  order_line_id       UUID    NOT NULL REFERENCES order_lines(id) ON DELETE CASCADE,
  user_id             UUID    NOT NULL REFERENCES auth.users(id),
  quantity_needed     INTEGER NOT NULL,
  quantity_this_order INTEGER NOT NULL,
  UNIQUE (order_line_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_order_line_allocations_line_id ON order_line_allocations(order_line_id);
CREATE INDEX IF NOT EXISTS idx_order_line_allocations_user_id ON order_line_allocations(user_id);

ALTER TABLE order_line_allocations ENABLE ROW LEVEL SECURITY;

-- Cualquier miembro del pedido puede leer las allocations de sus líneas
CREATE POLICY "Order members can read allocations"
  ON order_line_allocations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_lines ol
      JOIN order_members om ON om.order_id = ol.order_id
      WHERE ol.id = order_line_allocations.order_line_id
        AND om.user_id = auth.uid()
    )
  );

-- El owner puede insertar/actualizar allocations (lo hace el stepper)
CREATE POLICY "Order owner can upsert allocations"
  ON order_line_allocations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_lines ol
      JOIN orders o ON o.id = ol.order_id
      WHERE ol.id = order_line_allocations.order_line_id
        AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Order owner can update allocations"
  ON order_line_allocations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_lines ol
      JOIN orders o ON o.id = ol.order_id
      WHERE ol.id = order_line_allocations.order_line_id
        AND o.owner_id = auth.uid()
    )
  );


-- ============================================================
-- 17. FUNCIONES RPC
-- ============================================================

-- Busca juegos en game_catalog por título, descripción, desarrollador o publisher.
-- Devuelve columnas seleccionadas + score de relevancia, ordenado DESC.
-- LIMIT interno: 50. Parámetro: search_query (TEXT).
CREATE OR REPLACE FUNCTION search_game_catalog(search_query TEXT)
RETURNS TABLE (
  id UUID, rawg_id INTEGER, title TEXT, slug TEXT, image_url TEXT,
  released_date DATE, rating NUMERIC, metacritic_score INTEGER,
  platforms TEXT[], genres TEXT[], source TEXT, relevance INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    gc.id, gc.rawg_id, gc.title, gc.slug, gc.image_url,
    gc.released_date, gc.rating, gc.metacritic_score,
    gc.platforms, gc.genres, gc.source,
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
$$;

-- Actualiza (o crea) el rol de un usuario en user_preferences via UPSERT.
-- Parámetros: target_user_id, new_role.
CREATE OR REPLACE FUNCTION set_user_role(target_user_id UUID, new_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_preferences (user_id, role)
  VALUES (target_user_id, new_role)
  ON CONFLICT (user_id)
  DO UPDATE SET role = new_role;
END;
$$;

-- Devuelve todos los usuarios con su rol desde auth.users + user_preferences.
-- Ordenado por fecha de creación descendente.
CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  user_id    UUID,
  email      TEXT,
  role       TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    au.id         AS user_id,
    au.email::TEXT,
    COALESCE(up.role, 'user')::TEXT AS role,
    up.avatar_url::TEXT,
    au.created_at
  FROM auth.users au
  LEFT JOIN public.user_preferences up ON up.user_id = au.id
  ORDER BY au.created_at DESC;
END;
$$;

-- Devuelve los miembros de un pedido con datos de auth.users
-- (email, avatar_url) que no están en la tabla order_members.
CREATE OR REPLACE FUNCTION get_order_members_info(p_order_id UUID)
RETURNS TABLE (
  id           UUID,
  order_id     UUID,
  user_id      UUID,
  role         TEXT,
  joined_at    TIMESTAMP WITH TIME ZONE,
  display_name TEXT,
  email        TEXT,
  avatar_url   TEXT,
  is_ready     BOOLEAN
)
LANGUAGE sql SECURITY DEFINER
AS $$
  SELECT
    om.id,
    om.order_id,
    om.user_id,
    om.role::TEXT,
    om.is_ready,
    COALESCE(om.display_name, u.raw_user_meta_data->>'display_name') AS display_name,
    u.email,
    COALESCE(up.avatar_url, u.raw_user_meta_data->>'avatar_url')     AS avatar_url,
    om.joined_at
  FROM order_members om
  JOIN auth.users u ON u.id = om.user_id
  LEFT JOIN user_preferences up ON up.user_id = om.user_id
  WHERE om.order_id = p_order_id
  ORDER BY om.joined_at ASC;
$$;

-- Actualiza el flag is_ready de un miembro. Solo el propio miembro puede llamarla.
CREATE OR REPLACE FUNCTION set_member_ready(
  p_order_id UUID,
  p_user_id  UUID,
  p_is_ready BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF p_user_id <> auth.uid() THEN
    RAISE EXCEPTION 'Only the member themselves can change their ready state';
  END IF;

  UPDATE order_members
  SET is_ready = p_is_ready
  WHERE order_id = p_order_id
    AND user_id  = p_user_id;

  -- Toca updated_at en orders para disparar el canal realtime
  UPDATE orders
  SET updated_at = now()
  WHERE id = p_order_id;
END;
$$;


-- ============================================================
-- 18. USER_CONSOLES
-- ============================================================

CREATE TABLE user_consoles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand         TEXT NOT NULL,
  model         TEXT NOT NULL,
  region        TEXT,
  condition     TEXT NOT NULL,
  price         NUMERIC(8,2),
  store         TEXT,
  purchase_date DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_consoles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own consoles"
ON user_consoles FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 19. USER_CONTROLLERS
-- ============================================================

CREATE TABLE user_controllers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  model         TEXT NOT NULL,
  edition       TEXT,
  color         TEXT NOT NULL,
  compatibility TEXT NOT NULL,
  condition     TEXT NOT NULL,
  price         NUMERIC(8,2),
  store         TEXT,
  purchase_date DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_controllers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own controllers"
ON user_controllers FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 20. STORAGE BUCKETS
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
