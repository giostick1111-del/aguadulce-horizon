pg.wait_for_timeout(1500)
for ti in range(5):
    pg.evaluate(f"(()=>{{setCarType(__g.ME,{ti},{[0,3,1,8,2][ti]});const c=__g.ME;c.x=2805;c.z=2140;c.yaw=1.2;c.vx=c.vz=c.vf=0;c.y=__g.H(c.x,c.z);camMode=0}})()")
    pg.wait_for_timeout(500)
    for k,(ang,d,h) in enumerate([(.6,5.2,1.3),(2.6,5.4,1.5)]):
        pg.evaluate(f"(()=>{{const c=__g.ME;window.__cam=[c.x+Math.sin(c.yaw+{ang})*{d},c.y+{h},c.z+Math.cos(c.yaw+{ang})*{d},c.x,c.y+.6,c.z]}})()")
        pg.wait_for_timeout(700);pg.screenshot(path=f'/tmp/fhtest/cx{ti}{k}.png',timeout=120000,clip={'x':180,'y':120,'width':600,'height':330})
    pg.evaluate("window.__cam=null")
