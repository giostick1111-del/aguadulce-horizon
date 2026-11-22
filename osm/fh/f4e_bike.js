
/* ============ MOTOS: scooter deportivo de 50 cc, trail, naked y superbike (modelos propios, sin marcas) ============
   horquilla con lanzamiento real que gira con el manillar, basculante, motor, escape, piloto con casco,
   cuadro digital, retrovisores, matrícula española (amarilla de ciclomotor en el scooter) y vista desde el casco */
function bikePlateTex(num,moped){const k='bp'+num+moped;if(MATS[k])return MATS[k];const c=cvs(200,150),g=c.getContext('2d');g.fillStyle=moped?'#f2c80f':'#f4f4f0';g.fillRect(0,0,200,150);g.strokeStyle='#222';g.lineWidth=5;g.strokeRect(3,3,194,144);
  g.fillStyle='#1f3f9a';g.fillRect(6,6,34,138);g.fillStyle='#ffcc00';for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.arc(23+Math.cos(a)*10,40+Math.sin(a)*10,1.8,0,TAU);g.fill()}
  g.fillStyle='#fff';g.font='bold 22px Arial';g.textAlign='center';g.fillText('E',23,124);g.fillStyle='#111';g.font='bold 52px "Arial Narrow",Arial,sans-serif';g.textBaseline='middle';
  const [a,b]=num.split(' ');g.fillText(moped?'C '+a:a,120,48);g.fillText(b,120,108);return MATS[k]=new THREE.MeshStandardMaterial({map:tex(c),roughness:.35,metalness:.2})}
function decalTex(txt,col){const k='dc'+txt+col;if(MATS[k])return MATS[k];const c=cvs(256,96),g=c.getContext('2d');g.font='italic 900 64px Arial Black,Arial,sans-serif';g.textAlign='center';g.textBaseline='middle';
  g.lineWidth=8;g.strokeStyle='rgba(0,0,0,.55)';g.strokeText(txt,128,50);g.fillStyle=col;g.fillText(txt,128,50);g.fillStyle=col;g.fillRect(20,82,216,6);
  return MATS[k]=new THREE.MeshStandardMaterial({map:tex(c),transparent:true,depthWrite:false,roughness:.3,metalness:.1,polygonOffset:true,polygonOffsetFactor:-2})}
function drawBikeDash(cv,kmh,rpm,gear){const g=cv.getContext('2d'),W=cv.width,Hh=cv.height;g.fillStyle='#0b1310';g.fillRect(0,0,W,Hh);
  const n=24;for(let i=0;i<n;i++){const on=i/n<rpm;g.fillStyle=on?(i>n*.8?'#ff4b3a':'#9dffcf'):'#1c2a24';g.fillRect(8+i*(W-16)/n,8,(W-16)/n-2,14+i*.5)}
  g.fillStyle='#d8ffe9';g.font='bold 54px Arial';g.textAlign='right';g.textBaseline='alphabetic';g.fillText(String(Math.round(kmh)),W*.66,Hh-14);g.font='bold 14px Arial';g.fillText('km/h',W*.66,Hh-2);
  g.textAlign='center';g.font='bold 40px Arial';g.fillText(gear<0?'R':String(gear),W*.85,Hh-18)}
function tubeG(a,b,r,col){const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],L=Math.hypot(dx,dy,dz)||1e-3,g=cylG(r,r,L,8).clone(),q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(dx/L,dy/L,dz/L));
  g.applyMatrix4(new THREE.Matrix4().makeRotationFromQuaternion(q));g.translate((a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2);return[g,0,0,0,0,0,0,1,1,1,col]}
/* sólido «loft»: secciones superelípticas a lo largo de z (z, y inferior, y superior, ancho, exponente), suavizadas con Catmull-Rom */
function loftG(S0,n){const sub=3,S=[];const cr=(a,b,c,d,t)=>.5*((2*b)+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);
  for(let i=0;i<S0.length-1;i++)for(let k=0;k<sub;k++){const t=k/sub,a=S0[Math.max(0,i-1)],b=S0[i],c=S0[i+1],d=S0[Math.min(S0.length-1,i+2)];S.push(b.map((_,j)=>cr(a[j],b[j],c[j],d[j],t)))}S.push(S0[S0.length-1]);
  const P=[],I=[];for(const [z,yb,yt,w,p] of S){const cy=(yb+yt)/2,hh=Math.max(.002,(yt-yb)/2),ww=Math.max(.002,w/2);for(let k=0;k<n;k++){const a=k/n*TAU,c=Math.cos(a),s=Math.sin(a);P.push(Math.sign(c)*Math.pow(Math.abs(c),2/p)*ww,cy+Math.sign(s)*Math.pow(Math.abs(s),2/p)*hh,z)}}
  const R=S.length;for(let i=0;i<R-1;i++)for(let k=0;k<n;k++){const a=i*n+k,b=i*n+(k+1)%n,c=a+n,d=b+n;if(S[i][0]>S[i+1][0])I.push(a,b,d,a,d,c);else I.push(a,d,b,a,c,d)}
  for(const [ri,fl] of [[0,S[0][0]>S[R-1][0]],[R-1,S[0][0]<S[R-1][0]]]){const [z,yb,yt]=S[ri],ci=P.length/3;P.push(0,(yb+yt)/2,z);for(let k=0;k<n;k++){const a=ri*n+k,b=ri*n+(k+1)%n;if(fl)I.push(ci,a,b);else I.push(ci,b,a)}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g}
function bikeWheel(r,tw,kind,front){const g=new THREE.Group(),k='bw'+r+tw+kind+front;
  const tp=[];for(let i=0;i<=8;i++){const a=-Math.PI/2+i/8*Math.PI;tp.push(new THREE.Vector2(r-tw*.5+Math.cos(a)*tw*.5,Math.sin(a)*tw*.5))}
  const tire=hcG(k+'t',()=>{const t=new THREE.LatheGeometry([new THREE.Vector2(r-tw*.95,-tw*.45),...tp,new THREE.Vector2(r-tw*.95,tw*.45)],28);t.rotateZ(Math.PI/2);return t});
  g.add(new THREE.Mesh(tire,stdMat('btire'+kind,{color:kind==='trail'?0x1b1a18:0x131313,roughness:kind==='trail'?1:.9,metalness:0})));
  const P=[];const rimC=kind==='sport'?'#1c1d20':kind==='trail'?'#b9bec4':kind==='naked'?'#c8a034':'#2a2c30',rr=r-tw*.95;
  P.push([hcG(k+'rr',()=>{const t=new THREE.TorusGeometry(rr,.014,6,36);t.rotateY(Math.PI/2);return t}),0,0,0,0,0,0,1,1,1,rimC]);
  if(kind==='trail'){for(let i=0;i<18;i++){const a=i/18*TAU,b=a+.5;P.push(tubeG([(i%2?.03:-.03),Math.cos(a)*.05,Math.sin(a)*.05],[0,Math.cos(b)*rr,Math.sin(b)*rr],.004,'#c9ced3'))}}
  else{const ns=kind==='scooter'?5:3;for(let i=0;i<ns*(kind==='scooter'?1:2);i++){const a=i/(kind==='scooter'?ns:ns*2)*TAU,b=a+(kind==='scooter'?0:.18);P.push(tubeG([0,Math.cos(a)*.05,Math.sin(a)*.05],[0,Math.cos(b)*(rr-.01),Math.sin(b)*(rr-.01)],kind==='scooter'?.016:.011,rimC))}}
  P.push([cylG(.05,.05,tw*.9,12),0,0,0,0,0,Math.PI/2,1,1,1,'#3a3c40']);
  const disc=front?(kind==='scooter'?[[.05]]:[[.07],[-.07]]):[[-.05]];for(const [x] of disc)P.push([cylG(rr*.62,rr*.62,.006,26),x,0,0,0,0,Math.PI/2,1,1,1,'#aab0b6']);
  g.add(new THREE.Mesh(linVC(mergeParts(P)),stdMat('bwVC',{vertexColors:true,metalness:.8,roughness:.3})));return g}
function mkBikeModel(ti,ci){const T=CARS[ti],K=T.bike,r=T.r,g=new THREE.Group(),body=new THREE.Group();g.add(body);
  const paint=new THREE.MeshPhysicalMaterial({color:new THREE.Color(PAINT[ci%PAINT.length]),metalness:.55,roughness:.22,clearcoat:1,clearcoatRoughness:.1,envMap,envMapIntensity:1.3});
  const HLm=new THREE.MeshStandardMaterial({color:0xeef3ff,emissive:0xeef4ff,emissiveIntensity:2.2,metalness:.3,roughness:.1,envMap});
  const TLm=new THREE.MeshStandardMaterial({color:0x5a0508,emissive:0xff1a1a,emissiveIntensity:.45,metalness:.3,roughness:.2,envMap});
  const RVm=new THREE.MeshStandardMaterial({color:0xdddddd,emissive:0xffffff,emissiveIntensity:0,roughness:.2});
  const smoke=new THREE.MeshStandardMaterial({envMap,color:0x1a2228,metalness:.4,roughness:.05,transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false});
  const add=(geo,m,x,y,z,rx,ry,rz,par)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.rotation.set(rx||0,ry||0,rz||0);if(HQ)o.castShadow=true;(par||body).add(o);return o};
  const S=[],M=[],B=[];// S: plásticos/asiento (mate), M: metal, B: piloto
  const fz=T.wb[1],rz=T.wb[0],rake=K==='scooter'?.5:K==='trail'?.47:.43;
  const hy=r+(K==='scooter'?.6:K==='trail'?.82:K==='naked'?.74:.7),headZ=fz-(hy-r)*Math.tan(rake),forkLen=(hy-r)/Math.cos(rake);
  // ---- tren delantero: grupo inclinado (lanzamiento) que gira con la dirección
  const forkG=new THREE.Group();forkG.position.set(0,hy,headZ);forkG.rotation.x=-rake;body.add(forkG);const steer=new THREE.Group();forkG.add(steer);
  const up=new THREE.Group();up.rotation.x=rake;steer.add(up);// marco «recto» respecto al suelo, en la pipa de dirección
  const hub=new THREE.Group();hub.position.set(0,-forkLen,0);hub.rotation.x=rake;steer.add(hub);
  const fw=bikeWheel(r,K==='scooter'?.11:K==='trail'?.1:.12,K,true),fspin=new THREE.Group();fspin.add(fw);hub.add(fspin);
  const FP=[];const fl=K==='sport'||K==='naked'?'#c9a227':'#2b2d31';for(const s of [-1,1])FP.push([cylG(.026,.026,forkLen*.62,10),s*.085,-forkLen*.68,0,0,0,0,1,1,1,'#c9ced3'],[cylG(.034,.034,forkLen*.42,10),s*.085,-forkLen*.25,0,0,0,0,1,1,1,fl]);
  FP.push([boxG(.22,.04,.07),0,-.03,0,0,0,0,1,1,1,'#1d1e21'],[boxG(.22,.04,.07),0,-forkLen*.42,0,0,0,0,1,1,1,'#1d1e21']);
  steer.add(new THREE.Mesh(linVC(mergeParts(FP)),stdMat('forkVC',{vertexColors:true,metalness:.9,roughness:.25})));
  // guardabarros delantero (alto en la trail)
  if(K==='trail')add(rboxG(.14,.025,.62,.01),paint,0,hy-.02-0*.1,.22,-.12,0,0,up);else add(rboxG(.13,.022,.5,.01),K==='scooter'?paint:stdMat('bBlk',{color:0x111214,roughness:.5}),0,r+.08,.02,0,0,0,hub);
  // manillar, puños, retrovisores, maneta y cuadro
  const barY=K==='sport'?-.02:K==='trail'?.2:.13,barZ=K==='sport'?-.02:-.06,bw=K==='sport'?.3:K==='trail'?.44:.36;
  const BP=[tubeG([-bw,barY,barZ],[bw,barY,barZ],.012,'#1a1b1e')];for(const s of [-1,1]){BP.push([cylG(.019,.019,.13,10),s*(bw-.04),barY,barZ,0,0,Math.PI/2,1,1,1,'#0c0c0d']);BP.push(tubeG([s*(bw-.12),barY+.01,barZ+.03],[s*(bw-.02),barY,barZ+.09],.006,'#a8adb3'));
    if(K!=='sport'){BP.push(tubeG([s*(bw-.12),barY,barZ],[s*(bw-.06),barY+.24,barZ-.02],.006,'#1a1b1e'));BP.push([rboxG(.11,.07,.025,.02),s*(bw-.05),barY+.27,barZ-.02,0,0,0,1,1,1,'#141517'])}
    if(K==='trail')BP.push([rboxG(.09,.06,.16,.02),s*(bw-.01),barY,barZ+.04,0,0,0,1,1,1,'#d5d7da'])}
  if(K==='scooter'){BP.push([extrudeW([[.16,barY-.08],[.12,barY+.06],[-.04,barY+.06],[-.12,barY-.05],[0,barY-.12]],.44,true),0,0,0,0,0,0,1,1,1,PAINT[ci%PAINT.length]])}// carenado del manillar
  up.add(new THREE.Mesh(linVC(mergeParts(BP)),stdMat('barVC',{vertexColors:true,metalness:.5,roughness:.4})));
  if(K==='sport'){for(const s of [-1,1]){const mo=add(rboxG(.1,.06,.06,.02),paint,s*.3,hy+.22,headZ+.08);add(boxG(.085,.045,.004),stdMat('mirG',{color:0xb8c4cc,metalness:1,roughness:.05}),s*.3,hy+.22,headZ+.048)}}
  else for(const s of [-1,1])add(boxG(.1,.06,.004),stdMat('mirG',{color:0xb8c4cc,metalness:1,roughness:.05}),s*(bw-.05),barY+.27,barZ-.035,0,0,0,up);
  // cuadro digital
  const dCv=cvs(256,96);drawBikeDash(dCv,0,.1,1);const dT=tex(dCv),dash=new THREE.Mesh(new THREE.PlaneGeometry(.15,.056),new THREE.MeshBasicMaterial({map:dT,toneMapped:false}));
  const dashPar=K==='sport'?body:up;if(K==='sport'){dash.position.set(0,hy+.17,headZ-.02);dash.rotation.set(-.9,Math.PI,0)}else{dash.position.set(0,barY+.06,barZ+.06);dash.rotation.set(-.75,Math.PI,0)}dashPar.add(dash);
  // faros
  if(K==='scooter'){add(rboxG(.2,.06,.04,.02),HLm,0,barY-.02,.15,-.2,0,0,up)}
  else if(K==='naked'||K==='trail'){add(cylG(.095,.085,.09,20),stdMat('bBlk',{color:0x111214,roughness:.5}),0,K==='trail'?.02:-.02,.16,Math.PI/2,0,0,up);add(cylG(.08,.08,.02,20),HLm,0,K==='trail'?.02:-.02,.21,Math.PI/2,0,0,up);if(K==='trail')add(rboxG(.24,.3,.05,.03),paint,0,.0,.17,-.25,0,0,up)}
  // ---- chasis, motor, depósito/carrocería, asiento, colín, escape
  const pvY=r+.16,pvZ=-.12;
  const PC=PAINT[ci%PAINT.length];
  if(K==='scooter'){
    // escudo delantero (con los dos faros), piso, carrocería bajo el asiento con aletas laterales afiladas, asiento y colín alto
    S.push([loftG([[headZ-.16,.33,hy-.02,.44,3],[headZ-.06,.34,hy+.02,.46,3],[headZ+.06,.38,hy-.04,.42,2.6],[fz-.2,.42,hy-.16,.36,2.4],[fz-.08,.5,r+.36,.26,2.2]],18),0,0,0,0,0,0,1,1,1,PC]);
    S.push([loftG([[headZ-.16,.3,.36,.36,4],[-.18,.3,.36,.36,4]],8),0,0,0,0,0,0,1,1,1,'#18191b'],[boxG(.34,.008,.44),0,.362,(headZ-.16-.18)/2,0,0,0,1,1,1,'#2c2e31']);
    S.push([loftG([[-.18,.31,.5,.3,3],[-.34,.3,.68,.38,3],[-.62,.3,.76,.38,3.2],[-.86,.38,.8,.34,3],[-1.0,.54,.8,.2,2.6],[-1.04,.62,.78,.1,2.2]],18),0,0,0,0,0,0,1,1,1,PC]);
    for(const s of [-1,1])S.push([loftG([[-.3,.4,.46,.012,2],[-.55,.4,.56,.012,2],[-.85,.5,.62,.012,2]],6),s*.19,0,0,0,0,0,1,1,1,'#111214']);// franja negra lateral
    S.push([loftG([[-.2,.74,.82,.26,3],[-.4,.76,.86,.3,3],[-.7,.78,.88,.3,3],[-.9,.8,.9,.24,2.6]],14),0,0,0,0,0,0,1,1,1,'#151516']);// asiento
    for(const s of [-1,1])add(rboxG(.1,.045,.04,.018),HLm,s*.08,hy-.12,fz-.11,-.35,0,0);// faros dobles en el escudo
    M.push([rboxG(.2,.2,.52,.05),.08,.3,-.5,0,0,0,1,1,1,'#7c8186'],[rboxG(.06,.24,.36,.04),.17,.32,-.5,0,0,0,1,1,1,'#5d6166']);// motor y transmisión
    {const ex=hcG('exp2t',()=>{const pts=[[.018,0],[.03,.05],[.05,.16],[.062,.3],[.06,.42],[.034,.55],[.022,.66],[.024,.74]].map(p=>new THREE.Vector2(p[0],p[1]));const t=new THREE.LatheGeometry(pts,14);t.rotateX(-Math.PI/2);return t});
      M.push([ex,-.13,.22,-.1,.06,0,0,1,1,1,'#3a3c40'],[cylG(.026,.026,.1,12),-.13,.26,-.88,Math.PI/2+.06,0,0,1,1,1,'#d9dde1'])}// escape de expansión (dos tiempos)
    M.push(tubeG([.1,.62,-.75],[.1,r+.02,rz+.04],.022,'#c4302b'));
    for(const s of [-1,1]){const d=new THREE.Mesh(new THREE.PlaneGeometry(.3,.11),decalTex('50 R','#ffffff'));d.position.set(s*.2,.58,-.62);d.rotation.y=s*Math.PI/2;d.rotation.z=.08;body.add(d)}
  }else{
    const tankTop=hy+(K==='trail'?.1:.14),fc=K==='trail'?'#2a2c30':'#9ea4aa';
    M.push(tubeG([0,hy,headZ],[0,pvY+.12,pvZ],.03,fc));for(const s of [-1,1])M.push(tubeG([s*.13,hy-.05,headZ-.05],[s*.12,pvY+.08,pvZ+.02],.026,fc),tubeG([s*.11,pvY+.12,pvZ],[s*.08,hy-.04,-.62],.018,fc));
    // depósito: sección redondeada que se ensancha hacia las rodillas
    S.push([loftG([[headZ-.04,hy-.1,hy+.04,.2,2.4],[headZ-.14,hy-.14,tankTop,.4,2.4],[-.12,hy-.13,tankTop+.01,.46,2.6],[-.3,hy-.1,tankTop-.03,.36,2.4],[-.4,hy-.06,hy+.04,.26,2.2]],16),0,0,0,0,0,0,1,1,1,PC]);
    M.push([rboxG(.34,.34,.46,.08),0,r+.28,.0,0,0,0,1,1,1,K==='sport'?'#1e1f22':'#2b2d30'],[rboxG(.3,.2,.2,.06),0,r+.5,.12,-.4,0,0,1,1,1,'#3a3c40']);// motor
    for(let k=0;k<5;k++)M.push([boxG(.32,.01,.2),0,r+.36+k*.035,.13,-.4,0,0,1,1,1,'#5b5f64']);// aletas
    M.push([rboxG(.36,.28,.04,.012),0,hy-.3,headZ-.12,-.2,0,0,1,1,1,'#101113']);// radiador
    const sy=K==='trail'?hy+.04:hy-.01;
    S.push([loftG([[-.34,sy-.06,sy+.04,.26,3],[-.42,sy-.05,sy+.08,.3,3],[-.62,sy-.04,sy+.1,.28,3],[-.8,sy,sy+.13,.2,2.6]],12),0,0,0,0,0,0,1,1,1,'#141415']);// asiento
    S.push([loftG([[-.6,sy-.14,sy+.02,.26,2.4],[-.8,sy-.06,sy+.12,.24,2.4],[-.98,sy+.04,sy+.18,.14,2.2],[-1.06,sy+.1,sy+.17,.06,2]],14),0,0,0,0,0,0,1,1,1,PC]);// colín afilado
    for(const s of [-1,1])M.push(tubeG([s*.11,pvY,pvZ],[s*.11,r,rz],.03,K==='sport'?'#9ea4aa':'#3a3c40'));M.push(tubeG([0,pvY+.28,-.3],[0,r+.12,rz+.3],.03,'#c9a227'));// basculante y amortiguador
    if(K==='sport'){// carenado integral: morro afilado que se abre hacia los laterales
      S.push([loftG([[fz-.06,hy-.04,hy+.06,.16,2.2],[fz-.16,hy-.14,hy+.16,.34,2.4],[headZ+.06,hy-.24,hy+.3,.5,2.6],[headZ-.12,r+.14,hy+.26,.56,2.8],[-.1,r+.12,hy-.12,.52,2.8],[-.2,r+.16,hy-.2,.4,2.6]],20),0,0,0,0,0,0,1,1,1,PC]);
      for(const s of [-1,1])add(rboxG(.09,.035,.03,.012),HLm,s*.07,hy+.06,fz-.09,-.6,s*.25,0);const ws=add(hcG('wsG',()=>new THREE.PlaneGeometry(.3,.22)),smoke,0,hy+.36,headZ+.04,-.95,0,0);ws.castShadow=false;
      for(const s of [-1,1]){const d=new THREE.Mesh(new THREE.PlaneGeometry(.36,.13),decalTex('1000','#ffffff'));d.position.set(s*.29,hy-.02,headZ-.02);d.rotation.y=s*Math.PI/2;body.add(d)}}
    if(K==='trail'){M.push([rboxG(.3,.05,.42,.02),0,r+.08,-.02,0,0,0,1,1,1,'#b9bec4'])}// cubrecárter
    if(K==='sport')M.push(tubeG([-.08,r+.1,.12],[-.16,r+.18,-.45],.035,'#6b6f74'),[cylG(.065,.06,.42,16),-.17,r+.24,-.62,Math.PI/2-.25,0,0,1,1,1,'#2b2d30']);
    else if(K==='trail')M.push(tubeG([-.1,r+.25,.15],[-.15,hy-.02,-.55],.03,'#b9bec4'),[cylG(.06,.055,.42,16),-.17,hy+.04,-.75,Math.PI/2-.3,0,0,1,1,1,'#c9ced3']);
    else M.push(tubeG([-.08,r+.1,.12],[-.15,r+.14,-.38],.035,'#b9bec4'),[cylG(.055,.07,.3,16),-.16,r+.18,-.5,Math.PI/2-.35,0,0,1,1,1,'#202124']);
    if(K!=='sport')for(const s of [-1,1]){const d=new THREE.Mesh(new THREE.PlaneGeometry(.24,.085),decalTex(K==='trail'?'300':'700','#ffffff'));d.position.set(s*.225,tankTop-.1,-.12);d.rotation.y=s*Math.PI/2;body.add(d)}
  }
  // piloto trasero, intermitentes y matrícula
  const tailZ=K==='scooter'?-1.01:-1.08,tailY=K==='scooter'?.78:hy+.15;add(rboxG(.16,.05,.04,.02),TLm,0,tailY,tailZ);add(boxG(.06,.03,.02),RVm,0,tailY-.04,tailZ+.01);
  for(const s of [-1,1]){const ind=new THREE.MeshStandardMaterial({color:0x7a4a00,emissive:0xff9a1a,emissiveIntensity:.25});add(boxG(.05,.03,.04),ind,s*.12,tailY-.05,tailZ+.04);add(boxG(.05,.03,.04),ind,s*.13,K==='scooter'?barY+hy-.05:hy-.05,K==='scooter'?headZ+.12:fz-.15)}
  const pl=new THREE.Mesh(new THREE.PlaneGeometry(.17,.13),bikePlateTex(plateNum(ti*1000+ci*37+(g.id||0)),!!T.moped));pl.position.set(0,tailY-.17,tailZ-.02);pl.rotation.set(-.3,Math.PI,0);body.add(pl);
  // rueda trasera
  const rspin=new THREE.Group();rspin.add(bikeWheel(r,K==='scooter'?.12:K==='trail'?.12:.17,K,false));const rhold=new THREE.Group();rhold.position.set(0,r,rz);rhold.add(rspin);body.add(rhold);
  add(rboxG(.16,.02,.36,.01),stdMat('bBlk',{color:0x111214,roughness:.5}),0,r+.1,rz-.06,.5,0,0);// guardabarros trasero
  // ---- piloto (cuerpo aparte de brazos y piernas: en la vista desde el casco solo se ven manos, brazos y piernas)
  const R=lcg(ci*131+ti*17+5),jacket=['#1d1f24','#7a1f1f','#e9e9e4','#1f4e8c','#2f6b45'][Math.floor(R()*5)],helm=['#f2f2ee','#111214','#c8102e','#f4c20d','#1d4ed8'][Math.floor(R()*5)];
  const crouch=K==='sport'?1:K==='naked'?.45:K==='trail'?.15:0,seatY=K==='scooter'?.88:(K==='trail'?hy+.17:hy+.12),hip=[0,seatY+.08,-.52],sh=[0,seatY+.58-crouch*.16,hip[2]+.1+crouch*.3],hel=[0,sh[1]+.25-crouch*.05,sh[2]+.04+crouch*.12];
  const grips=[-1,1].map(s=>[s*(bw-.04),hy+barY,headZ+barZ]);
  // torso redondeado (pecho y caderas), casco con visera y mentonera
  const tz=Math.atan2(sh[2]-hip[2],sh[1]-hip[1]);B.push([rboxG(.36,.32,.22,.1),0,hip[1]+(sh[1]-hip[1])*.68,hip[2]+(sh[2]-hip[2])*.68,-tz,0,0,1,1,1,jacket],[rboxG(.32,.26,.2,.09),0,hip[1]+(sh[1]-hip[1])*.25,hip[2]+(sh[2]-hip[2])*.25,-tz,0,0,1,1,1,jacket]);
  B.push([rboxG(.34,.22,.2,.08),0,hip[1]-.02,hip[2],0,0,0,1,1,1,'#25272b'],[cylG(.05,.055,.08,10),0,sh[1]+.08,sh[2]+.02,0,0,0,1,1,1,'#1b1c1f']);
  B.push([sphG(.145,18,14),hel[0],hel[1],hel[2],0,0,0,1,1.04,1.12,helm],[sphG(.147,18,14),hel[0],hel[1]+.012,hel[2]+.05,0,0,0,.86,.46,.88,'#0b0d10'],[rboxG(.16,.07,.08,.03),hel[0],hel[1]-.09,hel[2]+.1,0,0,0,1,1,1,helm]);
  const L=[];for(const s of [-1,1]){const shp=[s*.17,sh[1]-.03,sh[2]],gp=grips[s<0?0:1],el=[(shp[0]+gp[0])/2+s*.08,(shp[1]+gp[1])/2-.05,(shp[2]+gp[2])/2-.02];
    L.push([sphG(.06,10,8),shp[0],shp[1],shp[2],0,0,0,1,1,1,jacket],tubeG(shp,el,.052,jacket),[sphG(.05,8,6),el[0],el[1],el[2],0,0,0,1,1,1,jacket],tubeG(el,gp,.045,jacket),[sphG(.044,10,8),gp[0],gp[1]+.01,gp[2]-.01,0,0,0,1.1,.9,1.3,'#141416']);
    const hp=[s*.11,hip[1]-.02,hip[2]+.04],kn=K==='scooter'?[s*.17,hip[1]-.02,hip[2]+.44]:[s*.19,hip[1]+.0+crouch*.06,hip[2]+.4],ft=K==='scooter'?[s*.13,.4,-.04]:[s*.16,r+.16,-.3];
    L.push(tubeG(hp,kn,.085,'#25272b'),[sphG(.065,10,8),kn[0],kn[1],kn[2],0,0,0,1,1,1,'#25272b'],tubeG(kn,ft,.065,'#25272b'),[rboxG(.1,.1,.26,.04),ft[0],ft[1]+.03,ft[2]+.04,0,0,0,1,1,1,'#101012'])}
  const rider=new THREE.Mesh(linVC(mergeParts(B)),stdMat('rdVC',{vertexColors:true,roughness:.6,metalness:.05,envMapIntensity:.5}));rider.castShadow=HQ;body.add(rider);
  const limbs=new THREE.Mesh(linVC(mergeParts(L)),stdMat('rdVC',{vertexColors:true,roughness:.6,metalness:.05,envMapIntensity:.5}));limbs.castShadow=HQ;body.add(limbs);
  if(S.length){const o=new THREE.Mesh(linVC(mergeParts(S)),stdMat('bkS',{vertexColors:true,roughness:.45,metalness:.25,envMapIntensity:.8,side:THREE.DoubleSide}));o.castShadow=HQ;body.add(o)}
  if(M.length){const o=new THREE.Mesh(linVC(mergeParts(M)),stdMat('bkM',{vertexColors:true,roughness:.3,metalness:.85}));o.castShadow=HQ;body.add(o)}
  const wheels=[{piv:steer,spin:fspin,front:true},{piv:rhold,spin:rspin,front:false}];
  g.userData={wheels,body,paint,tail:TLm,rev:RVm,head:HLm,int:{bike:true,down:3.4,eye:new THREE.Vector3(0,hel[1]+.03,hel[2]+.06),drv:rider,dCv,dT},glass:null};return g}
let _bdT=0;function bikeInterior(c,dt,inside){const I=c.m.userData.int;I.drv.visible=!inside;if(!inside)return;_bdT-=dt;if(_bdT>0)return;_bdT=1/12;drawBikeDash(I.dCv,Math.abs(c.vf||0)*3.6,c.rpm||.1,c.gear||1);I.dT.needsUpdate=true}
