
/* ============ TERRENO REAL (alturas EU-DEM 25 m, rejilla cada 40 m) ============ */
let DEM=null;const TG={};
function loadDEM(){const D=window.AG_DEM,b=atob(D.b64),n=D.NX*D.NZ,v=new Float32Array(n);for(let i=0;i<n;i++){let q=b.charCodeAt(i*2)|(b.charCodeAt(i*2+1)<<8);if(q>32767)q-=65536;v[i]=q===-32768?NaN:q/10}DEM={NX:D.NX,NZ:D.NZ,SP:D.SP,v}}
function demAt(x,z){const g=DEM,fx=clamp(x/g.SP,0,g.NX-1.001),fz=clamp(z/g.SP,0,g.NZ-1.001),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,w=fz-j;
  const at=(a,b)=>{const q=g.v[b*g.NX+a];return isNaN(q)?-3:q};return at(i,j)*(1-u)*(1-w)+at(i+1,j)*u*(1-w)+at(i,j+1)*(1-u)*w+at(i+1,j+1)*u*w}
const GS=UHQ?6:HQ?9:12;
function buildTerrainGrid(){const nx=Math.ceil(WM/GS)+1,nz=Math.ceil(HM/GS)+1,h=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=Math.min(i*GS,WM-.01),z=Math.min(j*GS,HM-.01);h[j*nx+i]=isSea(x,z)?-2.6:Math.max(.35,demAt(x,z))}
  // suavizado ligero (solo tierra)
  for(let pass=0;pass<3;pass++){const o=h.slice();for(let j=1;j<nz-1;j++)for(let i=1;i<nx-1;i++){const k=j*nx+i;if(o[k]<0)continue;let s=0,c=0;for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const q=o[k+b*nx+a];if(q>=0){s+=q;c++}}h[k]=s/c}}
  Object.assign(TG,{nx,nz,h})}
function H(x,z){if(PMASK&&pmAt(x,z)===1)return PDECK;const fx=clamp(x/GS,0,TG.nx-1.001),fz=clamp(z/GS,0,TG.nz-1.001),i=Math.floor(fx),j=Math.floor(fz),u=fx-i,w=fz-j,n=TG.nx,h=TG.h;
  // misma partición en triángulos que la malla del suelo
  const a=h[j*n+i],b=h[j*n+i+1],c=h[(j+1)*n+i],d=h[(j+1)*n+i+1];return u+w<=1?a+(b-a)*u+(c-a)*w:d+(c-d)*(1-u)+(b-d)*(1-w)}

/* las calles que se tocan (mismo nodo de OSM) tienen que llegar a la misma altura: cada perfil se calculaba por separado y en los cruces
   y en las bocas de los antiguos túneles quedaban escalones de 3-8 m. Se busca la altura común en cada extremo y se reparte la corrección
   en rampa suave (hasta 80 m) a lo largo de la calle. Las calles de más categoría pesan más; un extremo que cae en mitad de otra calle se
   ajusta a ella. */
function junctionFix(CR){const C=8,G=new Map(),key=(x,z)=>Math.floor(z/C)*100000+Math.floor(x/C),W=[8,6,5,4,3,2,1.5,1];
  CR.forEach((r,ri)=>{const P=r.dp,N=P.length/2;for(let j=0;j<N;j++){const k=key(P[j*2],P[j*2+1]);let b=G.get(k);if(!b)G.set(k,b=[]);b.push(ri,j)}});
  // los extremos que tocan un puente o una rampa no se mueven (el tablero ya está calculado con esa altura)
  const PIN=[];for(const st of STR.list){const P=st.P,n=P.length/2;PIN.push(P[0],P[1],P[n*2-2],P[n*2-1])}const pinned=(x,z)=>{for(let t=0;t<PIN.length;t+=2)if(Math.abs(PIN[t]-x)<1.5&&Math.abs(PIN[t+1]-z)<1.5)return true;return false};
  const ends=[];CR.forEach((r,ri)=>{const P=r.dp,N=P.length/2;for(const e of [0,N-1]){const x=P[e*2],z=P[e*2+1],M=[];if(pinned(x,z)){r._pin=r._pin||[];r._pin.push(e);continue}const gx=Math.floor(x/C),gz=Math.floor(z/C);
    for(let b=-1;b<=1;b++)for(let a=-1;a<=1;a++){const B=G.get((gz+b)*100000+gx+a);if(!B)continue;for(let t=0;t<B.length;t+=2){const qi=B[t],j=B[t+1];if(qi===ri)continue;const Q=CR[qi].dp;if(Math.hypot(Q[j*2]-x,Q[j*2+1]-z)<1)M.push(qi,j)}}
    if(M.length)ends.push({ri,e,M})}});
  let maxd=0;for(let it=0;it<5;it++){const D=CR.map(()=>[0,0]);
    for(const E of ends){const r=CR[E.ri],N=r.dp.length/2;let mid=null,ms=0,mw=0,s=r.cy[E.e]*W[r[0]],w=W[r[0]];const pw=(q,j)=>q._pin&&q._pin.includes(j)?1e4:W[q[0]];
      for(let t=0;t<E.M.length;t+=2){const q=CR[E.M[t]],j=E.M[t+1],Nq=q.dp.length/2;if(j>0&&j<Nq-1){if(mid===null||q[0]<mid){mid=q[0];ms=0;mw=0}if(q[0]===mid){ms+=q.cy[j];mw++}}else{s+=q.cy[j]*pw(q,j);w+=pw(q,j)}}
      const tgt=mid!==null?ms/mw:s/w;D[E.ri][E.e===0?0:1]=tgt-r.cy[E.e]}
    CR.forEach((r,ri)=>{const [d0,d1]=D[ri];if(!d0&&!d1)return;const P=r.dp,N=P.length/2,cum=new Float32Array(N);for(let i=1;i<N;i++)cum[i]=cum[i-1]+Math.hypot(P[i*2]-P[i*2-2],P[i*2+1]-P[i*2-1]);const L=cum[N-1]||1,F=Math.min(80,L);
      const cy=Float32Array.from(r.cy);for(let i=0;i<N;i++){const a=Math.max(0,1-cum[i]/F),b=Math.max(0,1-(L-cum[i])/F);cy[i]+=d0*(F<L?a:1-cum[i]/L)+d1*(F<L?b:cum[i]/L)}
      if(r._lim)for(let i=0;i<N;i++)cy[i]=Math.min(cy[i],r._lim(i));r.cy=cy;maxd=Math.max(maxd,Math.abs(d0),Math.abs(d1))})}
  console.log('env juntas',ends.length,'max',maxd.toFixed(2));return ends.length}
/* las calles reales son planas de lado a lado: se adapta el terreno a su perfil longitudinal suavizado */
function conformTerrain(){strPrep();const CR=[];const n=TG.nx,m=TG.nz,h=TG.h,acc=new Float32Array(n*m),wsum=new Float32Array(n*m),mx=new Float32Array(n*m),cap=new Float32Array(n*m).fill(1e9),flo=new Float32Array(n*m).fill(-1e9),pc=new Uint8Array(n*m).fill(99),capc=new Uint8Array(n*m).fill(99);const bd=new Float32Array(n*m).fill(1e9);
  for(const r of WD.roads){const cls=r[0];if(cls>7||cls===8||cls===10)continue;if(r[4]===1||r[4]===3||r[4]===4)continue;let P=[];for(let i=5;i<r.length;i+=2)P.push(r[i]*K,r[i+1]*K);P=densify(P,4);const N=P.length/2;if(N<2)continue;
    const hw=r[1]*K/2+(cls===0?5:cls<=5?2.6:.5);const raw=new Float32Array(N);for(let i=0;i<N;i++)raw[i]=H(P[i*2],P[i*2+1]);// antiguo túnel: la vía va en trinchera, en línea recta entre las dos bocas (sin subir y bajar el cerro)
    if(r.wasT){const a=raw[0],b=raw[N-1];for(let i=0;i<N;i++)raw[i]=Math.min(raw[i],a+(b-a)*i/(N-1))}
    const UND=r.under||[];const lim=i=>{let m=1e9;for(const u of UND)m=Math.min(m,u.y+Math.max(0,Math.hypot(P[i*2]-u.x,P[i*2+1]-u.z)-10)*.075);return m};if(UND.length)for(let i=0;i<N;i++)raw[i]=Math.min(raw[i],lim(i));
    let cy=raw;const NP=cls<=3?6:2;for(let pass=0;pass<NP;pass++){const o=new Float32Array(N);for(let i=0;i<N;i++){let s=0,c=0;for(let k=-9;k<=9;k++){const q=i+k;if(q<0||q>=N)continue;const w=10-Math.abs(k);s+=cy[q]*w;c+=w}o[i]=s/c}cy=o}if(UND.length)for(let i=0;i<N;i++)cy[i]=Math.min(cy[i],lim(i));r.cy=cy;r.dp=P;r._hw=hw;r._lim=UND.length?lim:null;r._pin=null;CR.push(r)}
  junctionFix(CR);
  for(const r of CR){const cls=r[0],P=r.dp,N=P.length/2,hw=r._hw,cy=r.cy,pinA=!!(r._pin&&r._pin.includes(0)),pinB=!!(r._pin&&r._pin.includes(N-1)),hwc=r[1]*K/2+1;
    const R=hw+7;for(let i=0;i<N-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3];const x0=Math.max(0,Math.floor((Math.min(ax,bx)-R)/GS)),x1=Math.min(n-1,Math.ceil((Math.max(ax,bx)+R)/GS)),z0=Math.max(0,Math.floor((Math.min(az,bz)-R)/GS)),z1=Math.min(m-1,Math.ceil((Math.max(az,bz)+R)/GS));
      const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;
      for(let gz=z0;gz<=z1;gz++)for(let gx=x0;gx<=x1;gx++){const k=gz*n+gx;if(h[k]<0)continue;const x=gx*GS,z=gz*GS;let t=((x-ax)*dx+(z-az)*dz)/L2;
        // un extremo que apoya en un puente no se prolonga más allá del estribo (debajo del tablero pasa otra vía)
        if((t<0&&i===0&&pinA)||(t>1&&i===N-2&&pinB))continue;const cap0=(t<0&&i===0)||(t>1&&i===N-2);t=t<0?0:t>1?1:t;const d=Math.hypot(x-ax-dx*t,z-az-dz*t);if(d>R)continue;
        const w=d<=hw?1:1-(d-hw)/(R-hw);const ww=w*w*(3-2*w);const ty=cy[i]+(cy[i+1]-cy[i])*t;
        // jerarquía: donde dos vías se cruzan a distinto nivel manda la más importante (autovía > avenida > calle);
        // pero la calzada de cualquier calle manda sobre el talud (margen) de otra: así una calle paralela a una autovía no queda en su talud (el talud de las autovías sí manda; no cuentan como calzada el remate más allá del final de una calle ni las antiguas trincheras)
        const pr=(d<=hw&&!r.wasT&&!cap0)||cls===0?cls:cls+10;
        if(pr<pc[k]&&ww>.5&&wsum[k]>0&&Math.abs(acc[k]/wsum[k]-ty)>2.5){acc[k]=0;wsum[k]=0;mx[k]=0}
        if(pr>pc[k]&&wsum[k]>0&&Math.abs(acc[k]/wsum[k]-ty)>2.5)continue;
        if(ww>.5&&pr<pc[k])pc[k]=pr;
        if(ww>(mx[k]||0))mx[k]=ww;acc[k]+=ty*ww;wsum[k]+=ww;
        // plataforma: a igual categoría y alturas muy distintas (vía paralela más baja) manda la vía cuyo eje está más cerca
        const cp=d<=hwc?cls:cls+10;// (y la calzada de una calle manda sobre la acera/arcén de otra)
        if(cls<=3&&d<=hw+GS*.5){if(cp<capc[k]){if(capc[k]<99&&Math.abs(cap[k]-(ty-.2))>2.5){cap[k]=ty-.2;flo[k]=ty-.25}capc[k]=cp;bd[k]=d}
          else if(cp>capc[k]&&Math.abs(cap[k]-(ty-.2))>2.5)continue;
          else if(cp===capc[k]&&Math.abs(cap[k]-(ty-.2))>2.5){if(d<bd[k]){cap[k]=ty-.2;flo[k]=ty-.25;bd[k]=d}continue}else if(d<bd[k])bd[k]=d;if(ty-.2<cap[k])cap[k]=ty-.2;if(ty-.25>flo[k])flo[k]=ty-.25}}}}
  for(let k=0;k<n*m;k++)if(wsum[k]>0){const a=mx[k];h[k]=h[k]*(1-a)+(acc[k]/wsum[k])*a}
  // el terreno nunca asoma por encima de la plataforma de las carreteras principales
  if(!window.__nocap)for(let k=0;k<n*m;k++){if(h[k]>cap[k])h[k]=cap[k];if(flo[k]>-1e8&&h[k]<flo[k]&&h[k]>-1)h[k]=Math.min(flo[k],cap[k])}}
function Hn(x,z){const e=1.5;const hx=H(x+e,z)-H(x-e,z),hz=H(x,z+e)-H(x,z-e);const v=new THREE.Vector3(-hx,2*e,-hz);return v.normalize()}

/* ============ ESCENA, CIELO CON SIERRA DE GÁDOR, MAR ============ */
let renderer,scene,camera,sun,envMap,skyMesh,seaMat;
function paintSky(){const c=cvs(2048,1024),g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,0,1024);gr.addColorStop(0,'#2a6fc4');gr.addColorStop(.32,'#5b9be0');gr.addColorStop(.47,'#bcd9ef');gr.addColorStop(.5,'#dfe9ee');gr.addColorStop(.52,'#a9a08a');gr.addColorStop(1,'#6e6656');g.fillStyle=gr;g.fillRect(0,0,2048,1024);
  // nubes suaves
  for(let i=0;i<70;i++){const x=Math.random()*2048,y=120+Math.random()*330,r=30+Math.random()*90;const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,'rgba(255,255,255,.35)');q.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=q;g.beginPath();g.ellipse(x,y,r*2.2,r*.55,0,0,TAU);g.fill()}
  // sierras: Gádor al norte (u≈0.75), lomas al este/oeste; al sur el mar
  const ridge=(u0,u1,hmax,col,seed)=>{const R=lcg(seed);g.fillStyle=col;g.beginPath();g.moveTo(u0*2048,512);let y=0;
    for(let x=u0*2048;x<=u1*2048;x+=6){const t=(x/2048-u0)/(u1-u0),env=Math.sin(t*Math.PI)**.7;y+=(R()-.5)*14;y=clamp(y,-hmax*.35,hmax*.35);g.lineTo(x,512-env*(hmax+y))}g.lineTo(u1*2048,515);g.closePath();g.fill()};
  ridge(.5,1.0,150,'rgba(140,155,175,.85)',3);ridge(.55,.98,110,'rgba(118,128,140,.92)',7);ridge(.6,.92,70,'rgba(120,112,95,.95)',11);ridge(.38,.56,40,'rgba(130,140,150,.7)',13);ridge(.94,1.1,45,'rgba(130,140,150,.7)',17);
  g.fillStyle='rgba(223,233,238,.5)';g.fillRect(0,500,2048,14);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t}
/* la sombra del sol sigue al jugador «encajada» en la rejilla de texels del mapa de sombras:
   así los bordes no tiemblan ni reptan al moverse (lo que daba las sombras raras en los edificios) */
const _sd=new THREE.Vector3(-160,240,140).normalize(),_sr=new THREE.Vector3(),_su=new THREE.Vector3();_sr.crossVectors(new THREE.Vector3(0,1,0),_sd).normalize();_su.crossVectors(_sd,_sr).normalize();
function sunFollow(x,y,z){if(!HQ||!sun)return;const tx=180/sun.shadow.mapSize.x;const a=x*_sr.x+y*_sr.y+z*_sr.z,b=x*_su.x+y*_su.y+z*_su.z,c=x*_sd.x+y*_sd.y+z*_sd.z;
  const A=Math.round(a/tx)*tx,B=Math.round(b/tx)*tx;const px=_sr.x*A+_su.x*B+_sd.x*c,py=_sr.y*A+_su.y*B+_sd.y*c,pz=_sr.z*A+_su.z*B+_sd.z*c;
  sun.target.position.set(px,py,pz);sun.position.set(px+_sd.x*330,py+_sd.y*330,pz+_sd.z*330)}
function initScene(){
  renderer=new THREE.WebGLRenderer({canvas:$('c'),antialias:HQ,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio||1,UHQ?1.5:IS_TOUCH?1:1.2));
  renderer.setClearColor(0xcfe0ea);renderer.outputEncoding=THREE.sRGBEncoding;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  if(HQ){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap}
  scene=new THREE.Scene();const FOG=0xcfe0ea;scene.fog=new THREE.Fog(FOG,HQ?170:120,HQ?700:500);
  const skyT=paintSky();skyMesh=new THREE.Mesh(new THREE.SphereGeometry(HQ?640:460,48,24),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide,fog:false,depthWrite:false}));skyMesh.renderOrder=-10;skyMesh.userData.dyn=1;scene.add(skyMesh);
  // mapa de entorno para la pintura de los coches
  try{const pm=new THREE.PMREMGenerator(renderer);const es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.MeshBasicMaterial({map:skyT,side:THREE.BackSide})));envMap=pm.fromScene(es,.02).texture;pm.dispose()}catch(e){envMap=null}
  camera=new THREE.PerspectiveCamera(62,1,0.45,UHQ?740:HQ?600:480);
  scene.add(new THREE.HemisphereLight(0xe3f0ff,0x9a8466,0.6));
  sun=new THREE.DirectionalLight(0xffe8c8,1.32);sun.position.set(-160,240,140);scene.add(sun);sun.target.userData.dyn=1;scene.add(sun.target);
  if(HQ){sun.castShadow=true;sun.shadow.mapSize.set(UHQ?2048:1024,UHQ?2048:1024);const c=sun.shadow.camera;c.left=-90;c.right=90;c.top=90;c.bottom=-90;c.near=10;c.far=700;c.updateProjectionMatrix();sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.09}
  // sol visible
  const sc=cvs(128,128),sg=sc.getContext('2d'),q=sg.createRadialGradient(64,64,0,64,64,64);q.addColorStop(0,'rgba(255,255,240,1)');q.addColorStop(.15,'rgba(255,250,220,.95)');q.addColorStop(.4,'rgba(255,230,170,.25)');q.addColorStop(1,'rgba(255,220,150,0)');sg.fillStyle=q;sg.fillRect(0,0,128,128);
  const sunS=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(sc),fog:false,depthWrite:false,blending:THREE.AdditiveBlending}));sunS.scale.set(140,140,1);skyMesh.add(sunS);sunS.position.set(-160,240,140).normalize().multiplyScalar(HQ?600:430);
  addEventListener('resize',resize);resize()}
function resize(){const w=innerWidth,h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
/* registro de capas planas apoyadas en el terreno (asfalto, aceras, parques, medianas…) y teselas del suelo */
const OVL=[],GTILES=[];
function buildGround(){
  const gt=paintGround();const n=TG.nx,m=TG.nz;
  const det=tileTex(256,256,(q,w,h)=>{q.fillStyle='#808080';q.fillRect(0,0,w,h);for(let i=0;i<9000;i++){const v=100+Math.random()*80|0;q.fillStyle=`rgb(${v},${v},${v})`;q.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2.5,1+Math.random()*2.5)}});
  const mat=new THREE.MeshLambertMaterial({map:gt});mat.onBeforeCompile=sh=>{sh.uniforms.tDet={value:det};
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying float vSlp;').replace('#include <begin_vertex>','#include <begin_vertex>\nvSlp=1.0-normal.y;');
    // en laderas y taludes empinados el dibujo del mapa (calles, aceras) se estira en vertical: ahí se pinta tierra/roca
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform sampler2D tDet;\nvarying float vSlp;').replace('#include <map_fragment>',`#include <map_fragment>\n diffuseColor.rgb=mix(diffuseColor.rgb,vec3(0.40,0.33,0.24),0.3*smoothstep(0.12,0.3,vSlp));\n diffuseColor.rgb*=0.8+0.4*texture2D(tDet,vUv*vec2(${(WM/5).toFixed(1)},${(HM/5).toFixed(1)})).r;`)};
  // terreno en baldosas para que solo se dibuje lo que se ve
  const TS=40;for(let tj=0;tj<m-1;tj+=TS)for(let ti=0;ti<n-1;ti+=TS){const w=Math.min(TS,n-1-ti)+1,h=Math.min(TS,m-1-tj)+1,P=new Float32Array(w*h*3),U=new Float32Array(w*h*2);
    for(let j=0;j<h;j++)for(let i=0;i<w;i++){const gi=ti+i,gj=tj+j,k=j*w+i,x=Math.min(gi*GS,WM),z=Math.min(gj*GS,HM);P[k*3]=x;P[k*3+1]=TG.h[gj*n+gi];P[k*3+2]=z;U[k*2]=x/WM;U[k*2+1]=1-z/HM}
    const I=new Uint32Array((w-1)*(h-1)*6);let o=0;for(let j=0;j<h-1;j++)for(let i=0;i<w-1;i++){const a=j*w+i,b=a+1,c=a+w,d=c+1;I[o++]=a;I[o++]=c;I[o++]=b;I[o++]=b;I[o++]=c;I[o++]=d}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(P,3));g.setAttribute('uv',new THREE.BufferAttribute(U,2));g.setIndex(new THREE.BufferAttribute(I,1));g.computeVertexNormals();g.computeBoundingSphere();
    const gm=new THREE.Mesh(g,mat);gm.receiveShadow=HQ;scene.add(gm);GTILES.push({g,ti,tj,w,h})}
  // borde del mapa: el terreno se prolonga 700 m hacia fuera a la altura del borde (antes se cortaba en un acantilado y el mar lo cubría todo)
  {const AP=new THREE.MeshLambertMaterial({color:0xb8a98a});const P=[],I=[];const ring=[];for(let i=0;i<n;i++)ring.push([i,0,0,-1]);for(let j=0;j<m;j++)ring.push([n-1,j,1,0]);for(let i=n-1;i>=0;i--)ring.push([i,m-1,0,1]);for(let j=m-1;j>=0;j--)ring.push([0,j,-1,0]);
    for(let k=0;k<ring.length;k++){const [i,j,dx,dz]=ring[k];const x=Math.min(i*GS,WM),z=Math.min(j*GS,HM),y=TG.h[j*n+i],yi=TG.h[clamp(j-dz,0,m-1)*n+clamp(i-dx,0,n-1)],land=!isSea(Math.min(x,WM-1)-dx*GS,Math.min(z,HM-1)-dz*GS)&&yi>-.5;const yo=land?Math.max(.6,Math.min(y,yi)*.5):y-3;P.push(x,y-.05,z,x+dx*700,yo,z+dz*700)}
    for(let k=0;k<ring.length-1;k++){const a=k*2;if(ring[k][2]!==ring[k+1][2]||ring[k][3]!==ring[k+1][3])continue;I.push(a,a+1,a+2,a+1,a+3,a+2)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();const am=new THREE.Mesh(g,AP);am.material.side=THREE.DoubleSide;am.receiveShadow=HQ;scene.add(am)}
  // faldón alrededor del mapa
  const out=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),new THREE.MeshLambertMaterial({color:0x9a8a6c}));out.rotation.x=-Math.PI/2;out.position.set(WM/2,-3,HM/2);scene.add(out);
  // mar con reflejos
  const nm=tileTex(256,256,(q,w,h)=>{q.fillStyle='#2b7fae';q.fillRect(0,0,w,h);for(let i=0;i<160;i++){q.strokeStyle=`rgba(255,255,255,${.05+Math.random()*.16})`;q.lineWidth=1.4;q.beginPath();const x=Math.random()*w,y=Math.random()*h;q.moveTo(x,y);q.quadraticCurveTo(x+8,y-3,x+18,y);q.stroke()}});
  nm.repeat.set(1/16,1/16);
  seaMat=new THREE.MeshStandardMaterial({map:nm,color:0x7fb8d8,roughness:.18,metalness:.25,envMap,envMapIntensity:.9,transparent:true,opacity:.9});
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(9000,9000),seaMat);sea.rotation.x=-Math.PI/2;sea.position.set(WM/2,0,HM/2);sea.renderOrder=1;scene.add(sea);
  nm.repeat.set(9000/16,9000/16)}

/* ============ CALLES SOBRE EL TERRENO ============ */
function densify(P,step){const o=[P[0],P[1]];for(let i=2;i<P.length;i+=2){const ax=o[o.length-2],az=o[o.length-1],bx=P[i],bz=P[i+1],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/step));for(let k=1;k<=n;k++)o.push(ax+(bx-ax)*k/n,az+(bz-az)*k/n)}return o}
function RB(){return{p:[],u:[],i:[]}}
function trimP(P,a,b){const n=P.length/2;let L=0;const cum=[0];for(let i=1;i<n;i++){L+=Math.hypot(P[i*2]-P[i*2-2],P[i*2+1]-P[i*2-1]);cum.push(L)}if(L-a-b<3)return null;const o=[];for(let i=0;i<n;i++)if(cum[i]>=a&&cum[i]<=L-b)o.push(P[i*2],P[i*2+1]);return o.length>=4?o:null}
let RIBYC=null;// alturas del eje de la calzada (perfil suavizado) para las autovías: plataforma plana, sin dientes del terreno
function ribbon(rb,P,hw,off,us,vs,caps){const n=P.length/2;if(n<2)return;let acc=0;const b=rb.p.length/3;if(RIBYC&&!rb.yc)rb.yc=new Array(b*1).fill(NaN);if(rb.yc)while(rb.yc.length<b)rb.yc.push(NaN);
  for(let i=0;i<n;i++){const x=P[i*2],z=P[i*2+1];let tx,tz,k=1;
    const d1x=i>0?x-P[i*2-2]:0,d1z=i>0?z-P[i*2-1]:0,d2x=i<n-1?P[i*2+2]-x:0,d2z=i<n-1?P[i*2+3]-z:0;const l1=Math.hypot(d1x,d1z)||1,l2=Math.hypot(d2x,d2z)||1;
    if(i===0){tx=d2x/l2;tz=d2z/l2}else if(i===n-1){tx=d1x/l1;tz=d1z/l1}else{tx=d1x/l1+d2x/l2;tz=d1z/l1+d2z/l2;const L=Math.hypot(tx,tz);if(L<1e-3){tx=d1x/l1;tz=d1z/l1}else{tx/=L;tz/=L;k=1/Math.max(.7,(tx*d1x+tz*d1z)/l1)}}
    if(i>0)acc+=l1;const nx=-tz,nz=tx;if(rb.yc){const v=RIBYC?RIBYC[i]:NaN;rb.yc.push(v,v)}rb.p.push(x+nx*(off+hw)*k,0,z+nz*(off+hw)*k,x+nx*(off-hw)*k,0,z+nz*(off-hw)*k);rb.u.push((off+hw)/us,acc/vs,(off-hw)/us,acc/vs);
    if(i>0){const a=b+(i-1)*2;rb.i.push(a,a+1,a+2,a+1,a+3,a+2)}}
  if(caps&&!RIBYC){disc(rb,P[0],P[1],hw,us);disc(rb,P[n*2-2],P[n*2-1],hw,us)}if(rb.yc)while(rb.yc.length<rb.p.length/3)rb.yc.push(NaN)}
function disc(rb,x,z,r,us){const b=rb.p.length/3,N=12;rb.p.push(x,0,z);rb.u.push(x/us,z/us);for(let k=0;k<=N;k++){const a=k/N*TAU;rb.p.push(x+Math.cos(a)*r,0,z+Math.sin(a)*r);rb.u.push((x+Math.cos(a)*r)/us,(z+Math.sin(a)*r)/us)}for(let k=0;k<N;k++)rb.i.push(b,b+1+k,b+2+k)}
function rbMesh(rb,mat,y,order,minY){if(!rb.i.length)return;for(let i=0;i<rb.p.length;i+=3){let v=H(rb.p[i],rb.p[i+2])+y;let yc=rb.yc?rb.yc[i/3]:NaN;if(yc===yc){if(yc>5e3)yc-=1e4;// perfil suavizado, pero nunca enterrado ni flotando: como mucho 35 cm sobre el terreno
      v=clamp(yc+y+.05,v,v+.35)}if(minY!==undefined&&v<minY)v=minY;rb.p[i+1]=v}
  OVL.push({p:rb.p,i:rb.i});return chunkMesh(rb.p,rb.u,rb.i,mat,order)}
/* parte una malla grande (calles de todo el mapa) en trozos de 200 m: solo se dibuja lo que entra en cámara.
   Antes cada capa de calles era una sola malla de todo el mapa y se pintaban ~400.000 triángulos siempre */
function chunkMesh(P,U,I,mat,order,shadow){const C=320,buckets=new Map();for(let t=0;t<I.length;t+=3){const a=I[t]*3;const k=Math.floor(P[a+2]/C)*100+Math.floor(P[a]/C);let b=buckets.get(k);if(!b)buckets.set(k,b=[]);b.push(I[t],I[t+1],I[t+2])}
  let last=null;for(const idx of buckets.values()){const map=new Map(),p=[],u=[],ii=[];for(const v of idx){let n=map.get(v);if(n===undefined){n=p.length/3;map.set(v,n);p.push(P[v*3],P[v*3+1],P[v*3+2]);if(U)u.push(U[v*2],U[v*2+1])}ii.push(n)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));if(U)g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setIndex(ii);g.computeVertexNormals();g.computeBoundingSphere();
    const m=new THREE.Mesh(g,mat);m.renderOrder=order||0;m.receiveShadow=HQ&&shadow!==false;scene.add(m);last=m}return last}
/* bordillo: cara vertical a lo largo de la calle */
function curbStrip(G,P,off,y0,y1){for(let i=0;i<P.length-2;i+=2){const ax=P[i],az=P[i+1],bx=P[i+2],bz=P[i+3],L=Math.hypot(bx-ax,bz-az);if(L<.05)continue;const nx=-(bz-az)/L,nz=(bx-ax)/L;
  const x0=ax+nx*off,z0=az+nz*off,x1=bx+nx*off,z1=bz+nz*off,h0=H(x0,z0),h1=H(x1,z1),v=G.p.length/3;G.p.push(x0,h0+y0,z0,x1,h1+y0,z1,x1,h1+y1,z1,x0,h0+y1,z0);G.i.push(v,v+1,v+2,v,v+2,v+3)}}
function roadMat(o){return new THREE.MeshLambertMaterial(Object.assign({side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3},o))}
const ISLANDS=[];const ROADPATHS=[];const WALKQ=[];const TALUD={p:[],i:[]};
/* altura del eje (perfil suavizado de conformTerrain) en cada punto de P, interpolada por distancia recorrida */
function centerY(r,P){const n=P.length/2,o=new Float32Array(n);if(!r.cy||!r.dp){for(let i=0;i<n;i++)o[i]=H(P[i*2],P[i*2+1]);return o}const D=r.dp,m=D.length/2,cum=[0];for(let i=1;i<m;i++)cum.push(cum[i-1]+Math.hypot(D[i*2]-D[i*2-2],D[i*2+1]-D[i*2-1]));
  let s=0,j=0;for(let i=0;i<n;i++){if(i>0)s+=Math.hypot(P[i*2]-P[i*2-2],P[i*2+1]-P[i*2-1]);while(j<m-2&&cum[j+1]<s)j++;const t=cum[j+1]>cum[j]?clamp((s-cum[j])/(cum[j+1]-cum[j]),0,1):0;o[i]=r.cy[j]+(r.cy[Math.min(m-1,j+1)]-r.cy[j])*t}return o}
function buildRoads(){
  const walk=RB(),prom=RB(),pier=RB(),asph=RB(),dash=RB(),line=RB(),zeb=RB(),shoulder=RB(),stop=RB(),curbs={p:[],i:[]};
  const nodes=new Map();for(const r of WD.roads){if(r[0]>7)continue;for(let i=5;i<r.length;i+=2){const k=r[i]+','+r[i+1];nodes.set(k,(nodes.get(k)||0)+1)}}
  for(const r of WD.roads){const cls=r[0],wpx=r[1],ow=r[2];if(cls===8||cls===10)continue;let P=[];for(let i=5;i<r.length;i+=2){const x=r[i]*K,z=r[i+1]*K;const q=P.length;if(q&&Math.hypot(P[q-2]-x,P[q-1]-z)<.05)continue;P.push(x,z)}if(P.length<4)continue;
    P=densify(P,5);const hw=wpx*K/2;ROADPATHS.push({P,hw,cls,ow,rb:r[4]===2,name:r[3],st:r[4]===1||r[4]===3||r[4]===4});if(r[4]===1||r[4]===3||r[4]===4)continue;
    if(cls>=1&&cls<=3){RIBYC=centerY(r,P).map(v=>v+1e4)}
    if(cls>=1&&cls<=4){const j0=(nodes.get(r[5]+','+r[6])||0)>1,j1=(nodes.get(r[r.length-2]+','+r[r.length-1])||0)>1,PW=trimP(P,j0?hw+5:0,j1?hw+5:0);if(PW){let yc=null;if(RIBYC){let s0=0;for(let q=0;q<P.length/2;q++)if(P[q*2]===PW[0]&&P[q*2+1]===PW[1]){s0=q;break}yc=RIBYC.slice(s0,s0+PW.length/2)}WALKQ.push({PW,hw,yc,rp:ROADPATHS[ROADPATHS.length-1]})}ribbon(asph,P,hw,0,6,6,true);
      const PL=trimP(P,j0?hw+7:0,j1?hw+7:0);if(cls<=3&&hw>3.2&&PL){const keep=RIBYC;let s0=0;for(let q=0;q<P.length/2;q++)if(P[q*2]===PL[0]&&P[q*2+1]===PL[1]){s0=q;break}RIBYC=keep?keep.slice(s0,s0+PL.length/2):null;ribbon(line,PL,.06,hw-.35,.12,4,false);ribbon(line,PL,.06,-(hw-.35),.12,4,false);RIBYC=keep}}
    else if(cls===0){RIBYC=centerY(r,P);ribbon(shoulder,P,hw+1,0,6,6,true);ribbon(asph,P,hw,0,6,6,true);{// marcas viales de la autovía recortadas en los enlaces (antes se cruzaban en las bifurcaciones)
        const jA=(nodes.get(r[5]+','+r[6])||0)>1,jB=(nodes.get(r[r.length-2]+','+r[r.length-1])||0)>1,cut=hw+14,PM=trimP(P,jA?cut:0,jB?cut:0);
        if(PM){const keep=RIBYC;let s0=0;for(let q=0;q<P.length/2;q++)if(P[q*2]===PM[0]&&P[q*2+1]===PM[1]){s0=q;break}RIBYC=keep.slice(s0,s0+PM.length/2);
          ribbon(line,PM,.07,hw-.45,.14,4,false);ribbon(line,PM,.07,-(hw-.45),.14,4,false);if(r[4]!==2&&hw>3.5)ribbon(dash,PM,.075,0,.15,6,false);RIBYC=keep}}
      // talud: falda desde el borde del arcén hasta el terreno, para que la plataforma no quede «flotando»
      for(const s of [-1,1])for(let i=0;i<P.length/2-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);if(L<.05)continue;const nx=-(bz-az)/L*s,nz=(bx-ax)/L*s,o=hw+1;const x0=ax+nx*o,z0=az+nz*o,x1=bx+nx*o,z1=bz+nz*o;const h0=H(x0,z0),h1=H(x1,z1),y0=clamp(RIBYC[i]+.05,h0,h0+.35)+.03,y1=clamp(RIBYC[i+1]+.05,h1,h1+.35)+.03,g0=H(x0+nx*3,z0+nz*3)-.4,g1=H(x1+nx*3,z1+nz*3)-.4;if(y0-g0<.3&&y1-g1<.3)continue;const v=TALUD.p.length/3;TALUD.p.push(x0,y0,z0,x1,y1,z1,x1+nx*3,g1,z1+nz*3,x0+nx*3,g0,z0+nz*3);TALUD.i.push(v,v+1,v+2,v,v+2,v+3)}RIBYC=null}
    else if(cls===5){ribbon(asph,P,hw,0,6,6,true)}
    else if(cls===6)ribbon(prom,P,hw,0,3,3,true);else if(cls===7)ribbon(walk,P,hw,0,2,2,true);else if(cls===9)ribbon(pier,P,hw,0,4,4,true);
    if(r[4]!==2&&cls!==0&&((cls<=3&&!ow)||(cls<=2&&ow&&wpx>=56)||(cls===4&&!ow&&hw>2.9))){const jA=(nodes.get(r[5]+','+r[6])||0)>1,jB=(nodes.get(r[r.length-2]+','+r[r.length-1])||0)>1,PD=trimP(P,jA?hw+6:0,jB?hw+6:0);if(PD){const keep=RIBYC;if(keep){let s0=0;for(let q=0;q<P.length/2;q++)if(P[q*2]===PD[0]&&P[q*2+1]===PD[1]){s0=q;break}RIBYC=keep.slice(s0,s0+PD.length/2)}ribbon(dash,PD,.075,0,.15,6,false);RIBYC=keep}}
    RIBYC=null;
    if(cls>=2&&cls<=4&&hw>2)for(const end of [0,1]){const i0=end?r.length-2:5,k=r[i0]+','+r[i0+1];if((nodes.get(k)||0)<2)continue;
      const n=P.length/2;let ax=end?P[n*2-2]:P[0],az=end?P[n*2-1]:P[1];let bx=ax,bz=az,acc=0;for(let s=1;s<n&&acc<12;s++){const ix=end?n-1-s:s;const nx=P[ix*2],nz=P[ix*2+1];acc+=Math.hypot(nx-bx,nz-bz);bx=nx;bz=nz}
      const L=Math.hypot(bx-ax,bz-az);if(L<10)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;{// el paso de cebra solo en tramos finales rectos y fuera de otras calzadas
        const qx=end?P[n*2-4]:P[2],qz=end?P[n*2-3]:P[3],ql=Math.hypot(qx-ax,qz-az)||1;if(((qx-ax)*dx+(qz-az)*dz)/ql<.95)continue;const zx=ax+dx*8,zz=az+dz*8;let hit=false;for(const rp of roadsNear(zx,zz)){if(rp.P===P||rp.cls>5)continue;if(distToRoad(rp,zx,zz)<rp.hw+.5){hit=true;break}}if(hit)continue}ribbon(zeb,[ax+dx*6.5,az+dz*6.5,ax+dx*9.5,az+dz*9.5],hw-.2,0,1,3,false);
      if(!ow)ribbon(stop,[ax+dx*10,az+dz*10,ax+dx*10.4,az+dz*10.4],hw/2-.1,hw/2,1,1,false)}}
  RIBYC=null;
  /* aceras: se recortan donde pisarían la calzada de otra calle (cruces a mitad de manzana, curvas cerradas) */
  /* altura de la superficie igual que en rbMesh: así bordillo, acera y calzada casan al centímetro */
  const surfY=(x,z,yc,y)=>{const h=H(x,z)+y;return yc===null||yc===undefined||yc!==yc?h:clamp(yc+y+.05,h,h+.35)};
  /* acera de ancho variable: del bordillo hasta la fachada (si hay edificio a menos de 7 m), 3 m si no;
     fuera del casco urbano (sin edificios a 30 m) no hay acera */
  const inB=(x,z)=>{const l=GBL[Math.floor(z/GC)*GWc+Math.floor(x/GC)];if(!l)return false;for(const b of l){if(b.kind===6||x<b.x0||x>b.x1||z<b.z0||z>b.z1)continue;if(pipf(x,z,b.p))return true}return false};
  const urban=(x,z)=>{const gx=Math.floor(x/GC),gz=Math.floor(z/GC),R=Math.ceil(30/GC);for(let a=-R;a<=R;a++)for(let c=-R;c<=R;c++){const l=GBL[(gz+a)*GWc+gx+c];if(!l)continue;for(const b of l)if(b.kind!==6&&x>b.x0-30&&x<b.x1+30&&z>b.z0-30&&z<b.z1+30)return true}return false};
  const offRoad=(q,x,z,m)=>{for(const rp of roadsNear(x,z)){if(rp===q.rp||rp.cls>5||rp.st)continue;if(distToRoad(rp,x,z)<rp.hw+m)return false}return true};
  let wkN=0;
  for(const q of WALKQ){const P=q.PW,n=P.length/2;const T=[];for(let i=0;i<n;i++){const i0=Math.max(0,i-1),i1=Math.min(n-1,i+1);let tx=P[i1*2]-P[i0*2],tz=P[i1*2+1]-P[i0*2+1];const L=Math.hypot(tx,tz)||1;T.push(-tz/L,tx/L)}
    for(const sd of [1,-1]){let run=[],ry=[],rw=[];
      // anchura en cada vértice
      const W=new Array(n).fill(0);for(let i=0;i<n;i++){const nx=T[i*2]*sd,nz=T[i*2+1]*sd,ex=P[i*2]+nx*q.hw,ez=P[i*2+1]+nz*q.hw;
        if(!urban(ex,ez)){W[i]=0;continue}let w=3;for(let t=.6;t<=7;t+=.4){const x=ex+nx*t,z=ez+nz*t;if(inB(x,z)){w=Math.max(1.2,t-.35);break}if(t>=1.2&&!offRoad(q,x,z,.2)){w=Math.max(1.2,t-.5);break}if(t>3&&w===3&&t>3.2)break}
        // si no hay fachada a menos de 7 m se deja en 3 m, pero se mira si la fachada está justo detrás (para no dejar una franja de tierra de 1-2 m)
        if(w===3){for(let t=3.4;t<=7;t+=.4){const x=ex+nx*t,z=ez+nz*t;if(inB(x,z)){w=t-.35;break}if(!offRoad(q,x,z,.2))break}}
        W[i]=w}
      // suavizado: mínimo local de 3 (evita picos en los callejones) y media
      const W2=W.map((v,i)=>v===0?0:Math.min(v,W[i-1]||v,W[i+1]||v));for(let i=1;i<n-1;i++)if(W2[i]&&W2[i-1]&&W2[i+1])W[i]=(W2[i-1]+W2[i]*2+W2[i+1])/4;else W[i]=W2[i];
      const flush=()=>{if(run.length>=4){const m=run.length/2,b=walk.p.length/3;if(!walk.yc)walk.yc=new Array(b).fill(NaN);while(walk.yc.length<b)walk.yc.push(NaN);let acc=0;
          for(let k=0;k<m;k++){const x=run[k*2],z=run[k*2+1];if(k)acc+=Math.hypot(x-run[k*2-2],z-run[k*2-1]);const i0=Math.max(0,k-1),i1=Math.min(m-1,k+1);let tx=run[i1*2]-run[i0*2],tz=run[i1*2+1]-run[i0*2+1];const L=Math.hypot(tx,tz)||1;const nx=-tz/L*sd,nz=tx/L*sd;
            const a=q.hw,c=q.hw+rw[k];const yc=q.yc?ry[k]:NaN;const v0=sd>0?c:a,v1=sd>0?a:c;
            walk.p.push(x+nx*v0,0,z+nz*v0,x+nx*v1,0,z+nz*v1);walk.u.push(v0*sd/2,acc/2,v1*sd/2,acc/2);walk.yc.push(yc,yc);if(k){const t=b+(k-1)*2;walk.i.push(t,t+1,t+2,t+1,t+3,t+2)}
            // canto exterior de la acera (escalón hacia el solar o la tierra)
            if(k){const px=run[k*2-2],pz=run[k*2-1];const pk=k-1,pi0=Math.max(0,pk-1),pi1=Math.min(m-1,pk+1);let ux=run[pi1*2]-run[pi0*2],uz=run[pi1*2+1]-run[pi0*2+1];const Lu=Math.hypot(ux,uz)||1;const qnx=-uz/Lu*sd,qnz=ux/Lu*sd;
              const x0=px+qnx*(q.hw+rw[pk]),z0=pz+qnz*(q.hw+rw[pk]),x1=x+nx*c,z1=z+nz*c;const dc=v=>v>5e3?v-1e4:v,ya=q.yc?dc(ry[pk]):null,yb=q.yc?dc(ry[k]):null;const vv=curbs.p.length/3;
              curbs.p.push(x0,H(x0,z0)-.08,z0,x1,H(x1,z1)-.08,z1,x1,surfY(x1,z1,yb,.17)+.004,z1,x0,surfY(x0,z0,ya,.17)+.004,z0);curbs.i.push(vv,vv+1,vv+2,vv,vv+2,vv+3)}}
          wkN+=m;
          // bordillo: solo donde hay acera, desde el borde de la calzada hasta el nivel de la acera
          for(let k=0;k<run.length/2-1;k++){const ax=run[k*2],az=run[k*2+1],bx=run[k*2+2],bz=run[k*2+3],L=Math.hypot(bx-ax,bz-az);if(L<.05)continue;const nx=-(bz-az)/L,nz=(bx-ax)/L,off=sd*(q.hw+.02);
            const x0=ax+nx*off,z0=az+nz*off,x1=bx+nx*off,z1=bz+nz*off;const ya=q.yc?(ry[k]>5e3?ry[k]-1e4:ry[k]):null,yb=q.yc?(ry[k+1]>5e3?ry[k+1]-1e4:ry[k+1]):null;
            const v=curbs.p.length/3;curbs.p.push(x0,surfY(x0,z0,ya,.05)-.06,z0,x1,surfY(x1,z1,yb,.05)-.06,z1,x1,surfY(x1,z1,yb,.17)+.005,z1,x0,surfY(x0,z0,ya,.17)+.005,z0);curbs.i.push(v,v+1,v+2,v,v+2,v+3)}}run=[];ry=[];rw=[]};
      for(let i=0;i<n;i++){if(!W[i]){flush();continue}const x=P[i*2]+T[i*2]*sd*(q.hw+.9),z=P[i*2+1]+T[i*2+1]*sd*(q.hw+.9);
        if(!offRoad(q,x,z,.4))flush();else{run.push(P[i*2],P[i*2+1]);rw.push(W[i]);if(q.yc)ry.push(q.yc[i])}}flush()}}
  // esquinas: un disco de acera en cada cruce urbano; la calzada se pinta encima, así solo quedan las esquinas pavimentadas
  {const J=new Map();for(const r of WD.roads){if(r[0]<1||r[0]>4||r[4])continue;const hw=r[1]*K/2;for(let i=5;i<r.length;i+=2){const k=r[i]+','+r[i+1];if((nodes.get(k)||0)<2)continue;const o=J.get(k);if(!o)J.set(k,{x:r[i]*K,z:r[i+1]*K,hw,n:1});else{o.hw=Math.max(o.hw,hw);o.n++}}}
    let nj=0;for(const j of J.values()){if(j.n<2||!urban(j.x,j.z))continue;const b=walk.p.length/3;disc(walk,j.x,j.z,j.hw+3.2,2);while(walk.yc.length<walk.p.length/3)walk.yc.push(NaN);nj++}
    console.log('env aceras',wkN,'esquinas',nj)}
  rbMesh(shoulder,roadMat({color:0x8d8a84}),.03,1);const RP=roadPBR();rbMesh(walk,RP?RP.walk:roadMat({map:TX.walk}),.17,1);rbMesh(prom,RP?RP.prom:roadMat({map:TX.prom}),.06,1);rbMesh(pier,roadMat({map:TX.pier}),.25,1,.65);
  rbMesh(asph,RP?RP.asph:roadMat({map:TX.asph}),.05,3);rbMesh(dash,roadMat({map:TX.dash,transparent:true,alphaTest:.5}),.06,4);rbMesh(line,roadMat({map:TX.solid}),.06,4);
  rbMesh(zeb,roadMat({map:TX.zebra,transparent:true,alphaTest:.5,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),.11,8);rbMesh(stop,roadMat({map:TX.solid,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),.11,8);
  if(curbs.i.length)chunkMesh(curbs.p,null,curbs.i,new THREE.MeshLambertMaterial({color:0xcfccc4,side:THREE.DoubleSide}),0);
  if(TALUD.i.length)chunkMesh(TALUD.p,null,TALUD.i,new THREE.MeshLambertMaterial({color:0xa89a7c,side:THREE.DoubleSide}),0);
  console.log('env medians',buildMedians());buildRoundabouts();console.log('env struct',JSON.stringify(buildStructures()))}
/* glorietas: isla central con césped, bordillo y palmeras */
function buildRoundabouts(){const segs=WD.roads.filter(r=>r[4]===2&&r[0]<=5);const par=segs.map((_,i)=>i),f=i=>par[i]===i?i:(par[i]=f(par[i]));const ends=new Map();
  segs.forEach((r,i)=>{for(const idx of [5,r.length-2]){const k=r[idx]+','+r[idx+1];if(ends.has(k))par[f(i)]=f(ends.get(k));else ends.set(k,i)}});
  const groups=new Map();segs.forEach((r,i)=>{const g=f(i);(groups.get(g)||groups.set(g,[]).get(g)).push(r)});
  const G=GB(),col=new THREE.Color('#ffffff'),palms=[];
  for(const rs of groups.values()){const pts=[];let w=0;for(const r of rs){w=Math.max(w,r[1]*K);for(let i=5;i<r.length;i+=2)pts.push([r[i]*K,r[i+1]*K])}if(pts.length<6)continue;
    let cx=0,cz=0;for(const p of pts){cx+=p[0];cz+=p[1]}cx/=pts.length;cz/=pts.length;let R=0;for(const p of pts)R+=Math.hypot(p[0]-cx,p[1]-cz);R/=pts.length;
    let dev=0,rmin=1e9;for(const p of pts){const d=Math.hypot(p[0]-cx,p[1]-cz);dev=Math.max(dev,Math.abs(d-R));rmin=Math.min(rmin,d)}if(dev>R*.2||R<6)continue;
    const ri=rmin-w/2-.9;if(ri<2)continue;ISLANDS.push([cx,cz,ri]);const hc=H(cx,cz);
    const N=28,ring=[];for(let k=0;k<N;k++){const a=k/N*TAU;ring.push([cx+Math.cos(a)*ri,cz+Math.sin(a)*ri])}
    const top=hc+.28;const v0=G.p.length/3,A=cellUV(CELL.PLAIN);
    G.p.push(cx,top,cz);G.n.push(0,1,0);G.c.push(.42,.62,.3);G.u.push(0,0);G.a.push(A[0],A[1],A[2],A[3]);
    for(const p of ring){G.p.push(p[0],top,p[1]);G.n.push(0,1,0);G.c.push(.42,.62,.3);G.u.push(0,0);G.a.push(A[0],A[1],A[2],A[3])}
    for(let k=0;k<N;k++)G.i.push(v0,v0+1+k,v0+1+(k+1)%N);
    for(let k=0;k<N;k++){const a=ring[k],b=ring[(k+1)%N];quad(G,[a[0],H(a[0],a[1])-.2,a[1],b[0],H(b[0],b[1])-.2,b[1],b[0],top,b[1],a[0],top,a[1]],(a[0]+b[0])/2-cx,0,(a[1]+b[1])/2-cz,col,[0,0,1,0,1,.15,0,.15],CELL.PLAIN,false)}
    const np=ri>7?5:ri>4?3:1;for(let k=0;k<np;k++){const a=k/np*TAU+.4,d=np>1?ri*.45:0;palms.push([cx+Math.cos(a)*d,top,cz+Math.sin(a)*d,Math.random()*TAU,1+Math.random()*.25])}}
  if(G.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.c,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(G.u,2));g.setAttribute('atl',new THREE.Float32BufferAttribute(G.a,4));g.setIndex(G.i);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,atlasMat(TX.atlas,renderer.capabilities.isWebGL2));m.receiveShadow=HQ;scene.add(m)}
  window.__islandPalms=palms}
function islandBlocked(x,z,r){for(const s of ISLANDS){const d=Math.hypot(x-s[0],z-s[1]);if(d<s[2]+r)return true}return false}

/* ============ EDIFICIOS SOBRE LA CUESTA ============ */
const TINT=['#f3e6cc','#ecd4ac','#eab99b','#ddb07f','#f6f0e4','#ffffff','#e9cdb2','#f0dcb8','#dfc8a5','#f2d6c2','#e8c08f','#f7ead2','#e4b08e','#fbf6ec'];
const TINT_HOUSE=['#ffffff','#fdfbf5','#f8f1e2','#f3e3c6','#efd6b8','#f5e3d0','#ffffff','#fbf3e3','#e9e3da'];
function GB(){return{p:[],n:[],c:[],u:[],a:[],i:[]}}
function cellUV(ci){return[(ci%4)/4,1-(Math.floor(ci/4)+1)/4,.25,.25]}
function quad(G,P4,nx,ny,nz,col,uv4,ci,ao){const L=Math.hypot(nx,ny,nz)||1;nx/=L;ny/=L;nz/=L;const v=G.p.length/3,A=cellUV(ci);for(let k=0;k<4;k++){G.p.push(P4[k*3],P4[k*3+1],P4[k*3+2]);G.n.push(nx,ny,nz);const d=ao&&k<2?.78:1;G.c.push(col.r*d,col.g*d,col.b*d);G.u.push(uv4[k*2],uv4[k*2+1]);G.a.push(A[0],A[1],A[2],A[3])}G.i.push(v,v+1,v+2,v,v+2,v+3)}
function wall(G,a,c,y0,y1,u0,u1,v0,v1,ci,col,sg,ao){const L=Math.hypot(c[0]-a[0],c[1]-a[1]);const nx=sg*(c[1]-a[1])/L,nz=-sg*(c[0]-a[0])/L;quad(G,[a[0],y0,a[1],c[0],y0,c[1],c[0],y1,c[1],a[0],y1,a[1]],nx,0,nz,col,[u0,v0,u1,v0,u1,v1,u0,v1],ci,ao)}
function polyRoof(G,pts,y,ci,col){let tris=null;try{tris=THREE.ShapeUtils.triangulateShape(pts.map(p=>new THREE.Vector2(p[0],p[1])),[])}catch(e){}if(!tris||!tris.length)return;
  const v=G.p.length/3,A=cellUV(ci);for(const p of pts){G.p.push(p[0],y,p[1]);G.n.push(0,1,0);G.c.push(col.r,col.g,col.b);G.u.push(p[0]/4,p[1]/4);G.a.push(A[0],A[1],A[2],A[3])}for(const t of tris)G.i.push(v+t[0],v+t[1],v+t[2])}
function tri(G,a,b,c,ci,col){const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];let nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;const L=Math.hypot(nx,ny,nz)||1;if(ny<0){nx=-nx;ny=-ny;nz=-nz}
  const v=G.p.length/3,A=cellUV(ci);for(const p of [a,b,c]){G.p.push(p[0],p[1],p[2]);G.n.push(nx/L,ny/L,nz/L);G.c.push(col.r,col.g,col.b);G.u.push(p[0]/3,p[2]/3+p[1]/3);G.a.push(A[0],A[1],A[2],A[3])}G.i.push(v,v+1,v+2)}
function hipRoof(G,pts,h,col){let best=0,ux=1,uz=0;for(let i=0;i<4;i++){const a=pts[i],b=pts[(i+1)%4],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>best){best=L;ux=(b[0]-a[0])/L;uz=(b[1]-a[1])/L}}
  const vx=-uz,vz=ux;let cx=0,cz=0;for(const p of pts){cx+=p[0]/4;cz+=p[1]/4}let u0=1e9,u1=-1e9,v0=1e9,v1=-1e9;for(const p of pts){const u=(p[0]-cx)*ux+(p[1]-cz)*uz,v=(p[0]-cx)*vx+(p[1]-cz)*vz;u0=Math.min(u0,u);u1=Math.max(u1,u);v0=Math.min(v0,v);v1=Math.max(v1,v)}
  const hwid=(v1-v0)/2,mv=(v0+v1)/2,mu=(u0+u1)/2,half=Math.max(0,(u1-u0)/2-hwid),rise=Math.min(hwid*.55,3.2);
  const R1=[cx+ux*(mu-half)+vx*mv,h+rise,cz+uz*(mu-half)+vz*mv],R2=[cx+ux*(mu+half)+vx*mv,h+rise,cz+uz*(mu+half)+vz*mv];
  const E=pts.map(p=>{const dx=p[0]-cx,dz=p[1]-cz,L=Math.hypot(dx,dz)||1;return[p[0]+dx/L*.35,h-.12,p[1]+dz/L*.35]});const nearR=p=>((p[0]-cx)*ux+(p[2]-cz)*uz)<mu?R1:R2;
  for(let i=0;i<4;i++){const a=E[i],b=E[(i+1)%4],ra=nearR(a),rb=nearR(b);if(ra===rb)tri(G,a,b,ra,CELL.TEJA,col);else{tri(G,a,b,rb,CELL.TEJA,col);tri(G,a,rb,ra,CELL.TEJA,col)}}}
const FACX=[];const ROOFDET={tank:[],ac:[],cas:[],casC:[],solar:[],posts:[]};
function interiorPoint(b,R,m){for(let k=0;k<8;k++){const x=b.x0+m+R()*(b.x1-b.x0-2*m),z=b.z0+m+R()*(b.z1-b.z0-2*m);if(!pipf(x,z,b.p))continue;let ok=true;const p=b.p;for(let i=0,j=p.length-2;i<p.length;j=i,i+=2)if(distSeg(x,z,p[j],p[j+1],p[i],p[i+1])<m){ok=false;break}if(ok)return[x,z]}return null}
function seaNear(x,z,r){for(let a=0;a<8;a++)if(isSea(x+Math.cos(a*.785)*r,z+Math.sin(a*.785)*r))return true;return false}
function buildBuildings(webgl2){
  const CH=256,CW=Math.ceil(WM/CH),map=new Map();const getG=b=>{const k=clamp(Math.floor((b.z0+b.z1)/2/CH),0,99)*CW+clamp(Math.floor((b.x0+b.x1)/2/CH),0,CW-1);let g=map.get(k);if(!g){g=GB();map.set(k,g)}return g};
  const col=new THREE.Color(),stone=new THREE.Color('#d8cdb8');
  // alturas de todos los edificios antes de levantar paredes: hace falta saber cuánto tapa el vecino
  for(const b of BL){let hx=-1e9,hn=1e9;for(let i=0;i<b.p.length;i+=2){const y=H(b.p[i],b.p[i+1]);if(y>hx)hx=y;if(y<hn)hn=y}b._B=Math.max(hn,hx-2.2);
    // edificios del muelle: la planta baja a la cota del muelle aunque por detrás se metan en la ladera (como los reales, adosados al cerro)
    if(PMASK&&hn<=PDECK+.05&&portBld((b.x0+b.x1)/2,(b.z0+b.z1)/2))b._B=PDECK;b._top=b._B+b.h}
  /* tramos de pared compartidos con el edificio de al lado (medianeras): no se dibujan hasta la altura del vecino.
     Dos caras en el mismo plano se pelean por pintarse y eso daba los parpadeos de textura y de sombra */
  let onx=0,onz=0;const cover=(b,a,c)=>{const L=Math.hypot(c[0]-a[0],c[1]-a[1]),dx=(c[0]-a[0])/L,dz=(c[1]-a[1])/L,out=[];const gx0=clamp(Math.floor((Math.min(a[0],c[0])-1)/GC),0,GWc-1),gx1=clamp(Math.floor((Math.max(a[0],c[0])+1)/GC),0,GWc-1),gz0=clamp(Math.floor((Math.min(a[1],c[1])-1)/GC),0,GHc-1),gz1=clamp(Math.floor((Math.max(a[1],c[1])+1)/GC),0,GHc-1);const seen=new Set();
    for(let gz=gz0;gz<=gz1;gz++)for(let gx=gx0;gx<=gx1;gx++){const l=GBL[gz*GWc+gx];if(!l)continue;for(const N of l){if(N===b||seen.has(N)||N.kind===6)continue;seen.add(N);const q=N.p,n=q.length/2;
      for(let i=0;i<n;i++){const px=q[i*2],pz=q[i*2+1],j=(i+1)%n,qx=q[j*2],qz=q[j*2+1];const d1=Math.abs((px-a[0])*dz-(pz-a[1])*dx),d2=Math.abs((qx-a[0])*dz-(qz-a[1])*dx);if(d1>.35||d2>.35)continue;
        const t1=((px-a[0])*dx+(pz-a[1])*dz)/L,t2=((qx-a[0])*dx+(qz-a[1])*dz)/L,lo=Math.max(0,Math.min(t1,t2)),hi=Math.min(1,Math.max(t1,t2));if((hi-lo)*L>.3){const tm=(lo+hi)/2,mx=a[0]+(c[0]-a[0])*tm+onx*.35,mz=a[1]+(c[1]-a[1])*tm+onz*.35;if(ptIn(N.p,mx,mz))out.push([lo,hi,N._top]);
          // pared que coincide con la de otro edificio solapado (las dos miran hacia fuera): solo se pinta una
          else if(ptIn(N.p,mx-onx*.7,mz-onz*.7)&&(N._top>b._top+.05||(Math.abs(N._top-b._top)<=.05&&N.idx<b.idx)))out.push([lo,hi,N._top])}}}}return out};
  const ptIn=(p,x,z)=>{let c=false;const n=p.length/2;for(let i=0,j=n-1;i<n;j=i++){const ax=p[i*2],az=p[i*2+1],bx=p[j*2],bz=p[j*2+1];if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)c=!c}return c};
  let shared=0;
  for(const b of BL){const G=getG(b);const n=b.p.length/2;const pts=[];for(let i=0;i<n;i++){const x=b.p[i*2],z=b.p[i*2+1],q=pts[pts.length-1];if(!q||Math.hypot(q[0]-x,q[1]-z)>.05)pts.push([x,z])}
    if(pts.length>2&&Math.hypot(pts[0][0]-pts[pts.length-1][0],pts[0][1]-pts[pts.length-1][1])<.05)pts.pop();if(pts.length<3)continue;
    let ar=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)ar+=pts[j][0]*pts[i][1]-pts[i][0]*pts[j][1];const sg=ar>0?1:-1;
    const gh_=pts.map(p=>H(p[0],p[1]));let hmax=-1e9,hmin=1e9;for(const q of gh_){hmax=Math.max(hmax,q);hmin=Math.min(hmin,q)}b.hb=hmax;b.hmin=hmin;
    const R=lcg(b.seed),kind=b.kind,cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,B=b._B,top=B+b.h;b.top=top;b.hb=B;
    if(kind===6){col.set('#e8e2d6');polyRoof(G,pts,B+2.75,CELL.PLAIN,col);polyRoof(G,pts,B+2.6,CELL.PLAIN,col);for(let i=0;i<Math.min(pts.length,8);i++)ROOFDET.posts.push([pts[i][0],gh_[i]+1.3,pts[i][1]]);continue}
    b.inv=kind===2&&b.area>1200;// invernadero (Catastro): plástico blanco, no un bloque marrón
    // bajos comerciales que el Catastro clasifica como industriales (fila de bares y tiendas): fachada de locales, no de nave
    b.comm=kind===3&&b.area<1800&&b.lv<=2;
    /* estilo según la ficha del Catastro: uso (vivienda, comercio, oficinas, equipamiento), año de construcción y nº de viviendas */
    const Y=b.year||1990,office=b.use===41,retail=b.use===42,pub=b.use===43;if(retail&&kind===3&&b.lv<=3)b.comm=true;
    const PS=pubStyle(b);if(PS){b.comm=false}
    const house=!PS&&((kind===0&&b.lv<=3&&b.area<500)||(b.use===1&&b.dw===1&&b.lv<=2&&b.area<900)),ind=kind===3&&!b.comm&&!retail&&!office&&!pub&&!(PS&&b.pubT!=="sports"),beach=!house&&!ind&&b.lv>=3&&seaNear(cx,cz,90);
    // paleta por época: años 60-70 cal y ocres; 80-90 ocres, salmón y ladrillo; 2000 en adelante blanco y gris claro
    const TOLD=['#f6f1e4','#efe2c4','#e8d3a8','#f1e6cf','#e6c79c'],TMID=['#f3e6cc','#ecd4ac','#eab99b','#ddb07f','#e9cdb2','#f0dcb8','#e4b08e','#f2d6c2'],TNEW=['#ffffff','#f7f6f2','#eceae5','#f4efe6','#e3e1dc'];
    const pal=Y<1980?TOLD:Y<2000?TMID:TNEW;
    const tint=new THREE.Color(PS?PS.tint:b.inv?'#f2f4f3':ind?'#e4e6e7':portBld(cx,cz)?'#f8f7f3':pub?['#f1e3c4','#e9d1a5','#f4ead7'][Math.floor(R()*3)]:office?'#e6e9ec':house?(Y<1990?TINT_HOUSE[Math.floor(R()*TINT_HOUSE.length)]:TNEW[Math.floor(R()*TNEW.length)]):pal[Math.floor(R()*pal.length)]);
    const up=PS?CELL[PS.up]:ind?CELL.METAL:office?CELL.GLASS:house?CELL.HOUSEUP:pub?CELL.APT2:beach?(Y>=1995&&R()<.65?CELL.GLASS:CELL.APT):Y>=2005?(R()<.55?CELL.GLASS:CELL.APT):(Y<1985&&b.lv<=5&&R()<.3)?CELL.BRICK:Y<1980?CELL.APT2:[CELL.APT,CELL.APT,CELL.APT2,CELL.APT][Math.floor(R()*4)];
    const terr=beach||(up===CELL.APT&&R()<.45),railT=beach&&up===CELL.GLASS?1:(R()<.75?0:2);
    const shopA=R()<.5?CELL.SHOP:CELL.SHOP2,gh=kind===2?3:Math.min(3.2,b.h);b.edges=[];
    let acc=0;
    for(let i=0;i<pts.length;i++){const a=pts[i],c=pts[(i+1)%pts.length],L=Math.hypot(c[0]-a[0],c[1]-a[1]);if(L<.05)continue;const u0=acc/6,u1=(acc+L)/6;acc+=L;
      const mx=(a[0]+c[0])/2,mz=(a[1]+c[1])/2,nx=sg*(c[1]-a[1])/L,nz=-sg*(c[0]-a[0])/L,rn=roadNear(mx+nx*3,mz+nz*3,1,6,false),street=rn&&rn.d<12&&L>3;
      const E={a,c,L,nx,nz,street,u0:acc-L};b.edges.push(E);
      let gc=CELL.PLAIN;
      if(b.inv)gc=CELL.PLAIN;else if(PS)gc=street?(b.pubT==='marketplace'||b.pubT==='cinema'?CELL.SHOP2:CELL.PORTAL):CELL.APT2;else if(ind)gc=street?CELL.GARAGE:CELL.METAL;else if(kind===2)gc=street&&R()<.5?CELL.GARAGE:CELL.PLAIN;else if(house)gc=street?CELL.HOUSEDN:CELL.PLAIN;
      else if(street)gc=b.comm?(R()<.85?shopA:CELL.PORTAL):b.lv>=3&&R()<.75?shopA:(R()<.6?CELL.PORTAL:CELL.GARAGE);else gc=b.lv>=3?CELL.PLAIN:CELL.APT2;E.gc=gc;
      const ha=gh_[i],hc=gh_[(i+1)%pts.length];
      onx=nx;onz=nz;const cv=kind===6?[]:cover(b,a,c);
      // zócalo hasta el punto más bajo del terreno a lo largo de la pared (no solo en las esquinas)
      let hlow=Math.min(ha,hc);for(let s=2;s<L;s+=2){const y=H(a[0]+(c[0]-a[0])*s/L,a[1]+(c[1]-a[1])*s/L);if(y<hlow)hlow=y}
      // zócalo / muro de contención en la parte baja de la cuesta (siempre: aunque la pared sea medianera, por debajo no hay vecino que la tape)
      if(B-hlow>.05){const ix=cv.length?-nx*.04:0,iz=cv.length?-nz*.04:0,yb=hlow-.5;quad(G,[a[0]+ix,yb,a[1]+iz,c[0]+ix,yb,c[1]+iz,c[0]+ix,B,c[1]+iz,a[0]+ix,B,a[1]+iz],nx,0,nz,stone,[u0,0,u1,0,u1,(B-yb)/3,u0,(B-yb)/3],CELL.PLAIN,true)}
      if(!cv.length){
      wall(G,a,c,B,B+gh,u0,u1,0,.995,gc,tint,sg,true);
      if(b.h>gh+.1)wall(G,a,c,B+gh,top,u0,u1,0,(b.h-gh)/3,up,tint,sg,false);
      if(!house&&!ind&&kind!==2)wall(G,a,c,top,top+.9,u0,u1,0,.3,CELL.PLAIN,tint,sg,false)}
      else{shared++;E.street=false;E.shared=true;const cuts=[0,1];for(const q of cv)cuts.push(q[0],q[1]);cuts.sort((x,y)=>x-y);const par=!house&&!ind&&kind!==2;
        for(let k=0;k<cuts.length-1;k++){const t0=cuts[k],t1=cuts[k+1];if(t1-t0<1e-3)continue;const tm=(t0+t1)/2;let ch=-1e9;for(const q of cv)if(tm>=q[0]&&tm<=q[1]&&q[2]>ch)ch=q[2];
          const A=[a[0]+(c[0]-a[0])*t0,a[1]+(c[1]-a[1])*t0],C=[a[0]+(c[0]-a[0])*t1,a[1]+(c[1]-a[1])*t1],U0=u0+(u1-u0)*t0,U1=u0+(u1-u0)*t1;
          if(ch<B+.2){wall(G,A,C,B,B+gh,U0,U1,0,.995,gc,tint,sg,true);if(b.h>gh+.1)wall(G,A,C,B+gh,top,U0,U1,0,(b.h-gh)/3,up,tint,sg,false);if(par)wall(G,A,C,top,top+.9,U0,U1,0,.3,CELL.PLAIN,tint,sg,false);continue}
          const y0=ch+.02;if(y0<B+gh)wall(G,A,C,y0,B+gh,U0,U1,(y0-B)/gh*.995,.995,CELL.PLAIN,tint,sg,false);
          if(b.h>gh+.1&&y0<top){const ya=Math.max(y0,B+gh);wall(G,A,C,ya,top,U0,U1,(ya-B-gh)/3,(b.h-gh)/3,CELL.PLAIN,tint,sg,false)}
          if(par&&y0<top+.9){const ya=Math.max(y0,top);wall(G,A,C,ya,top+.9,U0,U1,0,.3,CELL.PLAIN,tint,sg,false)}}}}
    if(!ind&&kind!==2)FACX.push({b,B,gh,top,up,terr,railT,tint,house});
    // cada tejado a una cota ligeramente distinta: si dos parcelas se solapan sus tejados no se pelean (parpadeo)
    const re=.02+(b.idx%9)*.006;
    if(house&&pts.length===4&&b.area<400&&(Y<1995||R()<.35)){hipRoof(G,pts,top,col.set('#ffffff'));polyRoof(G,pts,top,CELL.PLAIN,tint)}
    else if(house){polyRoof(G,pts,top+re,R()<(Y<1990?.7:.25)?CELL.TEJA:CELL.AZOTEA,col.set('#ffffff'));for(let i=0;i<pts.length;i++){const a=pts[i],c=pts[(i+1)%pts.length];if(Math.hypot(c[0]-a[0],c[1]-a[1])>.05)wall(G,a,c,top,top+.5,0,1,0,.15,CELL.PLAIN,tint,sg,false)}}
    else if(ind)polyRoof(G,pts,top+re,CELL.GRAVEL,col.set('#d0d0cc'));
    else if(b.inv)polyRoof(G,pts,top+re,CELL.PLAIN,col.set('#eef0ee'));
    else{polyRoof(G,pts,top+re,kind===2?CELL.GRAVEL:CELL.AZOTEA,col.set('#ffffff'));
      if(b.area>60&&kind!==2){const nt=1+Math.floor(R()*Math.min(4,b.area/120));for(let k=0;k<nt;k++){const q=interiorPoint(b,R,1.2);if(q)ROOFDET.tank.push([q[0],top+.6,q[1],R()*3])}
        const na=Math.floor(R()*3);for(let k=0;k<na;k++){const q=interiorPoint(b,R,1);if(q)ROOFDET.ac.push([q[0],top+.3,q[1],R()*3])}
        if(b.lv>=3){const q=interiorPoint(b,R,2.2);if(q){ROOFDET.cas.push([q[0],top+1.1,q[1],R()*3]);ROOFDET.casC.push(tint.clone())}}}}
    if(house&&R()<.25){const q=interiorPoint(b,R,1.5);if(q&&!(pts.length===4&&b.area<400))ROOFDET.solar.push([q[0],top+.45,q[1],R()*3])}}
  console.log('env medianeras',shared);buildFacadeExtras();
  const mat=atlasMatPBR(TX.atlas,webgl2);
  for(const G of map.values()){if(!G.i.length)continue;const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(G.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(G.c,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(G.u,2));g.setAttribute('atl',new THREE.Float32BufferAttribute(G.a,4));g.setIndex(G.i);g.computeBoundingSphere();
    const m=new THREE.Mesh(g,mat);if(HQ){m.castShadow=true;m.receiveShadow=true}scene.add(m)}
  const vc=new THREE.MeshLambertMaterial({vertexColors:true});
  instanced(mergeParts([[cylG(.48,.48,1.15,8),0,0,0,0,0,0,1,1,1,'#f2f2f0'],[cylG(.12,.12,.1,5),0,.62,0,0,0,0,1,1,1,'#d8d8d8'],[boxG(1,.1,1),0,-.62,0,0,0,0,1,1,1,'#9a9a9a']]),vc,ROOFDET.tank);
  instanced(mergeParts([[boxG(.85,.55,.45),0,0,0,0,0,0,1,1,1,'#d9dcdc'],[cylG(.17,.17,.02,6),.15,0,.23,Math.PI/2,0,0,1,1,1,'#555']]),vc,ROOFDET.ac);
  instanced(mergeParts([[boxG(2.6,2.2,2.4),0,0,0,0,0,0,1,1,1,'#ffffff'],[boxG(.9,1.9,.05),0,-.15,1.21,0,0,0,1,1,1,'#7a5a3a']]),new THREE.MeshLambertMaterial({vertexColors:true}),ROOFDET.cas,ROOFDET.casC);
  instanced(mergeParts([[boxG(1.7,.05,1),0,0,0,-.5,0,0,1,1,1,'#1d3550'],[boxG(.05,.5,.05),0,-.2,-.3,0,0,0,1,1,1,'#999']]),vc,ROOFDET.solar);
  instanced(cylG(.08,.08,2.6,6),M(0xe0dbd0),ROOFDET.posts);
  // invernaderos
  const GH=GB();col.set('#f2f3f1');
  for(const a of WD.areas){if(a[0]!==5)continue;const p=dec(a,2);const pts=[];for(let i=0;i<p.length;i+=2)pts.push([p[i],p[i+1]]);if(pts.length<3)continue;
    let ar=0;for(let i=0,j=pts.length-1;i<pts.length;j=i++)ar+=pts[j][0]*pts[i][1]-pts[i][0]*pts[j][1];const sg=ar>0?1:-1;let acc=0,hm=-1e9;for(const q of pts)hm=Math.max(hm,H(q[0],q[1]));
    for(let i=0;i<pts.length;i++){const A=pts[i],C=pts[(i+1)%pts.length],L=Math.hypot(C[0]-A[0],C[1]-A[1]);if(L<.05)continue;const ha=H(A[0],A[1]),hc=H(C[0],C[1]);
      quad(GH,[A[0],ha-.3,A[1],C[0],hc-.3,C[1],C[0],hm+3.4,C[1],A[0],hm+3.4,A[1]],sg*(C[1]-A[1]),0,-sg*(C[0]-A[0]),col,[acc/6,0,(acc+L)/6,0,(acc+L)/6,1.1,acc/6,1.1],CELL.PLAIN,false);acc+=L}
    polyRoof(GH,pts,hm+3.4,CELL.PLAIN,col)}
  if(GH.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(GH.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(GH.n,3));g.setAttribute('color',new THREE.Float32BufferAttribute(GH.c,3));
    g.setAttribute('uv',new THREE.Float32BufferAttribute(GH.u,2));g.setAttribute('atl',new THREE.Float32BufferAttribute(GH.a,4));g.setIndex(GH.i);g.computeBoundingSphere();const gm=atlasMat(TX.atlas,webgl2);gm.transparent=true;gm.opacity=.85;scene.add(new THREE.Mesh(g,gm))}}

/* ============ RÓTULOS DE NEGOCIOS REALES (OpenStreetMap) ============ */
const SIGNCOL={restaurant:['#7a1f1f','#fff3d6'],cafe:['#3b2416','#f7e2c4'],bar:['#1d1d1d','#ffcf5a'],ice_cream:['#f9d2e3','#a0225c'],fuel:['#0b5a2c','#ffffff'],supermarket:['#0f5aa6','#ffffff'],bank:['#123a6b','#ffffff'],pharmacy:['#1d8a3c','#ffffff'],hotel:['#20314f','#e7c873'],fast_food:['#b71c1c','#ffd54f'],dentist:['#ffffff','#0b6fa4'],clinic:['#ffffff','#127a3a'],doctors:['#ffffff','#127a3a'],veterinary:['#ffffff','#2e7d32'],bakery:['#6d3b14','#ffe0b2'],butcher:['#8e1b1b','#ffffff'],optician:['#ffffff','#263238'],clothes:['#111111','#ffffff'],cinema:['#1a1a2e','#ffcc00'],post_office:['#ffcc00','#003f87'],gambling:['#4a148c','#ffd54f'],lottery:['#ffffff','#c62828'],insurance:['#c62828','#ffffff'],estate_agent:['#ffffff','#e53935'],mobile_phone:['#e30613','#ffffff'],telecommunication:['#019df4','#ffffff'],marketplace:['#f1e3c6','#5b3a1a'],library:['#f4efe6','#2b3a55']};
/* colores de marca reales (solo el nombre en sus colores corporativos; sin logotipos) */
const BRANDCOL={'mercadona':['#0d7a3c','#ffffff'],'lidl':['#0050aa','#fff000'],'dia':['#e30613','#ffffff'],'carrefour':['#ffffff','#004e9f'],'consum':['#f57c00','#ffffff'],'supercor':['#00883b','#ffffff'],'bbva':['#004481','#ffffff'],'caixabank':['#007eae','#ffffff'],'unicaja banco':['#00953b','#ffffff'],'cajamar':['#00a19a','#ffffff'],"mcdonald's":['#da291c','#ffc72c'],'burger king':['#d62300','#ffaa00'],'correos':['#ffcc00','#002d72'],'kiabi':['#5c2d91','#ffffff'],'jysk':['#143c8c','#ffffff'],'rossmann':['#c8102e','#ffffff'],'obramat':['#ffd100','#1a1a1a'],'repsol':['#ff8200','#ffffff'],'bp':['#007f00','#ffe600'],'moeve':['#00a19b','#ffffff'],'phonehouse':['#e2001a','#ffffff'],'tecnocasa':['#ffffff','#e2001a'],'mapfre':['#d81e05','#ffffff'],'orenes':['#2d1457','#ffd54f']};

function signTex(txt,kind){const W=1024,Hh=192,c=cvs(W,Hh),g=c.getContext('2d');const k=BRANDCOL[String(txt).toLowerCase()]||SIGNCOL[kind]||['#f5f2ea','#1c2a3a'];
  const gr=g.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,k[0]);gr.addColorStop(.5,k[0]);gr.addColorStop(1,'rgba(0,0,0,.35)');g.fillStyle=k[0];g.fillRect(0,0,W,Hh);g.fillStyle=gr;g.fillRect(0,0,W,Hh);
  g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,0,W,10);g.strokeStyle='#2a2a2a';g.lineWidth=10;g.strokeRect(5,5,W-10,Hh-10);g.strokeStyle='rgba(255,255,255,.4)';g.lineWidth=3;g.strokeRect(16,16,W-32,Hh-32);
  const ic=kind==='pharmacy'?150:0;let fs=118;const F=s=>`900 ${s}px "Arial Black",system-ui,Arial`;g.font=F(fs);while(g.measureText(txt).width>W-70-ic&&fs>30){fs-=3;g.font=F(fs)}
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(0,0,0,.45)';g.fillText(txt,W/2+ic/2+4,Hh/2+7);g.fillStyle=k[1];g.fillText(txt,W/2+ic/2,Hh/2+3);
  if(kind==='pharmacy'){g.fillStyle='#22e35a';g.fillRect(40,70,110,40);g.fillRect(75,35,40,110)}const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
/* material de rótulo retroiluminado (se lee de día y brilla de noche) */
function signMat(tex){return new THREE.MeshLambertMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:.42})}
const SHOPS=[],SBACK=[];
function shopTex(){if(TX.shopf)return TX.shopf;const W=256,Hh=256,c=cvs(W,Hh),g=c.getContext('2d');g.fillStyle='#3a3d40';g.fillRect(0,0,W,Hh);
  const gr=g.createLinearGradient(0,30,0,Hh);gr.addColorStop(0,'#fff1d2');gr.addColorStop(.55,'#e9c992');gr.addColorStop(1,'#8a6a45');g.fillStyle=gr;g.fillRect(10,14,W-20,Hh-14);
  g.fillStyle='rgba(60,40,25,.55)';for(let i=0;i<5;i++)g.fillRect(24+i*44,150+(i%2)*14,30,Hh-160);g.fillStyle='rgba(255,255,255,.75)';g.fillRect(18,96,W-36,5);g.fillRect(18,140,W-36,5);
  g.fillStyle='rgba(30,30,35,.85)';g.fillRect(W*.62,40,W*.3,Hh-40);g.fillStyle='rgba(255,236,200,.85)';g.fillRect(W*.65,52,W*.24,Hh-56);g.fillStyle='#bbb';g.fillRect(W*.66,150,8,30);
  g.strokeStyle='#26282a';g.lineWidth=8;g.strokeRect(10,14,W-20,Hh-14);g.beginPath();g.moveTo(W*.62,14);g.lineTo(W*.62,Hh);g.stroke();
  const lg=g.createLinearGradient(0,0,W,Hh);lg.addColorStop(0,'rgba(255,255,255,.35)');lg.addColorStop(.35,'rgba(255,255,255,0)');lg.addColorStop(.6,'rgba(255,255,255,.12)');lg.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=lg;g.fillRect(10,14,W-20,Hh-14);
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.anisotropy=4;return TX.shopf=t}
/* escaparate iluminado bajo cada rótulo + caja del rótulo */
function addShopfront(e,b,t,w,hgt){const ux=(e.c[0]-e.a[0])/e.L,uz=(e.c[1]-e.a[1])/e.L,x=e.a[0]+ux*t+e.nx*.1,z=e.a[1]+uz*t+e.nz*.1,ry=Math.atan2(e.nx,e.nz);
  SBACK.push([e.a[0]+ux*t+e.nx*.06,b.hb+2.5+hgt/2,e.a[1]+uz*t+e.nz*.06,ry,w+.16,hgt+.16]);const sw=Math.min(w+.6,e.L-.8);if(sw>1.6)SHOPS.push([x,b.hb+1.25,z,ry,sw,2.4])}
/* terrazas de los bares: mesas, sillas y sombrillas en la acera, delante del local */
const TERR={t:[],c:[],u:[],uc:[]};const TCOL=['#f4f4f0','#1f5f9e','#c0392b','#2e7d32','#f2c14e','#3b3b3b'];
function addTerrace(e,b,t,w,kind){if(!/^(bar|cafe|restaurant|ice_cream|fast_food|pub)$/.test(kind||''))return;const ux=(e.c[0]-e.a[0])/e.L,uz=(e.c[1]-e.a[1])/e.L;const col=new THREE.Color(TCOL[(b.seed>>>3)%TCOL.length]);
  const nT=Math.max(1,Math.min(4,Math.floor(Math.min(w+2,e.L-1)/2.4)));for(let k=0;k<nT;k++){const a=t+(k-(nT-1)/2)*2.4;for(const d of [1.9,3.6]){const x=e.a[0]+ux*a+e.nx*d,z=e.a[1]+uz*a+e.nz*d;
    if(!roadFree(x,z,1)||blockedAt(x,z,.5))continue;const y=H(x,z)+.17;TERR.t.push([x,y,z,0]);for(const s of [-1,1])TERR.c.push([x+ux*.55*s,y,z+uz*.55*s,Math.atan2(-ux*s,-uz*s)]);
    if((k+(d>2?1:0))%2===0){TERR.u.push([x,y,z,0]);TERR.uc.push(col)}}}}
function buildTerraces(){if(!TERR.t.length)return 0;
  const tg=hc('tbl',()=>{const a=new THREE.CylinderGeometry(.36,.36,.03,14);a.translate(0,.74,0);const l=new THREE.CylinderGeometry(.03,.05,.74,6);l.translate(0,.37,0);const f=new THREE.CylinderGeometry(.22,.22,.02,10);f.translate(0,.01,0);return mergeG([a,l,f])});
  const cg=hc('chr',()=>{const s=new THREE.BoxGeometry(.42,.04,.42);s.translate(0,.45,0);const bk=new THREE.BoxGeometry(.42,.42,.04);bk.translate(0,.67,-.2);const ls=[];for(const[x,z]of[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]]){const l=new THREE.CylinderGeometry(.015,.015,.45,4);l.translate(x,.225,z);ls.push(l)}return mergeG([s,bk,...ls])});
  const ug=hc('umb',()=>{const c=new THREE.ConeGeometry(1.35,.5,10,1,true);c.translate(0,2.35,0);const p=new THREE.CylinderGeometry(.025,.025,2.35,6);p.translate(0,1.17,0);const bs=new THREE.CylinderGeometry(.2,.22,.08,10);bs.translate(0,.04,0);return mergeG([c,p,bs])});
  instanced(tg,M(0xd9d9d6),TERR.t);instanced(cg,M(0x5a5f66),TERR.c);instanced(ug,new THREE.MeshLambertMaterial({color:0xffffff,side:THREE.DoubleSide}),TERR.u,TERR.uc);return TERR.t.length}
function buildShopfronts(){if(SHOPS.length){const g=new THREE.PlaneGeometry(1,1);const m=new THREE.MeshLambertMaterial({map:shopTex(),emissive:0xffffff,emissiveMap:shopTex(),emissiveIntensity:.35});
    const im=new THREE.InstancedMesh(g,m,SHOPS.length),o=new THREE.Object3D();SHOPS.forEach((s,i)=>{o.position.set(s[0],s[1],s[2]);o.rotation.set(0,s[3],0);o.scale.set(s[4],s[5],1);o.updateMatrix();im.setMatrixAt(i,o.matrix)});scene.add(im)}
  if(SBACK.length){const g=new THREE.BoxGeometry(1,1,.1);const m=new THREE.MeshLambertMaterial({color:0x2b2d30});const im=new THREE.InstancedMesh(g,m,SBACK.length),o=new THREE.Object3D();
    SBACK.forEach((s,i)=>{o.position.set(s[0],s[1],s[2]);o.rotation.set(0,s[3],0);o.scale.set(s[4],s[5],1);o.updateMatrix();im.setMatrixAt(i,o.matrix)});scene.add(im)}console.log('env terrazas',buildTerraces())}
/* rótulos de negocios reales: todos en unas pocas texturas-atlas (cada una 4×21 rótulos) y una malla por atlas */
const SATL={list:[],cur:null,n:0};
function satlCell(txt,kind){if(!SATL.cur||SATL.cur.n>=84){const c=cvs(2048,2048);SATL.cur={c,g:c.getContext('2d'),n:0,q:[]};SATL.list.push(SATL.cur)}const A=SATL.cur,k=A.n++,cx=(k%4)*512,cy=Math.floor(k/4)*96;
  const t=signTex(txt,kind);A.g.drawImage(t.image,cx,cy,512,96);t.dispose();return{A,u0:cx/2048,u1:(cx+512)/2048,v0:1-(cy+96)/2048,v1:1-cy/2048}}
function satlFinish(){for(const A of SATL.list){if(!A.q.length)continue;const P=[],N=[],U=[],I=[];for(const q of A.q){const [x,y,z,ry,w,h,c]=q,cs=Math.cos(ry),sn=Math.sin(ry),ux=cs,uz=-sn,nx=Math.sin(ry),nz=Math.cos(ry),b=P.length/3;
      for(const [a,bb,uu,vv] of [[-w/2,-h/2,c.u0,c.v0],[w/2,-h/2,c.u1,c.v0],[w/2,h/2,c.u1,c.v1],[-w/2,h/2,c.u0,c.v1]]){P.push(x+ux*a,y+bb,z+uz*a);N.push(nx,0,nz);U.push(uu,vv)}I.push(b,b+1,b+2,b,b+2,b+3)}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));g.setIndex(I);
    const t=new THREE.CanvasTexture(A.c);t.encoding=THREE.sRGBEncoding;t.anisotropy=8;const m=new THREE.Mesh(g,signMat(t));m.matrixAutoUpdate=false;scene.add(m);A.c=null}SATL.list.length=0;SATL.cur=null}
/* busca en la fachada más cercana un hueco libre para el rótulo (varios negocios por fachada, sin solaparse) */
const BIGK=/^(supermarket|department_store|mall|doityourself|furniture|sports|car|garden_centre|hardware|variety_store)$/;
function placeSign(x,z,txt,kind,maxd){const gx=Math.floor(x/GC),gz=Math.floor(z/GC),C=[];
  for(let dz=-1;dz<=1;dz++)for(let dx=-1;dx<=1;dx++){const l=GBL[(gz+dz)*GWc+gx+dx];if(!l)continue;for(const b of l){if(!b.edges||b.pubT)continue;for(const e of b.edges){if(e.L<3||e.shared)continue;const d=distSeg(x,z,e.a[0],e.a[1],e.c[0],e.c[1]);if(d<(maxd||30))C.push({b,e,d:d+(e.street?0:6)})}}}
  C.sort((p,q)=>p.d-q.d);const big=BIGK.test(kind||'');
  for(const {b,e} of C){const L=e.L,ux=(e.c[0]-e.a[0])/L,uz=(e.c[1]-e.a[1])/L;const w=Math.min(L-1,big?clamp(3+txt.length*.7,7,13):clamp(1.6+txt.length*.36,3,6.5)),hgt=big?w/4.6:w/5.33;if(w<2.4)continue;
    const want=clamp((x-e.a[0])*ux+(z-e.a[1])*uz,w/2+.3,L-w/2-.3),S=e.slots||(e.slots=[]);let t=null;
    for(let k=0;k<12&&t===null;k++){for(const sg of k?[1,-1]:[1]){const c=want+sg*k*1.2;if(c<w/2+.2||c>L-w/2-.2)continue;if(S.every(r=>c+w/2+.3<r[0]||c-w/2-.3>r[1])){t=c;break}}}
    if(t===null)continue;S.push([t-w/2,t+w/2]);
    // edificios bajos y grandes (súper, naves): rótulo arriba, cerca de la cornisa; resto: sobre el escaparate
    const y=big&&b.lv<=2&&b.top?Math.max(b.hb+2.6+hgt/2,b.top-.5-hgt/2):b.hb+2.5+hgt/2;
    SATL.cur&&0;const c=satlCell(txt,kind);c.A.q.push([e.a[0]+ux*t+e.nx*.13,y,e.a[1]+uz*t+e.nz*.13,Math.atan2(e.nx,e.nz),w,hgt,c]);
    if(!big||b.lv>2)addShopfront(e,b,t,Math.min(w,6.5),Math.min(w,6.5)/5.33);addTerrace(e,b,t,w,kind);e.signed=true;return true}
  return false}
const GENERIC=[['BAR','bar'],['CAFÉ BAR','bar'],['BAR TAPAS','restaurant'],['CERVECERÍA','bar'],['RESTAURANTE','restaurant'],['PIZZERÍA','restaurant'],['CAFETERÍA','cafe'],['BAR','bar'],['FARMACIA','pharmacy'],['PANADERÍA',''],['ESTANCO',''],['PELUQUERÍA',''],['FRUTERÍA',''],['INMOBILIARIA',''],['TAPAS','restaurant'],['CAFETERÍA','cafe'],['ÓPTICA',''],['FERRETERÍA',''],['ALIMENTACIÓN','supermarket'],['HELADERÍA','ice_cream'],['ZAPATERÍA',''],['LOTERÍAS',''],['ASESORÍA','']];
function buildSigns(){let n=0,miss=0;for(const p of (window.AG_POI||[])){const kind=p[3].split(':')[1];if(placeSign(p[0],p[1],p[2],kind))n++;else miss++}satlFinish();console.log('env negocios',n,'sin fachada',miss);
  // rótulos genéricos en algunos bajos comerciales de las calles principales (no son negocios reales concretos)
  const R=lcg(777);let g=0;for(const b of BL){if(g>260)break;if(!b.edges||b.lv<3||b.kind===0||b.kind===3||b.pubT)continue;for(const e of b.edges){if(!e.street||e.signed||e.L<6||R()>.26)continue;if(portBld((e.a[0]+e.c[0])/2,(e.a[1]+e.c[1])/2))continue;const s=GENERIC[Math.floor(R()*GENERIC.length)];
    const mx=(e.a[0]+e.c[0])/2,mz=(e.a[1]+e.c[1])/2;const L=e.L,w=Math.min(L-1,clamp(1.2+s[0].length*.32,2.5,6)),hgt=w/5.33;
    const key=s[0];GENTEX[key]=GENTEX[key]||signMat(signTex(s[0],s[1]));(GENI[key]||(GENI[key]=[])).push([mx+e.nx*.13,b.hb+2.5+hgt/2,mz+e.nz*.13,Math.atan2(e.nx,e.nz),w,hgt]);addShopfront(e,b,L/2,w,hgt);addTerrace(e,b,L/2,w,s[1]);e.signed=true;g++;break}}buildShopfronts();
  // rótulos genéricos: uno instanciado por tipo (BAR, FARMACIA…) en vez de cientos de mallas sueltas
  for(const k in GENI){const L=GENI[k],im=new THREE.InstancedMesh(hc('unitPlane',()=>new THREE.PlaneGeometry(1,1)),GENTEX[k],L.length),o=new THREE.Object3D();L.forEach((q,i)=>{o.position.set(q[0],q[1],q[2]);o.rotation.set(0,q[3],0);o.scale.set(q[4],q[5],1);o.updateMatrix();im.setMatrixAt(i,o.matrix)});scene.add(im)}
  return n}
const GENTEX={},GENI={};

/* ============ VEGETACIÓN, FAROLAS, PUERTO ============ */
function buildDecor(){
  const vc=new THREE.MeshLambertMaterial({vertexColors:true}),vcd=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const lamps=[];window.__lampsArr=lamps;const palms=(window.__islandPalms||[]).slice(),trees=[],umb=[],umbC=[],loung=[],bins=[],boats=[],boatC=[];let side=1;
  for(const rp of ROADPATHS){const {P,hw,cls}=rp;let carry=Math.random()*20;
    for(let i=0;i<P.length-2;i+=2){const ax=P[i],az=P[i+1],bx=P[i+2],bz=P[i+3],L=Math.hypot(bx-ax,bz-az);if(L<.5)continue;const dx=(bx-ax)/L,dz=(bz-az)/L,nx=-dz,nz=dx;
      const step=cls===6?11:cls<=4?27:cls===9?7:0;if(!step)continue;let t=carry;for(;t<L;t+=step){side=-side;
        if(cls>=1&&cls<=4){const o=hw+1.6,x=ax+dx*t+nx*o*side,z=az+dz*t+nz*o*side;if(!blockedAt(x,z,.4))lamps.push([x,H(x,z)+.15,z,Math.atan2(-nx*side,-nz*side)]);
          if(Math.random()<.15){const x2=ax+dx*(t+6)-nx*o*side,z2=az+dz*(t+6)-nz*o*side;if(!blockedAt(x2,z2,.6))bins.push([x2,H(x2,z2)+.15,z2,Math.atan2(dx,dz)])}}
        else if(cls===6){for(const s of [-1,1]){const o=hw-1.2,x=ax+dx*t+nx*o*s,z=az+dz*t+nz*o*s;if(!blockedAt(x,z,.4)&&!isSea(x,z))palms.push([x,H(x,z),z,Math.random()*TAU,.85+Math.random()*.35])}
          if(Math.random()<.5){const o=Math.max(.6,hw-.45),x=ax+dx*(t+5)+nx*o*side,z=az+dz*(t+5)+nz*o*side;if(!blockedAt(x,z,.3)&&!isSea(x,z))lamps.push([x,H(x,z),z,Math.atan2(-nx*side,-nz*side)])}}
        else if(cls===9){for(const s of [-1,1]){const o=hw+3.2,x=ax+dx*t+nx*o*s,z=az+dz*t+nz*o*s;if(isSea(x,z)&&isSea(x+nx*s*4,z+nz*s*4)&&Math.random()<.8){boats.push([x+nx*s*1.5,0,z+nz*s*1.5,Math.atan2(nx*s,nz*s),.8+Math.random()*.6]);boatC.push(new THREE.Color(['#ffffff','#f4f4f4','#1d3d6b','#ffffff','#c0392b'][Math.floor(Math.random()*5)]))}}}}
      carry=t-L}}
  const prep=t=>WD.areas.filter(a=>a[0]===t).map(a=>{const p=dec(a,2);let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;for(let i=0;i<p.length;i+=2){x0=Math.min(x0,p[i]);x1=Math.max(x1,p[i]);z0=Math.min(z0,p[i+1]);z1=Math.max(z1,p[i+1])}return{p,x0,z0,x1,z1,w:(x1-x0)*(z1-z0)}}).filter(a=>a.w>4);
  const pick=A=>{let tot=0;for(const a of A)tot+=a.w;let r=Math.random()*tot;for(const a of A){r-=a.w;if(r<=0)return a}return A[A.length-1]};
  const G=prep(0);let tries=0;
  while(trees.length+palms.length<2800&&tries++<20000&&G.length){const a=pick(G);const x=rnd(a.x0,a.x1),z=rnd(a.z0,a.z1);if(!pipf(x,z,a.p)||blockedAt(x,z,1.5))continue;const rn=roadNear(x,z,0,7,false);if(rn&&rn.d<1.5)continue;
    if(Math.random()<.2)palms.push([x,H(x,z),z,Math.random()*TAU,.8+Math.random()*.4]);else trees.push([x,H(x,z),z,Math.random()*TAU,.7+Math.random()*.6])}
  const SAND=prep(2);tries=0;const UC=['#e74c3c','#2980b9','#f1c40f','#27ae60','#ffffff','#e67e22','#8e44ad'];
  while(umb.length<380&&tries++<12000&&SAND.length){const a=pick(SAND);const x=rnd(a.x0,a.x1),z=rnd(a.z0,a.z1);if(!pipf(x,z,a.p)||isSea(x,z)||!seaNear(x,z,30))continue;const ry=Math.random()*TAU,y=H(x,z);umb.push([x,y,z,ry]);umbC.push(new THREE.Color(UC[Math.floor(Math.random()*UC.length)]));
    loung.push([x+Math.cos(ry)*1.1,y,z+Math.sin(ry)*1.1,ry]);if(Math.random()<.6)loung.push([x-Math.cos(ry)*1.1,y,z-Math.sin(ry)*1.1,ry])}
  const lampG=mergeParts([[cylG(.06,.1,6.6,7),0,3.3,0,0,0,0,1,1,1,'#3c4147'],[boxG(.07,.07,1.3),0,6.45,.6,0,0,0,1,1,1,'#3c4147'],[boxG(.3,.12,.6),0,6.38,1.25,0,0,0,1,1,1,'#2b2f34'],[boxG(.24,.02,.48),0,6.31,1.25,0,0,0,1,1,1,'#fff6d2'],[cylG(.15,.17,.5,8),0,.25,0,0,0,0,1,1,1,'#3c4147']]);
  {const ok=q=>roadFree(q[0],q[2],.35);for(const A of [lamps,bins]){const k=A.filter(ok);A.length=0;A.push(...k)}}
  instanced(lampG,vc,lamps);
  const trunk=new THREE.CylinderGeometry(.15,.24,7,6,4);trunk.translate(0,3.5,0);const tp=trunk.attributes.position;for(let i=0;i<tp.count;i++){const y=tp.getY(i);tp.setX(i,tp.getX(i)+.012*y*y)}trunk.computeVertexNormals();
  const fr=[[trunk,0,0,0,0,0,0,1,1,1,'#8a6a48']];for(let i=0;i<9;i++){const f=new THREE.BoxGeometry(.55,.03,2.6);f.translate(0,0,1.3);fr.push([f,.59,6.95,0,.35+Math.random()*.35,i*TAU/9+Math.random()*.3,0,1,1,1,i%2?'#3f7a2a':'#4d8a32'])}
  palms.push(...MEDPALMS);instanced(palmGeo(),vcd,palms);
  instanced(mergeParts([[cylG(.12,.2,2.4,6),0,1.2,0,0,0,0,1,1,1,'#6b4a2f'],[new THREE.IcosahedronGeometry(1.5,0),0,3.1,0,0,0,0,1,.85,1,'#4f7f37'],[new THREE.IcosahedronGeometry(1.05,0),.8,2.75,.35,0,0,0,1,1,1,'#5d8f3e'],[new THREE.IcosahedronGeometry(1.0,0),-.7,2.85,-.4,0,0,0,1,1,1,'#46732f']]),vc,trees);
  instanced(mergeParts([[cylG(.03,.03,2.4,6),0,1.2,0,0,0,0,1,1,1,'#dddddd'],[new THREE.ConeGeometry(1.35,.45,10,1,true),0,2.38,0,0,0,0,1,1,1,'#ffffff']]),vcd,umb,umbC);
  instanced(mergeParts([[boxG(.62,.08,1.9),0,.32,0,0,0,0,1,1,1,'#f4f4f4'],[boxG(.62,.08,.7),0,.52,-.75,-.6,0,0,1,1,1,'#f4f4f4']]),vc,loung);
  // papeleras suprimidas
  // barcos del puerto deportivo
  const hull=new THREE.Shape();hull.moveTo(0,-4);hull.quadraticCurveTo(1.4,-1,1.3,3);hull.lineTo(-1.3,3);hull.quadraticCurveTo(-1.4,-1,0,-4);
  const hg=new THREE.ExtrudeGeometry(hull,{depth:1.1,bevelEnabled:false});hg.rotateX(Math.PI/2);hg.translate(0,.8,0);
  instanced(mergeParts([[hg,0,0,0,0,Math.PI,0,1,1,1,'#ffffff'],[boxG(1.6,.7,2.2),0,1.1,.4,0,0,0,1,1,1,'#e9eef0'],[boxG(1.5,.25,1.6),0,1.55,.5,0,0,0,1,1,1,'#2b3a4a'],[cylG(.05,.06,9,5),0,5,-.3,0,0,0,1,1,1,'#cfcfcf']]),vc,boats,boatC);
}
/* ============ MEDIANAS: isla central elevada con bordillo entre los dos sentidos de las avenidas ============ */
function buildMedians(){const OW=ROADPATHS.map((r,i)=>Object.assign(r,{idx:i})).filter(r=>r.ow&&r.cls>=1&&r.cls<=3&&!r.rb&&!r.st);if(!OW.length)return 0;
  const grid=new Map(),GC2=30;for(const r of OW){const P=r.P;for(let i=0;i<P.length-2;i+=2){const k=Math.floor(P[i+1]/GC2)*1000+Math.floor(P[i]/GC2);(grid.get(k)||grid.set(k,[]).get(k)).push([r,i])}}
  const near=(x,z,R)=>{const o=[];const gx=Math.floor(x/GC2),gz=Math.floor(z/GC2);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=grid.get((gz+a)*1000+gx+b);if(l)o.push(...l)}return o};
  const top={p:[],u:[],i:[]},grass={p:[],u:[],i:[]},curbs={p:[],i:[]},palms=[];let n=0;
  for(const A of OW){const P=A.P;let run=[];
    const flush=()=>{if(run.length>=7){n++;for(let i=0;i<run.length-1;i++){const a=run[i],b=run[i+1];const dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz)||1,nx=-dz/L,nz=dx/L;const G=a[2]>1.3&&b[2]>1.3?grass:top;
        const v=G.p.length/3;G.p.push(a[0]+nx*a[2],0,a[1]+nz*a[2],a[0]-nx*a[2],0,a[1]-nz*a[2],b[0]+nx*b[2],0,b[1]+nz*b[2],b[0]-nx*b[2],0,b[1]-nz*b[2]);G.u.push(a[2]/2,a[3]/2,-a[2]/2,a[3]/2,b[2]/2,b[3]/2,-b[2]/2,b[3]/2);G.i.push(v,v+1,v+2,v+1,v+3,v+2);
        for(const s of [1,-1]){const x0=a[0]+nx*a[2]*s,z0=a[1]+nz*a[2]*s,x1=b[0]+nx*b[2]*s,z1=b[1]+nz*b[2]*s,h0=H(x0,z0),h1=H(x1,z1),c=curbs.p.length/3;curbs.p.push(x0,h0-.05,z0,x1,h1-.05,z1,x1,h1+.25,z1,x0,h0+.25,z0);curbs.i.push(c,c+1,c+2,c,c+2,c+3)}
        if(G===grass&&(i%3===0))palms.push([a[0],H(a[0],a[1])+.15,a[1],Math.random()*TAU,.8+Math.random()*.3])}}run=[]};
    let acc=0;for(let i=0;i<P.length-2;i+=2){const ax=P[i],az=P[i+1],bx=P[i+2],bz=P[i+3],L=Math.hypot(bx-ax,bz-az);if(L<.1)continue;acc+=L;const dx=(bx-ax)/L,dz=(bz-az)/L,mx=(ax+bx)/2,mz=(az+bz)/2;
      let best=null,bd=1e9;for(const [B,j] of near(mx,mz)){if(B===A||B.idx<A.idx&&false)continue;const Q=B.P,ex=Q[j+2]-Q[j],ez=Q[j+3]-Q[j+1],El=Math.hypot(ex,ez)||1;if((ex*dx+ez*dz)/El>-.85)continue;const d=distSeg(mx,mz,Q[j],Q[j+1],Q[j+2],Q[j+3]);if(d<bd){bd=d;best=B}}
      const gap=best?bd-A.hw-best.hw:0;if(!best||gap<1.2||gap>24||best.idx<A.idx){flush();continue}
      // lado hacia la otra calzada
      const nx=-dz,nz=dx;const sx=mx+nx*(A.hw+gap/2),sz=mz+nz*(A.hw+gap/2),tx=mx-nx*(A.hw+gap/2),tz=mz-nz*(A.hw+gap/2);
      const side=distToRoad(best,sx,sz)<distToRoad(best,tx,tz)?1:-1;const cx=mx+nx*side*(A.hw+gap/2),cz=mz+nz*side*(A.hw+gap/2);
      // no cortar calles transversales
      let cross=false;for(const rp of roadsNear(cx,cz)){if(rp===A||rp===best)continue;if(distToRoad(rp,cx,cz)<rp.hw+gap/2+1.5){cross=true;break}}if(cross){flush();continue}
      run.push([cx,cz,Math.max(.4,gap/2-.15),acc])}
    flush()}
  rbMesh(top,roadMat({map:TX.walk,depthWrite:true}),.25,6);if(!TX.grassM)TX.grassM=tileTex(128,128,(g,w,h)=>{g.fillStyle='#5f8a3a';g.fillRect(0,0,w,h);for(let i=0;i<3500;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(30,60,10,${Math.random()*.3})`:`rgba(170,210,110,${Math.random()*.25})`;g.fillRect(Math.random()*w,Math.random()*h,1,2+Math.random()*2)}});rbMesh(grass,roadMat({map:TX.grassM,depthWrite:true}),.25,6);
  if(curbs.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(curbs.p,3));g.setIndex(curbs.i);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xcfccc4,side:THREE.DoubleSide}));m.receiveShadow=HQ;scene.add(m)}
  MEDPALMS=palms;return n}
let MEDPALMS=[];
function distToRoad(r,x,z){const P=r.P;let m=1e9;for(let i=0;i<P.length-2;i+=2){const d=distSeg(x,z,P[i],P[i+1],P[i+2],P[i+3]);if(d<m)m=d}return m}
let _RN=null;function roadsNear(x,z){if(!_RN){_RN=new Map();for(const rp of ROADPATHS){if(rp.cls>5)continue;const P=rp.P,seen=new Set();for(let i=0;i<P.length;i+=2){const k=Math.floor(P[i+1]/40)*1000+Math.floor(P[i]/40);if(seen.has(k))continue;seen.add(k);(_RN.get(k)||_RN.set(k,[]).get(k)).push(rp)}}}
  const o=new Set(),gx=Math.floor(x/40),gz=Math.floor(z/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=_RN.get((gz+a)*1000+gx+b);if(l)for(const r of l)o.add(r)}return o}
