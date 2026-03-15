-- Migration 005: fix format for games bought on Amazon, eBay and Miravia
-- These were backfilled as 'digital' in 003 due to incorrect hints.
-- The hints are now corrected to 'physical' in the stores table.

UPDATE user_games ug
SET    format = s.format_hint
FROM   stores s
WHERE  ug.store      = s.code
  AND  ug.store      IN ('amz', 'ebay', 'mrv')
