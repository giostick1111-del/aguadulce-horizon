
/* ============ COCHES v2: carrocería de superficie continua (secciones transversales),
   pasos de rueda reales, lunas transparentes con interior, faros/pilotos con luz de freno ============ */
function profTB(prof,z){let top=-9,bot=9;for(let i=0;i<prof.length;i++){const a=prof[i],b=prof[(i+1)%prof.length];if((a[0]-z)*(b[0]-z)<=0&&a[0]!==b[0]){const t=(z-a[0])/(b[0]-a[0]),y=a[1]+(b[1]-a[1])*t;top=Math.max(top,y);bot=Math.min(bot,y)}}
  if(top<-8){let bd=9;for(const p of prof){const d=Math.abs(p[0]-z);if(d<bd){bd=d;top=bot=p[1]}}}return[top,bot]}
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
function carGeos(ti){if(CARGEO[ti])return CARGEO[ti];const T=CARS[ti],lift=T.lift||0,W=T.W;
  const prof=T.prof.map(p=>[p[0],p[1]+lift]),gl=T.glass.map(p=>[p[0],p[1]+lift]);
  const fz=Math.max(...prof.map(p=>p[0])),rz=Math.min(...prof.map(p=>p[0])),zc=(fz+rz)/2,Lh=(fz-rz)/2;
  const gz0=gl[0][0],gz1=gl[1][0],gz2=gl[2][0],gz3=gl[3][0],zB=(gz1+gz2)/2-.05;
  const N=64,M=9,pos=[],idx=[[],[],[]];// 0 pintura, 1 cristal, 2 bajos
  const sec=[];
  for(let i=0;i<=N;i++){const u=i/N,z=rz+(fz-rz)*(.5-.5*Math.cos(u*Math.PI));// más densidad en los extremos
    let [top,bot]=profTB(prof,z);const n=Math.abs((z-zc)/Lh);const plan=.80+.20*Math.pow(Math.max(0,1-Math.pow(n,4)),.25);const w=W/2*plan;
    // paso de rueda: arco circular sólo en el borde exterior
    let ya=bot;for(const wz of T.wb){const d=z-wz,r=.44;if(Math.abs(d)<r)ya=Math.max(ya,.34+Math.sqrt(r*r-d*d)+.02)}
    const k=sstep(gz0-.02,gz0+.14,z)*(1-sstep(gz3-.14,gz3+.02,z));
    const beltL=gl[0][1]+(gl[3][1]-gl[0][1])*clamp((z-gz0)/((gz3-gz0)||1),0,1)-.02;
    const yb=bot+(n>.96?.05:0);
    const mid=yb+((k>0?beltL:top)-yb)*.5;
    const hood=[[w*.985,top-.1],[w*.93,top-.04],[w*.78,top-.012],[w*.42,top+.004],[0,top+.01]];
    const cab=[[w*.985,beltL],[w*.93,beltL+.05],[w*.79,top-.08],[w*.66,top-.012],[0,top]];
    const P=[[0,yb],[w-.12,Math.max(yb,ya-.06)],[w-.01,Math.max(yb+.07,ya)],[w+.015,Math.max(mid,ya+.07)]];
    for(let j=0;j<5;j++)P.push([hood[j][0]+(cab[j][0]-hood[j][0])*k,hood[j][1]+(cab[j][1]-hood[j][1])*k]);
    sec.push({z,P,k,slope:z>gz2-.02||z<gz1+.02})}
  // vértices: por sección, lado derecho (j=0..8) y luego izquierdo (j=1..8 espejo)
  const VPS=M*2-1,vi=(i,j,s)=>i*VPS+(s>0?j:(j===0?0:M-1+j));
  for(const S of sec){for(let j=0;j<M;j++)pos.push(S.P[j][0],S.P[j][1],S.z);for(let j=1;j<M;j++)pos.push(-S.P[j][0],S.P[j][1],S.z)}
  const cls=(i,j)=>{const S=sec[i],S2=sec[i+1],zm=(S.z+S2.z)/2,km=Math.min(S.k,S2.k);if(j===0)return 2;
    if(km>.55){const sl=S.slope&&S2.slope;if(sl)return j===7||j===5?1:0;if(j===5&&Math.abs(zm-zB)>.06)return 1}return 0};
  for(let i=0;i<N;i++)for(let j=0;j<M-1;j++){const c=cls(i,j);
    for(const s of [1,-1]){const a=vi(i,j,s),b=vi(i,j+1,s),c2=vi(i+1,j,s),d=vi(i+1,j+1,s);if(s<0)idx[c].push(a,c2,b,b,c2,d);else idx[c].push(a,b,c2,b,d,c2)}}
  // tapas delantera y trasera
  const nrm=new Array(pos.length).fill(null);const capV=[];
  for(const [i,f] of [[0,-1],[N,1]]){const S=sec[i];let cy=0;for(const p of S.P)cy+=p[1];const cv=pos.length/3;pos.push(0,cy/M,S.z+f*.01);capV.push(cv);
    const ring=[];for(const s of [1,-1])for(let j=0;j<M;j++){if(s<0&&j===0)continue;const v=pos.length/3;pos.push(s*S.P[j][0],S.P[j][1],S.z);capV.push(v);ring.push([s,j,v])}
    const R_=(s,j)=>ring.find(r=>r[0]===(j===0?1:s)&&r[1]===j)[2];
    for(const s of [1,-1])for(let j=0;j<M-1;j++){const a=R_(s,j),b=R_(s,j+1);if((s>0)===(f>0))idx[0].push(cv,a,b);else idx[0].push(cv,b,a)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const all=[...idx[0],...idx[1],...idx[2]];g.setIndex(all);
  g.addGroup(0,idx[0].length,0);g.addGroup(idx[0].length,idx[1].length,1);g.addGroup(idx[0].length+idx[1].length,idx[2].length,2);g.computeVertexNormals();{const na=g.attributes.normal;for(const v of capV)na.setXYZ(v,0,0,pos[v*3+2]>0?1:-1);na.needsUpdate=true}
  const at=z=>{let a=sec[0];for(const S of sec)if(Math.abs(S.z-z)<Math.abs(a.z-z))a=S;return a};
  return CARGEO[ti]={body:g,fz,rz,at,sec}}
function wheelGeos(){if(CARGEO.wheel)return CARGEO.wheel;
  const tp=[];const R=.34,Wd=.125;for(let k=0;k<=8;k++){const a=-Math.PI/2+k/8*Math.PI;tp.push(new THREE.Vector2(R-.045+Math.cos(a)*.045,Math.sin(a)*Wd))}
  const tire=new THREE.LatheGeometry([new THREE.Vector2(.22,-Wd),...tp,new THREE.Vector2(.22,Wd)],22);tire.rotateZ(Math.PI/2);
  const rimFace=new THREE.CylinderGeometry(.225,.225,.03,20);rimFace.rotateZ(Math.PI/2);
  const barrel=new THREE.CylinderGeometry(.215,.215,.22,18,1,true);barrel.rotateZ(Math.PI/2);
  const disc=new THREE.CylinderGeometry(.18,.18,.025,18);disc.rotateZ(Math.PI/2);
  return CARGEO.wheel={tire,rimFace,barrel,disc}}
function mkCarModel(ti,ci){const T=CARS[ti],G=carGeos(ti),g=new THREE.Group(),lift=T.lift||0,W=T.W;
  const paint=new THREE.MeshPhysicalMaterial?new THREE.MeshPhysicalMaterial({color:new THREE.Color(PAINT[ci%PAINT.length]),metalness:.6,roughness:.2,clearcoat:1,clearcoatRoughness:.1,envMap,envMapIntensity:1.35}):new THREE.MeshStandardMaterial({color:new THREE.Color(PAINT[ci%PAINT.length]),metalness:.6,roughness:.3,envMap});
  const glassM=stdMat('glass2',{color:0x1a2730,metalness:.4,roughness:.03,envMapIntensity:2.2,transparent:true,opacity:.4,side:THREE.DoubleSide,depthWrite:false});
  const under=stdMat('under',{color:0x0e0f11,metalness:.1,roughness:.9,side:THREE.DoubleSide});
  const trim=stdMat('trim',{color:0x15171a,metalness:.3,roughness:.55}),chrome=stdMat('chrome',{color:0xdfe3e6,metalness:1,roughness:.12}),black=stdMat('blackgl',{color:0x050607,metalness:.6,roughness:.15});
  const add=(geo,m,x,y,z,rx,ry,rz)=>{const o=new THREE.Mesh(geo,m);o.position.set(x||0,y||0,z||0);o.rotation.set(rx||0,ry||0,rz||0);if(HQ)o.castShadow=true;g.add(o);return o};
  const bm=add(G.body,[paint,glassM,under]);bm.renderOrder=1;
  const F=G.at(G.fz-.06),Rr=G.at(G.rz+.06),fz=G.fz,rz=G.rz;const fw=F.P[3][0],rw=Rr.P[3][0];
  const fTop=profTB(T.prof.map(p=>[p[0],p[1]+lift]),fz-.05)[0],rTop=profTB(T.prof.map(p=>[p[0],p[1]+lift]),rz+.05)[0];
  // interior: salpicadero, asientos, volante
  const intM=stdMat('int',{color:0x1b1c1f,metalness:0,roughness:.85});const cz=(T.glass[1][0]+T.glass[2][0])/2,belt=T.glass[0][1]+lift;
  add(boxG(W*.78,.18,.35),intM,0,belt-.04,T.glass[3][0]-.25);for(const s of [-1,1]){add(boxG(.5,.12,.5),intM,s*.38,belt-.32,cz-.05);{const roofY=profTB(T.prof.map(p=>[p[0],p[1]+lift]),cz-.32)[0],bh=Math.max(.25,Math.min(.62,roofY-.14-(belt-.33)));add(boxG(.5,bh,.12),intM,s*.38,belt-.33+bh/2,cz-.32,-.18)}}
  const sw=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,6,16),intM);sw.position.set(.38,belt+.08,T.glass[3][0]-.48);sw.rotation.x=-.35;g.add(sw);
  // frontal: parrilla, entradas de aire, matrícula, faros
  const HLm=new THREE.MeshStandardMaterial({color:0xeef3ff,emissive:0xeef4ff,emissiveIntensity:2.2,metalness:.3,roughness:.1,envMap});
  const TLm=new THREE.MeshStandardMaterial({color:0x5a0508,emissive:0xff1a1a,emissiveIntensity:.45,metalness:.3,roughness:.2,envMap});
  const RVm=new THREE.MeshStandardMaterial({color:0xdddddd,emissive:0xffffff,emissiveIntensity:0,roughness:.2});
  const gy=(fTop+.3+lift)/2;
  add(boxG(fw*1.05,.16,.06),black,0,gy-.03,fz-.0);add(boxG(fw*1.5,.1,.06),black,0,.4+lift,fz-.04);
  add(boxG(.52,.12,.02),new THREE.MeshBasicMaterial({color:0xf3f3f3}),0,.47+lift,fz+.025);add(boxG(.08,.12,.022),new THREE.MeshBasicMaterial({color:0x1e40af}),-.22,.47+lift,fz+.027);
  for(const s of [-1,1]){const hl=add(boxG(.42,.09,.16),HLm,s*(fw-.28),fTop-.1,fz-.06,0,s*-.18,0);add(boxG(.44,.025,.17),black,s*(fw-.28),fTop-.045,fz-.06,0,s*-.18,0);
    add(boxG(.18,.05,.04),HLm,s*(fw-.3),.43+lift,fz-.02);// antinieblas / LED diurno
    add(boxG(.48,.1,.1),TLm,s*(rw-.3),rTop-.11,rz+.03,0,s*.15,0);add(boxG(.12,.06,.06),RVm,s*(rw-.62),rTop-.12,rz+.01);
    // retrovisores
    const mz=T.glass[3][0]-.18,mb=G.at(mz);add(boxG(.2,.11,.16),paint,s*(mb.P[3][0]+.1),belt+.06,mz,0,0,0);add(boxG(.06,.03,.06),trim,s*(mb.P[3][0]+.01),belt+.03,mz);
    // manetas y línea de puerta
    add(boxG(.012,.025,.14),chrome,s*(G.at(cz).P[4][0]+.004),belt-.12,cz+.25);add(boxG(.012,.025,.14),chrome,s*(G.at(cz-.8).P[4][0]+.004),belt-.12,cz-.6);
    add(boxG(.006,.55,.006),trim,s*(G.at(zB_(T)).P[3][0]+.012),belt-.32,zB_(T))}
  add(boxG(rw*1.3,.03,.05),TLm,0,rTop-.08,rz+.025);// tira trasera LED
  add(boxG(.52,.12,.02),new THREE.MeshBasicMaterial({color:0xf3f3f3}),0,.5+lift,rz-.02);add(boxG(rw*1.6,.14,.08),black,0,.36+lift,rz+.04);
  const ex=ti===4||ti===2?[-.35,-.2,.2,.35]:ti===3?[.35]:[.32];for(const x of ex)add(cylG(.045,.05,.16,10),chrome,x*W/1.8,.33+lift,rz,Math.PI/2);
  if(T.wing){const wz=rz+.28,wy=rTop+.18+(ti===4?.02:0);add(boxG(W*.84,.035,.3),black,0,wy,wz,-.08);for(const s of [-1,1]){add(boxG(.03,.2,.14),black,s*W*.3,wy-.1,wz+.03);add(boxG(.02,.12,.32),black,s*W*.42,wy+.02,wz)}}
  else add(boxG(W*.55,.03,.14),paint,0,rTop+.0,rz+.1);// alerón discreto
  if(T.off){add(boxG(W*.7,.06,1.3),trim,0,profTB(T.prof.map(p=>[p[0],p[1]+lift]),cz)[0]+.06,cz-.1);add(boxG(W+.06,.12,.12),black,0,.5+lift,fz-.02)}
  // ruedas: neumático con flanco redondeado, llanta de radios, disco y pinza
  const wheels=[];const WG=wheelGeos();const tire=stdMat('tire',{color:0x141414,metalness:0,roughness:.92}),rim=stdMat('rim'+ti,{color:ti===4?0x2a2c30:ti===3?0x9aa0a6:0xc6cbd0,metalness:1,roughness:.22}),
    disc=stdMat('disc',{color:0x6d7073,metalness:.9,roughness:.45}),cal=stdMat('cal'+ti,{color:ti>=2?0xd41b1b:0x333538,metalness:.4,roughness:.4});
  const spokeN=ti===4?10:ti===2?7:5,spk=boxG(.03,.2,.045);
  for(const [sx,wz] of [[1,T.wb[1]],[-1,T.wb[1]],[1,T.wb[0]],[-1,T.wb[0]]]){const piv=new THREE.Group();piv.position.set(sx*(W/2-.13),.34,wz);const spin=new THREE.Group();piv.add(spin);
    const t=new THREE.Mesh(WG.tire,tire);spin.add(t);const br=new THREE.Mesh(WG.barrel,rim);spin.add(br);
    const face=new THREE.Group();face.position.x=sx*.1;spin.add(face);const hub=new THREE.Mesh(cylG(.05,.05,.04,10),chrome);hub.rotation.z=Math.PI/2;face.add(hub);
    for(let k=0;k<spokeN;k++){const s=new THREE.Mesh(spk,rim);const a=k/spokeN*TAU;s.position.set(0,Math.cos(a)*.11,Math.sin(a)*.11);s.rotation.x=a;face.add(s)}
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.215,.018,4,20),rim);ring.rotation.y=Math.PI/2;face.add(ring);
    const d=new THREE.Mesh(WG.disc,disc);d.position.x=sx*.02;piv.add(d);const c=new THREE.Mesh(boxG(.06,.12,.16),cal);c.position.set(sx*.05,.1,wz>0?-.1:.1);piv.add(c);
    if(HQ)t.castShadow=true;g.add(piv);wheels.push({piv,spin,front:wz>0})}
  if(!HQ){const b=new THREE.Mesh(new THREE.PlaneGeometry(W+1,T.L+1),new THREE.MeshBasicMaterial({map:TX.blob,transparent:true,depthWrite:false}));b.rotation.x=-Math.PI/2;b.position.y=.06;b.renderOrder=6;g.add(b)}
  const body=new THREE.Group();while(g.children.length){const o=g.children[0];g.remove(o);body.add(o)}g.add(body);
  g.userData={wheels,body,paint,tail:TLm,rev:RVm,head:HLm};return g}
function zB_(T){return(T.glass[1][0]+T.glass[2][0])/2-.05}
/* luces de freno y marcha atrás */
function carLights(c,brk){const u=c.m.userData;if(!u.tail)return;const b=brk?3.2:.6;if(Math.abs(u.tail.emissiveIntensity-b)>.01)u.tail.emissiveIntensity=b;const r=c.vf<-.5?1.2:0;if(u.rev.emissiveIntensity!==r)u.rev.emissiveIntensity=r}
