pg.set_viewport_size({'width':1280,'height':720})
pg.wait_for_timeout(1500)
for ti in [0,2]:
    pg.evaluate(f"(()=>{{setCarType(__g.ME,{ti},3);const c=__g.ME;c.x=2805;c.z=2140;c.yaw=1.2;c.vx=c.vz=c.vf=0;c.y=__g.H(c.x,c.z);camMode=2;window.__cam=null}})()")
    pg.keyboard.down('ArrowUp');pg.keyboard.down('ArrowLeft');pg.wait_for_timeout(2500);pg.keyboard.up('ArrowLeft');pg.wait_for_timeout(200);pg.screenshot(path=f'/tmp/fhtest/ck{ti}.png',timeout=120000);pg.keyboard.up('ArrowUp')
print('env spd',pg.evaluate("Math.round(Math.abs(__g.ME.vf)*3.6)"))
