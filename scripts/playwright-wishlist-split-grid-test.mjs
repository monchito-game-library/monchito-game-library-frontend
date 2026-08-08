// Test secundario: ¿qué pasa si se aplica retro-list--grid con el minmax(220px) por defecto?
// El usuario reportó "3 columnas y la de la izquierda cortada" — esto sugiere que
// ALGUIÉN activó el grid o el usuario lo想象中. Probemos qué pasa.
import { chromium } from 'playwright';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';
const uuid = (i) => `00000000-0000-4000-8000-${i.toString(16).padStart(12, '0')}`;
const dateOffset = (d) => new Date(Date.now() - d * 86400000).toISOString();
const TITLES = [
  'The Legend of Zelda',
  'Final Fantasy VII',
  'God of War',
  'Metal Gear Solid',
  'Resident Evil 4',
  'Chrono Trigger',
  'Bloodborne',
  'Dark Souls',
  'Elden Ring',
  'Hollow Knight',
  'Hades',
  'Disco Elysium',
  'Red Dead Redemption',
  'The Witcher 3',
  'Cyberpunk 2077',
  'Persona 5',
  'Metal Gear Solid 2',
  'Silent Hill 2',
  'Shadow of the Colossus',
  'Bioshock',
  'Mass Effect 2',
  'Dragon Age Origins',
  'Baldurs Gate 3',
  'Divinity Original Sin 2',
  'Skyrim',
  'Oblivion',
  'Morrowind',
  'Fallout New Vegas',
  'Fallout 3',
  'Diablo 4',
  'Path of Exile',
  'Stardew Valley',
  'Hollow Knight Silksong',
  'Celeste',
  'Ori and the Blind Forest',
  'Ori Will of the Wisps',
  'Inside',
  'Limbo',
  'Death Stranding',
  'Control',
  'Alan Wake 2',
  'Silent Hill',
  'Resident Evil 2',
  'Resident Evil Village',
  'Resident Evil 7',
  'Devil May Cry 5',
  'Bayonetta 3',
  'Nier Automata',
  'Nier Replicant',
  'Sekiro'
];
const PALETTE = ['#5b3a8c', '#276738', '#a05e0a', '#be1238', '#1e6091', '#7c2d12'];
const fakeCover = (i) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'><rect width='3' height='4' fill='${PALETTE[i % PALETTE.length]}'/></svg>`;

const wishlist = Array.from({ length: 50 }, (_, i) => ({
  id: uuid(i + 7000),
  user_id: USER_ID,
  game_catalog_id: uuid(i + 8000),
  title: TITLES[i % TITLES.length] + (i >= TITLES.length ? ` ${Math.floor(i / TITLES.length) + 1}` : ''),
  image_url: fakeCover(i + 100),
  released_date: '2024-01-15',
  rating: 4,
  rating_top: 5,
  genres: ['Action', 'RPG', 'Adventure'].slice(0, 3 + (i % 3)),
  stores: [],
  tags: [],
  metacritic_score: null,
  description: null,
  source: 'rawg',
  added_by_user_id: USER_ID,
  times_added_by_users: 0,
  desired_price: 20 + (i % 50),
  priority: (i % 5) + 1,
  notes: i % 3 === 0 ? 'Esperando oferta.' : null,
  notify_on_sale: true,
  platform: 'PS5',
  created_at: dateOffset(i),
  updated_at: dateOffset(i)
}));

const FAKE_SESSION = {
  access_token: 'fake-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'fake',
  user: { id: USER_ID, aud: 'authenticated', role: 'authenticated', email: 'prueba@prueba.es' }
};

const VIEWPORTS = [
  { name: '1920x1080-full', w: 1920, h: 1080 },
  { name: '960x1080-half', w: 960, h: 1080 },
  { name: '1280x1080-2thirds', w: 1280, h: 1080 },
  { name: '800x1080-small', w: 800, h: 1080 }
];

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.name} con GRID aplicado (minmax 220px) ===`);
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.route(`${SUPABASE_ORIGIN}/rest/v1/**`, async (route) => {
    const url = route.request().url();
    const t = url.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0];
    if (t === 'user_wishlist_full' || t === 'user_wishlist')
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wishlist) });
    if (t === 'user_preferences')
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { user_id: USER_ID, language: 'es', theme: 'dark', role: 'user', avatar_url: null, banner_url: null }
        ])
      });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route(`${SUPABASE_ORIGIN}/auth/v1/**`, (route) => route.fulfill({ status: 200, body: '{}' }));

  await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
  await page.evaluate(
    (s) => localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify(s)),
    FAKE_SESSION
  );
  await page.goto('http://localhost:4200/wishlist', { waitUntil: 'networkidle' });
  await page.waitForFunction((n) => document.querySelectorAll('app-wishlist-card').length >= n, 50, { timeout: 20000 });
  await page.waitForTimeout(500);

  // FORZAR grid: añade la clase retro-list--grid al <retro-list>
  await page.evaluate(() => {
    const el = document.querySelector('retro-list.wishlist-page__list');
    if (el) el.classList.add('retro-list--grid');
  });
  await page.waitForTimeout(400);

  await page.screenshot({
    path: `.playwright-mcp/shots/wishlist-split-diagnostic/GRID-${vp.name}-fullpage.png`,
    fullPage: true
  });

  const data = await page.evaluate(() => {
    const el = document.querySelector('retro-list.wishlist-page__list');
    if (!el) return null;
    const cs = getComputedStyle(el);
    const cards = Array.from(document.querySelectorAll('app-wishlist-card'));
    const tops = cards.slice(0, 20).map((c) => c.getBoundingClientRect().top);
    const firstTop = tops[0];
    const sameRow = tops.filter((t) => Math.abs(t - firstTop) <= 2);
    // Detectar overflow horizontal en card
    const first = cards[0];
    let cardOverflow = null;
    if (first) {
      const body = first.querySelector('.wishlist-card__content');
      const trailing = first.querySelector('.wishlist-card__trailing');
      const rect = first.getBoundingClientRect();
      cardOverflow = {
        cardW: rect.width,
        bodyContentW: body?.getBoundingClientRect().width,
        bodyContentScroll: body?.scrollWidth,
        trailingW: trailing?.getBoundingClientRect().width,
        rightActions: trailing ? trailing.getBoundingClientRect().right - rect.right : null
      };
    }
    return {
      display: cs.display,
      gridTemplateColumns: cs.gridTemplateColumns,
      columnCount: sameRow.length,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      cardOverflow
    };
  });
  console.log(JSON.stringify(data, null, 2));

  await ctx.close();
}
await browser.close();
