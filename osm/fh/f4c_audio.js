
/* ============ SONIDO v3: grabaciones reales de motores (bucles de TORCS, GPL) ============
   Cada coche usa la grabación de un motor real, que se acelera o se ralentiza con las vueltas.
   Encima: filtro de carga (gas / retención), turbo, petardeo real, chirrido real de neumáticos,
   golpes reales, viento y rodadura. */
let AC=null,NB=null,ENG=null,MASTER=null,RVOX=[];const SNDB={},SNDP={};
const ENGPROF=[// por tipo de coche: grabación, vueltas de referencia, corte
  {k:'compact',ref:3600,red:7200,turbo:1,lp:7000,vol:1.0},
  {k:'berlina',ref:3700,red:7000,turbo:0,lp:7500,vol:1.0},
  {k:'gt',ref:3600,red:6800,turbo:0,lp:7000,vol:1.05},
  {k:'suv',ref:3000,red:5600,turbo:1,lp:5200,vol:1.0},
  {k:'super',ref:4300,red:8600,turbo:0,lp:9000,vol:1.05},
  // motos: las mismas grabaciones, más agudas (más vueltas)
  {k:'compact',ref:1700,red:9500,turbo:0,lp:9000,vol:.8},{k:'compact',ref:2500,red:9000,turbo:0,lp:8000,vol:.9},{k:'super',ref:2900,red:10500,turbo:0,lp:10000,vol:.95},{k:'super',ref:2500,red:13000,turbo:0,lp:11000,vol:1.0}];
function sndBuf(k){if(SNDB[k])return SNDB[k];if(!SNDP[k]&&window.AG_SND&&AG_SND[k]&&AC){const bin=atob(AG_SND[k]),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);
    SNDP[k]=new Promise((res,rej)=>{const p=AC.decodeAudioData(u.buffer,res,rej);if(p&&p.then)p.then(res,rej)}).then(b=>{SNDB[k]=b;return b}).catch(e=>console.warn('snd',k,e))}return null}
function noiseSrc(){const s=AC.createBufferSource();s.buffer=NB;s.loop=true;s.start(0,Math.random());return s}
function makeEngine(ti,dest,remote){const P=ENGPROF[ti]||ENGPROF[0],B=sndBuf(P.k);if(!B)return null;const t=AC.currentTime;
  const out=AC.createGain();out.gain.value=0;out.connect(dest);
  const src=AC.createBufferSource();src.buffer=B;src.loop=true;src.start(t,Math.random()*B.duration);
  // con gas: sonido completo y brillante; sin gas: apagado y grave (retención)
  const onG=AC.createGain(),offG=AC.createGain(),offF=AC.createBiquadFilter(),hs=AC.createBiquadFilter();
  offF.type='lowpass';offF.frequency.value=700;offF.Q.value=.5;hs.type='highshelf';hs.frequency.value=2500;hs.gain.value=0;
  src.connect(hs);hs.connect(onG);src.connect(offF);offF.connect(offG);
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=P.lp;onG.connect(lp);offG.connect(lp);lp.connect(out);
  let tb=null;if(P.turbo&&!remote){const o=AC.createOscillator();o.type='sine';const g=AC.createGain();g.gain.value=0;o.connect(g);g.connect(out);o.start();tb={o,g}}
  return{P,ti,src,out,onG,offG,hs,lp,tb,boost:0,lastThr:0,popT:0,lim:0,gear:0,shift:0}}
function killEngine(E){if(!E)return;try{E.src.stop();if(E.tb)E.tb.o.stop();E.out.disconnect()}catch(e){}}
let SKD=null,WIND=null,RUMB=null;
function audio(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();NB=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
      MASTER=AC.createDynamicsCompressor();MASTER.threshold.value=-12;MASTER.ratio.value=3;const mg=AC.createGain();MG=mg;mg.gain.value=(S.set&&S.set.vol!==undefined)?S.set.vol:1;MASTER.connect(mg);mg.connect(AC.destination);
      for(const k of ['compact','berlina','gt','suv','super','skid','crash','crash2','pop','gear'])sndBuf(k);
      const w=noiseSrc(),wf=AC.createBiquadFilter();wf.type='lowpass';wf.frequency.value=500;const wg=AC.createGain();wg.gain.value=0;w.connect(wf);wf.connect(wg);wg.connect(MASTER);WIND={f:wf,g:wg};
      const r=noiseSrc(),rf=AC.createBiquadFilter();rf.type='lowpass';rf.frequency.value=140;const rg=AC.createGain();rg.gain.value=0;r.connect(rf);rf.connect(rg);rg.connect(MASTER);RUMB={f:rf,g:rg}}
    if(AC.state==='suspended')AC.resume()}catch(e){console.warn(e)}}
function engineOn(){}
const rpmOf=(c,P)=>850+clamp(((c.rpm||.18)-.18)/.8,0,1.05)*(P.red-850);
function oneShot(k,v,rate,dest){const b=SNDB[k];if(!b||!AC)return;const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=rate||1;const g=AC.createGain();g.gain.value=v;s.connect(g);g.connect(dest||MASTER);s.start()}
function driveEngine(E,c,thr,dt,vol){const P=E.P,t=AC.currentTime,rpm=rpmOf(c,P);
  // las grabaciones se estiran de forma suave para que no suenen a "ardilla" arriba ni a tractor abajo
  const rate=Math.pow(rpm/P.ref,.78);E.src.playbackRate.setTargetAtTime(rate,t,.04);
  let load=thr;if(rpm>P.red*.985&&thr>.5){E.lim+=dt;if((E.lim*18|0)%2)load=0}else E.lim=0;
  if(c.gear!==E.gear){if(c.gear>E.gear&&E.gear>0&&c===ME){E.shift=.12;oneShot('gear',.35)}E.gear=c.gear}
  if(E.shift>0){E.shift-=dt;load=Math.min(load,.1)}
  const hi=clamp(rpm/P.red,0,1);
  E.onG.gain.setTargetAtTime((.25+.75*load)*(.7+.3*hi),t,.05);E.offG.gain.setTargetAtTime((1-load)*.75,t,.08);
  E.hs.gain.setTargetAtTime(load*4-2,t,.08);E.lp.frequency.setTargetAtTime(P.lp*(.5+.5*load),t,.08);
  E.out.gain.setTargetAtTime(vol*P.vol*(.42+.25*hi),t,.08);
  if(E.tb){E.boost+=((load>.6&&rpm>2500?1:0)-E.boost)*Math.min(1,dt*(load>.6?1.1:4));E.tb.o.frequency.setTargetAtTime(2400+E.boost*4600,t,.1);E.tb.g.gain.setTargetAtTime(E.boost*.008,t,.1);
    if(E.lastThr>.6&&thr<.2&&E.boost>.5){blowOff(E.out,E.boost);E.boost=0}}
  if(E.lastThr>.5&&thr<.15&&rpm>P.red*.6&&c===ME)E.popT=.6+Math.random()*.5;
  if(E.popT>0){E.popT-=dt;if(Math.random()<dt*7)oneShot('pop',.35+Math.random()*.35,.85+Math.random()*.4)}
  E.lastThr=thr}
function blowOff(dest,b){const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(3000,t);f.frequency.exponentialRampToValueAtTime(1300,t+.35);f.Q.value=1.2;
  const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18*b,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+.4);s.connect(f);f.connect(g);g.connect(dest);s.start(t,Math.random());s.stop(t+.42)}
function engineSet(rpm,load,slip,nos,dt){if(!AC||!ME)return;dt=dt||1/60;if(ENG&&ENG.ti!==ME.t){killEngine(ENG);ENG=null}if(!ENG)ENG=makeEngine(ME.t,MASTER,false);
  if(ENG)driveEngine(ENG,ME,Math.min(1,load+(nos?.15:0)),dt,1);const t=AC.currentTime,sp=Math.hypot(ME.vx,ME.vz);
  // chirrido real de neumáticos
  if(!SKD&&SNDB.skid){const s=AC.createBufferSource();s.buffer=SNDB.skid;s.loop=true;const g=AC.createGain();g.gain.value=0;s.connect(g);g.connect(MASTER);s.start();SKD={s,g}}
  if(SKD){const sq=ME.onGround?clamp((slip-3)/10,0,1):0;SKD.g.gain.setTargetAtTime(sq*.55,t,.05);SKD.s.playbackRate.setTargetAtTime(.85+sq*.3,t,.1)}
  WIND.g.gain.setTargetAtTime(Math.pow(sp/70,2)*.2,t,.1);WIND.f.frequency.setTargetAtTime(300+sp*18,t,.1);
  const off=ME.onGround&&offRoadCached();RUMB.g.gain.setTargetAtTime(ME.onGround?clamp(sp/40,0,1)*(off?.5:.12):0,t,.1);RUMB.f.frequency.setTargetAtTime(off?420:130,t,.1);
  remoteEngines(dt)}
let _orc={t:0,v:false};function offRoadCached(){_orc.t-=1/60;if(_orc.t<=0){_orc.t=.2;_orc.v=offRoad(ME.x,ME.z)}return _orc.v}
/* motores de los otros coches (los 3 más cercanos), con sonido 3D */
function remoteEngines(dt){const L=AC.listener;const cp=camera.position;if(L.positionX){L.positionX.value=cp.x;L.positionY.value=cp.y;L.positionZ.value=cp.z;const f=new THREE.Vector3();camera.getWorldDirection(f);L.forwardX.value=f.x;L.forwardY.value=f.y;L.forwardZ.value=f.z;L.upX.value=0;L.upY.value=1;L.upZ.value=0}else{L.setPosition(cp.x,cp.y,cp.z)}
  const cands=OTHER.filter(c=>c!==ME&&c.m.visible).map(c=>[c,Math.hypot(c.x-ME.x,c.z-ME.z)]).filter(a=>a[1]<160).sort((a,b)=>a[1]-b[1]).slice(0,3).map(a=>a[0]);
  for(let i=RVOX.length-1;i>=0;i--){const v=RVOX[i];if(!cands.includes(v.c)||v.E.ti!==v.c.t){killEngine(v.E);v.pan.disconnect();RVOX.splice(i,1)}}
  for(const c of cands){let v=RVOX.find(q=>q.c===c);if(!v){const pan=AC.createPanner();pan.panningModel='equalpower';pan.distanceModel='inverse';pan.refDistance=7;pan.rolloffFactor=1.3;pan.connect(MASTER);const E=makeEngine(c.t,pan,true);if(!E){pan.disconnect();continue}v={c,pan,E};RVOX.push(v)}
    if(v.pan.positionX){v.pan.positionX.value=c.x;v.pan.positionY.value=c.y+.5;v.pan.positionZ.value=c.z}else v.pan.setPosition(c.x,c.y+.5,c.z);
    const sp=Math.abs(c.vf||0);{const gears=[0,9,17,26,36,48,62,99],k=CARS[c.t].vmax/66;let gi=1;while(gi<7&&sp>gears[gi]*k)gi++;c.gear=gi;c.rpm=clamp(.18+.8*(sp-gears[gi-1]*k)/((gears[gi]-gears[gi-1])*k),.18,1)}
    const acc=sp-(v.ps||sp);v.ps=sp;driveEngine(v.E,c,clamp(.35+acc*3,0,1),dt,.8)}}
function thud(v){if(!AC)return;const t=AC.currentTime,s=AC.createBufferSource();s.buffer=NB;const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=300;const g=AC.createGain();g.gain.setValueAtTime(clamp(v,0,1)*.8,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);s.connect(f);f.connect(g);g.connect(MASTER);s.start(t,Math.random());s.stop(t+.32);
  if(v>.35)oneShot(Math.random()<.5?'crash':'crash2',clamp(v,0,1)*.9,.9+Math.random()*.2)}
function beep(f,d,v){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f;g.gain.setValueAtTime(v||.12,t);g.gain.exponentialRampToValueAtTime(.001,t+(d||.15));o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+(d||.15)+.02)}
