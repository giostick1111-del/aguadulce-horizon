pg.set_viewport_size({'width':1280,'height':720})
pg.wait_for_timeout(1500)
for k,ti in enumerate([5,8,0]):
    pg.evaluate(f"(()=>{{setCarType(__g.ME,{ti},{[1,3,0][k]});const c=__g.ME;c.x=2805;c.z=2140;c.yaw=1.2;c.vx=c.vz=c.vf=0;c.y=__g.H(c.x,c.z);camMode=2;window.__cam=null}})()")
    pg.keyboard.down('ArrowUp');pg.wait_for_timeout(1500);pg.keyboard.down('ArrowLeft');pg.wait_for_timeout(700);pg.screenshot(path=f'/tmp/fhtest/fp{k}.png',timeout=120000);pg.keyboard.up('ArrowLeft');pg.keyboard.up('ArrowUp');pg.wait_for_timeout(800)
