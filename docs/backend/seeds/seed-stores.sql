-- ============================================================
-- Seed: tiendas (stores)
-- Exportado: 2026-04-15
-- 20 tiendas — físicas y digitales
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase.
-- Idempotente: ON CONFLICT (id) DO NOTHING en todas las filas.
-- created_by NULL indica tienda creada por el sistema.
-- ============================================================

BEGIN;

INSERT INTO stores (id, label, format_hint, created_by) VALUES
  ('cefcf20b-0d4b-4bb0-9200-c47748b4571b', 'GAME',              'physical', NULL),
  ('1a68bf8a-578a-40a2-a44e-52a16b7473c9', 'PlayStation Store', 'digital',  NULL),
  ('22732bec-d9fc-4d08-9ed5-ed853f6faf08', 'Microsoft Store',   'digital',  NULL),
  ('f0fa5b7c-a021-4b65-bff4-efea6d342ee1', 'Nintendo Store',    'digital',  NULL),
  ('94c523e8-6432-4541-afb5-404f049eb333', 'Play Asia',         'physical', NULL),
  ('316db037-2556-42cf-8314-742dc0b729f2', 'Xtralife',          'physical', NULL),
  ('c91b87af-40b0-4d36-a337-98e1efd55cca', 'MediaMarkt',        'physical', NULL),
  ('cffaa8cf-3001-426b-b7da-c5c325b63bf9', 'Limited Run Games', 'physical', NULL),
  ('ddfef6f2-013d-4749-a38b-41c08699d894', 'Larian Store',      'physical', NULL),
  ('a9c90cbe-836d-4176-8156-4bd95c8611fd', 'Wallapop',          'physical', NULL),
  ('25feba30-59a3-45db-b5e0-708a307dbcc2', 'CEX',               'physical', NULL),
  ('bfc1f6e2-2a57-433b-8fdc-edc3d749083a', 'Canadian Games',    'physical', NULL),
  ('117361e0-1d7d-44ff-8871-c5d183430cab', 'NIS Online Store',  'physical', NULL),
  ('5a1485e8-34ad-42a7-80c0-0756722d105f', 'Impact Games',      'physical', NULL),
  ('2da169b9-64fa-4994-a8d9-ad0a9c46f912', 'Akiba Games',       'physical', NULL),
  ('e308664a-3559-4dce-aaa9-94a4ef7b8e3c', 'TodoConsolas',      'physical', NULL),
  ('bb26cf53-3fdc-4528-90a8-fd00991dabd1', 'Ninguna',           'physical', NULL),
  ('8707ba89-2de2-4e14-8958-0581c577fe14', 'eBay',              'physical', NULL),
  ('10ea69c0-741c-48dd-b14b-9592c88b76f3', 'Miravia',           'physical', NULL),
  ('2adb2da9-1721-4b4c-a43a-6029ac252b84', 'Amazon',            'physical', NULL)
ON CONFLICT (id) DO NOTHING;

COMMIT;
