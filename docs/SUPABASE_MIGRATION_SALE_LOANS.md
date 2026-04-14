# Supabase — Migración: ventas y préstamos en consolas y mandos

Ejecuta las siguientes sentencias SQL en el editor de Supabase (**SQL Editor → New query**) en el orden indicado.

---

## 1. Añadir columnas de venta a `user_consoles`

```sql
ALTER TABLE user_consoles
  ADD COLUMN IF NOT EXISTS for_sale          boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sale_price        numeric(10,2),
  ADD COLUMN IF NOT EXISTS sold_at           timestamptz,
  ADD COLUMN IF NOT EXISTS sold_price_final  numeric(10,2),
  ADD COLUMN IF NOT EXISTS active_loan_id    uuid,
  ADD COLUMN IF NOT EXISTS active_loan_to    text,
  ADD COLUMN IF NOT EXISTS active_loan_at    timestamptz;
```

---

## 2. Añadir columnas de venta a `user_controllers`

```sql
ALTER TABLE user_controllers
  ADD COLUMN IF NOT EXISTS for_sale          boolean     NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sale_price        numeric(10,2),
  ADD COLUMN IF NOT EXISTS sold_at           timestamptz,
  ADD COLUMN IF NOT EXISTS sold_price_final  numeric(10,2),
  ADD COLUMN IF NOT EXISTS active_loan_id    uuid,
  ADD COLUMN IF NOT EXISTS active_loan_to    text,
  ADD COLUMN IF NOT EXISTS active_loan_at    timestamptz;
```

---

## 3. Crear tabla `hardware_loans`

Tabla polimórfica para préstamos de consolas y mandos (extensible a futuros tipos).

```sql
CREATE TABLE IF NOT EXISTS hardware_loans (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type     text        NOT NULL CHECK (item_type IN ('console', 'controller')),
  user_item_id  uuid        NOT NULL,
  loaned_to     text        NOT NULL,
  loaned_at     timestamptz NOT NULL,
  returned_at   timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por ítem
CREATE INDEX IF NOT EXISTS hardware_loans_item_idx
  ON hardware_loans (item_type, user_item_id);

-- RLS: el usuario solo ve sus propios préstamos
ALTER TABLE hardware_loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own hardware loans"
  ON hardware_loans
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_consoles    WHERE id = hardware_loans.user_item_id AND user_id = auth.uid()
      UNION
      SELECT 1 FROM user_controllers WHERE id = hardware_loans.user_item_id AND user_id = auth.uid()
    )
  );
```

---

## 4. Crear vista `available_items`

Muestra todos los artículos marcados como en venta pero aún no vendidos.

```sql
CREATE OR REPLACE VIEW available_items AS
  -- Juegos en venta
  SELECT
    ug.id::text                         AS id,
    'game'::text                        AS item_type,
    COALESCE(g.name, ug.custom_name)    AS item_name,
    NULL::text                          AS brand_name,
    ug.sale_price                       AS sale_price,
    ug.user_id                          AS user_id
  FROM user_games_full ug
  LEFT JOIN games g ON g.id = ug.game_id
  WHERE ug.for_sale = true AND ug.sold_at IS NULL

  UNION ALL

  -- Consolas en venta
  SELECT
    uc.id::text                         AS id,
    'console'::text                     AS item_type,
    c.name                              AS item_name,
    cb.name                             AS brand_name,
    uc.sale_price                       AS sale_price,
    uc.user_id                          AS user_id
  FROM user_consoles uc
  JOIN consoles c    ON c.id = uc.console_id
  LEFT JOIN brands cb ON cb.id = c.brand_id
  WHERE uc.for_sale = true AND uc.sold_at IS NULL

  UNION ALL

  -- Mandos en venta
  SELECT
    uct.id::text                        AS id,
    'controller'::text                  AS item_type,
    ct.name                             AS item_name,
    ctb.name                            AS brand_name,
    uct.sale_price                      AS sale_price,
    uct.user_id                         AS user_id
  FROM user_controllers uct
  JOIN controllers ct    ON ct.id = uct.controller_id
  LEFT JOIN brands ctb   ON ctb.id = ct.brand_id
  WHERE uct.for_sale = true AND uct.sold_at IS NULL;
```

> **Nota:** ajusta los nombres de tabla/columna si tu esquema difiere (p. ej. `user_games_full`, `games`, `brands`, etc.).

---

## 5. Crear vista `sold_items`

Muestra todos los artículos vendidos (historial), ordenados por fecha descendente.

```sql
CREATE OR REPLACE VIEW sold_items AS
  -- Juegos vendidos
  SELECT
    ug.id::text                         AS id,
    'game'::text                        AS item_type,
    COALESCE(g.name, ug.custom_name)    AS item_name,
    NULL::text                          AS brand_name,
    ug.sold_price_final                 AS sold_price_final,
    ug.sold_at                          AS sold_at,
    ug.user_id                          AS user_id
  FROM user_games_full ug
  LEFT JOIN games g ON g.id = ug.game_id
  WHERE ug.sold_at IS NOT NULL

  UNION ALL

  -- Consolas vendidas
  SELECT
    uc.id::text                         AS id,
    'console'::text                     AS item_type,
    c.name                              AS item_name,
    cb.name                             AS brand_name,
    uc.sold_price_final                 AS sold_price_final,
    uc.sold_at                          AS sold_at,
    uc.user_id                          AS user_id
  FROM user_consoles uc
  JOIN consoles c    ON c.id = uc.console_id
  LEFT JOIN brands cb ON cb.id = c.brand_id
  WHERE uc.sold_at IS NOT NULL

  UNION ALL

  -- Mandos vendidos
  SELECT
    uct.id::text                        AS id,
    'controller'::text                  AS item_type,
    ct.name                             AS item_name,
    ctb.name                            AS brand_name,
    uct.sold_price_final                AS sold_price_final,
    uct.sold_at                         AS sold_at,
    uct.user_id                         AS user_id
  FROM user_controllers uct
  JOIN controllers ct    ON ct.id = uct.controller_id
  LEFT JOIN brands ctb   ON ctb.id = ct.brand_id
  WHERE uct.sold_at IS NOT NULL;
```

---

## 6. (Opcional) RLS en las vistas

Si Supabase no propaga automáticamente el RLS de las tablas base a las vistas, añade políticas explícitas o usa `security_invoker`:

```sql
ALTER VIEW available_items SET (security_invoker = true);
ALTER VIEW sold_items       SET (security_invoker = true);
```

---

## Resumen de cambios

| Objeto                  | Tipo     | Descripción                                             |
|-------------------------|----------|---------------------------------------------------------|
| `user_consoles`         | ALTER    | +7 columnas de venta/préstamo                           |
| `user_controllers`      | ALTER    | +7 columnas de venta/préstamo                           |
| `hardware_loans`        | CREATE   | Tabla polimórfica de préstamos (consolas y mandos)      |
| `available_items`       | VIEW     | UNION de los 3 tipos con `for_sale=true, sold_at=NULL` |
| `sold_items`            | VIEW     | UNION de los 3 tipos con `sold_at IS NOT NULL`          |
