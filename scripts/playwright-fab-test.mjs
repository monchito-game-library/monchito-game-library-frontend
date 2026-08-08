// Verifica el fix del FAB y la última card
import { chromium } from 'playwright';

const SUPABASE_ORIGIN = 'https://egevnihppclxucorhdjt.supabase.co';
const USER_ID = '17ac7e60-4d2e-4189-8e7c-05436e629ff4';
const uuid = (i) => `00000000-0000-4000-8000-${(i).toString(16).padStart(12, '0')}`;
const dateOffset = (d) => new Date(Date.now() - d*86400000).toISOString();
const TITLES = ['TLZ','FF7','GoW','MGS','RE4','CT','Bloodborne','DS','Elden','HK','Hades','Disco','RDR','TW3','CP77','P5','MGS2','SH2','SoTC','Bioshock','ME2','DAO','BG3','DOS2','Skyrim','Oblivion','Morrowind','FNV','FO3','D4','PoE','Stardew','HKS','Celeste','Ori','Inside','Limbo','DS','Control','AW2','SH','RE2','REV','RE7','DMC5','Bayonetta3','NierA','NierR'];
const pickTitle = (i) => TITLES[(i * 7 + 3) % TITLES.length] + ' ' + i;
const fakeCover = () => 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 4"><rect width="3" height="4" fill="#5b3a8c"/></svg>';

const games = Array.from({length:60},(_,i)=>({
  id:uuid(i+1000),user_id:USER_ID,game_catalog_id:uuid(i+1),work_id:uuid(100000+i),
  title:pickTitle(i),price:10+i,condition:'Nuevo',status:'Sin empezar',format:'physical',
  store:'GAME',user_platform:'PS5',image_url:fakeCover(),cover_position:'{x:50,y:50,scale:1}',
  for_sale:false,sale_price:null,sold_at:null,created_at:dateOffset(i),updated_at:dateOffset(i),
  active_loan_id:null,active_loan_to:null,active_loan_at:null,user_notes:null,
  personal_rating:null,description:null,edition:'',platforms:['PS5'],
  metacritic_score:null,metacritic_url:null,esrb_rating:null,genres:['Action'],
  released_date:'2024-01-15',tba:false,rating:4,rating_top:5,ratings_count:0,reviews_count:0
}));

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true });
const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } });
const page = await ctx.newPage();
await page.route(SUPABASE_ORIGIN + '/rest/v1/**', async (route) => {
  const url = route.request().url();
  const t = url.split('/rest/v1/')[1]?.split('?')[0]?.split('/')[0];
  if (t === 'user_games_full') return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(games)});
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
await page.goto('http://localhost:4200/collection/games', { waitUntil: 'networkidle' });
await page.waitForTimeout(2000);

// Scroll al fondo
await page.evaluate(() => { const g = document.querySelector('.game-list__grid'); if (g) g.scrollTop = g.scrollHeight; });
await page.waitForTimeout(500);

await page.screenshot({ path: '.playwright-mcp/shots/bulk/mobile-games-fab-fixed.png', fullPage: false });

const result = await page.evaluate(() => {
  const g = document.querySelector('.game-list__grid');
  if (!g) return null;
  const lastCard = g.children[g.children.length - 1];
  if (!lastCard) return null;
  const rect = lastCard.getBoundingClientRect();
  const fab = document.querySelector('.game-list__fab');
  const fabRect = fab?.getBoundingClientRect();
  return {
    cardBottom: rect.bottom,
    cardVisible: rect.bottom <= window.innerHeight,
    cardTop: rect.top,
    cardHeight: rect.height,
    fabTop: fabRect?.top,
    fabRight: fabRect?.right,
    fabBottom: fabRect?.bottom,
    fabLeft: fabRect?.left,
    overlaps: fabRect && (rect.bottom > fabRect.top) && (rect.right > fabRect.left) && (rect.top < fabRect.bottom) && (rect.left < fabRect.right),
    fabIsFixed: fab ? getComputedStyle(fab).position : null,
    gridPaddingBottom: getComputedStyle(g).paddingBottom
  };
});
console.log('Last card after fix:', JSON.stringify(result, null, 2));
await browser.close();
