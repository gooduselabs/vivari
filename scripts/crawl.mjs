// Crawl species data from Wikipedia (en+vi) REST/Action API and Wikidata. Run: node scripts/crawl.mjs
import {writeFileSync} from 'node:fs';import {LIST} from './species-list.mjs';
const UA={'User-Agent':'VivariBot/1.0 (https://github.com/gooduselabs/vivari; gooduselabs@users.noreply.github.com)'};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function api(base,params){const u=base+'?'+new URLSearchParams({format:'json',formatversion:'2',origin:'*',...params});for(let i=0;i<4;i++){try{const r=await fetch(u,{headers:UA});if(r.ok)return r.json();}catch{}await sleep(1500*(i+1))}throw new Error('fail '+u)}
const chunk=(a,n)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n));
const clean=s=>(s||'').replace(/\s*\([^()]*\)/g,m=>m.length>60?'':m).replace(/\s+/g,' ').replace(/\s([,.])/g,'$1').trim();
const sentences=(s,n)=>{const p=s.match(/[^.!?]+[.!?]+(\s|$)/g)||[s];let o='';for(const x of p){if((o+x).length>420&&o)break;o+=x;if(--n<=0)break}return o.trim()};
const strip=h=>(h||'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
async function extracts(lang,titles){const out={};for(const c of chunk(titles,20)){const j=await api(`https://${lang}.wikipedia.org/w/api.php`,{action:'query',prop:'extracts|pageprops|pageimages',exintro:'1',explaintext:'1',exlimit:'20',piprop:'name',ppprop:'wikibase_item',redirects:'1',titles:c.join('|')});
 const map={};(j.query.normalized||[]).forEach(n=>map[n.to]=n.from);(j.query.redirects||[]).forEach(n=>map[n.to]=map[n.from]||n.from);
 for(const p of j.query.pages||[]){if(p.missing)continue;const orig=map[p.title]||p.title;out[orig]={title:p.title,extract:p.extract,qid:p.pageprops?.wikibase_item,img:p.pageimage}}await sleep(300)}return out}
const UNITS={Q577:['year',1],Q573:['day',1/365],Q5151:['month',1/12],Q23387:['week',1/52],Q174728:['cm',1],Q11573:['m',100],Q174789:['mm',.1],Q11570:['kg',1000],Q41803:['g',1],Q218593:['in',2.54]};
function qty(claims,p,kind){const c=(claims[p]||[]).find(x=>x.mainsnak.datavalue);if(!c)return null;const v=c.mainsnak.datavalue.value;const u=UNITS[v.unit?.split('/').pop()];if(!u)return null;const n=Math.abs(+v.amount)*u[1];
 if(kind==='life')return{years:+n.toFixed(n<2?2:0)};if(kind==='len')return{cm:+n.toFixed(n<10?1:0)};return{g:+n.toFixed(n<10?1:0)}}
// Facts mentioned in the English intro text (kept with the matched sentence as evidence)
function textFacts(t){t=t||'';const f={};const sent=t.match(/[^.]+\./g)||[];
 for(const x of sent){if(!f.lifeText){const m=x.match(/(?:live|lifespan|life span|life expectancy|lifetime)[^.]*?(\d+(?:\.\d+)?)(?:\s*(?:–|-|to)\s*(\d+(?:\.\d+)?))?\s*years/i);if(m)f.lifeText={min:+m[1],max:m[2]?+m[2]:null,quote:x.trim()}}
  if(!f.sizeText){const m=x.match(/(?:length|long|grow|reach|size|measur)[^.]*?(\d+(?:\.\d+)?)(?:\s*(?:–|-|to)\s*(\d+(?:\.\d+)?))?\s*(cm|mm|m|centimetres|centimeters|millimetres|metres|meters)\b/i);if(m){const k={cm:1,centimetres:1,centimeters:1,mm:.1,millimetres:.1,m:100,metres:100,meters:100}[m[3].toLowerCase()];f.sizeText={min:+(+m[1]*k).toFixed(1),max:m[2]?+(+m[2]*k).toFixed(1):null,quote:x.trim()}}}}
 return f}
async function main(){const titles=LIST.map(x=>x[0]);console.log('species requested',titles.length);
 const en=await extracts('en',titles);const qids=[...new Set(Object.values(en).map(x=>x.qid).filter(Boolean))];const wd={};
 for(const c of chunk(qids,50)){const j=await api('https://www.wikidata.org/w/api.php',{action:'wbgetentities',ids:c.join('|'),props:'claims|sitelinks|labels',languages:'vi|en',sitefilter:'viwiki|enwiki'});Object.assign(wd,j.entities);await sleep(300)}
 const viTitles={};for(const [t,e] of Object.entries(en)){const s=wd[e.qid]?.sitelinks?.viwiki?.title;if(s)viTitles[t]=s}
 const vi=await extracts('vi',[...new Set(Object.values(viTitles))]);
 const files=new Set();const rows=[];
 for(const [t,group,cur] of LIST){const e=en[t];if(!e||!e.qid){console.warn('skip',t);continue}const w=wd[e.qid]||{claims:{}},cl=w.claims||{};
  const vt=viTitles[t],v=vt&&vi[vt];const p18=cl.P18?.[0]?.mainsnak?.datavalue?.value;const img=(p18||e.img||'').replace(/ /g,'_');if(img)files.add(img);
  const sci=cl.P225?.[0]?.mainsnak?.datavalue?.value||null;const viSum=v?.extract?sentences(clean(v.extract),3):'';const enSum=sentences(clean(e.extract),3);
  rows.push({id:cur||e.qid.toLowerCase(),curated:!!cur,group,qid:e.qid,sci,nameEn:e.title,nameVi:w.labels?.vi?.value||vt||null,
   sumVi:viSum||null,sumEn:enSum||null,viFromEn:!viSum,enUrl:'https://en.wikipedia.org/wiki/'+encodeURIComponent(e.title.replace(/ /g,'_')),viUrl:vt?'https://vi.wikipedia.org/wiki/'+encodeURIComponent(vt.replace(/ /g,'_')):null,
   ...textFacts(e.extract),life:qty(cl,'P2250','life'),len:qty(cl,'P2043','len'),mass:qty(cl,'P2067','mass'),img})}
 const meta={};for(const c of chunk([...files],40)){const j=await api('https://commons.wikimedia.org/w/api.php',{action:'query',prop:'imageinfo',iiprop:'url|extmetadata',iiurlwidth:'480',titles:c.map(f=>'File:'+f).join('|')});
  const norm={};(j.query.normalized||[]).forEach(n=>norm[n.to]=n.from);for(const p of j.query.pages||[]){const ii=p.imageinfo?.[0];if(!ii)continue;const m=ii.extmetadata||{};const key=(norm[p.title]||p.title).replace(/^File:/,'').replace(/ /g,'_');
   meta[key]={thumb:(ii.thumburl||'').split('?')[0],page:ii.descriptionurl,author:strip(m.Artist?.value)||'Unknown',license:m.LicenseShortName?.value||'',licenseUrl:m.LicenseUrl?.value||''}}await sleep(300)}
 // try local wiki images (non-commons) are skipped
 for(const r of rows){const m=meta[r.img];r.image=m||null;delete r.img}
 const seen=new Set(),out=rows.filter(r=>!seen.has(r.qid)&&seen.add(r.qid));
 writeFileSync(new URL('../src/wiki-data.json',import.meta.url),JSON.stringify({crawledAt:new Date().toISOString(),sources:['en.wikipedia.org','vi.wikipedia.org','wikidata.org','commons.wikimedia.org'],species:out}));
 console.log('saved',out.length,'vi summaries',out.filter(r=>!r.viFromEn).length,'images',out.filter(r=>r.image).length,'life',out.filter(r=>r.life).length,'len',out.filter(r=>r.len).length,'lifeText',out.filter(r=>r.lifeText).length,'sizeText',out.filter(r=>r.sizeText).length,'mass',out.filter(r=>r.mass).length)}
main().catch(e=>{console.error(e);process.exit(1)});
