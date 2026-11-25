<script>
'use strict';
const $=id=>document.getElementById(id);
let __errN=0;function showErr(m){if(__errN++>3)return;let d=document.getElementById('errbox');if(!d){d=document.createElement('div');d.id='errbox';d.style.cssText='position:fixed;left:8px;bottom:8px;z-index:99;background:#300;color:#fbb;font:12px monospace;padding:6px;max-width:90vw;white-space:pre-wrap';document.body.appendChild(d)}d.textContent+=m+'\n'}
addEventListener('error',e=>showErr('ERR '+e.message+' @'+(e.lineno||'')));
const WD=window.AGW,K=1/8,WM=WD.W*K,HM=WD.H*K,TAU=Math.PI*2;
/* túneles y rampas de aparcamiento retirados: esas vías vuelven a ser calles normales a nivel */
for(const r of WD.roads){if(r[4]===3)r.wasT=1;if(r[4]===3||r[4]===4||(r[4]===1&&r[0]>=6))r[4]=0}
/* recorta las vías quitando los puntos que cumplen drop(x,z,r) (coordenadas en metros). Se parte la vía en trozos; los trozos de menos de
   minL metros se descartan. Los segmentos se muestrean cada 1,5 m solo para encontrar los cortes (no se añaden vértices intermedios). */
function cutRoads(drop,minL,onPiece){const R=WD.roads,add=[];let nc=0;
  for(let ri=R.length-1;ri>=0;ri--){const r=R[ri];const n=(r.length-5)/2;if(n<2)continue;let hit=false;
    for(let i=0;i<n-1&&!hit;i++){const ax=r[5+i*2]*K,az=r[6+i*2]*K,bx=r[7+i*2]*K,bz=r[8+i*2]*K,L=Math.hypot(bx-ax,bz-az),m=Math.max(1,Math.ceil(L/1.5));for(let k=0;k<=m;k++)if(drop(ax+(bx-ax)*k/m,az+(bz-az)*k/m,r)){hit=true;break}}
    if(!hit)continue;nc++;const pieces=[];let cur=[];const close=()=>{if(cur.length>=4){let L=0;for(let j=2;j<cur.length;j+=2)L+=Math.hypot(cur[j]-cur[j-2],cur[j+1]-cur[j-1])*K;if(L>=minL)pieces.push(cur)}cur=[]};
    for(let i=0;i<n;i++){const ax=r[5+i*2],az=r[6+i*2];const inA=!drop(ax*K,az*K,r);if(i===0){if(inA)cur.push(ax,az);continue}
      const px=r[3+i*2],pz=r[4+i*2],L=Math.hypot(ax-px,az-pz)*K,m=Math.max(1,Math.ceil(L/1.5));let prevIn=!drop(px*K,pz*K,r),lx=px,lz=pz;
      for(let k=1;k<=m;k++){const x=px+(ax-px)*k/m,z=pz+(az-pz)*k/m,inn=k===m?inA:!drop(x*K,z*K,r);
        if(prevIn&&!inn){if(lx!==cur[cur.length-2]||lz!==cur[cur.length-1])cur.push(lx,lz);close()}else if(!prevIn&&inn&&k<m)cur.push(x,z);prevIn=inn;lx=x;lz=z}
      if(inA)cur.push(ax,az)}
    close();R.splice(ri,1);for(const p of pieces){const q=r.slice(0,5).concat(p);for(const key of Object.keys(r))if(isNaN(+key))q[key]=r[key];if(onPiece)onPiece(q,r);add.push(q)}}
  for(const q of add)R.push(q);return nc}
/* las vías que salían del mapa (más allá del MDT y la ortofoto) se dibujaban sobre el suelo vacío del borde: se cortan en el borde */
const _cutEdge=cutRoads((x,z)=>x<0||z<0||x>WM||z>HM,8);
/* antiguos pasos inferiores (túneles retirados) que cruzan bajo una vía de más categoría sin unirse a ella: la calzada subía por el talud
   y quedaba como losas encima de la autovía. Se quita el tramo que pasa por debajo (la calle queda cortada a cada lado). */
const _cutUnder=(()=>{const R=WD.roads,segs=r=>{const s=[];for(let i=5;i<r.length-2;i+=2)s.push([r[i]*K,r[i+1]*K,r[i+2]*K,r[i+3]*K]);return s};
  const X=(a,b)=>{const d=(a[2]-a[0])*(b[3]-b[1])-(a[3]-a[1])*(b[2]-b[0]);if(Math.abs(d)<1e-9)return false;const t=((b[0]-a[0])*(b[3]-b[1])-(b[1]-a[1])*(b[2]-b[0]))/d,u=((b[0]-a[0])*(a[3]-a[1])-(b[1]-a[1])*(a[2]-a[0]))/d;return t>1e-6&&t<1-1e-6&&u>1e-6&&u<1-1e-6};
  const over=new Map();for(const r of R){if(!r.wasT)continue;const S=segs(r),Q=[];for(const q of R){if(q===r||q.wasT||q[0]>3||q[0]>=r[0])continue;if(S.some(a=>segs(q).some(b=>X(a,b))))Q.push({q,S:segs(q),m:q[1]*K/2+(q[0]===0?12:10)})}if(Q.length)over.set(r,Q)}
  // las calles que llegaban a la boca del paso inferior se quedan sin salida dentro del talud: se recortan también (solo cerca de la boca)
  const nodes=r=>{const o=new Set();for(let i=5;i<r.length;i+=2)o.add(r[i]+','+r[i+1]);return o},nb=new Map();
  for(const [r,Q] of over){const ends=[[r[5],r[6]],[r[r.length-2],r[r.length-1]]];for(const q of R){if(over.has(q)||Q.some(o=>o.q===q)||q[0]>7)continue;const nq=nodes(q);
    if(Q.some(o=>{for(const k of nodes(o.q))if(nq.has(k))return true;return false}))continue;for(const [ex,ez] of ends)if(nq.has(ex+','+ez))nb.set(q,{Q,x:ex*K,z:ez*K})}}
  if(!over.size)return 0;const dseg=(x,z,s)=>{const dx=s[2]-s[0],dz=s[3]-s[1],L2=dx*dx+dz*dz||1;let t=((x-s[0])*dx+(z-s[1])*dz)/L2;t=t<0?0:t>1?1:t;return Math.hypot(x-s[0]-dx*t,z-s[1]-dz*t)};
  return cutRoads((x,z,r)=>{let Q=over.get(r);if(!Q){const b=nb.get(r);if(!b||Math.hypot(x-b.x,z-b.z)>25)return false;Q=b.Q}for(const q of Q)for(const s of q.S)if(dseg(x,z,s)<q.m)return true;return false},10,q=>{delete q.wasT})})();
console.log("env cortes borde",_cutEdge,"pasos inferiores",_cutUnder);
// puente de la Avda. Carlos III entre la glorieta del Supercor y la del antiguo campo de fútbol: suprimido (va a nivel)
for(const r of WD.roads)if(r[4]===1){let cx=0,cz=0,n=0;for(let i=5;i<r.length;i+=2){cx+=r[i];cz+=r[i+1];n++}cx=cx/n/8;cz=cz/n/8;if(Math.hypot(cx-2510,cz-2245)<40)r[4]=0}// las pasarelas peatonales (como la de madera del puerto) no son puentes de carretera
// puente de la Avda. Carlos III entre la glorieta del Supercor y la del antiguo campo de fútbol: retirado (calle a nivel)
for(const r of WD.roads){if(r[4]!==1)continue;let sx=0,sz=0,n=0;for(let i=5;i<r.length;i+=2){sx+=r[i];sz+=r[i+1];n++}if(Math.hypot(sx/n/8-2510,sz/n/8-2245)<60)r[4]=0}
const clamp=(v,a,b)=>v<a?a:v>b?b:v,rnd=(a,b)=>a+Math.random()*(b-a);
const fmt=n=>Math.round(n).toLocaleString('es-ES')+' €';
const IS_TOUCH=matchMedia('(pointer:coarse)').matches||'ontouchstart'in window;
/* calidad gráfica: 0 baja, 1 media (móviles modernos: sombras reales), 2 alta (PC) */
const GPUNAME=(()=>{try{const c=document.createElement('canvas'),g=c.getContext('webgl');const e=g&&g.getExtension('WEBGL_debug_renderer_info');return e?String(g.getParameter(e.UNMASKED_RENDERER_WEBGL)):''}catch(e){return ''}})();
const QL=(()=>{let q;try{const s=JSON.parse(localStorage.getItem('ag3d')||'{}');q=s&&s.set&&s.set.q}catch(e){}if(q===0||q===1||q===2)return q;if(!IS_TOUCH)return 2;
  if(/Apple GPU|Adreno \(TM\) (6[4-9]\d|7\d\d|8\d\d)|Mali-G(7[1-9]|[1-9]\d\d|6[1-9]0)|Immortalis|Xclipse|Maleoon/i.test(GPUNAME))return 1;if((navigator.deviceMemory||4)>=6)return 1;return 0})();
const HQ=QL>=1,UHQ=QL>=2;
let S=null;try{S=JSON.parse(localStorage.getItem('ag3d')||'null')}catch(e){}
S=S||{nick:'',cash:0,kills:0,deaths:0};
const save=()=>{if(/p2/.test(location.hash))return;try{localStorage.setItem('ag3d',JSON.stringify(S))}catch(e){}};
let UID='';try{UID=localStorage.getItem('ag_uid')||'';if(!UID){UID='u'+Math.random().toString(36).slice(2,10);localStorage.setItem('ag_uid',UID)}}catch(e){UID='u'+Math.random().toString(36).slice(2,10)}
if(/p2/.test(location.hash)){UID=UID+'_p2';S=Object.assign({},S,{nick:(S.nick||'Piloto')+' 2'})}
const lcg=s=>{s=(s>>>0)||1;return()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296}};

/* ============ DATOS DEL MUNDO (OpenStreetMap, 1 unidad = 1 metro) ============ */
function dec(f,o){const n=(f.length-o)/2,p=new Float64Array(n*2);let x=0,y=0;for(let i=0;i<n;i++){x+=f[o+i*2];y+=f[o+i*2+1];p[i*2]=x*K;p[i*2+1]=y*K}return p}
const pipf=(x,z,p)=>{let c=false;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2){const zi=p[i+1],zj=p[j+1];if((zi>z)!==(zj>z)&&x<(p[j]-p[i])*(z-zi)/(zj-zi)+p[i])c=!c}return c};
const BL=[];const GBL=[];const GC=32,GWc=Math.ceil(WM/GC),GHc=Math.ceil(HM/GC);
/* contornos del Catastro que se cruzan a sí mismos (pinchos de unir parcelas): se quitan los vértices culpables
   para que el tejado y las paredes cierren bien y el edificio no quede hueco */
function segX(a,b,c,d){const d1=(d[0]-c[0])*(a[1]-c[1])-(d[1]-c[1])*(a[0]-c[0]),d2=(d[0]-c[0])*(b[1]-c[1])-(d[1]-c[1])*(b[0]-c[0]),d3=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),d4=(b[0]-a[0])*(d[1]-a[1])-(b[1]-a[1])*(d[0]-a[0]);return((d1>0&&d2<0)||(d1<0&&d2>0))&&((d3>0&&d4<0)||(d3<0&&d4>0))}
function fixPoly(p){let P=[];for(let i=0;i<p.length;i+=2){const q=P[P.length-1];if(!q||Math.hypot(q[0]-p[i],q[1]-p[i+1])>.05)P.push([p[i],p[i+1]])}if(P.length>3&&Math.hypot(P[0][0]-P[P.length-1][0],P[0][1]-P[P.length-1][1])<.05)P.pop();
  for(let it=0;it<40&&P.length>3;it++){let hit=-1;const n=P.length;for(let i=0;i<n&&hit<0;i++)for(let j=i+2;j<n;j++){if(i===0&&j===n-1)continue;if(segX(P[i],P[(i+1)%n],P[j],P[(j+1)%n])){hit=(j-i<n/2)?(i+1)%n:(j+1)%n;break}}if(hit<0)break;P.splice(hit,1)}
  const o=[];for(const q of P)o.push(q[0],q[1]);return o}
function loadBlds(){
  const GR=WD.blds?WD.bgrp||[]:[];WD.blds.forEach((f,fi)=>{const p=fixPoly(dec(f,3));let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,ar=0;const n=p.length/2;
    for(let i=0;i<n;i++){const x=p[i*2],z=p[i*2+1];if(x<x0)x0=x;if(x>x1)x1=x;if(z<z0)z0=z;if(z>z1)z1=z}
    for(let i=0,j=n-1;i<n;j=i++)ar+=p[j*2]*p[i*2+1]-p[i*2]*p[j*2+1];
    const area=Math.abs(ar)/2,kind=f[0];let lv=f[1]||(area<340?2:4);if(kind===0&&!f[1])lv=area<160?1:2;lv=clamp(lv,1,16);
    const h=kind===2?3:kind===6?2.7:3.2+(lv-1)*3;
    const bi=(WD.binfo&&WD.binfo[fi])||0;// datos del Catastro: uso, año de construcción y nº de viviendas
    const b={p,x0,z0,x1,z1,kind,lv,h,area,solid:kind!==6,use:bi?bi[0]:0,year:bi?bi[1]:0,dw:bi?bi[2]:0,idx:fi,seed:GR[fi]>=0?GR[fi]*7919>>>0:(Math.floor(x0*977)+Math.floor(z0*131))>>>0};BL.push(b);
    if(b.solid){const a=clamp(Math.floor(x0/GC),0,GWc-1),c=clamp(Math.floor(x1/GC),0,GWc-1),d=clamp(Math.floor(z0/GC),0,GHc-1),e=clamp(Math.floor(z1/GC),0,GHc-1);
      for(let gy=d;gy<=e;gy++)for(let gx=a;gx<=c;gx++)(GBL[gy*GWc+gx]||(GBL[gy*GWc+gx]=[])).push(b)}})
}
/* mar y muelles: máscara a 2 m */
const SM=2,SW=Math.ceil(WM/SM),SH=Math.ceil(HM/SM);let seaMask=null;
function buildSea(){
  const cv=document.createElement('canvas');cv.width=SW;cv.height=SH;const g=cv.getContext('2d');g.scale(1/(8*SM),1/(8*SM));
  g.fillStyle='#f00';g.beginPath();const s=WD.sea;g.moveTo(s[0],s[1]);for(let i=2;i<s.length;i+=2)g.lineTo(s[i],s[i+1]);g.closePath();g.fill();
  g.globalCompositeOperation='destination-out';g.lineCap='round';g.lineJoin='round';
  for(const r of WD.roads)if(r[0]===9){g.lineWidth=r[1]+10;g.beginPath();g.moveTo(r[5],r[6]);for(let i=7;i<r.length;i+=2)g.lineTo(r[i],r[i+1]);g.stroke()}
  const d=g.getImageData(0,0,SW,SH).data;seaMask=new Uint8Array(SW*SH);for(let i=0;i<seaMask.length;i++)seaMask[i]=d[i*4+3]>128?1:0;
}
const isSea=(x,z)=>{if(x<0||z<0||x>=WM||z>=HM)return true;return seaMask[Math.floor(z/SM)*SW+Math.floor(x/SM)]===1};
function distSeg(x,z,ax,az,bx,bz){const dx=bx-ax,dz=bz-az,L=dx*dx+dz*dz;let t=L?((x-ax)*dx+(z-az)*dz)/L:0;t=t<0?0:t>1?1:t;return Math.hypot(x-ax-dx*t,z-az-dz*t)}
function blockedAt(x,z,r){
  if(x<4||z<4||x>WM-4||z>HM-4)return true;
  if(typeof islandBlocked==='function'&&ISLANDS.length&&islandBlocked(x,z,r))return true;
  if(OBG.size&&obstBlocked(x,z,r))return true;
  if(isSea(x,z)||isSea(x+r,z)||isSea(x-r,z)||isSea(x,z+r)||isSea(x,z-r))return true;
  const l=GBL[Math.floor(z/GC)*GWc+Math.floor(x/GC)];if(!l)return false;
  for(const b of l){if(x<b.x0-r||x>b.x1+r||z<b.z0-r||z>b.z1+r)continue;if(pipf(x,z,b.p))return true;
    const p=b.p;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2)if(distSeg(x,z,p[j],p[j+1],p[i],p[i+1])<r)return true}
  return false}
function wallAt(x,y,z){
  if(y<H(x,z))return true;const l=GBL[Math.floor(z/GC)*GWc+Math.floor(x/GC)];if(!l)return false;
  for(const b of l)if(y<(b.top||b.h)+1&&x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&pipf(x,z,b.p))return true;return false}
function rayDist(ox,oy,oz,dx,dy,dz,max){for(let t=0.3;t<max;t+=0.5)if(wallAt(ox+dx*t,oy+dy*t,oz+dz*t))return t;return max}
function los(a,b,h){const dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||1;return rayDist(a.x,h,a.z,dx/d,0,dz/d,d)>=d-0.5}

/* tramos de calle indexados en rejilla de 64 m */
const GR=64,GRW=Math.ceil(WM/GR),GRH=Math.ceil(HM/GR),GSEG=[];
function buildRoadIdx(){for(const r of WD.roads){const cls=r[0];if(cls>7&&cls!==9)continue;const p=r.slice(5);
  for(let i=0;i<p.length-2;i+=2){const s={ax:p[i]*K,az:p[i+1]*K,bx:p[i+2]*K,bz:p[i+3]*K,w:r[1]*K,cls,ow:r[2],n:(r[3]===null||r[3]===undefined||r[3]<0)?-1:r[3]};
    const a=clamp(Math.floor(Math.min(s.ax,s.bx)/GR),0,GRW-1),b=clamp(Math.floor(Math.max(s.ax,s.bx)/GR),0,GRW-1),c=clamp(Math.floor(Math.min(s.az,s.bz)/GR),0,GRH-1),d=clamp(Math.floor(Math.max(s.az,s.bz)/GR),0,GRH-1);
    for(let gy=c;gy<=d;gy++)for(let gx=a;gx<=b;gx++)(GSEG[gy*GRW+gx]||(GSEG[gy*GRW+gx]=[])).push(s)}}}
function roadNear(x,z,lo,hi,named){let best=null,bd=1e9;const cx=Math.floor(x/GR),cz=Math.floor(z/GR);
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const gx=cx+dx,gz=cz+dz;if(gx<0||gz<0||gx>=GRW||gz>=GRH)continue;const l=GSEG[gz*GRW+gx];if(!l)continue;
    for(const s of l){if(s.cls<lo||s.cls>hi||(named&&s.n<0))continue;const d=distSeg(x,z,s.ax,s.az,s.bx,s.bz)-s.w/2;if(d<bd){bd=d;best=s}}}
  return best?{s:best,d:bd}:null}
function streetName(x,z){const r=roadNear(x,z,0,7,true);return r&&r.d<30?(WD.names[r.s.n]||''):''}

/* ============ SUELO (textura de lejos) ============ */
const TW=4096,TH=Math.round(TW*HM/WM);let groundCv;
/* ortofoto PNOA del IGN (máxima actualidad), mismo encuadre que el mapa: es la base del suelo */
const ORTHO=new Image();const ORTHO_P=new Promise(r=>{ORTHO.onload=()=>r(1);ORTHO.onerror=()=>r(0)});ORTHO.src='__ORTHO__';
function paintGround(){
  const cv=document.createElement('canvas');cv.width=TW;cv.height=TH;groundCv=cv;const g=cv.getContext('2d'),k=TW/WD.W;g.scale(k,k);g.lineJoin='round';g.lineCap='round';
  g.fillStyle='#bba98a';g.fillRect(0,0,WD.W,WD.H);const OR=ORTHO.complete&&ORTHO.naturalWidth>0;
  const path=(f,o)=>{let x=0,y=0;const n=(f.length-o)/2;for(let i=0;i<n;i++){x+=f[o+i*2];y+=f[o+i*2+1];i?g.lineTo(x,y):g.moveTo(x,y)}g.closePath()};
  if(OR){g.drawImage(ORTHO,0,0,WD.W,WD.H);g.globalCompositeOperation='multiply';g.fillStyle='#bdb3a6';g.fillRect(0,0,WD.W,WD.H);g.globalCompositeOperation='saturation';g.fillStyle='hsl(30,32%,50%)';g.globalAlpha=.35;g.fillRect(0,0,WD.W,WD.H);g.globalAlpha=1;g.globalCompositeOperation='source-over'}
  else{const col={0:'#6a9a4c',1:'#4f9a49',2:'#e6d2a2',3:'#585a60',4:'#3f8aa0',5:'#e0e7e9',8:'#b3afa6',9:'#837d70'};
  for(const t of [5,8,0,2,3,1,4,9]){g.fillStyle=col[t];g.beginPath();for(const a of WD.areas)if(a[0]===t)path(a,2);g.fill()}
  parksPaint(g);portPaint(g)}
  g.globalAlpha=OR?.55:1;g.fillStyle='#2a79a0';g.beginPath();const s=WD.sea;g.moveTo(s[0],s[1]);for(let i=2;i<s.length;i+=2)g.lineTo(s[i],s[i+1]);g.closePath();g.fill();
  g.save();g.clip();g.strokeStyle='rgba(120,225,215,.22)';g.lineWidth=170;g.beginPath();const c=WD.coast;g.moveTo(c[0],c[1]);for(let i=2;i<c.length;i+=2)g.lineTo(c[i],c[i+1]);g.stroke();g.lineWidth=70;g.stroke();g.restore();g.globalAlpha=1;
  // sombra de contacto (oclusión ambiental) alrededor de cada edificio
  const BB=WD.blds.filter(b=>b[0]!==2&&b[0]!==6),batch=(L,o,fn)=>{for(let i=0;i<L.length;i+=300){g.beginPath();for(let j=i;j<Math.min(L.length,i+300);j++)path(L[j],o);fn()}};
  if(!OR){g.strokeStyle='#bfbab0';g.fillStyle='#bfbab0';g.lineWidth=56;batch(BB,3,()=>{g.stroke()});
  for(const r of WD.roads)if(r[0]>=1&&r[0]<=4){g.beginPath();g.moveTo(r[5],r[6]);for(let i=7;i<r.length;i+=2)g.lineTo(r[i],r[i+1]);g.lineWidth=r[1]+60;g.strokeStyle='#bfbab0';g.stroke()}}
  g.strokeStyle='rgba(50,40,30,.16)';g.lineWidth=44;batch(BB,3,()=>g.stroke());
  g.fillStyle='#aaa69d';g.strokeStyle='#aaa69d';g.lineWidth=24;batch(BB,3,()=>{g.fill();g.stroke()});
  if(WD.pools){g.fillStyle='#f1ece2';g.strokeStyle='#f1ece2';g.lineWidth=6;batch(WD.pools,0,()=>{g.fill();g.stroke()});g.fillStyle='#45bfd9';batch(WD.pools,0,()=>g.fill())}
  const stroke=(r,w,st)=>{g.beginPath();g.moveTo(r[5],r[6]);for(let i=7;i<r.length;i+=2)g.lineTo(r[i],r[i+1]);g.lineWidth=w;g.strokeStyle=st;g.stroke()};
  const R=WD.roads;
  for(const r of R){if(r[0]===10)stroke(r,r[1],'#e4cf9f');else if(r[0]===8)stroke(r,r[1],'#a88a5c')}
  if(OR)g.globalAlpha=.6;for(const r of R){if(r[0]>=1&&r[0]<=4)stroke(r,r[1]+38,'#c9c5bc');else if(r[0]===5)stroke(r,r[1]+8,'#b3afa6');else if(r[0]===0)stroke(r,r[1]+16,'#8d8a84')}
  g.globalAlpha=1;for(const r of R){if(r[0]===6)stroke(r,r[1],'#c4906e');else if(r[0]===7)stroke(r,r[1],'#cbc7be')}
  for(const cl of [5,4,3,2,1])for(const r of R)if(r[0]===cl)stroke(r,r[1]+4,'#3c3e42');
  for(const r of R)if(r[0]===9)stroke(r,r[1],'#aaa498');
  g.fillStyle='#37b8dc';g.beginPath();for(const a of WD.areas)if(a[0]===6)path(a,2);g.fill();
  const tx=new THREE.CanvasTexture(cv);tx.anisotropy=8;tx.encoding=THREE.sRGBEncoding;return tx;
}
