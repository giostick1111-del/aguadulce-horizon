
/* ============ PUENTES, TÚNELES Y RAMPAS DE APARCAMIENTO SUBTERRÁNEO ============
   Las vías marcadas como puente en OpenStreetMap van por un tablero elevado recto entre sus dos extremos;
   las carreteras que pasan por debajo se rebajan para dejar gálibo. Los túneles van bajo el terreno con bóveda iluminada. */
const STR={list:[],grid:new Map(),ready:false};
function strPrep(){if(STR.prepped)return;STR.prepped=true;const conn=new Map();
  for(const r of WD.roads){if(r[0]>7)continue;for(let i=5;i<r.length;i+=2){const k=r[i]+','+r[i+1];conn.set(k,(conn.get(k)||0)+1)}}
  for(const r of WD.roads){const kd=r[4];if(kd!==1&&kd!==3&&kd!==4)continue;if(r[0]>7&&kd!==4)continue;let P=[];for(let i=5;i<r.length;i+=2){const x=r[i]*K,z=r[i+1]*K;const q=P.length;if(q&&Math.hypot(P[q-2]-x,P[q-1]-z)<.05)continue;P.push(x,z)}if(P.length<4)continue;
    P=densify(P,2);const n=P.length/2,S=[0];for(let i=1;i<n;i++)S.push(S[i-1]+Math.hypot(P[i*2]-P[i*2-2],P[i*2+1]-P[i*2-1]));const L=S[n-1];if(L<4)continue;
    const st={r,P,S,L,hw:r[1]*K/2,cls:r[0],ow:r[2],kind:kd===1?'b':kd===3?'t':'p',hA:H(P[0],P[1]),hB:H(P[n*2-2],P[n*2-1])};
    if(st.kind==='p'){// la rampa baja desde el extremo conectado a la calle hasta -4 m en el interior
      const c0=(conn.get(r[5]+','+r[6])||0)>1,c1=(conn.get(r[r.length-2]+','+r[r.length-1])||0)>1;if(!c0&&c1){st.P=[];for(let i=n-1;i>=0;i--)st.P.push(P[i*2],P[i*2+1]);st.S=st.S.map(s=>L-s).reverse();const t=st.hA;st.hA=st.hB;st.hB=t}st.hB=Math.min(st.hA-4,st.hB-4);st.hw=Math.max(st.hw,2.4)}
    STR.list.push(st)}
  // cruces: las calles que pasan bajo un puente se rebajan para dejar 6 m de gálibo
  for(const st of STR.list){if(st.kind!=='b')continue;const P=st.P,n=P.length/2;
    for(const r of WD.roads){if(r[4]===1||r[4]===3||r[4]===4||r[0]>7)continue;for(let j=5;j<r.length-2;j+=2){const cx=r[j]*K,cz=r[j+1]*K,dx2=r[j+2]*K,dz2=r[j+3]*K;
        for(let i=0;i<n-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3];const d=(bx-ax)*(dz2-cz)-(bz-az)*(dx2-cx);if(Math.abs(d)<1e-6)continue;
          const t=((cx-ax)*(dz2-cz)-(cz-az)*(dx2-cx))/d,u=((cx-ax)*(bz-az)-(cz-az)*(bx-ax))/d;if(t<0||t>1||u<0||u>1)continue;
          const s=st.S[i]+(st.S[i+1]-st.S[i])*t,x=ax+(bx-ax)*t,z=az+(bz-az)*t;if(s<3||s>st.L-3)continue;const y=st.hA+(st.hB-st.hA)*s/st.L;st.over=true;if(y-6.4>.8||H(x,z)>y-1)(r.under||(r.under=[])).push({x,z,y:Math.max(.8,y-6.4),st})}}}}
  // puentes que en el terreno real no tienen gálibo (tablero a ras o por debajo del suelo): calle normal a ras de suelo
  STR.list=STR.list.filter(st=>{if(st.kind!=='b')return true;const P=st.P,n=P.length/2;let gap=0;for(let i=0;i<n;i+=3){const y=st.hA+(st.hB-st.hA)*st.S[i]/st.L;gap=Math.max(gap,y-H(P[i*2],P[i*2+1]))}let low=1e9;for(let i=0;i<n;i+=3){const y=st.hA+(st.hB-st.hA)*st.S[i]/st.L;low=Math.min(low,y-H(P[i*2],P[i*2+1]))}
    const ok=st.over?(st.L>=40&&low>-.6):gap>=3;if(!ok){st.r[4]=0;return false}return true});
  const keep=new Set(STR.list);for(const r of WD.roads)if(r.under)r.under=r.under.filter(u=>keep.has(u.st));}
function strFinish(){// tras ajustar el terreno: alturas definitivas de los extremos y rejilla para la física
  // con el terreno ya definitivo, fuera los puentes cuyo tablero quedaría enterrado en algún punto
  const n0=STR.list.length;STR.list=STR.list.filter(st=>{if(st.kind!=='b')return true;const P=st.P,n=P.length/2,hA=H(P[0],P[1]),hB=H(P[n*2-2],P[n*2-1]);for(let i=0;i<n;i++){const y=hA+(hB-hA)*st.S[i]/st.L;const ab=Math.min(st.S[i],st.L-st.S[i])<8;// junto a los estribos el tablero ya va pegado al suelo: se tolera más
        if(y-H(P[i*2],P[i*2+1])<(ab?-1.5:-.6)){st.r[4]=0;return false}}return true});
  const removed=n0-STR.list.length;if(removed){const keep=new Set(STR.list);for(const r of WD.roads)if(r.under)r.under=r.under.filter(u=>keep.has(u.st));return removed}
  for(const st of STR.list){const P=st.P,n=P.length/2;if(st.kind!=='p'){st.hA=H(P[0],P[1]);st.hB=H(P[n*2-2],P[n*2-1])}else st.hA=H(P[0],P[1]);
    for(let i=0;i<n-1;i++){const x0=Math.min(P[i*2],P[i*2+2])-st.hw-2,x1=Math.max(P[i*2],P[i*2+2])+st.hw+2,z0=Math.min(P[i*2+1],P[i*2+3])-st.hw-2,z1=Math.max(P[i*2+1],P[i*2+3])+st.hw+2;
      for(let gz=Math.floor(z0/16);gz<=Math.floor(z1/16);gz++)for(let gx=Math.floor(x0/16);gx<=Math.floor(x1/16);gx++){const k=gz*1000+gx;let l=STR.grid.get(k);if(!l)STR.grid.set(k,l=[]);l.push([st,i])}}}strTwins();STR.ready=true}
/* puentes gemelos (una calzada por sentido, como el de Carlos III sobre la rambla junto a El Parador):
   un único tablero continuo entre ambas calzadas con mediana de hormigón, sin pretiles solapados en medio */
function strTwins(){const B=STR.list.filter(s=>s.kind==='b');for(const st of B){st.inSd=0;st.inO=0;st.med=false}
  const dPoly=(Q,x,z)=>{let d=1e9;for(let i=0;i<Q.length-2;i+=2)d=Math.min(d,distSeg(x,z,Q[i],Q[i+1],Q[i+2],Q[i+3]));return d};
  for(let a=0;a<B.length;a++)for(let b=a+1;b<B.length;b++){const A=B[a],C=B[b];const n=A.P.length/2;let sum=0,cnt=0,sg=0;
    for(let i=0;i<n;i+=2){const x=A.P[i*2],z=A.P[i*2+1],d=dPoly(C.P,x,z);if(d>A.hw+C.hw+6){cnt=-1;break}sum+=d;cnt++;
      const i0=Math.max(0,i-1),i1=Math.min(n-1,i+1),tx=A.P[i1*2]-A.P[i0*2],tz=A.P[i1*2+1]-A.P[i0*2+1];const cx=C.P[Math.floor(C.P.length/4)*2],cz=C.P[Math.floor(C.P.length/4)*2+1];sg+=Math.sign((cx-x)*-tz+(cz-z)*tx)}
    if(cnt<3)continue;const d=sum/cnt;if(d<A.hw+.5||d<C.hw+.5)continue;
    const sideOf=(S,O)=>{const m=Math.floor(S.P.length/4),x=S.P[m*2],z=S.P[m*2+1],tx=S.P[m*2+2]-S.P[m*2-2],tz=S.P[m*2+3]-S.P[m*2-1];const k=Math.floor(O.P.length/4);return Math.sign((O.P[k*2]-x)*-tz+(O.P[k*2+1]-z)*tx)||1};
    A.inSd=sideOf(A,C);C.inSd=sideOf(C,A);A.inO=C.inO=d/2;A.med=true}}
function strY(st,s){const t=clamp(s/st.L,0,1);if(st.kind==='p'){const e=t*t*(3-2*t);return st.hA+(st.hB-st.hA)*e}return st.hA+(st.hB-st.hA)*t}
/* ¿sobre/dentro de qué estructura está el punto? devuelve {st,s,d,y} */
function strAt(x,z,yref){if(!STR.ready)return null;const l=STR.grid.get(Math.floor(z/16)*1000+Math.floor(x/16));if(!l)return null;let best=null;
  for(const [st,i] of l){const P=st.P,ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1;let t=((x-ax)*dx+(z-az)*dz)/L2;t=clamp(t,0,1);
    const px=ax+dx*t,pz=az+dz*t,d=Math.hypot(x-px,z-pz);if(d>st.hw+.7)continue;const s=st.S[i]+(st.S[i+1]-st.S[i])*t,y=strY(st,s);
    if(st.kind==='b'){if(yref!==undefined&&yref<y-2.6)continue;if(y<H(x,z)-.2)continue}else{const h=H(x,z);if(y>h-.4&&!(st.kind==='p'&&s>1))continue;if(yref!==undefined&&yref>y+3.2)continue}
    if(!best||Math.abs(y-(yref===undefined?y:yref))<Math.abs(best.y-(yref===undefined?best.y:yref)))best={st,s,d,y,i,t}}return best}
/* altura del suelo teniendo en cuenta puentes y túneles */
function GH(x,z,yref){const a=strAt(x,z,yref);return a?a.y:H(x,z)}
/* mantiene el coche dentro del tablero o del túnel (pretiles y paredes) */
function strKeep(c){const a=strAt(c.x,c.z,c.y);if(!a||Math.abs(c.y-a.y)>1.6)return;const st=a.st;let lim=st.hw+(st.kind==='b'?.2:.1)-CARS[c.t].W*.45;if(a.s<2&&st.kind==='b'||a.s>st.L-2&&st.kind==='b')return;
  if(st.inSd){const P=st.P,i=a.i,tx=P[i*2+2]-P[i*2],tz=P[i*2+3]-P[i*2+1],ax=P[i*2],az=P[i*2+1];if(Math.sign((c.x-ax)*-tz+(c.z-az)*tx)===st.inSd)lim=st.inO-.35-CARS[c.t].W*.45}
  if(a.d>lim){const P=st.P,i=a.i,ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],px=ax+(bx-ax)*a.t,pz=az+(bz-az)*a.t,ux=(c.x-px)/a.d,uz=(c.z-pz)/a.d;c.x=px+ux*lim;c.z=pz+uz*lim;const vn=c.vx*ux+c.vz*uz;if(vn>0){c.vx-=vn*ux*1.3;c.vz-=vn*uz*1.3;if(vn>6)onCrash(c,vn)}}
  if(st.kind==='p'&&a.s>st.L-3){c.vx*=.5;c.vz*=.5}}
function strCeil(x,z,y){const a=strAt(x,z,y);return a&&a.st.kind!=='b'?a.y+4.9:Infinity}

/* ---- geometría ---- */
function buildStructures(){const C=SGB(),A=SGB(),M=SGB(),Lt=SGB(),D=SGB();const con=new THREE.Color('#c9c4ba'),dark=new THREE.Color('#8f8a82'),wall=new THREE.Color('#b8b2a6'),wh=new THREE.Color('#ffffff'),bl=new THREE.Color('#0d0f12'),stl=new THREE.Color('#9aa3a8');let pil=0;
  const q=(S,a,b,c2,d,col,n)=>sgQuad(S,[...a,...b,...c2,...d],n[0],n[1],n[2],col);
  for(const st of STR.list){const P=st.P,n=P.length/2,hw=st.hw;const pts=[];
    for(let i=0;i<n;i++){const x=P[i*2],z=P[i*2+1];const i0=Math.max(0,i-1),i1=Math.min(n-1,i+1);let tx=P[i1*2]-P[i0*2],tz=P[i1*2+1]-P[i0*2+1];const L=Math.hypot(tx,tz)||1;tx/=L;tz/=L;pts.push({x,z,nx:-tz,nz:tx,tx,tz,y:strY(st,st.S[i]),s:st.S[i]})}
    const at=(p,o,dy)=>[p.x+p.nx*o,p.y+(dy||0),p.z+p.nz*o];
    for(let i=0;i<n-1;i++){const a=pts[i],b=pts[i+1];
      // calzada
      const hwL=st.inSd===-1?Math.min(hw,st.inO-.35):hw,hwR=st.inSd===1?Math.min(hw,st.inO-.35):hw;
      sgQuad(A,[...at(a,-hwL,.05),...at(b,-hwL,.05),...at(b,hwR,.05),...at(a,hwR,.05)],0,1,0,wh,[-hwL/6,a.s/6,-hwL/6,b.s/6,hwR/6,b.s/6,hwR/6,a.s/6]);
      if(st.kind==='b'){const e=hw+.7,eS=sd=>sd===st.inSd?st.inO+.02:e;
        sgQuad(C,[...at(a,hwR,.05),...at(b,hwR,.05),...at(b,eS(1),.2),...at(a,eS(1),.2)],0,1,0,con);sgQuad(C,[...at(a,-eS(-1),.2),...at(b,-eS(-1),.2),...at(b,-hwL,.05),...at(a,-hwL,.05)],0,1,0,con);
        for(const sd of [-1,1]){if(sd===st.inSd){if(st.med){const o=sd*st.inO;// mediana de hormigón tipo New Jersey en el eje entre ambas calzadas
            q(C,at(a,o-sd*.32,.2),at(b,o-sd*.32,.2),at(b,o-sd*.12,.95),at(a,o-sd*.12,.95),con,[-a.nx*sd,.3,-a.nz*sd]);q(C,at(a,o+sd*.32,.2),at(b,o+sd*.32,.2),at(b,o+sd*.12,.95),at(a,o+sd*.12,.95),con,[a.nx*sd,.3,a.nz*sd]);
            q(C,at(a,o-sd*.12,.95),at(b,o-sd*.12,.95),at(b,o+sd*.12,.95),at(a,o+sd*.12,.95),con,[0,1,0])}continue}
          const o=sd*e;// canto del tablero y barrera de hormigón con barandilla
          q(C,at(a,o,-1.1),at(b,o,-1.1),at(b,o,.2),at(a,o,.2),dark,[a.nx*sd,0,a.nz*sd]);
          q(C,at(a,o-sd*.05,.2),at(b,o-sd*.05,.2),at(b,o-sd*.2,1.0),at(a,o-sd*.2,1.0),con,[-a.nx*sd,.3,-a.nz*sd]);
          q(C,at(a,o-sd*.2,1.0),at(b,o-sd*.2,1.0),at(b,o-sd*.35,1.0),at(a,o-sd*.35,1.0),con,[0,1,0]);
          q(M,at(a,o-sd*.27,1.25),at(b,o-sd*.27,1.25),at(b,o-sd*.27,1.32),at(a,o-sd*.27,1.32),stl,[a.nx*sd,0,a.nz*sd])}
        q(D,at(a,-eS(-1),-1.1),at(b,-eS(-1),-1.1),at(b,eS(1),-1.1),at(a,eS(1),-1.1),dark,[0,-1,0])
        // pilas cada ~18 m donde hay hueco debajo (sin invadir otras calles)
        if(Math.floor(a.s/18)!==Math.floor(b.s/18)&&a.s>6&&a.s<st.L-6){for(const o of hw>5?[-hw*.55,hw*.55]:[0]){const x=a.x+a.nx*o,z=a.z+a.nz*o,g=H(x,z);if(a.y-1.1-g<.6)continue;let under=false;for(const rp of roadsNear(x,z)){if(rp.st||rp.cls>5)continue;if(distToRoad(rp,x,z)<rp.hw+1.2){under=true;break}}if(under)continue;
            sgBox(C,x,z,a.tx,a.tz,a.nx,a.nz,-.7,.7,-.7,.7,g-.5,a.y-1.1,wall,true);pil++}}}
      else{// túnel o rampa: paredes, bóveda y luces
        const Hc=st.kind==='p'?3.2:5.2,e=hw+.5;
        for(const sd of [-1,1]){const o=sd*e;const top=st.kind==='p'?Math.max(a.y+Hc,H(a.x+a.nx*o,a.z+a.nz*o)+1):a.y+Hc,topb=st.kind==='p'?Math.max(b.y+Hc,H(b.x+b.nx*o,b.z+b.nz*o)+1):b.y+Hc;
          sgQuad(C,[...at(a,o,0),...at(b,o,0),b.x+b.nx*o,topb,b.z+b.nz*o,a.x+a.nx*o,top,a.z+a.nz*o],-a.nx*sd,0,-a.nz*sd,wall);
          sgQuad(D,[...at(a,o,0),...at(b,o,0),b.x+b.nx*o,topb,b.z+b.nz*o,a.x+a.nx*o,top,a.z+a.nz*o],a.nx*sd,0,a.nz*sd,dark)}
        const roofed=st.kind==='t'||a.s>4;if(roofed){q(C,at(a,-e,Hc),at(b,-e,Hc),at(b,e,Hc),at(a,e,Hc),dark,[0,-1,0]);q(D,at(a,-e,Hc+.6),at(b,-e,Hc+.6),at(b,e,Hc+.6),at(a,e,Hc+.6),con,[0,1,0]);
          if(Math.floor(a.s/12)!==Math.floor(b.s/12))q(Lt,at(a,-.6,Hc-.05),at(b,-.6,Hc-.05),at(b,.6,Hc-.05),at(a,.6,Hc-.05),new THREE.Color('#fff2c4'),[0,-1,0])}}}
    // bocas: marco de hormigón; en la rampa, fondo oscuro, cartel P y barrera
    if(st.kind!=='b'){const ends=st.kind==='p'?[n-1]:[0,n-1];for(const k of ends){const p=pts[k],Hc=st.kind==='p'?3.2:5.2,e=hw+.5,f=k===0?-1:1;
        sgBox(C,p.x,p.z,p.nx,p.nz,p.tx,p.tz,-e-.8,e+.8,-.4*f,.4*f,p.y+Hc,p.y+Hc+1.2,con,true);
        for(const sd of [-1,1])sgBox(C,p.x,p.z,p.nx,p.nz,p.tx,p.tz,sd*e-.4,sd*e+.4,-.4,.4,p.y-.3,p.y+Hc,con,true);
        if(st.kind==='p'){q(Lt,at(p,-e,0),at(p,e,0),at(p,e,Hc),at(p,-e,Hc),bl,[-p.tx,0,-p.tz]);const s=bigSprite('P  PARKING','#fff','rgba(31,78,156,.95)');s.scale.set(4.2,.8,1);s.position.set(p.x,p.y+Hc+1.9,p.z);scene.add(s)}}
      if(st.kind==='p'){const p=pts[0];const s=bigSprite('P','#fff','rgba(31,78,156,.95)');s.scale.set(1.2,1.2,1);s.position.set(p.x+p.nx*(hw+1.6),p.y+2.6,p.z+p.nz*(hw+1.6));scene.add(s)}}}
  const asp=(typeof roadPBR==='function'&&QL>=1)?new THREE.MeshStandardMaterial({map:TX.asph,roughness:.9,metalness:0,vertexColors:true,side:THREE.DoubleSide}):new THREE.MeshLambertMaterial({map:TX.asph,vertexColors:true,side:THREE.DoubleSide});
  sgMesh(A,asp,false);sgMesh(C,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),false);sgMesh(D,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),false);
  sgMesh(M,new THREE.MeshStandardMaterial({vertexColors:true,metalness:.8,roughness:.3,envMap,side:THREE.DoubleSide}),false);const lm=sgMesh(Lt,new THREE.MeshBasicMaterial({vertexColors:true,side:THREE.DoubleSide}),false);if(lm)lm.castShadow=false;
  // líneas en el tablero
  const ln=RB();for(const st of STR.list){if(st.kind==='p')continue;const P=st.P;const hR=st.inSd===1?Math.min(st.hw,st.inO-.35):st.hw,hL=st.inSd===-1?Math.min(st.hw,st.inO-.35):st.hw;ribbon(ln,P,.07,hR-.35,.14,4,false);ribbon(ln,P,.07,-(hL-.35),.14,4,false)}
  if(ln.i.length){for(let i=0;i<ln.p.length;i+=3)ln.p[i+1]=GH(ln.p[i],ln.p[i+2])+.08;const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(ln.p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(ln.u,2));g.setIndex(ln.i);g.computeVertexNormals();const m=new THREE.Mesh(g,roadMat({map:TX.solid}));m.renderOrder=4;m.frustumCulled=false;scene.add(m)}
  return{n:STR.list.length,b:STR.list.filter(s=>s.kind==='b').length,t:STR.list.filter(s=>s.kind==='t').length,p:STR.list.filter(s=>s.kind==='p').length,pil}}
/* ¿el punto está libre de calzadas (de coches)? para farolas, señales y mobiliario */
let _RCG=null;
function roadFree(x,z,m){if(!_RCG){_RCG=new Map();for(const rp of ROADPATHS){if(rp.cls>5||rp.cls===4.5)continue;const P=rp.P;for(let i=0;i<P.length-2;i+=2){const x0=Math.min(P[i],P[i+2])-rp.hw-2,x1=Math.max(P[i],P[i+2])+rp.hw+2,z0=Math.min(P[i+1],P[i+3])-rp.hw-2,z1=Math.max(P[i+1],P[i+3])+rp.hw+2;
    for(let gz=Math.floor(z0/24);gz<=Math.floor(z1/24);gz++)for(let gx=Math.floor(x0/24);gx<=Math.floor(x1/24);gx++){const k=gz*1000+gx;let l=_RCG.get(k);if(!l)_RCG.set(k,l=[]);l.push([P[i],P[i+1],P[i+2],P[i+3],rp.hw])}}}}
  if(underBridge(x,z,m+1))return false;
  const l=_RCG.get(Math.floor(z/24)*1000+Math.floor(x/24));if(!l)return true;for(const s of l)if(distSeg(x,z,s[0],s[1],s[2],s[3])<s[4]+m)return false;return true}
/* ¿el punto queda bajo (o pegado a) el tablero de un puente? ahí no van farolas, señales ni mobiliario */
function underBridge(x,z,m){for(const st of STR.list){if(st.kind!=='b')continue;const P=st.P,w=Math.max(st.hw+.7,st.inO||0)+m;for(let i=0;i<P.length-2;i+=2){if(Math.abs(P[i]-x)>w+20&&Math.abs(P[i+2]-x)>w+20)continue;if(distSeg(x,z,P[i],P[i+1],P[i+2],P[i+3])<w){const y=strY(st,st.S[i/2]);if(y-H(x,z)>1.2)return true}}}return false}
