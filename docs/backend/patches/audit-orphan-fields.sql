-- Auditoría previa al refactor de obra/copia (B1).
-- Cuenta cuántas filas de user_games tienen valores en los campos huérfanos
-- (definidos en el schema pero nunca consumidos por el frontend) para decidir
-- si se pueden borrar con seguridad o hay que migrarlos antes.
-- Solo SELECT, no muta nada.

SELECT
  COUNT(*)                                                                            AS total,
  COUNT(*) FILTER (WHERE personal_review IS NOT NULL AND TRIM(personal_review) <> '') AS rows_review,
  COUNT(*) FILTER (WHERE array_length(tags_personal, 1) IS NOT NULL)                  AS rows_tags,
  COUNT(*) FILTER (WHERE started_date    IS NOT NULL)                                  AS rows_started,
  COUNT(*) FILTER (WHERE completed_date  IS NOT NULL)                                  AS rows_completed,
  COUNT(*) FILTER (WHERE purchased_date  IS NOT NULL)                                  AS rows_purchased
FROM user_games;
