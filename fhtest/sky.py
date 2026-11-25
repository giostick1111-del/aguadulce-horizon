for i,(dx,dz) in enumerate([(-1,0),(-1,.3),(-1,-.3),(1,0),(0,1),(0,-1)]):
    pg.evaluate(f"(()=>{{const x=752,z=1552,h=__g.H(x,z)+30;window.__cam=[x,h,z,x+{dx}*100,h+35,z+{dz}*100];const q=__g.ME;q.x=x+60;q.z=z+60;q.y=__g.H(q.x,q.z)}})()")
    pg.wait_for_timeout(2000);pg.screenshot(path=f'/tmp/fhtest/bots_out/k{i}.png')
