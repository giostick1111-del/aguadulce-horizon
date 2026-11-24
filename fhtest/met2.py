import json
B=[(4451,1747),(4186,1844),(4249,1839),(2089,702),(2065,761),(3650,1939),(1727,1557),(3327,1957),(198,2719),(3451,1507),(3402,1518),(3502,1525)]
r=pg.evaluate("""(B=>{let n12=0,n25=0,n2=[];const loc=B.map(_=>0);for(const r of ROADPATHS){if(r.cls>4||r.st)continue;const P=r.P;let prev=null,pp=null;for(let i=0;i<P.length/2-1;i++){const ax=P[i*2],az=P[i*2+1],bx=P[i*2+2],bz=P[i*2+3],L=Math.hypot(bx-ax,bz-az);for(let t=0;t<L;t+=5){const x=ax+(bx-ax)*t/L,z=az+(bz-az)*t/L,h=H(x,z);if(prev!==null&&pp!==null){const c=Math.abs(pp-2*prev+h);if(c>1.2){n12++;n2.push([Math.round(x),Math.round(z),+c.toFixed(2)])}if(c>2.5)n25++;B.forEach((b,k)=>{if(Math.hypot(b[0]-x,b[1]-z)<20&&c>loc[k])loc[k]=c})}pp=prev;prev=h}}}
return {n12,n25,top:n2.sort((a,b)=>b[2]-a[2]),loc:loc.map(v=>+v.toFixed(2))}})(%s)"""%json.dumps(B))
print('METRIC n12',r['n12'],'n25',r['n25']);print('loc',list(zip(B,r['loc'])));print('top',r['top'])
