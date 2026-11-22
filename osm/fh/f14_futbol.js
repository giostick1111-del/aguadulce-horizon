
/* ============ FÚTBOL: campos reales de Aguadulce (OpenStreetMap) y partido controlando a un solo jugador ============
   Campo Municipal de Aguadulce y I.D.M. El Parador: fútbol 11 (y fútbol 7 en transversal, como se juega allí).
   Pistas de La Gloria: fútbol 5 en jaula. Tú llevas a un jugador; compañeros, rivales y porteros los lleva la IA. */
const FBP=[
  {id:'agu',name:'Campo Municipal de Aguadulce',cx:2298.5,cz:1470.7,L:112,W:69.6,a:.890,modes:[11,7],lights:6},
  {id:'par',name:'I.D.M. El Parador',cx:939,cz:2726,L:93.7,W:52.2,a:1.195,modes:[11,7],lights:4},
  {id:'glo1',name:'Pista de La Gloria 1',cx:2016.7,cz:2541.7,L:38,W:18.9,a:-2.589,modes:[5],lights:4,cage:true},
  {id:'glo2',name:'Pista de La Gloria 2',cx:1939.7,cz:2520.9,L:42.5,W:21.6,a:-1.82,modes:[5],lights:4,cage:true}];
for(const p of FBP){p.ux=Math.cos(p.a);p.uz=Math.sin(p.a);p.vx=-p.uz;p.vz=p.ux}
const fbW=(p,u,v)=>[p.cx+p.ux*u+p.vx*v,p.cz+p.uz*u+p.vz*v];
const fbL=(p,x,z)=>{const dx=x-p.cx,dz=z-p.cz;return[dx*p.ux+dz*p.uz,dx*p.vx+dz*p.vz]};
function inPitch(x,z,m){for(const p of FBP){const q=fbL(p,x,z);if(Math.abs(q[0])<p.L/2+m&&Math.abs(q[1])<p.W/2+m)return p}return null}
/* el terreno del campo, perfectamente plano (y suavizado alrededor) */
function flattenPitches(){const n=TG.nx,h=TG.h;
  for(const p of FBP){let s=0,c=0;for(let u=-p.L/2;u<=p.L/2;u+=4)for(let v=-p.W/2;v<=p.W/2;v+=4){const w=fbW(p,u,v);s+=H(w[0],w[1]);c++}const y=Math.max(.6,s/c);p.y=y;
    const R=Math.hypot(p.L,p.W)/2+14;const i0=Math.max(0,Math.floor((p.cx-R)/GS)),i1=Math.min(n-1,Math.ceil((p.cx+R)/GS)),j0=Math.max(0,Math.floor((p.cz-R)/GS)),j1=Math.min(TG.nz-1,Math.ceil((p.cz+R)/GS));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const q=fbL(p,i*GS,j*GS);const d=Math.max(Math.abs(q[0])-p.L/2-3,Math.abs(q[1])-p.W/2-3);const k=j*n+i;
      if(d<=0)h[k]=y;else if(d<11){const t=d/11,e=t*t*(3-2*t);h[k]=y*(1-e)+h[k]*e}}}}
/* quita farolas, árboles, contenedores, muros… que caigan dentro del césped */
function clearPitchDeco(){const m=new THREE.Matrix4(),pos=new THREE.Vector3(),z0=new THREE.Matrix4().makeScale(0,0,0);let n=0;
  scene.traverse(o=>{if(!o.isInstancedMesh||o.userData.fb)return;let ch=false;for(let i=0;i<o.count;i++){o.getMatrixAt(i,m);pos.setFromMatrixPosition(m);if(inPitch(pos.x,pos.z,2.5)){o.setMatrixAt(i,z0);ch=true;n++}}if(ch)o.instanceMatrix.needsUpdate=true});
  for(const [k,l] of OBG){const f=l.filter(s=>!inPitch((s[0]+s[2])/2,(s[1]+s[3])/2,1));if(f.length!==l.length)OBG.set(k,f)}return n}

/* ---- campo de juego activo para cada modalidad ---- */
function fbField(p,mode){const f={p,mode,y:p.y||H(p.cx,p.cz)};
  if(mode===7&&p.modes[0]===11){const Lf=p.L-4;f.hl=(p.W-6)/2;f.hw=Math.min(Lf/4-2,24);const c=fbW(p,Lf/4,0);f.cx=c[0];f.cz=c[1];f.ax=p.vx;f.az=p.vz;f.gw=6;f.gh=2;f.cage=false}
  else{f.cx=p.cx;f.cz=p.cz;f.ax=p.ux;f.az=p.uz;if(mode===5){f.hl=p.L/2-1;f.hw=p.W/2-1;f.gw=3;f.gh=2;f.cage=true}else{f.hl=p.L/2-3;f.hw=p.W/2-3;f.gw=f.hl>48?7.32:6.5;f.gh=f.hl>48?2.44:2.2;f.cage=false}}
  f.bx=-f.az;f.bz=f.ax;f.box=mode===5?6:mode===7?Math.min(12,f.hl*.33):Math.min(16.5,f.hl*.32);return f}
const fW=(f,u,v)=>[f.cx+f.ax*u+f.bx*v,f.cz+f.az*u+f.bz*v];
const fL=(f,x,z)=>{const dx=x-f.cx,dz=z-f.cz;return[dx*f.ax+dz*f.az,dx*f.bx+dz*f.bz]};

/* ---- texturas: césped artificial con franjas de corte y líneas reglamentarias ---- */
function pitchTex(p){const ppm=p.L>60?10:20,Wc=Math.min(2048,Math.round(p.L*ppm)),Hc=Math.round(Wc*p.W/p.L),s=Wc/p.L,c=cvs(Wc,Hc),g=c.getContext('2d');
  g.fillStyle='#2f7d32';g.fillRect(0,0,Wc,Hc);const nS=p.L>60?14:8;for(let i=0;i<nS;i++){g.fillStyle=i&1?'#357f36':'#2c7430';g.fillRect(i*Wc/nS,0,Wc/nS+1,Hc)}
  for(let i=0;i<Wc*Hc/40;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(0,0,0,${Math.random()*.08})`:`rgba(190,255,170,${Math.random()*.06})`;g.fillRect(Math.random()*Wc,Math.random()*Hc,1.5,1.5)}
  for(let i=0;i<10;i++){g.fillStyle='rgba(120,110,60,.06)';g.beginPath();g.ellipse(Math.random()*Wc,Math.random()*Hc,20+Math.random()*80,10+Math.random()*40,0,0,TAU);g.fill()}
  const X=u=>(u+p.L/2)*s,Y=v=>(v+p.W/2)*s;
  const lines=(f,col,lw)=>{g.strokeStyle=col;g.lineWidth=lw*s;const pts=(u,v)=>{const w=fW(f,u,v);const q=fbL(p,w[0],w[1]);return[X(q[0]),Y(q[1])]};
    const poly=a=>{g.beginPath();a.forEach((q,i)=>{const r=pts(q[0],q[1]);i?g.lineTo(r[0],r[1]):g.moveTo(r[0],r[1])});g.stroke()};
    const arc=(u,v,r,a0,a1)=>{const a=[];for(let k=0;k<=36;k++){const t=a0+(a1-a0)*k/36;a.push([u+Math.cos(t)*r,v+Math.sin(t)*r])}poly(a)};
    const hl=f.hl,hw=f.hw,b=f.box,cr=f.mode===5?3:f.mode===7?6:9.15;
    poly([[-hl,-hw],[hl,-hw],[hl,hw],[-hl,hw],[-hl,-hw]]);poly([[0,-hw],[0,hw]]);arc(0,0,cr,0,TAU);
    for(const sg of [-1,1]){const gl=sg*hl;if(f.mode===5){arc(gl,0,6,sg>0?Math.PI/2:-Math.PI/2,sg>0?Math.PI*1.5:Math.PI/2)}else{const bw=Math.min(hw-1,f.gw/2+b);poly([[gl,-bw],[gl-sg*b,-bw],[gl-sg*b,bw],[gl,bw]]);
      const sb=f.mode===7?4:5.5,sw=f.gw/2+sb;poly([[gl,-sw],[gl-sg*sb,-sw],[gl-sg*sb,sw],[gl,sw]]);const ps=gl-sg*(f.mode===7?9:11);
      g.fillStyle=col;const r=pts(ps,0);g.beginPath();g.arc(r[0],r[1],.25*s,0,TAU);g.fill();const ang=Math.acos(Math.min(1,(b-(f.mode===7?9:11))/cr));arc(ps,0,cr,sg>0?Math.PI-ang:-ang,sg>0?Math.PI+ang:ang);
      for(const sv of [-1,1])arc(gl,sv*hw,1,sg>0?(sv>0?Math.PI:Math.PI/2):(sv>0?-Math.PI/2:0),sg>0?(sv>0?Math.PI*1.5:Math.PI):(sv>0?0:Math.PI/2))}}};
  if(p.modes[0]===11){const f7=fbField(p,7);lines(f7,'rgba(70,150,255,.85)',.1);const f7b=Object.assign({},f7);const c2=fbW(p,-(p.L-4)/4,0);f7b.cx=c2[0];f7b.cz=c2[1];lines(f7b,'rgba(70,150,255,.85)',.1)}
  lines(fbField(p,p.modes[0]),'rgba(250,250,250,.95)',.12);
  const t=tex(c);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
let NETTEX=null,FENCETEX=null;
function netTex(){if(NETTEX)return NETTEX;const c=cvs(64,64),g=c.getContext('2d');g.strokeStyle='rgba(245,245,245,.9)';g.lineWidth=2;for(let i=0;i<=64;i+=16){g.beginPath();g.moveTo(i,0);g.lineTo(i,64);g.moveTo(0,i);g.lineTo(64,i);g.stroke()}NETTEX=tex(c,true);return NETTEX}
function fenceTex(){if(FENCETEX)return FENCETEX;const c=cvs(64,64),g=c.getContext('2d');g.strokeStyle='rgba(40,90,60,.85)';g.lineWidth=2;for(let i=-64;i<=128;i+=12){g.beginPath();g.moveTo(i,0);g.lineTo(i+64,64);g.moveTo(i+64,0);g.lineTo(i,64);g.stroke()}FENCETEX=tex(c,true);return FENCETEX}
/* portería con postes, larguero, soportes y red */
function buildGoal(f,sg,grp){const gw=f.gw,gh=f.gh,dp=f.mode===11?2:1.4,w=fW(f,sg*f.hl,0),ry=Math.atan2(f.ax*sg,f.az*sg);const G=new THREE.Group();G.position.set(w[0],f.y,w[1]);G.rotation.y=ry;
  const white=stdMat('fbpost',{color:0xf4f4f4,roughness:.35,metalness:.2}),r=.06;
  const post=x=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,gh,10),white);m.position.set(x,gh/2,0);G.add(m)};post(-gw/2);post(gw/2);
  const bar=new THREE.Mesh(new THREE.CylinderGeometry(r,r,gw+2*r,10),white);bar.rotation.z=Math.PI/2;bar.position.set(0,gh,0);G.add(bar);
  const nm=new THREE.MeshBasicMaterial({map:netTex(),transparent:true,alphaTest:.3,side:THREE.DoubleSide,depthWrite:false});const nt=netTex();
  const pl=(w2,h2,x,y,z,rx,ry2,rep)=>{const g=new THREE.PlaneGeometry(w2,h2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*w2*5,uv.getY(i)*h2*5);const m=new THREE.Mesh(g,nm);m.position.set(x,y,z);m.rotation.set(rx||0,ry2||0,0);G.add(m)};
  pl(gw,dp,0,gh,dp/2,Math.PI/2);pl(gw,gh,0,gh/2,dp,0);for(const s of [-1,1])pl(dp,gh,s*gw/2,gh/2,dp/2,0,Math.PI/2);
  const sup=stdMat('fbsup',{color:0x9aa1a6,roughness:.5,metalness:.5});for(const s of [-1,1]){const m=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,dp,6),sup);m.rotation.x=Math.PI/2;m.position.set(s*gw/2,.03,dp/2);G.add(m)}
  grp.add(G);return G}
function buildFutbol(){const grp=new THREE.Group();scene.add(grp);let n=0;
  for(const p of FBP){if(p.y===undefined)p.y=H(p.cx,p.cz);const y=p.y;
    // césped
    const tm=new THREE.MeshLambertMaterial({map:pitchTex(p),polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});const g=new THREE.PlaneGeometry(p.L,p.W);const m=new THREE.Mesh(g,tm);m.rotation.x=-Math.PI/2;m.rotation.z=-p.a;
    m.position.set(p.cx,y+.06,p.cz);m.receiveShadow=HQ;m.renderOrder=2;grp.add(m);
    // franja exterior de césped/arena y bordillo
    const brd=new THREE.Mesh(new THREE.PlaneGeometry(p.L+6,p.W+6),new THREE.MeshLambertMaterial({color:p.cage?0x8b8f93:0x2e6b30,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3}));brd.rotation.x=-Math.PI/2;brd.rotation.z=-p.a;brd.position.set(p.cx,y+.05,p.cz);brd.renderOrder=1;grp.add(brd);
    // porterías fijas de la modalidad principal
    const f=fbField(p,p.modes[0]);f.y=y;for(const s of [-1,1])buildGoal(f,s,grp);
    // valla / jaula
    const fh=p.cage?4.5:2.6,FM=new THREE.MeshBasicMaterial({map:fenceTex(),transparent:true,alphaTest:.25,side:THREE.DoubleSide,depthWrite:false});const pm=M(0x2f4d3a);
    const L2=p.L/2+3,W2=p.W/2+3,cs=[[-L2,-W2],[L2,-W2],[L2,W2],[-L2,W2]];
    for(let i=0;i<4;i++){const a=cs[i],b=cs[(i+1)%4],A=fbW(p,a[0],a[1]),B=fbW(p,b[0],b[1]),len=Math.hypot(B[0]-A[0],B[1]-A[1]);const pg=new THREE.PlaneGeometry(len,fh);const uv=pg.attributes.uv;for(let k=0;k<uv.count;k++)uv.setXY(k,uv.getX(k)*len/1.2,uv.getY(k)*fh/1.2);
      const fm=new THREE.Mesh(pg,FM);fm.position.set((A[0]+B[0])/2,y+fh/2,(A[1]+B[1])/2);fm.rotation.y=Math.atan2(B[1]-A[1],-(B[0]-A[0]));grp.add(fm);
      for(let t=0;t<=len;t+=3){const x=A[0]+(B[0]-A[0])*t/len,z=A[1]+(B[1]-A[1])*t/len;const po=new THREE.Mesh(hc('fbpole',()=>new THREE.CylinderGeometry(.04,.04,1,6)),pm);po.scale.y=fh;po.position.set(x,y+fh/2,z);grp.add(po)}}
    // torres de focos
    const nl=p.lights,lm=new THREE.MeshBasicMaterial({color:0xfff6dc}),pmat=stdMat('fbtower',{color:0xb8bec4,roughness:.5,metalness:.6});
    for(let i=0;i<nl;i++){const side=i%2?1:-1,u=(nl===6?[-1,-1,0,0,1,1]:[-1,-1,1,1])[i]*p.L*.38;const w=fbW(p,u,side*(p.W/2+4.5)),ht=p.cage?9:16;
      const t=new THREE.Mesh(hc('fbtw',()=>new THREE.CylinderGeometry(.14,.24,1,8)),pmat);t.scale.y=ht;t.position.set(w[0],y+ht/2,w[1]);grp.add(t);
      const hd=new THREE.Group();hd.position.set(w[0],y+ht,w[1]);hd.rotation.y=Math.atan2(-p.vx*side,-p.vz*side);const fr=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.1,.25),M(0x3d4246));hd.add(fr);
      for(let k=0;k<6;k++){const l=new THREE.Mesh(new THREE.PlaneGeometry(.6,.42),lm);l.position.set(-.72+(k%3)*.72,k<3?.26:-.26,.13);hd.add(l)}hd.rotation.x=0;grp.add(hd)}
    // banquillos y cartel
    if(!p.cage)for(const s of [-1,1]){const w=fbW(p,s*7,p.W/2+2.2);const b=new THREE.Group();b.position.set(w[0],y,w[1]);b.rotation.y=Math.atan2(-p.vx,-p.vz);
      const roof=new THREE.Mesh(new THREE.BoxGeometry(5,.06,1.6),new THREE.MeshLambertMaterial({color:0x9fc9e8,transparent:true,opacity:.55}));roof.position.y=2.1;b.add(roof);
      const back=new THREE.Mesh(new THREE.BoxGeometry(5,2.1,.06),new THREE.MeshLambertMaterial({color:0x9fc9e8,transparent:true,opacity:.45}));back.position.set(0,1.05,.78);b.add(back);
      const seat=new THREE.Mesh(new THREE.BoxGeometry(4.6,.45,.5),M(s>0?0x1d5fbf:0xc62828));seat.position.set(0,.22,.4);b.add(seat);grp.add(b)}
    {const c=cvs(1024,128),g2=c.getContext('2d');g2.fillStyle='#0f3d24';g2.fillRect(0,0,1024,128);g2.fillStyle='#fff';g2.font='900 64px "Arial Black",Arial';g2.textAlign='center';g2.textBaseline='middle';
      let fs=64;while(g2.measureText(p.name.toUpperCase()).width>980&&fs>24){fs-=2;g2.font=`900 ${fs}px "Arial Black",Arial`}g2.fillText(p.name.toUpperCase(),512,66);
      const sm=new THREE.Mesh(new THREE.PlaneGeometry(12,1.5),signMat(tex(c)));const w=fbW(p,0,-(p.W/2+3.1));sm.position.set(w[0],y+fh+.9,w[1]);sm.rotation.y=Math.atan2(-p.vx,-p.vz)+Math.PI;grp.add(sm)}
    n++}
  const cl=clearPitchDeco();FB.grp=grp;return{pitches:n,cleared:cl}}

/* ============ PARTIDO ============ */
const FB={on:false,grp:null,f:null,pl:[],ball:null,score:[0,0],t:0,dur:300,state:'',st:0,me:null,cam:0,stats:null,charge:-1,stam:1,call:0,names:['AGUADULCE CF','']};
const RIVALS=['C.D. ROQUETAS','U.D. EL PARADOR','C.D. VÍCAR','LA MOJONERA C.F.','C.D. ALMERIMAR','C.D. HUÉRCAL'];
const KITS=[{shirt:0x1d5fbf,shorts:0xffffff,socks:0x1d5fbf},{shirt:0xc62828,shorts:0x1a1a1a,socks:0xc62828},{shirt:0x2e7d32,shorts:0xffffff,socks:0x2e7d32},{shirt:0xfbc02d,shorts:0x1a1a1a,socks:0xfbc02d}];
const GKK=[{shirt:0x22c55e,shorts:0x111111,socks:0x22c55e},{shirt:0xf59e0b,shorts:0x111111,socks:0xf59e0b}];
const FORM={5:[[-.93,0],[-.55,0],[-.2,-.55],[-.2,.55],[.1,0]],7:[[-.93,0],[-.62,-.55],[-.66,0],[-.62,.55],[-.3,-.35],[-.3,.35],[0,0]],
  11:[[-.94,0],[-.66,-.72],[-.7,-.26],[-.7,.26],[-.66,.72],[-.38,0],[-.3,-.45],[-.3,.45],[-.04,0],[-.08,-.66],[-.08,.66]]};
const ME_IDX={5:4,7:5,11:8};
/* futbolista: menos piezas que el soldado para que 22 jugadores vayan fluidos en el móvil */
function fbHuman(kit,skin,num,name){const g=new THREE.Group(),p={};const cl=c=>stdMat('fbc'+c,{color:c,roughness:.85,metalness:0}),sk=stdMat('fbs'+skin,{color:skin,roughness:.7,metalness:0});
  const add=(par,geo,m,x,y,z)=>{const e=new THREE.Mesh(geo,m);e.position.set(x||0,y||0,z||0);if(UHQ)e.castShadow=true;par.add(e);return e};
  const hips=new THREE.Group();hips.position.y=.98;g.add(hips);p.hips=hips;add(hips,hc('fbpel',()=>{const s=new THREE.SphereGeometry(.16,10,7);s.scale(1,.8,.75);return s}),cl(kit.shorts));
  const leg=x=>{const hp=new THREE.Group();hp.position.set(x,-.04,0);hips.add(hp);add(hp,hc('fbth',()=>capG(.085,.068,.4,8)),cl(kit.shorts));const kn=new THREE.Group();kn.position.y=-.43;hp.add(kn);add(kn,hc('fbcalf',()=>capG(.064,.048,.38,8)),cl(kit.socks));
    const ft=new THREE.Group();ft.position.y=-.42;kn.add(ft);add(ft,hc('fbboot',()=>{const s=new THREE.SphereGeometry(.068,8,6);s.scale(1,.6,1.95);s.translate(0,-.02,.06);return s}),cl(0x111111));return{hp,kn,ft}};
  p.L=leg(.095);p.R=leg(-.095);const sp=new THREE.Group();sp.position.y=.06;hips.add(sp);p.spine=sp;
  add(sp,hc('fbtorso',()=>{const pts=[[.14,0],[.16,.1],[.19,.25],[.21,.38],[.17,.47],[.07,.52]].map(q=>new THREE.Vector2(q[0],q[1]));const t=new THREE.LatheGeometry(pts,12);t.scale(1,1,.66);t.computeVertexNormals();return t}),cl(kit.shirt));
  if(num!==undefined){const c=cvs(128,128),q=c.getContext('2d');q.fillStyle='#fff';q.font='900 84px "Arial Black",Arial';q.textAlign='center';q.textBaseline='middle';q.fillText(String(num),64,70);
    const m=new THREE.Mesh(hc('fbnum',()=>new THREE.PlaneGeometry(.26,.26)),new THREE.MeshLambertMaterial({map:tex(c),transparent:true,alphaTest:.4}));m.position.set(0,.3,-.14);m.rotation.y=Math.PI;sp.add(m)}
  const head=new THREE.Group();head.position.y=.6;sp.add(head);p.head=head;add(head,hc('fbneck',()=>capG(.05,.05,.08,6)),sk,0,-.06,0);
  add(head,hc('fbskull',()=>{const s=new THREE.SphereGeometry(.11,12,10);s.scale(.92,1.1,1);s.translate(0,.11,0);return s}),sk);
  add(head,hc('fbhair',()=>{const s=new THREE.SphereGeometry(.117,12,7,0,TAU,0,Math.PI*.5);s.translate(0,.13,-.01);return s}),cl(0x1b130c));
  const arm=x=>{const sh=new THREE.Group();sh.position.set(x,.44,0);sp.add(sh);add(sh,hc('fbbic',()=>capG(.058,.05,.27,8)),cl(kit.shirt));const el=new THREE.Group();el.position.y=-.29;sh.add(el);add(el,hc('fbfore',()=>capG(.046,.038,.27,8)),sk);return{sh,el}};
  p.aL=arm(.23);p.aR=arm(-.23);
  if(!UHQ){const b=new THREE.Mesh(hc('fbblob',()=>new THREE.PlaneGeometry(1,1)),hc('fbblobm',()=>new THREE.MeshBasicMaterial({map:TX.blob,transparent:true,depthWrite:false})));b.rotation.x=-Math.PI/2;b.position.y=.08;b.renderOrder=6;g.add(b)}
  g.userData=p;return g}
function fbPose(h,t,spd,kick,mode,dive){const p=h.userData,a=clamp(spd/5,0,1.2),s=Math.sin(t),c=Math.cos(t),run=spd>5.5,A=(run?.85:.6)*Math.min(1,a);h.rotation.z=0;
  p.L.hp.rotation.x=-s*A;p.R.hp.rotation.x=s*A;p.L.kn.rotation.x=(.1+Math.max(0,c)*(run?1.5:1))*a;p.R.kn.rotation.x=(.1+Math.max(0,-c)*(run?1.5:1))*a;p.L.ft.rotation.x=p.R.ft.rotation.x=0;
  p.hips.position.y=.98-Math.abs(c)*.04*a;p.spine.rotation.x=run?.2:.08;p.spine.rotation.y=-s*.12*a;
  p.aL.sh.rotation.set(s*A*.9,0,.12);p.aR.sh.rotation.set(-s*A*.9,0,-.12);p.aL.el.rotation.x=p.aR.el.rotation.x=-(.5+a*.6);
  if(kick>0){const k=Math.sin(clamp(1-kick/.35,0,1)*Math.PI);p.R.hp.rotation.x=.9-k*2.1;p.R.kn.rotation.x=k<.5?1.4*(1-k):.2;p.L.hp.rotation.x=.25;p.L.kn.rotation.x=.2;p.spine.rotation.x=-.1;p.aL.sh.rotation.set(-.4,0,.9);p.aR.sh.rotation.set(.3,0,-.7)}
  if(mode==='gk'){p.hips.position.y=.86;p.L.kn.rotation.x+=.5;p.R.kn.rotation.x+=.5;p.L.hp.rotation.x-=.35;p.R.hp.rotation.x-=.35;p.spine.rotation.x=.35;p.aL.sh.rotation.set(-.9,0,.5);p.aR.sh.rotation.set(-.9,0,-.5);p.aL.el.rotation.x=p.aR.el.rotation.x=-.4}
  if(mode==='hold'){p.aL.sh.rotation.set(-1.2,0,.25);p.aR.sh.rotation.set(-1.2,0,-.25);p.aL.el.rotation.x=p.aR.el.rotation.x=-.9}
  if(mode==='throw'){p.aL.sh.rotation.set(-2.9,0,.2);p.aR.sh.rotation.set(-2.9,0,-.2);p.aL.el.rotation.x=p.aR.el.rotation.x=-.8}
  if(dive){h.rotation.z=dive*1.25;p.aL.sh.rotation.set(-3,0,.1);p.aR.sh.rotation.set(-3,0,-.1);p.hips.position.y=.7}
  if(mode==='cele'){p.aL.sh.rotation.set(-2.8,0,.5);p.aR.sh.rotation.set(-2.8,0,-.5);p.aL.el.rotation.x=p.aR.el.rotation.x=0}}
let BALLTEX=null;
function ballTex(){if(BALLTEX)return BALLTEX;const c=cvs(256,128),g=c.getContext('2d');g.fillStyle='#fafafa';g.fillRect(0,0,256,128);g.fillStyle='#161616';
  for(let i=0;i<12;i++){const x=(i%6)*42.6+(i>5?21:0),y=i>5?92:36;g.beginPath();for(let k=0;k<5;k++){const a=k/5*TAU-Math.PI/2;g.lineTo(x+Math.cos(a)*12,y+Math.sin(a)*12*1.2)}g.fill()}
  g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1.5;for(let x=0;x<256;x+=21){g.beginPath();g.moveTo(x,0);g.lineTo(x+10,128);g.stroke()}BALLTEX=tex(c);return BALLTEX}

/* ---- sonido del partido ---- */
function fbDest(){return MASTER||AC.destination}
function whistle(n,long){if(!AC)return;for(let k=0;k<(n||1);k++){const t=AC.currentTime+k*.32,d=long?.9:.22;const o=AC.createOscillator(),o2=AC.createOscillator(),lf=AC.createOscillator(),lg=AC.createGain(),g=AC.createGain();o.frequency.value=2900;o2.frequency.value=3080;lf.frequency.value=28;lg.gain.value=90;lf.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.09,t+.02);g.gain.setValueAtTime(.09,t+d-.05);g.gain.linearRampToValueAtTime(0,t+d);o.connect(g);o2.connect(g);g.connect(fbDest());for(const x of [o,o2,lf]){x.start(t);x.stop(t+d+.05)}}}
function kickSnd(pw){if(!AC)return;const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=900+pw*1200;const g=AC.createGain();g.gain.setValueAtTime(.35*Math.min(1,.3+pw),t);g.gain.exponentialRampToValueAtTime(.001,t+.12);s.connect(f);f.connect(g);g.connect(fbDest());s.start(t,Math.random());s.stop(t+.14);
  const o=AC.createOscillator(),og=AC.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(60,t+.1);og.gain.setValueAtTime(.3*Math.min(1,.3+pw),t);og.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(og);og.connect(fbDest());o.start(t);o.stop(t+.13)}
let CROWD=null;
function crowdOn(on){if(!AC)return;if(on&&!CROWD){const s=noiseSrc(),f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=700;f.Q.value=.6;const g=AC.createGain();g.gain.value=0;s.connect(f);f.connect(g);g.connect(fbDest());CROWD={s,g,f};g.gain.setTargetAtTime(FB.mode===11?.05:.025,AC.currentTime,.8)}
  if(!on&&CROWD){CROWD.g.gain.setTargetAtTime(0,AC.currentTime,.3);const c=CROWD;setTimeout(()=>{try{c.s.stop()}catch(e){}},1500);CROWD=null}}
function crowdRoar(v,d){if(!CROWD)return;const t=AC.currentTime,base=FB.mode===11?.05:.025;CROWD.g.gain.cancelScheduledValues(t);CROWD.g.gain.setTargetAtTime(base+v,t,.15);CROWD.g.gain.setTargetAtTime(base,t+(d||2.5),1.2)}

/* ---- arranque y final ---- */
function fbStart(p,mode){if(FB.on)return;if(RACE){toast('Acaba la carrera primero');return}audio();
  {const sp=fbW(p,0,p.W/2+(p.cage?9:16));const s=freeSpot(sp[0],sp[1],2.2);ME.x=s[0];ME.z=s[1];ME.vx=ME.vz=ME.vf=0;ME.y=surfaceY(ME.x,ME.z);ME.yaw=Math.atan2(-p.vx,-p.vz);ME.park=undefined;if(!FOOT.on)exitCar()}
  if(!FOOT.on)return;const f=fbField(p,mode);f.y=p.y;FB.f=f;FB.mode=mode;FB.p=p;FB.on=true;FB.score=[0,0];FB.t=0;FB.dur=(S.set&&S.set.fbdur)||(mode===11?360:mode===7?300:240);FB.half=1;
  FB.names=['AGUADULCE CF',RIVALS[Math.floor(Math.random()*RIVALS.length)]];const k1=Math.random()<.5?1:3;FB.kits=[KITS[0],KITS[k1]];
  FB.stats={sh:[0,0],ot:[0,0],pos:[0,0],pass:0,passOk:0,goals:0,ast:0,tk:0,shMe:0};FB.charge=-1;FB.stam=1;FB.cam=(S.set&&S.set.fbcam)||0;FB.lastPassFrom=null;
  FB.grpM=new THREE.Group();scene.add(FB.grpM);
  if(mode===7&&p.modes[0]===11)for(const s of [-1,1])buildGoal(f,s,FB.grpM);
  FB.pl=[];const F=FORM[mode];const skins=[0xe8b48f,0xc68a62,0x8d5a3b,0xf1c6a5,0xd9a07a,0x6b4329];
  for(let tm=0;tm<2;tm++)for(let i=0;i<F.length;i++){const gk=i===0,kit=gk?GKK[tm]:FB.kits[tm];const num=gk?1:[0,4,5,3,2,6,8,10,9,7,11][i]||i+1;const isMe=tm===0&&i===ME_IDX[mode];
    const m=fbHuman(kit,skins[(i*7+tm*3)%skins.length],num);FB.grpM.add(m);FB.pl.push({tm,i,gk,m,x:0,z:0,vx:0,vz:0,yaw:0,t:Math.random()*6,kick:0,cool:0,dive:0,me:isMe,num,dec:Math.random()*.3,run:0,hold:0})}
  FB.me=FB.pl.find(q=>q.me);
  // indicador de tu jugador (como el de los modos de un solo jugador)
  {const c=cvs(128,128),g=c.getContext('2d');g.fillStyle='#ffe14d';g.beginPath();g.moveTo(64,118);g.lineTo(24,52);g.lineTo(104,52);g.closePath();g.fill();g.fillStyle='#0b0f17';g.font='900 34px Arial';g.textAlign='center';g.fillText('TÚ',64,40);
    const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex(c),depthTest:false,transparent:true}));sp.scale.set(.7,.7,1);sp.renderOrder=20;FB.mark=sp;FB.grpM.add(sp);
    const ring=new THREE.Mesh(new THREE.RingGeometry(.55,.7,24),new THREE.MeshBasicMaterial({color:0xffe14d,transparent:true,opacity:.8,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.renderOrder=7;FB.ring=ring;FB.grpM.add(ring)}
  const bm=new THREE.Mesh(new THREE.SphereGeometry(.11,20,14),new THREE.MeshStandardMaterial({map:ballTex(),roughness:.45,metalness:0,envMap:envMap||null}));bm.castShadow=HQ;FB.grpM.add(bm);
  const bs=new THREE.Mesh(new THREE.CircleGeometry(.16,14),new THREE.MeshBasicMaterial({color:0,transparent:true,opacity:.35,depthWrite:false}));bs.rotation.x=-Math.PI/2;bs.renderOrder=6;FB.grpM.add(bs);
  FB.ball={m:bm,sh:bs,x:0,y:0,z:0,vx:0,vy:0,vz:0,owner:null,last:0,spin:0};
  FOOT.m.visible=false;document.body.classList.add('futbol');$('fbHud').hidden=false;$('fbUI').hidden=!IS_TOUCH;fbKickoff(Math.random()<.5?0:1);FB.firstKick=FB.kickTeam;crowdOn(true);
  toggleMenu(false);feed(IS_TOUCH?'⚽ Joystick: mover · TIRO (mantén para potencia) · PASE · CENTRO · SPRINT · CÁM':'⚽ WASD mover · Shift sprint · Espacio tiro (mantén) / entrada · E pase / pedir balón · Q centro o pase al hueco · C cámara · Esc salir');
  bigMsg(FB.names[0].split(' ')[0]+' vs '+FB.names[1].split(' ').slice(-1)[0],'#ffe14d')}
function fbKickoff(tm){const f=FB.f;FB.state='kick';FB.st=1.6;FB.kickTeam=tm;
  for(const q of FB.pl){const F=FORM[FB.mode][q.i],s=q.tm===0?1:-1;let u=F[0]*f.hl,v=F[1]*f.hw;u=Math.min(u,-1.2);if(q.tm!==tm&&!q.gk)u=Math.min(u,-(FB.mode===5?3.5:9.5));
    const w=fW(f,u*s,v*s);q.x=w[0];q.z=w[1];q.vx=q.vz=0;q.yaw=Math.atan2(f.ax*s,f.az*s)}
  const taker=FB.pl.filter(q=>q.tm===tm&&!q.gk).sort((a,b)=>Math.abs(fL(f,a.x,a.z)[0])+Math.abs(fL(f,a.x,a.z)[1])*.5-Math.abs(fL(f,b.x,b.z)[0])-Math.abs(fL(f,b.x,b.z)[1])*.5)[0];
  const s=tm===0?1:-1,w=fW(f,-.6*s,0);taker.x=w[0];taker.z=w[1];const b=FB.ball;b.x=f.cx;b.z=f.cz;b.y=f.y+.11;b.vx=b.vy=b.vz=0;b.owner=null;FB.taker=taker;}
function fbEnd(abandon){if(!FB.on)return;FB.on=false;crowdOn(false);document.body.classList.remove('futbol');$('fbHud').hidden=true;$('fbUI').hidden=true;
  const me=FB.me;FOOT.x=me.x;FOOT.z=me.z;FOOT.y=H(me.x,me.z);FOOT.m.visible=true;scene.remove(FB.grpM);FB.grpM=null;FB.pl=[];
  if(abandon)return;const st=FB.stats,[a,b]=FB.score,tp=st.pos[0]+st.pos[1]||1;const res=a>b?'VICTORIA':a<b?'DERROTA':'EMPATE';
  const rating=clamp(6+(a>b?.6:a<b?-.4:0)+st.goals*1.1+st.ast*.7+st.tk*.15+st.passOk*.04-(st.pass-st.passOk)*.08+st.shMe*.05,3,10);
  const xp=Math.round(150+st.goals*120+st.ast*70+(a>b?200:a===b?80:0));S.xp=(S.xp||0)+xp;save();
  $('resBody').innerHTML=`<div class="logo" style="font-size:44px">${res}</div><div class="row" style="justify-content:center;gap:18px"><h4>${FB.names[0]}</h4><b style="font-size:34px">${a} – ${b}</b><h4>${FB.names[1]}</h4></div>
    <div class="row"><small>Posesión</small><b>${Math.round(st.pos[0]/tp*100)}% – ${Math.round(st.pos[1]/tp*100)}%</b></div><div class="row"><small>Tiros (a puerta)</small><b>${st.sh[0]} (${st.ot[0]}) – ${st.sh[1]} (${st.ot[1]})</b></div>
    <div class="row"><small>Tus goles · asistencias · entradas ganadas</small><b>${st.goals} · ${st.ast} · ${st.tk}</b></div><div class="row"><small>Tus pases completados</small><b>${st.passOk}/${st.pass}</b></div>
    <div class="row"><small>Tu valoración</small><b style="color:#ffe14d;font-size:26px">${rating.toFixed(1)}</b></div><div class="row"><small>Experiencia</small><b>+${xp} XP</b></div>
    <div style="display:flex;gap:8px;justify-content:center"><button class="go" id="resAgain" type="button">REVANCHA</button><button class="chip" id="resClose" type="button">SALIR DEL CAMPO</button></div>`;
  $('results').hidden=false;const p=FB.p,m=FB.mode;$('resClose').onclick=()=>{$('results').hidden=true};$('resAgain').onclick=()=>{$('results').hidden=true;fbStart(p,m)}}

/* ---- física del balón ---- */
const G9=9.81;
function fbKick(q,dx,dz,sp,vy,kind){const b=FB.ball,L=Math.hypot(dx,dz)||1;if(q.restart)FB.grace=.6;b.owner=null;b.vx=dx/L*sp;b.vz=dz/L*sp;b.vy=vy;b.y=Math.max(b.y,FB.f.y+.12);b.last=q.tm;b.lastQ=q;q.cool=.45;q.kick=.35;q.hold=0;kickSnd(sp/30);FB.lastKind=kind;FB.kickFrom=q;
  if(kind==='pass'||kind==='cross'){FB.lastPassFrom=q;if(q.me){FB.stats.pass++;FB.pendPass=true}}if(kind==='shot'){FB.stats.sh[q.tm]++;FB.shotT=2.5;if(q.me)FB.stats.shMe++}}
function fbBall(dt){const b=FB.ball,f=FB.f,gy=f.y+.11;
  if(b.owner){const q=b.owner,fx=Math.sin(q.yaw),fz=Math.cos(q.yaw),sp=Math.hypot(q.vx,q.vz),ahead=q.gk&&q.hold>0?.35:.45+sp*.06;
    const tx=q.x+fx*ahead,tz=q.z+fz*ahead;if(q.gk&&q.hold>0){b.x=tx;b.z=tz;b.y=f.y+1.05;b.vx=b.vz=b.vy=0}else{b.vx=(tx-b.x)*14;b.vz=(tz-b.z)*14;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y=gy;b.vy=0}}
  else{b.vy-=G9*dt;const drag=b.y>gy+.05?.015:0;b.vx*=1-drag;b.vz*=1-drag;b.x+=b.vx*dt;b.z+=b.vz*dt;b.y+=b.vy*dt;
    if(b.y<=gy){b.y=gy;if(b.vy<-1.2){b.vy=-b.vy*.5;}else b.vy=0;const s=Math.hypot(b.vx,b.vz);if(b.vy===0&&s>0){const ns=Math.max(0,s-(1.6+s*.35)*dt);b.vx*=ns/s;b.vz*=ns/s}}}
  // jaula del fútbol 5 y porterías
  const q=fL(f,b.x,b.z),u=q[0],v=q[1],hgt=b.y-f.y;
  if(f.cage){const lw=f.hw+1.6,ll=f.hl+1.6;if(Math.abs(v)>lw){const n=Math.sign(v);fbReflect(0,-n,.6);const w=fW(f,u,n*lw);b.x=w[0];b.z=w[1]}
    if(Math.abs(u)>ll&&!(Math.abs(v)<f.gw/2&&hgt<f.gh)){const n=Math.sign(u);fbReflect(-n,0,.6);const w=fW(f,n*ll,v);b.x=w[0];b.z=w[1]}if(hgt>4.4&&b.vy>0)b.vy*=-.4}
  // postes y larguero
  for(const sg of [-1,1]){const du=u-sg*f.hl;if(Math.abs(du)<.25){for(const sv of [-1,1]){const dv=v-sv*f.gw/2;if(Math.hypot(du,dv)<.17&&hgt<f.gh+.05){fbReflect(du,dv,.7);kickSnd(.6)}}
    if(Math.abs(v)<f.gw/2&&Math.abs(hgt-f.gh)<.16){const dh=hgt-f.gh;b.vy=Math.abs(b.vy)*(dh>0?.6:-.6);fbReflect(du||-sg,0,.6);kickSnd(.6)}}}
  // gol
  if(FB.state==='play'&&Math.abs(u)>f.hl+.11&&Math.abs(v)<f.gw/2-.1&&hgt<f.gh-.08){fbGoal(u>0?0:1);return}
  // red: frena el balón dentro de la portería
  if(Math.abs(u)>f.hl+.2&&Math.abs(v)<f.gw/2+.3){const dp=f.mode===11?2:1.4;if(Math.abs(u)>f.hl+dp-.15){b.vx*=.2;b.vz*=.2;b.vy*=.3;const w=fW(f,Math.sign(u)*(f.hl+dp-.15),v);b.x=w[0];b.z=w[1]}}
  // fuera de banda o de fondo
  if(FB.state==='play'&&!f.cage&&(FB.grace||0)<=0&&!(b.owner&&b.owner.restart)){if(Math.abs(v)>f.hw+.12)fbOut('throw',u,Math.sign(v)*f.hw);else if(Math.abs(u)>f.hl+.12&&!(Math.abs(v)<f.gw/2&&hgt<f.gh))fbOut('end',Math.sign(u)*f.hl,v)}
  b.m.position.set(b.x,b.y,b.z);const sp=Math.hypot(b.vx,b.vz);if(sp>.05){const ax=new THREE.Vector3(b.vz,0,-b.vx).normalize();b.m.rotateOnWorldAxis(ax,sp*dt/.11)}
  b.sh.position.set(b.x,f.y+.075,b.z);const sc=clamp(1-(b.y-gy)/6,.3,1);b.sh.scale.set(sc,sc,1)}
function fbReflect(nu,nv,e){const f=FB.f,b=FB.ball,L=Math.hypot(nu,nv)||1;nu/=L;nv/=L;const nx=f.ax*nu+f.bx*nv,nz=f.az*nu+f.bz*nv,d=b.vx*nx+b.vz*nz;if(d<0){b.vx-=(1+e)*d*nx;b.vz-=(1+e)*d*nz}}
function fbGoal(tm){const st=FB.stats,b=FB.ball;FB.score[tm]++;if(FB.shotT>0)st.ot[tm]++;FB.state='goal';FB.st=3.6;FB.goalTeam=tm;whistle(1);crowdRoar(tm===0?.35:.12,3);
  const sc=b.lastQ;let txt='¡GOOOL!';if(sc&&sc.tm===tm){if(sc.me){st.goals++;txt='¡GOLAZO TUYO!'}else if(FB.lastPassFrom&&FB.lastPassFrom.me&&FB.lastPassFrom!==sc)st.ast++}
  bigMsg(txt,tm===0?'#ffe14d':'#ff5a5a');feed(`⚽ ${FB.names[tm]} · ${FB.score[0]}–${FB.score[1]}`);b.vx*=.15;b.vz*=.15}
function fbOut(kind,u,v){const f=FB.f,b=FB.ball,last=b.last,tm=1-last;FB.state='dead';FB.st=1.1;whistle(1);
  let type=kind,pu=u,pv=v;if(kind==='end'){const defending=u>0?1:0;if(last===defending){type='corner';pv=Math.sign(v||1)*f.hw}else{type='gk';}}
  if(type==='gk'){const s=u>0?1:-1;FB.restart={type,tm:u>0?1:0,u:s*(f.hl-(f.mode===5?1:5)),v:0}}else FB.restart={type,tm:type==='corner'?(u>0?0:1):tm,u:pu,v:pv};
  bigMsg(type==='corner'?'CÓRNER':type==='gk'?'SAQUE DE PUERTA':'SAQUE DE BANDA','#fff')}
function fbDoRestart(){const r=FB.restart,f=FB.f,b=FB.ball;let q;if(r.type==='gk')q=FB.pl.find(p=>p.gk&&p.tm===r.tm);else{q=null;let bd=1e9;for(const p of FB.pl){if(p.tm!==r.tm||p.gk)continue;const w=fW(f,r.u,r.v),d=Math.hypot(p.x-w[0],p.z-w[1]);if(d<bd){bd=d;q=p}}if(FB.me.tm===r.tm&&Math.hypot(FB.me.x-fW(f,r.u,r.v)[0],FB.me.z-fW(f,r.u,r.v)[1])<bd+6)q=FB.me}
  const off=r.type==='throw'?Math.sign(r.v)*.5:r.type==='corner'?Math.sign(r.u)*.6:0;const w=fW(f,r.u+(r.type==='corner'?off:0),r.v+(r.type==='throw'?off:0)+(r.type==='corner'?Math.sign(r.v)*.6:0));
  q.x=w[0];q.z=w[1];q.vx=q.vz=0;const c=fW(f,r.type==='corner'?r.u*.7:r.u*.6,0);q.yaw=Math.atan2(c[0]-q.x,c[1]-q.z);b.owner=q;b.x=q.x;b.z=q.z;b.y=f.y+.11;b.vx=b.vy=b.vz=0;q.hold=r.type==='gk'?1.4:r.type==='throw'?1.2:1.6;q.restart=r.type;
  // aparta a los rivales del lanzamiento
  for(const p of FB.pl)if(p.tm!==q.tm){const d=Math.hypot(p.x-q.x,p.z-q.z);if(d<(r.type==='throw'?2.5:6)){p.x=q.x+(p.x-q.x)/(d||1)*7;p.z=q.z+(p.z-q.z)/(d||1)*7}}
  FB.state='play';FB.restart=null}

/* ---- inteligencia artificial ---- */
function fbAtt(tm){return tm===0?1:-1}
function fbGoalPt(f,tm){return fW(f,fbAtt(tm)*f.hl,0)}// portería que ataca el equipo tm
function fbOpen(q,toX,toZ){let m=99;for(const o of FB.pl){if(o.tm===q.tm)continue;const d=distSeg(o.x,o.z,q.x,q.z,toX,toZ);if(d<m)m=d}return m}
function fbBestPass(q,dirx,dirz,forward){const f=FB.f,s=fbAtt(q.tm),qu=fL(f,q.x,q.z)[0]*s;let best=null,bs=-1e9;
  for(const t of FB.pl){if(t===q||t.tm!==q.tm||t.gk&&FB.mode!==5&&!forward&&false)continue;if(t.gk&&q.gk)continue;const dx=t.x-q.x,dz=t.z-q.z,d=Math.hypot(dx,dz);if(d<4||d>(FB.mode===11?38:26))continue;
    const lead=Math.min(.8,d/18);const tx=t.x+t.vx*lead,tz=t.z+t.vz*lead;const op=fbOpen(q,tx,tz);if(op<1.2)continue;let sc=Math.min(op,6)*1.2-d*.08;
    const tu=fL(f,t.x,t.z)[0]*s;sc+=(tu-qu)*(forward?.22:.08);if(t.gk)sc-=6;if(dirx!==undefined){const al=(dx*dirx+dz*dirz)/d;sc+=al*9;if(al<.35)sc-=10}if(t.me&&FB.call>0)sc+=8;if(sc>bs){bs=sc;best={t,tx,tz,d}}}
  return best}
function fbPass(q,dirx,dirz,lob){const p=fbBestPass(q,dirx,dirz,lob);let tx,tz,d;if(p){({tx,tz,d}=p)}else{const L=Math.hypot(dirx||Math.sin(q.yaw),dirz||Math.cos(q.yaw));tx=q.x+(dirx||Math.sin(q.yaw))/L*14;tz=q.z+(dirz||Math.cos(q.yaw))/L*14;d=14}
  if(lob){const t=clamp(d/16,.7,1.6);fbKick(q,tx-q.x,tz-q.z,d/t*.92,G9*t*.48,'cross')}else fbKick(q,tx-q.x,tz-q.z,clamp(d*.75+5.5,8,19),.4,'pass');if(p)FB.target=p.t}
function fbShoot(q,pw,aimV){const f=FB.f,s=fbAtt(q.tm),g=fbGoalPt(f,q.tm);const qd=Math.hypot(g[0]-q.x,g[1]-q.z);const err=(1-(q.me?.45:.25))*(.25+pw*pw*.6)+qd*.012;
  let v=(aimV!==undefined?aimV:(Math.random()<.5?-1:1)*(.45+Math.random()*.4))*f.gw/2*.85+rnd(-1,1)*err*2;const w=fW(f,s*f.hl,v);const sp=17+pw*15,t=qd/sp;const hgt=.3+pw*1.6+rnd(-.4,.8)*err*2;
  fbKick(q,w[0]-q.x,w[1]-q.z,sp,clamp(hgt/t+.5*G9*t,.5,9),'shot')}
function fbSteer(q,tx,tz,sp,dt){const dx=tx-q.x,dz=tz-q.z,d=Math.hypot(dx,dz);let wx=0,wz=0;if(d>.3){const k=Math.min(sp,d*2.2)/d;wx=dx*k;wz=dz*k}
  // separación entre jugadores
  for(const o of FB.pl){if(o===q)continue;const ex=q.x-o.x,ez=q.z-o.z,e=Math.hypot(ex,ez);if(e<1.4&&e>.01){wx+=ex/e*(1.4-e)*3;wz+=ez/e*(1.4-e)*3}}
  const ac=Math.min(1,dt*(q.gk?9:6));q.vx+=(wx-q.vx)*ac;q.vz+=(wz-q.vz)*ac}
function fbAI(q,dt){const f=FB.f,b=FB.ball,s=fbAtt(q.tm),F=FORM[FB.mode][q.i];const bl=fL(f,b.x,b.z),own=b.owner&&b.owner.tm===q.tm,has=b.owner===q;
  const sprint=FB.mode===5?6.6:7.4,jog=5.2;
  if(q.gk){fbKeeper(q,dt,bl);return}
  if(has){fbCarrier(q,dt);return}
  // ¿soy el que presiona o va a por el balón suelto?
  const mates=FB.pl.filter(p=>p.tm===q.tm&&!p.gk&&!p.me).sort((a,c)=>Math.hypot(a.x-b.x,a.z-b.z)-Math.hypot(c.x-b.x,c.z-b.z));const nP=FB.mode===11?2:1;
  const chase=(!own&&mates.indexOf(q)<nP&&!(FB.me.tm===q.tm&&Math.hypot(FB.me.x-b.x,FB.me.z-b.z)<Math.hypot(q.x-b.x,q.z-b.z)-1&&!b.owner));
  if(FB.target===q&&!b.owner){const tx=b.x+b.vx*.25,tz=b.z+b.vz*.25;fbSteer(q,tx,tz,sprint,dt);return}
  if(chase){let tx=b.x+b.vx*.35,tz=b.z+b.vz*.35;if(b.owner){const g=fbGoalPt(f,1-q.tm);const gx=g[0]-b.x,gz=g[1]-b.z,gl=Math.hypot(gx,gz)||1;tx=b.x+gx/gl*.9;tz=b.z+gz/gl*.9}fbSteer(q,tx,tz,mates.indexOf(q)===0?sprint:jog+.8,dt);
    if(b.owner&&b.owner.tm!==q.tm&&Math.hypot(q.x-b.x,q.z-b.z)<1.15&&q.cool<=0){q.cool=.8;const pS=b.owner.me?.42:.3;if(Math.random()<pS){fbSteal(q,b.owner)}}return}
  // posición táctica: bloque que se adelanta con la posesión y bascula hacia el balón
  let u=F[0]*f.hl,v=F[1]*f.hw;const bu=bl[0]*s,bv=bl[1]*s;u+=own?f.hl*.42:f.hl*.06;u+=bu*.38;v+=bv*.3;if(own&&F[0]>-.2)u+=f.hl*.12;
  u=clamp(u,-f.hl*.92,f.hl*.82);if(!own)u=Math.min(u,bu+f.hl*.1);v=clamp(v,-f.hw*.92,f.hw*.92);
  // desmarque cuando atacamos
  if(own){q.run-=dt;if(q.run<=0){q.run=1.5+Math.random()*2.5;q.rv=rnd(-1,1)*f.hw*.15;q.ru=rnd(0,1)*f.hl*.12}u+=q.ru||0;v+=q.rv||0}
  const w=fW(f,u*s,v*s);fbSteer(q,w[0],w[1],Math.hypot(w[0]-q.x,w[1]-q.z)>8?sprint-.6:jog,dt)}
function fbSteal(q,o){const b=FB.ball;kickSnd(.25);if(Math.random()<.55){b.owner=q;b.last=q.tm;b.lastQ=q}else{b.owner=null;b.vx=(Math.random()-.5)*6+q.vx*.5;b.vz=(Math.random()-.5)*6+q.vz*.5;b.vy=1;b.last=q.tm;b.lastQ=q}o.cool=.6;if(q.me)FB.stats.tk++;FB.target=null}
function fbCarrier(q,dt){const f=FB.f,s=fbAtt(q.tm),g=fbGoalPt(f,q.tm),b=FB.ball;
  if(q.hold>0){q.hold-=dt;q.vx*=.8;q.vz*=.8;if(q.hold<=0){if(q.restart==='corner')fbPass(q,undefined,undefined,true);else if(q.restart==='gk'&&FB.mode!==5){const p=fbBestPass(q,undefined,undefined,true);if(p&&p.d>18)fbPass(q,p.tx-q.x,p.tz-q.z,true);else fbPass(q)}else fbPass(q);q.restart=null}return}
  const gd=Math.hypot(g[0]-q.x,g[1]-q.z);let press=99;for(const o of FB.pl)if(o.tm!==q.tm){const d=Math.hypot(o.x-q.x,o.z-q.z);if(d<press)press=d}
  q.dec-=dt;const range=FB.mode===11?29:FB.mode===7?23:13;
  if(q.dec<=0){q.dec=.22+Math.random()*.2;const ang=Math.abs(fL(f,q.x,q.z)[1])/Math.max(1,gd);
    if(gd<range&&ang<.9&&Math.random()<(gd<range*.55?.8:.4)){fbShoot(q,clamp(gd/range,.35,.95));return}
    if(press<2.4&&Math.random()<.7){fbPass(q);return}
    if(Math.random()<.24){const p=fbBestPass(q,undefined,undefined,true);if(p&&fL(f,p.t.x,p.t.z)[0]*s>fL(f,q.x,q.z)[0]*s+4){fbPass(q,p.tx-q.x,p.tz-q.z,false);return}}
    // si tú pides el balón, te lo da
    if(FB.call>0&&q.tm===FB.me.tm&&fbOpen(q,FB.me.x,FB.me.z)>1.4){fbKick(q,FB.me.x+FB.me.vx*.4-q.x,FB.me.z+FB.me.vz*.4-q.z,clamp(Math.hypot(FB.me.x-q.x,FB.me.z-q.z)*.75+5.5,8,19),.4,'pass');FB.target=FB.me;FB.call=0;return}}
  // conducción hacia portería esquivando
  let tx=g[0],tz=g[1];for(const o of FB.pl){if(o.tm===q.tm)continue;const dx=q.x-o.x,dz=q.z-o.z,d=Math.hypot(dx,dz);if(d<5){tx+=dz/d*(5-d)*3*(Math.sign(fL(f,q.x,q.z)[1])||1);tz-=dx/d*(5-d)*3*(Math.sign(fL(f,q.x,q.z)[1])||1)}}
  fbSteer(q,tx,tz,FB.mode===5?5.6:6.3,dt)}
function fbKeeper(q,dt,bl){const f=FB.f,b=FB.ball,s=fbAtt(q.tm),gu=-s*f.hl;q.dive=Math.max(0,Math.abs(q.dive)-dt*1.2)*Math.sign(q.dive);
  if(b.owner===q){if(q.hold<=0&&!q.restart){q.hold=1.1;q.restart='gk'}fbCarrier(q,dt);return}
  // ¿balón hacia mi portería?
  const bu=bl[0],bv=bl[1];const vu=b.vx*f.ax+b.vz*f.az,vv=b.vx*f.bx+b.vz*f.bz;let tu,tv;
  if(!b.owner&&vu*s<-3&&(bu-gu)*s<f.hl*.9){const tt=(gu-bu)/vu;const pv=bv+vv*tt;tu=gu+s*.4;tv=clamp(pv,-f.gw/2-.6,f.gw/2+.6);
    const w=fW(f,tu,tv);const d=Math.hypot(w[0]-q.x,w[1]-q.z);fbSteer(q,w[0],w[1],7.5,dt);
    const bd=Math.hypot(b.x-q.x,b.z-q.z),bh=b.y-f.y;if(bd<2.4&&bd>.9&&!q.dive&&tt<.45){q.dive=clamp((tv-fL(f,q.x,q.z)[1])*s*-1,-1,1)||(Math.random()<.5?-1:1)}
    const reach=q.dive?2:1.05;if(bd<reach&&bh<2.6&&q.cool<=0){const sp=Math.hypot(b.vx,b.vz,b.vy);const pc=clamp(1.3-sp/36,.3,.95);
      if(Math.random()<pc){b.owner=q;b.last=q.tm;b.lastQ=q;q.hold=1.3;q.restart='gk';if(FB.shotT>0)FB.stats.ot[1-q.tm]++;crowdRoar(.1,1.5);if(FB.shotT>0)feed(q.tm===0?'🧤 ¡Paradón de tu portero!':'🧤 ¡Parada del portero rival!')}
      else{const n=s;b.vx=n*f.ax*rnd(3,7)+f.bx*rnd(-6,6);b.vz=n*f.az*rnd(3,7)+f.bz*rnd(-6,6);b.vy=rnd(1,4);b.last=q.tm;b.lastQ=q;q.cool=.6;if(FB.shotT>0)FB.stats.ot[1-q.tm]++;kickSnd(.5);crowdRoar(.15,1.5)}}
    return}
  // sale a por balones sueltos cerca del área
  if(!b.owner&&(bu-gu)*s<f.box*.9&&Math.abs(bv)<f.box&&Math.hypot(b.vx,b.vz)<9){fbSteer(q,b.x,b.z,6.5,dt);if(Math.hypot(b.x-q.x,b.z-q.z)<.9&&b.y-f.y<2.2){b.owner=q;b.last=q.tm;b.lastQ=q;q.hold=1.1;q.restart='gk'}return}
  // colocación: en la bisectriz entre el balón y la portería
  const gx=fW(f,gu,0),dx=b.x-gx[0],dz=b.z-gx[1],dl=Math.hypot(dx,dz)||1;const o=Math.min(FB.mode===5?2:4.5,dl*.18);fbSteer(q,gx[0]+dx/dl*o,gx[1]+dz/dl*o,5,dt)}

/* ---- tu jugador ---- */
const FBK={shoot:false,pass:false,lob:false,sprint:false,tackle:false,_shoot:false};
function fbMe(q,dt){const f=FB.f,b=FB.ball;let mx=(keys.KeyD?1:0)-(keys.KeyA?1:0),mz=(keys.KeyW?1:0)-(keys.KeyS?1:0);if(fin.mx||fin.mz){mx=fin.mx;mz=fin.mz}
  const gp=navigator.getGamepads?[...navigator.getGamepads()].find(Boolean):null;if(gp){const ax=gp.axes,dz=v=>Math.abs(v)>.15?v:0;if(dz(ax[0])||dz(ax[1])){mx=dz(ax[0]);mz=-dz(ax[1])}
    FBK.gpS=!!(gp.buttons[1]&&gp.buttons[1].pressed);FBK.gpP=!!(gp.buttons[0]&&gp.buttons[0].pressed);FBK.gpL=!!(gp.buttons[2]&&gp.buttons[2].pressed);FBK.gpR=!!(gp.buttons[7]&&gp.buttons[7].value>.3)}
  const cy=FB.camYaw||0,fx=Math.sin(cy),fz=Math.cos(cy),rx=-Math.cos(cy),rz=Math.sin(cy);let dx=fx*mz+rx*mx,dz=fz*mz+rz*mx;const L=Math.hypot(dx,dz);
  const spr=(keys.ShiftLeft||FBK.sprint||FBK.gpR)&&FB.stam>.05&&L>.3;const has=b.owner===q;const top=spr?(has?7.2:8):(has?5.6:6);
  FB.stam=clamp(FB.stam+(spr?-dt*.12:dt*.07),0,1);
  let tx=0,tz=0;if(L>.08){const k=Math.min(1,L)/L;tx=dx*k*top;tz=dz*k*top}const ac=Math.min(1,dt*(has?5:7));q.vx+=(tx-q.vx)*ac;q.vz+=(tz-q.vz)*ac;
  for(const o of FB.pl){if(o===q)continue;const ex=q.x-o.x,ez=q.z-o.z,e=Math.hypot(ex,ez);if(e<1&&e>.01){q.x+=ex/e*(1-e)*.5;q.z+=ez/e*(1-e)*.5}}
  const shootDown=keys.Space||FBK.shoot||FBK.gpS;const aimX=L>.2?dx/L:Math.sin(q.yaw),aimZ=L>.2?dz/L:Math.cos(q.yaw);
  if(has){if(q.hold>0){q.hold-=dt;q.vx=q.vz=0}
    if(shootDown&&!q.restart){if(FB.charge<0)FB.charge=0;FB.charge=Math.min(1,FB.charge+dt*1.25)}
    else if(FB.charge>=0){const g=fbGoalPt(f,q.tm);const gl=fL(f,g[0],g[1]),ql=fL(f,q.x,q.z);const s=fbAtt(q.tm);// apuntar: la dirección del joystick decide el palo
      const toG=[g[0]-q.x,g[1]-q.z],tl=Math.hypot(toG[0],toG[1])||1;const lat=((aimX*f.bx+aimZ*f.bz)*s)*(L>.2?1:0);
      if((toG[0]*aimX+toG[1]*aimZ)/tl>-.2||L<.2)fbShoot(q,FB.charge,clamp(lat*1.6,-1,1));else fbKick(q,aimX,aimZ,16+FB.charge*14,1+FB.charge*3,'clear');FB.charge=-1}
    if(FBK.pass||FBK.gpP){FBK.pass=false;FBK.gpP=false;fbPass(q,aimX,aimZ,false);q.restart=null}
    if(FBK.lob||FBK.gpL){FBK.lob=false;FBK.gpL=false;fbPass(q,aimX,aimZ,true);q.restart=null}}
  else{FB.charge=-1;
    if(FBK.pass||FBK.gpP){FBK.pass=false;FBK.gpP=false;FB.call=2.5;feed('🙋 ¡Pide el balón!')}
    if((FBK.shoot||keys.Space||FBK.gpS)&&q.cool<=0){q.cool=.7;q.kick=.3;// entrada
      const o=b.owner;const d=Math.hypot(b.x-q.x,b.z-q.z);if(o&&o.tm!==q.tm&&d<1.9){if(Math.random()<.62)fbSteal(q,o);else{q.vx*=.3;q.vz*=.3}}else if(!o&&d<1.6&&b.y-f.y<1){fbKick(q,aimX,aimZ,14,.6,'clear')}}
    FBK.lob=false}
  if(L>.08||Math.hypot(q.vx,q.vz)>.5){const ty=Math.atan2(q.vx,q.vz);let dd=ty-q.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));q.yaw+=dd*Math.min(1,dt*(has?7:10))}}

/* ---- bucle del partido ---- */
function updateFutbol(dt){if(!FB.on)return;const f=FB.f,b=FB.ball;
  if(FB.state==='kick'){FB.st-=dt;if(FB.st<=0){FB.state='play';whistle(1);const t=FB.taker;b.owner=t;b.last=t.tm;b.lastQ=t;if(!t.me){t.hold=.4;t.restart='kick'}}}
  else if(FB.state==='goal'){FB.st-=dt;if(FB.st<=0)fbKickoff(1-FB.goalTeam)}
  else if(FB.state==='dead'){FB.st-=dt;b.vx*=.9;b.vz*=.9;if(FB.st<=0)fbDoRestart()}
  else if(FB.state==='half'){FB.st-=dt;if(FB.st<=0){FB.half=2;fbKickoff(1-FB.firstKick)}}
  if(FB.state==='play'||FB.state==='dead'){FB.t+=dt;if(FB.half===1&&FB.t>=FB.dur/2&&FB.state==='play'){FB.state='half';FB.st=3;whistle(2);bigMsg('DESCANSO','#fff')}
    else if(FB.t>=FB.dur&&FB.state==='play'){whistle(3,true);crowdRoar(.2,3);FB.state='end';setTimeout(()=>fbEnd(false),2200)}}
  if(FB.state==='end'){for(const q of FB.pl){q.vx*=.9;q.vz*=.9}}
  FB.call=Math.max(0,FB.call-dt);FB.grace=Math.max(0,(FB.grace||0)-dt);FB.shotT=Math.max(0,(FB.shotT||0)-dt);
  if(b.owner)FB.stats.pos[b.owner.tm]+=dt;
  for(const q of FB.pl){q.cool=Math.max(0,q.cool-dt);q.kick=Math.max(0,q.kick-dt);
    if(FB.state==='play'){if(q.me&&!window.__fbauto)fbMe(q,dt);else fbAI(q,dt)}else if(FB.state==='kick'||FB.state==='goal'||FB.state==='half'){q.vx*=.85;q.vz*=.85;if(FB.state==='goal'&&q.tm===FB.goalTeam&&!q.gk){const k=FB.ball;fbSteer(q,k.x+(q.i-5)*1.2,k.z+(q.i%3-1)*1.2,4,dt)}}
    else{q.vx*=.9;q.vz*=.9}
    q.x+=q.vx*dt;q.z+=q.vz*dt;// límites del recinto
    const l=fL(f,q.x,q.z);const lu=f.hl+(f.cage?1.2:4),lv=f.hw+(f.cage?1.2:3.5);if(Math.abs(l[0])>lu||Math.abs(l[1])>lv){const w=fW(f,clamp(l[0],-lu,lu),clamp(l[1],-lv,lv));q.x=w[0];q.z=w[1]}
    const sp=Math.hypot(q.vx,q.vz);if(!q.me&&sp>.4){const ty=b.owner===q||sp>2?Math.atan2(q.vx,q.vz):Math.atan2(b.x-q.x,b.z-q.z);let dd=ty-q.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));q.yaw+=dd*Math.min(1,dt*8)}
    else if(!q.me&&sp<=.4){const ty=Math.atan2(b.x-q.x,b.z-q.z);let dd=ty-q.yaw;dd=Math.atan2(Math.sin(dd),Math.cos(dd));q.yaw+=dd*Math.min(1,dt*4)}
    q.t+=dt*(sp>5.5?11.5:8.5)*clamp(sp/3.5,0,1.4);
    // control del balón suelto
    if(FB.state==='play'&&!b.owner&&q.cool<=0&&!q.gk){const d=Math.hypot(b.x-q.x,b.z-q.z),bh=b.y-f.y,bs=Math.hypot(b.vx,b.vz);
      if(d<.95&&bh<(bs<8?1.6:.6)&&bs<(q.me?23:19)){b.owner=q;if(b.last!==q.tm&&FB.kickFrom&&FB.lastKind==='pass'&&FB.kickFrom.me){} if(FB.pendPass&&FB.kickFrom&&FB.kickFrom.me&&q.tm===FB.kickFrom.tm&&q!==FB.kickFrom)FB.stats.passOk++;FB.pendPass=false;b.last=q.tm;b.lastQ=q;FB.target=null;
        if(bh>.6&&FB.lastKind==='cross'&&q.tm!==b.lastQ?.tm){}
        // remate de cabeza o volea si llega alto y está cerca de portería
        if(bh>.9&&!q.me){const g=fbGoalPt(f,q.tm);if(Math.hypot(g[0]-q.x,g[1]-q.z)<14)fbShoot(q,.55)}}}
    q.m.position.set(q.x,f.y+.03,q.z);q.m.rotation.y=q.yaw;
    const mode=FB.state==='goal'&&q.tm===FB.goalTeam&&!q.gk?'cele':q.gk&&b.owner===q?'hold':q.restart==='throw'&&b.owner===q?'throw':q.gk&&FB.state==='play'?'gk':'';fbPose(q.m,q.t,sp,q.kick,mode,q.gk?q.dive:0)}
  fbBall(dt);
  const me=FB.me;FOOT.x=me.x;FOOT.z=me.z;FOOT.y=f.y;FOOT.yaw=me.yaw;FB.mark.position.set(me.x,f.y+2.45+Math.sin(time*4)*.05,me.z);FB.ring.position.set(me.x,f.y+.08,me.z);FB.ring.material.color.setHex(b.owner===me?0x4cff7a:0xffe14d);
  fbHud()}
function fbHud(){const m=Math.floor(FB.t/FB.dur*(FB.mode===11?90:FB.mode===7?50:40));
  $('fbScore').innerHTML=`<span class="fbt" style="--c:#${FB.kits[0].shirt.toString(16).padStart(6,'0')}">${FB.names[0].replace(/ CF$/,'')}</span><b>${FB.score[0]} – ${FB.score[1]}</b><span class="fbt" style="--c:#${FB.kits[1].shirt.toString(16).padStart(6,'0')}">${FB.names[1].replace(/^(C\.D\.|U\.D\.) /,'').replace(/ C\.F\.$/,'')}</span><i>${m}'</i>`;
  $('fbPow').style.width=(FB.charge>=0?FB.charge*100:0)+'%';$('fbStam').style.width=(FB.stam*100)+'%';const has=FB.ball.owner===FB.me;$('fbShoot').textContent=has?'TIRO':'ENTRADA';$('fbPass').textContent=has?'PASE':'PIDE';$('fbLob').style.opacity=has?1:.4}
/* cámara: «Pro» detrás de tu jugador mirando a la portería rival, o «TV» desde la banda */
function fbCamera(dt){const f=FB.f,me=FB.me,b=FB.ball;const s=fbAtt(me.tm);
  if(FB.cam===0){const fy=Math.atan2(f.ax*s,f.az*s);let dd=fy-(FB.camYaw===undefined?fy:FB.camYaw);dd=Math.atan2(Math.sin(dd),Math.cos(dd));FB.camYaw=(FB.camYaw===undefined?fy:FB.camYaw)+dd*Math.min(1,dt*3);
    const cy=FB.camYaw,D=FB.mode===5?6.5:8.5,Hc=FB.mode===5?3.6:4.4;const lx=me.x*.75+b.x*.25,lz=me.z*.75+b.z*.25;const tx=lx-Math.sin(cy)*D,tz=lz-Math.cos(cy)*D;
    FB.cp=FB.cp||[tx,f.y+Hc,tz];const k=Math.min(1,dt*5);FB.cp[0]+=(tx-FB.cp[0])*k;FB.cp[1]+=(f.y+Hc-FB.cp[1])*k;FB.cp[2]+=(tz-FB.cp[2])*k;camera.position.set(FB.cp[0],FB.cp[1],FB.cp[2]);camera.lookAt(lx+Math.sin(cy)*6,f.y+1,lz+Math.cos(cy)*6)}
  else{const lu=fL(f,b.x*.6+me.x*.4,b.z*.6+me.z*.4);const w=fW(f,lu[0]*.9,-(f.hw+(FB.mode===5?10:22)));const tgt=fW(f,lu[0],lu[1]*.5);FB.camYaw=Math.atan2(f.bx,f.bz);
    FB.cp=FB.cp||[w[0],f.y+12,w[1]];const k=Math.min(1,dt*3);const hh=FB.mode===5?9:16;FB.cp[0]+=(w[0]-FB.cp[0])*k;FB.cp[1]+=(f.y+hh-FB.cp[1])*k;FB.cp[2]+=(w[1]-FB.cp[2])*k;camera.position.set(FB.cp[0],FB.cp[1],FB.cp[2]);camera.lookAt(tgt[0],f.y,tgt[1])}
  {const l=fL(f,camera.position.x,camera.position.z),mu=f.hl+(f.cage?1.3:7),mv=f.hw+(f.cage?1.3:FB.cam?40:6);if(Math.abs(l[0])>mu||Math.abs(l[1])>mv){const w=fW(f,clamp(l[0],-mu,mu),clamp(l[1],-mv,mv));camera.position.x=w[0];camera.position.z=w[1];if(FB.cp){FB.cp[0]=w[0];FB.cp[2]=w[1]}}}
  if(Math.abs(camera.fov-58)>.1){camera.fov+=(58-camera.fov)*Math.min(1,dt*6);camera.updateProjectionMatrix()}
  sunFollow(me.x,f.y,me.z);skyMesh.position.copy(camera.position)}
/* cartel para empezar al llegar a pie (o en coche) a un campo */
let nearPitch=null,_npT=0;
function updatePitchPrompt(dt){_npT-=dt;if(_npT>0)return;_npT=.3;if(FB.on||RACE){if(nearPitch){nearPitch=null;$('fbPrompt').hidden=true}return}const px=FOOT.on?FOOT.x:ME.x,pz=FOOT.on?FOOT.z:ME.z;const p=inPitch(px,pz,FOOT.on?6:12);
  if(p===nearPitch)return;nearPitch=p;const e=$('fbPrompt');if(!p){e.hidden=true;return}
  e.innerHTML=`<b>⚽ ${p.name}</b><small>Elige partido · llevas a un solo jugador</small><div>${p.modes.map(m=>`<button type="button" data-fm="${m}">FÚTBOL ${m}</button>`).join('')}</div>`;e.hidden=false;e.querySelectorAll('[data-fm]').forEach(bt=>bt.onclick=()=>{e.hidden=true;nearPitch=null;fbStart(p,+bt.dataset.fm)})}
function fbMenuHTML(){return '<div class="row"><div><h4>⚽ FÚTBOL</h4><small>Campos reales de Aguadulce. Tú llevas a un jugador; el resto, la IA. Ve con el coche o pulsa JUGAR.</small></div></div>'+FBP.map(p=>`<div class="row"><div><h4>${p.name}</h4><small>${p.cage?'Pista con jaula · fútbol 5':'Césped artificial · fútbol 11 o fútbol 7'}</small></div><div class="sw">${p.modes.map(m=>`<button class="btn" type="button" data-fb="${p.id}:${m}">F${m}</button>`).join('')}</div></div>`).join('')}
function bindFbMenu(){document.querySelectorAll('[data-fb]').forEach(b=>b.onclick=()=>{const [id,m]=b.dataset.fb.split(':');const p=FBP.find(q=>q.id===id);toggleMenu(false);fbStart(p,+m)})}
function initFutbol(){
  addEventListener('keydown',e=>{if(!FB.on||e.target.tagName==='INPUT')return;const st=()=>{e.stopPropagation();e.preventDefault()};if(e.code==='KeyE'){st();if(!e.repeat)FBK.pass=true}if(e.code==='KeyQ'){st();if(!e.repeat)FBK.lob=true}if(e.code==='KeyC'){st();if(!e.repeat){FB.cam=1-FB.cam;FB.cp=null;S.set.fbcam=FB.cam;save()}}if(e.code==='Escape'){st();fbEnd(true);feed('Has abandonado el partido')}if(e.code==='KeyF'||e.code==='KeyG'||e.code==='KeyR'||e.code==='KeyZ'||e.code==='KeyX')st();if(e.code==='Space')e.preventDefault()},true);
  const hold=(id,k)=>{const el=$(id);const on=e=>{e.preventDefault();FBK[k]=true;el.classList.add('on')},off=e=>{e.preventDefault();FBK[k]=false;el.classList.remove('on')};el.addEventListener('touchstart',on,{passive:false});el.addEventListener('touchend',off);el.addEventListener('touchcancel',off);el.addEventListener('mousedown',on);el.addEventListener('mouseup',off)};
  const tap=(id,fn)=>{const el=$(id);el.addEventListener('touchstart',e=>{e.preventDefault();fn()},{passive:false});el.addEventListener('click',fn)};
  hold('fbShoot','shoot');hold('fbSpr','sprint');tap('fbPass',()=>FBK.pass=true);tap('fbLob',()=>FBK.lob=true);tap('fbCam',()=>{FB.cam=1-FB.cam;FB.cp=null});tap('fbQuit',()=>{fbEnd(true);feed('Has abandonado el partido')})}
