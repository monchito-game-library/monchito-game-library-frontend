// Detecta issues de layout/scroll con volumen de datos mock.
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';

function uuid(i) {
  const hex = i.toString(16).padStart(12, '0').slice(-12);
  return `00000000-0000-4000-8000-${hex.padStart(12, '0')}`;
}
const dateOffset = (d) => new Date(Date.now() - d * 86400000).toISOString();
const fakeCover = (i) => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'><rect width='3' height='4' fill='#5b3a8c'/></svg>`;

const TITLES = ['TLZ','FF7','GoW','MGS','RE4','CT','Bloodborne','DS','Elden','HK','Hades','Disco','RDR','TW3','CP77','P5','MGS2','SH2','SoTC','Bioshock','ME2','DAO','BG3','DOS2','Skyrim','Oblivion','Morrowind','FNV','FO3','D4','PoE','Stardew','HKS','Celeste','Ori','Inside','Limbo','DeathStranding','Control','AW2','SH','RE2','REV','RE7','DMC5','Bayonetta3','NierA','NierR'];
const pickTitle = (i) => TITLES[(i * 7 + 3) % TITLES.length] + (i >= TITLES.length ? ' ' + (Math.floor(i / TITLES.length) + 1) : '');

const genGames = (n) => Array.from({ length: n }, (_, i) => {
  // Mix: ~25% for_sale, ~25% sold, ~50% normal
  const slot = i % 4;
  const forSale = slot === 0;
  const sold = slot === 1;
  return {
    id: uuid(i + 1000), user_id: USER_ID, game_catalog_id: uuid(i + 1), work_id: uuid(100000 + i),
    title: pickTitle(i), price: 10 + i, condition: 'Nuevo', status: 'Sin empezar', format: 'physical',
    store: 'GAME', user_platform: 'PS5', image_url: fakeCover(i), cover_position: '{"x":50,"y":50,"scale":1}',
    for_sale: forSale,
    sale_price: forSale ? (15 + i) : null,
    sold_at: sold ? dateOffset(i) : null,
    sold_price_final: sold ? (20 + i) : null,
    created_at: dateOffset(i), updated_at: dateOffset(i),
    active_loan_id: null, active_loan_to: null, active_loan_at: null, user_notes: null,
    personal_rating: null, description: null, edition: '', platforms: ['PS5'],
    metacritic_score: null, metacritic_url: null, esrb_rating: null, genres: ['Action'],
    released_date: '2024-01-15', tba: false, rating: 4, rating_top: 5
  };
});

const genHardware = (n, prefix) => Array.from({ length: n }, (_, i) => {
  const slot = i % 4;
  const forSale = slot === 0;
  const sold = slot === 1;
  return {
    id: uuid(i + prefix), user_id: USER_ID, region: 'PAL', condition: 'Nuevo', price: 50 + i,
    store: 'GAME', purchase_date: dateOffset(i * 30), notes: null, created_at: dateOffset(i * 30),
    brand_id: '11111111-1111-1111-1111-111111111111', model_id: '22222222-2222-2222-2222-222222222222',
    edition_id: '33333333-3333-3333-3333-333333333333',
    for_sale: forSale,
    sale_price: forSale ? (60 + i) : null,
    sold_at: sold ? dateOffset(i * 30) : null,
    sold_price_final: sold ? (55 + i) : null,
    active_loan_id: null, active_loan_to: null, active_loan_at: null,
    compatibility: 'PS5,PS4', color: 'Negro'
  };
});

const genWishlist = (n) => Array.from({ length: n }, (_, i) => ({
  id: uuid(i + 7000), user_id: USER_ID, game_catalog_id: uuid(i + 8000),
  title: pickTitle(i + 100), image_url: null, released_date: '2024-01-15',
  rating: 4, rating_top: 5, genres: ['Action', 'RPG'], stores: [], tags: [],
  metacritic_score: null, description: null, source: 'rawg', added_by_user_id: USER_ID,
  times_added_by_users: 0, desired_price: 20 + i, priority: (i % 5) + 1, notes: null,
  notify_on_sale: true, platform: 'PS5', created_at: dateOffset(i), updated_at: dateOffset(i)
}));

const N = 40;
const games = genGames(N);
const consoles = genHardware(N, 5000);
const controllers = genHardware(N, 6000);
const wishlist = genWishlist(N);

const toMarketRow = (item, itemType, date) => ({
  item_type: itemType,
  id: item.id,
  user_id: item.user_id,
  item_name: item.title,
  brand_name: itemType === 'console' ? 'Sony' : itemType === 'controller' ? 'Sony' : null,
  model_name: itemType === 'console' ? 'PS5' : itemType === 'controller' ? 'DualSense' : null,
  detail_left: itemType === 'game' ? item.user_platform : item.region,
  detail_right: itemType === 'game' ? item.condition : item.condition,
  sale_price: item.sale_price,
  sold_at: item.sold_at,
  sold_price_final: item.sold_price_final,
  created_at: date
});

const availableItems = [
  ...games.filter(g => g.for_sale).map(g => toMarketRow(g, 'game', g.created_at)),
  ...consoles.filter(c => c.for_sale).map(c => toMarketRow(c, 'console', c.created_at)),
  ...controllers.filter(c => c.for_sale).map(c => toMarketRow(c, 'controller', c.created_at))
];

const soldItems = [
  ...games.filter(g => g.sold_at).map(g => toMarketRow(g, 'game', g.created_at)),
  ...consoles.filter(c => c.sold_at).map(c => toMarketRow(c, 'console', c.created_at)),
  ...controllers.filter(c => c.sold_at).map(c => toMarketRow(c, 'controller', c.created_at))
];

const ROUTES = {
  'user_games_full': games,
  'user_consoles': consoles,
  'user_controllers': controllers,
  'user_wishlist_full': wishlist,
  'user_wishlist': wishlist,
  'user_preferences': [{ user_id: USER_ID, language: 'es', theme: 'dark', role: 'user', avatar_url: null, banner_url: null }],
  'available_items': availableItems,
  'sold_items': soldItems,
  'stores': [],
  'orders': [],
  'order_lines': [],
  'game_catalog': []
};

const issues = [];

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });

const TEST_PAGES = [
  { url: '/collection/games', name: 'games-list', vp: { width: 1920, height: 1080 } },
  { url: '/collection/games', name: 'games-list-tablet', vp: { width: 768, height: 1024 } },
  { url: '/collection/games', name: 'games-list-mobile', vp: { width: 375, height: 667 } },
  { url: '/collection/consoles', name: 'consoles-list-desktop', vp: { width: 1920, height: 1080 } },
  { url: '/collection/controllers', name: 'controllers-list-desktop', vp: { width: 1920, height: 1080 } },
  { url: '/wishlist', name: 'wishlist-desktop', vp: { width: 1920, height: 1080 } },
  { url: '/wishlist', name: 'wishlist-mobile', vp: { width: 375, height: 667 } },
  { url: '/sale', name: 'sale-available-desktop', vp: { width: 1920, height: 1080 } },
  { url: '/sale', name: 'sale-available-mobile', vp: { width: 375, height: 667 } },
  { url: '/orders', name: 'orders-mobile', vp: { width: 375, height: 667 } }
];

for (const t of TEST_PAGES) {
  const ctx = await browser.newContext({ viewport: t.vp });
  const page = await ctx.newPage();

  await page.route(SUPABASE_ORIGIN + '/rest/v1/**', async (route) => {
    const url = route.request().url();
    const table = url.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0];
    const data = ROUTES[table] !== undefined ? ROUTES[table] : [];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });
  await page.route(SUPABASE_ORIGIN + '/auth/v1/**', async (route) => route.fulfill({ status: 200, body: '{}' }));

  await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify({
      access_token: 'fake', token_type: 'bearer', expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'fake',
      user: { id: '17ac7e60-4d2e-4189-8e7c-05436e629ff4', aud: 'authenticated', role: 'authenticated', email: 'prueba@prueba.es' }
    }));
  });
  await page.goto('http://localhost:4200' + t.url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(4000);

  const info = await page.evaluate(() => {
    const result = { url: location.pathname };
    const body = document.body;
    result.bodyH = body.scrollHeight;
    result.bodyClientH = body.clientHeight;

    // 1. Detectar si el body se desborda
    result.bodyOverflows = body.scrollHeight > body.clientHeight + 10;

    // 2. Detectar grids/listas largas
    const lists = document.querySelectorAll('.game-list__grid, .hw-list__content, .wishlist-page, .orders-list, .orders-list__cards, [class*="list__grid"]');
    result.lists = Array.from(lists).map(el => {
      const childCount = el.children.length;
      const sh = el.scrollHeight;
      const ch = el.clientHeight;
      const overflows = sh > ch + 10;
      return {
        cls: el.className.substring(0, 50),
        children: childCount,
        sh, ch, overflows
      };
    });

    // 3. Detectar si hay virtual scroll (ningún componente que conozco lo implementa)
    const totalCards = document.querySelectorAll('[class*="card"]').length;
    const visibleCards = Array.from(document.querySelectorAll('[class*="card"]')).filter(el => {
      const r = el.getBoundingClientRect();
      return r.bottom > 0 && r.top < window.innerHeight;
    }).length;
    result.totalCards = totalCards;
    result.visibleCards = visibleCards;

    // 4. Detectar overflow horizontal (signo de bug)
    result.horizontalOverflow = body.scrollWidth > window.innerWidth;

    return result;
  });

  await page.screenshot({ path: `.playwright-mcp/shots/bulk/volume-${t.name}.png`, fullPage: false });

  // 5. Intentar hacer scroll al fondo de las listas
  const scrollResult = await page.evaluate(() => {
    const lists = document.querySelectorAll('.game-list__grid, .hw-list__content, .wishlist-page');
    const results = [];
    for (const el of lists) {
      const before = el.scrollTop;
      el.scrollTop = el.scrollHeight;
      const after = el.scrollTop;
      const canScroll = el.scrollHeight > el.clientHeight;
      results.push({ cls: el.className.substring(0, 30), canScroll, scrollTop: after, scrollHeight: el.scrollHeight, clientHeight: el.clientHeight });
    }
    return results;
  });

  info.scrollResults = scrollResult;

  if (info.bodyOverflows) {
    issues.push({ page: t.name, type: 'body-overflows', detail: `bodyH=${info.bodyH} bodyClient=${info.bodyClientH}` });
  }
  if (info.horizontalOverflow) {
    issues.push({ page: t.name, type: 'horizontal-overflow', detail: `body.scrollWidth > window.innerWidth` });
  }
  for (const l of info.lists) {
    if (l.overflows && l.children > 10) {
      issues.push({ page: t.name, type: 'long-list-with-scroll', detail: `${l.cls} children=${l.children} sh=${l.sh} ch=${l.ch}` });
    }
  }
  if (info.totalCards > 30 && info.visibleCards === info.totalCards) {
    issues.push({ page: t.name, type: 'no-virtual-scroll', detail: `${info.totalCards} cards todas renderizadas` });
  }
  for (const s of scrollResult) {
    if (s.canScroll && s.scrollTop === 0) {
      issues.push({ page: t.name, type: 'scroll-not-working', detail: `${s.cls} sh=${s.scrollHeight} ch=${s.clientHeight}` });
    }
  }

  console.log(`${t.name}:`, JSON.stringify(info));
  await ctx.close();
}

await browser.close();

writeFileSync('.playwright-mcp/shots/bulk/issues.json', JSON.stringify(issues, null, 2));
console.log('\n=== ISSUES DETECTADOS ===');
for (const i of issues) {
  console.log(`[${i.type}] ${i.page}: ${i.detail}`);
}
console.log(`\nTotal: ${issues.length} issues`);
