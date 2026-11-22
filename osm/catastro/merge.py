import json,math,zlib
from collections import defaultdict,Counter
R=json.load(open('raw.json'));B=R['B']
W=json.load(open('/home/claude/osm/world.json'))
def area(p):
    s=0
    for i in range(len(p)):x1,y1=p[i-1];x2,y2=p[i];s+=x1*y2-x2*y1
    return s/2
def clean(p):
    p=[tuple(q) for q in p]
    if p[0]==p[-1]:p=p[:-1]
    o=[]
    for q in p:
        if not o or o[-1]!=q:o.append(q)
    # quita puntos colineales
    ch=True
    while ch and len(o)>3:
        ch=False
        for i in range(len(o)):
            a,b,c=o[i-1],o[i],o[(i+1)%len(o)]
            cr=(b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0]);L=math.hypot(c[0]-a[0],c[1]-a[1])+1e-9
            if abs(cr)/L<1.2:o.pop(i);ch=True;break
    return o
def union(rings):
    E=Counter()
    for r in rings:
        r=r if area(r)>0 else r[::-1]
        for i in range(len(r)):E[(r[i],r[(i+1)%len(r)])]+=1
    for (a,b),n in list(E.items()):
        if (b,a) in E and E[(a,b)]>0 and E[(b,a)]>0:
            k=min(E[(a,b)],E[(b,a)]);E[(a,b)]-=k;E[(b,a)]-=k
    nxt=defaultdict(list)
    for (a,b),n in E.items():
        for _ in range(n):nxt[a].append(b)
    out=[];used=0;total=sum(len(v) for v in nxt.values())
    while any(nxt.values()):
        s=next(k for k,v in nxt.items() if v);ring=[s];cur=s
        for _ in range(100000):
            if not nxt[cur]:return None
            n=nxt[cur].pop();
            if n==s:break
            ring.append(n);cur=n
        else:return None
        out.append(ring)
    return out
G=defaultdict(list)
for bid,fa,p in R['parts']:
    if fa<=0:continue
    G[(bid,fa)].append(clean(p))
blds=[];merged=0;holes=0
for (bid,fa),rings in G.items():
    rings=[r for r in rings if len(r)>=3 and abs(area(r))>1.5*64]
    if not rings:continue
    res=rings
    if len(rings)>1:
        u=union(rings)
        if u is not None:
            pos=[r for r in u if area(r)>0];neg=[r for r in u if area(r)<0]
            if neg:holes+=1
            elif pos:res=pos;merged+=len(rings)-len(pos)
    use,dw,yr=B.get(bid,('',0,''))
    for r in res:
        r=clean(r)
        if len(r)<3:continue
        ar=abs(area(r))/64
        if use.startswith('1'):kind=0 if dw<=1 else 1
        elif use.startswith('2') or use.startswith('3'):kind=3
        else:kind=3 if (fa<=1 and ar>500) else 1
        blds.append((kind,min(fa,20),bid,r))
print('parts->',len(blds),'merged',merged,'holes',holes)
# edificios OSM fuera de la cobertura del catastro (otro municipio o sin dato)
cells=defaultdict(list)
for k,(kind,fa,bid,r) in enumerate(blds):
    xs=[q[0] for q in r];ys=[q[1] for q in r]
    for gx in range(min(xs)//400,max(xs)//400+1):
        for gy in range(min(ys)//400,max(ys)//400+1):cells[(gx,gy)].append(k)
def pip(x,y,r):
    c=False
    for i in range(len(r)):
        x1,y1=r[i-1];x2,y2=r[i]
        if (y1>y)!=(y2>y) and x<(x2-x1)*(y-y1)/(y2-y1)+x1:c=not c
    return c
keep=[]
for f in W['blds']:
    x,y=f[3],f[4];pts=[(x,y)]
    for i in range(5,len(f),2):x+=f[i];y+=f[i+1];pts.append((x,y))
    cx=sum(p[0] for p in pts)/len(pts);cy=sum(p[1] for p in pts)/len(pts)
    hit=False
    for k in cells.get((int(cx)//400,int(cy)//400),[]):
        if pip(cx,cy,blds[k][3]):hit=True;break
    if not hit:
        # también se descarta si casi todo su contorno cae dentro de catastro
        inn=sum(1 for p in pts for k in cells.get((int(p[0])//400,int(p[1])//400),[]) if pip(p[0],p[1],blds[k][3]))
        if inn<len(pts)*0.5:keep.append(f)
print('osm kept',len(keep),'of',len(W['blds']))
out=[]; grp=[]
for kind,fa,bid,r in blds:
    flat=[r[0][0],r[0][1]]
    for i in range(1,len(r)):flat+=[r[i][0]-r[i-1][0],r[i][1]-r[i-1][1]]
    out.append([kind,fa,-1]+flat);grp.append(zlib.crc32(bid.encode())%1000000)
for f in keep:out.append(f);grp.append(-1)
pools=[]
for p in R['pools']:
    p=clean(p)
    if len(p)<3:continue
    flat=[p[0][0],p[0][1]]
    for i in range(1,len(p)):flat+=[p[i][0]-p[i-1][0],p[i][1]-p[i-1][1]]
    pools.append(flat)
W['blds']=out;W['bgrp']=grp;W['pools']=pools
json.dump(W,open('/home/claude/osm/world_cat.json','w'),separators=(',',':'))
import os;print('size',os.path.getsize('/home/claude/osm/world_cat.json'),os.path.getsize('/home/claude/osm/world.json'))
print(Counter(b[0] for b in out))
