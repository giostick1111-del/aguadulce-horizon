import json,numpy as np
from PIL import Image,ImageDraw
w=json.load(open('../world_cat.json'))
O=Image.open('/mnt/user-data/uploads/aguadulce-osm/pnoa.jpg').convert('RGB');s=4096/5348.
m=Image.new('L',O.size,0);d=ImageDraw.Draw(m)
for f in w['blds']:
    x=y=0;p=[]
    for i in range(3,len(f)-1,2):x+=f[i];y+=f[i+1];p.append((x/8*s,y/8*s))
    if len(p)>=3:d.polygon(p,fill=255)
m.save('mask.png')
tint=Image.new('RGB',O.size,(0,80,255))
ov=Image.composite(Image.blend(O,tint,.55),O,m)
ov.save('overlay.jpg',quality=85)
