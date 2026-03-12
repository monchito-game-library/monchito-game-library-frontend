/**
 * Script de migración masiva de datos legacy → Supabase schema v3
 *
 * Uso:
 *   1. Pon tus datos legacy en scripts/legacy-games.json (array de juegos)
 *   2. Rellena USER_ID con tu UUID de Supabase (lo ves en la app al iniciar sesión,
 *      o en Supabase Dashboard → Authentication → Users)
 *   3. Ejecuta: node scripts/migrate-legacy.mjs
 *
 * El script es idempotente: si un juego ya existe en game_catalog (por título),
 * reutiliza ese registro y no crea uno nuevo.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ─── CONFIGURACIÓN ────────────────────────────────────────────────────────────

const SUPABASE_URL = 'https://egevnihppclxucorhdjt.supabase.co';

/**
 * ⚠️  RELLENA ESTO con la service_role key de Supabase.
 *    Encuéntrala en: Supabase Dashboard → Settings → API → service_role (secret)
 *    Esta key bypasea el RLS y es necesaria para inserts desde scripts externos.
 *    ¡NO la uses en el frontend ni la subas a git!
 */
const SUPABASE_SERVICE_ROLE_KEY = 'sb_secret_CyG316N3uh0GewgBFvm1SA_CEPkDPFD';

/**
 * ⚠️  RELLENA ESTO con tu UUID de usuario en Supabase.
 *    Encuéntralo en: Supabase Dashboard → Authentication → Users
 */
const USER_ID = 'ac6f8120-d886-4fd2-9e6a-3fd0bba64059';

// ─── MAPEOS LEGACY → NUEVO SCHEMA ─────────────────────────────────────────────

/** Mapeo de tiendas legacy a StoreType */
const STORE_MAP = {
  'CANADIAN GAMES': 'cnd-ga',
  'Canadian Games': 'cnd-ga',
  'canadian games': 'cnd-ga',
  'CND-GA': 'cnd-ga',
  'GAME MANIA IBERIA': 'gm-ibe',
  'GAME IBERIA': 'gm-ibe',
  GAME: 'gm-ibe',
  AMAZON: 'amz',
  Amazon: 'amz',
  AMZ: 'amz',
  EBAY: 'ebay',
  eBay: 'ebay',
  'MEDIA MARKT': 'mrv',
  MediaMarkt: 'mrv',
  'MEDIA-MARKT': 'mrv',
  PSN: 'psn',
  'PlayStation Store': 'psn',
  'MICROSOFT STORE': 'ms',
  'Microsoft Store': 'ms',
  'NINTENDO STORE': 'ns-store',
  'Nintendo Store': 'ns-store',
  PLANETA: 'pla',
  XTREME: 'xtr',
  MEDIK: 'mdk',
  LIDL: 'lmt',
  'LEROY MERLIN': 'lrn',
  WALMART: 'wall',
  CEX: 'cex',
  NIS: 'nis',
  'IMPORT GAMES': 'imp-ga',
  'Import Games': 'imp-ga',
  'IMP-GA': 'imp-ga',
  'AKIHABARA GAMES': 'akb-ga',
  Akihabara: 'akb-ga',
  'AKB-GA': 'akb-ga',
  TODOCONSOLAS: 'td-cons',
  TodoConsolas: 'td-cons',
  'TD-CONS': 'td-cons',
  NINGUNA: 'none',
  NONE: 'none',
  '': 'none'
};

/** Mapeo de condición legacy */
const CONDITION_MAP = {
  '2ª MANO': 'used',
  '2A MANO': 'used',
  'SEGUNDA MANO': 'used',
  USADO: 'used',
  USED: 'used',
  NUEVO: 'new',
  NEW: 'new',
  new: 'new',
  used: 'used'
};

/** Plataformas válidas del nuevo schema */
const VALID_PLATFORMS = new Set([
  'PS5',
  'PS4',
  'PS3',
  'PS2',
  'PS1',
  'PS-VITA',
  'PSP',
  'GBC',
  'GBA',
  'DS',
  '3DS',
  'WII',
  'GAME-CUBE',
  'SWITCH',
  'XBOX',
  'XBOX-360',
  'XBOX-ONE',
  'XBOX-SERIES',
  'PC'
]);

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Códigos de tienda válidos en el nuevo schema */
const VALID_STORES = new Set([
  'gm-ibe', 'amz', 'ebay', 'mrv', 'psn', 'ms', 'ns-store', 'pla', 'xtr',
  'mdk', 'lmt', 'lrn', 'wall', 'cex', 'cnd-ga', 'nis', 'imp-ga', 'akb-ga',
  'td-cons', 'none',
]);

/**
 * Normaliza la tienda legacy al tipo StoreType.
 * Si ya es un código válido lo pasa directo; si es un nombre en texto lo mapea.
 * Si no reconoce el valor, devuelve 'none' y lo loggea.
 */
function mapStore(legacyStore) {
  if (!legacyStore) return 'none';
  const value = legacyStore.trim();
  // Ya es un código válido → pasarlo directo
  if (VALID_STORES.has(value)) return value;
  // Es un nombre en texto → intentar mapear
  const mapped = STORE_MAP[value];
  if (!mapped) {
    console.warn(`  ⚠️  Tienda desconocida: "${legacyStore}" → usando 'none'`);
    return 'none';
  }
  return mapped;
}

/**
 * Normaliza la condición legacy al tipo 'new' | 'used' | null.
 */
function mapCondition(legacyCondition) {
  if (!legacyCondition) return null;
  const mapped = CONDITION_MAP[legacyCondition.trim()];
  if (!mapped) {
    console.warn(`  ⚠️  Condición desconocida: "${legacyCondition}" → usando null`);
    return null;
  }
  return mapped;
}

/**
 * Valida y normaliza la plataforma.
 */
function mapPlatform(legacyPlatform) {
  if (!legacyPlatform) return null;
  const upper = legacyPlatform.trim().toUpperCase();
  if (VALID_PLATFORMS.has(upper)) return upper;
  // Algunos mapeos de nombre alternativo
  const PLATFORM_MAP = {
    'PLAYSTATION 5': 'PS5',
    'PLAYSTATION 4': 'PS4',
    'PLAYSTATION 3': 'PS3',
    'PLAYSTATION 2': 'PS2',
    'PLAYSTATION 1': 'PS1',
    PLAYSTATION: 'PS1',
    VITA: 'PS-VITA',
    'NINTENDO SWITCH': 'SWITCH',
    'GAME BOY COLOR': 'GBC',
    'GAME BOY ADVANCE': 'GBA',
    'NINTENDO DS': 'DS',
    'NINTENDO 3DS': '3DS',
    'NINTENDO WII': 'WII',
    GAMECUBE: 'GAME-CUBE',
    'XBOX ONE': 'XBOX-ONE',
    'XBOX 360': 'XBOX-360',
    'XBOX SERIES': 'XBOX-SERIES'
  };
  const platformMapped = PLATFORM_MAP[upper];
  if (platformMapped) return platformMapped;
  console.warn(`  ⚠️  Plataforma desconocida: "${legacyPlatform}" → usando null`);
  return null;
}

/**
 * Genera un slug único a partir del título.
 */
function makeSlug(title) {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // quitar acentos
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') +
    '-' +
    Date.now() +
    '-' +
    Math.random().toString(36).slice(2, 6)
  );
}

/**
 * Pausa N milisegundos (para no saturar la API).
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── MIGRACIÓN PRINCIPAL ──────────────────────────────────────────────────────

async function migrate() {
  // Validar configuración
  if (USER_ID === 'PON-AQUI-TU-UUID') {
    console.error('❌ ERROR: Debes rellenar USER_ID con tu UUID de Supabase.');
    console.error('   Encuéntralo en: Supabase Dashboard → Authentication → Users');
    process.exit(1);
  }
  if (SUPABASE_SERVICE_ROLE_KEY === 'PON-AQUI-TU-SERVICE-ROLE-KEY') {
    console.error('❌ ERROR: Debes rellenar SUPABASE_SERVICE_ROLE_KEY con tu service_role key.');
    console.error('   Encuéntrala en: Supabase Dashboard → Settings → API → service_role (secret)');
    process.exit(1);
  }

  // Leer datos legacy
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const dataPath = join(__dirname, 'legacy-games.json');
  let legacyGames;
  try {
    legacyGames = JSON.parse(readFileSync(dataPath, 'utf-8'));
  } catch {
    console.error(`❌ ERROR: No se encontró el archivo de datos legacy en: ${dataPath}`);
    console.error('   Crea el fichero scripts/legacy-games.json con tu array de juegos.');
    process.exit(1);
  }

  console.log(`\n🎮 Monchito Game Library — Migración legacy`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📦 Juegos a migrar: ${legacyGames.length}`);
  console.log(`👤 Usuario destino: ${USER_ID}\n`);

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < legacyGames.length; i++) {
    // Soporta tanto { title, ... } como { userId, game: { title, ... } }
    const legacy = legacyGames[i].game ?? legacyGames[i];
    const prefix = `[${String(i + 1).padStart(3, '0')}/${legacyGames.length}]`;

    if (!legacy.title) {
      console.warn(`${prefix} ⚠️  Sin título, saltando...`);
      skipped++;
      continue;
    }

    process.stdout.write(`${prefix} "${legacy.title}" (${legacy.platform || '?'}) ... `);

    try {
      // ── 1. game_catalog ──────────────────────────────────────────────────
      // Buscar por título exacto (case-insensitive)
      const { data: existingCatalog } = await supabase
        .from('game_catalog')
        .select('id')
        .ilike('title', legacy.title)
        .limit(1)
        .maybeSingle();

      let catalogId;

      if (existingCatalog) {
        catalogId = existingCatalog.id;
      } else {
        const { data: newCatalog, error: catalogError } = await supabase
          .from('game_catalog')
          .insert({
            rawg_id: null,
            title: legacy.title,
            slug: makeSlug(legacy.title),
            image_url: legacy.image || null,
            released_date: null,
            rating: 0,
            metacritic_score: null,
            esrb_rating: null,
            platforms: legacy.platform ? [legacy.platform] : [],
            genres: [],
            source: 'manual'
          })
          .select('id')
          .single();

        if (catalogError) {
          throw new Error(`game_catalog: ${catalogError.message}`);
        }
        catalogId = newCatalog.id;
      }

      // ── 2. user_games ─────────────────────────────────────────────────────
      const status = legacy.platinum === true ? 'platinum' : 'owned';
      const condition = mapCondition(legacy.condition);
      const store = mapStore(legacy.store);
      const platform = mapPlatform(legacy.platform);

      const { error: userGameError } = await supabase.from('user_games').insert({
        user_id: USER_ID,
        game_catalog_id: catalogId,
        price: legacy.price ?? null,
        store: store,
        platform: platform,
        condition: condition,
        purchased_date: null,
        platinum: legacy.platinum ?? false,
        status: status,
        personal_rating: null,
        hours_played: 0,
        started_date: null,
        completed_date: null,
        platinum_date: null,
        description: legacy.description || null,
        is_favorite: legacy.isFavorite ?? false
      });

      if (userGameError) {
        // Duplicado (mismo juego ya insertado para este usuario) → saltar sin error
        if (userGameError.code === '23505') {
          console.log('⏭️  (duplicado)');
          skipped++;
          continue;
        }
        throw new Error(`user_games: ${userGameError.message}`);
      }

      console.log('✅');
      inserted++;
    } catch (err) {
      console.log(`❌ ERROR: ${err.message}`);
      errors++;
    }

    // Pequeña pausa para no saturar Supabase (rate limiting)
    if ((i + 1) % 10 === 0) await sleep(500);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Insertados:  ${inserted}`);
  console.log(`⏭️  Saltados:   ${skipped}`);
  console.log(`❌ Errores:    ${errors}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

migrate().catch((err) => {
  console.error('\n💥 Error fatal:', err);
  process.exit(1);
});
