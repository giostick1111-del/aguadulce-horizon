import xml.etree.ElementTree as ET,glob,json,math
LAT0,LAT1,LON0,LON1=36.802,36.833,-2.606,-2.546
MLAT=111132;MLON=111320*math.cos(math.radians((LAT0+LAT1)/2))
def pj(lat,lon):return [round((lon-LON0)*MLON,2),round((LAT1-lat)*MLAT,2)]
N={};W={};
for f in sorted(glob.glob('/mnt/user-data/uploads/aguadulce-osm/osmextra/t*.osm')):
    for ev,el in ET.iterparse(f):
        if el.tag=='node':
            t={k.get('k'):k.get('v') for k in el.findall('tag')}
            N[el.get('id')]=(float(el.get('lat')),float(el.get('lon')),t,el.get('timestamp'))
        elif el.tag=='way':
            t={k.get('k'):k.get('v') for k in el.findall('tag')}
            W[el.get('id')]=([n.get('ref') for n in el.findall('nd')],t,el.get('timestamp'))
        if el.tag in('node','way','relation'):el.clear()
print('nodes',len(N),'ways',len(W))
KEYS=['shop','amenity','office','craft','tourism','healthcare','leisure']
pois=[];blds=[]
def poi_kind(t):
    for k in KEYS:
        if k in t:
            if k=='leisure' and t[k] not in('fitness_centre','sports_centre'):continue
            if k=='amenity' and t[k] in('parking','bench','waste_basket','recycling','parking_space','bicycle_parking','drinking_water','toilets','shelter','fountain','waste_disposal','vending_machine','telephone','post_box','motorcycle_parking','loading_dock','parking_entrance','atm','charging_station','bbq','clock','grit_bin','compressed_air','water_point','hunting_stand','street_lamp','give_box','taxi','car_wash','public_bookcase'):continue
            if k=='tourism' and t[k] in('information','viewpoint','artwork','picnic_site','attraction'):continue
            return k+':'+t[k]
    return None
for i,(lat,lon,t,ts) in N.items():
    k=poi_kind(t)
    if k:pois.append(pj(lat,lon)+[t.get('name') or t.get('brand') or '',k,t.get('brand',''),ts[:10],'n'+i])
for i,(nds,t,ts) in W.items():
    pts=[N[n] for n in nds if n in N]
    if len(pts)<3:continue
    k=poi_kind(t)
    if k:
        la=sum(p[0] for p in pts)/len(pts);lo=sum(p[1] for p in pts)/len(pts)
        pois.append(pj(la,lo)+[t.get('name') or t.get('brand') or '',k,t.get('brand',''),ts[:10],'w'+i])
    if 'building' in t:
        blds.append({'id':i,'p':[pj(p[0],p[1]) for p in pts],'t':{k:v for k,v in t.items() if k.startswith('building') or k in('name','height','shop','amenity')},'ts':ts[:10]})
# dedupe pois (tiles overlap)
seen=set();P2=[]
for p in pois:
    if p[6] in seen:continue
    seen.add(p[6]);P2.append(p)
P2=[p for p in P2 if 0<=p[0]<=5348 and 0<=p[1]<=3445]
json.dump(P2,open('pois26.json','w'),ensure_ascii=False)
json.dump(blds,open('blds26.json','w'))
import collections
print('pois',len(P2),'named',sum(1 for p in P2 if p[2]),'blds',len(blds))
print(collections.Counter(p[3] for p in P2).most_common(60))
