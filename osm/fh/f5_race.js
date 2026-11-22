
/* ============ GRAFO DE CALLES Y RUTAS REALES ============ */
const GN=new Map(),GNL=[];// nodos
function nodeId(x,y){const k=x+','+y;let n=GN.get(k);if(n===undefined){n=GNL.length;GN.set(k,n);GNL.push({x:x*K,z:y*K,e:[]})}return n}
function buildGraph(){for(const r of WD.roads){if(r[0]>5)continue;let prev=-1;for(let i=5;i<r.length;i+=2){const n=nodeId(r[i],r[i+1]);if(prev>=0&&prev!==n){const a=GNL[prev],b=GNL[n],d=Math.hypot(a.x-b.x,a.z-b.z),w=d*([.8,.85,.9,1,1.8,3][r[0]]||3)*(r[1]*K<6?1.4:1);a.e.push([n,w]);b.e.push([prev,w])}prev=n}}}
function nearestNode(x,z){let b=-1,bd=1e18;for(let i=0;i<GNL.length;i++){const n=GNL[i];if(!n.e.length)continue;const d=(n.x-x)**2+(n.z-z)**2;if(d<bd){bd=d;b=i}}return b}
function astar(s,t){const N=GNL.length,g=new Float64Array(N).fill(Infinity),from=new Int32Array(N).fill(-1),T=GNL[t];g[s]=0;const heap=[[Math.hypot(GNL[s].x-T.x,GNL[s].z-T.z),s]];const done=new Uint8Array(N);
  const push=it=>{heap.push(it);let i=heap.length-1;while(i>0){const p=(i-1)>>1;if(heap[p][0]<=heap[i][0])break;[heap[p],heap[i]]=[heap[i],heap[p]];i=p}};
  const pop=()=>{const top=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let i=0;for(;;){const l=i*2+1,r=l+1;let m=i;if(l<heap.length&&heap[l][0]<heap[m][0])m=l;if(r<heap.length&&heap[r][0]<heap[m][0])m=r;if(m===i)break;[heap[m],heap[i]]=[heap[i],heap[m]];i=m}}return top};
  while(heap.length){const [,u]=pop();if(done[u])continue;done[u]=1;if(u===t)break;for(const [v,w] of GNL[u].e){const ng=g[u]+w;if(ng<g[v]){g[v]=ng;from[v]=u;push([ng+Math.hypot(GNL[v].x-T.x,GNL[v].z-T.z),v])}}}
  if(from[t]<0&&s!==t)return null;const path=[];for(let u=t;u>=0;u=from[u]){path.push(u);if(u===s)break}return path.reverse()}
function namedPts(name){const idx=WD.names.indexOf(name),o=[];for(const r of WD.roads)if(r[3]===idx)for(let i=5;i<r.length;i+=2){const x=r[i]*K,z=r[i+1]*K;if(x>120&&z>120&&x<WM-120&&z<HM-120&&!isSea(x,z))o.push([x,z])}return o}
function extremes(pts){let best=[pts[0],pts[0]],bd=0;const s=pts.length>400?Math.ceil(pts.length/400):1;for(let i=0;i<pts.length;i+=s)for(let j=i+1;j<pts.length;j+=s){const d=(pts[i][0]-pts[j][0])**2+(pts[i][1]-pts[j][1])**2;if(d>bd){bd=d;best=[pts[i],pts[j]]}}return best}
function routeThrough(wps,loop){const P=[];const ids=wps.map(w=>nearestNode(w[0],w[1]));const legs=loop?[...ids,ids[0]]:ids;const seq=[];
  for(let i=0;i<legs.length-1;i++){const p=astar(legs[i],legs[i+1]);if(!p)return null;for(let k=(i?1:0);k<p.length;k++){const n=p[k];/* quita idas y vueltas (calles sin salida) */if(seq.length>=2&&seq[seq.length-2]===n){seq.pop();continue}seq.push(n)}}
  for(const n of seq)P.push(GNL[n].x,GNL[n].z);
  return finalizePath(densify(P,4))}
function finalizePath(P){const n=P.length/2,s=new Float32Array(n);for(let i=1;i<n;i++)s[i]=s[i-1]+Math.hypot(P[i*2]-P[i*2-2],P[i*2+1]-P[i*2-1]);
  // radio de curva para la IA
  const R=new Float32Array(n).fill(999);for(let i=3;i<n-3;i++){const ax=P[i*2-6],az=P[i*2-5],bx=P[i*2],bz=P[i*2+1],cx=P[i*2+6],cz=P[i*2+7];const a=Math.hypot(bx-ax,bz-az),b=Math.hypot(cx-bx,cz-bz),c=Math.hypot(cx-ax,cz-az);const ar=Math.abs((bx-ax)*(cz-az)-(bz-az)*(cx-ax))/2;R[i]=ar>1e-3?(a*b*c)/(4*ar):999}
  return{P,s,R,len:s[n-1],n}}
function pathAt(path,d){const s=path.s,n=path.n;d=clamp(d,0,path.len);let lo=0,hi=n-1;while(hi-lo>1){const m=(lo+hi)>>1;if(s[m]<=d)lo=m;else hi=m}const k=(d-s[lo])/((s[hi]-s[lo])||1),P=path.P;
  const x=P[lo*2]+(P[hi*2]-P[lo*2])*k,z=P[lo*2+1]+(P[hi*2+1]-P[lo*2+1])*k;return{x,z,yaw:Math.atan2(P[hi*2]-P[lo*2],P[hi*2+1]-P[lo*2+1]),i:lo,R:path.R[lo]}}
function projectOnPath(path,x,z,hint,win){const P=path.P;let best=hint||0,bd=1e18;const a=Math.max(0,(hint||0)-(win||40)),b=Math.min(path.n-1,(hint||0)+(win||120));for(let i=a;i<=b;i++){const d=(P[i*2]-x)**2+(P[i*2+1]-z)**2;if(d<bd){bd=d;best=i}}return{i:best,d:path.s[best],off:Math.sqrt(bd)}}

/* ============ EVENTOS (carreras por calles reales de Aguadulce) ============ */
const EVENTS=[];
function defineEvents(){
  const ev=(id,name,desc,build,laps)=>{try{const path=build();if(path&&path.len>300)EVENTS.push({id,name,desc,path,laps:laps||1,cps:makeCPs(path)})}catch(e){console.warn('evento',id,e)}};
  ev('paseo','Sprint del Paseo Marítimo','Toda la primera línea de playa, de punta a punta.',()=>{const e=extremes(namedPts('Paseo Marítimo de Aguadulce'));return routeThrough(e,false)});
  ev('parador','Subida al Parador','Desde la playa, cuesta arriba hasta lo alto de la Avenida del Parador.',()=>{const e=extremes(namedPts('Avenida del Parador'));const [a,b]=H(e[0][0],e[0][1])<H(e[1][0],e[1][1])?e:[e[1],e[0]];const pm=namedPts('Paseo Marítimo de Aguadulce');const s0=pm.reduce((q,v)=>((v[0]-a[0])**2+(v[1]-a[1])**2<(q[0]-a[0])**2+(q[1]-a[1])**2?v:q),pm[0]);return routeThrough([s0,a,b],false)});
  ev('alicun','Bajada de Alicún','De lo alto de la Carretera de Alicún hasta el paseo, cuesta abajo.',()=>{const e=extremes(namedPts('Carretera de Alicún'));const [a,b]=H(e[0][0],e[0][1])>H(e[1][0],e[1][1])?e:[e[1],e[0]];const pm=namedPts('Paseo Marítimo de Aguadulce');const s1=pm.reduce((q,v)=>((v[0]-b[0])**2+(v[1]-b[1])**2<(q[0]-b[0])**2+(q[1]-b[1])**2?v:q),pm[0]);return routeThrough([a,b,s1],false)});
  ev('carlos3','Circuito Carlos III','Avenida de Carlos III y vuelta por el Paseo Marítimo.',()=>{const p=extremes(namedPts('Paseo Marítimo de Aguadulce')),c=namedPts('Avenida de Carlos III');
    const near=q=>c.reduce((b,v)=>((v[0]-q[0])**2+(v[1]-q[1])**2<(b[0]-q[0])**2+(b[1]-q[1])**2?v:b),c[0]);return routeThrough([p[0],p[1],near(p[1]),near(p[0])],true)},2);
  ev('autovia','A fondo por la A-7','Autovía del Mediterráneo: velocidad punta.',()=>{const e=extremes(namedPts('Autovía del Mediterráneo'));return routeThrough(e,false)});
}
function makeCPs(path){const o=[];const step=150;for(let d=step;d<path.len-40;d+=step)o.push(d);o.push(path.len);return o}

/* ============ PUNTOS DE INICIO DE EVENTOS, LÍNEA DE CARRERA, PUERTAS ============ */
let EVMARK=[];
function buildEventMarkers(){for(const e of EVENTS){const p=pathAt(e.path,0),y=H(p.x,p.z);const g=new THREE.Group();g.position.set(p.x,y,p.z);
  const ring=new THREE.Mesh(new THREE.RingGeometry(6.5,7.5,40),new THREE.MeshBasicMaterial({color:0xff2d95,transparent:true,opacity:.75,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.3;ring.renderOrder=7;g.add(ring);
  const col=new THREE.Mesh(new THREE.CylinderGeometry(7,7,40,32,1,true),new THREE.MeshBasicMaterial({color:0xff2d95,transparent:true,opacity:.12,side:THREE.DoubleSide,depthWrite:false}));col.position.y=20;g.add(col);
  const sp=bigSprite('🏁 '+e.name,'#ffffff','#ff2d95');sp.position.y=9;g.add(sp);scene.add(g);EVMARK.push({e,g,x:p.x,z:p.z})}}
function bigSprite(txt,fg,bg){const c=cvs(1024,128),g=c.getContext('2d');g.font='800 64px system-ui,Arial';const w=Math.min(1000,g.measureText(txt).width+60);g.fillStyle=bg||'rgba(0,0,0,.6)';g.fillRect((1024-w)/2,8,w,112);g.fillStyle=fg||'#fff';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,512,66);
  const s=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(c),depthTest:false,transparent:true,fog:false}));s.scale.set(16,2,1);s.renderOrder=9;return s}
let LINE=null,GATES=[];
function chevronTex(){const c=cvs(64,128),g=c.getContext('2d');g.clearRect(0,0,64,128);g.fillStyle='rgba(60,170,255,.85)';for(const y of [8,72]){g.beginPath();g.moveTo(4,y+40);g.lineTo(32,y);g.lineTo(60,y+40);g.lineTo(60,y+52);g.lineTo(32,y+16);g.lineTo(4,y+52);g.closePath();g.fill()}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t}
let CHEV=null;
function showRaceLine(path){clearRaceLine();CHEV=CHEV||chevronTex();const rb=RB();ribbon(rb,path.P,1.1,0,2.2,4.5,false);for(let i=0;i<rb.u.length;i+=2)rb.u[i]+=.5;
  LINE=rbMesh(rb,new THREE.MeshBasicMaterial({map:CHEV,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6,fog:true}),.1,8)}
function clearRaceLine(){if(LINE){scene.remove(LINE);LINE.geometry.dispose();LINE=null}for(const g of GATES)scene.remove(g);GATES=[]}
function gate(path,d,fin){const p=pathAt(path,d),y=H(p.x,p.z),g=new THREE.Group();g.position.set(p.x,y,p.z);g.rotation.y=p.yaw;
  const col=fin?0xffffff:0x3cb4ff,m=new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.85});
  for(const s of [-1,1]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,6,8),m);post.position.set(s*7,3,0);g.add(post)}
  const ban=new THREE.Mesh(new THREE.BoxGeometry(14.4,.9,.15),new THREE.MeshBasicMaterial({color:fin?0x111111:0x0b5fa8}));ban.position.y=6;g.add(ban);
  const sp=bigSprite(fin?'META':'CONTROL','#fff',fin?'#111':'#0b5fa8');sp.scale.set(8,1,1);sp.position.y=6.9;g.add(sp);scene.add(g);return g}

/* ============ IA (rivales cuando corres solo) ============ */
const AINAMES=['Pepe "El Rayo"','La Loli','Manolo GT','Curro Turbo','Antoñito'];
function mkAI(i,ev){const c=newCar([0,1,2,4][i%4],(i*3+2)%PAINT.length);c.ai={s:0,lane:(i%2?1:-1)*1.6,skill:.9+Math.random()*.12,name:AINAMES[i%AINAMES.length],lap:0,done:false};return c}
function stepAI(c,dt,R){const ai=c.ai,ev=R.ev,path=ev.path,T=CARS[c.t];if(ai.done){c.vf*=.97}else{
  let vt=T.vmax*ai.skill;for(let k=10;k<=90;k+=20){const p=pathAt(path,ai.s+k);vt=Math.min(vt,Math.sqrt(8.5*Math.max(6,p.R))+k*.18)}
  // ajuste de goma para que la carrera sea reñida
  const gap=(R.prog(ME)-R.progAI(c));vt*=clamp(1+gap/900,.85,1.12);
  const a=vt>c.vf?T.acc*.9:-14;c.vf=clamp(c.vf+a*dt,0,vt+2);ai.s+=c.vf*dt;
  if(ai.s>=path.len){if(ev.laps>1&&ai.lap<ev.laps-1){ai.lap++;ai.s-=path.len}else{ai.s=path.len;ai.done=true;R.aiFinish(c)}}}
  const p=pathAt(path,ai.s),nx=Math.cos(p.yaw),nz=-Math.sin(p.yaw);ai.lane+=(Math.sin(time*.3+c.ci)*1.6-ai.lane)*dt*.2;
  const tx=p.x+nx*ai.lane,tz=p.z+nz*ai.lane;c.vx=(tx-c.x)/Math.max(dt,1e-3);c.vz=(tz-c.z)/Math.max(dt,1e-3);c.x=tx;c.z=tz;let dy=p.yaw-c.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));c.steer=clamp(dy*3,-.5,.5);c.yaw+=dy*Math.min(1,dt*8);
  c.y=surfaceY(c.x,c.z);const L=T.L*.42;c.pitch=Math.atan2(H(c.x+Math.sin(c.yaw)*L,c.z+Math.cos(c.yaw)*L)-H(c.x-Math.sin(c.yaw)*L,c.z-Math.cos(c.yaw)*L),2*L);c.roll=0}

/* ============ GESTIÓN DE LA CARRERA ============ */
let RACE=null;
function startRace(ev,opts){window.__sr=(window.__sr||0)+1;// opts: {online:bool, grid:int, rid, others:[]}
  if(RACE)endRace(true);const R={ev,t:-3.5,cp:0,lap:0,done:false,ai:[],hint:0,finishT:0,res:[],online:!!(opts&&opts.online),rid:opts&&opts.rid,grid:(opts&&opts.grid)||0};
  // parrilla de salida
  const slot=k=>{const p0=pathAt(ev.path,10),rn=roadNear(p0.x,p0.z,0,7,false),hw=rn?rn.s.w/2:3,wide=hw>=2.6,d=wide?Math.max(0,16-Math.floor(k/2)*8):Math.max(0,28-k*7),p=pathAt(ev.path,d),nx=Math.cos(p.yaw),nz=-Math.sin(p.yaw),o=wide?(k%2?1:-1)*Math.min(hw-1.1,2.2):0;return{x:p.x+nx*o,z:p.z+nz*o,yaw:p.yaw}};
  const s0=slot(R.grid);Object.assign(ME,{x:s0.x,z:s0.z,yaw:s0.yaw,vx:0,vz:0,vf:0,vy:0,y:surfaceY(s0.x,s0.z),onGround:true,nos:1});
  if(!R.online){for(let i=0;i<3;i++){const c=mkAI(i,ev),s=slot(i+1);Object.assign(c,{x:s.x,z:s.z,yaw:s.yaw,y:surfaceY(s.x,s.z)});c.ai.s=projectOnPath(ev.path,s.x,s.z,0,40).d;R.ai.push(c)}}
  R.prog=c=>(R.lap*ev.path.len)+projectOnPath(ev.path,c.x,c.z,R.hint,60).d;
  R.progAI=c=>c.ai.lap*ev.path.len+c.ai.s;
  R.aiFinish=c=>{R.res.push({name:c.ai.name,t:R.t,ai:true})};
  showRaceLine(ev.path);R.gates=[];refreshGates(R);RACE=R;$('raceBox').hidden=false;$('evPrompt').hidden=true;beep(440,.2);return R}
function refreshGates(R){for(const g of GATES)scene.remove(g);GATES=[];const ev=R.ev;for(let k=R.cp;k<Math.min(ev.cps.length,R.cp+2);k++)GATES.push(gate(ev.path,ev.cps[k],k===ev.cps.length-1&&R.lap>=ev.laps-1))}
function updateRace(dt){const R=RACE;if(!R)return;const ev=R.ev;const prevT=R.t;R.t+=dt;
  if(prevT<0){const a=Math.ceil(-prevT),b=Math.ceil(-R.t);if(b!==a&&a<=3&&a>=1){bigMsg(String(a),'#fff');beep(520,.18)}if(R.t>=0&&prevT<0){bigMsg('¡YA!','#5dffb0');beep(880,.35)}}
  for(const c of R.ai){if(R.t>0)stepAI(c,dt,R);poseCar(c,dt)}
  if(R.done||R.t<0)return;
  const pr=projectOnPath(ev.path,ME.x,ME.z,R.hint,80);R.hint=pr.i;
  const target=ev.cps[R.cp],gp=pathAt(ev.path,target);if(Math.hypot(ME.x-gp.x,ME.z-gp.z)<16||(pr.d>target&&pr.off<20)){
    R.cp++;beep(1200,.08,.08);
    if(R.cp>=ev.cps.length){if(R.lap<ev.laps-1){R.lap++;R.cp=0;R.hint=0;bigMsg('VUELTA '+(R.lap+1)+'/'+ev.laps,'#3cb4ff')}else{finishRace();return}}
    refreshGates(R)}
  R.myProg=R.lap*ev.path.len+pr.d}
function racePosition(){const R=RACE;if(!R)return[1,1];const me=R.lap*R.ev.path.len+projectOnPath(R.ev.path,ME.x,ME.z,R.hint,60).d;let pos=1,tot=1;
  for(const c of R.ai){tot++;if(R.progAI(c)>me)pos++}
  if(R.online)for(const id in remotes){const r=remotes[id];if(r.rid!==R.rid)continue;tot++;if((r.rp||0)>me||(r.ft&&!R.done))pos++}
  return[pos,tot]}
function finishRace(){const R=RACE;R.done=true;R.finishT=R.t;const [pos]=racePosition();R.res.push({name:S.nick,t:R.t,me:true});
  bigMsg(pos===1?'¡VICTORIA!':pos+'º PUESTO','#ffdf3d');beep(990,.4);const k='best_'+R.ev.id;const best=S[k];if(!best||R.t<best){S[k]=R.t;save();feed('⭐ Nuevo récord personal: '+fmtT(R.t))}
  addXP(pos===1?600:pos===2?350:200,'CARRERA');netRaceResult(R);setTimeout(()=>{if(RACE===R)showResults(R)},2500)}
function endRace(silent){const R=RACE;if(!R)return;for(const c of R.ai)scene.remove(c.m);clearRaceLine();RACE=null;$('raceBox').hidden=true;if(!silent)toast('Carrera abandonada')}
function fmtT(t){const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2)}
function resetToTrack(){if(RACE){const p=pathAt(RACE.ev.path,Math.max(0,projectOnPath(RACE.ev.path,ME.x,ME.z,RACE.hint,80).d-10));Object.assign(ME,{x:p.x,z:p.z,yaw:p.yaw,vx:0,vz:0,vf:0,y:surfaceY(p.x,p.z)+.3,onGround:true})}
  else{const rn=roadNear(ME.x,ME.z,0,5,false);if(rn){const s=rn.s,L=Math.hypot(s.bx-s.ax,s.bz-s.az)||1,t=clamp(((ME.x-s.ax)*(s.bx-s.ax)+(ME.z-s.az)*(s.bz-s.az))/(L*L),0,1);const x=s.ax+(s.bx-s.ax)*t,z=s.az+(s.bz-s.az)*t;Object.assign(ME,{x,z,yaw:Math.atan2(s.bx-s.ax,s.bz-s.az),vx:0,vz:0,vf:0,y:surfaceY(x,z)+.3})}}}

/* ============ RADARES DE VELOCIDAD Y PUNTOS (XP) ============ */
const TRAPS=[];
function buildTraps(){const add=(name,label)=>{const pts=namedPts(name);if(pts.length<4)return;const e=extremes(pts),mx=(e[0][0]+e[1][0])/2,mz=(e[0][1]+e[1][1])/2;const p=pts.reduce((b,v)=>((v[0]-mx)**2+(v[1]-mz)**2<(b[0]-mx)**2+(b[1]-mz)**2?v:b),pts[0]);
  const g=new THREE.Group();g.position.set(p[0],H(p[0],p[1]),p[1]);const post=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,5,8),new THREE.MeshLambertMaterial({color:0x333333}));post.position.y=2.5;g.add(post);
  const box=new THREE.Mesh(new THREE.BoxGeometry(.6,.6,.5),new THREE.MeshLambertMaterial({color:0xffcc00}));box.position.y=5;g.add(box);const sp=bigSprite('📸 RADAR '+label,'#111','#ffcc00');sp.scale.set(9,1.1,1);sp.position.y=6.4;g.add(sp);scene.add(g);TRAPS.push({x:p[0],z:p[1],name:label,cool:0})};
  add('Avenida de Carlos III','CARLOS III');add('Paseo Marítimo de Aguadulce','PASEO');add('Autovía del Mediterráneo','A-7');add('Avenida del Parador','PARADOR')}
function updateTraps(dt){for(const t of TRAPS){t.cool-=dt;if(t.cool>0)continue;if(Math.hypot(ME.x-t.x,ME.z-t.z)<9){t.cool=5;const kmh=Math.round(Math.abs(ME.vf)*3.6);const k='trap_'+t.name,best=S[k]||0;bigMsg('📸 '+kmh+' km/h','#ffcc00');if(kmh>best){S[k]=kmh;save();feed('📸 Récord en radar '+t.name+': '+kmh+' km/h')}addXP(Math.round(kmh*1.5),'RADAR');netStats()}}}
let xpT=0;
function addXP(n,why){S.xp=(S.xp||0)+n;const e=$('xp');e.textContent=`+${n} ${why}`;e.classList.add('show');clearTimeout(xpT);xpT=setTimeout(()=>e.classList.remove('show'),1400);save()}
