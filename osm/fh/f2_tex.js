
/* ============ TEXTURAS PINTADAS A MANO (canvas) ============ */
function cvs(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function noise(g,x,y,w,h,n,a,dark){for(let i=0;i<n;i++){g.fillStyle=(Math.random()<.5||dark)?`rgba(0,0,0,${a*Math.random()})`:`rgba(255,255,255,${a*Math.random()})`;g.fillRect(x+Math.random()*w,y+Math.random()*h,1+Math.random()*2,1+Math.random()*2)}}
function tex(c,rep){const t=new THREE.CanvasTexture(c);if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;t.encoding=THREE.sRGBEncoding;return t}
/* Atlas de fachadas: 4x4 casillas de 256x128. Pared: casilla = 6 m x 3 m (una planta, dos huecos). Tejado: casilla = 4 m x 4 m. */
const CELL={APT:0,APT2:1,GLASS:2,HOUSEUP:3,METAL:4,SHOP:5,PORTAL:6,HOUSEDN:7,PLAIN:8,AZOTEA:9,TEJA:10,PLASTIC:11,SHOP2:12,GARAGE:13,BRICK:14,GRAVEL:15};
function atlasMat(map,webgl2){
  const m=new THREE.MeshLambertMaterial({map,vertexColors:true,side:THREE.DoubleSide});
  m.onBeforeCompile=sh=>{
    sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 atl;\nvarying vec4 vAtl;').replace('#include <uv_vertex>','#include <uv_vertex>\nvAtl=atl;');
    const samp=webgl2?'textureGrad(map,auv,dFdx(vUv*vAtl.zw),dFdy(vUv*vAtl.zw))':'texture2D(map,auv)';
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec4 vAtl;').replace('#include <map_fragment>',
      `#ifdef USE_MAP\n vec2 auv=vAtl.xy+(fract(vUv)*0.96+0.02)*vAtl.zw;\n vec4 texelColor=${samp};\n texelColor=mapTexelToLinear(texelColor);\n diffuseColor*=texelColor;\n#endif`);
  };
  m.customProgramCacheKey=()=>'atlas'+(webgl2?2:1);
  return m;
}
function tileTex(w,h,fn){const c=cvs(w,h),g=c.getContext('2d');fn(g,w,h);return tex(c,true)}
let TX={};
function makeTextures(){
  TX.asph=tileTex(512,512,(g,w,h)=>{g.fillStyle='#3a3c40';g.fillRect(0,0,w,h);for(let i=0;i<26000;i++){const v=Math.random();g.fillStyle=v<.5?`rgba(0,0,0,${.05+Math.random()*.08})`:`rgba(255,255,255,${.03+Math.random()*.06})`;g.fillRect(Math.random()*w,Math.random()*h,1,1)}g.fillStyle='rgba(0,0,0,.025)';for(let i=0;i<10;i++){g.beginPath();g.ellipse(Math.random()*w,Math.random()*h,30+Math.random()*60,12+Math.random()*30,Math.random()*3,0,TAU);g.fill()}g.strokeStyle='rgba(0,0,0,.25)';g.lineWidth=1;g.beginPath();g.moveTo(30,0);g.bezierCurveTo(60,80,20,140,70,256);g.stroke()});
  TX.walk=tileTex(128,128,(g,w,h)=>{g.fillStyle='#cfc9bc';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){g.fillStyle=`rgb(${200+Math.random()*16|0},${194+Math.random()*14|0},${180+Math.random()*12|0})`;g.fillRect(x+1,y+1,30,30);
    g.fillStyle='rgba(0,0,0,.06)';for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.beginPath();g.arc(x+5+i*7,y+5+j*7,2,0,TAU);g.fill()}}noise(g,0,0,w,h,300,.1)});
  TX.prom=tileTex(128,128,(g,w,h)=>{g.fillStyle='#c79a78';g.fillRect(0,0,w,h);for(let y=0;y<h;y+=16)for(let x=((y/16)%2)*16;x<w;x+=32){g.fillStyle=`rgba(${150+Math.random()*30|0},${90+Math.random()*20|0},${60},.55)`;g.fillRect(x+1,y+1,30,14)}noise(g,0,0,w,h,300,.12)});
  TX.pier=tileTex(128,128,(g,w,h)=>{g.fillStyle='#a8a398';g.fillRect(0,0,w,h);noise(g,0,0,w,h,900,.2);g.fillStyle='rgba(0,0,0,.15)';for(let y=0;y<h;y+=32)g.fillRect(0,y,w,2)});
  TX.dash=tileTex(8,64,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#f4f4ee';g.fillRect(0,0,w,32)});
  TX.solid=tileTex(8,8,(g,w,h)=>{g.fillStyle='#f4f4ee';g.fillRect(0,0,w,h)});
  TX.zebra=tileTex(64,8,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#f4f4ee';g.fillRect(0,0,32,h)});
  TX.flash=(()=>{const c=cvs(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,230,1)');gr.addColorStop(.3,'rgba(255,200,80,.9)');gr.addColorStop(1,'rgba(255,120,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tex(c)})();
  TX.puff=(()=>{const c=cvs(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tex(c)})();
  TX.blob=(()=>{const c=cvs(64,64),g=c.getContext('2d'),gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(0,0,0,.5)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);return tex(c)})();
}
/* ============ AYUDAS DE GEOMETRÍA ============ */
const MC={};function M(c){return MC[c]||(MC[c]=new THREE.MeshLambertMaterial({color:c}))}
function mesh(geo,c,x,y,z,o){const m=new THREE.Mesh(geo,typeof c==='object'?c:M(c));m.position.set(x||0,y||0,z||0);if(o){if(o.sx)m.scale.x=o.sx;if(o.sy)m.scale.y=o.sy;if(o.sz)m.scale.z=o.sz;if(o.rx)m.rotation.x=o.rx;if(o.ry)m.rotation.y=o.ry;if(o.rz)m.rotation.z=o.rz}if(HQ){m.castShadow=true}return m}
const GCACHE={};
function boxG(w,h,d){const k='b'+w+'_'+h+'_'+d;return GCACHE[k]||(GCACHE[k]=new THREE.BoxGeometry(w,h,d))}
function cylG(rt,rb,h,s){const k='c'+rt+'_'+rb+'_'+h+'_'+s;return GCACHE[k]||(GCACHE[k]=new THREE.CylinderGeometry(rt,rb,h,s||10))}
function sphG(r,a,b){const k='s'+r+'_'+a+'_'+b;return GCACHE[k]||(GCACHE[k]=new THREE.SphereGeometry(r,a||10,b||8))}
/* une varias piezas con color por vértice en una sola geometría */
function mergeParts(parts){const P=[],N=[],C=[];const m=new THREE.Matrix4(),e=new THREE.Euler(0,0,0,'YXZ'),q=new THREE.Quaternion(),col=new THREE.Color();
  for(const pt of parts){const [geo,x,y,z,rx,ry,rz,sx,sy,sz,c]=pt;const g=geo.index?geo.toNonIndexed():geo.clone();
    m.compose(new THREE.Vector3(x||0,y||0,z||0),q.setFromEuler(e.set(rx||0,ry||0,rz||0,'YXZ')),new THREE.Vector3(sx||1,sy||1,sz||1));g.applyMatrix4(m);
    const pa=g.attributes.position.array,na=g.attributes.normal.array;col.set(c);for(let i=0;i<pa.length;i++){P.push(pa[i]);N.push(na[i])}for(let i=0;i<pa.length/3;i++)C.push(col.r,col.g,col.b)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));return g}
const DECO=[];
function instanced(geo,mat,list,colors){if(!list.length)return null;if(colors)mat=mat.clone();const CS=192,cells=new Map();
  list.forEach((t,i)=>{const k=Math.floor(t[2]/CS)*1000+Math.floor(t[0]/CS);let c=cells.get(k);if(!c){c={l:[],c:[],x:(Math.floor(t[0]/CS)+.5)*CS,z:(Math.floor(t[2]/CS)+.5)*CS};cells.set(k,c)}c.l.push(t);if(colors)c.c.push(colors[i])});
  const m=new THREE.Matrix4(),q=new THREE.Quaternion(),e=new THREE.Euler(),v=new THREE.Vector3(),s=new THREE.Vector3();
  for(const c of cells.values()){const im=new THREE.InstancedMesh(geo,mat,c.l.length);
    c.l.forEach((t,i)=>{q.setFromEuler(e.set(t[7]||0,t[3]||0,0,'YXZ'));s.set(t[4]||1,t[5]||t[4]||1,t[6]||t[4]||1);m.compose(v.set(t[0],t[1],t[2]),q,s);im.setMatrixAt(i,m);if(colors)im.setColorAt(i,c.c[i])});
    im.frustumCulled=false;if(HQ){im.castShadow=true;im.receiveShadow=true}scene.add(im);DECO.push({im,x:c.x,z:c.z,y:0})}
  return true}
const _fr=new THREE.Frustum(),_pm=new THREE.Matrix4(),_sph=new THREE.Sphere(new THREE.Vector3(),140);
function cullDeco(){_pm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_fr.setFromProjectionMatrix(_pm);const cx=camera.position.x,cz=camera.position.z;
  for(const d of DECO){const dd=Math.hypot(d.x-cx,d.z-cz);if(dd>(HQ?360:260)){d.im.visible=false;continue}if(dd<150){d.im.visible=true;continue}_sph.center.set(d.x,5,d.z);d.im.visible=_fr.intersectsSphere(_sph)}}
/* une varias geometrías simples en una (para objetos instanciados de varias piezas) */
function mergeG(gs){const P=[],N=[];for(let g of gs){if(g.index)g=g.toNonIndexed();g.computeVertexNormals();P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array)}const o=new THREE.BufferGeometry();o.setAttribute('position',new THREE.Float32BufferAttribute(P,3));o.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));return o}
