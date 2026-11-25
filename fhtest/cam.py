# Capturas libres: CAMS='[["nombre",x,z,ang_grados,dist,alto]]' (alto<0: vista cenital a -alto m)
import json,os
C=json.loads(os.environ['CAMS'])
for n,x,z,a,d,h in C:
    pg.evaluate(f"""(()=>{{const x={x},z={z},a={a}*Math.PI/180,d={d},h={h};const hy=__g.H(x,z);
if(h<0)window.__cam=[x+0.01,hy-h,z+0.01,x,hy,z];else{{const ex=x-Math.cos(a)*d,ez=z-Math.sin(a)*d;window.__cam=[ex,__g.H(ex,ez)+h,ez,x,hy+.3,z]}}
const q=__g.ME;q.x=x+60;q.z=z+60;q.y=__g.H(q.x,q.z)}})()""")
    pg.wait_for_timeout(2500);pg.screenshot(path=f'/tmp/fhtest/bots_out/{n}.png',timeout=120000)
print('done')
