let dbp;const db=()=>dbp||(dbp=new Promise((res,rej)=>{const r=indexedDB.open('vivari',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id'}).createIndex('aid','aid');r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}));
const tx=async(m,f)=>{const d=await db();return new Promise((res,rej)=>{const t=d.transaction('photos',m);const out=f(t.objectStore('photos'));t.oncomplete=()=>res(out.result??out);t.onerror=()=>rej(t.error)})};
export const putPhoto=p=>tx('readwrite',s=>s.put(p));
export const delPhoto=id=>tx('readwrite',s=>s.delete(id));
export const photosOf=aid=>tx('readonly',s=>s.index('aid').getAll(aid));
export const allPhotos=()=>tx('readonly',s=>s.getAll());
export const clearPhotos=()=>tx('readwrite',s=>s.clear());
export async function compress(file,max=1280,q=.8){const bmp=await createImageBitmap(file);const k=Math.min(1,max/Math.max(bmp.width,bmp.height));const c=document.createElement('canvas');c.width=Math.round(bmp.width*k);c.height=Math.round(bmp.height*k);c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);return new Promise(r=>c.toBlob(r,'image/jpeg',q))}
export const blobToData=b=>new Promise(r=>{const f=new FileReader();f.onload=()=>r(f.result);f.readAsDataURL(b)});
export const dataToBlob=async d=>(await fetch(d)).blob();
