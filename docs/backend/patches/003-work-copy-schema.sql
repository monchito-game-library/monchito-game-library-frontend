-- ============================================================
-- Patch 003 — Modelo obra/copia (B1) · Fase 1: schema base
-- ============================================================
-- Crea la tabla `user_works` (atributos compartidos entre copias del
-- mismo juego en la misma plataforma) y la FK `work_id` en `user_games`.
-- Ejecuta el backfill atómico para que cada `user_games` existente quede
-- ligado a una `user_works` recién creada con sus mismos status, rating
-- y favorito (copiados desde la copia más antigua).
--
-- NO toca todavía:
--   • La vista `user_games_full` (sigue exponiendo status, personal_rating,
--     is_favorite y user_platform desde `user_games` — el frontend no se
--     entera del cambio).
--   • El unique index `user_games_unique_per_platform` (se reemplazará
--     cuando los mappers/repos sepan trabajar con `work_id`).
--   • Las columnas obsoletas en `user_games` (status, personal_rating,
--     is_favorite, platform, personal_review, tags_personal, started_date,
--     completed_date, purchased_date) — se dropearán en un patch posterior
--     una vez el frontend lea de `user_works`.
--
-- Pre-condición verificada (2026-05-02):
--   SELECT COUNT(*) FROM user_games WHERE platform IS NULL → 0 filas.
--
-- Plan completo: docs/plans/work-copy-model.md
-- ============================================================


-- ------------------------------------------------------------
-- 1. Tabla user_works
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS user_works (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_catalog_id UUID NOT NULL REFERENCES game_catalog(id) ON DELETE CASCADE,
  platform        TEXT NOT NULL,

  -- Atributos de la obra (compartidos entre todas sus copias)
  status TEXT DEFAULT 'backlog' CHECK (status IN (
    'wishlist', 'backlog', 'playing', 'completed', 'platinum', 'abandoned', 'owned'
  )),
  personal_rating  NUMERIC(3,1) CHECK (personal_rating >= 0 AND personal_rating <= 10),
  is_favorite      BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Una obra por (user, juego del catálogo, plataforma).
-- PS4 + Xbox del mismo juego → dos obras distintas (logros y platino dependen de la plataforma).
CREATE UNIQUE INDEX IF NOT EXISTS user_works_unique_per_user_catalog_platform
  ON user_works(user_id, game_catalog_id, platform);

CREATE INDEX IF NOT EXISTS idx_user_works_user_id      ON user_works(user_id);
CREATE INDEX IF NOT EXISTS idx_user_works_platform     ON user_works(platform);
CREATE INDEX IF NOT EXISTS idx_user_works_status       ON user_works(status);
CREATE INDEX IF NOT EXISTS idx_user_works_is_favorite  ON user_works(is_favorite) WHERE is_favorite = TRUE;


-- ------------------------------------------------------------
-- 2. RLS de user_works (replica las policies de user_games)
-- ------------------------------------------------------------

ALTER TABLE user_works ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own works"   ON user_works;
DROP POLICY IF EXISTS "Users can insert their own works" ON user_works;
DROP POLICY IF EXISTS "Users can update their own works" ON user_works;
DROP POLICY IF EXISTS "Users can delete their own works" ON user_works;

CREATE POLICY "Users can view their own works"
  ON user_works FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own works"
  ON user_works FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own works"
  ON user_works FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own works"
  ON user_works FOR DELETE USING (auth.uid() = user_id);


-- ------------------------------------------------------------
-- 3. Trigger updated_at en user_works
-- ------------------------------------------------------------

DROP TRIGGER IF EXISTS trg_user_works_updated_at ON user_works;
CREATE TRIGGER trg_user_works_updated_at
  BEFORE UPDATE ON user_works
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ------------------------------------------------------------
-- 4. Columna work_id en user_games (nullable de momento)
-- ------------------------------------------------------------

ALTER TABLE user_games
  ADD COLUMN IF NOT EXISTS work_id UUID REFERENCES user_works(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_games_work_id ON user_games(work_id);


-- ------------------------------------------------------------
-- 5. Guard previo al backfill
-- ------------------------------------------------------------
-- El INSERT siguiente filtra por platform IS NOT NULL, así que cualquier
-- fila con platform NULL quedaría sin work_id y haría fallar el SET NOT NULL.

DO $$
DECLARE
  null_platform_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO null_platform_rows FROM user_games WHERE platform IS NULL;
  IF null_platform_rows > 0 THEN
    RAISE EXCEPTION 'Hay % filas en user_games con platform IS NULL. Asignarles platform o purgarlas antes de aplicar este patch.', null_platform_rows;
  END IF;
END
$$;


-- ------------------------------------------------------------
-- 6. Backfill atómico
-- ------------------------------------------------------------

-- Crear una user_works por (user_id, game_catalog_id, platform), copiando
-- los atributos de obra desde la copia más antigua (menor created_at).
INSERT INTO user_works (user_id, game_catalog_id, platform, status, personal_rating,
                        is_favorite, created_at, updated_at)
SELECT DISTINCT ON (user_id, game_catalog_id, platform)
  user_id, game_catalog_id, platform, status, personal_rating,
  is_favorite, created_at, updated_at
FROM user_games
WHERE platform IS NOT NULL
ORDER BY user_id, game_catalog_id, platform, created_at ASC
ON CONFLICT (user_id, game_catalog_id, platform) DO NOTHING;

-- Asignar work_id a cada user_games existente.
UPDATE user_games ug
SET    work_id = uw.id
FROM   user_works uw
WHERE  ug.user_id          = uw.user_id
  AND  ug.game_catalog_id  = uw.game_catalog_id
  AND  ug.platform         = uw.platform
  AND  ug.work_id IS NULL;


-- ------------------------------------------------------------
-- 7. Verificación post-backfill
-- ------------------------------------------------------------

DO $$
DECLARE
  orphan_rows INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_rows FROM user_games WHERE work_id IS NULL;
  IF orphan_rows > 0 THEN
    RAISE EXCEPTION 'Quedan % filas en user_games sin work_id. El backfill es incompleto, abortando antes de SET NOT NULL.', orphan_rows;
  END IF;
END
$$;


-- ------------------------------------------------------------
-- 8. Trigger puente — asigna work_id automáticamente cuando el
--    INSERT no lo trae (frontend antiguo). Se dropeará en la fase
--    de cleanup, cuando el repositorio mande work_id explícito.
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.ensure_user_work_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_work_id UUID;
BEGIN
  -- Si el cliente ya manda work_id, respetarlo (frontend post-fase-2).
  IF NEW.work_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Sin platform no se puede resolver la obra.
  IF NEW.platform IS NULL THEN
    RAISE EXCEPTION 'user_games requiere platform para asignar work_id automáticamente';
  END IF;

  -- Buscar la work existente para (user, catalog, platform).
  SELECT id INTO v_work_id
  FROM   public.user_works
  WHERE  user_id          = NEW.user_id
    AND  game_catalog_id  = NEW.game_catalog_id
    AND  platform         = NEW.platform
  LIMIT 1;

  -- Si no existe, crearla copiando los atributos de obra del INSERT entrante.
  IF v_work_id IS NULL THEN
    INSERT INTO public.user_works (user_id, game_catalog_id, platform, status,
                                   personal_rating, is_favorite)
    VALUES (NEW.user_id, NEW.game_catalog_id, NEW.platform,
            COALESCE(NEW.status, 'backlog'),
            NEW.personal_rating,
            COALESCE(NEW.is_favorite, FALSE))
    RETURNING id INTO v_work_id;
  END IF;

  NEW.work_id := v_work_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_games_ensure_work_id ON user_games;
CREATE TRIGGER trg_user_games_ensure_work_id
  BEFORE INSERT ON user_games
  FOR EACH ROW EXECUTE FUNCTION public.ensure_user_work_id();


-- ------------------------------------------------------------
-- 9. work_id pasa a NOT NULL (ya seguro: backfill + trigger)
-- ------------------------------------------------------------

ALTER TABLE user_games ALTER COLUMN work_id SET NOT NULL;
