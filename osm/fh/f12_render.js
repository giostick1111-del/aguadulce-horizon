
/* ============ RENDER CINEMATOGRÁFICO: bloom, fachadas PBR con cristales que reflejan, asfalto con relieve,
   palmeras con tronco anillado y hojas arqueadas, y personajes humanoides estilizados ============ */
const POST={on:false,comp:null,bloom:null};
function initPost(){/* gráficos como antes: sin postproceso */return;if(QL<1||window.__nr||!THREE.EffectComposer)return;const st=S.set||{};if(st.bloom===false||(st.bloom===undefined&&QL<2))return;
  try{const w=innerWidth,h=innerHeight,pr=renderer.getPixelRatio();let rt;
    if(renderer.capabilities.isWebGL2&&UHQ&&THREE.WebGLMultisampleRenderTarget){rt=new THREE.WebGLMultisampleRenderTarget(w*pr,h*pr,{format:THREE.RGBAFormat});rt.samples=4}
    const C=new THREE.EffectComposer(renderer,rt);C.setPixelRatio(pr);C.setSize(w,h);C.addPass(new THREE.RenderPass(scene,camera));
    const B=new THREE.UnrealBloomPass(new THREE.Vector2(w*(UHQ?.33:.25),h*(UHQ?.33:.25)),.3,.45,.93);C.addPass(B);
    // paso final: de lineal a sRGB (el tono ACES ya lo aplican los materiales)
    const O=new THREE.ShaderPass({uniforms:{tDiffuse:{value:null}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      fragmentShader:'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=linearToOutputTexel(texture2D(tDiffuse,vUv));}'});C.addPass(O);
    POST.comp=C;POST.bloom=B;POST.on=true;addEventListener('resize',()=>{if(POST.comp){POST.comp.setPixelRatio(renderer.getPixelRatio());POST.comp.setSize(innerWidth,innerHeight)}})}catch(e){console.warn('post',e);POST.on=false}}
/* en móvil las sombras se recalculan un fotograma sí y otro no (la mitad de trabajo de GPU para el mapa de sombras) */
let _shN=0;function renderScene(dt){if(!UHQ&&renderer.shadowMap.enabled){renderer.shadowMap.autoUpdate=false;if((_shN++&1)===0)renderer.shadowMap.needsUpdate=true}if(POST.on&&POST.comp)POST.comp.render(dt);else renderer.render(scene,camera)}

/* ---- máscara de brillo para el atlas de fachadas: cristal liso y reflectante, paredes mates ---- */
function atlasGloss(atlasTex){const src=atlasTex.image,W=src.width,Hh=src.height,c=cvs(W,Hh),g=c.getContext('2d');g.drawImage(src,0,0);const d=g.getImageData(0,0,W,Hh),p=d.data;
  for(let i=0;i<p.length;i+=4){const r=p[i],gg=p[i+1],b=p[i+2],l=(r+gg+b)/3;const glass=b>r+12&&l<205;const metal=Math.abs(r-gg)<6&&Math.abs(gg-b)<8&&l>150&&l<215;
    p[i]=255;p[i+1]=glass?22:metal?110:225;p[i+2]=glass?70:metal?140:0;p[i+3]=255}
  g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;return t}
function atlasMatPBR(map,webgl2){if(true)return atlasMat(map,webgl2);const gl=atlasGloss(map);
  const m=new THREE.MeshStandardMaterial({map,roughnessMap:gl,metalnessMap:gl,roughness:1,metalness:1,envMapIntensity:1.05,vertexColors:true,side:THREE.DoubleSide});
  m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 atl;\nvarying vec4 vAtl;').replace('#include <uv_vertex>','#include <uv_vertex>\nvAtl=atl;');
    const S=(t)=>webgl2?`textureGrad(${t},auv,dFdx(vUv*vAtl.zw),dFdy(vUv*vAtl.zw))`:`texture2D(${t},auv)`;
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec4 vAtl;')
      .replace('#include <map_fragment>',`vec2 auv=vAtl.xy+(fract(vUv)*0.96+0.02)*vAtl.zw;\n#ifdef USE_MAP\n vec4 texelColor=${S('map')};\n texelColor=mapTexelToLinear(texelColor);\n diffuseColor*=texelColor;\n#endif`)
      .replace('#include <roughnessmap_fragment>',`float roughnessFactor=roughness;\n#ifdef USE_ROUGHNESSMAP\n vec4 texelRoughness=${S('roughnessMap')};\n roughnessFactor*=texelRoughness.g;\n#endif`)
      .replace('#include <metalnessmap_fragment>',`float metalnessFactor=metalness;\n#ifdef USE_METALNESSMAP\n vec4 texelMetalness=${S('metalnessMap')};\n metalnessFactor*=texelMetalness.b;\n#endif`)};
  m.customProgramCacheKey=()=>'atlasPBR'+(webgl2?2:1);return m}

/* ---- asfalto y aceras con relieve y rugosidad ---- */
function roadPBR(){if(true)return null;
  const rough=tileTex(512,512,(g,w,h)=>{g.fillStyle='#b4b4b4';g.fillRect(0,0,w,h);for(let i=0;i<60000;i++){const v=110+Math.random()*145|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*1.6,1+Math.random()*1.6)}
    for(let i=0;i<14;i++){g.fillStyle='rgba(60,60,60,.25)';g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,20+Math.random()*60,8+Math.random()*30,Math.random()*3,0,TAU);g.fill()}});
  const asph=new THREE.MeshStandardMaterial({map:TX.asph,roughnessMap:rough,roughness:.95,metalness:0,bumpMap:rough,bumpScale:.018,envMapIntensity:.5,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  const walk=new THREE.MeshStandardMaterial({map:TX.walk,bumpMap:TX.walk,bumpScale:.012,roughness:.72,metalness:0,envMapIntensity:.6,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  const prom=new THREE.MeshStandardMaterial({map:TX.prom,bumpMap:TX.prom,bumpScale:.012,roughness:.6,metalness:0,envMapIntensity:.7,side:THREE.DoubleSide,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
  return{asph,walk,prom}}

/* ---- palmera: tronco anillado y hojas arqueadas que caen ---- */
function palmGeo(){const parts=[];const N=9;for(let i=0;i<N;i++){const y0=i*.8,r0=.24-i*.009,g=new THREE.CylinderGeometry(r0*.92,r0*1.05,.8,7,1);
    parts.push([g,.012*(y0+.4)*(y0+.4),y0+.4,0,0,0,0,1,1,1,i%2?'#8d6d4b':'#7a5c3d']);parts.push([new THREE.CylinderGeometry(r0*1.12,r0*1.12,.1,7),.012*y0*y0,y0+.05,0,0,0,0,1,1,1,'#6b4f34'])}
  const top=N*.8,tx=.012*top*top;parts.push([new THREE.SphereGeometry(.34,8,6),tx,top+.05,0,0,0,0,1,.8,1,'#6b5a2e']);
  // hoja: tira curvada con el nervio central y dos medias láminas plegadas en V
  const frond=()=>{const S=10,L=3.2,P=[],I=[];for(let k=0;k<=S;k++){const t=k/S,z=t*L,y=.55*t-1.15*t*t,w=.5*Math.sin(Math.PI*Math.min(1,t*1.1))*(1-t*.35)+.04;P.push(-w,y-w*.18,z,0,y+.04,z,w,y-w*.18,z)}
    for(let k=0;k<S;k++){const a=k*3;I.push(a,a+3,a+1,a+1,a+3,a+4,a+1,a+4,a+2,a+2,a+4,a+5)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();return g};
  const fg=frond();for(let i=0;i<12;i++){const ry=i*TAU/12+Math.sin(i*7)*.2,tilt=i%2?.05:-.18;parts.push([fg,tx,top+.15,0,tilt,ry,0,1,1,1,i%3===0?'#3b6f27':i%3===1?'#4c8432':'#58923a'])}
  for(let i=0;i<5;i++)parts.push([new THREE.SphereGeometry(.07,5,4),tx+Math.cos(i*1.3)*.22,top-.1,Math.sin(i*1.3)*.22,0,0,0,1,1,1,'#c08a2b'])
  return mergeParts(parts)}

/* ---- personaje humanoide estilizado (cápsulas suavizadas) ---- */
function capG(r0,r1,len,seg){const pts=[],n=6;for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.cos(a)*r1,-len+Math.sin(a)*r1))}
  for(let i=0;i<=n;i++){const a=i/n*Math.PI/2;pts.push(new THREE.Vector2(Math.cos(a)*r0,Math.sin(a)*r0))}const g=new THREE.LatheGeometry(pts,seg||10);g.computeVertexNormals();return g}
const HCACHE={};function hc(k,f){return HCACHE[k]||(HCACHE[k]=f())}
const PSTYLE=[{shirt:0xe9e4da,jacket:0x1f2a38,pants:0x2f4a72,shoes:0xf2f2f2,cap:0xc0392b,hair:0x1b130c,skin:0xd2a07a},
  {shirt:0x2d6a4f,jacket:0x2d6a4f,pants:0x2a2a2e,shoes:0x1e1e1e,cap:0x111111,hair:0x2b1a0e,skin:0xc48c64},{shirt:0xf1c40f,jacket:0x353b48,pants:0x5b4a3a,shoes:0xe8e8e8,cap:null,hair:0x3a2414,skin:0xe0b28a},
  {shirt:0x8e44ad,jacket:0x8e44ad,pants:0x1f2d3d,shoes:0xff4d6d,cap:0xffffff,hair:0x0e0b08,skin:0x9c6b48},{shirt:0xffffff,jacket:0xb03a2e,pants:0x2c3e50,shoes:0x111111,cap:null,hair:0x6b4a2e,skin:0xd9a76f}];
function opHuman(o){const g=new THREE.Group(),p={};const st=o.style!==undefined?PSTYLE[o.style%PSTYLE.length]:null;
  const C=o.vest?{shirt:o.shirt,jacket:o.vest,pants:o.pants,shoes:o.shoes,cap:o.helm||null,hair:0x1b130c,skin:o.skin,glove:o.glove}:st?Object.assign({glove:0},st):{shirt:o.shirt,jacket:o.shirt,pants:o.pants,shoes:o.shoes,cap:null,hair:0x1b130c,skin:o.skin};
  const mat=c=>stdMat('hum'+c,{color:c,roughness:.75,metalness:0}),cloth=c=>stdMat('hc'+c,{color:c,roughness:.92,metalness:0});
  const add=(par,geo,m,x,y,z,sx,sy,sz)=>{const e=new THREE.Mesh(geo,m);e.position.set(x||0,y||0,z||0);if(sx)e.scale.set(sx,sy||sx,sz||sx);if(HQ)e.castShadow=true;par.add(e);return e};
  const hips=new THREE.Group();hips.position.y=1.0;g.add(hips);p.hips=hips;
  add(hips,hc('pelvis',()=>new THREE.SphereGeometry(.16,12,8)),cloth(C.pants),0,0,0,1,.75,.72);
  const leg=x=>{const hp=new THREE.Group();hp.position.set(x,-.04,0);hips.add(hp);add(hp,hc('thigh',()=>capG(.085,.07,.4,10)),cloth(C.pants),0,0,0);
    const kn=new THREE.Group();kn.position.y=-.44;hp.add(kn);add(kn,hc('calf',()=>capG(.066,.05,.38,10)),cloth(C.pants),0,0,0);
    const ft=new THREE.Group();ft.position.y=-.43;kn.add(ft);add(ft,hc('shoe',()=>{const s=new THREE.SphereGeometry(.07,10,6);s.scale(1,.62,1.9);return s}),mat(C.shoes),0,-.02,.06);add(ft,hc('sole',()=>new THREE.BoxGeometry(.11,.025,.27)),mat(0xeeeeee),0,-.055,.06);return{hp,kn,ft}};
  p.L=leg(.095);p.R=leg(-.095);
  const sp=new THREE.Group();sp.position.y=.06;hips.add(sp);p.spine=sp;
  // torso atlético: más ancho en el pecho que en la cintura
  add(sp,hc('torso',()=>{const pts=[[.13,0],[.15,.08],[.17,.2],[.2,.32],[.21,.4],[.17,.47],[.07,.52]].map(q=>new THREE.Vector2(q[0],q[1]));const t=new THREE.LatheGeometry(pts,14);t.scale(1,1,.68);t.computeVertexNormals();return t}),cloth(C.jacket),0,0,0);
  if(C.jacket!==C.shirt)add(sp,hc('chest',()=>new THREE.BoxGeometry(.16,.3,.02)),cloth(C.shirt),0,.3,.135);
  if(o.vest){add(sp,hc('vest',()=>new THREE.BoxGeometry(.38,.34,.3)),cloth(o.vest),0,.3,0);for(let i=0;i<3;i++)add(sp,hc('pouch',()=>new THREE.BoxGeometry(.09,.11,.05)),cloth(o.vest),-.12+i*.12,.2,.165)}
  add(sp,hc('neck',()=>capG(.05,.05,.07,8)),mat(C.skin),0,.6,0);
  const head=new THREE.Group();head.position.y=.6;sp.add(head);p.head=head;
  add(head,hc('skull',()=>new THREE.SphereGeometry(.11,16,12)),mat(C.skin),0,.11,0,.92,1.1,1);
  add(head,hc('nose',()=>new THREE.SphereGeometry(.022,6,5)),mat(C.skin),0,.1,.105,1,1.2,1);
  for(const s of [-1,1]){add(head,hc('eye',()=>new THREE.SphereGeometry(.016,6,5)),mat(0x151515),s*.036,.13,.093);add(head,hc('ear',()=>new THREE.SphereGeometry(.024,6,5)),mat(C.skin),s*.1,.11,0,.5,1,.8)}
  add(head,hc('hair',()=>new THREE.SphereGeometry(.116,14,8,0,TAU,0,Math.PI*.52)),mat(C.hair),0,.125,-.01,.95,1.05,1);
  if(C.cap){add(head,hc('cap',()=>new THREE.SphereGeometry(.122,14,8,0,TAU,0,Math.PI*.5)),cloth(C.cap),0,.135,0,.97,.9,1);add(head,hc('visor',()=>{const v=new THREE.CylinderGeometry(.11,.11,.015,12,1,false,-Math.PI/2,Math.PI);v.scale(1,1,1.1);return v}),cloth(C.cap),0,.15,.06)}
  if(o.mask)add(head,hc('mask',()=>new THREE.SphereGeometry(.118,12,10,0,TAU,0,Math.PI*.62)),cloth(o.mask),0,.12,0,.95,1.12,1);
  if(!o.vest&&!o.mask&&(o.style||0)%2===0)add(head,hc('glasses',()=>new THREE.BoxGeometry(.16,.035,.015)),stdMat('gls',{color:0x0a0a0a,metalness:.6,roughness:.1}),0,.135,.1);
  const arm=x=>{const sh=new THREE.Group();sh.position.set(x,.44,0);sh.rotation.order='YXZ';sp.add(sh);add(sh,hc('delt',()=>new THREE.SphereGeometry(.07,10,8)),cloth(C.jacket),0,0,0);
    add(sh,hc('bicep',()=>capG(.058,.05,.27,10)),cloth(C.jacket),0,-.01,0);const el=new THREE.Group();el.position.y=-.29;sh.add(el);
    add(el,hc('fore',()=>capG(.048,.038,.23,10)),o.vest?cloth(C.jacket):mat(C.skin),0,0,0);add(el,hc('hand',()=>new THREE.SphereGeometry(.045,8,6)),mat(o.glove||C.skin),0,-.29,0,.9,1.2,.7);return{sh,el}};
  p.aL=arm(.23);p.aR=arm(-.23);const aim=new THREE.Group();aim.position.y=.44;sp.add(aim);p.aim=aim;
  p.guns=[opPistol(),opRifle()];p.guns[0].position.set(-.04,-.03,.47);p.guns[1].position.set(-.13,-.035,.2);aim.add(p.guns[0],p.guns[1]);p.guns[0].visible=false;
  if(!HQ){const b=new THREE.Mesh(new THREE.PlaneGeometry(1.1,1.1),new THREE.MeshBasicMaterial({map:TX.blob,transparent:true,depthWrite:false}));b.rotation.x=-Math.PI/2;b.position.y=.08;b.renderOrder=6;g.add(b)}
  p.lean=0;p.lastYaw=null;g.userData=p;return g}
/* animación: zancada con brazos opuestos, rebote del torso e inclinación al girar */
function opPose(h,t,spd,pitch,wi,stance,kick,mode){pitch=-pitch;const p=h.userData,a=clamp(spd/4.5,0,1.4),run=spd>5,s=Math.sin(t),c=Math.cos(t),A=(run?.9:.55)*Math.min(1,a);
  h.rotation.x=0;p.hips.rotation.set(0,0,0);p.spine.rotation.set(0,0,0);
  if(p.lastYaw!==null){let dy=h.rotation.y-p.lastYaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));p.lean+=(clamp(-dy*6*a,-.25,.25)-p.lean)*.15}p.lastYaw=h.rotation.y;
  if(mode==='dead'){p.hips.position.y=.18;p.hips.rotation.x=-1.5;p.L.hp.rotation.x=p.R.hp.rotation.x=0;p.L.kn.rotation.x=p.R.kn.rotation.x=.1;p.aim.rotation.x=0;return}
  if(stance===2){p.hips.position.y=.2;p.hips.rotation.x=1.45;p.spine.rotation.x=-.25;p.L.hp.rotation.x=.12+s*.25*a;p.R.hp.rotation.x=.12-s*.25*a;p.L.kn.rotation.x=.15;p.R.kn.rotation.x=.15;p.L.ft.rotation.x=p.R.ft.rotation.x=.9;p.head.rotation.x=-1.1+pitch*.5;p.aim.rotation.x=-1.2+pitch}
  else{const cr=stance===1;p.L.hp.rotation.x=-s*A-(cr?1.1:0);p.R.hp.rotation.x=s*A-(cr?.5:0);
    p.L.kn.rotation.x=(.1+Math.max(0,c)*(run?1.5:.95))*Math.min(1,a)+(cr?1.6:0);p.R.kn.rotation.x=(.1+Math.max(0,-c)*(run?1.5:.95))*Math.min(1,a)+(cr?1.9:0);
    p.L.ft.rotation.x=-p.L.kn.rotation.x*.35+Math.max(0,-s)*.3*a;p.R.ft.rotation.x=-p.R.kn.rotation.x*.35+Math.max(0,s)*.3*a+(cr?.5:0);
    // rebote vertical (dos por ciclo) e inclinación hacia delante al correr
    p.hips.position.y=(cr?.58:1.0)-Math.abs(c)*(run?.06:.035)*Math.min(1,a);p.hips.rotation.y=s*.12*Math.min(1,a);p.hips.rotation.z=p.lean*.4;
    p.spine.rotation.y=-s*.16*Math.min(1,a);p.spine.rotation.x=(run?.2:cr?.18:.05);p.spine.rotation.z=p.lean;p.head.rotation.x=pitch*.55-p.spine.rotation.x*.5;p.aim.rotation.x=pitch-p.spine.rotation.x}
  p.guns[0].visible=wi===0&&mode!=='up';p.guns[1].visible=wi===1&&mode!=='up';
  if(mode==='up'){p.aR.sh.rotation.set(-2.9,0,.3);p.aR.el.rotation.x=-.6;p.aL.sh.rotation.set(-2.9,0,-.3);p.aL.el.rotation.x=-.6;return}
  // corriendo sin apuntar: arma baja y el brazo libre balancea al contrario que la pierna
  const low=run&&!h.userData.aiming;if(low)p.aim.rotation.x=-.55-p.spine.rotation.x;
  const ap=p.aim.rotation.x;p.aim.position.z=-(kick||0)*3;const cp=Math.cos(ap),sn=Math.sin(ap),G=OPGRIP[wi]||OPGRIP[1],kz=-(kick||0)*3;
  const tf=q=>[q[0],.44+q[1]*cp-(q[2]+kz)*sn,q[1]*sn+(q[2]+kz)*cp];const r=tf(G[0]),l=tf(G[1]);opArmIK(p.aR,-.23,r[0],r[1]+.01,r[2]);
  if(low&&wi===0){p.aL.sh.rotation.set(s*.8*A,0,-.08);p.aL.el.rotation.x=-.5}else opArmIK(p.aL,.23,l[0],l[1]+.01,l[2])}
