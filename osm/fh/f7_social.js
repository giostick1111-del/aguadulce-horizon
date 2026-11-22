
/* ============ MAPA GRANDE + GPS con marcas ============ */
const MAP={open:false,cx:0,cz:0,s:.5,ptr:new Map(),moved:false,t:0,pinch:0};
const GPS={wps:[],path:null,line:null,beacons:[],hint:0,chk:0,lastCalc:0};
function openMap(v){const m=$('bigmap');MAP.open=v===undefined?m.hidden:v;m.hidden=!MAP.open;if(MAP.open){if(!MAP.inited)initMapUI();MAP.cx=ME.x;MAP.cz=ME.z;const cv=$('mapC'),r=cv.getBoundingClientRect();MAP.s=Math.min(r.width,r.height)/900;drawMap()}}
function mapResize(){const cv=$('mapC'),d=Math.min(2,devicePixelRatio||1),r=cv.getBoundingClientRect();cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);MAP.dpr=d}
const m2s=(x,z)=>{const cv=$('mapC'),d=MAP.dpr||1;return[(x-MAP.cx)*MAP.s*d+cv.width/2,(z-MAP.cz)*MAP.s*d+cv.height/2]};
const s2m=(px,py)=>{const cv=$('mapC'),d=MAP.dpr||1,r=cv.getBoundingClientRect();return[(px-r.left-r.width/2)/MAP.s+MAP.cx,(py-r.top-r.height/2)/MAP.s+MAP.cz]};
function drawMap(){const cv=$('mapC');if(!MAP.dpr||cv.width!==Math.round(cv.getBoundingClientRect().width*MAP.dpr))mapResize();const g=cv.getContext('2d'),d=MAP.dpr,W=cv.width,Hh=cv.height,sp=TW/WM;
  g.fillStyle='#2a79a0';g.fillRect(0,0,W,Hh);g.imageSmoothingEnabled=true;
  const [x0,y0]=m2s(0,0),[x1,y1]=m2s(WM,HM);g.drawImage(groundCv,x0,y0,x1-x0,y1-y0);g.fillStyle='rgba(8,10,16,.12)';g.fillRect(0,0,W,Hh);
  // calles con nombre (rótulos) cuando hay zoom
  if(MAP.s>1.1){g.font=`700 ${11*d}px system-ui`;g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.65)';g.lineWidth=3*d;g.textAlign='center';const seen=new Set();
    for(const r of WD.roads){if(r[0]>4||r[3]<0||seen.has(r[3])||r.length<12)continue;const i=5+2*Math.floor((r.length-5)/4),[sx,sy]=m2s(r[i]*K,r[i+1]*K);if(sx<0||sy<0||sx>W||sy>Hh)continue;seen.add(r[3]);const nm=WD.names[r[3]];g.strokeText(nm,sx,sy);g.fillText(nm,sx,sy)}}
  // ruta GPS
  if(GPS.path){const P=GPS.path.P;g.strokeStyle='#b44dff';g.lineWidth=7*d;g.lineCap=g.lineJoin='round';g.beginPath();for(let i=0;i<P.length;i+=6){const [sx,sy]=m2s(P[i],P[i+1]);i?g.lineTo(sx,sy):g.moveTo(sx,sy)}g.stroke();g.strokeStyle='#f1d9ff';g.lineWidth=2*d;g.stroke()}
  GPS.wps.forEach((w,i)=>{const [sx,sy]=m2s(w[0],w[1]);g.fillStyle='#b44dff';g.beginPath();g.arc(sx,sy-18*d,13*d,0,TAU);g.moveTo(sx-8*d,sy-10*d);g.lineTo(sx,sy);g.lineTo(sx+8*d,sy-10*d);g.fill();g.strokeStyle='#fff';g.lineWidth=2*d;g.beginPath();g.arc(sx,sy-18*d,13*d,0,TAU);g.stroke();g.fillStyle='#fff';g.font=`800 ${14*d}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText(i+1,sx,sy-18*d)});
  // eventos
  for(const m of EVMARK){const [sx,sy]=m2s(m.x,m.z);g.fillStyle='#ff2d95';g.beginPath();g.arc(sx,sy,10*d,0,TAU);g.fill();g.font=`${13*d}px system-ui`;g.textAlign='center';g.textBaseline='middle';g.fillText('🏁',sx,sy+1);
    if(MAP.s>.55){g.font=`800 ${12*d}px system-ui`;g.fillStyle='#fff';g.strokeStyle='rgba(0,0,0,.7)';g.lineWidth=3*d;g.strokeText(m.e.name,sx,sy+20*d);g.fillText(m.e.name,sx,sy+20*d)}}
  // jugadores
  const pl=[];for(const id in remotes){const r=remotes[id];if(!r.c.m.visible)continue;pl.push(r);const [sx,sy]=m2s(r.c.x,r.c.z);arrow(g,sx,sy,r.c.yaw,'#ffd54a',d);g.font=`800 ${13*d}px system-ui`;g.textAlign='center';g.textBaseline='bottom';g.fillStyle='#ffd54a';g.strokeStyle='rgba(0,0,0,.8)';g.lineWidth=3*d;const nm=(r.tk?'🔊 ':'')+(r.n||'?');g.strokeText(nm,sx,sy-12*d);g.fillText(nm,sx,sy-12*d)}
  const [mx,my]=m2s(ME.x,ME.z);arrow(g,mx,my,ME.yaw,'#ff2d95',d*1.25);
  $('mapPl').innerHTML=`<b>${pl.length+1} piloto${pl.length?'s':''} en Aguadulce</b>`+[`<button type="button" data-f="me">📍 ${esc(S.nick)} (tú)</button>`,...pl.map(r=>`<button type="button" data-f="${r.id}">🚗 ${esc(r.n||'?')}${r.tk?' 🔊':''}<small>${Math.round(Math.hypot(r.c.x-ME.x,r.c.z-ME.z))} m</small></button>`)].join('');
  $('mapPl').querySelectorAll('[data-f]').forEach(b=>b.onclick=()=>{const id=b.dataset.f;const c=id==='me'?ME:remotes[id]&&remotes[id].c;if(c){MAP.cx=c.x;MAP.cz=c.z;MAP.s=Math.max(MAP.s,1.2);drawMap()}})}
function arrow(g,x,y,yaw,col,d){g.save();g.translate(x,y);g.rotate(Math.PI-yaw);g.fillStyle=col;g.strokeStyle='#fff';g.lineWidth=2*d;g.beginPath();g.moveTo(0,-11*d);g.lineTo(8*d,9*d);g.lineTo(0,4*d);g.lineTo(-8*d,9*d);g.closePath();g.fill();g.stroke();g.restore()}
function initMapUI(){MAP.inited=true;const cv=$('mapC');addEventListener('resize',()=>{if(MAP.open){mapResize();drawMap()}});
  cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);MAP.ptr.set(e.pointerId,[e.clientX,e.clientY]);MAP.moved=false;MAP.down=[e.clientX,e.clientY];if(MAP.ptr.size===2){const p=[...MAP.ptr.values()];MAP.pinch=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1])}});
  cv.addEventListener('pointermove',e=>{const prev=MAP.ptr.get(e.pointerId);if(!prev)return;const cur=[e.clientX,e.clientY];MAP.ptr.set(e.pointerId,cur);
    if(MAP.ptr.size===2){const p=[...MAP.ptr.values()],dd=Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]);if(MAP.pinch){zoomAt((p[0][0]+p[1][0])/2,(p[0][1]+p[1][1])/2,dd/MAP.pinch)}MAP.pinch=dd;MAP.moved=true;return}
    if(Math.hypot(cur[0]-MAP.down[0],cur[1]-MAP.down[1])>7)MAP.moved=true;if(MAP.moved){MAP.cx-=(cur[0]-prev[0])/MAP.s;MAP.cz-=(cur[1]-prev[1])/MAP.s;clampMap();drawMap()}});
  const up=e=>{const had=MAP.ptr.has(e.pointerId);MAP.ptr.delete(e.pointerId);if(MAP.ptr.size<2)MAP.pinch=0;if(had&&!MAP.moved&&e.type==='pointerup'&&e.button!==2)mapTap(e.clientX,e.clientY)};
  cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
  cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,e.deltaY<0?1.2:1/1.2)},{passive:false});
  cv.addEventListener('contextmenu',e=>{e.preventDefault();if(GPS.wps.length){GPS.wps.pop();gpsRecalc(true);drawMap()}});
  $('mapClose').onclick=()=>openMap(false);$('mapClear').onclick=()=>{gpsClear();drawMap()};$('mapUndo').onclick=()=>{GPS.wps.pop();gpsRecalc(true);drawMap()};
  $('mapMe').onclick=()=>{MAP.cx=ME.x;MAP.cz=ME.z;drawMap()};$('mapZin').onclick=()=>{const r=cv.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,1.4)};$('mapZout').onclick=()=>{const r=cv.getBoundingClientRect();zoomAt(r.left+r.width/2,r.top+r.height/2,1/1.4)}}
function zoomAt(px,py,f){const [wx,wz]=s2m(px,py);MAP.s=clamp(MAP.s*f,.12,6);const [wx2,wz2]=s2m(px,py);MAP.cx+=wx-wx2;MAP.cz+=wz-wz2;clampMap();drawMap()}
function clampMap(){MAP.cx=clamp(MAP.cx,0,WM);MAP.cz=clamp(MAP.cz,0,HM)}
function mapTap(px,py){const d=MAP.dpr||1;// tocar una marca la quita; tocar el mapa añade una
  for(let i=0;i<GPS.wps.length;i++){const [sx,sy]=m2s(GPS.wps[i][0],GPS.wps[i][1]),r=$('mapC').getBoundingClientRect();if(Math.hypot((px-r.left)*d-sx,(py-r.top)*d-(sy-18*d))<18*d){GPS.wps.splice(i,1);gpsRecalc(true);drawMap();return}}
  const [x,z]=s2m(px,py);if(x<0||z<0||x>WM||z>HM||isSea(x,z)){toast('Ahí no hay calle');return}
  if(GPS.wps.length>=8){toast('Máximo 8 marcas');return}GPS.wps.push([x,z]);gpsRecalc(true);drawMap();if(audio)beep(880,.06,.06)}
function gpsClear(){GPS.wps=[];GPS.path=null;showGps();updateGpsBox()}
function gpsRecalc(force){if(!GPS.wps.length){gpsClear();return}const now=performance.now();if(!force&&now-GPS.lastCalc<2500)return;GPS.lastCalc=now;
  const p=routeThrough([[ME.x,ME.z],...GPS.wps],false);if(!p){toast('No encuentro ruta por calles');return}GPS.path=p;GPS.hint=0;showGps();updateGpsBox()}
let GCHEV=null;
function showGps(){if(GPS.line){scene.remove(GPS.line);GPS.line.geometry.dispose();GPS.line=null}for(const b of GPS.beacons)scene.remove(b);GPS.beacons=[];
  if(!GPS.path||RACE)return;if(!GCHEV){const c=cvs(64,128),g=c.getContext('2d');g.fillStyle='rgba(180,77,255,.85)';for(const y of [8,72]){g.beginPath();g.moveTo(4,y+40);g.lineTo(32,y);g.lineTo(60,y+40);g.lineTo(60,y+52);g.lineTo(32,y+16);g.lineTo(4,y+52);g.closePath();g.fill()}GCHEV=new THREE.CanvasTexture(c);GCHEV.wrapS=GCHEV.wrapT=THREE.RepeatWrapping}
  const rb=RB();ribbon(rb,GPS.path.P,.9,0,1.8,4.5,false);GPS.line=rbMesh(rb,new THREE.MeshBasicMaterial({map:GCHEV,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-6,polygonOffsetUnits:-6}),.09,8);
  const bm=new THREE.MeshBasicMaterial({color:0xb44dff,transparent:true,opacity:.35,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide});
  GPS.wps.forEach((w,i)=>{const b=new THREE.Mesh(cylG(1.6,1.6,60,16,1,true),bm);b.position.set(w[0],H(w[0],w[1])+30,w[1]);b.renderOrder=9;scene.add(b);GPS.beacons.push(b);
    const s=bigSprite('📍 MARCA '+(i+1),'#fff','rgba(180,77,255,.9)');s.scale.set(9,1.1,1);s.position.set(w[0],H(w[0],w[1])+6,w[1]);scene.add(s);GPS.beacons.push(s)})}
function updateGps(dt){if(!GPS.path){return}GPS.chk-=dt;if(GPS.chk>0)return;GPS.chk=.4;
  const w=GPS.wps[0];if(w&&Math.hypot(ME.x-w[0],ME.z-w[1])<20){GPS.wps.shift();beep(1320,.12,.1);if(!GPS.wps.length){bigMsg('¡HAS LLEGADO!','#d7a6ff');gpsClear();return}feed('📍 Marca alcanzada · quedan '+GPS.wps.length);gpsRecalc(true);return}
  const pr=projectOnPath(GPS.path,ME.x,ME.z,GPS.hint,160);GPS.hint=pr.i;GPS.left=GPS.path.len-pr.d;if(pr.off>28)gpsRecalc(false);updateGpsBox()}
function updateGpsBox(){const b=$('gpsBox');if(!GPS.path){b.hidden=true;return}b.hidden=false;const L=GPS.left!==undefined?GPS.left:GPS.path.len;b.innerHTML=`📍 GPS · ${L>=1000?(L/1000).toFixed(1)+' km':Math.round(L)+' m'}<small>${GPS.wps.length} marca${GPS.wps.length>1?'s':''} · ${IS_TOUCH?'toca el minimapa':'M'} para editar</small>`}
function drawGpsMini(g,P2){if(!GPS.path||RACE)return;const p=GPS.path.P;g.strokeStyle='#b44dff';g.lineWidth=6;g.lineCap=g.lineJoin='round';g.beginPath();const a=Math.max(0,GPS.hint-5);let st=false;for(let i=a*2;i<p.length;i+=6){const q=P2(p[i],p[i+1]);st?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]);st=true}g.stroke();
  for(const w of GPS.wps){const v=P2(w[0],w[1]);const L=Math.hypot(v[0],v[1]);if(L>158){v[0]*=158/L;v[1]*=158/L}g.fillStyle='#b44dff';g.beginPath();g.arc(v[0],v[1],8,0,TAU);g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke()}}

/* ============ CHAT DE TEXTO ============ */
const CHAT={open:false,seen:new Set()};
function chatInit(){const R=net.R,ref=net.ref;R.onChildAdded(R.query(ref('chat'),R.limitToLast(25)),s=>{const v=s.val();if(!v||CHAT.seen.has(s.key))return;CHAT.seen.add(s.key);if(serverNow()-(v.t||0)>3*3600e3)return;addChat(v.n,v.m,v.u===UID,serverNow()-(v.t||0)>60e3)});
  // limpieza de mensajes de más de 3 horas
  R.get(R.query(ref('chat'),R.orderByChild('t'),R.endAt(serverNow()-3*3600e3))).then(s=>s.forEach(c=>{R.remove(c.ref)})).catch(()=>{})}
function addChat(n,m,mine,old){const L=$('chatLog'),d=document.createElement('div');const b=document.createElement('b');b.textContent=(n||'?')+': ';b.style.color=mine?'#ff9ccc':'#ffd54a';d.appendChild(b);d.appendChild(document.createTextNode(m||''));if(old)d.className='old';L.appendChild(d);
  while(L.children.length>40)L.firstChild.remove();L.scrollTop=L.scrollHeight;if(!old){setTimeout(()=>d.classList.add('old'),15000);if(!mine&&AC)beep(1500,.05,.04)}}
function sendChat(t){t=(t||'').trim().slice(0,140);if(!t)return;if(!net.on){addChat(S.nick,t,true);addChat('Sistema','Sin conexión: el mensaje no se ha enviado',false);return}
  net.R.push(net.ref('chat'),{n:S.nick,u:UID,m:t,t:serverNow()}).catch(()=>addChat('Sistema','No se pudo enviar',false))}
function openChat(v){CHAT.open=v===undefined?!CHAT.open:v;$('chatF').hidden=!CHAT.open;document.body.classList.toggle('chatting',CHAT.open);$('chat').classList.toggle('open',CHAT.open);if(CHAT.open){for(const k in keys)keys[k]=false;for(const k in tc)tc[k]=0;const i=$('chatIn');try{i.focus({preventScroll:true})}catch(e){i.focus()}setTimeout(()=>{if(document.activeElement!==i)i.focus()},60)}else $('chatIn').blur()}

/* ============ CHAT DE VOZ (WebRTC entre jugadores, señalización por Firebase) ============ */
const VC={mode:0,stream:null,track:null,peers:{},talk:false,lvl:0,an:null,chk:0,listening:false};
const ICE={iceServers:[{urls:['stun:stun.l.google.com:19302','stun:stun1.l.google.com:19302','stun:stun.cloudflare.com:3478']}]};
async function voiceToggle(){if(VC.mode===0){if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){toast('Tu navegador no permite micrófono aquí');return}
    try{VC.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}})}catch(e){feed('🎙 Sin permiso de micrófono (la voz funciona en la web del juego, no en vistas previas)');return}
    VC.track=VC.stream.getAudioTracks()[0];VC.track.enabled=false;VC.mode=1;audio();try{const src=AC.createMediaStreamSource(VC.stream),an=AC.createAnalyser();an.fftSize=512;src.connect(an);VC.an=an;VC.buf=new Uint8Array(an.fftSize)}catch(e){}
    voiceListen();feed(IS_TOUCH?'🎙 Voz activada: mantén HABLAR para hablar':'🎙 Voz activada: mantén V para hablar')}
  else if(VC.mode===1){VC.mode=2;VC.track.enabled=true;feed('🎙 Micrófono abierto (todos te oyen)')}
  else{VC.mode=0;for(const id in VC.peers)closePeer(id);VC.stream.getTracks().forEach(t=>t.stop());VC.stream=VC.track=null;VC.an=null;feed('🎙 Voz desactivada')}
  voiceUI();netSend(true)}
function voiceUI(){$('voiceBtn').textContent=['🎙 VOZ: NO',IS_TOUCH?'🎙 PULSAR':'🎙 PULSAR (V)','🎙 ABIERTO'][VC.mode];$('voiceBtn').classList.toggle('live',VC.mode>0);$('bTalk').hidden=!(IS_TOUCH&&VC.mode===1)}
function setTalk(v){VC.talk=v;if(VC.track&&VC.mode===1)VC.track.enabled=v;$('bTalk').classList.toggle('down',v)}
function voiceListen(){if(VC.listening||!net.on)return;VC.listening=true;const R=net.R,me=net.ref('rtc/'+UID);R.onDisconnect(me).remove();R.remove(me).catch(()=>{});
  R.onChildAdded(me,s=>{const v=s.val();R.remove(s.ref).catch(()=>{});if(v&&VC.mode)onSignal(v.f,v.k,v.d).catch(e=>console.warn('rtc',e))})}
function sig(to,k,d){net.R.push(net.ref('rtc/'+to),{f:UID,k,d,t:serverNow()}).catch(()=>{})}
function newPeer(id){const pc=new RTCPeerConnection(ICE),P={pc,q:[],id,au:null};VC.peers[id]=P;
  for(const t of VC.stream.getTracks())pc.addTrack(t,VC.stream);
  pc.onicecandidate=e=>{if(e.candidate)sig(id,'ice',JSON.stringify(e.candidate))};
  pc.ontrack=e=>{if(!P.au){P.au=document.createElement('audio');P.au.autoplay=true;P.au.playsInline=true;document.body.appendChild(P.au)}P.au.srcObject=e.streams[0];P.au.volume=(S.set&&S.set.vvol!==undefined)?S.set.vvol:1;P.au.play().catch(()=>{})};
  pc.onconnectionstatechange=()=>{if(pc.connectionState==='connected'){const r=remotes[id];feed('🔊 Voz conectada con '+(r&&r.n||'piloto'))}if(pc.connectionState==='failed'){closePeer(id);VC.fail=VC.fail||{};VC.fail[id]=performance.now()+15000}};
  return P}
function closePeer(id){const P=VC.peers[id];if(!P)return;try{P.pc.close()}catch(e){}if(P.au){P.au.srcObject=null;P.au.remove()}delete VC.peers[id]}
async function onSignal(from,k,d){let P=VC.peers[from];
  if(k==='offer'){if(P&&P.pc.signalingState!=='stable'){closePeer(from);P=null}if(!P)P=newPeer(from);await P.pc.setRemoteDescription(JSON.parse(d));for(const c of P.q)await P.pc.addIceCandidate(c).catch(()=>{});P.q=[];
    const a=await P.pc.createAnswer();await P.pc.setLocalDescription(a);sig(from,'answer',JSON.stringify(P.pc.localDescription))}
  else if(k==='answer'&&P){await P.pc.setRemoteDescription(JSON.parse(d));for(const c of P.q)await P.pc.addIceCandidate(c).catch(()=>{});P.q=[]}
  else if(k==='ice'&&P){const c=JSON.parse(d);if(P.pc.remoteDescription)await P.pc.addIceCandidate(c).catch(()=>{});else P.q.push(c)}
  else if(k==='bye')closePeer(from)}
async function callPeer(id){const P=newPeer(id);const o=await P.pc.createOffer();await P.pc.setLocalDescription(o);sig(id,'offer',JSON.stringify(P.pc.localDescription))}
function updateVoice(dt){VC.chk-=dt;
  // nivel del micro para el indicador
  if(VC.an&&VC.track&&VC.track.enabled){VC.an.getByteTimeDomainData(VC.buf);let s=0;for(const v of VC.buf)s+=(v-128)**2;VC.lvl=Math.sqrt(s/VC.buf.length)/128}else VC.lvl=0;
  if(VC.chk<=0){VC.chk=1;if(VC.mode&&net.on){voiceListen();for(const id in remotes){const r=remotes[id],P=VC.peers[id];const vis=performance.now()-r.seen<8000;
      if(r.vo&&vis&&!P&&UID<id&&!(VC.fail&&VC.fail[id]>performance.now()))callPeer(id).catch(e=>console.warn(e));if(P&&(!r.vo||!vis))closePeer(id)}
      for(const id in VC.peers)if(!remotes[id])closePeer(id)}}
  // quién está hablando
  const t=[];if(VC.mode&&(VC.mode===1?VC.talk:VC.lvl>.04))t.push('🎙 '+esc(S.nick));for(const id in remotes){const r=remotes[id];if(r.tk&&performance.now()-r.seen<3000)t.push('🔊 '+esc(r.n||'?'))}
  const h=t.join('<br>');if($('talk').innerHTML!==h)$('talk').innerHTML=h}
function socialState(st){if(VC.mode){st.vo=1;if(VC.mode===1?VC.talk:VC.lvl>.04)st.tk=1}}

/* ============ arranque de la parte social ============ */
function initSocial(){if(IS_TOUCH){document.body.appendChild($('chat'));document.body.appendChild($('chatF'))}$('mapBtn').onclick=()=>openMap();$('mini').addEventListener('click',()=>openMap(true));$('mini').style.pointerEvents='auto';$('mini').style.cursor='pointer';
  $('chatBtn').onclick=()=>openChat();bugInit();$('fullBtn').onclick=()=>{const fs=document.fullscreenElement||document.webkitFullscreenElement;if(fs)(document.exitFullscreen||document.webkitExitFullscreen).call(document);else{if(isIOS&&!(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen))feed('📱 En iPhone: Compartir ⬆️ → «Añadir a pantalla de inicio» para jugar a pantalla completa');goFull()}};$('chatX').onclick=()=>openChat(false);['touchstart','touchmove','touchend','pointerdown'].forEach(ev=>$('chatF').addEventListener(ev,e=>e.stopPropagation(),{passive:true}));$('voiceBtn').onclick=voiceToggle;
  $('chatF').addEventListener('submit',e=>{e.preventDefault();sendChat($('chatIn').value);$('chatIn').value='';if(IS_TOUCH)openChat(false)});
  $('chatIn').addEventListener('keydown',e=>{if(e.key==='Escape'){openChat(false);e.preventDefault()}e.stopPropagation()});
  const bt=$('bTalk');const dn=e=>{e.preventDefault();setTalk(true)},upf=e=>{e.preventDefault();setTalk(false)};bt.addEventListener('touchstart',dn,{passive:false});bt.addEventListener('touchend',upf,{passive:false});bt.addEventListener('touchcancel',upf,{passive:false});
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;if(e.code==='KeyV'&&!e.repeat&&VC.mode===1)setTalk(true);if(e.code==='KeyT'&&!e.repeat){e.preventDefault();openChat(true)}});
  addEventListener('keyup',e=>{if(e.code==='KeyV'&&VC.mode===1)setTalk(false)});voiceUI()}
function updateSocial(dt){if(!!RACE!==!!GPS.hid){GPS.hid=!!RACE;showGps()}updateGps(dt);updateVoice(dt);if(MAP.open){MAP.t-=dt;if(MAP.t<=0){MAP.t=.1;drawMap()}}}
