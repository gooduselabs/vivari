const {chromium}=require('/workspace/cai-guong/node_modules/playwright');const U=process.argv[2];
(async()=>{const b=await chromium.launch();
for(const [nm,vp,mob] of [['mobile',{width:390,height:844},true],['desktop',{width:1366,height:900},false]]){
const pg=await b.newPage({viewport:vp,deviceScaleFactor:mob?2:1,isMobile:mob,hasTouch:mob});const errs=[];pg.on('pageerror',e=>errs.push(e+''));
const r=await pg.goto(U);await pg.waitForTimeout(1200);await pg.screenshot({path:`shots/${nm}-empty.png`});
await pg.click('[data-act=demo]');await pg.waitForTimeout(2600);await pg.screenshot({path:`shots/${nm}-today.png`});
await pg.click('[data-tab=animals]');await pg.waitForTimeout(700);await pg.screenshot({path:`shots/${nm}-animals.png`});
await pg.click('.card');await pg.waitForTimeout(700);await pg.screenshot({path:`shots/${nm}-detail.png`,fullPage:true});
await pg.click('[data-log=weight]');await pg.waitForTimeout(500);await pg.fill('input[name=value]','330');await pg.screenshot({path:`shots/${nm}-sheet.png`});await pg.click('form button:not([type=button])');await pg.waitForTimeout(500);
console.log(nm,r.status(),errs,await pg.evaluate("JSON.parse(localStorage['vivari:v1']).logs.filter(l=>l.value=='330').length"));}
await b.close()})();
