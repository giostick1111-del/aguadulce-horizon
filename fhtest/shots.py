import json,os
B=json.loads(os.environ['PTS'])
for i,(x,z) in enumerate(B):
    pg.evaluate(f"""(()=>{{const x={x},z={z};let best=null,bd=1e9,bi=0;for(const r of ROADPATHS){{if(r.cls>5||r.st)continue;const P=r.P;for(let i=0;i<P.length/2-1;i++){{const d=Math.hypot(P[i*2]-x,P[i*2+1]-z);if(d<bd){{bd=d;best=r;bi=i}}}}}}
const P=best.P;let dx=P[bi*2+2]-P[bi*2],dz=P[bi*2+3]-P[bi*2+1];const L=Math.hypot(dx,dz)||1;dx/=L;dz/=L;const ex=x-dx*16,ez=z-dz*16;
window.__cam=[ex,__g.H(ex,ez)+2.2,ez,x+dx*12,__g.H(x+dx*12,z+dz*12)+.6,z+dz*12];const q=__g.ME;q.x=x-dz*40;q.z=z+dx*40;q.y=__g.H(q.x,q.z)}})()""")
    pg.wait_for_timeout(2500);pg.screenshot(path=f'/tmp/fhtest/bots_out/s{i}.png',timeout=120000)
    prof=pg.evaluate(f"(()=>{{const o=[];for(let t=-30;t<=30;t+=5)o.push(+__g.H({x}+t*0.0,{z}+t).toFixed(1));return o}})()")
print('done')
