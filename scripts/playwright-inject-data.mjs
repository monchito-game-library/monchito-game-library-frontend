// Script para inyectar sesión mock en localStorage + interceptar Supabase
// y luego navegar la app para detectar issues con volumen de datos.

import { chromium } from 'playwright';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';
const SESSION_KEY = 'monchito-auth'; // valor típico de Supabase v2

const TITLES = [
  'The Legend of Zelda', 'Final Fantasy VII', 'God of War', 'Metal Gear Solid',
  'Resident Evil 4', 'Chrono Trigger', 'Bloodborne', 'Dark Souls',
  'Elden Ring', 'Hollow Knight', 'Hades', 'Disco Elysium',
  'Red Dead Redemption', 'The Witcher 3', 'Cyberpunk 2077', 'Persona 5',
  'Metal Gear Solid 2', 'Silent Hill 2', 'Shadow of the Colossus',
  'Bioshock', 'Mass Effect 2', 'Dragon Age Origins', 'Baldurs Gate 3',
  'Divinity Original Sin 2', 'Skyrim', 'Oblivion', 'Morrowind',
  'Fallout New Vegas', 'Fallout 3', 'Diablo 4', 'Path of Exile',
  'Stardew Valley', 'Hollow Knight Silksong', 'Celeste', 'Hollow Knight',
  'Ori and the Blind Forest', 'Ori Will of the Wisps', 'Inside', 'Limbo',
  'Death Stranding', 'Control', 'Alan Wake 2', 'Silent Hill',
  'Resident Evil 2', 'Resident Evil Village', 'Resident Evil 7',
  'Devil May Cry 5', 'Bayonetta 3', 'Nier Automata', 'Nier Replicant',
  'Sekiro Shadows Die Twice', 'Ghost of Tsushima', 'Deathloop'
];

const PLATFORMS = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch', 'PC', 'PS3'];
const CONDITIONS = ['Nuevo', 'Como nuevo', 'Buen estado', 'Aceptable', 'Segunda mano'];
const STORES_LABELS = ['Amazon', 'GAME', 'CEX', 'Wallapop', 'eBay', 'MediaMarkt', 'Xtralife', 'Play Asia', 'TodoConsolas', 'Impact Games'];
const GENRES = ['Action', 'RPG', 'Adventure', 'Shooter', 'Platformer', 'Indie', 'Strategy', 'Horror'];
const STATUSES = ['Sin empezar', 'Jugando', 'En pausa', 'Completado', 'Abandonado'];

function uuid(i) {
  const hex = i.toString(16).padStart(12, '0').slice(-12);
  return `00000000-0000-4000-8000-${hex.padStart(12, '0')}`;
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function fakeCover(i) {
  const palette = ['#5b3a8c', '#276738', '#a05e0a', '#be1238', '#1d4ed8', '#fbbf24', '#60a5fa'];
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'><rect width='3' height='4' fill='${palette[i % palette.length]}'/><text x='0.1' y='0.5' fill='white' font-size='0.15' font-family='sans-serif'>${i}</text></svg>`;
}

function pickTitle(i) {
  return TITLES[(i + (i * 7 + 3)) % TITLES.length] + (i >= TITLES.length ? ` ${Math.floor(i / TITLES.length) + 1}` : '');
}

function genGames(n = 50) {
  return Array.from({ length: n }, (_, i) => {
    const title = pickTitle(i);
    return {
      id: uuid(i + 1000), user_id: USER_ID,
      game_catalog_id: uuid(i + 1), work_id: uuid(100000 + i),
      title, slug: title.toLowerCase().replace(/\s+/g, '-'),
      price: 10 + Math.floor(Math.random() * 60) + (i % 7),
      condition: CONDITIONS[i % CONDITIONS.length],
      edition: i % 3 === 0 ? 'Deluxe Edition' : i % 3 === 1 ? 'GOTY' : '',
      description: i % 2 === 0 ? `Juego de prueba #${i}` : null,
      personal_rating: i % 2 === 0 ? 7 + (i % 3) : null,
      status: STATUSES[i % STATUSES.length],
      format: i % 2 === 0 ? 'physical' : 'digital',
      store: STORES_LABELS[i % STORES_LABELS.length],
      user_platform: PLATFORMS[i % PLATFORMS.length],
      image_url: fakeCover(i),
      cover_position: JSON.stringify({ x: 50, y: 50, scale: 1 }),
      for_sale: i % 5 === 0,
      sale_price: i % 5 === 0 ? 25 + (i % 10) : null,
      sold_at: null, sold_price_final: null, custom_image_url: null,
      created_at: dateOffset(i * 2), updated_at: dateOffset(i),
      active_loan_id: null, active_loan_to: null, active_loan_at: null,
      user_notes: null, title_x: title,
      platforms: [PLATFORMS[i % PLATFORMS.length]],
      metacritic_score: i % 3 === 0 ? 80 + (i % 10) : null,
      metacritic_url: null, esrb_rating: null,
      genres: [GENRES[i % GENRES.length]],
      released_date: '2024-01-15', tba: false,
      rating: 4 + (i % 3) * 0.3, rating_top: 5,
      ratings_count: i * 10, reviews_count: i,
      image: fakeCover(i)
    };
  });
}

function genConsoles(n = 20) {
  return Array.from({ length: n }, (_, i) => ({
    id: uuid(i + 5000), user_id: USER_ID,
    region: i % 3 === 0 ? 'NTSC' : i % 3 === 1 ? 'PAL' : 'NTSC-J',
    condition: CONDITIONS[i % CONDITIONS.length],
    price: 50 + i * 10,
    store: STORES_LABELS[i % STORES_LABELS.length],
    purchase_date: dateOffset(i * 30), notes: null, created_at: dateOffset(i * 60),
    brand_id: '11111111-1111-1111-1111-111111111111',
    model_id: '22222222-2222-2222-2222-222222222222',
    edition_id: '33333333-3333-3333-3333-333333333333',
    for_sale: false, sale_price: null, sold_at: null, sold_price_final: null,
    active_loan_id: null, active_loan_to: null, active_loan_at: null,
    compatibility: PLATFORMS.slice(0, 3).join(', '),
    color: i % 2 === 0 ? 'Negro' : 'Blanco'
  }));
}

function genControllers(n = 20) {
  return Array.from({ length: n }, (_, i) => ({
    id: uuid(i + 6000), user_id: USER_ID,
    color: i % 3 === 0 ? 'Rojo' : i % 3 === 1 ? 'Negro' : 'Blanco',
    compatibility: PLATFORMS[i % PLATFORMS.length],
    condition: CONDITIONS[i % CONDITIONS.length],
    price: 15 + i * 3,
    store: STORES_LABELS[i % STORES_LABELS.length],
    purchase_date: dateOffset(i * 20), notes: null, created_at: dateOffset(i * 45),
    brand_id: '44444444-4444-4444-4444-444444444444',
    model_id: '55555555-5555-5555-5555-555555555555',
    edition_id: '66666666-6666-6666-6666-666666666666',
    for_sale: false, sale_price: null, sold_at: null, sold_price_final: null,
    active_loan_id: null, active_loan_to: null, active_loan_at: null
  }));
}

function genWishlist(n = 50) {
  return Array.from({ length: n }, (_, i) => {
    const title = pickTitle(i + 100);
    return {
      id: uuid(i + 7000), user_id: USER_ID,
      game_catalog_id: uuid(i + 8000),
      title, slug: title.toLowerCase().replace(/\s+/g, '-'),
      image_url: fakeCover(i + 100),
      released_date: '2024-01-15',
      rating: 4 + (i % 2) * 0.5, rating_top: 5,
      genres: [GENRES[i % GENRES.length], 'Adventure'],
      stores: [], tags: [],
      metacritic_score: i % 3 === 0 ? 80 + (i % 10) : null,
      description: null, description_raw: null, source: 'rawg',
      added_by_user_id: USER_ID, times_added_by_users: 0,
      desired_price: 20 + (i % 50),
      priority: (i % 5) + 1,
      notes: i % 5 === 0 ? 'Notas de prueba' : null,
      notify_on_sale: true, platform: PLATFORMS[i % PLATFORMS.length],
      created_at: dateOffset(i), updated_at: dateOffset(i)
    };
  });
}

function genOrdersWithLines() {
  const orders = [];
  const lines = [];
  for (let o = 0; o < 5; o++) {
    const orderId = uuid(o + 9000);
    orders.push({
      id: orderId, owner_id: USER_ID,
      title: `Pedido prueba ${o + 1}`,
      status: ['draft', 'selecting_packs', 'ordering', 'ordered', 'received'][o % 5],
      order_date: dateOffset(o * 30), received_date: null,
      shipping_cost: 5, paypal_fee: 1,
      discount_amount: 0, discount_type: 'percent',
      notes: null,
      created_at: dateOffset(o * 30), updated_at: dateOffset(o)
    });
    const numLines = 5 + o * 3;
    for (let l = 0; l < numLines; l++) {
      lines.push({
        id: uuid(10000 + o * 100 + l), order_id: orderId,
        game_catalog_id: uuid(20000 + o * 100 + l),
        product_name: pickTitle(o * 10 + l),
        product_category: GENRES[l % GENRES.length],
        product_url: null,
        quantity_needed: 1 + (l % 3),
        quantity_ordered: o < 2 ? null : 1 + (l % 3),
        quantity_received: o < 2 ? null : 1 + (l % 3),
        unit_price: 10 + l * 5,
        personal_price: o < 2 ? 15 + l * 2 : null,
        personal_qty: o < 2 ? 1 : null,
        notes: null
      });
    }
  }
  return { orders, lines };
}

const games = genGames(60);
const consoles = genConsoles(30);
const controllers = genControllers(30);
const wishlist = genWishlist(50);
const { orders, lines } = genOrdersWithLines();
const storesResp = STORES_LABELS.map((s, i) => ({
  id: uuid(50000 + i), label: s, format_hint: 'physical', created_by: null
}));
const prefsResp = [{
  avatar_url: null, banner_url: null,
  language: 'es', theme: 'dark', role: 'user', user_id: USER_ID
}];

function parsePostgrest(url) {
  const u = new URL(url);
  const table = u.pathname.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0] || '';
  return { table };
}

function ok(data) { return { status: 200, contentType: 'application/json', body: JSON.stringify(data) }; }

const ROUTES = [
  { test: (t) => t === 'user_games_full', body: () => games },
  { test: (t) => t === 'user_consoles' || t === 'user_consoles_full', body: () => consoles },
  { test: (t) => t === 'user_controllers' || t === 'user_controllers_full', body: () => controllers },
  { test: (t) => t === 'user_wishlist_full' || t === 'user_wishlist', body: () => wishlist },
  { test: (t) => t === 'orders', body: () => orders },
  { test: (t) => t === 'order_lines', body: () => lines },
  { test: (t) => t === 'stores', body: () => storesResp },
  { test: (t) => t === 'user_preferences', body: () => prefsResp },
  { test: (t) => t === 'game_catalog', body: () => [] }
];

// Mock session de Supabase
const FAKE_SESSION = {
  access_token: 'fake-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'fake-refresh',
  user: {
    id: USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: 'prueba@prueba.es',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
};

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

const consoleErrors = [];
page.on('console', msg => {
  if (msg.type() === 'error') consoleErrors.push(msg.text());
});

// Interceptar TODAS las requests a Supabase
await page.route(`${SUPABASE_ORIGIN}/**`, async (route) => {
  const req = route.request();
  const url = req.url();
  if (req.method() === 'GET' && url.includes('/rest/v1/')) {
    const { table } = parsePostgrest(url);
    for (const h of ROUTES) {
      if (h.test(table)) return route.fulfill(ok(h.body()));
    }
    return route.fulfill(ok([]));
  }
  // Auth endpoint
  if (url.includes('/auth/v1/user') || url.includes('/auth/v1/admin/user')) {
    return route.fulfill(ok(FAKE_SESSION.user));
  }
  return route.fulfill({ status: 200, body: JSON.stringify({}) });
});

// Inyectar sesión en localStorage
await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
await page.evaluate(([userId, fakeSessionJson]) => {
  const session = JSON.parse(fakeSessionJson);
  localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify(session));
}, [USER_ID, JSON.stringify(FAKE_SESSION)]);

// Recargar la app (ahora con sesión)
await page.goto('http://localhost:4200/collection', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

console.log('URL final:', page.url());

if (page.url().includes('login')) {
  console.log('⚠️  Se sigue pidiendo login. Probablemente el flujo de auth no es compatible con la sesión mock.');
} else {
  console.log('✓ Autenticación OK');
}

// Probar cada página
const TARGETS = [
  { url: '/collection', name: 'desktop-collection', viewport: { width: 1920, height: 1080 } },
  { url: '/collection/games', name: 'desktop-games', viewport: { width: 1920, height: 1080 } },
  { url: '/collection/consoles', name: 'desktop-consoles', viewport: { width: 1920, height: 1080 } },
  { url: '/collection/controllers', name: 'desktop-controllers', viewport: { width: 1920, height: 1080 } },
  { url: '/wishlist', name: 'desktop-wishlist', viewport: { width: 1920, height: 1080 } },
  { url: '/sale', name: 'desktop-sale', viewport: { width: 1920, height: 1080 } },
  { url: '/orders', name: 'desktop-orders', viewport: { width: 1920, height: 1080 } },
  { url: '/collection/games', name: 'mobile-games', viewport: { width: 375, height: 667 } },
  { url: '/collection/games', name: 'tablet-games', viewport: { width: 768, height: 1024 } }
];

for (const t of TARGETS) {
  await page.setViewportSize(t.viewport);
  await page.goto('http://localhost:4200' + t.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const info = await page.evaluate(() => {
    const scrollables = [];
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollHeight > el.clientHeight + 10 && el.clientHeight > 0) {
        const cs = getComputedStyle(el);
        scrollables.push({
          tag: el.tagName,
          cls: (el.className?.toString() || '').substring(0, 40),
          sh: el.scrollHeight,
          ch: el.clientHeight,
          canScroll: el.scrollHeight > el.clientHeight,
          overflow: cs.overflowY
        });
      }
    });
    return {
      cards: document.querySelectorAll('[class*="card"]').length,
      buttons: document.querySelectorAll('button').length,
      body: document.body.scrollHeight,
      clientH: document.body.clientHeight,
      scrollables: scrollables.slice(0, 5)
    };
  });
  console.log(`${t.name}:`, JSON.stringify(info));
  await page.screenshot({ path: `.playwright-mcp/shots/bulk/${t.name}.png`, fullPage: true });
}

console.log('Done');
await browser.close();
