pg.wait_for_timeout(1000)
for x,z in [(3397,1489),(3451,1507),(208,2781),(3420,1505)]:
    print('why',x,z,pg.evaluate(f"""(()=>{{const x={x},z={z},r=.5,o={{}};o.isl=typeof islandBlocked==='function'&&ISLANDS.length?islandBlocked(x,z,r):null;o.obg=OBG.size?obstBlocked(x,z,r):null;o.sea=isSea(x,z);
const l=GBL[Math.floor(z/GC)*GWc+Math.floor(x/GC)]||[];o.b=[];for(const b of l){{if(x<b.x0-r||x>b.x1+r||z<b.z0-r||z>b.z1+r)continue;if(pipf(x,z,b.p))o.b.push(['in',Object.keys(b).filter(k=>typeof b[k]!=='object').map(k=>k+'='+b[k]).join(' ').slice(0,200)])}}return JSON.stringify(o)}})()"""))
