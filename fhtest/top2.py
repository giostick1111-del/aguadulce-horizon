pg.wait_for_timeout(1500)
for i,(x,z) in enumerate([(2700,2200),(1787,2569),(2300,2500),(3100,2000)]):
    pg.evaluate(f"(()=>{{const h=__g.H({x},{z});window.__cam=[{x}-25,h+45,{z}+25,{x},h,{z}];const c=__g.ME;c.x={x}+200;c.z={z};c.y=__g.H(c.x,c.z)}})()")
    pg.wait_for_timeout(2500);pg.screenshot(path=f'/tmp/fhtest/tp{i}.png',timeout=120000)
