import json
B=[(3349,1261),(3801,1342),(3833,1761),(2004,733),(4316,1277),(4744,1690),(2686,3138),(944,1143),(3451,1507),(3402,1518),(223,2755),(2139,650),(983,1158),(3506,1496),(4553,1718),(2065,761)]
r=pg.evaluate("""(B=>{let n12=0,n25=0,n4=0;const loc=B.map(_=>0);for(const r of ROADPATHS){if(r.cls>4||r.st)continue;const P=r.P;let prev=null,pp=null;for(let i=0;i<P.length/2-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);for(let t=0;t<L;t+=5){const x=ax+(bx-ax)*t/L,z=az+(bz-az)*t/L,h=H(x,z);if(prev!==null&&pp!==null){const c=Math.abs(pp-2*prev+h);if(c>1.2)n12++;if(c>2.5)n25++;if(c>4)n4++;B.forEach((b,k)=>{if(Math.hypot(b[0]-x,b[1]-z)<20&&c>loc[k])loc[k]=c})}pp=prev;prev=h}}}
return {n12,n25,n4,loc:loc.map(v=>+v.toFixed(2))}})(%s)"""%json.dumps(B))
print('env METRIC',json.dumps(r))
