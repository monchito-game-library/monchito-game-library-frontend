-- Migration 004: recreate user_games_full view to include format column

DROP VIEW IF EXISTS user_games_full;

CREATE VIEW user_games_full AS
SELECT
  ug.id,
  ug.user_id,
  ug.game_catalog_id,
  gc.rawg_id,
  gc.title,
  gc.slug,
  gc.description,
  gc.image_url,
  gc.released_date,
  gc.rating         AS rawg_rating,
  gc.metacritic_score,
  gc.esrb_rating,
  gc.platforms      AS available_platforms,
  gc.parent_platforms,
  gc.genres,
  gc.tags,
  gc.developers,
  gc.publishers,
  gc.source,
  ug.price,
  ug.store,
  ug.platform       AS user_platform,
  ug.condition,
  ug.purchased_date,
  ug.status,
  ug.platinum,
  ug.edition,
  ug.format,
  ug.personal_rating,
  ug.personal_review,
  ug.description    AS user_notes,
  ug.is_favorite,
  ug.created_at,
  ug.updated_at
FROM user_games ug
JOIN game_catalog gc ON ug.game_catalog_id = gc.id;
