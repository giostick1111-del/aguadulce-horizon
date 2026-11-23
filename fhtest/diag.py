import json,os
B=json.loads(os.environ.get('PTS','[[223,2755],[4553,1718],[2065,761],[3402,1518],[3451,1507]]'))
r=pg.evaluate("""(B=>B.map(([x,z])=>{const o=[];WD.roads.forEach((r,ri)=>{if(!r.dp)return;const P=r.dp,N=P.length/2;let bi=-1,bd=1e9;for(let i=0;i<N;i++){const d=Math.hypot(P[i*2]-x,P[i*2+1]-z);if(d<bd){bd=d;bi=i}}if(bd>30)return;
 const s=[];for(let i=Math.max(0,bi-8);i<Math.min(N,bi+9);i++)s.push([i,Math.round(P[i*2]),Math.round(P[i*2+1]),+r.cy[i].toFixed(1),+H(P[i*2],P[i*2+1]).toFixed(1)]);
 o.push({ri,cls:r[0],f:r[4],name:WD.names[r[3]]||'',wasT:!!r.wasT,und:(r.under||[]).length,pin:r._pin,N,bi,bd:+bd.toFixed(1),s})});return {x,z,o}}))(%s)"""%json.dumps(B))
for p in r:
  print('PT',p['x'],p['z'])
  for o in p['o']:
    print('  road',o['ri'],'cls',o['cls'],'f',o['f'],o['name'],'wasT',o['wasT'],'und',o['und'],'pin',o['pin'],'N',o['N'],'bi',o['bi'],'d',o['bd'])
    print('    ',' '.join(f"{i}:({x},{z}) cy{c} H{h}" for i,x,z,c,h in o['s']))
