import numpy as np,cv2,json
from PIL import Image
O=np.array(Image.open('/mnt/user-data/uploads/aguadulce-osm/pnoa.jpg').convert('RGB')).astype(np.int16)
M=np.array(Image.open('mask.png'))>0
s=4096/5348.
mn=O.min(2);mx=O.max(2)
white=(mn>175)&((mx-mn)<28)
white&=~cv2.dilate(M.astype(np.uint8),np.ones((5,5),np.uint8)).astype(bool)
w8=white.astype(np.uint8)*255
w8=cv2.morphologyEx(w8,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
w8=cv2.morphologyEx(w8,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
cnts,_=cv2.findContours(w8,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
out=[]
vis=Image.open('/mnt/user-data/uploads/aguadulce-osm/pnoa.jpg').convert('RGB');from PIL import ImageDraw;d=ImageDraw.Draw(vis)
for c in cnts:
    a=cv2.contourArea(c)/(s*s)
    if a<350:continue
    rect=cv2.minAreaRect(c);(cx,cy),(rw,rh),ang=rect
    fill=cv2.contourArea(c)/(rw*rh+1e-6)
    if fill<.7:  # irregular: polígono simplificado
        ap=cv2.approxPolyDP(c,2.5,True)[:,0,:]
        if len(ap)<3:continue
        pts=[[float(x/s),float(y/s)] for x,y in ap]
    else:
        pts=[[float(x/s),float(y/s)] for x,y in cv2.boxPoints(rect)]
    out.append({'p':pts,'area':round(a)})
    d.polygon([(x*s,y*s) for x,y in pts],outline=(255,0,0),width=3)
json.dump(out,open('greenh.json','w'))
print(len(out),sum(o['area'] for o in out))
vis.resize((2048,1319)).save('/tmp/claude-0/-home-claude/758958e7-0699-5e30-aab1-0cc7ff14510c/scratchpad/gh.jpg',quality=80)
