
/* ============ ENTORNO REALISTA: terrazas, toldos, tapias, coches aparcados, vegetación ============ */
/* obstáculos finos (tapias, coches aparcados) en rejilla de 32 m: segmentos con radio */
const OBG=new Map();
function obstAdd(ax,az,bx,bz,r){const s=[ax,az,bx,bz,r];const x0=Math.floor((Math.min(ax,bx)-r)/32),x1=Math.floor((Math.max(ax,bx)+r)/32),z0=Math.floor((Math.min(az,bz)-r)/32),z1=Math.floor((Math.max(az,bz)+r)/32);
  for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){const k=z*1000+x;let l=OBG.get(k);if(!l)OBG.set(k,l=[]);l.push(s)}}
function obstBlocked(x,z,r){const l=OBG.get(Math.floor(z/32)*1000+Math.floor(x/32));if(!l)return false;for(const s of l)if(distSeg(x,z,s[0],s[1],s[2],s[3])<s[4]+r)return true;return false}

function SGB(){return{p:[],n:[],c:[],u:[],i:[]}}
function sgQuad(S,P,nx,ny,nz,col,uv){const v=S.p.length/3;
  const ax=P[3]-P[0],ay=P[4]-P[1],az=P[5]-P[2],bx=P[9]-P[0],by=P[10]-P[1],bz=P[11]-P[2],cx=ay*bz-az*by,cy=az*bx-ax*bz,cz=ax*by-ay*bx;
  if(cx*nx+cy*ny+cz*nz<0){P=[P[3],P[4],P[5],P[0],P[1],P[2],P[9],P[10],P[11],P[6],P[7],P[8]];if(uv)uv=[uv[2],uv[3],uv[0],uv[1],uv[6],uv[7],uv[4],uv[5]]}
  for(let k=0;k<4;k++){S.p.push(P[k*3],P[k*3+1],P[k*3+2]);S.n.push(nx,ny,nz);S.c.push(col.r,col.g,col.b);S.u.push(uv?uv[k*2]:0,uv?uv[k*2+1]:0)}S.i.push(v,v+1,v+2,v,v+2,v+3)}
/* caja orientada a lo largo de una fachada: t (a lo largo), d (hacia fuera), y */
function sgBox(S,ax,az,ux,uz,nx,nz,t0,t1,d0,d1,y0,y1,col,back){
  const P=(t,d,y)=>[ax+ux*t+nx*d,y,az+uz*t+nz*d];const q=(A,B,C,D,n)=>sgQuad(S,[...A,...B,...C,...D],n[0],n[1],n[2],col,[0,0,1,0,1,1,0,1]);
  q(P(t0,d1,y0),P(t1,d1,y0),P(t1,d1,y1),P(t0,d1,y1),[nx,0,nz]);
  q(P(t0,d0,y1),P(t0,d1,y1),P(t1,d1,y1),P(t1,d0,y1),[0,1,0]);
  q(P(t0,d0,y0),P(t1,d0,y0),P(t1,d1,y0),P(t0,d1,y0),[0,-1,0]);
  q(P(t0,d0,y0),P(t0,d1,y0),P(t0,d1,y1),P(t0,d0,y1),[-ux,0,-uz]);
  q(P(t1,d1,y0),P(t1,d0,y0),P(t1,d0,y1),P(t1,d1,y1),[ux,0,uz]);
  if(back)q(P(t1,d0,y0),P(t0,d0,y0),P(t0,d0,y1),P(t1,d0,y1),[-nx,0,-nz])}
/* plano vertical con uv en metros */
function sgPlane(S,x0,z0,x1,z1,y0a,y0b,h,col,us,vs,u0){const L=Math.hypot(x1-x0,z1-z0)||1,nx=(z1-z0)/L,nz=-(x1-x0)/L;u0=u0||0;
  sgQuad(S,[x0,y0a,z0,x1,y0b,z1,x1,y0b+h,z1,x0,y0a+h,z0],nx,0,nz,col,[u0/us,0,(u0+L)/us,0,(u0+L)/us,h/vs,u0/us,h/vs])}
function sgMesh(S,mat,list){if(!S.i.length)return null;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(S.p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(S.n,3));
  g.setAttribute('color',new THREE.Float32BufferAttribute(S.c,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(S.u,2));g.setIndex(S.i);g.computeBoundingSphere();const m=new THREE.Mesh(g,mat);if(HQ){m.castShadow=true;m.receiveShadow=true;if(mat.map&&(mat.transparent||mat.alphaTest>0))m.customDepthMaterial=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:mat.map,alphaTest:.5})}scene.add(m);
  if(list){const bs=g.boundingSphere;DECO.push({im:m,x:bs.center.x,z:bs.center.z,y:0})}return m}

/* ---- terrazas, balcones y toldos de las fachadas ---- */
const AWNCOL=['#2e6b4a','#a8322a','#1f4e79','#d9c9a3','#6b4a2e','#e8e8e8','#c8641e','#7b2d3b','#2d5f6e'];
function buildFacadeExtras(){
  const CH=256,chunks=new Map();const get=(x,z)=>{const k=Math.floor(z/CH)*100+Math.floor(x/CH);let c=chunks.get(k);if(!c){c={slab:SGB(),r0:SGB(),r1:SGB(),r2:SGB(),awn:SGB()};chunks.set(k,c)}return c};
  const white=new THREE.Color('#f4f2ec'),soff=new THREE.Color(),ac=new THREE.Color();let nb=0;
  for(const f of FACX){const b=f.b;if(!b.edges)continue;const R=lcg(b.seed*7+3);const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,C=get(cx,cz);
    const y1=f.B+f.gh,nf=Math.min(14,Math.floor((f.top-y1)/3+.02));const awnC=AWNCOL[Math.floor(R()*AWNCOL.length)];
    for(const e of b.edges){if(e.L<2.6||e.shared)continue;const ux=(e.c[0]-e.a[0])/e.L,uz=(e.c[1]-e.a[1])/e.L,ax=e.a[0],az=e.a[1];
      // toldos sobre los locales
      if(false&&e.street&&(e.gc===CELL.SHOP||e.gc===CELL.SHOP2)&&R()<.7&&!f.house){// toldos suprimidos
ac.set(awnC);const t0=.25,t1=e.L-.25,yA=f.B+2.95,yB=f.B+2.4,D=1.45;const S=C.awn;
        const P=(t,d,y)=>[ax+ux*t+e.nx*d,y,az+uz*t+e.nz*d];const ny=D/Math.hypot(D,yA-yB);
        sgQuad(S,[...P(t0,0,yA),...P(t1,0,yA),...P(t1,D,yB),...P(t0,D,yB)],e.nx*.5,ny,e.nz*.5,ac,[t0/1,1,t1/1,1,t1/1,0,t0/1,0]);
        sgQuad(S,[...P(t0,D,yB-.28),...P(t1,D,yB-.28),...P(t1,D,yB),...P(t0,D,yB)],e.nx,0,e.nz,ac,[t0,.2,t1,.2,t1,0,t0,0]);
        for(const t of [t0,t1])sgQuad(S,[...P(t,0,yA),...P(t,D,yB),...P(t,D,yB-.28),...P(t,0,yA-.28)],ux,0,uz,ac,[0,1,1,0,1,0,0,1])}
      if(nf<1||f.house)continue;
      const front=e.street||(f.terr&&f.up===CELL.GLASS);if(!front&&!(e.L>8&&R()<.35))continue;
      const terrace=f.terr,glassR=f.railT===1,D=terrace?(f.up===CELL.GLASS?1.7:1.25):.85;
      if(f.up!==CELL.APT&&f.up!==CELL.GLASS)continue;
      // tramos de balcón: corridos (terraza) o uno por puerta según el atlas (puerta a 1,36 m dentro de cada módulo de 6 m)
      const spans=[];if(terrace){if(e.L>3)spans.push([.3,e.L-.3])}else{const m0=((e.u0%6)+6)%6;for(let tc=1.36-m0;tc<e.L;tc+=6){const t0=Math.max(.3,tc-1.05),t1=Math.min(e.L-.3,tc+1.05);if(t1-t0>1.2)spans.push([t0,t1])}}
      if(!spans.length)continue;nb++;soff.copy(f.tint).multiplyScalar(.93);
      const RS=glassR?C.r1:f.railT===2?C.r2:C.r0;
      for(let k=0;k<nf;k++){const yf=y1+3*k;if(yf+1.2>f.top)break;
        for(const [t0,t1] of spans){sgBox(C.slab,ax,az,ux,uz,e.nx,e.nz,t0,t1,0,D,yf-.06,yf+.13,k%2?white:soff,false);
          const P=(t,d)=>[ax+ux*t+e.nx*d,az+uz*t+e.nz*d];const A=P(t0,D-.03),B2=P(t1,D-.03),A0=P(t0,.02),B0=P(t1,.02);const yr=yf+.13,hr=glassR?1.0:1.0;
          sgPlane(RS,A[0],A[1],B2[0],B2[1],yr,yr,hr,white,glassR?1.2:.6,1,0);
          sgPlane(RS,A0[0],A0[1],A[0],A[1],yr,yr,hr,white,glassR?1.2:.6,1,0);sgPlane(RS,B2[0],B2[1],B0[0],B0[1],yr,yr,hr,white,glassR?1.2:.6,1,0)}}}}
  const ms=new THREE.MeshLambertMaterial({vertexColors:true});
  const mr0=new THREE.MeshLambertMaterial({map:TX.rail,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide});
  const mr1=new THREE.MeshLambertMaterial({map:TX.railGlass,vertexColors:true,transparent:true,depthWrite:false,side:THREE.DoubleSide});
  const mr2=new THREE.MeshLambertMaterial({map:TX.balus,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide});
  const ma=new THREE.MeshLambertMaterial({map:TX.awn,vertexColors:true,side:THREE.DoubleSide});
  for(const c of chunks.values()){sgMesh(c.slab,ms,true);sgMesh(c.r0,mr0,true);const g=sgMesh(c.r1,mr1,true);if(g){g.castShadow=false;g.renderOrder=2}sgMesh(c.r2,mr2,true);sgMesh(c.awn,ma,true)}
  return nb}

/* ---- calles residenciales: coches aparcados y tapias de chalés ---- */
const PCOL=['#f2f2f2','#e9e9e9','#c9ccd0','#9aa0a6','#2b2d31','#1c1f24','#7a1e1e','#24426b','#c8c2b4','#5b6a74','#ffffff','#3b4a3a','#a33d2a','#d8d2c0'];
function parkedCarGeo(){const P=[];const body=new THREE.Shape();body.moveTo(-2.15,.32);body.lineTo(2.1,.32);body.lineTo(2.2,.62);body.lineTo(2.05,.86);body.lineTo(.95,.92);body.lineTo(.3,1.38);body.lineTo(-1.25,1.4);body.lineTo(-1.95,.98);body.lineTo(-2.2,.9);body.lineTo(-2.2,.45);body.lineTo(-2.15,.32);
  const g=new THREE.ExtrudeGeometry(body,{depth:1.72,bevelEnabled:false});g.translate(0,0,-.86);g.rotateY(-Math.PI/2);g.computeVertexNormals();
  const win=new THREE.Shape();win.moveTo(.88,.95);win.lineTo(.27,1.33);win.lineTo(-1.2,1.35);win.lineTo(-1.82,.98);win.lineTo(.88,.95);const wg=new THREE.ExtrudeGeometry(win,{depth:1.6,bevelEnabled:false});wg.translate(0,0,-.8);wg.rotateY(-Math.PI/2);
  const parts=[[g,0,0,0,0,0,0,1,1,1,'#ffffff'],[wg,0,.02,0,0,0,0,1,1,1,'#1c2229']];
  for(const [x,z] of [[.78,1.35],[-.78,1.35],[.78,-1.3],[-.78,-1.3]])parts.push([cylG(.32,.32,.22,10),x,.32,z,0,0,Math.PI/2,1,1,1,'#18191b']);
  parts.push([boxG(1.5,.12,.05),0,.62,2.2,0,0,0,1,1,1,'#f4f1d8'],[boxG(1.5,.12,.05),0,.66,-2.2,0,0,0,1,1,1,'#8e1c1c']);
  const m=mergeParts(parts);// el color blanco de la carrocería se tiñe por instancia; cristales y ruedas se oscurecen igualmente
  return m}
function buildStreetLife(){
  const nodes=new Map();for(const r of WD.roads){if(r[0]>7)continue;for(let i=5;i<r.length;i+=2){const k=r[i]+','+r[i+1];nodes.set(k,(nodes.get(k)||0)+1)}}
  const J=[];for(const [k,n] of nodes)if(n>1){const [x,z]=k.split(',').map(Number);J.push([x*K,z*K])}
  const JG=new Map();for(const p of J){const k=Math.floor(p[1]/40)*1000+Math.floor(p[0]/40);(JG.get(k)||JG.set(k,[]).get(k)).push(p)}
  const nearJ=(x,z,r)=>{const gx=Math.floor(x/40),gz=Math.floor(z/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=JG.get((gz+a)*1000+gx+b);if(l)for(const p of l)if(Math.hypot(p[0]-x,p[1]-z)<r)return true}return false};
  const EXG=new Set();if(typeof EVENTS!=='undefined')for(const ev of EVENTS){const L=ev.path.L||ev.path.len||4000;for(let d=0;d<=L;d+=4){const p=pathAt(ev.path,d);if(!p)break;EXG.add(Math.floor(p.z/6)*2000+Math.floor(p.x/6))}}
  const nearEv=(x,z)=>{const gx=Math.floor(x/6),gz=Math.floor(z/6);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(EXG.has((gz+a)*2000+gx+b))return true;return false};
  const cars=[],carC=[],walls=[],flowers=[],flC=[],hedges=[];const R=lcg(2026);
  const houseAt=(x,z)=>{const l=GBL[Math.floor(z/GC)*GWc+Math.floor(x/GC)];if(!l)return null;for(const b of l)if(x>=b.x0&&x<=b.x1&&z>=b.z0&&z<=b.z1&&pipf(x,z,b.p))return b;return null};
  for(const rp of ROADPATHS){const {P,hw,cls,ow}=rp;if(rp.rb||cls<3||cls>5)continue;const n=P.length/2;
    const sides=cls===5?[]:ow?[1]:[(rp.name|0)%2?1:-1];const walkW=cls<=4?2.4:0;
    let acc=0,next=3+R()*8;
    for(let i=0;i<n-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);if(L<.3)continue;const dx=(bx-ax)/L,dz=(bz-az)/L,nx=-dz,nz=dx;
      // coches aparcados en línea junto al bordillo
      for(let t=next-acc;t<L;t+=0){const x=ax+dx*t,z=az+dz*t;
        if(hw>=3.5)for(const s of sides){const o=hw-1.05,px=x+nx*o*s,pz=z+nz*o*s;if(false&&!nearJ(px,pz,hw+9)&&!nearEv(px,pz)&&!blockedAt(px,pz,1.2)){
          const y0=H(px-dx*1.3,pz-dz*1.3),y1=H(px+dx*1.3,pz+dz*1.3);const fw=s>0||ow?1:-1;
          cars.push([px,(y0+y1)/2,pz,Math.atan2(dx*fw,dz*fw),1,1,1,-Math.atan((y1-y0)*fw/2.6)]);carC.push(new THREE.Color(PCOL[Math.floor(R()*PCOL.length)]));
          obstAdd(px-dx*1.45,pz-dz*1.45,px+dx*1.45,pz+dz*1.45,.82)}}
        t+=5.6+(R()<.2?4+R()*6:0);next=acc+t;if(t>=L)break}
      acc+=L}
    // tapias de chalés: muro blanco con verja o balaustrada, setos y buganvillas
    if(cls<4)continue;
    for(const s of [-1,1]){const o=hw+walkW+.35;let run=null,u=0;const flush=()=>{if(run&&run.pts.length>=3)walls.push(run);run=null};
      for(let i=0;i<n-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);if(L<.3)continue;const dx=(bx-ax)/L,dz=(bz-az)/L,nx=-dz*s,nz=dx*s;
        for(let t=0;t<L;t+=1.6){const x=ax+dx*t+nx*o,z=az+dz*t+nz*o;u+=1.6;let ok=!nearJ(x,z,hw+walkW+4)&&!blockedAt(x,z,.3)&&!isSea(x,z);
          if(ok){const rn=roadNear(x,z,0,9,false);if(rn&&rn.d<.25)ok=false}
          if(ok){let hb=null;for(let d=2.5;d<=13&&!hb;d+=2.5){const b=houseAt(x+nx*d,z+nz*d);if(b)hb=b}if(!hb||hb.kind!==0)ok=false}
          if(ok){if(!run)run={pts:[],style:Math.floor(R()*4),gate:4+R()*8};run.pts.push([x,z,nx,nz]);if(run.pts.length>=run.gate){flush();u+=0}}else flush()}}
      flush()}}
  // coches
  if(cars.length)instanced(parkedCarGeo(),new THREE.MeshStandardMaterial({vertexColors:true,metalness:.35,roughness:.42,envMap:scene.environment||null}),cars,carC);
  // tapias
  const W=SGB(),T=SGB(),Bal=SGB(),wc=new THREE.Color(),cap=new THREE.Color('#e3dccd'),iron=new THREE.Color('#ffffff'),hedgeC=['#3f6b2e','#4d7a34','#36602a'],BUG=['#c2185b','#d81b60','#ad1457','#e91e63','#f06292','#ffffff','#ff7043'];
  for(const run of walls){const pts=run.pts;wc.set(['#fbfaf6','#f6f1e6','#f2e8d6','#fdfdfb'][run.style]);const hBase=run.style===3?1.7:1.05;
    for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1];if(Math.hypot(b[0]-a[0],b[1]-a[1])>2.4)continue;const ya=H(a[0],a[1]),yb=H(b[0],b[1]);
      const L=Math.hypot(b[0]-a[0],b[1]-a[1]),ux=(b[0]-a[0])/L,uz=(b[1]-a[1])/L;const nx=a[2],nz=a[3];
      // muro con grosor 0,25 m (cara a la calle, trasera y albardilla)
      sgPlane(W,b[0],b[1],a[0],a[1],yb-.4,ya-.4,hBase+.4,wc,1,1,0);
      sgPlane(W,a[0]+nx*.25,a[1]+nz*.25,b[0]+nx*.25,b[1]+nz*.25,ya-.4,yb-.4,hBase+.4,wc,1,1,0);
      const P=(x,z,d,y)=>[x+nx*d,y,z+nz*d];sgQuad(W,[...P(a[0],a[1],-.04,ya+hBase+.06),...P(b[0],b[1],-.04,yb+hBase+.06),...P(b[0],b[1],.29,yb+hBase+.06),...P(a[0],a[1],.29,ya+hBase+.06)],0,1,0,cap);
      sgPlane(W,b[0]-nx*.04,b[1]-nz*.04,a[0]-nx*.04,a[1]-nz*.04,yb+hBase,ya+hBase,.06,cap,1,1,0);
      obstAdd(a[0]+nx*.12,a[1]+nz*.12,b[0]+nx*.12,b[1]+nz*.12,.18);
      if(run.style===0||run.style===2)sgPlane(run.style===0?T:Bal,b[0]+nx*.12,b[1]+nz*.12,a[0]+nx*.12,a[1]+nz*.12,yb+hBase+.06,ya+hBase+.06,run.style===0?.8:.62,run.style===0?new THREE.Color('#2a2a2a'):iron,.6,run.style===0?.8:.62,k*1.6);
      if(run.style===1&&R()<.85)hedges.push([(a[0]+b[0])/2+nx*.5,(ya+yb)/2+hBase-.1,(a[1]+b[1])/2+nz*.5,Math.atan2(ux,uz),1,1,1]);
      if(false){flowers.push([(a[0]+b[0])/2+nx*.25,(ya+yb)/2+hBase+.2,(a[1]+b[1])/2+nz*.25,R()*TAU,.8+R()*.7]);flC.push(new THREE.Color(BUG[Math.floor(R()*BUG.length)]))}}
    // pilares de la cancela al final del tramo
    const e=pts[pts.length-1];const ye=H(e[0],e[1]);hedges.length;sgBox(W,e[0],e[1],1,0,0,1,-.2,.2,-.05,.4,ye-.3,ye+hBase+.45,cap,true)}
  const ironMat=new THREE.MeshLambertMaterial({map:TX.rail,color:0x2a2a2a,alphaTest:.5,side:THREE.DoubleSide});
  sgMesh(W,new THREE.MeshLambertMaterial({vertexColors:true}),true);sgMesh(T,new THREE.MeshLambertMaterial({map:TX.rail,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide}),true);sgMesh(Bal,new THREE.MeshLambertMaterial({map:TX.balus,vertexColors:true,alphaTest:.5,side:THREE.DoubleSide}),true);
  const hc=hedges.map(()=>new THREE.Color(hedgeC[Math.floor(R()*3)]));
  instanced(mergeParts([[boxG(1.75,.9,.7),0,.45,0,0,0,0,1,1,1,'#ffffff'],[new THREE.IcosahedronGeometry(.5,0),.5,.85,0,0,0,0,1,.6,1,'#ffffff'],[new THREE.IcosahedronGeometry(.45,0),-.45,.85,.05,0,0,0,1,.6,1,'#ffffff']]),new THREE.MeshLambertMaterial({vertexColors:true}),hedges,hc);
  instanced(mergeParts([[new THREE.IcosahedronGeometry(.7,0),0,0,0,0,0,0,1.4,.7,.8,'#ffffff'],[new THREE.IcosahedronGeometry(.5,0),.7,-.35,.2,0,0,0,1,1.2,.8,'#ffffff'],[new THREE.IcosahedronGeometry(.35,0),-.6,-.5,.1,0,0,0,1,1.4,.8,'#3f6b2e']]),new THREE.MeshLambertMaterial({vertexColors:true}),flowers,flC);
  return{cars:cars.length,walls:walls.length}}

/* ---- vegetación mediterránea: adelfas, pinos carrasco y matorral seco en las lomas ---- */
function buildNature(){const R=lcg(99);const vc=new THREE.MeshLambertMaterial({vertexColors:true});
  const pines=[],scrub=[],scC=[],olea=[],olC=[];const SC=['#7d7a52','#8a8458','#6f7148','#9a8f62','#75704a'];
  let tries=0;while(scrub.length<2600&&tries++<26000){const x=8+R()*(WM-16),z=8+R()*(HM-16);if(isSea(x,z)||seaNear(x,z,25))continue;const gx=Math.floor(x/GC),gz=Math.floor(z/GC);
    let urb=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(GBL[(gz+a)*GWc+gx+b])urb++;if(urb>2)continue;if(blockedAt(x,z,1.5))continue;const rn=roadNear(x,z,0,9,false);if(rn&&rn.d<3)continue;
    const y=H(x,z);if(R()<.12)pines.push([x,y,z,R()*TAU,.8+R()*.6]);else{scrub.push([x,y,z,R()*TAU,.5+R()*.9]);scC.push(new THREE.Color(SC[Math.floor(R()*SC.length)]))}}
  // adelfas y buganvillas en jardines de chalés (junto a las casas, fuera de la calzada)
  for(const b of BL){if(b.kind!==0||!b.edges||R()>.55)continue;const e=b.edges[Math.floor(R()*b.edges.length)];if(!e||e.L<3)continue;const t=.3+R()*.4,d=1.4+R()*2;
    const x=e.a[0]+(e.c[0]-e.a[0])*t+e.nx*d,z=e.a[1]+(e.c[1]-e.a[1])*t+e.nz*d;if(blockedAt(x,z,.8))continue;const rn=roadNear(x,z,0,9,false);if(rn&&rn.d<2.8)continue;
    if(false)olea.push([x,H(x,z),z,R()*TAU,.8+R()*.5]);olC.push(new THREE.Color(['#e86a9a','#f4f0ee','#d9426f','#f7a1c0','#c2185b'][Math.floor(R()*5)]))}
  // pino carrasco: tronco inclinado y copa aparasolada
  instanced(mergeParts([[cylG(.16,.28,5.5,6),.35,2.7,0,0,0,-.13,1,1,1,'#6e5236'],[new THREE.IcosahedronGeometry(2.3,1),.7,5.9,0,0,0,0,1.2,.5,1.2,'#4a6b33'],[new THREE.IcosahedronGeometry(1.6,1),-.6,5.4,.6,0,0,0,1.1,.5,1.1,'#55783a'],[new THREE.IcosahedronGeometry(1.3,0),1.6,5.2,-.8,0,0,0,1,.55,1,'#3f5e2c']]),vc,pines);
  instanced(mergeParts([[new THREE.IcosahedronGeometry(.8,0),0,.35,0,0,0,0,1.3,.55,1.1,'#ffffff'],[new THREE.IcosahedronGeometry(.55,0),.7,.25,.3,0,0,0,1,.6,1,'#ffffff']]),vc,scrub,scC);
  instanced(mergeParts([[new THREE.IcosahedronGeometry(.95,1),0,1.05,0,0,0,0,1,1.15,1,'#3b6a2c'],[new THREE.IcosahedronGeometry(.75,0),0,1.45,0,0,0,0,1.15,.75,1.15,'#ffffff']]),vc,olea,olC);
  return{pines:pines.length,scrub:scrub.length,olea:olea.length}}

/* ---- piscinas del Catastro: lámina de agua con borde de piedra blanca ---- */
function buildPools(){if(!WD.pools||!WD.pools.length)return 0;const W2=SGB(),C=SGB(),wc=new THREE.Color('#ffffff'),cc=new THREE.Color('#f1ece2');let n=0;
  for(const f of WD.pools){const p=dec(f,0),m=p.length/2;if(m<3)continue;let ar=0;for(let i=0,j=m-1;i<m;j=i++)ar+=p[j*2]*p[i*2+1]-p[i*2]*p[j*2+1];if(Math.abs(ar)/2<6||Math.abs(ar)/2>900)continue;
    let hmax=-1e9,hmin=1e9;for(let i=0;i<m;i++){const h=H(p[i*2],p[i*2+1]);hmax=Math.max(hmax,h);hmin=Math.min(hmin,h)}const yc=hmax+.12,yw=yc-.1;
    const pts=[];for(let i=0;i<m;i++)pts.push(new THREE.Vector2(p[i*2],p[i*2+1]));const tri=THREE.ShapeUtils.triangulateShape(pts,[]);
    const v0=W2.p.length/3;for(const q of pts){W2.p.push(q.x,yw,q.y);W2.n.push(0,1,0);W2.c.push(wc.r,wc.g,wc.b);W2.u.push(q.x/3,q.y/3)}for(const t of tri)W2.i.push(v0+t[0],v0+t[2],v0+t[1]);
    const s=ar>0?1:-1;// borde de 0,35 m alrededor y faldón hasta el suelo
    for(let i=0;i<m;i++){const a=pts[i],b=pts[(i+1)%m],L=Math.hypot(b.x-a.x,b.y-a.y)||1,nx=s*(b.y-a.y)/L,nz=-s*(b.x-a.x)/L;const o=.35;
      sgQuad(C,[a.x,yc,a.y,b.x,yc,b.y,b.x+nx*o,yc,b.y+nz*o,a.x+nx*o,yc,a.y+nz*o],0,1,0,cc);
      sgQuad(C,[a.x+nx*o,hmin-.3,a.y+nz*o,b.x+nx*o,hmin-.3,b.y+nz*o,b.x+nx*o,yc,b.y+nz*o,a.x+nx*o,yc,a.y+nz*o],nx,0,nz,cc);
      sgQuad(C,[a.x,yw-.05,a.y,b.x,yw-.05,b.y,b.x,yc,b.y,a.x,yc,a.y],-nx,0,-nz,new THREE.Color('#bfe7ef'))}n++}
  const wt=tileTex(128,128,(g,w,h)=>{g.fillStyle='#3fb6d3';g.fillRect(0,0,w,h);for(let i=0;i<60;i++){g.strokeStyle=`rgba(255,255,255,${.12+Math.random()*.2})`;g.lineWidth=1+Math.random()*2;g.beginPath();const x=Math.random()*w,y=Math.random()*h;g.moveTo(x,y);g.bezierCurveTo(x+10,y-8,x+20,y+8,x+34,y);g.stroke()}});
  const wm=new THREE.MeshStandardMaterial({map:wt,vertexColors:true,metalness:.1,roughness:.08,envMap,envMapIntensity:1.2,emissive:0x0a3c48,emissiveIntensity:.35,side:THREE.DoubleSide});POOLMAT=wm;
  const a=sgMesh(W2,wm,true);if(a){a.castShadow=false}sgMesh(C,new THREE.MeshLambertMaterial({vertexColors:true}),true);return n}
let POOLMAT=null;
