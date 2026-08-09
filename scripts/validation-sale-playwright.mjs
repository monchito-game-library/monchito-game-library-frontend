// Script de validación: inyecta sesión mock + mockea available_items y
// sold_items de Supabase para que la página /sale tenga varios elementos
// en ambos tabs. Mide layout y captura screenshots.

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';
const OUT = '.playwright-mcp/validation';

await mkdir(OUT, { recursive: true });

function uuid(i) {
  const hex = i.toString(16).padStart(12, '0').slice(-12);
  return `00000000-0000-4000-8000-${hex.padStart(12, '0')}`;
}

const PLATFORMS = ['PlayStation 5', 'PlayStation 4', 'Xbox Series X', 'Nintendo Switch', 'PC'];
const CONDITIONS = ['Nuevo', 'Como nuevo', 'Buen estado', 'Aceptable'];

function genAvailable(n = 14) {
  const types = ['game', 'console', 'controller'];
  const titles = [
    'The Legend of Zelda: Tears of the Kingdom',
    'Final Fantasy VII Rebirth',
    'God of War Ragnarök',
    'Elden Ring',
    'Hollow Knight',
    'Hades',
    'Resident Evil 4 Remake',
    'Cyberpunk 2077',
    'Persona 5 Royal',
    'Bloodborne',
    'Nintendo Switch OLED',
    'PlayStation 5 Slim',
    'Xbox Series X',
    'Steam Deck OLED'
  ];
  return Array.from({ length: n }, (_, i) => ({
    item_type: types[i % types.length],
    id: uuid(20000 + i),
    user_id: USER_ID,
    item_name: titles[i] ?? `Item ${i + 1}`,
    brand_name: i % 3 === 1 ? 'Sony' : i % 3 === 2 ? 'Microsoft' : 'Nintendo',
    model_name: i % 3 === 1 ? 'Standard' : i % 3 === 2 ? 'Pro' : 'Base',
    detail_left: CONDITIONS[i % CONDITIONS.length],
    detail_right: PLATFORMS[i % PLATFORMS.length],
    sale_price: 20 + (i * 7) % 80,
    created_at: new Date(Date.now() - i * 86400e3).toISOString()
  }));
}

function genSold(n = 10) {
  const types = ['game', 'console', 'controller'];
  const titles = [
    'Metal Gear Solid V',
    'Death Stranding Director\'s Cut',
    'Sekiro Shadows Die Twice',
    'Ghost of Tsushima',
    'Demon\'s Souls',
    'Nintendo Switch Lite',
    'DualSense Edge Controller',
    'Xbox Wireless Controller',
    'Steam Deck 512GB',
    'PlayStation 5 Digital'
  ];
  return Array.from({ length: n }, (_, i) => ({
    item_type: types[i % types.length],
    id: uuid(30000 + i),
    user_id: USER_ID,
    item_name: titles[i] ?? `Sold ${i + 1}`,
    brand_name: i % 3 === 1 ? 'Sony' : i % 3 === 2 ? 'Microsoft' : 'Nintendo',
    model_name: i % 3 === 1 ? 'Standard' : i % 3 === 2 ? 'Pro' : 'Base',
    detail_left: CONDITIONS[i % CONDITIONS.length],
    detail_right: PLATFORMS[i % PLATFORMS.length],
    sold_at: new Date(Date.now() - i * 86400e3 * 2).toISOString(),
    sold_price_final: 15 + (i * 11) % 90,
    created_at: new Date(Date.now() - (i + 60) * 86400e3).toISOString()
  }));
}

const available = genAvailable(14);
const sold = genSold(10);

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

const VIEWPORTS = [
  { name: '375x667', w: 375, h: 667 },
  { name: '768x1024', w: 768, h: 1024 },
  { name: '1440x900', w: 1440, h: 900 },
  { name: '1920x1080', w: 1920, h: 1080 }
];

function ok(data) {
  return { status: 200, contentType: 'application/json', body: JSON.stringify(data) };
}

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
const page = await ctx.newPage();

// Interceptar Supabase
await page.route(`${SUPABASE_ORIGIN}/**`, async (route) => {
  const req = route.request();
  const url = req.url();
  if (req.method() === 'GET' && url.includes('/rest/v1/')) {
    const u = new URL(url);
    const table = u.pathname.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0] || '';
    if (table === 'available_items') return route.fulfill(ok(available));
    if (table === 'sold_items') return route.fulfill(ok(sold));
    // devolver array vacío para otras tablas
    return route.fulfill(ok([]));
  }
  if (url.includes('/auth/v1/user') || url.includes('/auth/v1/admin/user')) {
    return route.fulfill(ok(FAKE_SESSION.user));
  }
  return route.fulfill({ status: 200, body: JSON.stringify({}) });
});

// Inyectar sesión
await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
await page.evaluate(([sessionJson]) => {
  localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify(JSON.parse(sessionJson)));
}, [JSON.stringify(FAKE_SESSION)]);

const measureSale = async (tabName) => {
  // Esperar render del tab
  await page.waitForSelector('.sale-page__content', { timeout: 5000 });
  await page.waitForTimeout(800);
  if (tabName === 'history') {
    // Click en el segundo botón tab (role="tab") que está dentro de retro-tabs
    const tabs = page.locator('retro-tabs button[role="tab"]');
    const tabCount = await tabs.count();
    if (tabCount >= 2) {
      await tabs.nth(1).click();
      await page.waitForTimeout(1200);
    }
  }
  return await page.evaluate(() => {
    // Apuntar solo al panel activo (no oculto)
    const activePanel = document.querySelector('.retro-tabs__panel:not([hidden])');
    const content = activePanel ? activePanel.querySelector('.sale-page__content') : null;
    const cs = content ? getComputedStyle(content) : null;
    const list = activePanel ? activePanel.querySelector('retro-list') : null;
    const listCs = list ? getComputedStyle(list) : null;
    const items = list ? Array.from(list.querySelectorAll('retro-list-item')) : [];
    const itemInfo = items.slice(0, 3).map((it) => {
      const r = it.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    });
    // Distancias verticales entre items consecutivos
    const verticalGaps = [];
    for (let i = 1; i < items.length; i++) {
      const a = items[i - 1].getBoundingClientRect();
      const b = items[i].getBoundingClientRect();
      verticalGaps.push(b.top - a.bottom);
    }
    return {
      content: cs ? {
        retroListGap: cs.getPropertyValue('--retro-list-gap'),
        gap: cs.gap,
        display: cs.display,
        padding: cs.padding,
        rect: content.getBoundingClientRect()
      } : null,
      list: listCs ? {
        gap: listCs.gap,
        display: listCs.display,
        rect: list.getBoundingClientRect(),
        scrollH: list.scrollHeight,
        clientH: list.clientHeight
      } : null,
      itemCount: items.length,
      firstItems: itemInfo,
      verticalGapsBetweenItems: verticalGaps,
      overflow: {
        bodyScrollW: document.body.scrollWidth,
        viewportW: window.innerWidth,
        docScrollW: document.documentElement.scrollWidth,
        docClientW: document.documentElement.clientWidth,
        listOverflowX: list ? list.scrollWidth > list.clientWidth : null
      }
    };
  });
};

for (const vp of VIEWPORTS) {
  await page.setViewportSize({ width: vp.w, height: vp.h });
  await page.goto('http://localhost:4200/sale', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  // Tab available (default)
  const availableMetrics = await measureSale('available');
  await page.screenshot({ path: `${OUT}/sale-${vp.name}-available.png`, fullPage: true });
  // Tab history
  const historyMetrics = await measureSale('history');
  await page.screenshot({ path: `${OUT}/sale-${vp.name}-history.png`, fullPage: true });
  const combined = { viewport: vp.name, available: availableMetrics, history: historyMetrics };
  await writeFile(`${OUT}/sale-${vp.name}.json`, JSON.stringify(combined, null, 2));
  console.log(`✓ ${vp.name} done`);
}

await browser.close();
console.log('Done');

await browser.close();
