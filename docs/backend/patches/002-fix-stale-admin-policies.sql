-- ============================================================
-- 002 — order_products + admin_audit_log: ampliar a admin/owner
-- ============================================================
-- Continúa el trabajo de 001. Detectado vía
-- `docs/backend/patches/diagnostics/find-stale-admin-policies.sql`.
--
-- Cambios:
--   • order_products: 4 policies admin → IN ('admin', 'owner').
--   • admin_audit_log: 2 SELECT duplicadas (una con rol PUBLIC, otra
--     con authenticated) — se consolidan en una sola con
--     IN ('admin', 'owner') TO authenticated.
--   • admin_audit_log: INSERT pasa de rol PUBLIC a authenticated
--     (sin cambio funcional — `performed_by = auth.uid()` ya filtra
--     anon de hecho, esto solo lo hace explícito).
--
-- En el mismo PR se añade `admin_audit_log` al schema canónico
-- (`supabase-schema-current.sql`, sección 25) para que deje de
-- estar fuera del fichero fuente de verdad.
-- ============================================================

-- order_products
DROP POLICY IF EXISTS "Admins can read all products" ON public.order_products;
DROP POLICY IF EXISTS "Admins can insert products"   ON public.order_products;
DROP POLICY IF EXISTS "Admins can update products"   ON public.order_products;
DROP POLICY IF EXISTS "Admins can delete products"   ON public.order_products;

CREATE POLICY "Admins can read all products" ON public.order_products FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can insert products" ON public.order_products FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_preferences
                      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can update products" ON public.order_products FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can delete products" ON public.order_products FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

-- admin_audit_log
DROP POLICY IF EXISTS "admin_audit_log_select"     ON public.admin_audit_log;
DROP POLICY IF EXISTS "admins can read audit log"  ON public.admin_audit_log;
DROP POLICY IF EXISTS "Admins can read audit log"  ON public.admin_audit_log;
DROP POLICY IF EXISTS "admin_audit_log_insert"     ON public.admin_audit_log;
DROP POLICY IF EXISTS "Authenticated users can insert their own audit log entries" ON public.admin_audit_log;

CREATE POLICY "Admins can read audit log" ON public.admin_audit_log FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

CREATE POLICY "Authenticated users can insert their own audit log entries"
  ON public.admin_audit_log FOR INSERT TO authenticated
  WITH CHECK (performed_by = auth.uid());

NOTIFY pgrst, 'reload schema';
