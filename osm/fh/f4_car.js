
/* ============ COCHES: modelos con carrocería extruida y pintura metalizada ============ */
const CARS=[
  {n:'Compacto GTI',L:4.05,W:1.8,vmax:58,acc:8.2,grip:7.5,mass:1,
   prof:[[-2.02,.32],[-2.05,.62],[-1.98,.95],[-1.75,1.42],[.15,1.47],[.95,1.0],[1.95,.78],[2.04,.58],[2.0,.32]],glass:[[-1.93,.97],[-1.73,1.39],[.13,1.43],[.9,1.02]],wb:[-1.28,1.3]},
  {n:'Berlina Sport',L:4.7,W:1.86,vmax:66,acc:8.8,grip:7.8,mass:1.1,
   prof:[[-2.33,.33],[-2.37,.68],[-2.2,.98],[-1.35,1.02],[-.75,1.43],[.35,1.45],[1.05,1.0],[2.2,.83],[2.37,.6],[2.33,.33]],glass:[[-1.32,1.03],[-.74,1.4],[.33,1.42],[.99,1.03]],wb:[-1.42,1.45]},
  {n:'Gran Turismo',L:4.55,W:1.96,vmax:80,acc:10.6,grip:8.6,mass:1.15,wing:1,
   prof:[[-2.25,.3],[-2.28,.64],[-2.12,.9],[-1.25,.97],[-.55,1.26],[.25,1.29],[1.0,.92],[2.16,.72],[2.29,.52],[2.24,.3]],glass:[[-1.22,.98],[-.55,1.23],[.23,1.26],[.96,.94]],wb:[-1.38,1.38]},
  {n:'Todoterreno',L:4.7,W:1.96,vmax:58,acc:8.0,grip:7.2,mass:1.35,off:1,lift:.12,
   prof:[[-2.33,.44],[-2.36,.82],[-2.3,1.12],[-2.15,1.72],[.5,1.78],[1.25,1.2],[2.25,1.05],[2.37,.76],[2.33,.44]],glass:[[-2.12,1.15],[-2.02,1.69],[.46,1.74],[1.19,1.18]],wb:[-1.45,1.45]},
  {n:'Superdeportivo',L:4.5,W:2.0,vmax:92,acc:12.5,grip:9.4,mass:1.2,wing:1,
   prof:[[-2.22,.28],[-2.26,.7],[-1.9,.95],[-.9,1.0],[-.3,1.17],[.4,1.17],[1.25,.82],[2.2,.55],[2.27,.4],[2.2,.28]],glass:[[-.86,1.0],[-.3,1.14],[.38,1.14],[1.19,.84]],wb:[-1.35,1.4]}];
const PAINT=['#c1121f','#f5f5f5','#111318','#1d4ed8','#f4c20d','#ff6a00','#2e7d32','#7c3aed','#9aa5ab','#0f766e','#e11d74','#6b4f2a'];
const CARGEO={};
function profShape(pts){const s=new THREE.Shape();s.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)s.lineTo(pts[i][0],pts[i][1]);s.closePath();return s}
function extrudeW(pts,w,bev){const g=new THREE.ExtrudeGeometry(profShape(pts),{depth:w-(bev?.16:0),bevelEnabled:!!bev,bevelSize:bev?.07:0,bevelThickness:bev?.08:0,bevelSegments:bev?3:0,curveSegments:4,steps:1});
  g.rotateY(-Math.PI/2);g.translate((w-(bev?.16:0))/2,0,0);g.computeVertexNormals();return g}
function clipY(pts,y,keepBelow){const o=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],ia=keepBelow?a[1]<=y:a[1]>=y,ib=keepBelow?b[1]<=y:b[1]>=y;
  if(ia)o.push(a);if(ia!==ib){const t=(y-a[1])/(b[1]-a[1]);o.push([a[0]+(b[0]-a[0])*t,y])}}return o}
const MATS={};
function stdMat(k,o){return MATS[k]||(MATS[k]=new THREE.MeshStandardMaterial(Object.assign({envMap,envMapIntensity:1},o)))}
function newCar(ti,ci){const m=mkCarModel(ti,ci);scene.add(m);return{m,t:ti,ci,x:0,z:0,y:0,yaw:0,vx:0,vz:0,vy:0,vf:0,vl:0,steer:0,air:0,pitch:0,roll:0,nos:1,nosOn:false,rpm:0,gear:1,slip:0,crash:0,onGround:true}}
function setCarType(c,ti,ci){scene.remove(c.m);c.m=mkCarModel(ti,ci);scene.add(c.m);c.t=ti;c.ci=ci}
function surfaceY(x,z){return H(x,z)+.05}
function offRoad(x,z){const rn=roadNear(x,z,0,9,false);return !rn||rn.d>2.6}
function carHitsWorld(c,x,z,yaw){const T=CARS[c.t],fx=Math.sin(yaw),fz=Math.cos(yaw),rx=Math.cos(yaw),rz=-Math.sin(yaw),hw=T.W/2-.05,hl=T.L/2-.05;
  for(const [a,b] of [[hl,hw],[hl,-hw],[-hl,hw],[-hl,-hw],[hl,0],[-hl,0],[0,hw],[0,-hw]]){const px=x+fx*a+rx*b,pz=z+fz*a+rz*b;if(blockedAt(px,pz,.05))return true}return false}
function freeSpot(x0,z0,r){if(!blockedAt(x0,z0,r))return[x0,z0];for(let d=2;d<60;d+=2)for(let a=0;a<16;a++){const x=x0+Math.cos(a/16*TAU)*d,z=z0+Math.sin(a/16*TAU)*d;if(!blockedAt(x,z,r))return[x,z]}return[x0,z0]}
const OTHER=[];// otros coches (remotos, IA) para choques
function stepCar(c,dt,inp){const T=CARS[c.t],g=28;
  const fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
  let vf=c.vx*fx+c.vz*fz,vl=c.vx*rx+c.vz*rz;c.ofT=(c.ofT||0)-dt;if(c.ofT<=0){c.ofT=.12;c.off=offRoad(c.x,c.z)}const off=c.onGround&&c.off&&!T.off;
  const vmax=T.vmax*(c.nosOn?1.18:1)*(off?.6:1);
  if(c.onGround){
    if(inp.thr>0){if(vf<-.5)vf+=18*inp.thr*dt;else vf+=(T.acc*(c.nosOn?1.6:1))*inp.thr*Math.max(0,1-(vf/vmax)**2)*dt}
    if(inp.brk>0){if(vf>.5)vf-=16*inp.brk*dt;else vf-=6*inp.brk*dt*Math.max(0,1+vf/14)}
    if(!inp.thr&&!inp.brk)vf-=Math.sign(vf)*Math.min(Math.abs(vf),(1.1+Math.abs(vf)*.02)*dt);
    if(!inp.thr&&!inp.brk&&Math.abs(vf)<1.2)vf=0;
    vf-=.00045*vf*Math.abs(vf)*dt*(off?6:1);
    // cuesta: la gravedad frena al subir y empuja al bajar
    const hF=GH(c.x+fx*3,c.z+fz*3,c.y),hB=GH(c.x-fx*3,c.z-fz*3,c.y);if(vf!==0||inp.thr)vf-=9.81*((hF-hB)/6)*dt;
    if(inp.hb)vf-=Math.sign(vf)*Math.min(Math.abs(vf),5*dt)}
  const ms=.62/(1+Math.abs(vf)*.055);c.steer+=(inp.str*ms-c.steer)*Math.min(1,dt*(inp.str?6:9));
  let yr=vf*Math.tan(c.steer)/(T.L*.62);
  const drift=inp.hb&&Math.abs(vf)>8;if(drift)yr+=inp.str*1.4*Math.sign(vf)*Math.min(1,Math.abs(vf)/20);
  if(Math.abs(vl)>2.5&&c.onGround)yr+=-Math.sign(vl)*inp.str*.0+vl*.012;
  c.yaw+=yr*dt*(c.onGround?1:.25);
  const grip=c.onGround?(drift?1.1:(Math.abs(vl)>6?3.5:T.grip))*(off?.75:1):.05;vl-=vl*Math.min(1,grip*dt);
  c.slip=Math.abs(vl);if(c.slip>3&&c.onGround&&Math.abs(vf)>10){c.nos=Math.min(1,c.nos+dt*.05);vf-=Math.sign(vf)*c.slip*.05*dt}
  // nitro
  c.nosOn=!!inp.nos&&c.nos>0&&vf>3;if(c.nosOn)c.nos=Math.max(0,c.nos-dt*.22);else c.nos=Math.min(1,c.nos+dt*.012);
  const nfx=Math.sin(c.yaw),nfz=Math.cos(c.yaw),nrx=Math.cos(c.yaw),nrz=-Math.sin(c.yaw);vf=clamp(vf,-14,vmax*1.05);
  c.vx=nfx*vf+nrx*vl;c.vz=nfz*vf+nrz*vl;c.vf=vf;c.vl=vl;
  // movimiento con choques (deslizar a lo largo de la pared)
  const nx=c.x+c.vx*dt,nz=c.z+c.vz*dt;let hit=false;
  if(!carHitsWorld(c,nx,nz,c.yaw)){c.x=nx;c.z=nz}
  else{hit=true;const sp=Math.hypot(c.vx,c.vz);let glance=true;if(!carHitsWorld(c,nx,c.z,c.yaw)){c.x=nx;c.vz*=-.15}else if(!carHitsWorld(c,c.x,nz,c.yaw)){c.z=nz;c.vx*=-.15}else{c.vx*=-.25;c.vz*=-.25;glance=false}
    const kk=glance?.82:.45;c.vx*=kk;c.vz*=kk;if(Math.abs(c.vf)<3&&(inp.thr||inp.brk)&&inp.str){const ny=c.yaw+inp.str*1.1*dt*(inp.brk?-1:1);if(!carHitsWorld(c,c.x,c.z,ny))c.yaw=ny}if(sp>6){c.crash=Math.min(1,sp/30);onCrash(c,sp)}
    if(carHitsWorld(c,c.x,c.z,c.yaw)){const e=freeSpot(c.x,c.z,2.4);c.x=e[0];c.z=e[1]}}
  // otros coches
  for(const o of OTHER){if(o===c)continue;const dx=c.x-o.x,dz=c.z-o.z,d=Math.hypot(dx,dz);if(d<2.6&&d>.01){const pen=2.6-d,ux=dx/d,uz=dz/d;c.x+=ux*pen*.6;c.z+=uz*pen*.6;const rv=(c.vx-(o.vx||0))*ux+(c.vz-(o.vz||0))*uz;if(rv<0){c.vx-=rv*ux*1.2;c.vz-=rv*uz*1.2;if(-rv>5)onCrash(c,-rv)}}}
  // vertical: suspensión que filtra los cambios de pendiente; solo despega en cambios de rasante de verdad
  const T2=CARS[c.t],Lw=T2.L*.4,Ww=T2.W*.4;
  strKeep(c);const yr0=c.y;const hFL=GH(c.x+nfx*Lw+nrx*Ww,c.z+nfz*Lw+nrz*Ww,yr0),hFR=GH(c.x+nfx*Lw-nrx*Ww,c.z+nfz*Lw-nrz*Ww,yr0),hBL=GH(c.x-nfx*Lw+nrx*Ww,c.z-nfz*Lw+nrz*Ww,yr0),hBR=GH(c.x-nfx*Lw-nrx*Ww,c.z-nfz*Lw-nrz*Ww,yr0);
  const gy=(hFL+hFR+hBL+hBR)/4+.05;
  // salto de altura del suelo de más de 3 m de un fotograma a otro = el coche ha sido recolocado: sin velocidad vertical fantasma
  if(c.gyPrev!==undefined&&Math.abs(gy-c.gyPrev)>3){c.gyPrev=gy;c.vy=0;c.y=gy;c.onGround=true}
  if(c.onGround){const gvy=c.gyPrev!==undefined?(gy-c.gyPrev)/dt:0;const yBall=c.y+c.vy*dt-.5*g*dt*dt;
    if(gy<yBall-.3&&Math.hypot(c.vx,c.vz)>16){c.onGround=false;c.air=0;c.y=yBall;c.vy-=g*dt}
    else{const k=1-Math.exp(-dt*16);c.vy+=(clamp(gvy,-40,40)-c.vy)*k;c.y+=c.vy*dt;c.y+=(gy-c.y)*(1-Math.exp(-dt*14));if(c.y<gy-.04){c.y=gy-.04;if(c.vy<gvy)c.vy=gvy}if(c.y>gy+.08)c.y=gy+.08}}
  else{c.vy-=g*dt;c.y+=c.vy*dt;c.air+=dt;if(c.y<=gy){c.y=gy;if(c.air>.45)onLand(c,c.air);c.onGround=true;c.vy=Math.max(c.vy*.0,(gy-(c.gyPrev||gy))/dt);c.air=0}}
  c.gyPrev=gy;
  // inclinación según el terreno (media de las cuatro ruedas, suavizada)
  let tp,tr;if(c.onGround){tp=Math.atan2((hFL+hFR)-(hBL+hBR),4*Lw);tr=Math.atan2((hFL+hBL)-(hFR+hBR),4*Ww)}else{tp=c.pitch-dt*.12;tr=c.roll}
  c.pitch+=(tp-c.pitch)*Math.min(1,dt*7);c.roll+=(tr-c.roll)*Math.min(1,dt*7);
  // marchas y rpm (para el sonido y el HUD)
  const sp=Math.abs(vf),gears=[0,9,17,26,36,48,62,99];let gi=1;while(gi<7&&sp>gears[gi]*(T.vmax/66))gi++;c.gear=vf<-.5?-1:gi;const lo=gears[gi-1]*(T.vmax/66),hi=gears[gi]*(T.vmax/66);c.rpm=clamp(.18+.8*(sp-lo)/Math.max(1,hi-lo),.15,1);
  return hit}
function poseCar(c,dt){const m=c.m;m.position.set(c.x,c.y,c.z);m.rotation.set(0,c.yaw,0);const b=m.userData.body;if(dt>0){const ac=((c.vf||0)-(c.pvf===undefined?c.vf||0:c.pvf))/dt;c.pvf=c.vf;c.sacc=(c.sacc||0)+(clamp(ac,-25,15)-(c.sacc||0))*Math.min(1,dt*6)}b.rotation.x=-c.pitch+clamp(-(c.sacc||0)*.0035,-.055,.045);b.rotation.z=c.roll-clamp(c.vl*.01+c.steer*c.vf*.0025,-.06,.06);
  for(const w of m.userData.wheels){w.spin.rotation.x+=c.vf*dt/.34;if(w.front)w.piv.rotation.y=c.steer}}

/* ============ EFECTOS: humo, marcas de frenada, nitro ============ */
let FX=[];
function puff(x,y,z,c,s,life,vy){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:TX.puff,color:c,transparent:true,depthWrite:false,opacity:.8}));m.position.set(x,y,z);m.scale.set(s,s,1);scene.add(m);FX.push({m,t:life,T:life,vy:vy||.6,g:s*1.6})}
function updateFX(dt){for(let i=FX.length-1;i>=0;i--){const f=FX[i];f.t-=dt;if(f.t<=0){scene.remove(f.m);f.m.material.dispose();FX.splice(i,1);continue}f.m.position.y+=f.vy*dt;const s=f.m.scale.x+f.g*dt;f.m.scale.set(s,s,1);f.m.material.opacity=(f.t/f.T)*.7}}
let SKID=null,skidI=0;const SKN=900;
function initSkids(){SKID=new THREE.InstancedMesh(new THREE.PlaneGeometry(.26,.7).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0x111111,transparent:true,opacity:.45,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),SKN);
  const m=new THREE.Matrix4().makeScale(0,0,0);for(let i=0;i<SKN;i++)SKID.setMatrixAt(i,m);SKID.frustumCulled=false;SKID.renderOrder=6;scene.add(SKID)}
const _m4=new THREE.Matrix4(),_q=new THREE.Quaternion(),_v=new THREE.Vector3(),_s=new THREE.Vector3(1,1,1),_e=new THREE.Euler();
function skid(x,z,yaw){_q.setFromEuler(_e.set(0,yaw,0));_m4.compose(_v.set(x,surfaceY(x,z)+.03,z),_q,_s);SKID.setMatrixAt(skidI,_m4);skidI=(skidI+1)%SKN;SKID.instanceMatrix.needsUpdate=true}
function carFX(c,dt,me){const T=CARS[c.t],fx=Math.sin(c.yaw),fz=Math.cos(c.yaw),rx=Math.cos(c.yaw),rz=-Math.sin(c.yaw);
  if(c.onGround&&(c.slip>3.5||(me&&keys.Space&&Math.abs(c.vf)>6))){c.sk=(c.sk||0)-dt;if(c.sk<=0){c.sk=.03;for(const s of [-1,1]){const x=c.x-fx*T.L*.3+rx*s*(T.W/2-.15),z=c.z-fz*T.L*.3+rz*s*(T.W/2-.15);skid(x,z,c.yaw);if(Math.random()<.35)puff(x,c.y+.3,z,0xdddddd,1.1,1.1,.8)}}}
  if(c.nosOn){c.nf=(c.nf||0)-dt;if(c.nf<=0){c.nf=.04;const x=c.x-fx*(T.L/2+.2),z=c.z-fz*(T.L/2+.2);puff(x,c.y+.35,z,0x66aaff,.6,.18,0)}}}

/* ============ SONIDO (motor, derrape, golpes) ============ */
let shakeT=0;
function onCrash(c,sp){if(c!==ME)return;shakeT=Math.min(.5,sp/40);thud(clamp(sp/30,.2,1))}
function onLand(c,air){if(c!==ME)return;shakeT=Math.min(.35,air*.4);thud(.4);if(air>.6){addXP(Math.round(air*100),'SALTO '+air.toFixed(1)+' s')}}
