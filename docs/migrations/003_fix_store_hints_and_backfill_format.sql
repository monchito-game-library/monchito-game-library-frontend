-- ============================================================
-- Migration 003: backfill format on existing user_games
-- ============================================================

-- Sets format on all games that have no format yet,
-- using the format_hint of the associated store.
-- Games whose store has no hint (NULL) are left as NULL.

UPDATE user_games ug
SET    format = s.format_hint
FROM   stores s
WHERE  ug.store       = s.code
  AND  s.format_hint  IS NOT NULL
  AND  ug.format      IS NULL;
