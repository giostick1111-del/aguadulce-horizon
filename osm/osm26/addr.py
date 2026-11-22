import xml.etree.ElementTree as ET,glob,json,math
LAT0,LAT1,LON0,LON1=36.802,36.833,-2.606,-2.546
MLAT=111132;MLON=111320*math.cos(math.radians((LAT0+LAT1)/2))
N={};A=[]
for f in sorted(glob.glob('/mnt/user-data/uploads/aguadulce-osm/osmextra/t*.osm')):
    for ev,el in ET.iterparse(f):
        if el.tag=='node':
            N[el.get('id')]=(float(el.get('lat')),float(el.get('lon')))
            t={k.get('k'):k.get('v') for k in el.findall('tag')}
            if 'addr:street' in t:A.append((t['addr:street'],t.get('addr:housenumber',''),N[el.get('id')]))
        if el.tag=='way':
            t={k.get('k'):k.get('v') for k in el.findall('tag')}
            if 'addr:street' in t:
                p=[N[n.get('ref')] for n in el.findall('nd') if n.get('ref') in N]
                if p:A.append((t['addr:street'],t.get('addr:housenumber',''),(sum(q[0] for q in p)/len(p),sum(q[1] for q in p)/len(p))))
        if el.tag in('node','way','relation'):el.clear()
print(len(A))
for s,h,ll in A:
    if 'Bartolom' in s or 'Rancho' in s:print(s,h,round((ll[1]-LON0)*MLON),round((LAT1-ll[0])*MLAT))
