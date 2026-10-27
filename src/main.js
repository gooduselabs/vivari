import './style.css';import {T} from './i18n.js';
const K='vivari:v1',DAY=864e5;
const EMO={reptile:'🦎',amphibian:'🐸',invert:'🕷️',bird:'🦜',fish:'🐠',mammal:'🐹'};
const EVI={feed:'🍽️',refuse:'🙅',shed:'🐍',weight:'⚖️',clean:'🧽',water:'💧',vet:'🩺',note:'📝'};
const HUE={reptile:150,amphibian:95,invert:265,bird:28,fish:200,mammal:330};
let S=load(),view={tab:'today',id:null,q:'',g:'all'};
function load(){try{return JSON.parse(localStorage[K])}catch{return{lang:'vi',animals:[],logs:[]}}}
function save(){localStorage[K]=JSON.stringify(S)}
const t=(k,v={})=>{let s=k.split('.').reduce((o,x)=>o?.[x],T[S.lang])??k;for(const n in v)s=s.replace('{'+n+'}',v[n]);return s};
const uid=()=>Math.random().toString(36).slice(2,10);
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const d0=x=>{const d=new Date(x);d.setHours(0,0,0,0);return+d};
const daysBetween=(a,b)=>Math.round((d0(b)-d0(a))/DAY);
const logsOf=id=>S.logs.filter(l=>l.aid===id).sort((a,b)=>b.at-a.at);
const last=(id,ty)=>logsOf(id).find(l=>ty.includes(l.type));
function status(a){const f=last(a.id,['feed']);if(!f)return{left:0,f};const left=a.interval-daysBetween(f.at,Date.now());return{left,f}}
const rel=ts=>{if(!ts)return t('never');const n=daysBetween(ts,Date.now());return n<=0?t('todayW'):t('ago',{n})};
const fmtD=ts=>new Date(ts).toLocaleDateString(S.lang==='vi'?'vi-VN':'en-GB',{day:'2-digit',month:'short',year:'numeric'});
const toast=m=>{const e=document.createElement('div');e.className='toast';e.textContent=m;document.body.append(e);setTimeout(()=>e.remove(),2200)};
const app=document.getElementById('app');

function render(){document.documentElement.lang=S.lang;app.innerHTML=`<main class="wrap">${view.id?detail():view.tab==='today'?today():view.tab==='animals'?animals():settings()}</main>${tabbar()}`;app.querySelector('main').classList.add('in')}
function tabbar(){const b=(k,i)=>`<button data-tab="${k}" class="${view.tab===k&&!view.id?'on':''}"><span>${i}</span>${t(k)}</button>`;return`<nav class="tabbar glass">${b('today','☀️')}${b('animals','🦎')}<button class="fab" data-act="add" aria-label="${t('add')}">＋</button>${b('settings','⚙️')}</nav>`}
function avatar(a,big){return`<div class="av ${big?'big':''}" style="--h:${HUE[a.group]||150}">${EMO[a.group]||'🐾'}</div>`}
function today(){const h=new Date().getHours(),part=h<11?'morning':h<18?'afternoon':'evening';
 const list=S.animals.map(a=>({a,...status(a)})).sort((x,y)=>x.left-y.left);const due=list.filter(x=>x.left<=0),up=list.filter(x=>x.left>0).slice(0,6);
 const rate=(()=>{const f=S.logs.filter(l=>l.type==='feed').length,r=S.logs.filter(l=>l.type==='refuse').length;return f+r?Math.round(f*100/(f+r)):0})();
 return`<header class="hero"><p class="eyebrow">${new Date().toLocaleDateString(S.lang==='vi'?'vi-VN':'en-GB',{weekday:'long',day:'numeric',month:'long'})}</p><h1>${t('hello')} ${t(part)}<em>.</em></h1><p class="sub">${t('stats',{a:S.animals.length,d:due.length})}</p></header>
 ${S.animals.length?`<section class="kpis"><div class="glass kpi"><b>${S.animals.length}</b><span>${t('animals')}</span></div><div class="glass kpi warn"><b>${due.length}</b><span>${t('due')}</span></div><div class="glass kpi ok"><b>${rate}%</b><span>${t('acceptance')}</span></div></section>
 <h2>${t('due')}</h2>${due.length?due.map(x=>dueCard(x)).join(''):`<div class="glass empty">🌿 ${t('allgood')}</div>`}
 ${up.length?`<h2>${t('upcoming')}</h2><div class="chips">${up.map(x=>`<button class="glass up" data-open="${x.a.id}">${avatar(x.a)}<div><b>${esc(x.a.name)}</b><small>${t('inDays',{n:x.left})}</small></div></button>`).join('')}</div>`:''}`:emptyState()}`}
function dueCard({a,left,f}){return`<article class="glass row due" data-open="${a.id}">${avatar(a)}<div class="grow"><b>${esc(a.name)}</b><small>${esc(a.species)} · ${t('lastFed')}: ${rel(f?.at)}</small>${left<0?`<span class="pill red">${t('overdue')} ${-left} ${t('days')}</span>`:''}</div><div class="qa"><button class="btn sm ghost" data-quick="refuse" data-id="${a.id}" title="${t('refused')}">🙅</button><button class="btn sm" data-quick="feed" data-id="${a.id}">🍽️ ${t('fed')}</button></div></article>`}
function emptyState(){return`<div class="glass empty big"><div class="blob">🦎🐸🦜</div><p>${t('noAnimals')}</p><div class="hstack"><button class="btn" data-act="add">＋ ${t('add')}</button><button class="btn ghost" data-act="demo">${t('demo')}</button></div></div>`}
function animals(){const q=view.q.toLowerCase();const L=S.animals.filter(a=>(view.g==='all'||a.group===view.g)&&(a.name+' '+a.species).toLowerCase().includes(q));
 return`<header class="hero sm"><h1>${t('animals')}<em>.</em></h1></header><div class="glass search"><span>🔎</span><input id="q" value="${esc(view.q)}" placeholder="${t('search')}"></div>
 <div class="seg">${['all',...Object.keys(EMO)].map(g=>`<button data-g="${g}" class="${view.g===g?'on':''}">${g==='all'?t('all'):EMO[g]+' '+t('groups.'+g)}</button>`).join('')}</div>
 ${S.animals.length?`<div class="grid">${L.map(a=>{const s=status(a),w=last(a.id,['weight']);return`<article class="glass card" data-open="${a.id}" style="--h:${HUE[a.group]}">${avatar(a,1)}<b>${esc(a.name)}</b><small>${esc(a.species)}</small><div class="meta"><span class="pill ${s.left<=0?'red':'green'}">${s.left<=0?t('due'):t('inDays',{n:s.left})}</span>${w?`<span class="pill">${w.value} g</span>`:''}</div></article>`}).join('')}</div>`:emptyState()}`}
function chart(ws){if(ws.length<2)return'';const W=320,H=110,p=10,xs=ws.map(l=>l.at),ys=ws.map(l=>+l.value);const x0=Math.min(...xs),x1=Math.max(...xs),y0=Math.min(...ys),y1=Math.max(...ys);
 const X=v=>p+(W-2*p)*(v-x0)/((x1-x0)||1),Y=v=>H-p-(H-2*p)*(v-y0)/((y1-y0)||1);const pts=ws.map(l=>[X(l.at),Y(+l.value)]);const d=pts.map((q,i)=>(i?'L':'M')+q[0].toFixed(1)+' '+q[1].toFixed(1)).join(' ');
 return`<svg viewBox="0 0 ${W} ${H}" class="chart"><defs><linearGradient id="cg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#22c55e" stop-opacity=".35"/><stop offset="1" stop-color="#22c55e" stop-opacity="0"/></linearGradient></defs><path d="${d} L${pts.at(-1)[0]} ${H} L${pts[0][0]} ${H}Z" fill="url(#cg)"/><path d="${d}" fill="none" stroke="#16a34a" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>${pts.map(q=>`<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="#fff" stroke="#16a34a" stroke-width="2"/>`).join('')}</svg><div class="axis"><span>${y0} g</span><span>${y1} g</span></div>`}
function detail(){const a=S.animals.find(x=>x.id===view.id);if(!a){view.id=null;return today()}const L=logsOf(a.id),s=status(a),sh=last(a.id,['shed']),ws=L.filter(l=>l.type==='weight').reverse();
 const f=L.filter(l=>l.type==='feed').length,r=L.filter(l=>l.type==='refuse').length;
 return`<button class="back" data-act="back">‹ ${t('back')}</button><header class="glass profile" style="--h:${HUE[a.group]}">${avatar(a,1)}<div><h1>${esc(a.name)}</h1><p>${esc(a.species)} · ${t('groups.'+a.group)}</p></div><button class="btn sm ghost" data-act="edit">${t('edit')}</button></header>
 <section class="kpis"><div class="glass kpi ${s.left<=0?'warn':'ok'}"><b>${s.left<=0?(s.left<0?'+'+(-s.left):'0'):s.left}</b><span>${s.left<=0?t('overdue')+' ('+t('days')+')':t('interval').split('(')[0].trim()==='Feed every'?'days to feed':'ngày tới bữa'}</span></div><div class="glass kpi"><b>${ws.at(-1)?.value??'–'}</b><span>${t('weight')} (g)</span></div><div class="glass kpi"><b>${f+r?Math.round(f*100/(f+r))+'%':'–'}</b><span>${t('acceptance')}</span></div></section>
 <div class="glass facts"><div><small>${t('lastFed')}</small><b>${rel(s.f?.at)}</b></div><div><small>${t('lastShed')}</small><b>${rel(sh?.at)}</b></div><div><small>${t('interval')}</small><b>${a.interval}</b></div></div>
 ${ws.length>1?`<div class="glass pad"><h3>${t('weight')}</h3>${chart(ws)}</div>`:''}
 <div class="quick">${Object.keys(EVI).map(k=>`<button class="glass qbtn" data-log="${k}"><span>${EVI[k]}</span>${t('ev.'+k)}</button>`).join('')}</div>
 ${a.notes?`<div class="glass pad note">${esc(a.notes)}</div>`:''}
 <h2>${t('history')}</h2><ol class="timeline">${L.length?L.map(l=>`<li class="glass"><span class="ti">${EVI[l.type]}</span><div class="grow"><b>${t('ev.'+l.type)}${l.value?` · ${esc(l.value)}${l.type==='weight'?' g':''}`:''}</b><small>${fmtD(l.at)}${l.note?' · '+esc(l.note):''}</small></div><button class="x" data-dellog="${l.id}" aria-label="${t('del')}">×</button></li>`).join(''):`<li class="glass empty">${t('noLogs')}</li>`}</ol>`}
function settings(){return`<header class="hero sm"><h1>${t('settings')}<em>.</em></h1></header>
 <div class="glass pad list"><div class="li"><span>🌐 ${t('lang')}</span><div class="seg mini"><button data-lang="vi" class="${S.lang==='vi'?'on':''}">Tiếng Việt</button><button data-lang="en" class="${S.lang==='en'?'on':''}">English</button></div></div>
 <button class="li" data-act="export"><span>⬇️ ${t('export')}</span><i>›</i></button><label class="li"><span>⬆️ ${t('import')}</span><i>›</i><input type="file" accept="application/json" id="imp" hidden></label>
 <button class="li" data-act="demo"><span>✨ ${t('demo')}</span><i>›</i></button><button class="li danger" data-act="wipe"><span>🗑️ ${t('wipe')}</span><i>›</i></button></div>
 <p class="foot">🔒 ${t('privacy')}<br>Vivari · GoodUseLabs</p>`}

function sheet(html,onSubmit){const m=document.createElement('div');m.className='modal';m.innerHTML=`<form class="sheet glass">${html}<div class="hstack end"><button type="button" class="btn ghost" data-close>${t('cancel')}</button><button class="btn">${t('save')}</button></div></form>`;document.body.append(m);requestAnimationFrame(()=>m.classList.add('show'));
 const close=()=>{m.classList.remove('show');setTimeout(()=>m.remove(),250)};m.onclick=e=>{if(e.target===m||e.target.dataset.close!==undefined)close()};m.querySelector('form').onsubmit=e=>{e.preventDefault();onSubmit(Object.fromEntries(new FormData(e.target)));close();save();render()};m.querySelector('input,select')?.focus()}
function animalForm(a){const e=a||{name:'',species:'',group:'reptile',interval:7,notes:''};
 sheet(`<h3>${a?t('edit'):t('add')}</h3><label>${t('name')}<input name="name" required value="${esc(e.name)}" placeholder="Mochi"></label><label>${t('species')}<input name="species" value="${esc(e.species)}" placeholder="Ball python"></label>
 <div class="two"><label>${t('group')}<select name="group">${Object.keys(EMO).map(g=>`<option value="${g}" ${e.group===g?'selected':''}>${EMO[g]} ${t('groups.'+g)}</option>`).join('')}</select></label><label>${t('interval')}<input name="interval" type="number" min="1" max="90" value="${e.interval}"></label></div>
 <label>${t('notes')}<textarea name="notes" rows="2">${esc(e.notes)}</textarea></label>${a?`<button type="button" class="btn danger wide" id="delA">${t('del')}</button>`:''}`,
 v=>{v.interval=Math.max(1,+v.interval||7);if(a)Object.assign(a,v);else{const n={id:uid(),...v,created:Date.now()};S.animals.push(n);view={...view,id:n.id}}});
 document.getElementById('delA')?.addEventListener('click',()=>{if(confirm(t('confirmDel'))){S.animals=S.animals.filter(x=>x.id!==a.id);S.logs=S.logs.filter(l=>l.aid!==a.id);view.id=null;save();document.querySelector('.modal').remove();render()}})}
function logForm(type){const iso=new Date().toISOString().slice(0,10);const needV={weight:t('grams'),feed:t('prey'),refuse:t('prey')}[type];
 sheet(`<h3>${EVI[type]} ${t('ev.'+type)}</h3>${needV?`<label>${needV}<input name="value" ${type==='weight'?'type="number" step="0.1" required':''} placeholder="${type==='weight'?'320':'Small mouse (f/t)'}"></label>`:''}<label>${t('date')}<input name="date" type="date" value="${iso}"></label><label>${t('notes')}<input name="note"></label>`,
 v=>addLog(view.id,type,v.value,v.note,v.date))}
function addLog(aid,type,value='',note='',date){const at=date?+new Date(date+'T'+new Date().toTimeString().slice(0,8)):Date.now();S.logs.push({id:uid(),aid,type,value,note,at})}
function demo(){const now=Date.now(),A=[['Mochi','Ball python','reptile',10],['Bơ','Leopard gecko','reptile',3],['Kiwi','Pacman frog','amphibian',5],['Nhện Đỏ','Brachypelma hamorii','invert',7],['Sóc Nâu','Cockatiel','bird',1],['Lam','Betta splendens','fish',1]];
 A.forEach(([name,species,group,interval],i)=>{const id=uid();S.animals.push({id,name,species,group,interval,notes:'',created:now});
  for(let k=0;k<8;k++){S.logs.push({id:uid(),aid:id,type:k%4===3?'refuse':'feed',value:group==='reptile'?'Mouse':'',note:'',at:now-DAY*(interval*(k+1)-(i%3)+ (i===0?3:0))})}
  for(let k=0;k<6;k++)S.logs.push({id:uid(),aid:id,type:'weight',value:String(Math.round([320,55,140,18,90,3][i]*(1-k*.04)*10)/10),note:'',at:now-DAY*14*k-DAY});
  if(group!=='bird'&&group!=='fish')S.logs.push({id:uid(),aid:id,type:'shed',value:'',note:'',at:now-DAY*(12+i*4)})});save();render();toast('✨')}

app.addEventListener('click',e=>{const el=e.target.closest('[data-tab],[data-open],[data-act],[data-quick],[data-log],[data-g],[data-lang],[data-dellog]');if(!el)return;const d=el.dataset;
 if(d.quick){e.stopPropagation();addLog(d.id,d.quick);save();render();toast(EVI[d.quick]+' '+t('ev.'+d.quick));return}
 if(d.dellog){S.logs=S.logs.filter(l=>l.id!==d.dellog);save();render();return}
 if(d.tab){view={...view,tab:d.tab,id:null}}else if(d.open){view.id=d.open}else if(d.g){view.g=d.g}else if(d.lang){S.lang=d.lang;save()}else if(d.log){return logForm(d.log)}
 else if(d.act){const a=d.act;if(a==='add')return animalForm();if(a==='edit')return animalForm(S.animals.find(x=>x.id===view.id));if(a==='back')view.id=null;if(a==='demo')return demo();
  if(a==='export'){const b=new Blob([JSON.stringify({app:'vivari',v:1,...S},null,2)],{type:'application/json'});const u=URL.createObjectURL(b);Object.assign(document.createElement('a'),{href:u,download:`vivari-${new Date().toISOString().slice(0,10)}.json`}).click();return}
  if(a==='wipe'){if(confirm(t('confirmDel'))){S={lang:S.lang,animals:[],logs:[]};save()}}}
 scrollTo({top:0,behavior:'smooth'});render()});
app.addEventListener('input',e=>{if(e.target.id==='q'){view.q=e.target.value;const p=e.target.selectionStart;render();const q=document.getElementById('q');q.focus();q.setSelectionRange(p,p)}});
app.addEventListener('change',async e=>{if(e.target.id==='imp'){try{const j=JSON.parse(await e.target.files[0].text());if(!Array.isArray(j.animals)||!Array.isArray(j.logs))throw 0;S={lang:j.lang||S.lang,animals:j.animals,logs:j.logs};save();render();toast('✅ '+t('imported'))}catch{toast('⚠️ JSON?')}}});
render();if('serviceWorker'in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js');
