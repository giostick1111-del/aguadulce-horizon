pg.wait_for_timeout(1500)
pts=pg.evaluate("""(()=>{const R=WD.roads.filter(r=>r[0]>=2&&r[0]<=4&&r[4]===0&&r.length>16);const o=[];let s=7;for(let k=0;k<8;k++){s=(s*1103515245+12345)%2147483648;const r=R[s%R.length];const i=5+2*Math.floor((r.length-7)/4);const x=r[i]*K,z=r[i+1]*K,x2=r[i+2]*K,z2=r[i+3]*K,L=Math.hypot(x2-x,z2-z)||1;o.push([x,z,(x2-x)/L,(z2-z)/L,r[1]*K/2,WD.names[r[3]]||''])}return o})()""")
for i,(x,z,dx,dz,hw,n) in enumerate(pts):
    nx,nz=-dz,dx
    x,z,dx,dz,nx,nz,hw=[f"({v})" for v in (x,z,dx,dz,nx,nz,hw)]
    pg.evaluate(f"(()=>{{const ex={x}-{dx}*14+{nx}*({hw}+1.5),ez={z}-{dz}*14+{nz}*({hw}+1.5);window.__cam=[ex,__g.H(ex,ez)+1.8,ez,{x}+{dx}*10,__g.H({x},{z})+.5,{z}+{dz}*10];const q=__g.ME;q.x={x}+{nx}*40;q.z={z}+{nz}*40;q.y=__g.H(q.x,q.z)}})()")
    pg.wait_for_timeout(2200);pg.screenshot(path=f'/tmp/fhtest/wk{i}.png',timeout=120000)
print('env pts',pts)
