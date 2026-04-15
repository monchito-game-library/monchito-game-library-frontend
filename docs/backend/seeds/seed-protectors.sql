-- ============================================================
-- Seed: protectores de cajas (order_products)
-- Proveedor principal: boxprotectors.nl
-- Proveedor alternativo: theboxprotectorshop.be (GBA)
-- Generado: 2026-04-15
-- 19 productos con sus packs de cantidad/precio/URL
-- ============================================================
-- Ejecutar en el SQL Editor de Supabase.
-- Idempotente: ON CONFLICT (id) DO NOTHING en todas las filas.
-- ============================================================

BEGIN;

INSERT INTO order_products (id, name, category, notes, is_active, packs) VALUES

  (
    '20000000-0000-0000-0000-000000000001',
    'Cajas tamaño BluRay',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,   "url":"https://www.boxprotectors.nl/a-72268597/playstation-3/1x-snug-fit-box-protectors-for-blu-ray/"},
      {"quantity":10,  "price":8.99,   "url":"https://www.boxprotectors.nl/a-72268600/playstation-3/10x-snug-fit-box-protectors-for-blu-ray/"},
      {"quantity":25,  "price":19.99,  "url":"https://www.boxprotectors.nl/a-72268603/playstation-3/25x-snug-fit-box-protectors-for-blu-ray/"},
      {"quantity":50,  "price":38.99,  "url":"https://www.boxprotectors.nl/a-72268606/playstation-3/50x-snug-fit-box-protectors-for-blu-ray/"},
      {"quantity":100, "price":74.99,  "url":"https://www.boxprotectors.nl/a-72268609/playstation-3/100x-snug-fit-box-protectors-for-blu-ray/"},
      {"quantity":250, "price":184.99, "url":"https://www.boxprotectors.nl/a-72268612/playstation-3/250x-snug-fit-box-protectors-for-blu-ray/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000002',
    'Cajas tamaño BluRay Extra',
    'box',
    'Con slipcover / steel boxes',
    TRUE,
    '[
      {"quantity":1,  "price":1.25,  "url":"https://www.boxprotectors.nl/a-80111588/dvd-cd-bluray/1x-snug-fit-box-protectors-for-blu-ray-with-slipcover-steel-boxes/"},
      {"quantity":10, "price":9.99,  "url":"https://www.boxprotectors.nl/a-80111603/dvd-cd-bluray/10x-snug-fit-box-protectors-for-blu-ray-with-slipcover-steel-boxes/"},
      {"quantity":25, "price":22.99, "url":"https://www.boxprotectors.nl/a-80111621/dvd-cd-bluray/25x-snug-fit-box-protectors-for-blu-ray-with-slipcover-steel-boxes/"},
      {"quantity":50, "price":39.99, "url":"https://www.boxprotectors.nl/a-80111630/dvd-cd-bluray/50x-snug-fit-box-protectors-for-blu-ray-with-slipcover-steel-boxes/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000003',
    'Cajas BluRay pack doble (x2)',
    'box',
    'Para cajas de BluRay con 2 discos',
    TRUE,
    '[
      {"quantity":1, "price":5.95, "url":"https://www.boxprotectors.nl/a-100076604/dvd-cd-bluray/1x-snug-fit-box-protectors-for-2-double-bluray/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000004',
    'Cajas tamaño DVD',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,   "url":"https://www.boxprotectors.nl/a-44704163/gamecube-dvd-protectors/1x-snug-fit-box-protector-for-gamecube-dvd/"},
      {"quantity":10,  "price":8.99,   "url":"https://www.boxprotectors.nl/a-44704194/gamecube-dvd-protectors/10x-snug-fit-box-protector-for-gamecube-dvd/"},
      {"quantity":25,  "price":19.99,  "url":"https://www.boxprotectors.nl/a-44704502/gamecube-dvd-protectors/25x-snug-fit-box-protector-for-gamecube-dvd/"},
      {"quantity":50,  "price":39.99,  "url":"https://www.boxprotectors.nl/a-44704518/gamecube-dvd-protectors/50x-snug-fit-box-protector-for-gamecube-dvd/"},
      {"quantity":100, "price":74.99,  "url":"https://www.boxprotectors.nl/a-44704529/gamecube-dvd-protectors/100x-snug-fit-box-protector-for-gamecube-dvd/"},
      {"quantity":250, "price":179.99, "url":"https://www.boxprotectors.nl/a-44704543/gamecube-dvd-protectors/250x-snug-fit-box-protector-for-gamecube-dvd/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000005',
    'Cajas tamaño DVD Extra',
    'box',
    'Para libros y media de mayor tamaño',
    TRUE,
    '[
      {"quantity":1,  "price":1.25,  "url":"https://www.boxprotectors.nl/a-84349385/dvd-cd-bluray/1x-snug-fit-box-protectors-for-dvd-larger-media-books/"},
      {"quantity":10, "price":11.99, "url":"https://www.boxprotectors.nl/a-84349391/dvd-cd-bluray/10x-snug-fit-box-protectors-dvd-larger-media-books/"},
      {"quantity":25, "price":24.99, "url":"https://www.boxprotectors.nl/a-84349397/dvd-cd-bluray/25x-snug-fit-box-protectors-dvd-larger-media-books/"},
      {"quantity":50, "price":44.99, "url":"https://www.boxprotectors.nl/a-84349400/dvd-cd-bluray/50x-snug-fit-box-protectors-dvd-larger-media-books/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000006',
    'Cajas DVD pack doble (x3)',
    'box',
    'Para cajas de DVD con 3 discos',
    TRUE,
    '[
      {"quantity":1, "price":5.95, "url":"https://www.boxprotectors.nl/a-100076526/dvd-cd-bluray/1x-snug-fit-box-protectors-for-3-double-dvd/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000007',
    'Cajas tamaño Switch',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,  "price":0.99,  "url":"https://www.boxprotectors.nl/a-52748849/switch-game-protectors/1x-switch-game-protector/"},
      {"quantity":10, "price":8.99,  "url":"https://www.boxprotectors.nl/a-52748852/switch-game-protectors/10x-switch-game-protector/"},
      {"quantity":25, "price":19.99, "url":"https://www.boxprotectors.nl/a-52748853/switch-game-protectors/25x-switch-game-protector/"},
      {"quantity":50, "price":38.99, "url":"https://www.boxprotectors.nl/a-52748857/switch-game-protectors/50x-switch-game-protector/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000008',
    'Cajas tamaño 3DS',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,   "url":"https://www.boxprotectors.nl/a-49739492/3ds-game-box-protector/1x-snug-fit-box-protectors-for-nintendo-3ds-boxes/"},
      {"quantity":10,  "price":8.99,   "url":"https://www.boxprotectors.nl/a-49739496/3ds-game-box-protector/10x-snug-fit-box-protectors-for-nintendo-3ds-boxes/"},
      {"quantity":25,  "price":19.99,  "url":"https://www.boxprotectors.nl/a-49739506/3ds-game-box-protector/25x-snug-fit-box-protectors-for-nintendo-3ds-boxes/"},
      {"quantity":50,  "price":38.99,  "url":"https://www.boxprotectors.nl/a-49739509/3ds-game-box-protector/50x-snug-fit-box-protectors-for-nintendo-3ds-boxes/"},
      {"quantity":100, "price":71.99,  "url":"https://www.boxprotectors.nl/a-49739520/3ds-game-box-protector/100x-snug-fit-box-protectors-for-nintendo-3ds-boxes/"},
      {"quantity":250, "price":179.99, "url":"https://www.boxprotectors.nl/a-49739522/3ds-game-box-protector/250x-snug-fit-box-protectors-for-nintendo-3ds-boxes/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000009',
    'Cajas tamaño DS',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,   "url":"https://www.boxprotectors.nl/a-46683461/ds-dsi-2ds-game-box-protectors/1x-snug-fit-box-protectors-for-nintendo-ds-boxes/"},
      {"quantity":10,  "price":8.99,   "url":"https://www.boxprotectors.nl/a-46683464/ds-dsi-2ds-game-box-protectors/10x-snug-fit-box-protectors-for-nintendo-ds-boxes/"},
      {"quantity":25,  "price":19.99,  "url":"https://www.boxprotectors.nl/a-46683491/ds-dsi-2ds-game-box-protectors/25x-snug-fit-box-protectors-for-nintendo-ds-boxes/"},
      {"quantity":50,  "price":38.99,  "url":"https://www.boxprotectors.nl/a-46683493/ds-dsi-2ds-game-box-protectors/50x-snug-fit-box-protectors-for-nintendo-ds-boxes/"},
      {"quantity":100, "price":71.99,  "url":"https://www.boxprotectors.nl/a-46683497/ds-dsi-2ds-game-box-protectors/100x-snug-fit-box-protectors-for-nintendo-ds-boxes/"},
      {"quantity":250, "price":174.99, "url":"https://www.boxprotectors.nl/a-46683500/ds-dsi-2ds-game-box-protectors/250x-snug-fit-box-protectors-for-nintendo-ds-boxes/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000010',
    'Cajas tamaño PSP',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,  "url":"https://www.boxprotectors.nl/a-52876913/psp-game-protectors/1x-snug-fit-box-protectors-for-psp-games/"},
      {"quantity":10,  "price":8.99,  "url":"https://www.boxprotectors.nl/a-52876914/psp-game-protectors/10x-snug-fit-box-protectors-for-psp-games/"},
      {"quantity":25,  "price":19.99, "url":"https://www.boxprotectors.nl/a-52876916/psp-game-protectors/25x-snug-fit-box-protectors-for-psp-games/"},
      {"quantity":50,  "price":39.99, "url":"https://www.boxprotectors.nl/a-52876917/psp-game-protectors/50x-snug-fit-box-protectors-for-psp-games/"},
      {"quantity":100, "price":74.99, "url":"https://www.boxprotectors.nl/a-53153076/psp-game-protectors/100x-snug-fit-box-protectors-for-psp-games/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000011',
    'Cajas tamaño GBA',
    'box',
    'Proveedor: theboxprotectorshop.be',
    TRUE,
    '[
      {"quantity":1,   "price":0.99,   "url":"https://www.theboxprotectorshop.be/a-44680074/gameboy-game-box-protectors/1x-snug-fit-box-protectors-for-gameboy/"},
      {"quantity":10,  "price":8.99,   "url":"https://www.theboxprotectorshop.be/a-44680205/gameboy-game-box-protectors/10x-snug-fit-box-protectors-for-gameboy/"},
      {"quantity":25,  "price":20.99,  "url":"https://www.theboxprotectorshop.be/a-44680221/gameboy-game-box-protectors/25x-snug-fit-box-protectors-for-gameboy/"},
      {"quantity":50,  "price":39.99,  "url":"https://www.theboxprotectorshop.be/a-44680283/gameboy-game-box-protectors/50x-snug-fit-box-protectors-for-gameboy/"},
      {"quantity":100, "price":74.99,  "url":"https://www.theboxprotectorshop.be/a-44680299/gameboy-game-box-protectors/100x-snug-fit-box-protectors-for-gameboy/"},
      {"quantity":250, "price":184.99, "url":"https://www.theboxprotectorshop.be/a-44680308/gameboy-game-box-protectors/250x-snug-fit-box-protectors-for-gameboy/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000012',
    'Cajas tamaño Xbox One',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,   "url":"https://www.boxprotectors.nl/a-56276549/xbox-one-games/1x-snug-fit-box-protector-for-xbox-one-games/"},
      {"quantity":10,  "price":8.99,   "url":"https://www.boxprotectors.nl/a-56276551/xbox-one-games/10x-snug-fit-box-protector-for-xbox-one-games/"},
      {"quantity":25,  "price":19.99,  "url":"https://www.boxprotectors.nl/a-56276554/xbox-one-games/25x-snug-fit-box-protector-for-xbox-one-games/"},
      {"quantity":50,  "price":39.99,  "url":"https://www.boxprotectors.nl/a-56276555/xbox-one-games/50x-snug-fit-box-protector-for-xbox-one-games/"},
      {"quantity":100, "price":74.99,  "url":"https://www.boxprotectors.nl/a-56276556/xbox-one-games/100-x-snug-fit-box-protector-for-xbox-one-games/"},
      {"quantity":250, "price":174.99, "url":"https://www.boxprotectors.nl/a-56276558/xbox-one-games/250-x-snug-fit-box-protector-for-xbox-one-games/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000013',
    'Cajas tamaño PSVita',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1,   "price":0.99,  "url":"https://www.boxprotectors.nl/a-52745322/ps-vita-game-protectors/1x-snug-fit-box-protectors-for-ps-vita-games/"},
      {"quantity":10,  "price":8.99,  "url":"https://www.boxprotectors.nl/a-52745324/ps-vita-game-protectors/10x-snug-fit-box-protectors-for-ps-vita-games/"},
      {"quantity":25,  "price":19.99, "url":"https://www.boxprotectors.nl/a-52745326/ps-vita-game-protectors/25x-snug-fit-box-protectors-for-ps-vita-games/"},
      {"quantity":50,  "price":39.99, "url":"https://www.boxprotectors.nl/a-52745327/ps-vita-game-protectors/50x-snug-fit-box-protectors-for-ps-vita-games/"},
      {"quantity":100, "price":74.99, "url":"https://www.boxprotectors.nl/a-52745328/ps-vita-game-protectors/100x-snug-fit-box-protectors-for-ps-vita-games/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000014',
    'Caja Especial 1 (4.6 x 15.9 x 21.4)',
    'box',
    'Ej: The Last of Us big box',
    TRUE,
    '[
      {"quantity":1, "price":6.95, "url":"https://www.boxprotectors.nl/a-93848974/playstation-3/protector-for-ps3-the-last-of-us-ellie-joel-big-box/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000015',
    'Caja Especial 2 (8 x 16.4 x 23.4)',
    'box',
    'Ej: Xbox / PS3 Black Ops big box',
    TRUE,
    '[
      {"quantity":1, "price":6.95, "url":"https://www.boxprotectors.nl/a-93847891/playstation-3/boxprotector-for-xbox-ps3-black-ops-big-box/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000016',
    'Caja PS3 Limited Edition (3 x 14.1 x 17.9)',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1, "price":4.95, "url":"https://www.boxprotectors.nl/a-88165214/playstation-3/ps3-big-box-limited-edition-protector/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000017',
    'Caja PS4 Limited Edition (3 x 14 x 17.8)',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1, "price":4.95, "url":"https://www.boxprotectors.nl/a-71849785/switch-special-edition-big-box/switch-big-box-limited-edition-protector/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000018',
    'Caja PS4 FFVII & DS Trilogy (4.6 x 14.1 x 17.9)',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1, "price":5.95, "url":"https://www.boxprotectors.nl/a-66060543/ps4-special-game-protectors/protector-for-ps4-final-fantasy-dark-souls/"}
    ]'
  ),

  (
    '20000000-0000-0000-0000-000000000019',
    'Caja PS5 FFVII Rebirth (6.2 x 14 x 17.8)',
    'box',
    NULL,
    TRUE,
    '[
      {"quantity":1, "price":6.95, "url":"https://www.boxprotectors.nl/a-87997142/playstation-5/protector-for-ps5-final-fantasy-vii/"}
    ]'
  )

ON CONFLICT (id) DO NOTHING;

COMMIT;
