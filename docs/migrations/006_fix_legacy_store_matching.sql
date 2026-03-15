-- Migration 006: fix store values for games that failed title-matching during legacy import
-- Only updates games currently set to 'none' (never matched) using unaccent for accent/apostrophe tolerance
-- Run AFTER enabling unaccent extension: CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE EXTENSION IF NOT EXISTS unaccent;

UPDATE user_games ug SET store = 'td-cons'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Scars Above'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Chernobylite'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Death''s Door Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Godfall: Ascended Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Aragami 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Thymesia'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Forspoken'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Uncharted: Legacy of Thieves Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tiny Tina’s Wonderlands: Next-Level Ed'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Awaken Astral Blade Tania''s Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mdk'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Like a Dragon: ISHIN'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Hitman World of Assassination'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Atlas Fallen'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Trek to Yomi Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ravenswatch'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('God of War Ragnarok'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet & Clank: Una dimensión aparte'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Suicide Squad: Kill The Justice League Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Remnant II'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Steelrising'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('A Plague Tale: Innocence'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Prince of Persia The Lost Crown'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mrv'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ghost Of Tsushima: Director''s Cut'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ultros Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Wild Hearts'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Robocop: Rogue City'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('A Plague Tale: Requiem'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Metal Gear Solir Master Collection Vol 1'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Helldivers II'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Last of Us Parte I'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Soulstice'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'pla'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lollipop Chainsaw RePOP'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Mortal Shell Edición Enhanced'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Demon''s Souls'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Nioh Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Street Fighter 6 Steelbook Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Spiderman 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mrv'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Rise of the Ronin'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Teenage Mutant Ninja Turtles: Mutants Unleashed Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Marvel''s Guardians of the Galaxy Edición Cósmica Deluxe'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Granblue Fantasy Relink'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mrv'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The First Berserker Khazan'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mrv'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Black Myth: Wukong'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lords of the fallen Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'pla'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Gaiden 2 Black'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Stellar Blade'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tekken 8 Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Wo Long: Fallen Dynasty Launch Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Asterigos: Curse of the Stars'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('AI Limit Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mdk'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dragon''s Dogma 2 (Steelbook edition)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dead Cells Return to Castlevania Signature Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Blasphemous II Limited Collector''s Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Final Fantasy XVI Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'lrn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Baldur’s Gate 3 - Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Final Fantasy VII Rebirth Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lies of P Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('PS5'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Helldivers Super Earth - Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Injustice: Gods Among Us Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Warhammer Chaosbane'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Darksiders Genesis'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tomb Raider: Definitive Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Just Cause 4 Gold Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Soulcalibur VI'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Redeemer Enhanced Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Chronos Before the Ashes'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lords of the Fallen'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lego El Hobbit'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Darksiders 3'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Uncharted: The Nathan Drake collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Surge'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Rise Of The Tomb Rider: 20º Aniversario'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mdk'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Klonoa Phantasy Reverie'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('God of War 3 - Remasterizado'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('InFamous Second Son'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Last of Us: Remastered'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet & Clank (2016)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Styx Shards of Darkness'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dragon Ball FighterZ'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Naruto Shippuden: Ultimate Ninja Storm 4 Road to Boruto'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Biomutant'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Code Vein'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Infamous: First Light'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Sleeping Dogs Definitive Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Death Stranding'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Final Fantasy XV: Royal Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lego Star Wars La Saga Skywalker'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Naruto Shippuden: Ultimate Ninja Storm Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Order 1886 Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Masacre (Deadpool)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Trine 5: A Clockwork Consipiracy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tails of Iron Crimson Knight Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Metro Redux Doble Pack'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dragon''s Dogma: Dark Araisen'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Devil May Cry Definitive Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tekken 7 Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Injustice 2: Legendary Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bloodborne: Game Of The Year Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Remnant From the Ashes'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Naruto x Boruto Ultimate Ninja Storm Connections'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Metal Gear Solid V: The Definitive Experience'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Diablo III: Eternal Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Darksiders: Warmastered Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Darksiders II - Deathinitive Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Shadow Tactics: Blades of the Shogun'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Guilty Gear XRD: Rev2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('NieR: Automata Game of the YoRHa Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Horizon Zero Dawn: Complete Edition (Edicion Especial)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Crash Bandicoot N. Sane Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Borderlands: Game of The Year Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bioshock The Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Spyro Reignited Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Mortal Kombat 11 Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Borderlands: Una Colección Muy Guapa Complete Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Hades'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Blazblue Cross Tag Battle Special Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Spider-Man GOTY (2018)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Days Gone'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Shadow of the Colossus'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('NieR Replicant'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Shadow Of The Tomb Raider: Definitive Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Kimetsu no Yaiba - las Crónicas de Hinokami'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ultra Age'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('F.I.S.T Forged in Shadow Torch Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Stranger of Paradise: Final Fantasy Origin'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Blazblue Chronophantasma Extend Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Mafia Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Uncharted 4 El desenlace del ladrón (Edición Especial)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Trine: Ultimate Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Samurai Warriors 5'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Crisis Core - Final Fantasy VII - Reunion'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'nis'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Odin Sphere Leifthrasir'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Scarlet Nexus'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Devil May Cry 5 Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Spider-Man: Miles Morales'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('SNK Fighting Legends Edición Digipack'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dragon Ball Z: Kakarot Legendary Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Devil May Cry: HD Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gungrave G.O.R.E. Day One Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Valkyrie Elysium'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Samurai Shodown Neogeo Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Evil West'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'pla'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Guilty Gear Strive'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Broforce Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Crash Bandicoot 4 It''s About Time'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Fight ´N Rage 5th Anniversary Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Ascent Edición Cyber'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dark Souls Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Borderlands 3 Edición Súper Deluxe'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Sekiro'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The King of Fighters XV Omega Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('JoJo''s Bizarre Adventure: All Star Battle R'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bayonetta & Vanquish 10th Anniversary Bundle Launch Edition (Steelbook)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('FINAL FANTASY VII REMAKE - DELUXE EDITION'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('DNF Duel'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tales of Arise'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mdk'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Last of Us Parte II Edición Especial'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Surge 2 Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('SIFU Edición Vengeance'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Nioh 2 Special Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dragon''s Crown Pro'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'pla'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Gaiden: Collection (Importación Japonesa)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Nioh Complete Edition (Importación Japonesa)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'pla'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Devil May Cry 4 Special Edition (Importación Asia)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Monster Hunter Iceborn Steelbook Master Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'imp-ga'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Teenage Mutant Ninja Turtles: Shredder''s Revenge - Signature Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Horizon Forbidden West Edicion Especial'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Elden Ring Edición Day One'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Streets of Rage 4 Signature Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Wanted: Dead - Collector´s Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('God of War Edición Special'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Blasphemous Edición Coleccionista'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Onimusha Warlords Genma Seal Box Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('PS4 Pro Ed. God of War + 2 Mandos originales + 4 Juegos'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('FIFA 14'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lost Planet 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Star Wars El Poder De La Fuerza (Ed Sith)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Infamous 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Heavenly Sword'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Wet'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('All Star Battle Royale'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Genji: Days of the Blade'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Prototipe 2 Edición Limitada'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Star Wars - El Poder De La Fuerza II'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet and Clank: En busca del tesoro'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tekken 6'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tekken Tag Tournament 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Infamous'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Prototipe'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Castlevania: Lords of Shadow'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Castlevania: Lords of Shadow 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet and Clank: Armados hasta los dientes'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Lego El señor de los anillos'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Nier'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'akb-ga'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Thor Dios del Trueno'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('God of War Ascension'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Prince of Persia (Edición Especial)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Prince of Persia Las Arenas Olvidadas (Edición Especial)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet and Clank: Nexus'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Metal Gear Rising: Revengeance'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Afro Samurai'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Asura''s Wrath'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Cursed Crusade'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Anarchy Reigns'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('God of War Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet and Clank: Atrapados en el tiempo'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Enslaved Odyssey to the West Collector''s Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('God of War Collection II'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Prince of Persia HD Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Killer is Dead'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Gaiden Sigma 2 Premium Box JAP'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Sly Cooper: Ladrones en el Tiempo'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('X-men Origenes Lobezno Uncaged Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Metal Gear Solid: The Legacy Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Capitan America Supersoldado'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Castlevania: Lords of Shadow Special Edition JAP'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Street Fighter X Tekken Special Edition JAP'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ultra Street Figther IV'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Demons Souls'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dante''s Inferno Death Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Jak and Daxter Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Sly Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ratchet and Clank Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('PS3 + 2 Mandos Originales + 10 Juegos'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears of War'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears of War 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Splinter Cell: Double Agent'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Splinter Cell: Pandora Tomorrow'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('El Señor de los Anillos: El retorno del rey'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears of War 3'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Sunset Overdrive'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Army of Two'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Splinter Cell: Conviction (Steelbook)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Blade'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('warhammer 40000 Space Marine'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Saints Row'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Saints Row 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed IV: Black Flag'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ghost Recon Wildlands'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Gaiden 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Splinter Cell'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Watch Dogs 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Watch Dogs Complete Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Saints Row IV Re-Elected'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Army of Two 40th day'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears of War 4'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ryse Son of Rome'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Grand Theft Auto IV'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Grand Theft Auvto IV: Episodes from Liberty City'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The division 2 Whasington D.C. Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Division Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Starfield Premium Edition Upgrade'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears 5'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Max Payne 3'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('El Señor de los Anillos: Las dos torres'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Need For Speed Underground 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Unity'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Rogue Remastered'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Saints Row Edicion Day One'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears of War Judgment'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Yaiba Ninja Gaiden Z'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bully Scholarship Edition (NTCS)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Grand Theft Auto V Premium Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Halo The Master Chief Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Forza Horizon 4'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Mando XBOX-ONE Ed Proyect Scorpio'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Army of Two: The Devil''s Cartel'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Saints Row The Third Remastered'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('La Tierra Media: Sombras de Mordor Goty'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Odyssey'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Origins'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed The Ezio Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ghost Recon BreakPoint Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Splinter Cell: Blacklist Ultimatum Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Splinter Cell: Chaos Theory'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed III Remastered & Liberation Remastered'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Grand Theft Auto The Trilogy'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Grand Theft Auto V (Nueva Gen Edition)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Star Wars Jedi Fallen Order'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Witcher 3 Complete Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gears of War Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Gaiden 3: Razor''s Edge'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Batman Arkham Origins'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Need For Speed Heat'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Kingdoms of Amalur: Re-Reckoning'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Mass Effect Legendary Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Red Dead Redemption GOTY (Edicion XBOX-ONE)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('GreedFall Gold Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Witcher 2 Assassins of Kings Enhanced Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Dead Space Remake'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Halo Infinite Steelbook Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Star Wars Jedi Survivors'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Valhalla: El Amanecer del Ragnarök'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('La Tierra Media: Sombras de Guerra Edición Definitiva'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Fable 2 Edición Coleccionista'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'cex'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Forza Horizon 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Binary Domain'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Immortals: Fenyx Rising Gold Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Atomic Heart'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'CANADIAN GAMES'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Fable 3 Edición coleccionista'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Mirage Launch Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassins Creed Valhalla Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Gotham Knights Deluxe Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('WWE 2K22 Deluxe edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Batman Arkham Collection (Steel Book)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Red Dead Redemption 2 Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ninja Gaiden Black'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Watch Dogs Legion Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('XBOX-360 SLIM'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Witcher 2 Enhance Edition (Dark Edition)'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Shadows Collector Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ms'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('XBOX-SERIES'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Monster Hunter Rise: Sunbreak'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Witcher 3 Wild Hunt'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Teenage Mutant Ninja Turtles: The Cowabunga Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Snow Bros Nick & Tom Special'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Jitsu Squad'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Hyrule Warriors: La Era del Cataclismo'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Legend of Zelda: Breath of the Wild '))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Streets of Rage 4. Anniversary Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Super Smash Bros Ultimate'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Cuphead Edición Fisica'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Super Mario 3D World + Bowser''s Fury'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Luigi''s Mansion 3'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'xtr'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Teenage Mutant Ninja Turtles: Shredder''s Revenge'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bayonetta 3'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Super Mario Odyssey'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Mario Strikers Battle League Football'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ebay'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bayonetta 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Getsufumaden Undying moon deluxe edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'wall'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Bayonetta 3 Edición Colleccionista'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'ns-store'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Legend of Zelda: Tears of the Kingdom - Edición Coleccionista'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Multiversus'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('High on Life'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Teenage Mutant Ninja Turtles: The Cowabunga Collection'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('ASTRO''s PLAYROOM'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Assassin''s Creed Valhalla - Complete Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tom Clancy’s The Division 2: Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Just Cause 4: Reloaded'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Tom Clancy''s The Division: Gold Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('They Always Run'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('La Tierra Media: Sombras de Guerra'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('La Tierra Media: Sombras de Mordor - Edicón Game of the Year'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Sword of the Vagrant'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Witcher 3: Wild Hunt – Complete Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'psn'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Clid The Snail'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'amz'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('The Precinct - Edición Limitada'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Blazing Strike Limited Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('NARUTO X BORUTO Ultimate Ninja STORM CONNECTIONS Ultimate Edition'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'gm-ibe'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Ghostrunner 2'))
  AND ug.store = 'none';

UPDATE user_games ug SET store = 'mrv'
FROM game_catalog gc
WHERE ug.game_catalog_id = gc.id
  AND unaccent(lower(gc.title)) = unaccent(lower('Art of Rally Deluxe Edition'))
  AND ug.store = 'none';

