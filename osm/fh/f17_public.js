
/* ============ EDIFICIOS PÚBLICOS (OpenStreetMap + uso «equipamiento» del Catastro) ============
   colegios e institutos, ayuntamiento, iglesias, Guardia Civil, centros de salud, biblioteca, mercado…
   cada uno con su fachada propia, su rótulo y, según el caso, mástiles con banderas o campanario */
const PUBD=__PUBD__;
const PUBSTY={school:{tint:'#e8c49c',up:'APT2',flags:true,sign:['#ffffff','#1f4e8c']},college:{tint:'#e8c49c',up:'APT2',flags:true,sign:['#ffffff','#1f4e8c']},
  townhall:{tint:'#f6efe0',up:'APT',flags:true,sign:['#f6efe0','#6b1d1d']},place_of_worship:{tint:'#fbf8f0',up:'PLAIN',tower:true},police:{tint:'#efe7d6',up:'APT2',flags:true,sign:['#1b5e20','#ffffff']},
  clinic:{tint:'#f4f4f0',up:'APT2',sign:['#ffffff','#127a3a']},doctors:{tint:'#f4f4f0',up:'APT2',sign:['#ffffff','#127a3a']},library:{tint:'#efe2c8',up:'APT2',sign:['#f4efe6','#2b3a55']},
  marketplace:{tint:'#efe0c4',up:'PLAIN'},cinema:{tint:'#e9e2d6',up:'PLAIN'},post_office:{tint:'#f2efe8',up:'APT2'},b_public:{tint:'#efe3c8',up:'APT2'},b_school:{tint:'#e8c49c',up:'APT2',flags:true},
  b_college:{tint:'#e8c49c',up:'APT2',flags:true},sports:{tint:'#e7e9ea',up:'METAL'}};
function pubShort(n,t){if(!n)return'';let s=n.replace(/^Colegio de Educación Infantil y Primaria /i,'C.E.I.P. ').replace(/^Instituto de Educación Secundaria /i,'I.E.S. ').replace(/^Ayuntamiento de La Gloria.*$/i,'AYUNTAMIENTO · LA GLORIA')
  .replace(/^Biblioteca Pública Municipal.*$/i,'BIBLIOTECA MUNICIPAL').replace(/^Guardia Civil.*$/i,'GUARDIA CIVIL').replace(/^Iglesia Parroquial Nuestra Señora/i,'PARROQUIA NTRA. SRA.').replace(/^Parroquia de la Asunción de Nuestra Señora/i,'PARROQUIA DE LA ASUNCIÓN')
  .replace(/^Centro Docente Privado /i,'COLEGIO ').replace(/^Colegio e Instituto /i,'COLEGIO ');return s.toUpperCase()}
/* asigna a cada edificio su tipo público: el punto de OSM que cae dentro (o el edificio más cercano a menos de 25 m) */
function assignPublic(){let n=0;const pip=(p,x,z)=>{let c=false;const k=p.length/2;for(let i=0,j=k-1;i<k;j=i++){const ax=p[i*2],az=p[i*2+1],bx=p[j*2],bz=p[j*2+1];if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)c=!c}return c};
  for(const [x,z,name,t] of PUBD){let best=null,bd=25;const gx=Math.floor(x/GC),gz=Math.floor(z/GC);for(let a=-1;a<=1;a++)for(let c=-1;c<=1;c++){const l=GBL[(gz+a)*GWc+gx+c];if(!l)continue;for(const b of l){if(b.kind===6)continue;if(pip(b.p,x,z)){best=b;bd=0;break}
      const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,d=Math.hypot(cx-x,cz-z)-Math.sqrt(b.area)/2;if(d<bd){bd=d;best=b}}if(bd===0)break}
    if(!best)continue;if(!best.pubT||(name&&!best.pubN)||(t.indexOf('b_')!==0&&best.pubT.indexOf('b_')===0)){best.pubT=t;if(name)best.pubN=name;n++}}
  for(const b of BL)if(!b.pubT&&b.use===43&&b.kind!==6)b.pubT='b_public';return n}
function pubStyle(b){return b.pubT?PUBSTY[b.pubT]||PUBSTY.b_public:null}
function buildPublic(){const vc=new THREE.MeshLambertMaterial({vertexColors:true});const poles=[],flags=[[],[],[]];let signs=0,towers=0;const have=new Set((window.AG_POI||[]).map(p=>String(p[2]).toLowerCase()));
  const FLAGC=[['#c60b1e','#ffc400','#c60b1e'],['#007a33','#ffffff','#007a33'],['#003399','#003399','#003399']];
  const fTex=FLAGC.map((c,k)=>{const cv=cvs(96,64),g=cv.getContext('2d');if(k===2){g.fillStyle='#003399';g.fillRect(0,0,96,64);g.fillStyle='#ffcc00';for(let i=0;i<12;i++){const a=i/12*TAU;g.beginPath();g.arc(48+Math.cos(a)*20,32+Math.sin(a)*20,3,0,TAU);g.fill()}}else{const hs=k===0?[16,32,16]:[21.3,21.4,21.3];let y=0;c.forEach((col,i)=>{g.fillStyle=col;g.fillRect(0,y,96,hs[i]+.5);y+=hs[i]})}return tex(cv)});
  for(const b of BL){if(!b.pubT||!b.edges)continue;const S=pubStyle(b);// fachada principal: la más larga que da a la calle
    let e=null;for(const q of b.edges)if(q.street&&!q.shared&&(!e||q.L>e.L))e=q;if(!e)for(const q of b.edges)if(!q.shared&&(!e||q.L>e.L))e=q;if(!e||e.L<4)continue;
    const ux=(e.c[0]-e.a[0])/e.L,uz=(e.c[1]-e.a[1])/e.L,mx=(e.a[0]+e.c[0])/2,mz=(e.a[1]+e.c[1])/2,ry=Math.atan2(e.nx,e.nz);
    const nm=pubShort(b.pubN,b.pubT);
    if(nm&&S.sign&&!have.has((b.pubN||'').toLowerCase())&&b.top){const w=Math.min(e.L-1,clamp(2+nm.length*.36,4,12)),h=w/6.4;const tx=shopSignTex(nm,S.sign[0],S.sign[1]);const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),signMat(tx));
      m.position.set(mx+e.nx*.14,Math.min(b.top-.4,b.hb+(b.lv>1?3.6:2.8))+h/2,mz+e.nz*.14);m.rotation.y=ry;scene.add(m);e.signed=true;signs++}
    if(S.flags&&b.top){// tres mástiles junto a la entrada: España, Andalucía, Unión Europea
      for(let k=0;k<3;k++){const o=(k-1)*1.3,x=mx+ux*o+e.nx*2.2,z=mz+uz*o+e.nz*2.2;if(blockedAt(x,z,.2)||!roadFree(x,z,.4))continue;const y=H(x,z);poles.push([x,y,z,0]);flags[k].push([x+e.nx*0+ux*.75,y+7.1,z+uz*.75,Math.atan2(-uz,ux)+Math.PI/2])}}
    if(S.tower&&b.top){// campanario con cruz en la esquina de la fachada
      const x=e.a[0]+ux*1.8-e.nx*1.8,z=e.a[1]+uz*1.8-e.nz*1.8,y=b.top;const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=ry;const wm=M(0xfbf8f0);
      const body=new THREE.Mesh(new THREE.BoxGeometry(3.2,6,3.2),wm);body.position.y=3;body.castShadow=HQ;g.add(body);
      for(const [ox,oz,r] of [[0,1.61,0],[0,-1.61,Math.PI],[1.61,0,Math.PI/2],[-1.61,0,-Math.PI/2]]){const ar=new THREE.Mesh(hc('belfry',()=>{const s=new THREE.Shape();s.moveTo(-.6,0);s.lineTo(.6,0);s.lineTo(.6,1.4);s.absarc(0,1.4,.6,0,Math.PI,false);s.lineTo(-.6,0);return new THREE.ShapeGeometry(s,8)}),M(0x2a2622));ar.position.set(ox,3.4,oz);ar.rotation.y=r;g.add(ar)}
      const roof=new THREE.Mesh(new THREE.ConeGeometry(2.4,2.2,4),M(0xb5532e));roof.position.y=7.1;roof.rotation.y=Math.PI/4;g.add(roof);
      const cr1=new THREE.Mesh(new THREE.BoxGeometry(.12,1.3,.12),M(0x2b2b2b));cr1.position.y=8.8;g.add(cr1);const cr2=new THREE.Mesh(new THREE.BoxGeometry(.7,.12,.12),M(0x2b2b2b));cr2.position.y=9.05;g.add(cr2);
      scene.add(g);towers++}}
  if(poles.length){instanced(mergeParts([[cylG(.05,.07,8,6),0,4,0,0,0,0,1,1,1,'#e8e8e8'],[new THREE.SphereGeometry(.09,8,6),0,8.05,0,0,0,0,1,1,1,'#d4af37']]),vc,poles);
    const fg=hc('flagG',()=>{const g=new THREE.PlaneGeometry(1.5,1,6,1);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i);p.setZ(i,Math.sin((x+.75)*3)*.12)}g.computeVertexNormals();return g});
    flags.forEach((L,k)=>{if(L.length)instanced(fg,new THREE.MeshLambertMaterial({map:fTex[k],side:THREE.DoubleSide}),L)})}
  return{signs,towers,poles:poles.length}}
