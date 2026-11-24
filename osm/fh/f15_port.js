
/* ============ PUERTO DEPORTIVO DE AGUADULCE (datos reales de OpenStreetMap) ============
   muelles de hormigón con cantil vertical, norays y farolas; dique de abrigo con espaldón y escollera;
   balizas verde y roja de la bocana; torre de control; barreras del aparcamiento; varadero con barcos en cunas y pórtico elevador */
const PORTD=__PORT__;
function portPaint(g){if(!PORTD.marina)return;const P=(pts)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(p[0]*8,p[1]*8):g.moveTo(p[0]*8,p[1]*8));g.closePath()};
  g.fillStyle='#c9c5bc';P(PORTD.marina);g.fill();g.fillStyle='#bdb8ae';for(const y of PORTD.yard){P(y);g.fill()}
  for(const pk of PORTD.park){g.fillStyle='#505257';P(pk);g.fill();g.save();P(pk);g.clip();// plazas pintadas en blanco
    let bx=0,bz=0,L=0;for(let i=0;i<pk.length-1;i++){const dx=pk[i+1][0]-pk[i][0],dz=pk[i+1][1]-pk[i][1],l=Math.hypot(dx,dz);if(l>L){L=l;bx=dx/l;bz=dz/l}}
    const cx=pk.reduce((a,p)=>a+p[0],0)/pk.length,cz=pk.reduce((a,p)=>a+p[1],0)/pk.length;g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=1.2;
    for(let s=-40;s<=40;s+=2.5){for(const o of [-2.6,2.6]){const x=cx+bx*s-bz*o,z=cz+bz*s+bx*o;g.beginPath();g.moveTo((x-bz*2.4)*8,(z+bx*2.4)*8);g.lineTo(x*8,z*8);g.stroke()}}
    g.beginPath();g.moveTo((cx-bx*40)*8,(cz-bz*40)*8);g.lineTo((cx+bx*40)*8,(cz+bz*40)*8);g.stroke();g.restore()}}
function buildPort(){if(!PORTD.marina)return{};const deck=buildDeck();const vc=new THREE.MeshLambertMaterial({vertexColors:true});const st={q:0,bol:0,rock:0,lamp:0};
  const M_=PORTD.marina,mcx=M_.reduce((a,p)=>a+p[0],0)/M_.length,mcz=M_.reduce((a,p)=>a+p[1],0)/M_.length;
  const wallG={p:[],i:[]},coping={p:[],i:[]},bol=[],lamps=[],rocks=[],rockC=[];
  const quadW=(G,x0,z0,x1,z1,ya,yb)=>{const v=G.p.length/3;G.p.push(x0,ya,z0,x1,ya,z1,x1,yb,z1,x0,yb,z0);G.i.push(v,v+1,v+2,v,v+2,v+3)};
  // cantil del muelle: allí donde el borde del puerto toca el agua
  const CL=PORTD.water.slice(0,-2);for(let i=0;i<CL.length-1;i++){const a=CL[i],b=CL[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.3)continue;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L,nx=-dz,nz=dx;
    for(let t=0;t<L;t+=2){const t1=Math.min(L,t+2),x0=a[0]+dx*t,z0=a[1]+dz*t,x1=a[0]+dx*t1,z1=a[1]+dz*t1,mx=(x0+x1)/2,mz=(z0+z1)/2;
      if(pmAt(mx-nx*1.2,mz-nz*1.2)!==1)continue;const sg=1;// el agua queda a la derecha de la línea de costa
      const yl=PDECK-.1;quadW(wallG,x0,z0,x1,z1,-3,yl+.12);st.q++;
      // albardilla de hormigón
      const v=coping.p.length/3,ox=-nx*sg*.5,oz=-nz*sg*.5;coping.p.push(x0,yl+.13,z0,x1,yl+.13,z1,x1+ox,yl+.13,z1+oz,x0+ox,yl+.13,z0+oz);coping.i.push(v,v+1,v+2,v,v+2,v+3);
      const k=Math.round(t/2);if(k%4===0){bol.push([mx-nx*sg*.45,yl+.12,mz-nz*sg*.45,0]);obstAdd(mx-nx*sg*.45,mz-nz*sg*.45,mx-nx*sg*.45,mz-nz*sg*.45,.15)}
      if(k%14===7&&!blockedAt(mx-nx*sg*2.2,mz-nz*sg*2.2,.4))lamps.push([mx-nx*sg*2.2,yl+.12,mz-nz*sg*2.2,Math.atan2(nx*sg,nz*sg)])}}
  const mk=(G,mat)=>{if(!G.i.length)return;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setIndex(G.i);g.computeVertexNormals();const m=new THREE.Mesh(g,mat);m.receiveShadow=HQ;scene.add(m);return m};
  mk(wallG,new THREE.MeshLambertMaterial({color:0x9b978f,side:THREE.DoubleSide}));mk(coping,new THREE.MeshLambertMaterial({color:0xe4e0d8,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-2}));
  // dique de abrigo: espaldón (muro) hacia mar abierto y escollera de bloques
  const D=PORTD.dike;if(D){const esp={p:[],i:[]};const R=lcg(4242);
    for(let i=0;i<D.length-1;i++){const a=D[i],b=D[i+1],L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.5)continue;const dx=(b[0]-a[0])/L,dz=(b[1]-a[1])/L;let nx=-dz,nz=dx;const mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
      {const w1=portWater(mx+nx*8,mz+nz*8)||isSea(mx+nx*8,mz+nz*8),w2=portWater(mx-nx*8,mz-nz*8)||isSea(mx-nx*8,mz-nz*8);if(w1&&w2){if((mx+nx-mcx)**2+(mz+nz-mcz)**2<(mx-mcx)**2+(mz-mcz)**2){nx=-nx;nz=-nz}}else if(w2){nx=-nx;nz=-nz}else if(!w1){if((mx+nx-mcx)**2+(mz+nz-mcz)**2<(mx-mcx)**2+(mz-mcz)**2){nx=-nx;nz=-nz}}}// hacia el mar abierto
      const o=2.6,y=Math.max(1,H(mx,mz));
      const x0=a[0]+nx*o,z0=a[1]+nz*o,x1=b[0]+nx*o,z1=b[1]+nz*o;quadW(esp,x0,z0,x1,z1,y-.2,y+1.9);quadW(esp,x0+nx*.7,z0+nz*.7,x1+nx*.7,z1+nz*.7,-1,y+1.9);
      const v=esp.p.length/3;esp.p.push(x0,y+1.9,z0,x1,y+1.9,z1,x1+nx*.7,y+1.9,z1+nz*.7,x0+nx*.7,y+1.9,z0+nz*.7);esp.i.push(v,v+1,v+2,v,v+2,v+3);obstAdd(x0,z0,x1,z1,.4);
      for(let t=0;t<L;t+=1.6)for(let d=4;d<13;d+=1.7){if(R()<.15)continue;const x=a[0]+dx*t+nx*d+(R()-.5),z=a[1]+dz*t+nz*d+(R()-.5);const yy=y+.8-(d-4)*.42+(R()-.5)*.5;
        if(pmAt(x,z)===1||blockedAt(x,z,.5))continue;rocks.push([x,yy,z,R()*TAU,1+R()*.9,0,0,R()*1.5]);const g=.5+R()*.18;rockC.push(new THREE.Color(g,g*.97,g*.92))}}
    mk(esp,new THREE.MeshLambertMaterial({color:0xcfcbc2,side:THREE.DoubleSide}))}
  st.rock=rocks.length;st.bol=bol.length;st.lamp=lamps.length;
  if(rocks.length)instanced(hc('rock',()=>{const g=new THREE.DodecahedronGeometry(.95,0);g.scale(1.1,.75,.95);return g}),new THREE.MeshLambertMaterial({color:0xffffff}),rocks,rockC);
  instanced(mergeParts([[cylG(.13,.16,.45,8),0,.22,0,0,0,0,1,1,1,'#2b2d30'],[cylG(.2,.2,.07,8),0,.47,0,0,0,0,1,1,1,'#2b2d30']]),vc,bol);
  instanced(mergeParts([[cylG(.07,.1,6,6),0,3,0,0,0,0,1,1,1,'#e9e9e6'],[boxG(.12,.1,1.2),0,6,.55,0,0,0,1,1,1,'#e9e9e6'],[boxG(.32,.14,.55),0,5.93,1.05,0,0,0,1,1,1,'#f4f1e6']]),vc,lamps);
  // balizas de la bocana: verde en el morro del dique, roja enfrente
  const beacon=(p,col,emi)=>{const y=Math.max(0,H(p[0],p[1]));const g=new THREE.Group();g.position.set(p[0],y,p[1]);
    const add=(geo,m,yy)=>{const e=new THREE.Mesh(geo,m);e.position.y=yy;e.castShadow=HQ;g.add(e)};add(new THREE.CylinderGeometry(1.6,2.2,3.5,14),M(0xbdb8ae),y>.5?.5:-.75);
    add(new THREE.CylinderGeometry(.75,.9,6,14),M(0xf4f4f0),4);for(const yy of [2.2,4.6])add(new THREE.CylinderGeometry(.8,.8,.7,14),M(col),yy);
    add(new THREE.CylinderGeometry(.5,.5,.9,10),new THREE.MeshBasicMaterial({color:emi}),7.4);add(new THREE.ConeGeometry(.62,.5,10),M(col),8.1);scene.add(g)};
  beacon(PORTD.tip,0x1f8a3a,0x5cff8a);beacon(PORTD.red,0xc62828,0xff5a4a);
  // torre de control del puerto
  if(PORTD.tower){const p=PORTD.tower,y=H(p[0],p[1]);const g=new THREE.Group();g.position.set(p[0],y,p[1]);const add=(geo,m,yy)=>{const e=new THREE.Mesh(geo,m);e.position.y=yy;e.castShadow=HQ;e.receiveShadow=HQ;g.add(e)};
    add(new THREE.CylinderGeometry(2.2,2.5,17,18),M(0xf2efe8),8.5);add(new THREE.CylinderGeometry(3.4,3.4,.35,20),M(0xd8d4cc),17.2);
    add(new THREE.CylinderGeometry(3,3,2.4,20),new THREE.MeshStandardMaterial({color:0x2c4a5e,roughness:.1,metalness:.8,envMap:envMap||null,transparent:true,opacity:.85}),18.6);
    add(new THREE.CylinderGeometry(3.5,3.5,.3,20),M(0xd8d4cc),19.95);add(new THREE.CylinderGeometry(.06,.06,5,6),M(0xdddddd),22.5);scene.add(g);obstAdd(p[0],p[1],p[0],p[1],2.6)}
  // barreras de acceso al puerto
  for(const p of PORTD.gates){const y=H(p[0],p[1]);const g=new THREE.Group();g.position.set(p[0]+1.6,y,p[1]);const post=new THREE.Mesh(new THREE.BoxGeometry(.35,1.05,.35),M(0xd9d9d6));post.position.y=.52;g.add(post);
    const boom=new THREE.Mesh(new THREE.BoxGeometry(.09,.09,3.4),M(0xf2f2f2));boom.position.set(0,.95,-1.7);g.add(boom);for(let k=0;k<4;k++){const s=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.4),M(0xd32f2f));s.position.set(0,.95,-.5-k*.8);g.add(s)}scene.add(g)}
  // varadero: barcos en cunas y pórtico elevador
  const yb=[],ybC=[],cr=[];const R2=lcg(99);for(const Y of PORTD.yard){const cx=Y.reduce((a,p)=>a+p[0],0)/Y.length,cz=Y.reduce((a,p)=>a+p[1],0)/Y.length;
    let bx=0,bz=0,L=0;for(let i=0;i<Y.length-1;i++){const dx=Y[i+1][0]-Y[i][0],dz=Y[i+1][1]-Y[i][1],l=Math.hypot(dx,dz);if(l>L){L=l;bx=dx/l;bz=dz/l}}
    for(let k=-3;k<=3;k++)for(const o of [-5,5]){const x=cx+bx*k*7+(-bz)*o,z=cz+bz*k*7+bx*o;if(!inPoly(Y,x,z)||blockedAt(x,z,3))continue;const y=H(x,z);yb.push([x,y+1.25,z,Math.atan2(-bz,bx)+(R2()<.5?0:Math.PI),.85+R2()*.4]);ybC.push(new THREE.Color(['#ffffff','#f4f4f4','#1d3d6b','#ffffff','#c0392b'][Math.floor(R2()*5)]));cr.push([x,y,z,Math.atan2(-bz,bx)])}
    const lx=cx-bx*L*.42,lz=cz-bz*L*.42,ly=H(lx,lz);const tl=new THREE.Group();tl.position.set(lx,ly,lz);tl.rotation.y=Math.atan2(bx,bz);const bl=M(0x1565c0);
    for(const a of [-3,3])for(const b of [-4,4]){const l=new THREE.Mesh(new THREE.BoxGeometry(.4,7,.4),bl);l.position.set(a,3.5,b);tl.add(l)}for(const a of [-3,3]){const t=new THREE.Mesh(new THREE.BoxGeometry(.5,.6,8.6),bl);t.position.set(a,7,0);tl.add(t)}
    const tb=new THREE.Mesh(new THREE.BoxGeometry(6.5,.5,.5),bl);tb.position.set(0,7,-4);tl.add(tb);for(const w of [[-3,-4],[3,-4],[-3,4],[3,4]]){const wh=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.4,12),M(0x222222));wh.rotation.z=Math.PI/2;wh.position.set(w[0],.45,w[1]);tl.add(wh)}scene.add(tl)}
  const hull=new THREE.Shape();hull.moveTo(0,-4);hull.quadraticCurveTo(1.4,-1,1.3,3);hull.lineTo(-1.3,3);hull.quadraticCurveTo(-1.4,-1,0,-4);const hg=new THREE.ExtrudeGeometry(hull,{depth:1.6,bevelEnabled:false});hg.rotateX(Math.PI/2);hg.translate(0,.2,0);
  instanced(mergeParts([[hg,0,0,0,0,Math.PI,0,1,1,1,'#ffffff'],[boxG(1.6,.7,2.2),0,.6,.4,0,0,0,1,1,1,'#e9eef0'],[boxG(2.6,.12,.4),0,-1.3,0,0,0,0,1,1,1,'#2b5fa8']]),vc,yb,ybC);
  instanced(mergeParts([[boxG(.25,1.2,.25),-.9,.6,-1.6,0,0,0,1,1,1,'#2b5fa8'],[boxG(.25,1.2,.25),.9,.6,-1.6,0,0,0,1,1,1,'#2b5fa8'],[boxG(.25,1.2,.25),-.9,.6,1.6,0,0,0,1,1,1,'#2b5fa8'],[boxG(.25,1.2,.25),.9,.6,1.6,0,0,0,1,1,1,'#2b5fa8']]),vc,cr);
  st.yard=yb.length;st.deck=deck;st.shops=buildPortShops();return st}
function inPoly(P,x,z){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])c=!c}return c}
/* explanada del puerto: losa de hormigón plana a cota fija sobre toda la tierra del recinto (máscara de 1 m),
   con la dársena honda debajo; así el borde del agua es exactamente el cantil del muelle y no los dientes de sierra del terreno */
let PMASK=null,PWM=null;const PDECK=1.5;
function portWater(x,z){const P=PWM;if(P){const c=Math.floor(x-P.x0),r=Math.floor(z-P.z0);if(c>=0&&r>=0&&c<P.W&&r<P.H)return P.m[r*P.W+c]===1}return isSea(x,z)}
function scanMask(polys,x0,z0,W,Hh,init){const m=init||new Uint8Array(W*Hh);for(let r=0;r<Hh;r++){const z=z0+r+.5;const xs=[];for(const P of polys)for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a[1]>z)!==(b[1]>z))xs.push(a[0]+(z-a[1])*(b[0]-a[0])/(b[1]-a[1]))}xs.sort((p,q)=>p-q);
  for(let k=0;k+1<xs.length;k+=2){const c0=Math.max(0,Math.ceil(xs[k]-x0-.5)),c1=Math.min(W-1,Math.floor(xs[k+1]-x0-.5));for(let c=c0;c<=c1;c++)m[r*W+c]=1}}return m}
function flattenPort(){if(!PORTD.marina)return;const polys=[PORTD.marina,...PORTD.yard];let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const P of polys)for(const p of P){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1])}
  x0=Math.floor(x0)-30;z0=Math.floor(z0)-30;const W=Math.ceil(x1-x0)+60,Hh=Math.ceil(z1-z0)+60;
  // tierra del puerto = toda la franja a menos de 22 m del agua, que no sea playa ni cuesta arriba
  const wm0=scanMask([PORTD.water],x0,z0,W,Hh),bm=scanMask(PORTD.beach||[],x0,z0,W,Hh),inz=scanMask(polys,x0,z0,W,Hh);const dist=new Float32Array(W*Hh);for(let k=0;k<dist.length;k++)dist[k]=wm0[k]?0:1e9;
  for(let r=0;r<Hh;r++)for(let c=0;c<W;c++){const k=r*W+c;let v=dist[k];if(c>0)v=Math.min(v,dist[k-1]+1);if(r>0){v=Math.min(v,dist[k-W]+1);if(c>0)v=Math.min(v,dist[k-W-1]+1.414);if(c<W-1)v=Math.min(v,dist[k-W+1]+1.414)}dist[k]=v}
  for(let r=Hh-1;r>=0;r--)for(let c=W-1;c>=0;c--){const k=r*W+c;let v=dist[k];if(c<W-1)v=Math.min(v,dist[k+1]+1);if(r<Hh-1){v=Math.min(v,dist[k+W]+1);if(c<W-1)v=Math.min(v,dist[k+W+1]+1.414);if(c>0)v=Math.min(v,dist[k+W-1]+1.414)}dist[k]=v}
  const land=new Uint8Array(W*Hh);for(let r=0;r<Hh;r++)for(let c=0;c<W;c++){const k=r*W+c;if(wm0[k]||bm[k])continue;const x=x0+c+.5,z=z0+r+.5;if(inz[k]||(dist[k]<=35&&H(x,z)<7.5&&!mainRoad(x,z)))land[k]=1}
  // agua según la línea de costa detallada de OpenStreetMap (no el contorno grueso del mar)
  PWM={x0,z0,W,H:Hh,m:wm0};
  PMASK={x0,z0,W,H:Hh,m:land};
  // terreno: todo lo que cae dentro del recinto, al fondo (la losa lo tapa en tierra y el agua en la dársena); bajo las calles principales (mainRoad) que no son explanada no se rebaja
  const n=TG.nx,h=TG.h;for(let j=Math.max(0,Math.floor((z0-GS)/GS));j<=Math.min(TG.nz-1,Math.ceil((z0+Hh+GS)/GS));j++)for(let i=Math.max(0,Math.floor((x0-GS)/GS));i<=Math.min(n-1,Math.ceil((x0+W+GS)/GS));i++){const x=i*GS,z=j*GS;
    if(pmAt(x,z)!==-1&&!(pmAt(x,z)!==1&&mainRoad(x,z))&&!(PORTD.beach||[]).some(P=>inPoly(P,x,z))){let nearLand=false,nearSea=false;for(let dz=-GS;dz<=GS;dz+=GS/2)for(let dx=-GS;dx<=GS;dx+=GS/2){const v=pmAt(x+dx,z+dz);if(v===1)nearLand=true;else if(portWater(x+dx,z+dz))nearSea=true}
      h[j*n+i]=nearLand?(nearSea?-4:PDECK-.3):nearSea&&portWater(x,z)?-4:h[j*n+i]}}
  // transición suave: el terreno de alrededor baja en rampa hasta la explanada (sin escalones ni cuestas raras)
  const BAND=22;for(let j=Math.max(0,Math.floor((z0-BAND)/GS));j<=Math.min(TG.nz-1,Math.ceil((z0+Hh+BAND)/GS));j++)for(let i=Math.max(0,Math.floor((x0-BAND)/GS));i<=Math.min(n-1,Math.ceil((x0+W+BAND)/GS));i++){const x=i*GS,z=j*GS,k=j*n+i;
    if(pmAt(x,z)===1||portWater(x,z)||mainRoad(x,z))continue;if(PORTD.beach&&PORTD.beach.some(P=>inPoly(P,x,z)))continue;let d=1e9;
    for(let dz=-BAND;dz<=BAND;dz+=2)for(let dx=-BAND;dx<=BAND;dx+=2){if(pmAt(x+dx,z+dz)===1){const e=Math.hypot(dx,dz);if(e<d)d=e}}
    if(d<BAND){const t=d/BAND,e=t*t*(3-2*t);h[k]=PDECK*(1-e)+h[k]*e}}}
let _MR=null;function mainRoad(x,z){if(!_MR){_MR=[];const P=PORTD.marina;let a0=1e9,a1=-1e9,b0=1e9,b1=-1e9;for(const p of P){a0=Math.min(a0,p[0]);a1=Math.max(a1,p[0]);b0=Math.min(b0,p[1]);b1=Math.max(b1,p[1])}
  for(const r of WD.roads){if(r[0]>3)continue;for(let i=5;i<r.length-2;i+=2){const ax=r[i]*K,az=r[i+1]*K,bx=r[i+2]*K,bz=r[i+3]*K;if(Math.max(ax,bx)<a0-80||Math.min(ax,bx)>a1+80||Math.max(az,bz)<b0-80||Math.min(az,bz)>b1+80)continue;_MR.push([ax,az,bx,bz,r[1]*K/2])}}}
  for(const s of _MR)if(distSeg(x,z,s[0],s[1],s[2],s[3])<s[4]+5)return true;return false}
function pmAt(x,z){const P=PMASK;if(!P)return-1;const c=Math.floor(x-P.x0),r=Math.floor(z-P.z0);if(c<0||r<0||c>=P.W||r>=P.H)return-1;return P.m[r*P.W+c]}
function buildDeck(){const P=PMASK;if(!P)return 0;const G={p:[],u:[],i:[]};let n=0;
  for(let r=0;r<P.H;r++){let c=0;while(c<P.W){if(!P.m[r*P.W+c]){c++;continue}let e=c;while(e<P.W&&P.m[r*P.W+e])e++;const xa=P.x0+c,xb=P.x0+e,za=P.z0+r,zb=za+1;const v=G.p.length/3;
    G.p.push(xa,PDECK,za,xb,PDECK,za,xb,PDECK,zb,xa,PDECK,zb);G.u.push(xa/4,za/4,xb/4,za/4,xb/4,zb/4,xa/4,zb/4);G.i.push(v,v+2,v+1,v,v+3,v+2);n++;c=e}}
  // muro de contención donde la explanada linda con terreno más alto
  const WG={p:[],i:[]};const wq=(xa,za,xb,zb,y1)=>{const v=WG.p.length/3;WG.p.push(xa,PDECK-.05,za,xb,PDECK-.05,zb,xb,y1,zb,xa,y1,za);WG.i.push(v,v+1,v+2,v,v+2,v+3)};
  for(let r=0;r<P.H;r++)for(let c=0;c<P.W;c++){if(!P.m[r*P.W+c])continue;const x=P.x0+c,z=P.z0+r;
    for(const [dc,dr,xa,za,xb,zb] of [[1,0,x+1,z,x+1,z+1],[-1,0,x,z,x,z+1],[0,1,x,z+1,x+1,z+1],[0,-1,x,z,x+1,z]]){const cc=c+dc,rr=r+dr;if(cc>=0&&rr>=0&&cc<P.W&&rr<P.H&&P.m[rr*P.W+cc])continue;const xn=x+.5+dc,zn=z+.5+dr;if(portWater(xn,zn))continue;const yn=H(xn,zn);if(yn>PDECK+99)wq(xa,za,xb,zb,yn+.05)}}
  if(WG.i.length){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(WG.p,3));g.setIndex(WG.i);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({color:0xd8cdb8,side:THREE.DoubleSide}));m.receiveShadow=HQ;scene.add(m)}
  const t=tileTex(256,256,(g,w,h)=>{g.fillStyle='#cfccc6';g.fillRect(0,0,w,h);for(let i=0;i<4000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(0,0,0,${Math.random()*.08})`:`rgba(255,255,255,${Math.random()*.08})`;g.fillRect(Math.random()*w,Math.random()*h,2,2)}
    g.strokeStyle='rgba(60,55,50,.35)';g.lineWidth=2;for(let k=0;k<=w;k+=128){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.moveTo(0,k);g.lineTo(w,k);g.stroke()}for(let i=0;i<6;i++){g.fillStyle='rgba(70,60,50,.07)';g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,10+Math.random()*30,8+Math.random()*20,0,0,TAU);g.fill()}});
  OVL.push({p:G.p,i:G.i});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(G.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(G.u,2));g.setIndex(G.i);g.computeVertexNormals();
  const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({map:t}));m.receiveShadow=HQ;scene.add(m);return n}
/* ============ LOCALES DEL PUERTO tal como son (referencia: fotos de calle de Mapillary, abril 2024) ============
   edificio blanco de estilo andaluz con soportales de arcos de medio punto; delante, en el muelle, los cerramientos
   de cada local: pérgola de lona crema con postes de madera (Mala Fama…), estructura roja (Rock and Ola), lona verde
   con ventanas (La Terraza del Puerto), banda azul marino (Sportnautica)… con su rótulo y sus mesas */
function portBld(x,z){if(!PMASK)return false;for(const [dx,dz] of [[0,0],[14,0],[-14,0],[0,14],[0,-14],[10,10],[-10,-10],[10,-10],[-10,10]])if(pmAt(x+dx,z+dz)===1)return true;return false}
function shopSignTex(txt,bg,fg){const W=1024,Hh=160,c=cvs(W,Hh),g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,W,Hh);let fs=112;const F=s=>`900 ${s}px "Arial Black",Arial`;g.font=F(fs);while(g.measureText(txt).width>W-60&&fs>28){fs-=3;g.font=F(fs)}
  g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(0,0,0,.35)';g.fillText(txt,W/2+3,Hh/2+5);g.fillStyle=fg;g.fillText(txt,W/2,Hh/2+2);const t=tex(c);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
function buildPortShops(){if(!PORTD.shops)return 0;const vc=new THREE.MeshLambertMaterial({vertexColors:true});const ENC={cream:['#7a5a3a','#efe6d2',null],red:['#d7262b','#2a2a2a','#d7262b'],green:['#1f4d32','#1f6b3e','#1f6b3e'],navy:['#1b2d5c','#1b2d5c',null],dark:['#2b2f33','#2b2f33',null],glass:['#d9dcdf','#e8ecef',null]};
  const posts=[],postC=[],tbl=[],chr=[],planters=[];let n=0;const used=new Set();
  // soportales: arcos blancos en las fachadas que dan al muelle
  const arch=hc('arcopanel',()=>{const s=new THREE.Shape();s.moveTo(-1.85,0);s.lineTo(1.85,0);s.lineTo(1.85,4.1);s.lineTo(-1.85,4.1);s.lineTo(-1.85,0);const h=new THREE.Path();h.moveTo(-1.35,0);h.lineTo(-1.35,2.25);h.absarc(0,2.25,1.35,Math.PI,0,true);h.lineTo(1.35,0);h.lineTo(-1.35,0);s.holes.push(h);const g=new THREE.ExtrudeGeometry(s,{depth:.45,bevelEnabled:false,curveSegments:10});g.translate(0,0,-.05);return g});
  const arches=[];for(const b of BL){if(!b.edges||b.kind===6||!portBld((b.x0+b.x1)/2,(b.z0+b.z1)/2))continue;b.portW=true;
    for(const e of b.edges){if(e.L<4.5||e.shared)continue;const mx=(e.a[0]+e.c[0])/2,mz=(e.a[1]+e.c[1])/2;if(pmAt(mx+e.nx*4,mz+e.nz*4)!==1||blockedAt(mx+e.nx*2,mz+e.nz*2,.3))continue;
      const ux=(e.c[0]-e.a[0])/e.L,uz=(e.c[1]-e.a[1])/e.L,k=Math.floor(e.L/3.7),off=(e.L-k*3.7)/2;for(let i=0;i<k;i++){const t=off+3.7*(i+.5);arches.push([e.a[0]+ux*t+e.nx*.06,b.hb,e.a[1]+uz*t+e.nz*.06,Math.atan2(e.nx,e.nz)])}e.portArc=true}}
  if(arches.length)instanced(arch,new THREE.MeshLambertMaterial({color:0xf7f6f2}),arches);
  for(const s of PORTD.shops){const [name,sx,sz,bg,fg,enc,kind]=s;// fachada más cercana que da al muelle
    let best=null,bd=30;const gx=Math.floor(sx/GC),gz=Math.floor(sz/GC);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const l=GBL[(gz+a)*GWc+gx+c];if(!l)continue;for(const b of l){if(!b.edges)continue;for(const e of b.edges){if(e.L<4||used.has(e))continue;const mx=(e.a[0]+e.c[0])/2,mz=(e.a[1]+e.c[1])/2;if(blockedAt(mx+e.nx*3,mz+e.nz*3,.3))continue;if(pmAt(mx+e.nx*5,mz+e.nz*5)!==1&&!e.street)continue;const d=distSeg(sx,sz,e.a[0],e.a[1],e.c[0],e.c[1]);if(d<bd){bd=d;best={b,e}}}}}
    if(!best)continue;const {b,e}=best;used.add(e);const L=e.L,ux=(e.c[0]-e.a[0])/L,uz=(e.c[1]-e.a[1])/L;let t=clamp((sx-e.a[0])*ux+(sz-e.a[1])*uz,4,L-4);const w=Math.min(L-1,9),D=enc==='glass'||enc==='navy'?0:3.6,y=b.hb,ry=Math.atan2(e.nx,e.nz);
    const P=(o,d)=>[e.a[0]+ux*(t+o)+e.nx*d,e.a[1]+uz*(t+o)+e.nz*d];const E=ENC[enc]||ENC.cream;
    const sm=new THREE.MeshLambertMaterial({map:shopSignTex(name,bg,fg),emissive:0xffffff,emissiveMap:null,emissiveIntensity:0});sm.emissiveMap=sm.map;sm.emissiveIntensity=.35;
    if(D>0){// cerramiento / pérgola delante del local
      for(const o of [-w/2,-w/4,0,w/4,w/2]){const p=P(o,D);posts.push([p[0],y,p[1],ry]);postC.push(new THREE.Color(E[0]))}
      const g=new THREE.Group();const c=P(0,D/2);g.position.set(c[0],y,c[1]);g.rotation.y=ry;
      const roof=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.08,D+.2),new THREE.MeshLambertMaterial({color:E[1]}));roof.position.set(0,2.85,0);roof.rotation.x=-.06;g.add(roof);
      const band=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.95,.12),new THREE.MeshLambertMaterial({color:bg}));band.position.set(0,3.2,D/2+.06);g.add(band);
      const sign=new THREE.Mesh(new THREE.PlaneGeometry(w,.85),sm);sign.position.set(0,3.2,D/2+.13);g.add(sign);
      if(E[2]){// lona o panel cerrado hasta media altura con ventanas
        for(const sd of [-1,1]){const side=new THREE.Mesh(new THREE.BoxGeometry(.05,2.75,D),new THREE.MeshLambertMaterial({color:E[2],transparent:true,opacity:.92}));side.position.set(sd*w/2,1.38,0);g.add(side)}
        const fr=new THREE.Mesh(new THREE.BoxGeometry(w,.95,.05),new THREE.MeshLambertMaterial({color:E[2]}));fr.position.set(0,.48,D/2);g.add(fr);
        const gl=new THREE.Mesh(new THREE.PlaneGeometry(w-.2,1.6),new THREE.MeshStandardMaterial({color:0x9fb8c4,roughness:.1,metalness:.3,transparent:true,opacity:.35,envMap:envMap||null}));gl.position.set(0,1.75,D/2+.02);g.add(gl)}
      else if(enc==='cream'){const val=new THREE.Mesh(new THREE.BoxGeometry(w+.3,.35,.04),new THREE.MeshLambertMaterial({color:E[1]}));val.position.set(0,2.62,D/2+.08);g.add(val)}
      scene.add(g);obstAdd(P(-w/2,D)[0],P(-w/2,D)[1],P(-w/2,D)[0],P(-w/2,D)[1],.2);obstAdd(P(w/2,D)[0],P(w/2,D)[1],P(w/2,D)[0],P(w/2,D)[1],.2);
      // mesas y sillas dentro
      for(let o=-w/2+1.2;o<=w/2-1;o+=2.2)for(const d of [1.1,2.6]){const p=P(o,d);tbl.push([p[0],y+.01,p[1],0]);chr.push([p[0]+ux*.55,y+.01,p[1]+uz*.55,ry+Math.PI/2],[p[0]-ux*.55,y+.01,p[1]-uz*.55,ry-Math.PI/2])}
      for(const o of [-w/2-.6,w/2+.6]){const p=P(o,.8);planters.push([p[0],y,p[1],ry])}}
    else{// rótulo de banda sobre el escaparate (tiendas)
      const g=new THREE.Group();const c=P(0,.16);g.position.set(c[0],y,c[1]);g.rotation.y=ry;const band=new THREE.Mesh(new THREE.BoxGeometry(w,1,.12),new THREE.MeshLambertMaterial({color:bg}));band.position.set(0,3.1,0);g.add(band);
      const sign=new THREE.Mesh(new THREE.PlaneGeometry(w-.2,.9),sm);sign.position.set(0,3.1,.07);g.add(sign);
      const gl=new THREE.Mesh(new THREE.PlaneGeometry(w-.4,2.4),new THREE.MeshStandardMaterial({color:0x7d97a6,roughness:.08,metalness:.4,envMap:envMap||null}));gl.position.set(0,1.3,.05);g.add(gl);scene.add(g)}
    n++}
  if(posts.length)instanced(mergeParts([[boxG(.14,2.8,.14),0,1.4,0,0,0,0,1,1,1,'#ffffff']]),vc,posts,postC);
  if(tbl.length){instanced(mergeParts([[cylG(.38,.38,.03,14),0,.74,0,0,0,0,1,1,1,'#f2f2ee'],[cylG(.03,.04,.74,6),0,.37,0,0,0,0,1,1,1,'#555555']]),vc,tbl);
    instanced(mergeParts([[boxG(.44,.05,.44),0,.45,0,0,0,0,1,1,1,'#7d8085'],[boxG(.44,.45,.05),0,.68,-.2,0,0,0,1,1,1,'#7d8085'],[boxG(.04,.45,.04),-.19,.22,-.19,0,0,0,1,1,1,'#555555'],[boxG(.04,.45,.04),.19,.22,.19,0,0,0,1,1,1,'#555555'],[boxG(.04,.45,.04),-.19,.22,.19,0,0,0,1,1,1,'#555555'],[boxG(.04,.45,.04),.19,.22,-.19,0,0,0,1,1,1,'#555555']]),vc,chr)}
  if(planters.length)instanced(mergeParts([[boxG(1,.7,1),0,.35,0,0,0,0,1,1,1,'#d8d2c6'],[new THREE.IcosahedronGeometry(.6,0),0,1.05,0,0,0,0,1,.8,1,'#3f7a35']]),vc,planters);
  // bancos blancos de hormigón y bloques blancos en el borde del muelle
  return n}

/* orilla: el fondo del mar algo por debajo del agua y la arena seca algo por encima, para que la lámina de agua
   y el terreno no queden en el mismo plano (eso hacía parpadear toda la línea de costa) */
function shoreFix(){const n=TG.nx,h=TG.h;for(let j=0;j<TG.nz;j++)for(let i=0;i<n;i++){const k=j*n+i,x=Math.min(i*GS,WM-1),z=Math.min(j*GS,HM-1);if(isSea(x,z)){if(h[k]>-.7)h[k]=-.7}else if(h[k]<.35&&h[k]>-2){h[k]=Math.max(h[k],.35)}}}
