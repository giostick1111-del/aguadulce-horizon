# Bot INSPECTOR: comprobaciones automáticas + capturas. Uso: python3 run.py "" inspector.py  (SEED y REPORTS por entorno)
import json,os
SEED=int(os.environ.get('SEED','1'));OUT='/tmp/fhtest/bots_out/'
REP=json.loads(open(os.environ['REPORTS']).read()) if os.environ.get('REPORTS') and os.path.exists(os.environ['REPORTS']) else []
pg.wait_for_timeout(1500)
res=json.loads(pg.evaluate("""(SEED=>{const R=lcg(SEED*7919+13),I=[];const add=(tipo,x,z,det,pri)=>I.push({tipo,x:Math.round(x),z:Math.round(z),det,pri});
 // 1) baches: curvatura del terreno físico a lo largo de las calzadas (cada 5 m)
 let nb=0;for(const r of ROADPATHS){if(r.cls>4||r.st)continue;const P=r.P;let acc=0,prev=null,pp=null;for(let i=0;i<P.length/2-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);for(let t=0;t<L;t+=5){const x=ax+(bx-ax)*t/L,z=az+(bz-az)*t/L,h=H(x,z);if(prev!==null&&pp!==null){const c=Math.abs(pp-2*prev+h);if(c>1.2&&!I.some(q=>q.tipo==='bache'&&Math.hypot(q.x-x,q.z-z)<20)){add('bache',x,z,'curvatura '+c.toFixed(2)+' m en '+(WD.names[r.name]||'calle'),c>2.5?1:2);I[I.length-1].v=c;nb++}}pp=prev;prev=h}}}
 // 3) coche: se suelta en 40 puntos de calle al azar; se apunta si acaba dentro de un edificio o bajo el suelo
 const pts=[];for(let k=0;k<40;k++){const r=ROADPATHS[Math.floor(R()*ROADPATHS.length)];if(r.cls>4){k--;continue}const i=Math.floor(R()*(r.P.length/2));pts.push([r.P[i*2],r.P[i*2+1]])}
 return JSON.stringify({I,pts})})(%d)""" % SEED))
issues=sorted(res['I'],key=lambda i:-i.get('v',0))[:40]
# coche en los puntos
for x,z in res['pts']:
    r=pg.evaluate(f"(()=>{{const c=__g.ME;c.x={x};c.z={z};c.vx=c.vz=c.vf=0;c.y=__g.H({x},{z})+.6;return 1}})()")
    pg.wait_for_timeout(700)
    s=json.loads(pg.evaluate(f"JSON.stringify((()=>{{const c=__g.ME;return{{y:c.y,h:__g.H(c.x,c.z),blk:blockedAt(c.x,c.z,.3),d:Math.hypot(c.x-{x},c.z-{z})}}}})())"))
    if s['y']<s['h']-.8:issues.append({'tipo':'coche_bajo_suelo','x':round(x),'z':round(z),'det':'y %.1f, suelo %.1f'%(s['y'],s['h']),'pri':1})
    elif s['blk']:issues.append({'tipo':'coche_en_edificio','x':round(x),'z':round(z),'det':'calle dentro de un edificio','pri':2})
    elif s['d']>6:issues.append({'tipo':'coche_expulsado','x':round(x),'z':round(z),'det':'el coche salió despedido %.0f m'%s['d'],'pri':2})
# rendimiento
pg.evaluate("window.__cam=null")
perf=json.loads(pg.evaluate("(()=>{const r=__g.renderer;return JSON.stringify({calls:r.info.render.calls,tris:r.info.render.triangles,tex:r.info.memory.textures,geo:r.info.memory.geometries})})()"))
# capturas: primero los reportes de jugadores, luego calles al azar
shots=[]
for k,r in enumerate(REP[:12]):
    cam=r.get('cam') or [r['x']-6,r['y']+3,r['z']+6]
    pg.evaluate(f"(()=>{{window.__cam=[{cam[0]},{cam[1]},{cam[2]},{r['x']},{r['y']}+1,{r['z']}];const c=__g.ME;c.x={r['x']}+80;c.z={r['z']};c.y=__g.H(c.x,c.z)}})()")
    pg.wait_for_timeout(2300);f=f'{OUT}rep{k}.png';pg.screenshot(path=f,timeout=120000);shots.append({'f':f,'rep':r.get('id'),'nota':r.get('nota','')})
pts=json.loads(pg.evaluate("""(SEED=>{const o=[];const R=lcg(SEED*31+5);let t=0;while(o.length<10&&t<4000){t++;const r=ROADPATHS[Math.floor(R()*ROADPATHS.length)];if(r.cls>4)continue;const i=Math.floor(R()*(r.P.length/2-1));const x=r.P[i*2],z=r.P[i*2+1],dx=r.P[i*2+2]-x,dz=r.P[i*2+3]-z,L=Math.hypot(dx,dz)||1;o.push([x,z,dx/L,dz/L])}return JSON.stringify(o)})(%d)""" % SEED))
for k,(x,z,dx,dz) in enumerate(pts):
    pg.evaluate(f"(()=>{{const m=__g.ME;m.x={x}-({dx})*30;m.z={z}-({dz})*30;m.y=__g.H(m.x,m.z);const h=__g.H({x},{z});window.__cam=[{x}-({dz})*4,h+2.2,{z}+({dx})*4,{x}+({dx})*40,__g.H({x}+({dx})*40,{z}+({dz})*40)+2,{z}+({dz})*40]}})()")
    pg.wait_for_timeout(2300);f=f'{OUT}sw{k}.png';pg.screenshot(path=f,timeout=120000);shots.append({'f':f,'x':round(x),'z':round(z)})
json.dump({'seed':SEED,'issues':issues,'perf':perf,'shots':shots,'errs':[e for e in errs if not e.startswith('env')][:20]},open(OUT+'inspeccion.json','w'),ensure_ascii=False,indent=1)
from collections import Counter
print('env inspector',len(issues),dict(Counter(i['tipo'] for i in issues)),perf)
