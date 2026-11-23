pg.wait_for_timeout(1500)
pg.evaluate("window.__cam=null")
for ti in [5,6,7,8]:
    pg.evaluate(f"(()=>{{setCarType(__g.ME,{ti},1);const c=__g.ME;c.x=2805;c.z=2140;c.yaw=1.2;c.vx=c.vz=c.vf=0;c.y=__g.H(c.x,c.z);camMode=2}})()")
    pg.wait_for_timeout(1500)
    pg.screenshot(path=f'/tmp/fhtest/bots_out/bi{ti}.png',timeout=120000)
pg.evaluate("camMode=0")
