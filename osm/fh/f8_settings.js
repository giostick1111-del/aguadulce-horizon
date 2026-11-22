
/* ============ AJUSTES: editor de botones en pantalla, volumen, sensibilidad ============ */
const LAYOUT_IDS=[['steerBar','Dirección'],['bGas','Gas'],['bBrk','Freno'],['bHb','Derrape'],['bNos','Nitro'],['bCam','Cámara'],['bRst','Recolocar'],['bTalk','Hablar'],['bExit','Bajar del coche'],['chat','Chat'],['speedo','Velocímetro']];
let MG=null;
function applySettings(){S.set=S.set||{};const st=S.set;TRF.on=false;
  if(MG)MG.gain.value=st.vol===undefined?1:st.vol;
  document.querySelectorAll('audio').forEach(a=>a.volume=st.vvol===undefined?1:st.vvol);
  document.documentElement.style.setProperty('--btnop',st.op===undefined?1:st.op);applyLayout()}
function applyLayout(){const L=(S.set&&S.set.lay)||{};
  for(const [id] of LAYOUT_IDS){const e=$(id);if(!e)continue;const p=L[id];
    if(p){Object.assign(e.style,{left:(p.x*innerWidth)+'px',top:(p.y*innerHeight)+'px',right:'auto',bottom:'auto',transform:`translate(-50%,-50%) scale(${p.s||1})`,transformOrigin:'50% 50%'})}
    else{for(const k of ['left','top','right','bottom','transform','transformOrigin'])e.style[k]=''}}
  // la zona táctil de la dirección sigue a la barra
  const z=$('steerZone'),b=$('steerBar');if(L.steerBar){const r=b.getBoundingClientRect();Object.assign(z.style,{left:Math.max(0,r.left-90)+'px',top:Math.max(0,r.top-110)+'px',width:(r.width+180)+'px',height:(r.height+200)+'px',bottom:'auto'})}else for(const k of ['left','top','width','height','bottom'])z.style[k]=''}
addEventListener('resize',()=>{if(S&&S.set)applyLayout()});

/* editor: arrastra cada control; el seleccionado se puede agrandar o encoger */
const ED={on:false,sel:null,drag:null};
function openEditor(){toggleMenu(false);ED.on=true;document.body.classList.add('editing');$('touch').hidden=false;$('bTalk').hidden=false;$('hud').hidden=false;$('edit').hidden=false;ED.sel=null;edUI()}
function closeEditor(save){ED.on=false;document.body.classList.remove('editing');$('edit').hidden=true;if(!IS_TOUCH)$('touch').hidden=true;voiceUI();if(save){S.set.lay=S.set.lay||{};save_()}else{S.set.lay=ED.backup;applyLayout()}}
function save_(){save();applyLayout()}
function edUI(){const s=ED.sel,L=S.set.lay||{};$('edSel').innerHTML=s?`<b>${LAYOUT_IDS.find(q=>q[0]===s)[1]}</b> · tamaño <input id="edSize" type="range" min="0.5" max="1.8" step="0.05" value="${(L[s]&&L[s].s)||1}">`:'Arrastra cualquier botón (o el chat) a donde quieras. Tócalo para cambiar su tamaño.';
  const r=$('edSize');if(r)r.oninput=()=>{const p=curPos(s);p.s=+r.value;S.set.lay[s]=p;applyLayout();mark()};mark()}
function mark(){for(const [id] of LAYOUT_IDS){const e=$(id);if(e)e.classList.toggle('edsel',id===ED.sel)}}
function curPos(id){const L=S.set.lay=S.set.lay||{};if(L[id])return Object.assign({},L[id]);const r=$(id).getBoundingClientRect();return{x:(r.left+r.width/2)/innerWidth,y:(r.top+r.height/2)/innerHeight,s:1}}
function initEditor(){const ov=$('edit');
  ov.addEventListener('pointerdown',e=>{if(e.target.closest('#edBar'))return;e.preventDefault();let hit=null;
    for(const [id] of LAYOUT_IDS){const el=$(id);if(!el)continue;const r=el.getBoundingClientRect();if(r.width&&e.clientX>=r.left-8&&e.clientX<=r.right+8&&e.clientY>=r.top-8&&e.clientY<=r.bottom+8){hit=id;}}
    if(!hit)return;ED.sel=hit;const p=curPos(hit);ED.drag={id:hit,ox:e.clientX-p.x*innerWidth,oy:e.clientY-p.y*innerHeight,pid:e.pointerId};ov.setPointerCapture(e.pointerId);edUI()});
  ov.addEventListener('pointermove',e=>{const d=ED.drag;if(!d||d.pid!==e.pointerId)return;const p=curPos(d.id);p.x=clamp((e.clientX-d.ox)/innerWidth,.03,.97);p.y=clamp((e.clientY-d.oy)/innerHeight,.04,.96);S.set.lay[d.id]=p;applyLayout()});
  const up=e=>{if(ED.drag&&ED.drag.pid===e.pointerId)ED.drag=null};ov.addEventListener('pointerup',up);ov.addEventListener('pointercancel',up);
  $('edMove').onclick=()=>$('edBar').classList.toggle('low');$('edOk').onclick=()=>closeEditor(true);$('edCancel').onclick=()=>closeEditor(false);$('edReset').onclick=()=>{S.set.lay={};ED.sel=null;applyLayout();edUI()}}
function settingsHTML(){const st=S.set=S.set||{};const v=(k,d)=>st[k]===undefined?d:st[k];
  const q=v('q',QL);return `<div class="row"><div style="flex:1"><h4>Calidad gráfica</h4><small>Ahora: ${['BAJA','MEDIA (sombras reales)','ALTA'][QL]}${S.set.q===undefined?' · elegida automáticamente para tu dispositivo':''}. Al cambiarla, el juego se recarga.</small><div class="sw" style="margin-top:6px">${['BAJA','MEDIA','ALTA'].map((t,i)=>`<button type="button" class="chip${q===i?' live':''}" data-q="${i}" style="width:auto;height:auto;border-radius:6px">${t}</button>`).join('')}</div></div></div>
  <div class="row"><div style="flex:1"><h4>🔋 Límite de FPS</h4><small>30 fps gasta la mitad de batería y el móvil se calienta mucho menos.</small><div class="sw" style="margin-top:6px">${[[30,'30'],[60,'60'],[0,'SIN LÍMITE']].map(([f,t])=>`<button type="button" class="chip${v('fps',IS_TOUCH?30:0)===f?' live':''}" data-fps="${f}" style="width:auto;height:auto;border-radius:6px">${t}</button>`).join('')}</div></div></div>
  <div class="row"><div><h4>✏️ Botones en pantalla</h4><small>Mueve y cambia el tamaño de gas, freno, derrape, nitro, dirección, chat…</small></div><button class="btn" id="setEdit" type="button">EDITAR</button></div>
  <div class="row"><div style="flex:1"><h4>Transparencia de los botones</h4><input class="rng" id="setOp" type="range" min="0.25" max="1" step="0.05" value="${v('op',1)}"></div></div>
  <div class="row"><div style="flex:1"><h4>Sensibilidad de la dirección (táctil)</h4><input class="rng" id="setSens" type="range" min="0.5" max="2" step="0.1" value="${v('sens',1)}"></div></div>
  <div class="row"><div style="flex:1"><h4>Volumen del juego</h4><input class="rng" id="setVol" type="range" min="0" max="1.5" step="0.05" value="${v('vol',1)}"></div></div>
  <div class="row"><div style="flex:1"><h4>Volumen del chat de voz</h4><input class="rng" id="setVvol" type="range" min="0" max="1" step="0.05" value="${v('vvol',1)}"></div></div>
  <div class="row"><div><h4>Restablecer todo</h4><small>Vuelve a la posición y tamaño originales de los botones y a los valores por defecto.</small></div><button class="chip" id="setReset" type="button">RESTABLECER</button></div>`}
function bindSettings(){const st=S.set;const rb=(id,k)=>{const e=$(id);if(e)e.oninput=()=>{st[k]=+e.value;applySettings();save()}};
  document.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{st.q=+b.dataset.q;save();location.reload()});document.querySelectorAll('[data-fps]').forEach(b=>b.onclick=()=>{st.fps=+b.dataset.fps;save();drawMenu()});rb('setOp','op');rb('setSens','sens');rb('setVol','vol');rb('setVvol','vvol');
  $('setEdit').onclick=()=>{ED.backup=JSON.parse(JSON.stringify(st.lay||{}));openEditor()};$('setReset').onclick=()=>{const hadQ=S.set.q!==undefined;S.set={};save();if(hadQ)location.reload();else{applySettings();drawMenu()}}}
function initSettings(){S.set=S.set||{};initEditor();applySettings()}
