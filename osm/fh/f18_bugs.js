
/* ============ «REPORTAR FALLO»: el jugador marca un fallo del mapa y queda en la cola de los bots ============
   se guarda en Firebase (fh/bugs) con la posición exacta, la orientación, una nota y una miniatura de la pantalla;
   el bot Inspector la recoge en su siguiente turno y el Mecánico la arregla */
const BUILD_ID='__BUILD__';
function bugShot(){try{renderer.render(scene,camera);const s=renderer.domElement,c=cvs(384,Math.round(384*s.height/s.width)),g=c.getContext('2d');g.drawImage(s,0,0,c.width,c.height);return c.toDataURL('image/jpeg',.62)}catch(e){return''}}
function bugQueue(r){let q=[];try{q=JSON.parse(localStorage.getItem('fhBugsQ')||'[]')}catch(e){}if(r)q.push(r);q=q.slice(-10);try{localStorage.setItem('fhBugsQ',JSON.stringify(q))}catch(e){}return q}
/* el informe va en fh/bugs (ligero, lo leen los bots) y la miniatura aparte en fh/bugimg/<id> */
function bugPush(r){const {img,...meta}=r;return net.R.push(net.ref('bugs'),meta).then(k=>{if(img)return net.R.set(net.ref('bugimg/'+k.key),img).catch(()=>{})})}
function bugFlush(){if(!net.on)return;const q=bugQueue();if(!q.length)return;try{localStorage.setItem('fhBugsQ','[]')}catch(e){}for(const r of q)bugPush(r).catch(()=>bugQueue(r))}
function bugOpen(){const d=$('bugDlg');if(!d)return;const c=(typeof FOOT!=='undefined'&&FOOT.on)?FOOT:ME;if(!c)return;d._r={x:r2(c.x),y:r2(c.y),z:r2(c.z),yaw:r2(c.yaw||0),cam:camera?[r2(camera.position.x),r2(camera.position.y),r2(camera.position.z)]:null,
    pie:!!(typeof FOOT!=='undefined'&&FOOT.on),img:bugShot(),v:BUILD_ID,ql:QL,mob:!!IS_TOUCH,nick:(window.S&&S.nick)||'',calle:($('zone')&&$('zone').textContent)||''};
  d.hidden=false;$('bugIn').value='';setTimeout(()=>$('bugIn').focus(),30)}
function bugSend(){const d=$('bugDlg'),r=d._r;if(!r)return;r.nota=$('bugIn').value.trim().slice(0,300);r.t=typeof serverNow==='function'?serverNow():Date.now();d.hidden=true;
  if(net.on){bugPush(r).then(()=>bugToast('✅ Fallo enviado. Los bots lo revisarán esta noche.')).catch(()=>{bugQueue(r);bugToast('Guardado; se enviará al conectar.')})}
  else{bugQueue(r);bugToast('Sin servidor: guardado, se enviará al conectar.')}}
function bugToast(t){const e=$('bugToast');if(!e)return;e.textContent=t;e.hidden=false;clearTimeout(e._t);e._t=setTimeout(()=>e.hidden=true,3500)}
function bugInit(){const b=$('bugBtn');if(!b)return;b.onclick=bugOpen;$('bugOk').onclick=bugSend;$('bugNo').onclick=()=>$('bugDlg').hidden=true;
  $('bugIn').addEventListener('keydown',e=>{if(e.key==='Enter'){bugSend();e.preventDefault()}if(e.key==='Escape')$('bugDlg').hidden=true;e.stopPropagation()});setInterval(bugFlush,30000)}
