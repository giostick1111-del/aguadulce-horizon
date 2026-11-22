
/* ============ TRÁFICO: coches que circulan por las calles reales (carril derecho, sentido único, frenan detrás de otros) ============ */
const TRF={on:true,edges:null,pool:[],act:[],spawnT:0};
function buildTraffic(){TRF.on=false;return;const out=new Map();const add=(a,b,hw,cls,ow)=>{if(a===b)return;let l=out.get(a);if(!l)out.set(a,l=[]);if(!l.some(e=>e.to===b))l.push({to:b,hw,cls,ow})};
  for(const r of WD.roads){const cls=r[0];if(cls<1||cls>4)continue;const hw=r[1]*K/2,ow=!!r[2];if(hw<2.4)continue;let prev=-1;
    for(let i=5;i<r.length;i+=2){const n=nodeId(r[i],r[i+1]);if(prev>=0&&prev!==n){add(prev,n,hw,cls,ow);if(!ow)add(n,prev,hw,cls,ow)}prev=n}}
  TRF.edges=out;TRF.starts=[...out.keys()].filter(k=>{const n=GNL[k];return n.x>40&&n.z>40&&n.x<WM-40&&n.z<HM-40&&!isSea(n.x,n.z)});
  const N=UHQ?22:HQ?14:9,types=[0,0,1,1,1,3,3,2,0,1],R=lcg(77);
  for(let i=0;i<N;i++){const c=newCar(types[i%types.length],Math.floor(R()*12));c.m.visible=false;c.traffic=true;TRF.pool.push(c)}}
function trfLane(e){return e.ow?Math.min(e.hw*.45,1.8):clamp(e.hw*.5,1.5,2.1)}
function trfSpawn(c){for(let k=0;k<30;k++){const s=TRF.starts[Math.floor(Math.random()*TRF.starts.length)],n=GNL[s];const d=Math.hypot(n.x-ME.x,n.z-ME.z);if(d<90||d>330)continue;
    // mejor fuera de la vista
    const fx=Math.sin(ME.yaw),fz=Math.cos(ME.yaw);if(((n.x-ME.x)*fx+(n.z-ME.z)*fz)/d>.55&&d<200)continue;
    const es=TRF.edges.get(s);if(!es||!es.length)continue;const e=es[Math.floor(Math.random()*es.length)];
    if(TRF.act.some(o=>o.tr.from===s&&o.tr.e.to===e.to))continue;c.tr={from:s,e,t:0,sp:6,stop:0,lane:trfLane(e)};trfPlace(c,0);c.m.visible=true;TRF.act.push(c);return true}return false}
function trfNext(c){const tr=c.tr,u=tr.e.to,outs=(TRF.edges.get(u)||[]).filter(e=>e.to!==tr.from);const A=GNL[tr.from],B=GNL[u],h0=Math.atan2(B.x-A.x,B.z-A.z);
  let pick=null;if(outs.length){// preferencia por seguir recto, a veces gira
    const w=outs.map(e=>{const C=GNL[e.to];let d=Math.atan2(C.x-B.x,C.z-B.z)-h0;d=Math.abs(Math.atan2(Math.sin(d),Math.cos(d)));return Math.max(.05,Math.cos(d)+1)*(e.cls<=2?1.6:1)});
    let s=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<outs.length;i++){s-=w[i];if(s<=0){pick=outs[i];break}}pick=pick||outs[0]}
  else{const back=(TRF.edges.get(u)||[]).find(e=>e.to===tr.from);if(!back)return false;pick=back}
  tr.from=u;tr.e=pick;tr.t=0;return true}
function trfPlace(c,dt){const tr=c.tr,A=GNL[tr.from],B=GNL[tr.e.to],L=Math.hypot(B.x-A.x,B.z-A.z)||1,dx=(B.x-A.x)/L,dz=(B.z-A.z)/L;tr.L=L;
  tr.lane+=(trfLane(tr.e)-tr.lane)*Math.min(1,dt*2);const t=clamp(tr.t,0,L),x=A.x+dx*t-dz*tr.lane,z=A.z+dz*t+dx*tr.lane;
  if(dt>0){c.vx=(x-c.x)/dt;c.vz=(z-c.z)/dt}c.x=x;c.z=z;const yaw=Math.atan2(dx,dz);let dy=yaw-c.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));c.yaw=dt>0?c.yaw+dy*Math.min(1,dt*5):yaw;c.steer=clamp(dy*2,-.5,.5);
  c.y=surfaceY(c.x,c.z);const Lc=CARS[c.t].L*.42;c.pitch=Math.atan2(H(c.x+Math.sin(c.yaw)*Lc,c.z+Math.cos(c.yaw)*Lc)-H(c.x-Math.sin(c.yaw)*Lc,c.z-Math.cos(c.yaw)*Lc),2*Lc);c.roll=0;c.vf=tr.sp}
function updateTraffic(dt){if(!TRF.edges)return;const hide=!TRF.on||!!RACE;
  for(let i=TRF.act.length-1;i>=0;i--){const c=TRF.act[i];if(hide||Math.hypot(c.x-ME.x,c.z-ME.z)>380){c.m.visible=false;c.tr=null;TRF.act.splice(i,1)}}
  if(hide)return;TRF.spawnT-=dt;if(TRF.spawnT<=0){TRF.spawnT=.35;const free=TRF.pool.find(c=>!c.tr);if(free)trfSpawn(free)}
  const others=[ME,...OTHER.filter(o=>!o.traffic)];if(FOOT.on)others.push({x:FOOT.x,z:FOOT.z});
  for(const c of TRF.act){const tr=c.tr,e=tr.e,fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);
    let vt=[0,20,16,13,10][e.cls]||10;if(e.hw<3)vt*=.75;
    // frena antes de los cruces cerrados
    const rem=tr.L-tr.t;if(rem<25){const outs=TRF.edges.get(e.to)||[];if(outs.length!==1||rem<8){const C=outs[0]&&GNL[outs[0].to],B=GNL[e.to];let turn=1;if(C){let d=Math.atan2(C.x-B.x,C.z-B.z)-Math.atan2(fx,fz);turn=Math.abs(Math.atan2(Math.sin(d),Math.cos(d)))}vt=Math.min(vt,turn>.5?6+rem*.4:vt)}}
    // distancia de seguridad con quien vaya delante (tráfico, tú u otros jugadores)
    let gap=99;for(const o of others.concat(TRF.act)){if(o===c)continue;const ox=o.x-c.x,oz=o.z-c.z,f=ox*fx+oz*fz;if(f<=0||f>30)continue;const lat=Math.abs(ox*fz-oz*fx);if(lat<2.3)gap=Math.min(gap,f)}
    if(gap<30)vt=Math.min(vt,Math.max(0,(gap-6)*.9));
    if(Math.hypot(ME.x-c.x,ME.z-c.z)<3.2){tr.stop=2}if(FOOT.on&&!FOOT.dead){const d=Math.hypot(FOOT.x-c.x,FOOT.z-c.z);if(d<1.7&&tr.sp>4){hurtMe(tr.sp*6,'Un coche');tr.stop=3}else if(d<5)tr.stop=Math.max(tr.stop,1)}if(tr.stop>0){tr.stop-=dt;vt=0}
    const a=vt>tr.sp?3.2:-9;tr.sp=clamp(tr.sp+a*dt,0,Math.max(vt,tr.sp>vt?tr.sp-9*dt:vt));
    tr.t+=tr.sp*dt;if(tr.t>=tr.L){tr.t-=tr.L;if(!trfNext(c)){c.m.visible=false;c.tr=null;continue}}
    trfPlace(c,dt);poseCar(c,dt);carLights(c,vt<tr.sp-1);OTHER.push(c)}
  for(let i=TRF.act.length-1;i>=0;i--)if(!TRF.act[i].tr)TRF.act.splice(i,1)}

/* ============ DETALLES DE CALLE Y AZOTEAS ============ */
const CONTS=[];function buildStreetDetail(){const R=lcg(4711);
  // contenedores de basura y reciclaje (gris/verde, amarillo, azul, iglú verde) en el carril de aparcamiento
  const EXG=new Set();for(const ev of EVENTS){for(let d=0;d<=ev.path.len;d+=4){const p=pathAt(ev.path,d);EXG.add(Math.floor(p.z/6)*2000+Math.floor(p.x/6))}}
  const nearEv=(x,z)=>{const gx=Math.floor(x/6),gz=Math.floor(z/6);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(EXG.has((gz+a)*2000+gx+b))return true;return false};
  const JG=new Map();for(const n of GNL)if(n.e.length>2){const k=Math.floor(n.z/30)*1000+Math.floor(n.x/30);(JG.get(k)||JG.set(k,[]).get(k)).push(n)}
  const nearJ=(x,z,r)=>{const gx=Math.floor(x/30),gz=Math.floor(z/30);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=JG.get((gz+a)*1000+gx+b);if(l)for(const n of l)if(Math.hypot(n.x-x,n.z-z)<r)return true}return false};
  const RG=new Map();for(const rp of ROADPATHS){if(rp.cls>7)continue;const P=rp.P;for(let i=0;i<P.length-2;i+=2){const k=Math.floor(P[i+1]/40)*1000+Math.floor(P[i]/40);(RG.get(k)||RG.set(k,[]).get(k)).push([P[i],P[i+1],P[i+2],P[i+3],rp.hw])}}
  const roadClear=(x,z,m)=>{const gx=Math.floor(x/40),gz=Math.floor(z/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=RG.get((gz+a)*1000+gx+b);if(l)for(const s of l)if(distSeg(x,z,s[0],s[1],s[2],s[3])-s[4]<m)return false}return true};
  const cont=[],cc=[];const CC=['#4d5a4f','#f2c318','#1f5fa8','#3b7a3a'];
  for(const rp of ROADPATHS){const {P,hw,cls,ow}=rp;if(rp.rb||cls<3||cls>4||hw<3.5)continue;const n=P.length/2;let acc=0,next=60+R()*80;const s=ow?1:-1;
    for(let i=0;i<n-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);if(L<.3)continue;const dx=(bx-ax)/L,dz=(bz-az)/L,nx=-dz*s,nz=dx*s;
      if(acc+L>=next){const t=next-acc,o=hw+.85,x=ax+dx*t+nx*o,z=az+dz*t+nz*o;next+=110+R()*120;
        if(!nearEv(x,z)&&!nearJ(x,z,hw+16)&&[-2.4,-.8,.8,2.4].every(u=>roadClear(x+dx*u,z+dz*u,.7))&&!blockedAt(x-dx*2.6,z-dz*2.6,1)&&!blockedAt(x+dx*2.6,z+dz*2.6,1)){const yaw=Math.atan2(nx,nz);
          for(let k=0;k<4;k++){const u=(k-1.5)*1.55,px=x+dx*u,pz=z+dz*u;cont.push([px,H(px,pz),pz,yaw+(R()-.5)*.1,1,1,1]);cc.push(new THREE.Color(CC[k]))}
          obstAdd(x-dx*3.2,z-dz*3.2,x+dx*3.2,z+dz*3.2,.6);CONTS.push([x,z])}}
      acc+=L}}
  // puntos de reciclaje reales de OpenStreetMap: se colocan en la acera más cercana, fuera de la calzada
  for(const [px,pz] of (WD.recyc||[])){let best=null;for(const rp of ROADPATHS){if(rp.cls>5)continue;const P=rp.P;for(let i=0;i<P.length-2;i+=2){const d=distSeg(px,pz,P[i],P[i+1],P[i+2],P[i+3]);if(!best||d<best.d)best={d,i,rp}}}
    if(!best||best.d>30)continue;const P=best.rp.P,i=best.i,L=Math.hypot(P[i+2]-P[i],P[i+3]-P[i+1])||1,dx=(P[i+2]-P[i])/L,dz=(P[i+3]-P[i+1])/L;let nx=-dz,nz=dx;if((px-P[i])*nx+(pz-P[i+1])*nz<0){nx=-nx;nz=-nz}
    const t=clamp((px-P[i])*dx+(pz-P[i+1])*dz,0,L),o=best.rp.hw+.85,x=P[i]+dx*t+nx*o,z=P[i+1]+dz*t+nz*o;if(![-2.4,-.8,.8,2.4].every(u=>roadClear(x+dx*u,z+dz*u,.5)))continue;const yaw=Math.atan2(nx,nz);
    for(let k=0;k<4;k++){const u=(k-1.5)*1.55,qx=x+dx*u,qz=z+dz*u;cont.push([qx,H(qx,qz),qz,yaw,1,1,1]);cc.push(new THREE.Color(CC[k]))}obstAdd(x-dx*3.2,z-dz*3.2,x+dx*3.2,z+dz*3.2,.6);CONTS.push([x,z])}
  const cg=mergeParts([[boxG(1.35,1.2,1.1),0,.72,0,0,0,0,1,1,1,'#ffffff'],[boxG(1.42,.1,1.18),0,1.37,-.02,-.12,0,0,1,1,1,'#ffffff'],[cylG(.09,.09,.08,8),.55,.1,.45,0,0,Math.PI/2,1,1,1,'#222222'],[cylG(.09,.09,.08,8),-.55,.1,.45,0,0,Math.PI/2,1,1,1,'#222222'],[boxG(1.2,.04,.04),0,1.15,.57,0,0,0,1,1,1,'#bbbbbb']]);
  instanced(cg,new THREE.MeshLambertMaterial({vertexColors:true}),cont,cc);
  // azoteas: depósitos de agua, aires acondicionados, antenas y placas solares
  const tanks=[],acs=[],ants=[],sol=[];
  for(const f of FACX){const b=f.b;if(f.house||b.area<70||!b.p)continue;const k=Math.min(6,Math.floor(b.area/90)+1);
    for(let j=0;j<k;j++){for(let tries=0;tries<8;tries++){const x=b.x0+1.5+R()*(b.x1-b.x0-3),z=b.z0+1.5+R()*(b.z1-b.z0-3);if(!pipf(x,z,b.p)||!pipf(x+1.2,z,b.p)||!pipf(x-1.2,z,b.p)||!pipf(x,z+1.2,b.p)||!pipf(x,z-1.2,b.p))continue;
      const y=f.top,r=R(),yaw=R()*TAU;if(r<.38)acs.push([x,y,z,yaw,1,1,1]);else if(r<.66)tanks.push([x,y,z,yaw,.8+R()*.4]);else if(r<.82)ants.push([x,y,z,yaw,.8+R()*.6]);else sol.push([x,y,z,Math.round(yaw/(Math.PI/2))*Math.PI/2,1]);break}}}
  const vc=()=>new THREE.MeshLambertMaterial({vertexColors:true});
  instanced(mergeParts([[cylG(.55,.55,1.1,12),0,.95,0,0,0,0,1,1,1,'#f2f2ee'],[cylG(.58,.58,.08,12),0,1.52,0,0,0,0,1,1,1,'#dcdcd6'],[boxG(.12,.4,.12),.4,.2,.4,0,0,0,1,1,1,'#9a9a96'],[boxG(.12,.4,.12),-.4,.2,-.4,0,0,0,1,1,1,'#9a9a96'],[boxG(.12,.4,.12),.4,.2,-.4,0,0,0,1,1,1,'#9a9a96'],[boxG(.12,.4,.12),-.4,.2,.4,0,0,0,1,1,1,'#9a9a96']]),vc(),tanks);
  instanced(mergeParts([[boxG(.85,.6,.32),0,.35,0,0,0,0,1,1,1,'#e3e5e5'],[cylG(.2,.2,.04,10),.18,.35,.17,Math.PI/2,0,0,1,1,1,'#7b7f82']]),vc(),acs);
  instanced(mergeParts([[cylG(.025,.025,2.4,4),0,1.2,0,0,0,0,1,1,1,'#b9bcbf'],[boxG(1.1,.03,.03),0,2.1,0,0,0,0,1,1,1,'#b9bcbf'],[boxG(.8,.03,.03),0,1.8,0,0,0,0,1,1,1,'#b9bcbf'],[new THREE.SphereGeometry(.32,8,6,0,TAU,0,Math.PI/2),.0,1.0,.3,-1.2,0,0,1,1,1,'#eeeeee']]),vc(),ants);
  instanced(mergeParts([[boxG(1.7,.05,1.05),0,.55,0,-.55,0,0,1,1,1,'#1d2c4a'],[boxG(.06,.5,.06),.75,.25,.35,0,0,0,1,1,1,'#999999'],[boxG(.06,.5,.06),-.75,.25,.35,0,0,0,1,1,1,'#999999']]),new THREE.MeshStandardMaterial({vertexColors:true,metalness:.6,roughness:.25,envMap}),sol);
  return{cont:cont.length/4,tanks:tanks.length,acs:acs.length,ants:ants.length,sol:sol.length}}

/* ============ PANTALLA COMPLETA EN EL MÓVIL ============ */
const isIOS=/iP(hone|od|ad)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
const isStandalone=()=>matchMedia('(display-mode: fullscreen)').matches||matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
function goFull(){const d=document.documentElement,fs=document.fullscreenElement||document.webkitFullscreenElement;if(fs||isStandalone())return;
  const rq=d.requestFullscreen||d.webkitRequestFullscreen;if(!rq)return;try{const p=rq.call(d,{navigationUI:'hide'});const lock=()=>{try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock('landscape').catch(()=>{})}catch(e){}};if(p&&p.then)p.then(lock).catch(()=>{});else lock()}catch(e){}}
function initFull(){if(!IS_TOUCH)return;let last=0;
  // cada toque en el juego vuelve a pantalla completa si se ha salido (el navegador solo lo permite tras un toque)
  document.addEventListener('touchend',()=>{const now=performance.now();if(now-last>1500&&!CHAT.open){last=now;goFull()}},{passive:true});
  if(isIOS&&!isStandalone()&&!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen)){let seen=false;try{seen=localStorage.getItem('fhIosTip')==='1'}catch(e){}
    if(!seen){setTimeout(()=>{feed('📱 En iPhone: pulsa Compartir ⬆️ → «Añadir a pantalla de inicio» y abre el juego desde ese icono: se verá a pantalla completa, sin barra');try{localStorage.setItem('fhIosTip','1')}catch(e){}},4000)}}}
