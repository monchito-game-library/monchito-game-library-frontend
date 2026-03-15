-- ============================================================
-- Migration 002: stores table + game format field
-- ============================================================

-- 1. Stores table
CREATE TABLE IF NOT EXISTS stores (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT        UNIQUE NOT NULL,
  label       TEXT        NOT NULL,
  format_hint TEXT        CHECK (format_hint IN ('digital', 'physical')),
  is_system   BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Seed system stores
INSERT INTO stores (code, label, format_hint, is_system) VALUES
  ('gm-ibe',   'GAME',               'physical', TRUE),
  ('amz',      'Amazon',             'physical', TRUE),
  ('ebay',     'eBay',               'physical', TRUE),
  ('mrv',      'Miravia',            'physical', TRUE),
  ('psn',      'PlayStation Store',  'digital',  TRUE),
  ('ms',       'Microsoft Store',    'digital',  TRUE),
  ('ns-store', 'Nintendo Store',     'digital',  TRUE),
  ('pla',      'Play Asia',          'physical', TRUE),
  ('xtr',      'Xtralife',           'physical', TRUE),
  ('mdk',      'MediaMarkt',         'physical', TRUE),
  ('lmt',      'Limited Run Games',  'physical', TRUE),
  ('lrn',      'Larian Store',       'physical', TRUE),
  ('wall',     'Wallapop',           'physical', TRUE),
  ('cex',      'CEX',                'physical', TRUE),
  ('cnd-ga',   'Canadian Games',     'physical', TRUE),
  ('nis',      'NIS Online Store',   'physical', TRUE),
  ('imp-ga',   'Impact Games',       'physical', TRUE),
  ('akb-ga',   'Akiba Games',        'physical', TRUE),
  ('td-cons',  'TodoConsolas',       'physical', TRUE),
  ('none',     'Ninguna',            'physical', TRUE)
ON CONFLICT (code) DO NOTHING;

-- 3. Add format column to user_games
ALTER TABLE user_games
  ADD COLUMN IF NOT EXISTS format TEXT CHECK (format IN ('digital', 'physical'));

-- 4. Refresh user_games_full view to include format
-- Run after confirming the view definition includes all user_games columns.
-- If the view uses SELECT * from user_games JOIN game_catalog, the column
-- will be picked up automatically. Otherwise recreate the view manually.
