const {chromium}=require('/workspace/cai-guong/node_modules/playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const svg=fs.readFileSync('public/icon.svg','utf8').replace(' rx="120"','');
for(const n of [192,512,180]){const p=await b.newPage({viewport:{width:n,height:n}});await p.setContent(`<style>*{margin:0}svg{width:${n}px;height:${n}px;display:block}</style>${svg}`);await p.screenshot({path:`public/${n===180?'apple-touch-icon':'icon-'+n}.png`});}
await b.close()})();
