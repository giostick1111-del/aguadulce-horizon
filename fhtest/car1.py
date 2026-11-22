pg.wait_for_timeout(1500)
pg.evaluate("window.__cam=null")
for ti in range(5):
    pg.evaluate(f"(()=>{{setCarType(__g.ME,{ti},{ti*2});const c=__g.ME;c.x=2805;c.z=2140;c.yaw=1.2;c.vx=c.vz=c.vf=0;c.y=__g.H(c.x,c.z);camMode=2}})()")
    pg.keyboard.down('ArrowLeft');pg.wait_for_timeout(1500);pg.keyboard.up('ArrowLeft');pg.wait_for_timeout(300)
    pg.screenshot(path=f'/tmp/fhtest/ci{ti}.png',timeout=120000)
    pg.evaluate("camMode=0")
    pg.evaluate("(()=>{const c=__g.ME;window.__cam=[c.x+Math.sin(c.yaw+.7)*5.5,c.y+1.6,c.z+Math.cos(c.yaw+.7)*5.5,c.x,c.y+.7,c.z]})()")
    pg.wait_for_timeout(900);pg.screenshot(path=f'/tmp/fhtest/ce{ti}.png',timeout=120000);pg.evaluate("window.__cam=null")
