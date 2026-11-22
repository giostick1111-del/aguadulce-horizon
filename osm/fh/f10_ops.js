
/* ============ OPERACIONES: shooter táctico en tercera persona (estilo SOCOM) por las calles de Aguadulce ============
   A pie: posturas (de pie / agachado / cuerpo a tierra), retícula que se cierra al quedarse quieto, sin regeneración de vida,
   disparos a la cabeza, granadas, misiones de Supresión / Extracción / Demolición contra insurgentes, y PvP online. */
/* ---- modelos ---- */
function opRifle(){const g=new THREE.Group(),B=0x1b1d1f,T=0x6b5d45;
  g.add(mesh(boxG(.05,.075,.32),B,0,.05,.08),mesh(boxG(.045,.03,.3),0x24272a,0,.1,.08),mesh(cylG(.012,.012,.36,8),0x111213,0,.062,.42,{rx:Math.PI/2}),
    mesh(boxG(.06,.06,.22),T,0,.06,.33),mesh(boxG(.04,.04,.06),0x0b0b0b,0,.135,.1),mesh(cylG(.018,.018,.07,8),0x0b0b0b,0,.135,.06,{rx:Math.PI/2}),
    mesh(boxG(.045,.07,.2),B,0,.04,-.17),mesh(boxG(.05,.11,.05),B,0,.01,-.27),mesh(boxG(.034,.13,.05),B,0,-.04,.02,{rx:.25}),mesh(boxG(.03,.09,.04),B,0,-.02,-.06,{rx:.3}),
    mesh(cylG(.02,.02,.06,8),0x0b0b0b,0,.062,.62,{rx:Math.PI/2}));
  const mz=new THREE.Object3D();mz.position.set(0,.062,.66);g.add(mz);g.userData.mz=mz;return g}
function opPistol(){const g=new THREE.Group();g.add(mesh(boxG(.03,.035,.19),0x1c1d1f,0,.055,.045),mesh(boxG(.029,.105,.048),0x111112,0,-.03,-.012,{rx:.26}));const mz=new THREE.Object3D();mz.position.set(0,.055,.15);g.add(mz);g.userData.mz=mz;return g}
const OPW=[{n:'Pistola M9',dmg:34,rate:.22,mag:15,res:45,auto:false,spread:.012,rt:1.3,kick:.02,snd:0},{n:'Carabina M4',dmg:30,rate:.085,mag:30,res:150,auto:true,spread:.02,rt:2.1,kick:.016,snd:1}];
const SOLDIER={seal:{shirt:0x5d6046,pants:0x5a5b45,skin:0xc9956a,vest:0x3f4231,helm:0x4b4d39,glove:0x2a2a26,shoes:0x2a241d},
  ins:{shirt:0x3a3530,pants:0x2d2d33,skin:0xb58456,vest:0x2b2a26,mask:0x8b2a2a,glove:0x1e1e1e,shoes:0x1e1a16},
  red:{shirt:0x6b3a32,pants:0x3b3b3b,skin:0xc9956a,vest:0x4a2a26,helm:0x5a2e28,glove:0x2a2a26,shoes:0x2a241d},
  hostage:{shirt:0xe8e2d4,pants:0x2f4f7a,skin:0xd9a46c,glove:0xd9a46c,shoes:0x6b4a2e}};
function opHuman(o){const g=new THREE.Group(),p={};const hips=new THREE.Group();hips.position.y=1.0;g.add(hips);p.hips=hips;
  hips.add(mesh(cylG(.15,.14,.2,10),o.pants,0,0,0,{sz:.68}),mesh(cylG(.155,.155,.05,10),0x1d1d1a,0,.08,0,{sz:.72}));
  const leg=x=>{const hp=new THREE.Group();hp.position.set(x,-.05,0);hips.add(hp);hp.add(mesh(cylG(.085,.068,.44,8),o.pants,0,-.22,0),mesh(boxG(.05,.1,.12),0x2b2b26,x>0?.07:-.07,-.2,0));
    const kn=new THREE.Group();kn.position.y=-.44;hp.add(kn);kn.add(mesh(cylG(.066,.052,.42,8),o.pants,0,-.21,0));if(o.vest)kn.add(mesh(boxG(.1,.1,.05),0x22231f,0,-.02,.06));
    const ft=new THREE.Group();ft.position.y=-.43;kn.add(ft);ft.add(mesh(boxG(.11,.1,.26),o.shoes,0,-.01,.045));return{hp,kn,ft}};
  p.L=leg(.095);p.R=leg(-.095);const sp=new THREE.Group();sp.position.y=.08;hips.add(sp);p.spine=sp;
  sp.add(mesh(cylG(.2,.155,.5,12),o.shirt,0,.25,0,{sz:.62}),mesh(sphG(.072,8,6),o.shirt,.2,.45,0),mesh(sphG(.072,8,6),o.shirt,-.2,.45,0),mesh(cylG(.05,.056,.09,8),o.skin,0,.55,0));
  if(o.vest){sp.add(mesh(boxG(.4,.4,.3),o.vest,0,.27,0));for(let i=0;i<3;i++)sp.add(mesh(boxG(.09,.12,.06),o.vest,-.12+i*.12,.17,.17));sp.add(mesh(boxG(.12,.12,.05),0x24251f,.13,.34,-.17),mesh(cylG(.012,.012,.25,4),0x111111,-.12,.62,-.1))}
  const head=new THREE.Group();head.position.y=.6;sp.add(head);p.head=head;
  head.add(mesh(sphG(.115,12,10),o.skin,0,.11,0,{sx:.9,sy:1.12}),mesh(sphG(.014,6,5),0x1a1a1a,.038,.125,.095),mesh(sphG(.014,6,5),0x1a1a1a,-.038,.125,.095));
  if(o.helm){head.add(mesh(new THREE.SphereGeometry(.135,12,8,0,TAU,0,Math.PI*.55),o.helm,0,.12,-.005,{sx:.98,sy:1.02}),mesh(boxG(.1,.05,.04),0x111111,0,.23,.09),mesh(boxG(.17,.03,.012),0x0d0d0d,0,.125,.11));
    head.add(mesh(boxG(.05,.08,.06),0x22231f,.13,.1,0))}
  if(o.mask){head.add(mesh(new THREE.SphereGeometry(.124,12,10,0,TAU,0,Math.PI*.62),o.mask,0,.12,0,{sx:.94,sy:1.1}),mesh(boxG(.2,.09,.03),o.mask,0,.05,.09))}
  const arm=x=>{const sh=new THREE.Group();sh.position.set(x,.45,0);sh.rotation.order='YXZ';sp.add(sh);sh.add(mesh(cylG(.062,.055,.15,8),o.shirt,0,-.07,0),mesh(cylG(.05,.046,.16,8),o.shirt,0,-.21,0));
    const el=new THREE.Group();el.position.y=-.29;sh.add(el);el.add(mesh(cylG(.045,.037,.25,8),o.shirt,0,-.125,0),mesh(boxG(.065,.09,.04),o.glove,0,-.29,0));return{sh,el}};
  p.aL=arm(.23);p.aR=arm(-.23);const aim=new THREE.Group();aim.position.y=.45;sp.add(aim);p.aim=aim;
  p.guns=[opPistol(),opRifle()];p.guns[0].position.set(-.04,-.03,.47);p.guns[1].position.set(-.13,-.035,.2);aim.add(p.guns[0],p.guns[1]);p.guns[0].visible=false;
  if(!HQ){const b=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.1),new THREE.MeshBasicMaterial({map:TX.blob,transparent:true,depthWrite:false}));b.rotation.x=-Math.PI/2;b.position.y=.08;b.renderOrder=6;g.add(b)}
  if(HQ)g.traverse(o=>{if(o.isMesh)o.castShadow=true});g.userData=p;return g}
function opArmIK(a,sx,tx,ty,tz){const vx=tx-sx,vy=ty-.45,vz=tz,d=clamp(Math.hypot(vx,vy,vz),.12,.585);const yaw=Math.atan2(vx,vz),pit=Math.atan2(-vy,Math.hypot(vx,vz));
  const al=Math.acos(clamp((.0841+d*d-.09)/(2*.29*d),-1,1)),be=Math.PI-Math.acos(clamp((.0841+.09-d*d)/(.174),-1,1));a.sh.rotation.set(-Math.PI/2+pit+al*.9,yaw,0);a.el.rotation.x=-be}
const OPGRIP=[[[-.04,-.07,.47],[.0,-.075,.45]],[[-.13,-.07,.2],[-.13,-.0,.51]]];
/* postura: 0 de pie, 1 agachado, 2 cuerpo a tierra; hands: 'gun' | 'up' (rehén) | 'dead' */
function opPose(h,t,spd,pitch,wi,stance,kick,mode){pitch=-pitch;const p=h.userData,a=clamp(spd/4.5,0,1),run=spd>5.2,s=Math.sin(t),c=Math.cos(t),A=(run?.8:.55)*a;
  h.rotation.x=0;p.hips.rotation.x=0;p.spine.rotation.x=0;
  if(mode==='dead'){p.hips.position.y=.18;h.rotation.x=0;p.hips.rotation.x=-1.5;p.L.hp.rotation.x=p.R.hp.rotation.x=0;p.L.kn.rotation.x=p.R.kn.rotation.x=.1;p.aim.rotation.x=0;return}
  if(stance===2){// cuerpo a tierra: tumbado boca abajo apoyado en los codos
    p.hips.position.y=.2;p.hips.rotation.x=1.45;p.spine.rotation.x=-.25;p.L.hp.rotation.x=.12+s*.25*a;p.R.hp.rotation.x=.12-s*.25*a;p.L.kn.rotation.x=.15;p.R.kn.rotation.x=.15;p.L.ft.rotation.x=p.R.ft.rotation.x=.9;
    p.head.rotation.x=-1.1+pitch*.5;const ap=-1.2+pitch;p.aim.rotation.x=ap}
  else{const cr=stance===1;p.L.hp.rotation.x=-s*A-(cr?1.1:0);p.R.hp.rotation.x=s*A-(cr?.5:0);
    p.L.kn.rotation.x=(.08+Math.max(0,c)*(run?1.4:.9))*a+(cr?1.6:0);p.R.kn.rotation.x=(.08+Math.max(0,-c)*(run?1.4:.9))*a+(cr?1.9:0);p.L.ft.rotation.x=-p.L.kn.rotation.x*.3;p.R.ft.rotation.x=-p.R.kn.rotation.x*.3+(cr?.5:0);
    p.hips.position.y=(cr?.58:1.0)-Math.abs(c)*.035*a;p.hips.rotation.y=s*.08*a;p.spine.rotation.y=-s*.1*a;p.spine.rotation.x=run?.15:cr?.18:.04;p.head.rotation.x=pitch*.55;p.aim.rotation.x=pitch-p.spine.rotation.x}
  p.guns[0].visible=wi===0&&mode!=='up';p.guns[1].visible=wi===1&&mode!=='up';
  if(mode==='up'){p.aR.sh.rotation.set(-2.9,0,.3);p.aR.el.rotation.x=-.6;p.aL.sh.rotation.set(-2.9,0,-.3);p.aL.el.rotation.x=-.6;return}
  const ap=p.aim.rotation.x;p.aim.position.z=-(kick||0)*3;const cp=Math.cos(ap),sp=Math.sin(ap),G=OPGRIP[wi]||OPGRIP[1],kz=-(kick||0)*3;
  const tf=q=>[q[0],.45+q[1]*cp-(q[2]+kz)*sp,q[1]*sp+(q[2]+kz)*cp];const r=tf(G[0]),l=tf(G[1]);opArmIK(p.aR,-.23,r[0],r[1],r[2]);opArmIK(p.aL,.23,l[0],l[1],l[2])}

/* ---- sonidos de armas ---- */
function gunSound(kind,vol,dist){if(!AC||vol<.01)return;const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=kind===2?500:(dist>60?900:kind?2600:3400);
  const g=AC.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+(kind===2?.9:kind?.22:.16));s.connect(f);f.connect(g);g.connect(MASTER);s.start(t,Math.random());s.stop(t+1);
  const o=AC.createOscillator(),og=AC.createGain();o.frequency.setValueAtTime(kind===2?70:140,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);og.gain.setValueAtTime(vol*.9,t);og.gain.exponentialRampToValueAtTime(.001,t+.15);o.connect(og);og.connect(MASTER);o.start(t);o.stop(t+.2)}
function clickSound(){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type='square';o.frequency.value=1800;g.gain.setValueAtTime(.05,t);g.gain.exponentialRampToValueAtTime(.001,t+.03);o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+.04)}

/* ---- efectos ---- */
const OPFX=[];
function tracer(ax,ay,az,bx,by,bz,col){const g=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(ax,ay,az),new THREE.Vector3(bx,by,bz)]);const l=new THREE.Line(g,new THREE.LineBasicMaterial({color:col||0xffe9a8,transparent:true,opacity:.85}));scene.add(l);OPFX.push({o:l,t:.06})}
function mflash(x,y,z){const m=new THREE.Mesh(sphG(.12,6,5),new THREE.MeshBasicMaterial({color:0xffd27a}));m.position.set(x,y,z);scene.add(m);OPFX.push({o:m,t:.04})}
function impact(x,y,z,blood){for(let i=0;i<(blood?4:3);i++){const m=new THREE.Mesh(sphG(blood?.06:.05,4,3),new THREE.MeshBasicMaterial({color:blood?0x8a0f0f:0xbdb4a6}));m.position.set(x,y,z);m.userData.v=[rnd(-1.5,1.5),rnd(.5,2.5),rnd(-1.5,1.5)];scene.add(m);OPFX.push({o:m,t:.35,v:m.userData.v})}}
function updateOpFx(dt){for(let i=OPFX.length-1;i>=0;i--){const f=OPFX[i];f.t-=dt;if(f.v){f.o.position.x+=f.v[0]*dt;f.o.position.y+=f.v[1]*dt;f.o.position.z+=f.v[2]*dt;f.v[1]-=9*dt}if(f.t<=0){scene.remove(f.o);if(f.o.geometry&&f.o.isLine)f.o.geometry.dispose();OPFX.splice(i,1)}}}

/* ---- estado del soldado ---- */
const FOOT={on:false,x:0,z:0,y:0,yaw:0,pitch:0,stance:0,hp:100,wi:1,mag:[15,30],res:[45,150],rel:0,fire:0,bloom:0,aim:false,dead:false,gren:3,t:0,spd:0,kick:0,m:null,lock:false,trig:false,shot:0,camD:2.6};
const OPS={m:null,enemies:[],hostage:null,obj:null,t:0,beacons:[],gren:[],marks:[]};
function footHeight(){return[1.55,1.05,.38][FOOT.stance]}
function canExit(){return Math.abs(ME.vf)<3}
function exitCar(){if(FOOT.on)return;if(RACE){toast('Acaba la carrera primero');return}if(!canExit()){toast('Frena para bajarte');return}
  const rx=Math.cos(ME.yaw),rz=-Math.sin(ME.yaw);let p=null;for(const s of [1,-1,2,-2]){const x=ME.x+rx*s*1.9,z=ME.z+rz*s*1.9;if(!blockedAt(x,z,.35)){p=[x,z];break}}if(!p)p=freeSpot(ME.x,ME.z,.4);
  FOOT.on=true;FOOT.x=p[0];FOOT.z=p[1];FOOT.y=H(p[0],p[1]);FOOT.yaw=ME.yaw;FOOT.pitch=0;FOOT.stance=0;FOOT.dead=false;if(!FOOT.m){let h=0;for(const ch of S.nick||'')h=(h*31+ch.charCodeAt(0))>>>0;FOOT.m=opHuman({style:h});scene.add(FOOT.m)}FOOT.m.visible=true;
  ME.vx=ME.vz=ME.vf=0;document.body.classList.add('onfoot');footUI();if(!IS_TOUCH)feed('🎯 A pie: clic para apuntar con el ratón · WASD mover · Shift correr · C agacharse · Z cuerpo a tierra · R recargar · 1/2 armas · G granada · F subir al coche')}
function enterCar(){if(!FOOT.on)return;if(Math.hypot(FOOT.x-ME.x,FOOT.z-ME.z)>4){toast('Acércate a tu coche');return}FOOT.on=false;FOOT.m.visible=false;document.body.classList.remove('onfoot');if(document.pointerLockElement)document.exitPointerLock();footUI()}
function toggleFoot(){if(FOOT.on)enterCar();else exitCar()}
function footUI(){$('footUI').hidden=!(FOOT.on&&IS_TOUCH);$('touch').classList.toggle('hideCar',FOOT.on);$('opsHud').hidden=!FOOT.on;$('reticle').hidden=!FOOT.on}
/* ---- daño al jugador ---- */
function hurtMe(d,who){if(FOOT.dead||!FOOT.on)return;FOOT.hp=Math.max(0,FOOT.hp-d);$('flash').style.background='rgba(200,0,0,.35)';setTimeout(()=>$('flash').style.background='',140);shakeT=Math.max(shakeT,.15);
  if(FOOT.hp<=0){FOOT.dead=true;FOOT.deadT=4;bigMsg('HAS CAÍDO','#ff5a5a');feed('☠️ '+(who?who+' te ha abatido':'Has caído'));if(OPS.m)opsEnd(false,'Has caído en combate')}}
/* ---- disparos: rayo desde la cámara a través de la retícula ---- */
const _ov=new THREE.Vector3(),_od=new THREE.Vector3();
function raySphere(ox,oy,oz,dx,dy,dz,cx,cy,cz,r){const lx=cx-ox,ly=cy-oy,lz=cz-oz,t=lx*dx+ly*dy+lz*dz;if(t<0)return -1;const d2=lx*lx+ly*ly+lz*lz-t*t;if(d2>r*r)return -1;return t-Math.sqrt(r*r-d2)}
function bodySpheres(x,y,z,st,yaw){if(st===2){const fx=Math.sin(yaw),fz=Math.cos(yaw);return[[x+fx*.95,y+.32,z+fz*.95,.15,3],[x+fx*.45,y+.25,z+fz*.45,.27,1],[x-fx*.2,y+.2,z-fz*.2,.25,.8],[x-fx*.75,y+.15,z-fz*.75,.22,.6]]}
  const h=st===1?.62:1;return[[x,y+1.62*h+(st===1?.1:0),z,.15,3],[x,y+1.25*h,z,.28,1],[x,y+.85*h,z,.25,.9],[x,y+.45*h,z,.22,.6]]}
function fireShot(){const w=OPW[FOOT.wi];if(FOOT.rel>0||FOOT.fire>0||FOOT.dead)return;if(FOOT.mag[FOOT.wi]<=0){clickSound();FOOT.fire=.25;if(FOOT.res[FOOT.wi]>0)reloadW();return}
  FOOT.mag[FOOT.wi]--;FOOT.fire=w.rate;FOOT.kick=w.kick;FOOT.shot++;const spr=curSpread();
  camera.getWorldDirection(_od);const ox=camera.position.x,oy=camera.position.y,oz=camera.position.z;// dispersión
  const up=new THREE.Vector3(0,1,0),rt=new THREE.Vector3().crossVectors(_od,up).normalize(),u2=new THREE.Vector3().crossVectors(rt,_od);const a=Math.random()*TAU,r=Math.sqrt(Math.random())*spr;
  _od.addScaledVector(rt,Math.cos(a)*r).addScaledVector(u2,Math.sin(a)*r).normalize();
  let best=140,hit=null;// edificios
  for(let t=.6;t<140;t+=.35){if(wallAt(ox+_od.x*t,oy+_od.y*t,oz+_od.z*t)){best=t;break}if(oy+_od.y*t<H(ox+_od.x*t,oz+_od.z*t)-.05){best=t;break}}
  const targets=[];for(const e of OPS.enemies)if(!e.dead)targets.push({e,sp:bodySpheres(e.x,e.y,e.z,e.stance,e.yaw)});
  for(const id in remotes){const r=remotes[id];if(r.fo&&r.c.m.visible===false&&r.sol&&r.sol.visible&&!r.dead)targets.push({r,id,sp:bodySpheres(r.c.x,r.c.y,r.c.z,r.st||0,r.c.yaw)})}
  if(OPS.hostage&&!OPS.hostage.dead)targets.push({h:OPS.hostage,sp:bodySpheres(OPS.hostage.x,OPS.hostage.y,OPS.hostage.z,OPS.hostage.kneel?1:0,0)});
  for(const T of targets)for(const s of T.sp){const tt=raySphere(ox,oy,oz,_od.x,_od.y,_od.z,s[0],s[1],s[2],s[3]);if(tt>0&&tt<best){best=tt;hit={T,mul:s[4]}}}
  const P=FOOT.m.userData.guns[FOOT.wi].userData.mz;FOOT.m.updateMatrixWorld(true);P.getWorldPosition(_ov);
  const ex=ox+_od.x*best,ey=oy+_od.y*best,ez=oz+_od.z*best;tracer(_ov.x,_ov.y,_ov.z,ex,ey,ez);mflash(_ov.x,_ov.y,_ov.z);gunSound(w.snd,.55,0);
  if(hit){const dmg=w.dmg*hit.mul;impact(ex,ey,ez,true);if(hit.T.e)dmgEnemy(hit.T.e,dmg,hit.mul>=3);else if(hit.T.h){hit.T.h.hp-=dmg;if(hit.T.h.hp<=0){hit.T.h.dead=true;opsEnd(false,'Has herido de muerte al rehén')}}
    else if(hit.T.r){hitMarker(hit.mul>=3);if(net.on)net.R.push(net.ref('hit/'+hit.T.id),{f:UID,n:S.nick,d:Math.round(dmg),t:serverNow()}).catch(()=>{})}}
  else impact(ex,ey,ez,false);
  FOOT.bloom=Math.min(1,FOOT.bloom+(FOOT.wi?.22:.3));opsAlert(FOOT.x,FOOT.z,90)}
function curSpread(){const w=OPW[FOOT.wi],mv=clamp(FOOT.spd/4,0,1.5);const st=[1,.62,.4][FOOT.stance];return(w.spread+mv*.05+FOOT.bloom*.06)*st*(FOOT.aim?.55:1)}
function reloadW(){const w=OPW[FOOT.wi];if(FOOT.rel>0||FOOT.mag[FOOT.wi]>=w.mag||FOOT.res[FOOT.wi]<=0)return;FOOT.rel=w.rt;clickSound()}
function hitMarker(head){const e=$('reticle');e.classList.add(head?'hs':'hm');setTimeout(()=>e.classList.remove('hs','hm'),140);beep(head?1600:1200,.04,.05)}
/* ---- granadas ---- */
function throwGren(){if(FOOT.gren<=0||FOOT.dead)return;FOOT.gren--;camera.getWorldDirection(_od);const m=new THREE.Mesh(sphG(.07,8,6),M(0x3b4a2a));const y=FOOT.y+footHeight();m.position.set(FOOT.x+_od.x*.6,y,FOOT.z+_od.z*.6);scene.add(m);
  OPS.gren.push({m,v:[_od.x*15,_od.y*15+4.5,_od.z*15],t:2.6,mine:true})}
function updateGren(dt){for(let i=OPS.gren.length-1;i>=0;i--){const g=OPS.gren[i],p=g.m.position;g.v[1]-=14*dt;const nx=p.x+g.v[0]*dt,nz=p.z+g.v[2]*dt;if(blockedAt(nx,nz,.1)){g.v[0]*=-.4;g.v[2]*=-.4}else{p.x=nx;p.z=nz}p.y+=g.v[1]*dt;const gy=H(p.x,p.z)+.07;if(p.y<gy){p.y=gy;g.v[1]*=-.35;g.v[0]*=.6;g.v[2]*=.6}
    g.t-=dt;if(g.t<=0){explode(p.x,p.y,p.z,g.mine);scene.remove(g.m);OPS.gren.splice(i,1)}}}
function explode(x,y,z,mine){gunSound(2,.9,0);shakeT=Math.max(shakeT,Math.max(0,.5-Math.hypot(x-FOOT.x,z-FOOT.z)/60));
  const m=new THREE.Mesh(sphG(1,12,8),new THREE.MeshBasicMaterial({color:0xffb347,transparent:true,opacity:.9}));m.position.set(x,y+.5,z);scene.add(m);OPFX.push({o:m,t:.25});
  for(let i=0;i<10;i++)impact(x,y+.3,z,false);
  for(const e of OPS.enemies){if(e.dead)continue;const d=Math.hypot(e.x-x,e.z-z);if(d<7)dmgEnemy(e,(1-d/7)*160,false)}
  if(FOOT.on){const d=Math.hypot(FOOT.x-x,FOOT.z-z);if(d<7)hurtMe((1-d/7)*120*(FOOT.stance===2?.6:1),'Tu propia granada')}
  if(OPS.hostage&&!OPS.hostage.dead&&Math.hypot(OPS.hostage.x-x,OPS.hostage.z-z)<6){OPS.hostage.dead=true;opsEnd(false,'El rehén ha muerto en la explosión')}
  opsAlert(x,z,140)}
/* ---- movimiento a pie ---- */
const look={dx:0,dy:0};const fin={mx:0,mz:0,fire:false,aim:false,run:false};
function updateFoot(dt){const F=FOOT;if(F.dead){F.deadT-=dt;opPose(F.m,F.t,0,0,F.wi,0,0,'dead');F.m.position.set(F.x,F.y,F.z);if(F.deadT<=0){F.dead=false;F.hp=100;F.mag=[15,30];F.res=[45,150];F.gren=3;const s=freeSpot(ME.x+Math.cos(ME.yaw)*2,ME.z-Math.sin(ME.yaw)*2,.4);F.x=s[0];F.z=s[1];F.stance=0;feed('🔁 Vuelves junto a tu coche')}return}
  // mirar
  const sens=(S.set&&S.set.msens)||1;F.yaw-=look.dx*.0026*sens*(F.aim?.55:1);F.pitch=clamp(F.pitch-look.dy*.0022*sens*(F.aim?.55:1),-1.05,.9);look.dx=look.dy=0;
  const gp=navigator.getGamepads?[...navigator.getGamepads()].find(Boolean):null;
  let mx=(keys.KeyD?1:0)-(keys.KeyA?1:0),mz=(keys.KeyW?1:0)-(keys.KeyS?1:0);if(fin.mx||fin.mz){mx=fin.mx;mz=fin.mz}
  if(gp){const ax=gp.axes,dz=v=>Math.abs(v)>.15?v:0;if(dz(ax[0])||dz(ax[1])){mx=dz(ax[0]);mz=-dz(ax[1])}F.yaw-=dz(ax[2]||0)*dt*2.6;F.pitch=clamp(F.pitch-dz(ax[3]||0)*dt*2,-1.05,.9);
    const fire=gp.buttons[7]&&gp.buttons[7].value>.4;if(fire)fireIfAuto();F.aim=!!(gp.buttons[6]&&gp.buttons[6].value>.4)||fin.aim;}
  const run=(keys.ShiftLeft||fin.run)&&mz>0&&F.stance===0&&!F.aim;
  const sp=[run?6.4:(F.aim?2.4:4.2),2.0,.9][F.stance],L=Math.hypot(mx,mz);let vx=0,vz=0;if(L>.05){const k=Math.min(1,L)/L;const fx=Math.sin(F.yaw),fz=Math.cos(F.yaw),rx=-Math.cos(F.yaw),rz=Math.sin(F.yaw);vx=(fx*mz+rx*mx)*k*sp;vz=(fz*mz+rz*mx)*k*sp}
  const nx=F.x+vx*dt,nz=F.z+vz*dt;if(!blockedAt(nx,F.z,.32)&&!isSea(nx,F.z))F.x=nx;if(!blockedAt(F.x,nz,.32)&&!isSea(F.x,nz))F.z=nz;
  // no atravesar el coche propio ni otros
  for(const o of [ME,...OTHER]){if(!o.m.visible)continue;const dx=F.x-o.x,dz=F.z-o.z,d=Math.hypot(dx,dz);if(d<1.6&&d>.01){F.x=o.x+dx/d*1.6;F.z=o.z+dz/d*1.6}}
  F.y=GH(F.x,F.z,F.y)+.03;F.spd=Math.hypot(vx,vz);F.t+=dt*(run?11:F.stance===2?4:8)*clamp(F.spd/3,0,1.3);
  F.bloom=Math.max(0,F.bloom-dt*(F.stance===2?2.2:1.5));F.kick=Math.max(0,F.kick-dt*.12);if(F.fire>0)F.fire-=dt;
  if(F.rel>0){F.rel-=dt;if(F.rel<=0){const w=OPW[F.wi],need=w.mag-F.mag[F.wi],take=Math.min(need,F.res[F.wi]);F.mag[F.wi]+=take;F.res[F.wi]-=take}}
  if((keys.Mouse0||fin.fire)&&!$('menu').hidden===false)fireIfAuto();
  F.m.position.set(F.x,F.y,F.z);F.m.rotation.y=F.yaw;F.m.userData.aiming=F.aim||F.fire>-.6||!!keys.Mouse0||fin.fire;opPose(F.m,F.t,F.spd,F.pitch,F.wi,F.stance,F.kick)}
function fireIfAuto(){const w=OPW[FOOT.wi];if(w.auto||!FOOT.trig){fireShot()}FOOT.trig=true}
/* ---- cámara al hombro ---- */
function updateFootCamera(dt){const F=FOOT,hh=footHeight(),fx=Math.sin(F.yaw),fz=Math.cos(F.yaw),rx=-Math.cos(F.yaw),rz=Math.sin(F.yaw);
  const D=F.aim?1.25:2.7,side=F.aim?.55:.62,cp=Math.cos(F.pitch),spp=Math.sin(F.pitch);const hx=F.x+rx*side,hz=F.z+rz*side,hy=F.y+hh+.15;
  let d=D;const rd=rayDist(hx,hy,hz,-fx*cp,-spp,-fz*cp,D+.3);// evita meter la cámara en las paredes
  d=Math.min(D,Math.max(.35,rd-.3));F.camD+=(d-F.camD)*Math.min(1,dt*12);if(d<F.camD)F.camD=d;
  camera.position.set(hx-fx*cp*F.camD,hy-spp*F.camD,hz-fz*cp*F.camD);camera.position.y=Math.max(camera.position.y,H(camera.position.x,camera.position.z)+.25);
  camera.lookAt(hx+fx*cp*30,hy+spp*30,hz+fz*cp*30);const fov=F.aim?(F.wi?42:52):66;if(Math.abs(camera.fov-fov)>.1){camera.fov+=(fov-camera.fov)*Math.min(1,dt*10);camera.updateProjectionMatrix()}
  if(shakeT>0){shakeT-=dt;camera.position.x+=rnd(-.1,.1)*shakeT*3;camera.position.y+=rnd(-.1,.1)*shakeT*3}
  sunFollow(F.x,F.y,F.z);skyMesh.position.copy(camera.position);
  // retícula dinámica (se abre al moverse y disparar, se cierra quieto, agachado o tumbado)
  const px=Math.round(curSpread()*innerHeight/(2*Math.tan(camera.fov*Math.PI/360))),r=$('reticle');r.style.setProperty('--sp',(6+px)+'px');
  let onE=false;camera.getWorldDirection(_od);for(const e of OPS.enemies){if(e.dead)continue;for(const s of bodySpheres(e.x,e.y,e.z,e.stance,e.yaw))if(raySphere(camera.position.x,camera.position.y,camera.position.z,_od.x,_od.y,_od.z,s[0],s[1],s[2],s[3])>0)onE=true}
  r.classList.toggle('enemy',onE)}

/* ============ ENEMIGOS (insurgentes) ============ */
function spawnEnemy(x,z,post,acc){let s=freeSpot(x,z,.45);for(let k=0;k<20&&isSea(s[0],s[1]);k++){const a=Math.random()*TAU;s=freeSpot(x+Math.cos(a)*(6+k*3),z+Math.sin(a)*(6+k*3),.45)}const e={x:s[0],z:s[1],y:H(s[0],s[1]),yaw:Math.random()*TAU,hp:100,stance:0,state:'patrol',px:post[0],pz:post[1],tx:s[0],tz:s[1],wait:Math.random()*3,cd:1+Math.random(),burst:0,t:0,acc:acc||.5,m:opHuman(SOLDIER.ins),lastSeen:0,reac:.6+Math.random()*.6,dead:false,dt:0};
  e.m.userData.guns[1].visible=true;scene.add(e.m);OPS.enemies.push(e);return e}
function opsAlert(x,z,r){for(const e of OPS.enemies)if(!e.dead&&e.state==='patrol'&&Math.hypot(e.x-x,e.z-z)<r){e.state='alert';e.tx=x+rnd(-8,8);e.tz=z+rnd(-8,8);e.reac=Math.max(.35,e.reac*.7)}}
function dmgEnemy(e,d,head){if(e.dead)return;e.hp-=d;hitMarker(head);if(e.state==='patrol'){e.state='combat';e.reac=.3}
  if(e.hp<=0){e.dead=true;e.dt=8;addXP(head?60:40,head?'Disparo a la cabeza':'Enemigo abatido');feed(head?'🎯 Disparo a la cabeza':'✔ Enemigo abatido');if(OPS.m)opsCheck()}}
function updateEnemies(dt){const F=FOOT,ph=F.on&&!F.dead;for(const e of OPS.enemies){if(e.dead){e.dt-=dt;opPose(e.m,0,0,0,1,0,0,'dead');e.m.position.set(e.x,e.y,e.z);continue}
    const dx=F.x-e.x,dz=F.z-e.z,dist=Math.hypot(dx,dz);let sees=false;
    if(ph&&dist<70){const fwd=Math.sin(e.yaw)*dx/dist+Math.cos(e.yaw)*dz/dist;const vis=F.stance===2?.55:F.stance===1?.8:1;if((e.state!=='patrol'||fwd>-.2)&&dist<70*vis){e.losT=(e.losT||0)-dt;if(e.losT<=0){e.losT=.25;e.los=los(e,F,1.4)}sees=e.los}}
    if(sees){e.lastSeen=time;if(e.state==='patrol'){e.state='alert';e.react=e.reac}else if(e.state==='alert'){e.react-=dt;if(e.react<=0)e.state='combat'}}
    let mv=0;
    if(e.state==='patrol'){e.wait-=dt;if(e.wait<=0){if(Math.hypot(e.tx-e.x,e.tz-e.z)<1){const a=Math.random()*TAU,r=Math.random()*14;e.tx=e.px+Math.cos(a)*r;e.tz=e.pz+Math.sin(a)*r;e.wait=2+Math.random()*4}else mv=1.3}}
    else if(e.state==='alert'){if(!sees){if(Math.hypot(e.tx-e.x,e.tz-e.z)>1.5)mv=3.2}e.stance=0}
    else{// combate: se agacha, dispara ráfagas, cambia de posición a veces
      const want=Math.atan2(dx,dz);let dy=want-e.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));e.yaw+=dy*Math.min(1,dt*6);
      if(sees){e.stance=dist>25?1:0;e.cd-=dt;if(e.cd<=0&&Math.abs(dy)<.3){if(e.burst<=0)e.burst=2+Math.floor(Math.random()*4);e.burst--;e.cd=e.burst>0?.12:.9+Math.random()*1.2;enemyShoot(e,dist)}}
      else{e.stance=0;if(time-e.lastSeen>4){e.tx=F.x+rnd(-5,5);e.tz=F.z+rnd(-5,5)}if(Math.hypot(e.tx-e.x,e.tz-e.z)>2)mv=3.4;if(time-e.lastSeen>25)e.state='alert'}
      if(sees&&Math.random()<dt*.15){const a=e.yaw+Math.PI/2*(Math.random()<.5?1:-1);e.tx=e.x+Math.sin(a)*5;e.tz=e.z+Math.cos(a)*5;e.stance=0}
      if(sees&&Math.hypot(e.tx-e.x,e.tz-e.z)>1&&e.stance===0)mv=2.4}
    if(mv>0){const ddx=e.tx-e.x,ddz=e.tz-e.z,L=Math.hypot(ddx,ddz)||1;if(e.state!=='combat'||!sees)e.yaw=Math.atan2(ddx,ddz)*.2+e.yaw*.8+(Math.abs(Math.atan2(ddx,ddz)-e.yaw)>Math.PI?0:0);
      const nx=e.x+ddx/L*mv*dt,nz=e.z+ddz/L*mv*dt;if(!blockedAt(nx,nz,.35)&&!isSea(nx,nz)){e.x=nx;e.z=nz}else{e.tx=e.x+rnd(-6,6);e.tz=e.z+rnd(-6,6)}
      if(e.state!=='combat'){let dyy=Math.atan2(ddx,ddz)-e.yaw;dyy=Math.atan2(Math.sin(dyy),Math.cos(dyy));e.yaw+=dyy*Math.min(1,dt*5)}}
    e.y=H(e.x,e.z)+.03;e.t+=dt*mv*2.2;e.m.position.set(e.x,e.y,e.z);e.m.rotation.y=e.yaw;const pit=e.state==='combat'?clamp(Math.atan2((F.y+footHeight()*.8)-(e.y+1.4),dist),-.6,.6):0;opPose(e.m,e.t,mv,pit,1,e.stance,0)}}
function enemyShoot(e,dist){e.m.updateMatrixWorld(true);e.m.userData.guns[1].userData.mz.getWorldPosition(_ov);const F=FOOT;
  const mv=clamp(F.spd/4,0,1.5),st=[1,.7,.45][F.stance];const p=clamp(e.acc*(1-dist/90)*st*(1-mv*.35),.03,.75);const hit=Math.random()<p;
  const tx=F.x+(hit?0:rnd(-1.4,1.4)),ty=F.y+footHeight()*(hit?.8:rnd(.2,1.5)),tz=F.z+(hit?0:rnd(-1.4,1.4));tracer(_ov.x,_ov.y,_ov.z,tx,ty,tz,0xffb070);mflash(_ov.x,_ov.y,_ov.z);
  gunSound(1,clamp(.5-dist/200,.08,.5),dist);if(hit)hurtMe(Math.random()<.12?45:18,'Un insurgente');else if(dist<30)beep(2400+Math.random()*800,.03,.02)}

/* ============ MISIONES ============ */
const OPS_LIST=[
  {id:'sup',name:'SUPRESIÓN · Puerto Deportivo',desc:'Insurgentes se han hecho fuertes en el puerto. Elimínalos a todos. Una sola vida, sin regenerar.',mk:'barco',n:9,acc:.45,xp:900,type:'sup'},
  {id:'ext',name:'EXTRACCIÓN · Invernaderos',desc:'Hay un rehén retenido en los invernaderos del norte. Libéralo (E) y llévalo hasta la zona de extracción.',mk:'invernadero',n:7,acc:.42,xp:1200,type:'ext'},
  {id:'dem',name:'DEMOLICIÓN · Desguace',desc:'Coloca la carga (mantén E) en el depósito de armas del desguace y aléjate antes de que explote.',mk:'scrap',n:8,acc:.48,xp:1100,type:'dem'}];
function opCenter(o){const m=WD.markers[o.mk];const s=freeSpot(m[0]*K,m[1]*K,1);return s}
function buildOpsMarkers(){for(const o of OPS_LIST){const c=opCenter(o);o.cx=c[0];o.cz=c[1];
  // punto de inserción: a ~120 m del objetivo, en una calle
  let ins=null;for(let k=0;k<24&&!ins;k++){const a=k/24*TAU,x=c[0]+Math.cos(a)*120,z=c[1]+Math.sin(a)*120;if(x<30||z<30||x>WM-30||z>HM-30||isSea(x,z))continue;const rn=roadNear(x,z,1,5,false);if(rn&&rn.d<6&&!blockedAt(x,z,2))ins=[x,z]}
  o.ins=ins||freeSpot(c[0]+60,c[1],2);const y=H(o.ins[0],o.ins[1]);
  const b=new THREE.Mesh(cylG(2.2,2.2,50,16),new THREE.MeshBasicMaterial({color:0x4cff7a,transparent:true,opacity:.28,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));b.position.set(o.ins[0],y+25,o.ins[1]);scene.add(b);
  const s=bigSprite('🎯 '+o.name,'#fff','rgba(30,120,60,.92)');s.scale.set(16,1.8,1);s.position.set(o.ins[0],y+7,o.ins[1]);scene.add(s);OPS.marks.push({o,x:o.ins[0],z:o.ins[1]})}}
let nearOp=null;
function updateOpsMarkers(){nearOp=null;if(OPS.m||RACE)return;const px=FOOT.on?FOOT.x:ME.x,pz=FOOT.on?FOOT.z:ME.z;for(const m of OPS.marks)if(Math.hypot(m.x-px,m.z-pz)<14)nearOp=m.o;
  const e=$('opPrompt');if(nearOp){e.hidden=false;e.innerHTML=`<b>${nearOp.name}</b>${nearOp.desc}<span>${IS_TOUCH?'Toca aquí':'Pulsa <kbd>O</kbd>'} para empezar la operación</span>`}else e.hidden=true}
function opsStart(o){if(RACE||OPS.m)return;toggleMenu(false);if(!FOOT.on){ME.x=o.ins[0];ME.z=o.ins[1];ME.vx=ME.vz=ME.vf=0;ME.yaw=Math.atan2(o.cx-o.ins[0],o.cz-o.ins[1]);ME.y=H(ME.x,ME.z)+.5;exitCar()}
  FOOT.x=o.ins[0]+Math.sin(ME.yaw)*3;FOOT.z=o.ins[1]+Math.cos(ME.yaw)*3;if(blockedAt(FOOT.x,FOOT.z,.35)){const s=freeSpot(FOOT.x,FOOT.z,.4);FOOT.x=s[0];FOOT.z=s[1]}FOOT.yaw=Math.atan2(o.cx-FOOT.x,o.cz-FOOT.z);
  FOOT.hp=100;FOOT.mag=[15,30];FOOT.res=[45,150];FOOT.gren=3;FOOT.dead=false;FOOT.stance=0;
  opsClear();OPS.m=o;OPS.t=0;OPS.kills=0;const R=Math.random;
  for(let i=0;i<o.n;i++){const a=R()*TAU,r=4+R()*30;spawnEnemy(o.cx+Math.cos(a)*r,o.cz+Math.sin(a)*r,[o.cx+Math.cos(a)*r*.6,o.cz+Math.sin(a)*r*.6],o.acc)}
  if(o.type==='ext'){let s=freeSpot(o.cx+3,o.cz+3,.5);for(let k=0;k<20&&isSea(s[0],s[1]);k++)s=freeSpot(o.cx+rnd(-20,20),o.cz+rnd(-20,20),.5);const h={x:s[0],z:s[1],y:H(s[0],s[1]),hp:100,kneel:true,free:false,dead:false,m:opHuman(SOLDIER.hostage),t:0};scene.add(h.m);OPS.hostage=h;
    // extracción: hacia el centro del pueblo, a unos 260 m
    const st=WD.markers.start,dx=st[0]*K-o.cx,dz=st[1]*K-o.cz,L=Math.hypot(dx,dz)||1;const ez=freeSpot(o.cx+dx/L*260,o.cz+dz/L*260,3);OPS.obj={x:ez[0],z:ez[1],r:10,label:'EXTRACCIÓN'}}
  if(o.type==='dem'){const s=freeSpot(o.cx,o.cz,1.5);const g=new THREE.Group();g.add(mesh(boxG(2.4,1.3,1.2),0x4d5a3a,0,.65,0),mesh(boxG(2.45,.12,1.25),0x2d3522,0,1.3,0),mesh(boxG(.4,.25,.02),0xe8c13a,0,.8,.61));g.position.set(s[0],H(s[0],s[1]),s[1]);scene.add(g);obstAdd(s[0]-1.2,s[1],s[0]+1.2,s[1],.7);OPS.obj={x:s[0],z:s[1],r:2.8,label:'DEPÓSITO DE ARMAS',g,plant:0,armed:false,boom:0}}
  for(const b of OPS.beacons)scene.remove(b);OPS.beacons=[];if(OPS.obj){const b=new THREE.Mesh(cylG(OPS.obj.r,OPS.obj.r,40,20),new THREE.MeshBasicMaterial({color:0x4cff7a,transparent:true,opacity:.25,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));b.position.set(OPS.obj.x,H(OPS.obj.x,OPS.obj.z)+20,OPS.obj.z);scene.add(b);OPS.beacons.push(b)}
  bigMsg(o.name.split('·')[0].trim(),'#7dffa0');feed('🎯 '+o.desc);beep(660,.1);setTimeout(()=>beep(880,.12),140)}
function opsClear(){for(const e of OPS.enemies)scene.remove(e.m);OPS.enemies=[];if(OPS.hostage){scene.remove(OPS.hostage.m);OPS.hostage=null}if(OPS.obj&&OPS.obj.g)scene.remove(OPS.obj.g);OPS.obj=null;for(const b of OPS.beacons)scene.remove(b);OPS.beacons=[]}
function opsCheck(){const o=OPS.m;if(!o)return;const alive=OPS.enemies.filter(e=>!e.dead).length;if(o.type==='sup'&&alive===0)opsEnd(true,'Zona asegurada')}
function opsEnd(ok,why){const o=OPS.m;if(!o)return;OPS.m=null;const t=OPS.t,k=OPS.enemies.filter(e=>e.dead).length;
  if(ok){const xp=o.xp+k*25+Math.max(0,Math.round(600-t));addXP(xp,'Operación completada');bigMsg('MISIÓN CUMPLIDA','#7dffa0');S.ops=S.ops||{};const best=S.ops[o.id];if(!best||t<best)S.ops[o.id]=Math.round(t*10)/10;save()}else bigMsg('MISIÓN FALLIDA','#ff5a5a');
  feed((ok?'✅ ':'❌ ')+why+` · ${k} abatidos · ${fmtT(t)}`);setTimeout(()=>{if(!OPS.m)opsClear()},6000)}
function fmtT(t){const m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+String(s).padStart(2,'0')}
function opsUse(){const o=OPS.m;if(!o||FOOT.dead)return;if(o.type==='ext'){const h=OPS.hostage;if(h&&!h.free&&Math.hypot(h.x-FOOT.x,h.z-FOOT.z)<2.5){h.free=true;h.kneel=false;feed('🤝 Rehén liberado: síguele hasta la extracción');beep(990,.1)}}}
function updateOps(dt){updateGren(dt);updateEnemies(dt);updateOpFx(dt);updateOpsMarkers();const o=OPS.m,hud=$('opsObj');
  const F=FOOT,w=OPW[F.wi];$('opsHp').style.width=F.hp+'%';$('opsHp').style.background=F.hp>50?'#7dffa0':F.hp>25?'#ffd54a':'#ff4d4d';
  $('opsAmmo').innerHTML=`<b>${F.rel>0?'RECARGANDO':F.mag[F.wi]}</b> / ${F.res[F.wi]} <small>${w.n} · 💣 ${F.gren}</small>`;$('opsSt').textContent=['DE PIE','AGACHADO','CUERPO A TIERRA'][F.stance];
  if(!o){hud.hidden=true;return}OPS.t+=dt;hud.hidden=false;const alive=OPS.enemies.filter(e=>!e.dead).length;let txt='';
  if(o.type==='sup')txt=`Elimina a todos los insurgentes · quedan <b>${alive}</b>`;
  if(o.type==='ext'){const h=OPS.hostage;if(h&&!h.dead){if(!h.free){txt=`Libera al rehén (${IS_TOUCH?'USAR':'E'}) · ${Math.round(Math.hypot(h.x-F.x,h.z-F.z))} m`}else{
      // el rehén te sigue
      const d=Math.hypot(F.x-h.x,F.z-h.z);let mv=0;if(d>2.5){mv=d>8?4.8:3.2;const nx=h.x+(F.x-h.x)/d*mv*dt,nz=h.z+(F.z-h.z)/d*mv*dt;if(!blockedAt(nx,nz,.3)){h.x=nx;h.z=nz}}h.y=H(h.x,h.z)+.03;h.t+=dt*mv*2.2;h.m.rotation.y=Math.atan2(F.x-h.x,F.z-h.z);
      const de=Math.hypot(OPS.obj.x-h.x,OPS.obj.z-h.z);txt=`Lleva al rehén a la zona de extracción · <b>${Math.round(de)} m</b>`;if(de<OPS.obj.r){opsEnd(true,'Rehén extraído con vida');return}
      // los insurgentes también le disparan
      for(const e of OPS.enemies)if(!e.dead&&e.state==='combat'&&Math.random()<dt*.06&&Math.hypot(e.x-h.x,e.z-h.z)<40){h.hp-=20;if(h.hp<=0){h.dead=true;opsEnd(false,'Han abatido al rehén');return}}}
    h.m.position.set(h.x,h.y,h.z);opPose(h.m,h.t,h.free?3:0,0,1,h.kneel?1:0,0,'up')}}
  if(o.type==='dem'){const ob=OPS.obj,d=Math.hypot(ob.x-F.x,ob.z-F.z);if(!ob.armed){if(d<ob.r&&(keys.KeyE||fin.use)&&!F.dead){ob.plant+=dt;if(ob.plant>=3){ob.armed=true;ob.boom=25;feed('💥 Carga colocada: ¡aléjate! 25 s');beep(1200,.2)}}else ob.plant=Math.max(0,ob.plant-dt*2);
      txt=ob.plant>0?`Colocando carga… <b>${Math.round(ob.plant/3*100)}%</b>`:`Coloca la carga en el depósito (mantén ${IS_TOUCH?'USAR':'E'}) · ${Math.round(d)} m`}
    else{ob.boom-=dt;txt=`¡Aléjate! Detonación en <b>${Math.ceil(ob.boom)} s</b> · ${Math.round(d)} m`;if(ob.boom<=0){for(let i=0;i<3;i++)explode(ob.x+rnd(-1,1),H(ob.x,ob.z),ob.z+rnd(-1,1),false);scene.remove(ob.g);ob.g=null;if(d>40)opsEnd(true,'Depósito destruido');else{hurtMe(200,'La explosión');}}}}
  hud.innerHTML=`<b>${o.name}</b>${txt}<small>${fmtT(OPS.t)} · abatidos ${OPS.enemies.filter(e=>e.dead).length}/${OPS.enemies.length}</small>`}
function drawOpsMini(g,P2){for(const e of OPS.enemies){if(e.dead||!(e.state==='combat'&&time-e.lastSeen<2))continue;const v=P2(e.x,e.z);g.fillStyle='#ff3b3b';g.beginPath();g.arc(v[0],v[1],4,0,TAU);g.fill()}
  if(OPS.obj){const v=P2(OPS.obj.x,OPS.obj.z);const L=Math.hypot(v[0],v[1]);if(L>150){v[0]*=150/L;v[1]*=150/L}g.fillStyle='#4cff7a';g.beginPath();g.arc(v[0],v[1],7,0,TAU);g.fill()}
  if(OPS.hostage&&!OPS.hostage.dead){const v=P2(OPS.hostage.x,OPS.hostage.z);g.fillStyle='#ffffff';g.beginPath();g.arc(v[0],v[1],5,0,TAU);g.fill()}
  for(const m of OPS.marks){const v=P2(m.x,m.z);if(Math.hypot(v[0],v[1])<150){g.fillStyle='#4cff7a';g.font='14px system-ui';g.textAlign='center';g.textBaseline='middle';g.fillText('🎯',v[0],v[1])}}}

/* ============ ONLINE: soldados de otros jugadores y PvP ============ */
function footState(st){if(!FOOT.on)return;st.fo=1;st.x=+FOOT.x.toFixed(2);st.z=+FOOT.z.toFixed(2);st.y=+FOOT.y.toFixed(2);st.yw=+FOOT.yaw.toFixed(3);st.pi=+FOOT.pitch.toFixed(2);st.ps=FOOT.stance;st.wi=FOOT.wi;st.sh=FOOT.shot;st.sp=+FOOT.spd.toFixed(1);if(FOOT.dead)st.dd=1}
function footRemote(r,d){r.fo=!!d.fo;r.st=d.ps||0;r.wi=d.wi===undefined?1:d.wi;r.pi=d.pi||0;r.fsp=d.sp||0;r.dead=!!d.dd;if(d.sh!==undefined){if(r.lsh!==undefined&&d.sh>r.lsh&&r.sol){r.sol.updateMatrixWorld(true);r.sol.userData.guns[r.wi].userData.mz.getWorldPosition(_ov);const yw=r.c.yaw,pi=r.pi;
    tracer(_ov.x,_ov.y,_ov.z,_ov.x+Math.sin(yw)*Math.cos(pi)*80,_ov.y+Math.sin(pi)*80,_ov.z+Math.cos(yw)*Math.cos(pi)*80,0xffe0a0);mflash(_ov.x,_ov.y,_ov.z);const dist=Math.hypot(r.c.x-(FOOT.on?FOOT.x:ME.x),r.c.z-(FOOT.on?FOOT.z:ME.z));gunSound(1,clamp(.5-dist/200,.05,.5),dist)}r.lsh=d.sh;}if(d.sh!==undefined&&r.lsh2!==d.sh){r.lst=time;r.lsh2=d.sh}}
function poseRemoteFoot(r,dt){if(!r.fo){if(r.sol)r.sol.visible=false;r.c.m.visible=true;return}if(!r.sol){let h=0;for(const ch of r.n||'')h=(h*31+ch.charCodeAt(0))>>>0;r.sol=opHuman({style:h});scene.add(r.sol)}r.sol.userData.aiming=time-(r.lst||-9)<1.2;r.c.m.visible=false;r.sol.visible=true;
  r.sol.position.set(r.c.x,r.c.y,r.c.z);r.sol.rotation.y=r.c.yaw;r.ft=(r.ft||0)+dt*8*clamp(r.fsp/3,0,1.3);opPose(r.sol,r.ft,r.fsp,r.c.pitch||0,r.wi,r.st,0,r.dead?'dead':undefined)}
function hitsInit(){const R=net.R,me=net.ref('hit/'+UID);R.onDisconnect(me).remove();R.remove(me).catch(()=>{});R.onChildAdded(me,s=>{const v=s.val();R.remove(s.ref).catch(()=>{});if(!v||serverNow()-(v.t||0)>5000)return;if(FOOT.on){hurtMe(v.d,v.n);if(FOOT.dead&&net.on)net.R.push(net.ref('chat'),{n:'⚔️',u:'sys',m:`${v.n} ha abatido a ${S.nick}`,t:serverNow()}).catch(()=>{})}})}

/* ============ CONTROLES ============ */
function initFootInput(){const cv=$('c');
  cv.addEventListener('mousedown',e=>{if(!FOOT.on||IS_TOUCH||FB.on)return;if(!document.pointerLockElement){cv.requestPointerLock&&cv.requestPointerLock();return}if(e.button===0){keys.Mouse0=true;fireIfAuto()}if(e.button===2)FOOT.aim=true});
  addEventListener('mouseup',e=>{if(e.button===0){keys.Mouse0=false;FOOT.trig=false}if(e.button===2)FOOT.aim=false});
  addEventListener('mousemove',e=>{if(FOOT.on&&document.pointerLockElement){look.dx+=e.movementX;look.dy+=e.movementY}});
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT'||e.repeat)return;
    if(e.code==='KeyF')toggleFoot();if(e.code==='KeyO'&&nearOp)opsStart(nearOp);if(!FOOT.on)return;
    if(e.code==='KeyC')FOOT.stance=FOOT.stance===1?0:1;if(e.code==='KeyZ'||e.code==='KeyX')FOOT.stance=FOOT.stance===2?0:2;if(e.code==='KeyR')reloadW();
    if(e.code==='Digit1'){FOOT.wi=1;FOOT.rel=0}if(e.code==='Digit2'){FOOT.wi=0;FOOT.rel=0}if(e.code==='KeyQ'){FOOT.wi=1-FOOT.wi;FOOT.rel=0}if(e.code==='KeyG')throwGren();if(e.code==='KeyE')opsUse()});
  // táctil: joystick a la izquierda, arrastrar a la derecha para mirar
  const jz=$('fJoy'),kn=$('fKnob');let jid=null,jx=0,jy=0;
  jz.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];jid=t.identifier;jx=t.clientX;jy=t.clientY},{passive:false});
  jz.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===jid){let dx=(t.clientX-jx)/55,dy=(t.clientY-jy)/55;const L=Math.hypot(dx,dy);if(L>1){dx/=L;dy/=L}fin.mx=dx;fin.mz=-dy;fin.run=L>1.25;kn.style.transform=`translate(${dx*40}px,${dy*40}px)`}},{passive:false});
  const je=e=>{for(const t of e.changedTouches)if(t.identifier===jid){jid=null;fin.mx=fin.mz=0;fin.run=false;kn.style.transform=''}};jz.addEventListener('touchend',je);jz.addEventListener('touchcancel',je);
  const lz=$('fLook');let lid=null,lx=0,ly=0;lz.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];lid=t.identifier;lx=t.clientX;ly=t.clientY},{passive:false});
  lz.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===lid){look.dx+=(t.clientX-lx)*1.6;look.dy+=(t.clientY-ly)*1.6;lx=t.clientX;ly=t.clientY}},{passive:false});
  const le=e=>{for(const t of e.changedTouches)if(t.identifier===lid)lid=null};lz.addEventListener('touchend',le);lz.addEventListener('touchcancel',le);
  const fb=(id,dn,up)=>{const b=$(id);b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();b.classList.add('down');dn()},{passive:false});const u=e=>{e.preventDefault();b.classList.remove('down');if(up)up()};b.addEventListener('touchend',u,{passive:false});b.addEventListener('touchcancel',u,{passive:false});b.addEventListener('click',()=>{if(!IS_TOUCH){dn();if(up)up()}})};
  // el botón de fuego también sirve para mirar arrastrando
  const fire=$('fFire');let fid=null,fx=0,fy=0;fire.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];fid=t.identifier;fx=t.clientX;fy=t.clientY;fin.fire=true;fire.classList.add('down');fireIfAuto()},{passive:false});
  fire.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===fid){look.dx+=(t.clientX-fx)*1.6;look.dy+=(t.clientY-fy)*1.6;fx=t.clientX;fy=t.clientY}},{passive:false});
  const fe=e=>{for(const t of e.changedTouches)if(t.identifier===fid){fid=null;fin.fire=false;FOOT.trig=false;fire.classList.remove('down')}};fire.addEventListener('touchend',fe);fire.addEventListener('touchcancel',fe);
  fb('fAim',()=>{FOOT.aim=!FOOT.aim;$('fAim').classList.toggle('on',FOOT.aim)});fb('fCrouch',()=>FOOT.stance=FOOT.stance===1?0:1);fb('fProne',()=>FOOT.stance=FOOT.stance===2?0:2);
  fb('fReload',reloadW);fb('fSwap',()=>{FOOT.wi=1-FOOT.wi;FOOT.rel=0});fb('fGren',throwGren);fb('fUse',()=>{fin.use=true;opsUse()},()=>fin.use=false);fb('fCar',enterCar);
  $('bExit').addEventListener('touchstart',e=>{e.preventDefault();exitCar()},{passive:false});$('bExit').addEventListener('click',()=>{if(!IS_TOUCH)exitCar()});
  $('opPrompt').addEventListener('click',()=>{if(nearOp)opsStart(nearOp)})}
function opsMenuHTML(){S.ops=S.ops||{};return OPS_LIST.map(o=>`<div class="row"><div style="flex:1"><h4>🎯 ${o.name}</h4><small>${o.desc}<br>${o.n} insurgentes · récord: ${S.ops[o.id]?fmtT(S.ops[o.id]):'—'}</small></div><button class="btn" type="button" data-op="${o.id}">IR</button></div>`).join('')+
  `<div class="row"><small><b>Cómo se juega:</b> baja del coche con <kbd>F</kbd> (o 🚶 BAJAR en el móvil). Una sola vida y sin regenerar salud. La retícula se cierra si te quedas quieto, agachado (<kbd>C</kbd>) o cuerpo a tierra (<kbd>Z</kbd>): ahí aciertas más y te ven menos. Apunta con clic derecho, dispara con clic izquierdo, <kbd>R</kbd> recargar, <kbd>1</kbd>/<kbd>2</kbd> armas, <kbd>G</kbd> granada, <kbd>E</kbd> interactuar. Online: si otros jugadores van a pie podéis enfrentaros (el fuego amigo está siempre activo).</small></div>`}
function bindOpsMenu(){document.querySelectorAll('[data-op]').forEach(b=>b.onclick=()=>{const o=OPS_LIST.find(q=>q.id===b.dataset.op);if(o){toggleMenu(false);if(!FOOT.on&&Math.hypot(ME.x-o.ins[0],ME.z-o.ins[1])>40){ME.x=o.ins[0];ME.z=o.ins[1];ME.y=H(ME.x,ME.z)+.5;ME.vx=ME.vz=ME.vf=0}opsStart(o)}})}
