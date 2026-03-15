-- Add role column to user_preferences
-- Run this in the Supabase SQL editor before deploying.

BEGIN;

-- 1. Add role column (defaults to 'user' for all existing rows)
ALTER TABLE user_preferences
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user';

-- 2. Promote your user to admin
--    Replace the email below with yours.
UPDATE user_preferences
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'YOUR_EMAIL_HERE'
);

-- 3. Prevent users from changing their own role via the client
--    (they can only update the columns allowed here)
-- If you have a permissive UPDATE policy like:
--   USING (auth.uid() = user_id)
-- add a WITH CHECK that blocks role changes:
--
-- DROP POLICY IF EXISTS "users can update own preferences" ON user_preferences;
-- CREATE POLICY "users can update own preferences" ON user_preferences
--   FOR UPDATE USING (auth.uid() = user_id)
--   WITH CHECK (auth.uid() = user_id AND role = (SELECT role FROM user_preferences WHERE user_id = auth.uid()));
--
-- Note: the WITH CHECK above prevents the client from escalating its own role.

COMMIT;
