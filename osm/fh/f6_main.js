
/* ============ RED EN TIEMPO REAL (Firebase Realtime Database) ============ */
const net={on:false,R:null,rt:null,fs:null,db:null,off:0,last:0,ref:null,lobby:null};
const remotes={};let lb=[];const INTERP=130;const serverNow=()=>Date.now()+net.off;const r2=v=>Math.round(v*100)/100;
function setNet(t,c){const e=$('net');e.textContent=t;e.style.color=c||'#fff'}
async function netInit(){const cfg=window.AG_FIREBASE;if(!cfg||!cfg.apiKey||!cfg.databaseURL){setNet('⚪ Solo (sin servidor)');return}
  try{const G='https://www.gstatic.com/firebasejs/10.12.5/';const [a,f,R]=window.__mockFB||await Promise.all([import(G+'firebase-app.js'),import(G+'firebase-firestore.js'),import(G+'firebase-database.js')]);
    const app=a.initializeApp(cfg);net.fs=f;net.db=f.getFirestore(app);net.R=R;net.rt=R.getDatabase(app,cfg.databaseURL);const ref=p=>R.ref(net.rt,'fh/'+p);net.ref=ref;
    net.me=f.doc(net.db,'games','aguadulce-horizon','players',UID);
    R.onValue(R.ref(net.rt,'.info/serverTimeOffset'),s=>{net.off=s.val()||0});
    R.onValue(R.ref(net.rt,'.info/connected'),s=>{if(s.val()){net.on=true;setNet('🟢 En línea','#5dffb0');R.onDisconnect(ref('p/'+UID)).remove();netSend(true)}else setNet('🟠 Reconectando…','#ffb347')});
    const onP=s=>{if(s.key!==UID&&s.val())remoteState(s.key,s.val())};R.onChildAdded(ref('p'),onP);R.onChildChanged(ref('p'),onP);R.onChildRemoved(ref('p'),s=>dropRemote(s.key));
    const onR=s=>raceFromNet(s.key,s.val());R.onChildAdded(ref('r'),onR);R.onChildChanged(ref('r'),onR);
    f.onSnapshot(f.query(f.collection(net.db,'games','aguadulce-horizon','players'),f.orderBy('xp','desc'),f.limit(15)),snap=>{lb=snap.docs.map(d=>d.data());if(menuTab==='rank'&&!$('menu').hidden)drawMenu()},()=>{});
    netStats();chatInit();hitsInit();addEventListener('pagehide',()=>{try{R.remove(ref('p/'+UID))}catch(e){}})
  }catch(e){console.warn(e);setNet('🔴 Sin servidor','#ff6b6b')}}
function netSend(force){if(!net.on)return;const now=performance.now();if(!force&&now-net.last<95)return;net.last=now;const c=ME;
  const st={n:S.nick,x:r2(c.x),z:r2(c.z),y:r2(c.y),yw:r2(c.yaw),pi:r2(c.pitch),ro:r2(c.roll),v:r2(c.vf),vx:r2(c.vx),vz:r2(c.vz),st:r2(c.steer),ty:c.t,ci:c.ci,no:c.nosOn?1:0,sl:c.slip>3.5?1:0,t:serverNow()};
  socialState(st);footState(st);if(RACE&&RACE.online){st.rid=RACE.rid;st.rp=Math.round(RACE.myProg||0);if(RACE.done)st.ft=r2(RACE.finishT)}
  net.R.set(net.ref('p/'+UID),st).catch(()=>{})}
function netStats(){if(!net.fs)return;const d={nick:S.nick,xp:S.xp||0};for(const k in S)if(k.startsWith('best_')||k.startsWith('trap_'))d[k]=S[k];net.fs.setDoc(net.me,d,{merge:true}).catch(()=>{})}
function remoteState(id,d){let r=remotes[id];if(!r||r.t!==d.ty||r.ci!==d.ci){if(r){scene.remove(r.c.m);r.sp&&r.c.m.remove(r.sp)}const c=newCar(d.ty||0,d.ci||0);Object.assign(c,{x:d.x,z:d.z,y:d.y,yaw:d.yw});const sp=bigSprite(d.n||'?','#fff','rgba(255,45,149,.85)');sp.scale.set(5,.62,1);sp.position.y=2.6;c.m.add(sp);
    r=remotes[id]=Object.assign(r||{},{id,c,sp,t:d.ty,ci:d.ci,buf:[]})}
  r.n=d.n;footRemote(r,d);r.vo=d.vo;r.tk=d.tk;r.rid=d.rid||'';r.rp=d.rp||0;r.ft=d.ft||0;r.seen=performance.now();r.no=d.no;r.sl=d.sl;
  r.buf.push({t:d.t||serverNow(),x:d.x,z:d.z,y:d.y,yaw:d.yw,pi:d.pi||0,ro:d.ro||0,v:d.v||0,vx:d.vx||0,vz:d.vz||0,st:d.st||0});if(r.buf.length>30)r.buf.shift()}
function dropRemote(id){const r=remotes[id];if(!r)return;closePeer(id);scene.remove(r.c.m);delete remotes[id]}
function lerpA(a,b,k){let d=b-a;d=Math.atan2(Math.sin(d),Math.cos(d));return a+d*k}
function updateRemotes(dt){const rt=serverNow()-INTERP,now=performance.now();OTHER.length=0;if(RACE)for(const c of RACE.ai)OTHER.push(c);let n=0;
  for(const id in remotes){const r=remotes[id],c=r.c;if(now-r.seen>8000){c.m.visible=false;continue}c.m.visible=true;n++;const b=r.buf;if(!b.length)continue;let s;
    if(rt<=b[0].t)s=b[0];else if(rt>=b[b.length-1].t){const L=b[b.length-1],ex=Math.min(.35,(rt-L.t)/1000);s={x:L.x+L.vx*ex,z:L.z+L.vz*ex,y:L.y,yaw:L.yaw,pi:L.pi,ro:L.ro,v:L.v,st:L.st}}
    else for(let i=0;i<b.length-1;i++)if(b[i].t<=rt&&rt<=b[i+1].t){const A=b[i],B=b[i+1],k=(rt-A.t)/((B.t-A.t)||1);s={x:A.x+(B.x-A.x)*k,z:A.z+(B.z-A.z)*k,y:A.y+(B.y-A.y)*k,yaw:lerpA(A.yaw,B.yaw,k),pi:A.pi+(B.pi-A.pi)*k,ro:A.ro+(B.ro-A.ro)*k,v:A.v+(B.v-A.v)*k,st:B.st};break}
    Object.assign(c,{x:s.x,z:s.z,y:s.y,yaw:s.yaw,pitch:s.pi,roll:s.ro,vf:s.v,steer:s.st,vl:0,nosOn:!!r.no,slip:r.sl?5:0,vx:(s.v||0)*Math.sin(s.yaw),vz:(s.v||0)*Math.cos(s.yaw),onGround:true});
    poseCar(c,dt);if(!r.fo)carFX(c,dt,false);poseRemoteFoot(r,dt);OTHER.push(c)}
  if(net.on)setNet('🟢 En línea · '+(n+1)+' piloto'+(n?'s':''),'#5dffb0')}

/* carreras online: sala con cuenta atrás, se une quien quiera */
const RACES={};
function openEvent(ev){if(RACE||net.lobby)return;if(!net.on){startRace(ev,{online:false});return}
  const rid=net.R.push(net.ref('r')).key,at=serverNow()+12000,pl={[UID]:{n:S.nick,j:serverNow()}};net.lobby={rid,ev,at,pl};net.R.set(net.ref('r/'+rid),{ev:ev.id,host:UID,hn:S.nick,at,pl});feed('🏁 Sala abierta: tus amigos tienen 12 s para unirse')}
function raceFromNet(rid,d){if(!d)return;RACES[rid]=d;
  if(d.res&&RACE&&RACE.rid===rid){RACE.netRes=d.res;if(!$('results').hidden)showResults(RACE)}
  const ev=EVENTS.find(e=>e.id===d.ev);if(!ev)return;
  if(d.pl&&d.pl[UID]&&!(net.lobby&&net.lobby.rid===rid)&&!(RACE&&RACE.rid===rid)&&d.at>serverNow())net.lobby={rid,ev,at:d.at};
  if(net.lobby&&net.lobby.rid===rid)net.lobby.pl=d.pl;
  if(d.host!==UID&&d.at>serverNow()+1500&&!(d.pl&&d.pl[UID])&&!RACE&&!net.lobby){net.invite={rid,ev,at:d.at,hn:d.hn}}}
function joinInvite(){const iv=net.invite;if(!iv||iv.at<serverNow()+800)return;net.lobby={rid:iv.rid,ev:iv.ev,at:iv.at,pl:Object.assign({},(RACES[iv.rid]||{}).pl,{[UID]:{n:S.nick,j:serverNow()}})};net.R.set(net.ref('r/'+iv.rid+'/pl/'+UID),{n:S.nick,j:serverNow()});net.invite=null;$('invite').hidden=true;
  const p=pathAt(iv.ev.path,0);Object.assign(ME,{x:p.x,z:p.z,yaw:p.yaw,vx:0,vz:0,vf:0,y:surfaceY(p.x,p.z)+.2});feed('🏁 Te has unido a '+iv.ev.name)}
function updateLobby(){if(!net.invite&&!RACE&&!net.lobby){const now=serverNow();for(const rid in RACES){const d=RACES[rid];if(d&&d.host!==UID&&d.at>now+1500&&!(d.pl&&d.pl[UID])){const ev=EVENTS.find(e=>e.id===d.ev);if(ev){net.invite={rid,ev,at:d.at,hn:d.hn};break}}}}const L=net.lobby;if(L){const left=(L.at-serverNow())/1000;const n=L.pl?Object.keys(L.pl).length:1;
    $('evPrompt').hidden=false;$('evPrompt').innerHTML=`🏁 ${L.ev.name} — salida en ${Math.max(0,Math.ceil(left))} s<small>${n} piloto${n>1?'s':''} en la parrilla${n<2?' · si nadie se une, correrás contra la IA':''}</small>`;
    if(left<=0){const pl=L.pl||{[UID]:{j:0}},ids=Object.keys(pl).sort((a,b)=>(pl[a].j||0)-(pl[b].j||0));const grid=Math.max(0,ids.indexOf(UID));net.lobby=null;
      if(ids.length<2)startRace(L.ev,{online:false});else startRace(L.ev,{online:true,rid:L.rid,grid})}}
  const iv=net.invite;if(iv){const left=(iv.at-serverNow())/1000;if(left<1){net.invite=null;$('invite').hidden=true}else{$('invite').hidden=false;$('invite').innerHTML=`🏁 ${esc(iv.hn)} abre «${iv.ev.name}» en ${Math.ceil(left)} s<small>${IS_TOUCH?'Toca aquí':'Pulsa J'} para unirte y correr contra él</small>`}}}
function netRaceResult(R){if(R.online&&net.on)net.R.set(net.ref('r/'+R.rid+'/res/'+UID),{n:S.nick,t:r2(R.finishT)});netStats();
  if(net.fs){const k=R.ev.id;net.fs.setDoc(net.fs.doc(net.db,'games','aguadulce-horizon','times',k+'_'+UID),{ev:k,nick:S.nick,t:r2(S['best_'+k])},{merge:true}).catch(()=>{})}}
const esc=s=>String(s||'').replace(/[<>&"]/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[c]));
function showResults(R){let rows=[];if(R.online&&R.netRes)rows=Object.values(R.netRes).map(x=>({name:x.n,t:x.t}));else rows=R.res.slice();rows.sort((a,b)=>a.t-b.t);
  $('resBody').innerHTML=`<div class="logo" style="font-size:52px">${R.ev.name}</div>`+rows.map((x,i)=>`<div class="row"><h4>${i+1}º ${esc(x.name)}</h4><b>${fmtT(x.t)}</b></div>`).join('')+
    `<div class="row"><small>Tu récord personal</small><b>${S['best_'+R.ev.id]?fmtT(S['best_'+R.ev.id]):'—'}</b></div><div style="display:flex;gap:8px;justify-content:center"><button class="go" id="resAgain" type="button">REPETIR</button><button class="chip" id="resClose" type="button">CONDUCIR LIBRE</button></div>`;
  $('results').hidden=false;$('resClose').onclick=()=>{$('results').hidden=true;endRace(true)};$('resAgain').onclick=()=>{$('results').hidden=true;const ev=R.ev;endRace(true);openEvent(ev)}}

/* ============ HUD ============ */
let bigT,feedN=0;
function bigMsg(t,c){const e=$('big');e.textContent=t;e.style.color=c||'#fff';e.classList.add('show');clearTimeout(bigT);bigT=setTimeout(()=>e.classList.remove('show'),1100)}
function toast(t){bigMsg(t,'#fff')}
function feed(t){const f=$('feed'),d=document.createElement('div');d.textContent=t;f.appendChild(d);setTimeout(()=>d.remove(),6000);while(f.children.length>4)f.firstChild.remove()}
let hudT=0,zoneT=0;const SP=$('speedo').getContext('2d'),MINI=$('mini').getContext('2d');
function drawSpeedo(){const g=SP,W=420,c=210,kmh=Math.round(Math.abs(ME.vf)*3.6);g.clearRect(0,0,W,W);
  g.lineWidth=18;g.strokeStyle='rgba(10,12,18,.55)';g.beginPath();g.arc(c,c,170,Math.PI*.75,Math.PI*2.25);g.stroke();
  const rp=ME.rpm||0;g.strokeStyle=rp>.88?'#ff4d6d':'#ffffff';g.beginPath();g.arc(c,c,170,Math.PI*.75,Math.PI*(.75+1.5*rp));g.stroke();
  g.lineWidth=3;g.strokeStyle='rgba(255,255,255,.5)';for(let i=0;i<=8;i++){const a=Math.PI*(.75+1.5*i/8);g.beginPath();g.moveTo(c+Math.cos(a)*148,c+Math.sin(a)*148);g.lineTo(c+Math.cos(a)*160,c+Math.sin(a)*160);g.stroke()}
  g.fillStyle='#fff';g.textAlign='center';g.font='800 italic 120px "Barlow Condensed",Impact,sans-serif';g.fillText(kmh,c,c+30);g.font='800 30px "Barlow Condensed",Impact,sans-serif';g.fillStyle='#9fb3cf';g.fillText('KM/H',c,c+68);
  g.fillStyle='#ff2d95';g.font='800 italic 54px "Barlow Condensed",Impact,sans-serif';g.fillText(ME.gear<0?'R':ME.vf<.5&&ME.gear===1?'N':ME.gear,c,c-62);
  g.fillStyle='rgba(10,12,18,.6)';g.fillRect(c-100,c+92,200,18);g.fillStyle=ME.nosOn?'#9fe0ff':'#3cb4ff';g.fillRect(c-100,c+92,200*ME.nos,18);g.font='700 18px system-ui';g.fillStyle='#fff';g.fillText('NITRO',c,c+138)}
function drawMini(){const FP=FOOT.on?FOOT:ME;const g=MINI,W=340,c=170,span=RACE?420:300,sc=W/span,sp=TW/WM,sw=span*sp;g.clearRect(0,0,W,W);g.save();g.beginPath();g.arc(c,c,c,0,TAU);g.clip();g.translate(c,c);g.rotate(Math.PI+FP.yaw);
  g.drawImage(groundCv,FP.x*sp-sw/2,FP.z*sp-sw/2,sw,sw,-c,-c,W,W);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-c,-c,W,W);
  const P2=(x,z)=>[(x-FP.x)*sc,(z-FP.z)*sc];
  if(RACE){const p=RACE.ev.path.P;g.strokeStyle='#3cb4ff';g.lineWidth=7;g.lineCap='round';g.lineJoin='round';g.beginPath();for(let i=0;i<p.length;i+=8){const q=P2(p[i],p[i+1]);i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])}g.stroke();
    const cp=RACE.ev.cps[RACE.cp];if(cp!==undefined){const q=pathAt(RACE.ev.path,cp),v=P2(q.x,q.z);g.fillStyle='#fff';g.beginPath();g.arc(v[0],v[1],8,0,TAU);g.fill()}
    for(const a of RACE.ai){const v=P2(a.x,a.z);g.fillStyle='#ffb347';g.beginPath();g.arc(v[0],v[1],6,0,TAU);g.fill()}}
  else for(const m of EVMARK){const v=P2(m.x,m.z);if(Math.hypot(v[0],v[1])>c+10){const a=Math.atan2(v[1],v[0]);v[0]=Math.cos(a)*(c-12);v[1]=Math.sin(a)*(c-12)}g.fillStyle='#ff2d95';g.beginPath();g.arc(v[0],v[1],9,0,TAU);g.fill();g.fillStyle='#fff';g.font='bold 12px system-ui';g.textAlign='center';g.fillText('🏁',v[0],v[1]+4)}
  drawGpsMini(g,P2);drawOpsMini(g,P2);for(const id in remotes){const r=remotes[id];if(!r.c.m.visible)continue;const v=P2(r.c.x,r.c.z);g.fillStyle='#ffd54a';g.beginPath();g.arc(v[0],v[1],8,0,TAU);g.fill()}
  g.restore();g.fillStyle='#ff2d95';g.beginPath();g.moveTo(c,c-14);g.lineTo(c+10,c+12);g.lineTo(c,c+6);g.lineTo(c-10,c+12);g.closePath();g.fill();g.strokeStyle='#fff';g.lineWidth=2;g.stroke()}
function updateHud(dt){hudT-=dt;if(hudT>0)return;hudT=1/30;drawSpeedo();drawMini();
  zoneT-=1/30;if(zoneT<=0){zoneT=.5;{const fp=FOOT.on?FOOT:ME;$('zone').textContent=(streetName(fp.x,fp.z)||'Aguadulce')+' · '+Math.round(H(fp.x,fp.z))+' m'}const xp=S.xp||0,lv=1+Math.floor(Math.sqrt(xp/400));if(!window.__dbg)$('lvl').textContent=`NIVEL ${lv} · ${xp.toLocaleString('es-ES')} XP`}
  if(RACE){const [pos,tot]=racePosition();$('rPos').innerHTML=`${pos}<small>/${tot}</small>`;const R=RACE;$('rInfo').textContent=`${R.ev.name.toUpperCase()} · ${R.ev.laps>1?'VUELTA '+(R.lap+1)+'/'+R.ev.laps+' · ':''}CONTROL ${Math.min(R.cp+1,R.ev.cps.length)}/${R.ev.cps.length} · ${fmtT(Math.max(0,R.done?R.finishT:R.t))}`}
  // aviso de evento cercano
  if(!RACE&&!net.lobby){let near=null;for(const m of EVMARK)if(Math.hypot(ME.x-m.x,ME.z-m.z)<9)near=m;nearEv=near;const p=$('evPrompt');
    if(near){p.hidden=false;p.innerHTML=`🏁 ${near.e.name}<small>${near.e.desc} ${(near.e.path.len/1000).toFixed(1)} km${near.e.laps>1?' · '+near.e.laps+' vueltas':''} · ${IS_TOUCH?'Toca aquí':'Pulsa ENTER'} para empezar${S['best_'+near.e.id]?' · Récord: '+fmtT(S['best_'+near.e.id]):''}</small>`}else p.hidden=true}}
let nearEv=null;

/* ============ MENÚ: garaje, eventos, ranking ============ */
let menuTab='car';
function drawMenu(){const T=[['car','GARAJE'],['ev','EVENTOS'],['rank','RANKING'],['set','AJUSTES'],['help','CONTROLES']];$('tabs').innerHTML=T.map(t=>`<button class="tab${menuTab===t[0]?' on':''}" data-t="${t[0]}" type="button">${t[1]}</button>`).join('');
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{menuTab=b.dataset.t;drawMenu()});let h='';
  if(menuTab==='car'){h='<div class="grid">'+CARS.map((c,i)=>`<div class="card${S.car===i?' on':''}" data-c="${i}"><h4>${c.n}</h4><small>Punta ${Math.round(c.vmax*3.6)} km/h</small><div class="bar"><i style="width:${c.vmax/92*100}%"></i></div><small>Aceleración</small><div class="bar"><i style="width:${c.acc/12.5*100}%"></i></div><small>Agarre</small><div class="bar"><i style="width:${c.grip/9.4*100}%"></i></div></div>`).join('')+'</div>';
    h+='<div class="row"><small>Color</small><div class="sw">'+PAINT.map((p,i)=>`<button type="button" data-p="${i}" class="${S.col===i?'on':''}" style="background:${p}" aria-label="Color ${i+1}"></button>`).join('')+'</div></div>'}
  else if(menuTab==='ev')h=fbMenuHTML()+EVENTS.map(e=>`<div class="row"><div><h4>🏁 ${e.name}</h4><small>${e.desc} ${(e.path.len/1000).toFixed(1)} km · desnivel ${Math.round(Math.abs(H(e.path.P[e.path.P.length-2],e.path.P[e.path.P.length-1])-H(e.path.P[0],e.path.P[1])))} m${e.laps>1?' · '+e.laps+' vueltas':''} · Récord: ${S['best_'+e.id]?fmtT(S['best_'+e.id]):'—'}</small></div><button class="btn" data-e="${e.id}" type="button">IR</button></div>`).join('');
  else if(menuTab==='rank')h=lb.length?lb.map((p,i)=>`<div class="row"><h4>${i+1}. ${esc(p.nick)}</h4><small>${(p.xp||0).toLocaleString('es-ES')} XP</small></div>`).join(''):'<div class="row"><small>Aún no hay datos (hace falta conexión).</small></div>';
  else if(menuTab==='set')h=settingsHTML();
  else if(menuTab==='ops')h=opsMenuHTML();
  else h='<div class="row"><small><b>Teclado:</b> W/↑ gas · S/↓ freno/atrás · A/D girar · Espacio derrape · Mayús nitro · C cámara · B mirar atrás · R recolocar · Enter empezar · J unirse · <b>M mapa y GPS</b> (clic = poner marca, clic derecho = quitar la última) · <b>T chat</b> · <b>V hablar</b> (activa la voz con el botón 🎙) · Esc/P menú<br><b>Mando:</b> RT gas · LT freno · stick izquierdo · A derrape · X nitro · Y cámara<br><b>⚽ Fútbol:</b> WASD mover · Mayús sprint · Espacio tiro (mantén para cargar; con el stick eliges palo) o entrada si no tienes el balón · E pase (sin balón: pedir el pase) · Q centro / pase al hueco · C cámara Pro/TV · Esc abandonar. Mando: A pase · B tiro · X centro · RT sprint<br><b>Móvil:</b> desliza la barra de dirección, pedales a la derecha. Toca el minimapa para abrir el mapa y poner marcas; 💬 para escribir; 🎙 para la voz y mantén HABLAR.</small></div><div class="row"><small>Mapa, calles y edificios: © colaboradores de OpenStreetMap. Alturas: EU-DEM (Copernicus) vía OpenTopoData. Edificios (planta exacta y número de plantas) y piscinas: © Dirección General del Catastro (datos INSPIRE). Suelo: ortofoto PNOA y relieve MDT05 © Instituto Geográfico Nacional (CC BY 4.0, scne.es). Señales, semáforos, farolas y bancos situados según las fotos de calle de Mapillary (CC BY-SA). Sonidos de motor, derrape y golpes: grabaciones del simulador libre TORCS (licencia GPL). Los rótulos con nombre propio son negocios que figuran en OpenStreetMap; los genéricos (BAR, FARMACIA…) son decorativos.</small></div>';
  $('mbody').innerHTML=h;if(menuTab==='set')bindSettings();if(menuTab==='ops')bindOpsMenu();if(menuTab==='ev')bindFbMenu();
  document.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{S.car=+b.dataset.c;save();setCarType(ME,S.car,S.col||0);drawMenu()});
  document.querySelectorAll('[data-p]').forEach(b=>b.onclick=()=>{S.col=+b.dataset.p;save();setCarType(ME,S.car||0,S.col);drawMenu()});
  document.querySelectorAll('[data-e]').forEach(b=>b.onclick=()=>{const e=EVENTS.find(q=>q.id===b.dataset.e);if(RACE)endRace(true);const p=pathAt(e.path,0),q=pathAt(e.path,-14);Object.assign(ME,{x:p.x-Math.sin(p.yaw)*14,z:p.z-Math.cos(p.yaw)*14,yaw:p.yaw,vx:0,vz:0,vf:0,y:surfaceY(p.x,p.z)+.3});toggleMenu(false)})}
function toggleMenu(v){const m=$('menu'),s=v===undefined?m.hidden:v;m.hidden=!s;if(s)drawMenu()}

/* ============ CONTROLES: teclado, mando, táctil ============ */
const keys={},tc={gas:0,brk:0,hb:0,nos:0,steer:0};let camMode=0;
function readInput(){const gp=navigator.getGamepads?[...navigator.getGamepads()].find(Boolean):null;let thr=0,brk=0,str=0,hb=false,nos=false;
  if(keys.KeyW||keys.ArrowUp)thr=1;if(keys.KeyS||keys.ArrowDown)brk=1;str=(keys.KeyA||keys.ArrowLeft?1:0)-(keys.KeyD||keys.ArrowRight?1:0);hb=!!keys.Space;nos=!!(keys.ShiftLeft||keys.ShiftRight||keys.KeyN);
  if(gp){const ax=gp.axes[0]||0;if(Math.abs(ax)>.12)str=-ax;const rt=gp.buttons[7]?gp.buttons[7].value:0,lt=gp.buttons[6]?gp.buttons[6].value:0;thr=Math.max(thr,rt);brk=Math.max(brk,lt);hb=hb||!!(gp.buttons[0]&&gp.buttons[0].pressed);nos=nos||!!(gp.buttons[2]&&gp.buttons[2].pressed);
    if(gp.buttons[3]&&gp.buttons[3].pressed&&!readInput.y){camMode=(camMode+1)%3}readInput.y=gp.buttons[3]&&gp.buttons[3].pressed}
  thr=Math.max(thr,tc.gas);brk=Math.max(brk,tc.brk);if(tc.steer)str=tc.steer;hb=hb||!!tc.hb;nos=nos||!!tc.nos;return{thr,brk,str:clamp(str,-1,1),hb,nos}}
function initInput(){
  addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;keys[e.code]=true;audio();if(['Space','ArrowUp','ArrowDown','Tab'].includes(e.code))e.preventDefault();if(e.repeat)return;
    if(e.code==='KeyC'&&!FOOT.on)camMode=(camMode+1)%3;if(e.code==='KeyR'&&!FOOT.on)resetToTrack();if(e.code==='KeyM'){if(!$('menu').hidden)toggleMenu(false);openMap()}if(e.code==='Escape'){if(MAP.open)openMap(false);else if(CHAT.open)openChat(false);else toggleMenu()}if(e.code==='KeyP')toggleMenu();if(e.code==='KeyJ')joinInvite();
    if(e.code==='Enter'&&nearEv&&!RACE&&!FOOT.on)openEvent(nearEv.e);if(e.code==='Backspace'&&RACE&&!RACE.done)endRace()});
  addEventListener('keyup',e=>{keys[e.code]=false});addEventListener('blur',()=>{for(const k in keys)keys[k]=false});
  $('menuBtn').onclick=()=>toggleMenu(true);$('closeMenu').onclick=()=>toggleMenu(false);
  $('evPrompt').addEventListener('click',()=>{if(nearEv&&!RACE&&!net.lobby)openEvent(nearEv.e)});$('invite').addEventListener('click',joinInvite);
  // táctil: barra de dirección a la izquierda, pedales a la derecha
  const zone=$('steerZone'),bar=$('steerBar'),knob=$('steerKnob');let sid=null,sx=0;
  const setSteer=v=>{tc.steer=v;knob.style.transform=`translateX(${-v*73}px)`};
  zone.addEventListener('touchstart',e=>{e.preventDefault();audio();const t=e.changedTouches[0];sid=t.identifier;sx=t.clientX;setSteer(0)},{passive:false});
  zone.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier===sid)setSteer(clamp(-(t.clientX-sx)/(70/((S.set&&S.set.sens)||1)),-1,1))},{passive:false});
  const ze=e=>{for(const t of e.changedTouches)if(t.identifier===sid){sid=null;setSteer(0)}};zone.addEventListener('touchend',ze);zone.addEventListener('touchcancel',ze);
  const bind=(id,k)=>{const b=$(id);const dn=e=>{e.preventDefault();audio();b.classList.add('down');if(typeof k==='function')k();else tc[k]=1},up=e=>{e.preventDefault();b.classList.remove('down');if(typeof k!=='function')tc[k]=0};
    b.addEventListener('touchstart',dn,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});b.addEventListener('mousedown',dn);b.addEventListener('mouseup',up)};
  bind('bGas','gas');bind('bBrk','brk');bind('bHb','hb');bind('bNos','nos');bind('bCam',()=>camMode=(camMode+1)%3);bind('bRst',resetToTrack);
  $('rot').onclick=()=>$('rot').remove();document.addEventListener('contextmenu',e=>e.preventDefault());
  document.addEventListener('touchmove',e=>{if($('menu').hidden&&$('login').hidden&&$('results').hidden&&!CHAT.open)e.preventDefault()},{passive:false})}

/* ============ CÁMARA ============ */
const camP=new THREE.Vector3(),camL=new THREE.Vector3();let camInit=false,camYaw=0;
function updateCamera(dt){const c=ME,T=CARS[c.t],sp=Math.hypot(c.vx,c.vz);
  const mvYaw=sp>3?Math.atan2(c.vx,c.vz):c.yaw;let tgtYaw=c.vf<-1?c.yaw:lerpA(c.yaw,mvYaw,.35);if(keys.KeyB)tgtYaw+=Math.PI;camYaw=lerpA(camYaw,tgtYaw,Math.min(1,dt*(camInit?4.5:99)));
  let dist,hgt,look;if(camMode===0){dist=T.L+3.6+sp*.02;hgt=1.75+(T.lift?.3:0);look=1.1}else if(camMode===1){dist=T.L+7;hgt=3.2;look=1.2}else{dist=-.3;hgt=1.32+(T.lift||0);look=1.2}
  const fx=Math.sin(camYaw),fz=Math.cos(camYaw);const tx=c.x-fx*dist,tz=c.z-fz*dist;let ty=Math.max(c.y+hgt,GH(tx,tz,c.y)+1.2);ty=Math.min(ty,strCeil(c.x,c.z,c.y)-.3);
  const inside=camMode===2&&c.m.userData.int;
  if(inside){// vista desde el asiento del conductor: la cámara va pegada a la carrocería (cabeceo y balanceo incluidos)
    const I=c.m.userData.int,b=c.m.userData.body;c.m.updateMatrixWorld(true);const e=I.eye.clone(),fw=new THREE.Vector3(I.eye.x,I.eye.y-.55,I.eye.z+12);if(keys.KeyB){fw.set(I.eye.x,I.eye.y-.1,I.eye.z-12)}
    b.localToWorld(e);b.localToWorld(fw);camP.copy(e);camL.copy(fw);const up=new THREE.Vector3(0,1,0).applyQuaternion(b.getWorldQuaternion(new THREE.Quaternion()));camera.up.copy(up)}
  else if(camMode===2){camP.set(c.x+Math.sin(c.yaw)*.35,c.y+hgt,c.z+Math.cos(c.yaw)*.35);camL.set(c.x+Math.sin(c.yaw)*20,c.y+hgt-.6+Math.sin(-c.pitch)*-20,c.z+Math.cos(c.yaw)*20)}
  else{const tgt=new THREE.Vector3(tx,ty,tz);if(!camInit)camP.copy(tgt);const kx=Math.min(1,dt*10),ky=Math.min(1,dt*5);camP.x+=(tgt.x-camP.x)*kx;camP.z+=(tgt.z-camP.z)*kx;camP.y+=(tgt.y-camP.y)*ky;const h2=GH(camP.x,camP.z,c.y)+.8;if(camP.y<h2)camP.y=h2;const hc=strCeil(c.x,c.z,c.y)-.3;if(camP.y>hc)camP.y=hc;camL.set(c.x+fx*4,c.y+look,c.z+fz*4)}
  if(!inside&&camera.up.y!==1)camera.up.set(0,1,0);
  {const nr=inside?.12:.45;if(camera.near!==nr){camera.near=nr;camera.updateProjectionMatrix()}const gm=c.m.userData.glass;if(gm){const op=inside?.1:.4;if(gm.opacity!==op)gm.opacity=op}}
  camera.position.copy(camP);if(shakeT>0){shakeT-=dt;camera.position.x+=rnd(-.12,.12)*shakeT*3;camera.position.y+=rnd(-.12,.12)*shakeT*3}camera.lookAt(camL);camInit=true;
  const f=(camMode===2?(inside?66:70):62)+clamp(sp-15,0,70)*.28+(c.nosOn?6:0);if(Math.abs(camera.fov-f)>.1){camera.fov+=(f-camera.fov)*Math.min(1,dt*3);camera.updateProjectionMatrix()}
  $('flash').style.background=c.nosOn?'radial-gradient(ellipse at center,transparent 50%,rgba(60,150,255,.28))':'radial-gradient(ellipse at center,transparent 55%,rgba(60,150,255,0))';
  sunFollow(c.x,c.y,c.z);skyMesh.position.copy(camera.position)}

/* ============ BUCLE ============ */
let ME=null,time=0,last=performance.now(),started=false;
/* límite de fotogramas: en el móvil 30 fps por defecto para que no se caliente */
/* todo lo construido hasta aquí es escenario fijo: sus matrices se calculan una vez y three.js deja de recalcularlas cada fotograma */
function freezeStatic(){let n=0;scene.updateMatrixWorld(true);scene.traverse(o=>{if(o===scene||o.isLight||o.isCamera||o.userData.dyn)return;o.matrixAutoUpdate=false;if(window.__fzchk)o.userData._fz=o.position.x+','+o.position.y+','+o.position.z+','+o.rotation.y+','+o.scale.x;n++});return n}
let _lfn=0;function fpsCap(){const st=S.set||{};return st.fps!==undefined?st.fps:(IS_TOUCH?30:0)}
function frame(now){requestAnimationFrame(frame);const cap=fpsCap();if(cap&&started&&now-_lfn<1000/cap-3)return;_lfn=now;try{frame2(now)}catch(e){showErr('FRAME '+e.message+' '+(e.stack||'').split('\n')[1]);window.__fe=e.stack}}
function frame2(now){const dt=Math.min(.05,(now-last)/1000);last=now;time+=dt;
  if(!started){camYaw+=dt*.05;const c=ME,R0=location.hash==='#show'?7:14;camera.position.set(c.x+Math.sin(time*.25)*R0,c.y+(R0<10?1.8:4),c.z+Math.cos(time*.25)*R0);camera.lookAt(c.x,c.y+1,c.z);poseCar(ME,0);skyMesh.position.copy(camera.position);renderer.render(scene,camera);return}
  let inp=readInput();if(window.__auto&&RACE&&RACE.t>=0)inp=autoPilot();if(RACE&&RACE.t<0){inp={thr:0,brk:0,str:0,hb:false,nos:false};ME.vx=ME.vz=ME.vf=0}if(!$('menu').hidden||!$('results').hidden||MAP.open||FOOT.on)inp={thr:0,brk:FOOT.on?1:.3,str:0,hb:false,nos:false};
  updateRemotes(dt);updateTraffic(dt);const sub=Math.hypot(ME.vx,ME.vz)>30?2:1;if(FOOT.on){/* aparcado con el freno de mano: no se mueve ni rueda cuesta abajo */if(ME.park===undefined)ME.park=[ME.x,ME.z,ME.yaw];ME.x=ME.park[0];ME.z=ME.park[1];ME.yaw=ME.park[2];ME.vx=ME.vz=ME.vf=0;if('yawRate' in ME)ME.yawRate=0;if("vy" in ME)ME.vy=0}else{ME.park=undefined;for(let i=0;i<sub;i++)stepCar(ME,dt/sub,inp);}poseCar(ME,dt);carLights(ME,inp.brk>.1&&ME.vf>.5);carFX(ME,dt,true);
  engineSet(ME.rpm,inp.thr,ME.slip,ME.nosOn,dt);if(FOOT.on&&ENG)ENG.out.gain.setTargetAtTime(.04,AC.currentTime,.2);if(FB.on){if($('menu').hidden&&$('results').hidden)updateFutbol(dt)}else if(FOOT.on&&!$('menu').hidden===false)updateFoot(dt);else if(FOOT.on&&FOOT.m)opPose(FOOT.m,FOOT.t,0,FOOT.pitch,FOOT.wi,FOOT.stance,0);updateOps(dt);updateTLights();updateRace(dt);updateSocial(dt);updateLobby();updateTraps(dt);updateFX(dt);updatePitchPrompt(dt);if(FB.on)fbCamera(dt);else if(FOOT.on)updateFootCamera(dt);else updateCamera(dt);if(window.__cam){const q=window.__cam;camera.position.set(q[0],q[1],q[2]);camera.lookAt(q[3],q[4],q[5]);skyMesh.position.copy(camera.position)}camera.updateMatrixWorld();cullDeco();
  if(window.__wtx){}if(POOLMAT&&POOLMAT.map){POOLMAT.map.offset.x+=dt*.03;POOLMAT.map.offset.y+=dt*.017}if(seaMat&&seaMat.map){seaMat.map.offset.x+=dt*.004;seaMat.map.offset.y+=dt*.002}
  netSend(false);updateHud(dt);const t0=performance.now();if(!window.__nr)renderScene(dt);const rt=performance.now()-t0;autoQ(dt);
  if(window.__dbg){dbg.n++;dbg.t+=dt;dbg.r+=rt;dbg.f+=t0-now;if(dbg.t>1){const i=renderer.info.render;$('lvl').textContent=`fps ${dbg.n} · render ${(dbg.r/dbg.n).toFixed(1)}ms · logic ${(dbg.f/dbg.n).toFixed(1)}ms · calls ${i.calls} · tris ${i.triangles/1000|0}k · q${aq.stage} · t ${RACE?RACE.t.toFixed(2):'-'} · sr ${window.__sr||0} · v ${ME.vf.toFixed(1)}`;dbg.n=dbg.t=dbg.r=dbg.f=0}}}
const dbg={n:0,t:0,r:0,f:0};
let aq={t:0,n:0,stage:0};
function autoQ(dt){if(aq.stage>=3)return;aq.t+=dt;aq.n++;if(aq.t<5)return;const fps=aq.n/aq.t;aq.t=0;aq.n=0;const cp=fpsCap();if(fps>=(cp?cp*.85:45)){aq.stage=3;return}
  if(aq.stage===0){if(POST.on)POST.on=false;else{renderer.setPixelRatio(1);resize()}aq.stage=1}else if(aq.stage===1&&HQ){sun.castShadow=false;aq.stage=2}else{scene.fog.density*=1.25;camera.far*=.8;camera.updateProjectionMatrix();aq.stage=3}}
function spawnPoint(){const m=WD.markers.start,x=m[0]*K,z=m[1]*K;const rn=roadNear(x,z,1,4,false);if(rn){const s=rn.s;return{x:(s.ax+s.bx)/2,z:(s.az+s.bz)/2,yaw:Math.atan2(s.bx-s.ax,s.bz-s.az)}}return{x,z,yaw:0}}
let apRev=0,apStuck=0;function autoPilot(){if(apRev>0){apRev-=1/60;return{thr:0,brk:1,str:apRev>.6?-1:0,hb:false,nos:false}}if(Math.abs(ME.vf)<1.5&&RACE.t>2){apStuck+=1/60;if(apStuck>1){apStuck=0;apRev=1.4}}else apStuck=0;const R=RACE,pr=projectOnPath(R.ev.path,ME.x,ME.z,R.hint,80),p=pathAt(R.ev.path,pr.d+7+Math.abs(ME.vf)*.3);let d=Math.atan2(p.x-ME.x,p.z-ME.z)-ME.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));let vt=99;for(let k=8;k<=70;k+=8){const q=pathAt(R.ev.path,pr.d+k);vt=Math.min(vt,Math.sqrt(9*Math.max(5,q.R))+k*.35)}return{thr:ME.vf<vt?1:0,brk:ME.vf>vt+4?1:0,str:clamp(d*2.2,-1,1),hb:false,nos:ME.vf<vt-10}}
function step(t){$('loadT').textContent=t}
function boot(){
  const tasks=[['MAPA',()=>{loadBlds();console.log('env publicos',assignPublic());buildSea();buildRoadIdx();loadDEM();const terr=()=>{buildTerrainGrid();conformTerrain();shoreFix();flattenPitches();flattenPort();return strFinish()};// si al terminar se descarta algún puente, se rehace el terreno sin sus rebajes
      for(let k=0;k<6&&terr();k++){}}],['TEXTURAS',()=>{makeTextures();makeTextures2();TX.atlas=paintAtlas();initScene()}],['ORTOFOTO PNOA',()=>ORTHO_P],['TERRENO',buildGround],['CALLES',buildRoads],
    ['EDIFICIOS',()=>buildBuildings(renderer.capabilities.isWebGL2)],['RÓTULOS',()=>{console.log('env pub',JSON.stringify(buildPublic()));buildSigns()}],['PALMERAS Y FAROLAS',buildDecor],['RUTAS',()=>{buildGraph();defineEvents();buildEventMarkers();buildTraps();buildTraffic()}],['CALLES Y JARDINES',()=>{const a=buildStreetLife(),b=buildNature(),pl=buildPools(),sd=buildStreetDetail();console.log('env detail',JSON.stringify(sd),JSON.stringify(buildMapillary()));console.log('pools',pl);console.log('env',JSON.stringify(a),JSON.stringify(b))}],['PARQUES',()=>console.log('env parques',JSON.stringify(buildParks()),JSON.stringify(buildPK()))],['PUERTO',()=>console.log('env puerto',JSON.stringify(buildPort()))],['CAMPOS DE FÚTBOL',()=>console.log('env futbol',JSON.stringify(buildFutbol()))],
    ['AJUSTE DEL TERRENO',()=>{console.log('env carve',JSON.stringify(carveGround()));console.log('env frozen',freezeStatic())}],
    ['COCHE',()=>{initSkids();ME=newCar(S.car||0,S.col||0);const s=spawnPoint();Object.assign(ME,{x:s.x,z:s.z,yaw:s.yaw,y:surfaceY(s.x,s.z)});camYaw=s.yaw;initInput()}]];
  let i=0;const next=()=>{if(i>=tasks.length){$('load').hidden=true;requestAnimationFrame(frame);if(S.nick&&location.hash!=='#show')startGame();else if(location.hash!=='#show')$('login').hidden=false;return}const t=tasks[i++];step(t[0]+'…');
    setTimeout(()=>{try{const t0=performance.now();Promise.resolve(t[1]()).then(()=>{(window.__bt=window.__bt||{})[t[0]]=Math.round(performance.now()-t0);next()})}catch(e){$('loadT').textContent='Error ('+t[0]+'): '+e.message;console.error(e)}},20)};next()}
function startGame(){$('login').hidden=true;$('hud').hidden=false;if(IS_TOUCH){$('touch').hidden=false;document.body.classList.add('touchUI','playing')}started=true;audio();initSocial();initSettings();initFootInput();initFutbol();initPost();initFull();goFull();netInit();bigMsg('¡A RODAR!','#ff2d95');devHash()}
function devHash(){const h=location.hash.slice(1);if(!h)return;const e=EVENTS.find(q=>q.id===h.replace('-debug',''));if(h.endsWith('-debug'))window.__dbg=1;if(e){startRace(e,{online:false})}if(h.includes('dbg'))window.__dbg=1;if(h.includes('nr'))window.__nr=1;if(h.includes('auto')){window.__auto=1;const e2=EVENTS.find(q=>h.startsWith(q.id));if(e2&&!RACE)startRace(e2,{online:false})}}
$('lf').addEventListener('submit',e=>{e.preventDefault();const n=$('nick').value.trim().slice(0,14);if(!n)return;S.nick=n;save();startGame()});
if(typeof THREE==='undefined')$('loadT').textContent='No se pudo cargar el motor 3D (¿sin internet?)';else setTimeout(boot,30);
window.__g={get scene_(){return scene},net,RACES,get ME(){return ME},EVENTS,get RACE(){return RACE},remotes,S,H,keys,get renderer(){return renderer},startRace,tc};
</script>
</body>
</html>
