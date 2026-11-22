(()=>{const T={};const bc=new BroadcastChannel('mockfb');const L=[];
const get=p=>{let o=T;for(const k of p.split('/').filter(Boolean)){if(o==null||typeof o!=='object')return undefined;o=o[k]}return o};
const setRaw=(p,v)=>{const ks=p.split('/').filter(Boolean);let o=T;for(let i=0;i<ks.length-1;i++){if(typeof o[ks[i]]!=='object'||o[ks[i]]===null)o[ks[i]]={};o=o[ks[i]]}if(v===null||v===undefined)delete o[ks[ks.length-1]];else o[ks[ks.length-1]]=JSON.parse(JSON.stringify(v))};
const snap=(p,v)=>({key:p.split('/').pop(),val:()=>v===undefined?null:JSON.parse(JSON.stringify(v)),ref:{path:p},forEach(cb){if(v&&typeof v==='object')for(const k in v)cb(snap(p+'/'+k,v[k]))}});
function apply(p,v){const before=L.map(l=>{if(!p.startsWith(l.p+'/'))return null;const key=p.slice(l.p.length+1).split('/')[0];return[key,get(l.p+'/'+key)!==undefined]});setRaw(p,v);
  L.forEach((l,i)=>{const b=before[i];if(!b)return;const [key,ex]=b,cp=l.p+'/'+key,nv=get(cp);const now=nv!==undefined;if(!ex&&now&&l.t==='add')l.cb(snap(cp,nv));else if(ex&&now&&l.t==='chg')l.cb(snap(cp,nv));else if(ex&&!now&&l.t==='rem')l.cb(snap(cp,nv))})}
bc.onmessage=e=>{const m=e.data;if(m.op==='set')apply(m.p,m.v);else if(m.op==='hello')bc.postMessage({op:'tree',t:T});else if(m.op==='tree'){for(const k in m.t)if(T[k]===undefined)apply(k,m.t[k])}};
bc.postMessage({op:'hello'});
const pth=r=>r.path||r.p;
const R={getDatabase:()=>({}),ref:(db,p)=>({path:p}),
 set:(r,v)=>{apply(pth(r),v);bc.postMessage({op:'set',p:pth(r),v:v===undefined?null:v});return Promise.resolve()},
 remove:r=>R.set(r,null),push:(r,v)=>{const k='k'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);const ref={path:pth(r)+'/'+k,key:k};const pr=v===undefined?Promise.resolve():R.set(ref,v);pr.key=k;return Object.assign(pr,{key:k})},
 onValue:(r,cb)=>{const p=pth(r);if(p==='.info/connected')setTimeout(()=>cb(snap(p,true)),50);else if(p==='.info/serverTimeOffset')cb(snap(p,0))},
 onDisconnect:()=>({remove(){}}),
 query:(r,...c)=>Object.assign({path:pth(r)},...c),limitToLast:n=>({lim:n}),orderByChild:k=>({ob:k}),endAt:v=>({end:v}),
 get:q=>{const v=get(q.path);const o={};if(v)for(const k in v){if(q.end!==undefined&&!(v[k]&&v[k][q.ob]<=q.end))continue;o[k]=v[k]}return Promise.resolve(snap(q.path,o))},
 onChildAdded:(r,cb)=>{const p=pth(r);L.push({p,t:'add',cb});const v=get(p);if(v){let ks=Object.keys(v);if(r.lim)ks=ks.slice(-r.lim);for(const k of ks)cb(snap(p+'/'+k,v[k]))}},
 onChildChanged:(r,cb)=>{L.push({p:pth(r),t:'chg',cb})},onChildRemoved:(r,cb)=>{L.push({p:pth(r),t:'rem',cb})}};
const F={getFirestore:()=>({}),doc:()=>({}),collection:()=>({}),query:()=>({}),orderBy:()=>({}),limit:()=>({}),onSnapshot:()=>{},setDoc:()=>Promise.resolve()};
window.__mockFB=[{initializeApp:()=>({})},F,R];})();
