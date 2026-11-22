import json,numpy as np
from PIL import Image,ImageDraw
w=json.load(open('../world_cat.json'))
W,H=5349,3446
im=Image.new('L',(W,H),0);d=ImageDraw.Draw(im)
def dec(f,o):
    x=y=0;p=[]
    for i in range(o,len(f)-1,2):x+=f[i];y+=f[i+1];p.append((x/8,y/8))
    return p
for f in w['blds']:
    p=dec(f,3)
    if len(p)>=3:d.polygon(p,fill=255)
M=np.array(im)>0
B=json.load(open('blds26.json'))
miss=[]
for b in B:
    p=[tuple(q) for q in b['p']]
    if len(p)<4:continue
    m=Image.new('L',(W,H),0)
    xs=[q[0] for q in p];ys=[q[1] for q in p];x0,x1,y0,y1=max(0,int(min(xs))-1),min(W,int(max(xs))+2),max(0,int(min(ys))-1),min(H,int(max(ys))+2)
    if x1<=x0 or y1<=y0:continue
    sub=Image.new('L',(x1-x0,y1-y0),0);ImageDraw.Draw(sub).polygon([(q[0]-x0,q[1]-y0) for q in p],fill=255)
    a=np.array(sub)>0;n=a.sum()
    if n<20:continue
    cov=(a&M[y0:y1,x0:x1]).sum()/n
    if cov<.3:miss.append({'id':b['id'],'p':b['p'],'t':b['t'],'ts':b['ts'],'area':int(n),'cov':round(float(cov),2)})
json.dump(miss,open('missing.json','w'))
import collections
print(len(B),'missing',len(miss),'area',sum(m['area'] for m in miss))
print(collections.Counter(m['t'].get('building') for m in miss).most_common(15))
print(sorted([(m['area'],m['t'].get('building'),m['t'].get('name',''),[int(v) for v in m['p'][0]],m['ts']) for m in miss],reverse=True)[:40])
