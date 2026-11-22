
/* ============ MOBILIARIO URBANO REAL (detectado en las fotos de Mapillary, CC-BY-SA) ============
   Señales de tráfico, semáforos, farolas, papeleras, bancos y postes en su sitio real. */
function roadSignTex(kind){const c=cvs(128,128),g=c.getContext('2d');g.clearRect(0,0,128,128);const R='#c8102e',B='#1f4e9c',W='#ffffff';
  const circ=(fill,stroke,lw)=>{g.beginPath();g.arc(64,64,58,0,TAU);g.fillStyle=fill;g.fill();if(stroke){g.lineWidth=lw;g.strokeStyle=stroke;g.beginPath();g.arc(64,64,58-lw/2,0,TAU);g.stroke()}};
  const txt=(t,col,sz,y)=>{g.fillStyle=col;g.font=`900 ${sz}px Arial,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(t,64,y||66)};
  const tri=(down)=>{g.beginPath();if(down){g.moveTo(6,10);g.lineTo(122,10);g.lineTo(64,118)}else{g.moveTo(64,8);g.lineTo(122,116);g.lineTo(6,116)}g.closePath();g.fillStyle=R;g.fill();g.beginPath();if(down){g.moveTo(24,20);g.lineTo(104,20);g.lineTo(64,96)}else{g.moveTo(64,30);g.lineTo(104,106);g.lineTo(24,106)}g.closePath();g.fillStyle=W;g.fill()};
  const m=kind.match(/maximum-speed-limit-(\d+)/);
  if(kind.includes('stop')){g.beginPath();for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;g.lineTo(64+Math.cos(a)*60,64+Math.sin(a)*60)}g.closePath();g.fillStyle=R;g.fill();g.lineWidth=4;g.strokeStyle=W;g.stroke();txt('STOP',W,34)}
  else if(kind.includes('yield'))tri(true);
  else if(kind.includes('no-entry')){circ(R);g.fillStyle=W;g.fillRect(22,54,84,20)}
  else if(m){circ(W,R,16);txt(m[1],'#111',m[1].length>2?42:52)}
  else if(kind.includes('no-parking')||kind.includes('no-stopping')){circ(B,R,14);g.strokeStyle=R;g.lineWidth=12;g.beginPath();g.moveTo(28,28);g.lineTo(100,100);if(kind.includes('no-stopping')){g.moveTo(100,28);g.lineTo(28,100)}g.stroke()}
  else if(kind.includes('no-overtaking')||kind.includes('no-')){circ(W,R,14);g.fillStyle='#222';g.fillRect(40,50,48,26)}
  else if(kind.includes('roundabout')&&kind.startsWith('regulatory')){circ(B);g.strokeStyle=W;g.lineWidth=9;g.beginPath();g.arc(64,64,28,0,TAU*.8);g.stroke();g.fillStyle=W;g.beginPath();g.moveTo(92,50);g.lineTo(100,72);g.lineTo(80,66);g.fill()}
  else if(kind.startsWith('regulatory')){circ(B);g.fillStyle=W;g.beginPath();g.moveTo(64,22);g.lineTo(90,58);g.lineTo(72,58);g.lineTo(72,104);g.lineTo(56,104);g.lineTo(56,58);g.lineTo(38,58);g.closePath();g.fill()}
  else if(kind.includes('pedestrians-crossing')&&kind.startsWith('information')){g.fillStyle=B;g.fillRect(6,6,116,116);g.fillStyle=W;g.beginPath();g.moveTo(64,16);g.lineTo(112,104);g.lineTo(16,104);g.closePath();g.fill();g.fillStyle='#111';g.beginPath();g.arc(66,50,7,0,TAU);g.fill();g.fillRect(60,58,10,22);g.fillRect(52,80,8,18);g.fillRect(70,80,8,18);for(let i=0;i<4;i++){g.fillRect(28+i*20,98,12,4)}}
  else if(kind.includes('parking')){g.fillStyle=B;g.fillRect(6,6,116,116);txt('P',W,90,70)}
  else if(kind.startsWith('information')){g.fillStyle=B;g.fillRect(6,20,116,88);g.fillStyle=W;g.fillRect(16,58,70,12);g.beginPath();g.moveTo(86,44);g.lineTo(112,64);g.lineTo(86,84);g.fill()}
  else{tri(false);txt('!','#111',56,82)}
  const t=new THREE.CanvasTexture(c);return t}
function signKey(v){const m=v.match(/maximum-speed-limit-(\d+)/);if(m)return'speed'+m[1];for(const k of ['stop','yield','no-entry','no-parking','no-stopping','no-overtaking','pedestrians-crossing','parking','roundabout'])if(v.includes(k))return(v.startsWith('information')?'i-':v.startsWith('warning')?'w-':'r-')+k;
  return v.startsWith('information')?'i-gen':v.startsWith('warning')?'w-gen':v.startsWith('regulatory--no-')?'r-no':'r-gen'}
const TLM={r:null,a:null,g:null};
function buildMapillary(){const D=WD.mly;if(!D)return 0;
  const RG=new Map();for(const rp of ROADPATHS){if(rp.cls>7)continue;const P=rp.P;for(let i=0;i<P.length-2;i+=2){const k=Math.floor(P[i+1]/40)*1000+Math.floor(P[i]/40);(RG.get(k)||RG.set(k,[]).get(k)).push([P[i],P[i+1],P[i+2],P[i+3],rp.hw,rp.ow])}}
  // coloca el objeto en el bordillo de la calle más cercana si cae dentro de la calzada; devuelve la orientación
  const place=(x,z)=>{let best=null;const gx=Math.floor(x/40),gz=Math.floor(z/40);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=RG.get((gz+a)*1000+gx+b);if(l)for(const s of l){const d=distSeg(x,z,s[0],s[1],s[2],s[3]);if(!best||d-s[4]<best.e){best={e:d-s[4],s}}}}
    if(!best)return{x,z,yaw:0};const s=best.s,L=Math.hypot(s[2]-s[0],s[3]-s[1])||1,dx=(s[2]-s[0])/L,dz=(s[3]-s[1])/L,t=clamp((x-s[0])*dx+(z-s[1])*dz,0,L),px=s[0]+dx*t,pz=s[1]+dz*t;let rx=-dz,rz=dx;const side=(x-px)*rx+(z-pz)*rz>=0?1:-1;
    let ox=x,oz=z;if(best.e<.5){const o=s[4]+.6;ox=px+rx*side*o;oz=pz+rz*side*o}
    const fd=side>0?1:-1;return{x:ox,z:oz,yaw:Math.atan2(-dx*fd,-dz*fd),ny:Math.atan2(-rx*side,-rz*side)}};
  const PL=window.__lampsArr||[],LG=new Map();for(const l of PL){const k=Math.floor(l[2]/20)*1000+Math.floor(l[0]/20);(LG.get(k)||LG.set(k,[]).get(k)).push(l)}
  const nearLamp=(x,z)=>{const gx=Math.floor(x/20),gz=Math.floor(z/20);for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const l=LG.get((gz+a)*1000+gx+b);if(l)for(const q of l)if(Math.hypot(q[0]-x,q[2]-z)<9)return true}return false};
  const signs=new Map(),poles=[],tl=[],lamps=[],bins=[],benches=[],upoles=[],jbox=[];const seen=new Map();
  const dup=(k,x,z,r)=>{const g=k+':'+Math.floor(x/r)+','+Math.floor(z/r);if(seen.has(g))return true;seen.set(g,1);return false};
  for(const [ti,x,z] of D.rows){const v=D.types[ti];if(x<5||z<5||x>WM-5||z>HM-5||isSea(x,z))continue;
    if(v==='object--street-light'){if(nearLamp(x,z)||dup('l',x,z,6))continue;const p=place(x,z);if(blockedAt(p.x,p.z,.2)||!roadFree(p.x,p.z,.35))continue;lamps.push([p.x,H(p.x,p.z),p.z,p.ny]);continue}
    if(v.startsWith('object--traffic-light')){if(dup('t',x,z,5))continue;const p=place(x,z);if(!roadFree(p.x,p.z,.3))continue;tl.push([p.x,H(p.x,p.z),p.z,p.yaw]);obstAdd(p.x,p.z,p.x+.01,p.z,.15);continue}
    if(v==='object--trash-can'){if(dup('b',x,z,3))continue;const p=place(x,z);if(blockedAt(p.x,p.z,.3)||!roadFree(p.x,p.z,.3))continue;bins.push([p.x,H(p.x,p.z),p.z,p.ny]);continue}
    if(v==='object--bench'){if(dup('n',x,z,3))continue;const p=place(x,z);if(blockedAt(p.x,p.z,.6))continue;benches.push([p.x,H(p.x,p.z),p.z,p.ny+Math.PI]);continue}
    if(v==='object--support--utility-pole'){if(dup('u',x,z,5))continue;const p=place(x,z);if(!roadFree(p.x,p.z,.3))continue;upoles.push([p.x,H(p.x,p.z),p.z,0]);obstAdd(p.x,p.z,p.x+.01,p.z,.15);continue}
    if(v==='object--junction-box'){if(dup('j',x,z,3))continue;const p=place(x,z);if(blockedAt(p.x,p.z,.4))continue;jbox.push([p.x,H(p.x,p.z),p.z,p.ny]);continue}
    if(/^(regulatory|warning|information)--/.test(v)){const k=signKey(v);if(dup('s'+k,x,z,6))continue;const p=place(x,z);if(blockedAt(p.x,p.z,.1)||!roadFree(p.x,p.z,.25))continue;
      (signs.get(k)||signs.set(k,{v,l:[]}).get(k)).l.push([p.x,H(p.x,p.z),p.z,p.yaw]);poles.push([p.x,H(p.x,p.z),p.z,0]);obstAdd(p.x,p.z,p.x+.01,p.z,.08)}}
  const grey=new THREE.MeshStandardMaterial({color:0x8a9095,metalness:.7,roughness:.4,envMap}),vc=new THREE.MeshLambertMaterial({vertexColors:true});
  instanced(cylG(.04,.04,2.6,6).clone().translate(0,1.3,0),grey,poles);
  for(const [k,s] of signs){const face=new THREE.PlaneGeometry(.75,.75).translate(0,2.35,.05),back=new THREE.PlaneGeometry(.75,.75).rotateY(Math.PI).translate(0,2.35,.045);
    instanced(face,new THREE.MeshLambertMaterial({map:roadSignTex(s.v),transparent:true,alphaTest:.5}),s.l);instanced(back,new THREE.MeshLambertMaterial({color:0x777b80,map:roadSignTex(s.v),alphaTest:.5,transparent:true}),s.l)}
  // semáforos con ciclo verde-ámbar-rojo
  TLM.r=new THREE.MeshBasicMaterial({color:0x330000});TLM.a=new THREE.MeshBasicMaterial({color:0x332200});TLM.g=new THREE.MeshBasicMaterial({color:0x003300});
  const tg=mergeParts([[cylG(.07,.07,3,8),0,1.5,0,0,0,0,1,1,1,'#3a3d40'],[boxG(.32,.95,.26),0,3.25,0,0,0,0,1,1,1,'#1d1f21'],[boxG(.4,1.05,.04),0,3.25,-.14,0,0,0,1,1,1,'#2a2c2e']]);
  instanced(tg,vc,tl);for(const [mat,y] of [[TLM.r,3.55],[TLM.a,3.25],[TLM.g,2.95]])instanced(new THREE.CircleGeometry(.1,10).translate(0,y,.135),mat,tl);
  // farolas modernas (las reales que faltaban)
  instanced(mergeParts([[cylG(.07,.11,8,8),0,4,0,0,0,0,1,1,1,'#6f7579'],[boxG(.08,.08,1.4),0,7.9,.65,0,0,0,1,1,1,'#6f7579'],[boxG(.32,.12,.6),0,7.85,1.3,0,0,0,1,1,1,'#55595c'],[boxG(.28,.03,.5),0,7.78,1.3,0,0,0,1,1,1,'#fff6d8']]),vc,lamps);
  // papeleras suprimidas
  instanced(mergeParts([[boxG(1.6,.05,.42),0,.45,0,0,0,0,1,1,1,'#8a5a32'],[boxG(1.6,.36,.05),0,.68,-.2,-.15,0,0,1,1,1,'#8a5a32'],[boxG(.06,.45,.45),.7,.22,0,0,0,0,1,1,1,'#2b2b2b'],[boxG(.06,.45,.45),-.7,.22,0,0,0,0,1,1,1,'#2b2b2b']]),vc,benches);
  instanced(mergeParts([[cylG(.11,.14,7.5,8),0,3.75,0,0,0,0,1,1,1,'#6b5038'],[boxG(1.2,.08,.08),0,7,0,0,0,0,1,1,1,'#6b5038']]),vc,upoles);
  instanced(mergeParts([[boxG(.7,1.1,.35),0,.55,0,0,0,0,1,1,1,'#b9bcb5'],[boxG(.72,.04,.37),0,1.12,0,0,0,0,1,1,1,'#9a9d96']]),vc,jbox);
  let ns=0;for(const s of signs.values())ns+=s.l.length;return{signs:ns,tl:tl.length,lamps:lamps.length,bins:bins.length,benches:benches.length,upoles:upoles.length,jbox:jbox.length}}
function updateTLights(){if(!TLM.r)return;const t=(time%30);const ph=t<13?'g':t<16?'a':'r';TLM.g.color.setHex(ph==='g'?0x37ff6a:0x032b0c);TLM.a.color.setHex(ph==='a'?0xffb300:0x2b1d00);TLM.r.color.setHex(ph==='r'?0xff2a2a:0x2b0404)}
