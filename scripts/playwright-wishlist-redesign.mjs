// Verificación del rediseño de la wishlist card
import { chromium } from 'playwright';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';
const uuid = (i) => `00000000-0000-4000-8000-${(i).toString(16).padStart(12, '0')}`;
const dateOffset = (d) => new Date(Date.now() - d*86400000).toISOString();
const TITLES = ['TLZ','FF7','GoW','MGS','RE4','CT','Bloodborne','DS','Elden','HK','Hades','Disco','RDR','TW3','CP77','P5','MGS2','SH2','SoTC','Bioshock','ME2','DAO','BG3','DOS2','Skyrim','Oblivion','Morrowind','FNV','FO3','D4','PoE','Stardew','HKS','Celeste','Ori','Inside','Limbo','DS','Control','AW2','SH','RE2','REV','RE7','DMC5','Bayonetta3','NierA','NierR'];
const pickTitle = (i) => TITLES[(i*7+3) % TITLES.length] + ' ' + (i >= TITLES.length ? Math.floor(i/TITLES.length)+1 : '');
const fakeCover = (i) => `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 3 4'><rect width='3' height='4' fill='#5b3a8c'/></svg>`;

const wishlist = Array.from({length:6},(_,i)=>({
  id:uuid(i+7000),user_id:USER_ID,game_catalog_id:uuid(i+8000),
  title:pickTitle(i+100),image_url:fakeCover(i+100),released_date:'2024-01-15',
  rating:4,rating_top:5,genres:['Action','RPG','Adventure','Strategy','Horror','Sci-Fi','Platformer','Shooter'].slice(0, 3+(i%3)),
  stores:[],tags:[],
  metacritic_score:null,description:null,source:'rawg',added_by_user_id:USER_ID,
  times_added_by_users:0,desired_price:20+(i%50),priority:(i%5)+1,notes:null,
  notify_on_sale:true,platform:'PS5',created_at:dateOffset(i),updated_at:dateOffset(i)
}));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });

// Probar en 3 viewports
const viewports = [
  { name: 'desktop', w: 1920, h: 1080 },
  { name: 'tablet', w: 768, h: 1024 },
  { name: 'mobile', w: 375, h: 667 }
];

for (const vp of viewports) {
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
  const page = await ctx.newPage();
  await page.route(SUPABASE_ORIGIN + '/rest/v1/**', async (route) => {
    const url = route.request().url();
    const t = url.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0];
    if (t === 'user_wishlist_full' || t === 'user_wishlist') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(wishlist)});
    if (t === 'user_preferences') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([{user_id:USER_ID,language:'es',theme:'dark',role:'user',avatar_url:null,banner_url:null}])});
    return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify([])});
  });
  await page.route(SUPABASE_ORIGIN + '/auth/v1/**', async (route) => route.fulfill({status:200,body:'{}'}));
  await page.goto('http://localhost:4200/', { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    localStorage.setItem('sb-egevnihppclxucorhdjt-auth-token', JSON.stringify({
      access_token:'fake',token_type:'bearer',expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,
      refresh_token:'fake',user:{id:'17ac7e60-4d2e-4189-8e7c-05436e629ff4',aud:'authenticated',role:'authenticated',email:'prueba@prueba.es'}
    }));
  });
  await page.goto('http://localhost:4200/wishlist', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: `.playwright-mcp/shots/wishlist-redesign-${vp.name}.png`, fullPage: false });
  
  // Verificar dimensiones de la primera card
  const cardInfo = await page.evaluate(() => {
    const card = document.querySelector('retro-list-item.wishlist-card');
    if (!card) return { error: 'no card' };
    const inner = card.querySelector('.retro-list-item');
    const cover = card.querySelector('.wishlist-card__cover-wrapper');
    const body = card.querySelector('.retro-list-item__body');
    const bodyContent = card.querySelector('.wishlist-card__content');
    const title = card.querySelector('.wishlist-card__title');
    const price = card.querySelector('.wishlist-card__price-value');
    return {
      cardW: card.getBoundingClientRect().width,
      coverW: cover?.getBoundingClientRect().width,
      bodyW: body?.getBoundingClientRect().width,
      bodyContentW: bodyContent?.getBoundingClientRect().width,
      titleVisible: title ? window.getComputedStyle(title).webkitLineClamp : null,
      priceText: price?.textContent?.trim()
    };
  });
  console.log(`[${vp.name}]`, JSON.stringify(cardInfo));
  await ctx.close();
}

await browser.close();
