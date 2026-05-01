-- ============================================================
-- 001 — RLS hardware tables: ampliar escritura a 'admin' + 'owner'
-- ============================================================
-- Acompaña al PR #99 (rol owner). El schema canónico ya tiene
-- `role IN ('admin', 'owner')` pero el Supabase desplegado seguía
-- con `role = 'admin'`, lo que bloqueaba al owner al editar/eliminar
-- modelos, brands, editions y specs (PATCH rechazado en preflight).
-- ============================================================

-- hardware_brands
DROP POLICY IF EXISTS "Admins can insert brands" ON public.hardware_brands;
DROP POLICY IF EXISTS "Admins can update brands" ON public.hardware_brands;
DROP POLICY IF EXISTS "Admins can delete brands" ON public.hardware_brands;
CREATE POLICY "Admins can insert brands" ON public.hardware_brands FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_preferences
                      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can update brands" ON public.hardware_brands FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can delete brands" ON public.hardware_brands FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

-- hardware_models
DROP POLICY IF EXISTS "Admins can insert models" ON public.hardware_models;
DROP POLICY IF EXISTS "Admins can update models" ON public.hardware_models;
DROP POLICY IF EXISTS "Admins can delete models" ON public.hardware_models;
CREATE POLICY "Admins can insert models" ON public.hardware_models FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_preferences
                      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can update models" ON public.hardware_models FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can delete models" ON public.hardware_models FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

-- hardware_editions
DROP POLICY IF EXISTS "Admins can insert editions" ON public.hardware_editions;
DROP POLICY IF EXISTS "Admins can update editions" ON public.hardware_editions;
DROP POLICY IF EXISTS "Admins can delete editions" ON public.hardware_editions;
CREATE POLICY "Admins can insert editions" ON public.hardware_editions FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_preferences
                      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can update editions" ON public.hardware_editions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));
CREATE POLICY "Admins can delete editions" ON public.hardware_editions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

-- hardware_console_specs (FOR ALL combinada)
DROP POLICY IF EXISTS "Admins can manage console specs" ON public.hardware_console_specs;
CREATE POLICY "Admins can manage console specs" ON public.hardware_console_specs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_preferences
                      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

-- hardware_controller_specs (FOR ALL combinada)
DROP POLICY IF EXISTS "Admins can manage controller specs" ON public.hardware_controller_specs;
CREATE POLICY "Admins can manage controller specs" ON public.hardware_controller_specs FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_preferences
                 WHERE user_id = auth.uid() AND role IN ('admin', 'owner')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_preferences
                      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')));

NOTIFY pgrst, 'reload schema';
