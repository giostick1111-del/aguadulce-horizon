import json
pg.wait_for_timeout(1500);pg.evaluate("window.__cam=null")
for x,z in [(208,2781),(3397,1489),(223,2755),(4553,1718),(2065,761),(3451,1507),(3506,1496),(2686,3138),(944,1143),(2139,650),(983,1158)]:
    pg.evaluate(f"(()=>{{const c=__g.ME;c.x={x};c.z={z};c.vx=c.vz=c.vf=0;c.y=__g.H({x},{z})+.6;return 1}})()")
    pg.wait_for_timeout(700)
    print('drop',x,z,pg.evaluate(f"JSON.stringify((()=>{{const c=__g.ME;return{{y:+c.y.toFixed(1),h:+__g.H(c.x,c.z).toFixed(1),d:+Math.hypot(c.x-{x},c.z-{z}).toFixed(1)}}}})())"))
