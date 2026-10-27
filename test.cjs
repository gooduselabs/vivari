const {chromium}=require('/workspace/cai-guong/node_modules/playwright');const U=process.argv[2];const fs=require('fs');
const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)process.exitCode=1};
(async()=>{const b=await chromium.launch();
for(const [nm,vp,mob] of [['mobile',{width:390,height:844},true],['desktop',{width:1366,height:900},false]]){
const ctx=await b.newContext({viewport:vp,deviceScaleFactor:mob?2:1,isMobile:mob,hasTouch:mob,permissions:['notifications'],acceptDownloads:true});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e+''));pg.on('console',m=>m.type()==='error'&&errs.push(m.text()));
const S=()=>pg.evaluate("JSON.parse(localStorage['vivari:v1'])");const shot=async n=>{await pg.waitForTimeout(700);await pg.screenshot({path:`shots/${nm}-${n}.png`})};
const r=await pg.goto(U);ok(r.status()===200,nm+' load');await shot('01-empty');
await pg.click('[data-act=demo]');await pg.waitForTimeout(2400);await shot('02-today');
const due0=await pg.locator('.row.due').count();ok(due0>=1,'due cards '+due0);
await pg.click('.banner[data-act=notif]');await pg.waitForTimeout(800);ok((await S()).notif.on,'notif on');
if(await pg.locator('[data-act=feedall]').count()){await pg.click('[data-act=feedall]');await pg.waitForTimeout(500);ok(await pg.locator('.row.due').count()===0,'feed all clears due')}
ok((await S()).inv.find(i=>i.emoji==='🐭').qty===3,'inventory auto-deduct');
await pg.click('[data-tab=animals]');await pg.click('[data-act=selmode]');await pg.click('.card >> nth=0');await pg.click('.card >> nth=2');await shot('03-select');
const n0=(await S()).logs.length;await pg.click('[data-bulk=clean]');await pg.click('form .btn:not(.ghost)');await pg.waitForTimeout(400);ok((await S()).logs.length===n0+2,'bulk clean x2');
await pg.click('[data-tab=animals]');await pg.click('.card >> nth=2');await pg.waitForTimeout(800);await pg.screenshot({path:`shots/${nm}-04-detail.png`,fullPage:true});
ok(await pg.locator('.pad.bad').count()===1,'habitat alert shown (Kiwi)');
await pg.click('[data-act=hab]');await pg.fill('input[name=temp]','26');await pg.fill('input[name=hum]','70');await pg.click('form .btn:not(.ghost)');await pg.waitForTimeout(400);ok(await pg.locator('.pad.bad').count()===0,'habitat ok after normal reading');
// photo
await pg.evaluate(async()=>{});const png=await pg.evaluate(()=>{const c=document.createElement('canvas');c.width=1600;c.height=1200;const x=c.getContext('2d');const g=x.createLinearGradient(0,0,1600,1200);g.addColorStop(0,'#86efac');g.addColorStop(1,'#0ea5e9');x.fillStyle=g;x.fillRect(0,0,1600,1200);x.font='700px serif';x.fillText('🐸',400,900);return c.toDataURL('image/jpeg').split(',')[1]});
fs.writeFileSync('/tmp/frog.jpg',Buffer.from(png,'base64'));await pg.setInputFiles('#photoIn','/tmp/frog.jpg');await pg.waitForTimeout(1500);ok(await pg.locator('.ph').count()===1,'photo stored');ok(!!(await S()).animals[2].cover,'cover set');
await pg.click('[data-log=vet]');await pg.fill('input[name=cost]','200000');await pg.fill('input[name=note]','Checkup');await pg.click('form .btn:not(.ghost)');await pg.waitForTimeout(400);
await pg.click('[data-log=weight]');await pg.fill('input[name=value]','150');await shot('05-sheet');await pg.click('form .btn:not(.ghost)');
const [dl]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-act=share]')]);await dl.saveAs(`shots/${nm}-06-sharecard.png`);ok(true,'share card png');
await pg.click('[data-tab=calendar]');await pg.click('.cd.td');await shot('07-calendar');ok(await pg.locator('.cd .dot').count()>5,'calendar dots');
await pg.click('[data-mon="1"]');ok(await pg.locator('.dot.due').count()>0,'next month planned');
await pg.click('[data-tab=more]');await shot('08-more');await pg.click('[data-tab=stats]');await shot('09-stats');ok(await pg.locator('.srow').count()===6,'stats per animal');
await pg.click('[data-tab=more]');await pg.click('[data-tab=inventory]');await pg.click('[data-inv="1"] >> nth=0');ok((await S()).inv[0].qty===4,'stepper');await shot('10-inventory');
await pg.click('[data-tab=more]');await pg.click('[data-tab=wiki]');await pg.waitForSelector('.wcard');const tot=await pg.locator('.wcard').count();ok(tot>=150,'wiki species '+tot);await pg.waitForTimeout(1500);await shot('11-wiki');
await pg.fill('#wq','gecko');ok(await pg.locator('.wcard').count()>=4,'wiki search');
await pg.fill('#wq','neon tetra');await pg.click('.wcard >> nth=0');await pg.waitForTimeout(1200);ok(await pg.locator('.src a').count()>=3,'attribution links');ok(await pg.locator('text=tham khảo').count()>=1,'reference label');await pg.screenshot({path:`shots/${nm}-16-species.png`,fullPage:true});
await pg.click('[data-act=wback]');await pg.fill('#wq','crested');await pg.click('[data-wsp=crestedgecko]');await pg.waitForTimeout(800);ok(await pg.locator('text=Vivari biên soạn').count()===1,'curated care');
await pg.click('[data-adopt=crestedgecko]');ok(await pg.inputValue('input[name=species]')!=='','prefill');await pg.fill('input[name=name]','Mít');await pg.click('form .btn:not(.ghost)');await pg.waitForTimeout(500);ok((await S()).animals.length===7,'adopted');
await pg.click('[data-tab=more]');await pg.click('[data-tab=breed]');ok(await pg.locator('.ring').count()===1,'demo clutch ring');
await pg.click('[data-act=addclutch]');await pg.fill('input[name=name]','Test clutch');await pg.fill('input[name=lay]',new Date(Date.now()-58*864e5).toISOString().slice(0,10));await pg.fill('input[name=eggs]','8');await pg.fill('input[name=temp]','31.5');await pg.click('form .btn:not(.ghost)');await pg.waitForTimeout(500);ok(await pg.locator('.ring').count()===2,'clutch added');await shot('17-breeding');
await pg.click('[data-tab=today]');ok(await pg.locator('.alert.hatch').count()===1,'hatch alert on today');await pg.click('[data-tab=more]');await pg.click('[data-tab=breed]');
await pg.click('[data-hatch] >> nth=0');await pg.click('form .btn:not(.ghost)');await pg.waitForTimeout(400);ok((await S()).clutches.some(c=>c.done),'mark hatched');
await pg.click('[data-tab=more]');await pg.click('[data-tab=settings]');
const [ex]=await Promise.all([pg.waitForEvent('download'),pg.click('[data-act=export]')]);const p=await ex.path();const j=JSON.parse(fs.readFileSync(p));ok(j.photos.length===1&&j.animals.length===7&&j.clutches.length===2,'export with photo+clutches');
pg.once('dialog',d=>d.accept());await pg.click('[data-act=wipe]');await pg.waitForTimeout(400);ok((await S()).animals.length===0,'wipe');
await pg.setInputFiles('#imp',p);await pg.waitForTimeout(1200);ok((await S()).animals.length===7,'import');
await pg.click('[data-set=theme][data-v=dark]');await shot('12-settings-dark');
await pg.click('[data-tab=today]');await shot('13-today-dark');await pg.click('[data-tab=animals]');await pg.click('.card >> nth=2');await pg.waitForTimeout(900);await pg.screenshot({path:`shots/${nm}-14-detail-dark.png`,fullPage:true});
await pg.click('[data-tab=more]');await pg.click('[data-tab=settings]');await pg.click('[data-set=lang][data-v=en]');await pg.click('[data-set=theme][data-v=light]');await pg.click('[data-tab=today]');await shot('15-today-en');
await pg.reload();await pg.waitForTimeout(800);ok((await S()).lang==='en','persist');
ok(errs.length===0,'no errors '+JSON.stringify(errs));await ctx.close()}
await b.close()})();
