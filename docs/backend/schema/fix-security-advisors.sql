-- ============================================================
-- Security Advisors Fix
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. FUNCTION SEARCH PATH MUTABLE
--    Añade SET search_path = '' a las 4 funciones afectadas
--    y cualifica todas las referencias a tablas con public.
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE OR REPLACE FUNCTION public.increment_game_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.game_catalog
    SET times_added_by_users = times_added_by_users + 1
  WHERE id = NEW.game_catalog_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE OR REPLACE FUNCTION public.decrement_game_users_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.game_catalog
    SET times_added_by_users = GREATEST(0, times_added_by_users - 1)
  WHERE id = OLD.game_catalog_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql
SET search_path = '';

CREATE OR REPLACE FUNCTION public.search_game_catalog(search_query TEXT)
RETURNS TABLE (
  id UUID, rawg_id INTEGER, title TEXT, slug TEXT, image_url TEXT,
  released_date DATE, rating NUMERIC, metacritic_score INTEGER,
  platforms TEXT[], genres TEXT[], source TEXT, relevance INTEGER
)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = ''
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
  FROM public.game_catalog gc
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

-- ────────────────────────────────────────────────────────────
-- 2. EXTENSION IN PUBLIC
--    Mueve la extensión unaccent al schema extensions.
--    No está referenciada en ninguna función, el cambio es seguro.
-- ────────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION unaccent SET SCHEMA extensions;

-- ────────────────────────────────────────────────────────────
-- 3. PUBLIC BUCKET ALLOWS LISTING
--    Elimina las políticas SELECT demasiado amplias en los
--    buckets avatars y banners. Los buckets públicos permiten
--    acceso directo por URL sin necesitar esta política;
--    mantenerla solo expone el listado de todos los ficheros.
-- ────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Avatar read public" ON storage.objects;
DROP POLICY IF EXISTS "Public read access for banners" ON storage.objects;

-- ────────────────────────────────────────────────────────────
-- 4. LEAKED PASSWORD PROTECTION
--    No requiere SQL. Activar en:
--    Dashboard → Authentication → Settings →
--    Password Security → Enable leaked password protection
-- ────────────────────────────────────────────────────────────
