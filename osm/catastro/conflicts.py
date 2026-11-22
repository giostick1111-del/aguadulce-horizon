import json,math
from collections import defaultdict
W=json.load(open('/home/claude/osm/world_cat.json'))
segs=defaultdict(list)
for r in W['roads']:
    if r[0]>5:continue
    hw=r[1]/2
    pts=[(r[i],r[i+1]) for i in range(5,len(r),2)]
    for a,b in zip(pts,pts[1:]):
        for gx in range(int(min(a[0],b[0])-hw)//200,int(max(a[0],b[0])+hw)//200+1):
            for gy in range(int(min(a[1],b[1])-hw)//200,int(max(a[1],b[1])+hw)//200+1):segs[(gx,gy)].append((a,b,hw,r[0]))
def ds(p,a,b):
    dx,dy=b[0]-a[0],b[1]-a[1];L=dx*dx+dy*dy or 1;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L));return math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy)
bad=[];
for k,f in enumerate(W['blds']):
    if W['bgrp'][k]<0:continue
    x,y=f[3],f[4];pts=[(x,y)]
    for i in range(5,len(f),2):x+=f[i];y+=f[i+1];pts.append((x,y))
    # muestras en el contorno
    sm=[]
    for a,b in zip(pts,pts[1:]+pts[:1]):
        n=max(1,int(math.hypot(b[0]-a[0],b[1]-a[1])/8))
        for j in range(n):sm.append((a[0]+(b[0]-a[0])*j/n,a[1]+(b[1]-a[1])*j/n))
    worst=0
    for p in sm:
        for a,b,hw,c in segs.get((int(p[0])//200,int(p[1])//200),[]):
            pen=hw-ds(p,a,b)
            if pen>worst:worst=pen
    if worst>8:bad.append((k,f[0],f[1],round(worst/8,1)))
print(len(bad));from collections import Counter;print(Counter(min(int(b[3]),6) for b in bad));print(Counter((b[1],min(b[2],4)) for b in bad).most_common(8))
json.dump([b[0] for b in bad],open('bad.json','w'))
# empuja fuera de la calzada los vértices que la invaden
def push(p):
    best=None
    for a,b,hw,c in segs.get((int(p[0])//200,int(p[1])//200),[]):
        d=ds(p,a,b);pen=hw+2.4-d
        if pen>0 and (best is None or pen>best[0]):best=(pen,a,b,hw)
    if not best:return p
    pen,a,b,hw=best;dx,dy=b[0]-a[0],b[1]-a[1];L=dx*dx+dy*dy or 1;t=max(0,min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/L));qx,qy=a[0]+t*dx,a[1]+t*dy
    vx,vy=p[0]-qx,p[1]-qy;n=math.hypot(vx,vy) or 1;return (round(qx+vx/n*(hw+2.4)),round(qy+vy/n*(hw+2.4)))
fixed=0
for k,*_ in bad:
    f=W['blds'][k];x,y=f[3],f[4];pts=[(x,y)]
    for i in range(5,len(f),2):x+=f[i];y+=f[i+1];pts.append((x,y))
    for _ in range(2):pts=[push(p) for p in pts]
    flat=[pts[0][0],pts[0][1]]
    for i in range(1,len(pts)):flat+=[pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]]
    W['blds'][k]=f[:3]+flat;fixed+=1
json.dump(W,open('/home/claude/osm/world_cat.json','w'),separators=(',',':'))
print('fixed',fixed)
