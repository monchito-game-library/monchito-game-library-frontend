-- ============================================================
-- Diagnóstico: policies RLS todavía con `role = 'admin'`
-- ============================================================
-- Detecta cualquier policy en el schema `public` cuya expresión
-- USING o WITH CHECK siga comprobando `role = 'admin'` en lugar
-- de `role IN ('admin', 'owner')`. Si devuelve filas, esas
-- policies están desactualizadas respecto al schema canónico
-- (PR #99) y bloquearán a los usuarios con rol 'owner'.
--
-- Read-only — pegar en Supabase SQL Editor.
-- ============================================================

SELECT
  c.relname                            AS tabla,
  p.polname                            AS policy,
  CASE p.polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END                                  AS comando,
  pg_get_expr(p.polqual,      p.polrelid) AS using_expr,
  pg_get_expr(p.polwithcheck, p.polrelid) AS with_check_expr
FROM pg_policy p
JOIN pg_class     c ON c.oid = p.polrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND (
        pg_get_expr(p.polqual,      p.polrelid) LIKE '%role = ''admin''%'
     OR pg_get_expr(p.polwithcheck, p.polrelid) LIKE '%role = ''admin''%'
  )
ORDER BY tabla, policy;
