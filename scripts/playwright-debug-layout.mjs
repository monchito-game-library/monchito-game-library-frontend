// Inspección específica: layout del sidebar en desktop con muchos juegos
import { chromium } from 'playwright';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';

function uuid(i) {
  const hex = i.toString(16).padStart(12, '0').slice(-12);
  return `00000000-0000-4000-8000-${hex.padStart(12, '0')}`;
}

function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

const TITLES = ['The Legend of Zelda', 'Final Fantasy VII', 'God of War', 'Metal Gear Solid', 'Resident Evil 4', 'Chrono Trigger', 'Bloodborne', 'Dark Souls', 'Elden Ring', 'Hollow Knight', 'Hades', 'Disco Elysium', 'Red Dead Redemption', 'The Witcher 3', 'Cyberpunk 2077', 'Persona 5', 'Metal Gear Solid 2', 'Silent Hill 2', 'Shadow of the Colossus', 'Bioshock', 'Mass Effect 2', 'Dragon Age Origins', 'Baldurs Gate 3', 'Divinity Original Sin 2', 'Skyrim', 'Oblivion', 'Morrowind', 'Fallout New Vegas', 'Fallout 3', 'Diablo 4', 'Path of Exile', 'Stardew Valley', 'Hollow Knight Silksong', 'Celeste', 'Hollow Knight', 'Ori and the Blind Forest', 'Ori Will of the Wisps', 'Inside', 'Limbo', 'Death Stranding', 'Control', 'Alan Wake 2', 'Silent Hill', 'Resident Evil 2', 'Resident Evil Village', 'Resident Evil 7', 'Devil May Cry 5', 'Bayonetta 3', 'Nier Automata', 'Nier Replicant'];

const PLATFORMS = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Xbox One', 'Nintendo Switch', 'PC', 'PS3'];
const CONDITIONS = ['Nuevo', 'Como nuevo', 'Buen estado', 'Aceptable', 'Segunda mano'];
const STORES_LABELS = ['Amazon', 'GAME', 'CEX', 'Wallapop', 'eBay', 'MediaMarkt'];
const GENRES = ['Action', 'RPG', 'Adventure', 'Shooter'];
const STATUSES = ['Sin empezar', 'Jugando', 'En pausa', 'Completado', 'Abandonado'];

function pickTitle(i) {
  return TITLES[(i + (i * 7 + 3)) % TITLES.length] + (i >= TITLES.length ? ` ${Math.floor(i / TITLES.length) + 1}` : '');
}

function fakeCover(i) {
  const palette = ['#5b3a8c', '#276738', '#a05e0a', '#be1238'];
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'><rect width='3' height='4' fill='${palette[i % palette.length]}'/></svg>`;
}

function genGames(n) {
  return Array.from({ length: n }, (_, i) => ({
    id: uuid(i + 1000), user_id: USER_ID,
    game_catalog_id: uuid(i + 1), work_id: uuid(100000 + i),
    title: pickTitle(i), slug: pickTitle(i).toLowerCase().replace(/\s+/g, '-'),
    price: 10 + i, condition: CONDITIONS[i % CONDITIONS.length],
    edition: '', description: null, personal_rating: null,
    status: STATUSES[i % STATUSES.length], format: 'physical',
    store: STORES_LABELS[i % STORES_LABELS.length],
    user_platform: PLATFORMS[i % PLATFORMS.length],
    image_url: fakeCover(i),
    cover_position: '{"x":50,"y":50,"scale":1}',
    for_sale: false, sale_price: null, sold_at: null, sold_price_final: null,
    custom_image_url: null, created_at: dateOffset(i), updated_at: dateOffset(i),
    active_loan_id: null, active_loan_to: null, active_loan_at: null,
    user_notes: null, platforms: ['PS4'], metacritic_score: null,
    metacritic_url: null, esrb_rating: null,
    genres: [GENRES[i % GENRES.length]], released_date: '2024-01-15',
    tba: false, rating: 4, rating_top: 5, ratings_count: 0, reviews_count: 0
  }));
}

const games = genGames(60);

const FAKE_SESSION = {
  access_token: 'fake-token', token_type: 'bearer', expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'fake', user: { id: USER_ID, aud: 'authenticated', role: 'authenticated', email: 'prueba@prueba.es' }
};

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

await page.route(`${SUPABASE_ORIGIN}/rest/v1/**`, async (route) => {
  const req = route.request();
  const url = req.url();
  if (!req.method().includes('GET')) return route.fulfill({ status: 200, body: '[]' });
  const table = url.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0] || '';
  if (table === 'user_games_full') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(games) });
  if (table === 'user_preferences') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ user_id: USER_ID, language: 'es', theme: 'dark', role: 'user', avatar_url: null, banner_url: null }]) });
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
});
await page.route(`${SUPABASE_ORIGIN}/auth/v1/**`, async (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) }));

await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
await page.evaluate((session) => {
  localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify(session));
}, FAKE_SESSION);
await page.goto('http://localhost:4200/collection/games', { waitUntil: 'networkidle' });
await page.waitForTimeout(3000);

const layout = await page.evaluate(() => {
  const rail = document.querySelector('.nav-rail');
  const railLabels = document.querySelectorAll('.nav-rail__label');
  const railComputed = rail ? getComputedStyle(rail) : null;
  const railRect = rail?.getBoundingClientRect();
  const grid = document.querySelector('.game-list__grid');
  const gridRect = grid?.getBoundingClientRect();
  const labels = Array.from(railLabels).map(l => {
    const cs = getComputedStyle(l);
    return { text: l.textContent.trim(), display: cs.display, width: l.getBoundingClientRect().width, visible: l.getBoundingClientRect().width > 0 };
  });
  return {
    railWidth: railRect?.width,
    railLeft: railRect?.left,
    gridLeft: gridRect?.left,
    labels,
    bodyOverflow: getComputedStyle(document.body).overflow
  };
});

console.log('Layout:', JSON.stringify(layout, null, 2));
await page.screenshot({ path: '.playwright-mcp/shots/bulk/desktop-games-debug.png', fullPage: false });
await browser.close();
