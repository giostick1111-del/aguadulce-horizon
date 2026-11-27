
/* ============ PARQUES Y JARDINES (OpenStreetMap actual) y PUNTOS KILOMÉTRICOS ============ */
const PARKS=__PARKS__,PKD=__PKD__;
function parksPaint(g){for(const [t,P] of PARKS){g.fillStyle=t.startsWith('playground')?'#d9c49a':'#5f9a45';g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0]*8,p[1]*8):g.moveTo(p[0]*8,p[1]*8));g.closePath();g.fill()}}
function parkInfo(P){let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9,A=0;for(let i=0,j=P.length-1;i<P.length;j=i++){A+=P[j][0]*P[i][1]-P[i][0]*P[j][1];x0=Math.min(x0,P[i][0]);x1=Math.max(x1,P[i][0]);z0=Math.min(z0,P[i][1]);z1=Math.max(z1,P[i][1])}return{x0,z0,x1,z1,A:Math.abs(A)/2}}
function buildParks(){const vc=new THREE.MeshLambertMaterial({vertexColors:true});const G={p:[],u:[],i:[]},PA={p:[],u:[],i:[]},CU={p:[],i:[]};
  const trees=[],palms=[],benches=[],lamps=[],swings=[],slides=[],bins=[];const R=lcg(31337);let n=0;
  const tri=(B,pts,y,us)=>{let t=null;try{t=THREE.ShapeUtils.triangulateShape(pts.map(p=>new THREE.Vector2(p[0],p[1])),[])}catch(e){}if(!t)return;const v=B.p.length/3;for(const p of pts){B.p.push(p[0],y,p[1]);B.u.push(p[0]/us,p[1]/us)}for(const q of t)B.i.push(v+q[0],v+q[1],v+q[2])};
  for(const [tag,P0] of PARKS){const P=P0.slice();if(P.length>3&&P[0][0]===P[P.length-1][0]&&P[0][1]===P[P.length-1][1])P.pop();if(P.length<3)continue;const inf=parkInfo(P);if(inf.A<25)continue;
    const play=tag.startsWith('playground'),green=!play;n++;
    // césped (o arena del parque infantil) con bordillo perimetral; se apoya en el terreno vértice a vértice
    const B=play?PA:G;tri(B,P,0,play?2:3);
    for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.2)continue;const ha=H(a[0],a[1]),hb=H(b[0],b[1]),v=CU.p.length/3;CU.p.push(a[0],ha-.05,a[1],b[0],hb-.05,b[1],b[0],hb+.2,b[1],a[0],ha+.2,a[1]);CU.i.push(v,v+1,v+2,v,v+2,v+3)}
    const inside=(x,z)=>{if(!inPoly(P,x,z)||blockedAt(x,z,1)||!roadFree(x,z,1.2))return false;for(const rp of walkNear(x,z))if(distToRoad(rp,x,z)<rp.hw+1.5)return false;return true};
    // caminos: un paseo central a lo largo del eje largo y otro transversal en los parques grandes
    if(green&&inf.A>600){let best=0,ux=1,uz=0;for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L>best){best=L;ux=(b[0]-a[0])/L;uz=(b[1]-a[1])/L}}
      const cx=(inf.x0+inf.x1)/2,cz=(inf.z0+inf.z1)/2;for(const [dx,dz] of inf.A>2500?[[ux,uz],[-uz,ux]]:[[ux,uz]]){const seg=[];for(let s=-200;s<=200;s+=2){const x=cx+dx*s,z=cz+dz*s;if(inPoly(P,x,z))seg.push([x,z])}if(seg.length<3)continue;
        const nx=-dz,nz=dx,w=1.4;for(let k=0;k<seg.length-1;k++){const a=seg[k],b=seg[k+1];const v=PA.p.length/3;PA.p.push(a[0]+nx*w,0,a[1]+nz*w,a[0]-nx*w,0,a[1]-nz*w,b[0]+nx*w,0,b[1]+nz*w,b[0]-nx*w,0,b[1]-nz*w);PA.u.push(0,k,1,k,0,k+1,1,k+1);PA.i.push(v,v+1,v+2,v+1,v+3,v+2)
          if(k%6===3){for(const s of [-1,1]){const x=a[0]+nx*s*2.3,z=a[1]+nz*s*2.3;if(!blockedAt(x,z,.4))benches.push([x,H(x,z)+.15,z,Math.atan2(-nx*s,-nz*s)])}}
          if(k%10===0){const x=a[0]+nx*2.4,z=a[1]+nz*2.4;if(!blockedAt(x,z,.4))lamps.push([x,H(x,z)+.15,z,0])}
          if(k%14===7){const x=a[0]-nx*2.4,z=a[1]-nz*2.4;if(!blockedAt(x,z,.4))bins.push([x,H(x,z)+.15,z,0])}}}}
    // arbolado: densidad según superficie, palmeras en los parques junto al mar
    if(green){const nt=Math.min(160,Math.floor(inf.A/90));const nearSea=seaNear((inf.x0+inf.x1)/2,(inf.z0+inf.z1)/2,200);let t=0,k=0;
      while(k<nt&&t++<nt*20){const x=inf.x0+R()*(inf.x1-inf.x0),z=inf.z0+R()*(inf.z1-inf.z0);if(!inside(x,z))continue;let ok=true;for(const q of trees.concat(palms).slice(-60))if(Math.hypot(q[0]-x,q[2]-z)<5){ok=false;break}if(!ok)continue;
        if(R()<(nearSea?.55:.25))palms.push([x,H(x,z)+.15,z,R()*TAU,.8+R()*.4]);else trees.push([x,H(x,z)+.15,z,R()*TAU,.75+R()*.55]);k++}}
    else{// columpios y tobogán
      const cx=(inf.x0+inf.x1)/2,cz=(inf.z0+inf.z1)/2;if(inside(cx,cz)){swings.push([cx,H(cx,cz)+.1,cz,R()*TAU]);const x=cx+3,z=cz+2;if(inPoly(P,x,z))slides.push([x,H(x,z)+.1,z,R()*TAU])}}}
  // malla del suelo: los vértices se pegan al terreno
  const mesh=(B,mat,dy,ord)=>{if(!B.i.length)return;for(let i=0;i<B.p.length;i+=3)B.p[i+1]=H(B.p[i],B.p[i+2])+dy;OVL.push({p:B.p,i:B.i});const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(B.p,3));if(B.u)g.setAttribute('uv',new THREE.Float32BufferAttribute(B.u,2));g.setIndex(B.i);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=HQ;m.renderOrder=ord;scene.add(m)};
  if(!TX.grassP)TX.grassP=tileTex(128,128,(g,w,h)=>{g.fillStyle='#5b8f3c';g.fillRect(0,0,w,h);for(let i=0;i<4000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(25,55,10,${Math.random()*.3})`:`rgba(170,215,110,${Math.random()*.25})`;g.fillRect(Math.random()*w,Math.random()*h,1,2+Math.random()*2)}});
  if(!TX.albero)TX.albero=tileTex(128,128,(g,w,h)=>{g.fillStyle='#d8c08e';g.fillRect(0,0,w,h);noise(g,0,0,w,h,5000,.18)});
  mesh(G,roadMat({map:TX.grassP,depthWrite:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}),.16,6);mesh(PA,roadMat({map:TX.albero,depthWrite:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),.18,7);
  if(CU.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(CU.p,3));g.setIndex(CU.i);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xd6d2c8,side:THREE.DoubleSide}));m.receiveShadow=HQ;scene.add(m)}
  if(trees.length)instanced(mergeParts([[cylG(.14,.22,2.6,6),0,1.3,0,0,0,0,1,1,1,'#6b4a2f'],[new THREE.IcosahedronGeometry(1.7,1),0,3.5,0,0,0,0,1,.85,1,'#4c7d35'],[new THREE.IcosahedronGeometry(1.1,1),.9,3.1,.4,0,0,0,1,1,1,'#5a8f3d']]),vc,trees);
  if(palms.length)instanced(palmGeo(),new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),palms);
  if(benches.length)instanced(mergeParts([[boxG(1.6,.06,.45),0,.45,0,0,0,0,1,1,1,'#8a5a32'],[boxG(1.6,.4,.05),0,.68,-.2,0,0,0,1,1,1,'#8a5a32'],[boxG(.06,.45,.45),-.7,.22,0,0,0,0,1,1,1,'#333333'],[boxG(.06,.45,.45),.7,.22,0,0,0,0,1,1,1,'#333333']]),vc,benches);
  if(lamps.length)instanced(mergeParts([[cylG(.05,.07,3.6,6),0,1.8,0,0,0,0,1,1,1,'#2d3033'],[new THREE.SphereGeometry(.22,10,8),0,3.75,0,0,0,0,1,1,1,'#fff6dc']]),vc,lamps);
  if(false&&bins.length)instanced(mergeParts([[cylG(.22,.2,.8,10),0,.4,0,0,0,0,1,1,1,'#2e5d3a']]),vc,bins);
  if(swings.length)instanced(mergeParts([[boxG(.1,2.2,.1),-1.6,1.1,-.6,0,0,.18,1,1,1,'#d32f2f'],[boxG(.1,2.2,.1),-1.6,1.1,.6,0,0,.18,1,1,1,'#d32f2f'],[boxG(.1,2.2,.1),1.6,1.1,-.6,0,0,-.18,1,1,1,'#d32f2f'],[boxG(.1,2.2,.1),1.6,1.1,.6,0,0,-.18,1,1,1,'#d32f2f'],[boxG(3.4,.1,.1),0,2.15,0,0,0,0,1,1,1,'#1565c0'],[boxG(.5,.05,.2),-.7,.5,0,0,0,0,1,1,1,'#ffd600'],[boxG(.5,.05,.2),.7,.5,0,0,0,0,1,1,1,'#ffd600']]),vc,swings);
  if(slides.length)instanced(mergeParts([[boxG(1,1.5,1),0,.75,0,0,0,0,1,1,1,'#1e88e5'],[boxG(.6,.05,2.6),0,.8,1.6,-.55,0,0,1,1,1,'#ffb300']]),vc,slides);
  for(const q of benches)obstAdd(q[0],q[2],q[0],q[2],.4);
  return{parks:n,trees:trees.length,palms:palms.length,benches:benches.length}}

/* ---- hitos kilométricos y hectométricos ----
   A-7: PK 798 y PK 800 según los enlaces de OpenStreetMap; el resto se reparte a lo largo de la traza.
   A-1051 (Autovía de Roquetas) y A-391: el PK 0 está en su arranque, junto a la A-7. */
function pkTex(txt,small){const c=cvs(128,small?96:192),g=c.getContext('2d');const W=c.width,Hh=c.height;g.fillStyle='#ffffff';g.fillRect(0,0,W,Hh);g.fillStyle='#0b4ea2';g.fillRect(6,6,W-12,Hh-12);g.fillStyle='#ffffff';g.textAlign='center';g.textBaseline='middle';
  let fs=small?44:66;g.font=`900 ${fs}px Arial`;while(g.measureText(txt).width>W-20&&fs>18){fs-=2;g.font=`900 ${fs}px Arial`}g.fillText(txt,W/2,Hh/2+2);const t=tex(c);return t}
function buildPK(){const out={km:0,hm:0};const pathsOf=nm=>ROADPATHS.filter(r=>r.cls===0&&WD.names[r.name]===nm);
  const kmMat={},put=(x,z,yaw,txt,km)=>{const y=H(x,z);const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=yaw;
    const post=new THREE.Mesh(hc(km?'pkpost':'hmpost',()=>new THREE.BoxGeometry(km?.08:.06,km?1.1:.8,km?.08:.06)),M(0xdddddd));post.position.y=km?.55:.4;g.add(post);
    const m=kmMat[txt]||(kmMat[txt]=new THREE.MeshLambertMaterial({map:pkTex(txt,!km)}));const pl=new THREE.Mesh(hc(km?'pkpl':'hmpl',()=>new THREE.PlaneGeometry(km?.5:.36,km?.75:.27)),m);pl.position.set(0,km?1.25:.86,.05);g.add(pl);
    const back=new THREE.Mesh(hc(km?'pkbk':'hmbk',()=>new THREE.PlaneGeometry(km?.5:.36,km?.75:.27)),m);back.position.set(0,km?1.25:.86,-.05);back.rotation.y=Math.PI;g.add(back);scene.add(g);obstAdd(x,z,x,z,.15);km?out.km++:out.hm++};
  // recorre una traza ordenada y pone hitos desde un punto de referencia (s0 = PK en metros) en el sentido dado
  const place=(P,hw,s0Fn)=>{let s=0;for(let i=0;i<P.length/2-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);if(L<.01)continue;const dx=(bx-ax)/L,dz=(bz-az)/L;
      for(let t=0;t<L;t+=1){const pk=s0Fn(s+t);if(pk<0)continue;const prev=s0Fn(s+t-1);if(Math.floor(pk/100)!==Math.floor(prev/100)){const hmv=Math.round(pk/100);const km=hmv%10===0;const o=hw+1.8+(km?.3:0);
        for(const sd of [1]){const x=ax+dx*t-dz*o*sd,z=az+dz*t+dx*o*sd;if(blockedAt(x,z,.3)||!roadFree(x,z,.5))continue;put(x,z,Math.atan2(dx,dz)+(sd>0?0:Math.PI),km?String(hmv/10):((hmv/10)|0)+'.'+(hmv%10),km)}}}s+=L}};
  // A-7: proyecta las dos referencias sobre cada calzada y reparte el PK linealmente
  const A7=pathsOf('Autovía del Mediterráneo');const ref=PKD.a7;
  for(const r of A7){const P=r.P;const proj=(x,z)=>{let best=1e9,bs=0,s=0;for(let i=0;i<P.length/2-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);const d=distSeg(x,z,ax,az,bx,bz);if(d<best){best=d;const t=L?clamp(((x-ax)*(bx-ax)+(z-az)*(bz-az))/(L*L),0,1):0;bs=s+t*L}s+=L}return bs};
    // dirección del PK en este tramo: comparando con la recta entre las dos referencias
    const ux=ref[1][1]-ref[0][1],uz=ref[1][2]-ref[0][2],UL=Math.hypot(ux,uz);const pkAt=(x,z)=>ref[0][0]*1000+((x-ref[0][1])*ux+(z-ref[0][2])*uz)/UL*((ref[1][0]-ref[0][0])*1000/UL);
    const s0=pkAt(P[0],P[1]),s1=pkAt(P[P.length-2],P[P.length-1]),Ltot=(()=>{let L=0;for(let i=0;i<P.length/2-1;i++)L+=Math.hypot(P[i*2+2]-P[i*2],P[i*2+3]-P[i*2+1]);return L})();if(Ltot<50)continue;
    place(P,r.hw,s=>s0+(s1-s0)*s/Ltot)}
  // A-1051 y A-391: PK 0 en su arranque
  for(const [ref0,x0,z0] of PKD.zero){const nm=ref0==='A-1051'?'Autovía de Roquetas':null;const rs=nm?pathsOf(nm):ROADPATHS.filter(r=>r.cls<=2&&distToRoad(r,x0,z0)<15);
    for(const r of rs){const P=r.P;const d0=Math.hypot(P[0]-x0,P[1]-z0),d1=Math.hypot(P[P.length-2]-x0,P[P.length-1]-z0);if(Math.min(d0,d1)>1500)continue;const Q=d0<=d1?P:(()=>{const q=[];for(let i=P.length-2;i>=0;i-=2)q.push(P[i],P[i+1]);return q})();
      const base=Math.min(d0,d1);place(Q,r.hw,s=>base+s)}}
  return out}

let _WN=null;function walkNear(x,z){if(!_WN){_WN=new Map();for(const rp of ROADPATHS){if(rp.cls<6||rp.cls>7)continue;const P=rp.P,seen=new Set();for(let i=0;i<P.length;i+=2){const k=Math.floor(P[i+1]/40)*1000+Math.floor(P[i]/40);if(seen.has(k))continue;seen.add(k);(_WN.get(k)||_WN.set(k,[]).get(k)).push(rp)}}}
  const o=new Set(),gx=Math.floor(x/40),gz=Math.floor(z/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=_WN.get((gz+a)*1000+gx+b);if(l)for(const r of l)o.add(r)}for(const r of roadsNear(x,z))o.add(r);return o}

/* ============ AJUSTE FINO DEL TERRENO ============
   El suelo es una malla de 9-13 m y las calles, aceras y parques se apoyan sobre él con sus propios vértices: entre vértice y vértice
   el terreno (con sus pliegues) asomaba por encima del asfalto en cientos de sitios («bugs de terreno»).
   Aquí se calcula, para cada vértice del suelo que queda debajo de una de esas capas, la altura exacta de la capa en ese punto
   y se baja el suelo dibujado justo por debajo. La física (H) no cambia, así que los coches siguen a la misma altura. */
const CARVED=[];function carveGround(){const n=TG.nx,m=TG.nz,cap=new Float32Array(n*m).fill(1e9);let tris=0;
  for(const L of OVL){const p=L.p,I=L.i;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;const ax=p[a],ay=p[a+1],az=p[a+2],bx=p[b],by=p[b+1],bz=p[b+2],cx=p[c],cy=p[c+1],cz=p[c+2];
    const d=(bz-cz)*(ax-cx)+(cx-bx)*(az-cz);if(Math.abs(d)<1e-6)continue;tris++;
    const i0=Math.max(0,Math.ceil(Math.min(ax,bx,cx)/GS)),i1=Math.min(n-1,Math.floor(Math.max(ax,bx,cx)/GS)),j0=Math.max(0,Math.ceil(Math.min(az,bz,cz)/GS)),j1=Math.min(m-1,Math.floor(Math.max(az,bz,cz)/GS));
    for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const x=i*GS,z=j*GS;const l1=((bz-cz)*(x-cx)+(cx-bx)*(z-cz))/d,l2=((cz-az)*(x-cx)+(ax-cx)*(z-cz))/d,l3=1-l1-l2;if(l1<-1e-4||l2<-1e-4||l3<-1e-4)continue;
      const y=l1*ay+l2*by+l3*cy-.06,k=j*n+i;if(y<cap[k])cap[k]=y}}}
  /* 2º paso: la rejilla del suelo (6 m) es más gruesa que las aceras y calzadas; aunque sus vértices queden por debajo, el triángulo del
     suelo puede asomar ENTRE ellos (montículos y cuñas de tierra sobre la acera). Se mira la superficie de cada triángulo cada ~1,5 m y,
     donde el suelo asoma (hasta 1,5 m; más es una senda de monte sobre ladera, que no se toca), se bajan los vértices de esa celda
     (como mucho 3 m por vértice, para no abrir zanjas) */
  const M=new Float32Array(n*m);for(const T of GTILES){const P=T.g.attributes.position.array;for(let j=0;j<T.h;j++)for(let i=0;i<T.w;i++){const k=(T.tj+j)*n+T.ti+i;M[k]=Math.min(P[(j*T.w+i)*3+1],cap[k])}}
  let fixed=0;const M0=M.slice();
  for(let pass=0;pass<4;pass++){let nf=0;for(const L of OVL){const p=L.p,I=L.i;for(let t=0;t<I.length;t+=3){const a=I[t]*3,b=I[t+1]*3,c=I[t+2]*3;
      const e1=Math.hypot(p[a]-p[b],p[a+2]-p[b+2]),e2=Math.hypot(p[b]-p[c],p[b+2]-p[c+2]),e3=Math.hypot(p[c]-p[a],p[c+2]-p[a+2]),N=Math.min(12,Math.max(1,Math.ceil(Math.max(e1,e2,e3)/1.5)));
      for(let u=0;u<=N;u++)for(let v=0;v<=N-u;v++){const l1=u/N,l2=v/N,l3=1-l1-l2,x=p[a]*l1+p[b]*l2+p[c]*l3,z=p[a+2]*l1+p[b+2]*l2+p[c+2]*l3,ty=p[a+1]*l1+p[b+1]*l2+p[c+1]*l3-.06;
        const fx=x/GS,fz=z/GS,i=Math.floor(fx),j=Math.floor(fz);if(i<0||j<0||i>=n-1||j>=m-1)continue;const uu=fx-i,ww=fz-j;
        const V=uu+ww<=1?[[j*n+i,1-uu-ww],[j*n+i+1,uu],[(j+1)*n+i,ww]]:[[(j+1)*n+i+1,uu+ww-1],[(j+1)*n+i,1-uu],[j*n+i+1,1-ww]];
        let y=0;for(const [k,wt] of V)y+=M[k]*wt;const e=y-ty;if(e<=.02||e>1.5)continue;
        let ws=0;for(const [k,wt] of V)if(M[k]>ty&&wt>.02)ws+=wt;if(!ws)continue;for(const [k,wt] of V)if(M[k]>ty&&wt>.02)M[k]=Math.max(ty,M0[k]-3,M[k]-e/ws);nf++}}}
    fixed+=nf;if(!nf)break}
  let deep=0;for(let k=0;k<n*m;k++)if(M0[k]-M[k]>1)deep++;
  let moved=0,maxd=0;
  for(const T of GTILES){const P=T.g.attributes.position.array;let ch=false;for(let j=0;j<T.h;j++)for(let i=0;i<T.w;i++){const k=(T.tj+j)*n+T.ti+i,q=(j*T.w+i)*3+1;if(P[q]>M[k]+1e-4){maxd=Math.max(maxd,P[q]-M[k]);if(P[q]-M[k]>.2)CARVED.push([P[q-1],P[q+1],+(P[q]-M[k]).toFixed(2)]);P[q]=M[k];ch=true;moved++}}
    if(ch){T.g.attributes.position.needsUpdate=true;T.g.computeVertexNormals();T.g.computeBoundingSphere()}}
  return{tris,moved,maxd:+maxd.toFixed(2),fixed,deep}}
