// Diagnóstico: ¿las cards de wishlist se cortan en modo split-screen?
// Recorre varios viewports, mide CSS computado, captura screenshots.
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';
const uuid = (i) => `00000000-0000-4000-8000-${(i).toString(16).padStart(12, '0')}`;
const dateOffset = (d) => new Date(Date.now() - d * 86400000).toISOString();

const TITLES = [
  'The Legend of Zelda', 'Final Fantasy VII', 'God of War', 'Metal Gear Solid',
  'Resident Evil 4', 'Chrono Trigger', 'Bloodborne', 'Dark Souls', 'Elden Ring',
  'Hollow Knight', 'Hades', 'Disco Elysium', 'Red Dead Redemption', 'The Witcher 3',
  'Cyberpunk 2077', 'Persona 5', 'Metal Gear Solid 2', 'Silent Hill 2', 'Shadow of the Colossus',
  'Bioshock', 'Mass Effect 2', 'Dragon Age Origins', 'Baldurs Gate 3', 'Divinity Original Sin 2',
  'Skyrim', 'Oblivion', 'Morrowind', 'Fallout New Vegas', 'Fallout 3',
  'Diablo 4', 'Path of Exile', 'Stardew Valley', 'Hollow Knight Silksong', 'Celeste',
  'Ori and the Blind Forest', 'Ori Will of the Wisps', 'Inside', 'Limbo', 'Death Stranding',
  'Control', 'Alan Wake 2', 'Silent Hill', 'Resident Evil 2', 'Resident Evil Village',
  'Resident Evil 7', 'Devil May Cry 5', 'Bayonetta 3', 'Nier Automata', 'Nier Replicant',
  'Sekiro', 'Ghost of Tsushima'
];
const PALETTE = ['#5b3a8c', '#276738', '#a05e0a', '#be1238', '#1e6091', '#7c2d12'];
const fakeCover = (i) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'><rect width='3' height='4' fill='${PALETTE[i % PALETTE.length]}'/></svg>`;

const WISHLIST_COUNT = 50;
const wishlist = Array.from({ length: WISHLIST_COUNT }, (_, i) => ({
  id: uuid(i + 7000),
  user_id: USER_ID,
  game_catalog_id: uuid(i + 8000),
  title: TITLES[i % TITLES.length] + (i >= TITLES.length ? ` ${Math.floor(i / TITLES.length) + 1}` : ''),
  image_url: fakeCover(i + 100),
  released_date: '2024-01-15',
  rating: 4,
  rating_top: 5,
  genres: ['Action', 'RPG', 'Adventure', 'Strategy', 'Horror'].slice(0, 3 + (i % 3)),
  stores: [],
  tags: [],
  metacritic_score: null,
  description: null,
  source: 'rawg',
  added_by_user_id: USER_ID,
  times_added_by_users: 0,
  desired_price: 20 + (i % 50),
  priority: (i % 5) + 1,
  notes: i % 3 === 0 ? 'Esperando oferta en Black Friday. Tracking en CamelCamelCamel.' : null,
  notify_on_sale: true,
  platform: ['PS5', 'PS4', 'Switch', 'PC', 'Xbox Series X'][i % 5],
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
  { name: '1920x1080-full',   w: 1920, h: 1080, label: 'full 1080p' },
  { name: '960x1080-half',    w: 960,  h: 1080, label: 'split 50/50' },
  { name: '1280x1080-twothirds', w: 1280, h: 1080, label: 'split 2/3' },
  { name: '800x1080-small',   w: 800,  h: 1080, label: 'narrow window' },
  { name: '2560x1440-2k',     w: 2560, h: 1440, label: '2K' },
  { name: '3840x2160-4k',     w: 3840, h: 2160, label: '4K' }
];

const OUT_DIR = '.playwright-mcp/shots/wishlist-split-diagnostic';
mkdirSync(OUT_DIR, { recursive: true });

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});

const allResults = [];

for (const vp of VIEWPORTS) {
  console.log(`\n=== ${vp.name} (${vp.w}x${vp.h}) — ${vp.label} ===`);
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('  [page-err]', msg.text());
  });

  await page.route(`${SUPABASE_ORIGIN}/rest/v1/**`, async (route) => {
    const url = route.request().url();
    const t = url.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0];
    if (t === 'user_wishlist_full' || t === 'user_wishlist') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(wishlist) });
    }
    if (t === 'user_preferences') {
      return route.fulfill({
        status: 200, contentType: 'application/json',
        body: JSON.stringify([{ user_id: USER_ID, language: 'es', theme: 'dark', role: 'user', avatar_url: null, banner_url: null }])
      });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
  await page.route(`${SUPABASE_ORIGIN}/auth/v1/**`, (route) => route.fulfill({ status: 200, body: '{}' }));
  await page.route(`${SUPABASE_ORIGIN}/storage/v1/**`, (route) => route.fulfill({ status: 200, body: '{}' }));

  await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
  await page.evaluate((session) => {
    localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify(session));
  }, FAKE_SESSION);
  await page.goto('http://localhost:4200/wishlist', { waitUntil: 'networkidle' });

  // Esperar a que aparezcan las 50 cards (o 20s max)
  try {
    await page.waitForFunction(
      (n) => document.querySelectorAll('app-wishlist-card').length >= n,
      WISHLIST_COUNT,
      { timeout: 20000 }
    );
  } catch {
    const present = await page.evaluate(() => document.querySelectorAll('app-wishlist-card').length);
    console.log(`  ⚠ solo ${present}/${WISHLIST_COUNT} cards después de 20s`);
  }
  // Pequeño respiro para que se asienten layout/imgs
  await page.waitForTimeout(800);

  // Screenshot full-page
  await page.screenshot({ path: `${OUT_DIR}/${vp.name}-fullpage.png`, fullPage: true });

  // Screenshot del área de cards
  const listBox = await page.evaluate(() => {
    const el = document.querySelector('.wishlist-page__list');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.x, y: r.y + window.scrollY, width: r.width, height: r.height };
  });
  if (listBox && listBox.width > 0 && listBox.height > 0) {
    await page.screenshot({
      path: `${OUT_DIR}/${vp.name}-cards.png`,
      clip: { x: 0, y: listBox.y, width: vp.w, height: Math.min(listBox.height + 40, 800) }
    });
  }

  // Medir todo
  const data = await page.evaluate(() => {
    const out = {};

    const viewport = { w: window.innerWidth, h: window.innerHeight };
    out.viewport = viewport;

    // Nav rail (sidebar)
    const navRail = document.querySelector('.nav-rail') || document.querySelector('aside.nav-rail') || document.querySelector('nav');
    if (navRail) {
      const r = navRail.getBoundingClientRect();
      out.navRail = { width: r.width, left: r.left, display: getComputedStyle(navRail).display };
    }

    // wishlist-page (contenedor principal scrolleable)
    const page = document.querySelector('.wishlist-page');
    if (page) {
      const r = page.getBoundingClientRect();
      const cs = getComputedStyle(page);
      out.wishlistPage = {
        width: r.width,
        scrollWidth: page.scrollWidth,
        clientWidth: page.clientWidth,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        padding: cs.padding,
        display: cs.display
      };
    }

    // host del retro-list
    const retroList = document.querySelector('retro-list.wishlist-page__list');
    if (retroList) {
      const cs = getComputedStyle(retroList);
      const r = retroList.getBoundingClientRect();
      out.retroList = {
        display: cs.display,
        flexDirection: cs.flexDirection,
        flexWrap: cs.flexWrap,
        gridTemplateColumns: cs.gridTemplateColumns,
        gridTemplateRows: cs.gridTemplateRows,
        width: r.width,
        scrollWidth: retroList.scrollWidth,
        clientWidth: retroList.clientWidth,
        overflowX: cs.overflowX,
        overflowY: cs.overflowY,
        gap: cs.gap,
        padding: cs.padding
      };
    }

    // primera card
    const firstCard = document.querySelector('app-wishlist-card');
    if (firstCard) {
      const r = firstCard.getBoundingClientRect();
      const cs = getComputedStyle(firstCard);
      out.firstCard = {
        width: r.width,
        left: r.left,
        top: r.top,
        display: cs.display,
        minWidth: cs.minWidth
      };
    }

    // Agrupar cards por fila para contar columnas
    const cards = Array.from(document.querySelectorAll('app-wishlist-card'));
    if (cards.length > 0) {
      const tops = cards.slice(0, 20).map((c) => c.getBoundingClientRect().top);
      const firstTop = tops[0];
      const epsilon = 2;
      const sameRow = tops.filter((t) => Math.abs(t - firstTop) <= epsilon);
      out.columnCount = sameRow.length;
      out.firstRowTops = sameRow;
      out.totalCards = cards.length;
    }

    // Overflow en body y html
    out.body = {
      scrollWidth: document.body.scrollWidth,
      clientWidth: document.body.clientWidth,
      overflowX: getComputedStyle(document.body).overflowX
    };
    out.html = {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      overflowX: getComputedStyle(document.documentElement).overflowX
    };

    return out;
  });

  console.log(JSON.stringify(data, null, 2));
  allResults.push({ viewport: vp, data });

  await ctx.close();
}

await browser.close();

console.log('\n=== RESUMEN ===');
for (const r of allResults) {
  const v = r.viewport;
  const d = r.data;
  const cols = d.columnCount ?? '?';
  const ovfX = d.retroList ? (d.retroList.scrollWidth - d.retroList.clientWidth) : '?';
  const pageOvfX = d.wishlistPage ? (d.wishlistPage.scrollWidth - d.wishlistPage.clientWidth) : '?';
  const gridCols = d.retroList?.gridTemplateColumns ?? '-';
  console.log(
    `${v.name.padEnd(24)} cols=${cols}  retroList.overflowX=${ovfX}  page.overflowX=${pageOvfX}  grid-cols="${gridCols}"`
  );
}
