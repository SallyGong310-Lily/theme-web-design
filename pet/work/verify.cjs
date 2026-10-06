const {chromium}=require('C:/Users/BBR/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const root=path.resolve(__dirname,'..');
(async()=>{
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:1});
const errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url()))external.push(r.url())});
await page.goto(pathToFileURL(path.join(root,'index.html')).href);await page.screenshot({path:path.join(root,'preview-desktop.png'),fullPage:true});
const tests=[];async function check(name,fn){try{const result=await fn();if(!result)throw Error('assertion failed');tests.push({name,pass:true})}catch(e){tests.push({name,pass:false,error:e.message})}}
await check('Initial dog visible',async()=>await page.locator('#pet-name').textContent()==='Meet Milo.');
await page.locator('#next').click();
await check('Next button + mask animation',async()=>await page.locator('#pet-name').textContent()==='Meet Miso.'&&await page.locator('.scene').evaluate(el=>el.classList.contains('is-changing')));
await page.waitForTimeout(750);
await check('Mask animation ends',async()=>!(await page.locator('.scene').evaluate(el=>el.classList.contains('is-changing'))));
await page.locator('.scene-wrap').focus();await page.keyboard.press('End');
await check('Keyboard End',async()=>await page.locator('#pet-name').textContent()==='Meet Momo.');
await page.keyboard.press('ArrowRight');await check('Keyboard wraps last to first',async()=>await page.locator('#pet-name').textContent()==='Meet Milo.');
await page.keyboard.press('ArrowLeft');await check('Keyboard wraps first to last',async()=>await page.locator('#pet-name').textContent()==='Meet Momo.');
await page.keyboard.press('Home');await check('Keyboard Home',async()=>await page.locator('#pet-name').textContent()==='Meet Milo.');
await page.locator('[data-slide="1"]').click();await check('Direct slide selection',async()=>await page.locator('[data-slide="1"]').getAttribute('aria-current')==='true');
await page.locator('.hero-actions [data-start]').click();await check('Dialog opens with slide pet selected',async()=>await page.locator('#planner').evaluate(el=>el.open)&&await page.locator('input[value="cat"]').isChecked());
await page.locator('input[value="play"]').check();await page.locator('#plan-form button').click();
await check('Personalized plan result',async()=>!(await page.locator('#plan-result').isHidden())&&(await page.locator('#plan-result').textContent()).includes('小追逐'));
await page.locator('#try-again').click();await check('Reset planner',async()=>await page.locator('#plan-form').isVisible());
await page.keyboard.press('Escape');await check('Escape closes and restores focus',async()=>!(await page.locator('#planner').evaluate(el=>el.open))&&await page.locator('.hero-actions [data-start]').evaluate(el=>el===document.activeElement));
await page.locator('[data-care="1"]').click();await check('Care detail opens',async()=>await page.locator('#care-title').textContent()==='听懂，无声的表达');await page.keyboard.press('Escape');
await page.locator('.hero-actions [data-start]').click();
let inDialog=true;for(let i=0;i<16;i++){await page.keyboard.press('Tab');if(!await page.evaluate(()=>document.querySelector('#planner').contains(document.activeElement)))inDialog=false}
await check('Dialog keyboard focus contained',async()=>inDialog);await page.keyboard.press('Escape');
await page.evaluate(()=>scrollTo(0,0));await page.mouse.move(1210,340);await page.waitForTimeout(100);
await check('Parallax has distinct depth transforms',async()=>await page.evaluate(()=>new Set([...document.querySelectorAll('[data-depth]')].map(el=>el.style.transform)).size===3));
await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#next').click();
await check('Reduced motion disables mask and parallax',async()=>await page.evaluate(()=>!document.querySelector('.scene').classList.contains('is-changing')&&[...document.querySelectorAll('[data-depth]')].every(el=>getComputedStyle(el).transform==='none')));
await page.locator('[data-slide="0"]').click();
await page.setViewportSize({width:390,height:844});await page.screenshot({path:path.join(root,'preview-mobile.png'),fullPage:true});
for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:900});await check(`No horizontal overflow ${width}px`,async()=>await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth))}
await page.setViewportSize({width:1440,height:1000});
await page.setContent('<html><body style="margin:0">'+fs.readFileSync(path.join(root,'design-desktop-dog.svg'),'utf8')+'</body></html>');await page.screenshot({path:path.join(root,'preview-design.png'),fullPage:true});
await check('No external requests',async()=>external.length===0);await check('No JavaScript errors',async()=>errors.length===0);
const svgFiles=fs.readdirSync(root).filter(f=>f.endsWith('.svg'));
await check('Editable design SVG structures',async()=>svgFiles.every(f=>{const s=fs.readFileSync(path.join(root,f),'utf8');return s.includes('<text ')&&s.includes('<path ')&&!s.includes('<image')&&!s.includes('<foreignObject')}));
fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify({runAt:new Date().toISOString(),browser:await browser.version(),tests,errors,external,svgFiles},null,2));
console.log(JSON.stringify({passed:tests.filter(t=>t.pass).length,total:tests.length,failed:tests.filter(t=>!t.pass)},null,2));await browser.close();
if(tests.some(t=>!t.pass))process.exitCode=1;
})().catch(e=>{console.error(e);process.exitCode=1});
