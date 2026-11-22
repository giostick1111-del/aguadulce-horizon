import re,math,json,sys
from lxml import etree
LAT0,LAT1,LON0,LON1=36.802,36.833,-2.606,-2.546
PPM=8.0;MLAT=111132.0;MLON=111320.0*math.cos(math.radians((LAT0+LAT1)/2))
W=int((LON1-LON0)*MLON*PPM);H=int((LAT1-LAT0)*MLAT*PPM)
# UTM zona 30 (ETRS89 ~ WGS84) -> lat/lon
a=6378137.0;f=1/298.257222101;e2=f*(2-f);ep2=e2/(1-e2);k0=0.9996;lon0=math.radians(-3)
e1=(1-math.sqrt(1-e2))/(1+math.sqrt(1-e2))
def utm2ll(E,N):
    x=E-500000.0;y=N;M=y/k0;mu=M/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256))
    p1=mu+(3*e1/2-27*e1**3/32)*math.sin(2*mu)+(21*e1*e1/16-55*e1**4/32)*math.sin(4*mu)+(151*e1**3/96)*math.sin(6*mu)+(1097*e1**4/512)*math.sin(8*mu)
    C1=ep2*math.cos(p1)**2;T1=math.tan(p1)**2;N1=a/math.sqrt(1-e2*math.sin(p1)**2);R1=a*(1-e2)/(1-e2*math.sin(p1)**2)**1.5;D=x/(N1*k0)
    lat=p1-(N1*math.tan(p1)/R1)*(D*D/2-(5+3*T1+10*C1-4*C1*C1-9*ep2)*D**4/24+(61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*D**6/720)
    lon=lon0+(D-(1+2*T1+C1)*D**3/6+(5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*D**5/120)/math.cos(p1)
    return math.degrees(lat),math.degrees(lon)
def xy(E,N):
    lat,lon=utm2ll(E,N);return (round((lon-LON0)*MLON*PPM),round((LAT1-lat)*MLAT*PPM))
NS={'gml':'http://www.opengis.net/gml/3.2','bu-ext2d':'http://inspire.jrc.ec.europa.eu/schemas/bu-ext2d/2.0','bu-core2d':'http://inspire.jrc.ec.europa.eu/schemas/bu-core2d/2.0','base':'urn:x-inspire:specification:gmlas:BaseTypes:3.2'}
def polys(el):
    out=[]
    for pl in list(el.iter('{%s}PolygonPatch'%NS['gml']))+list(el.iter('{%s}Polygon'%NS['gml'])):
        ext=pl.find('.//gml:exterior//gml:posList',NS)
        if ext is None:continue
        v=list(map(float,ext.text.split()));out.append([xy(v[i],v[i+1]) for i in range(0,len(v),2)])
    return out
def inside(poly):return any(0<=p[0]<=W and 0<=p[1]<=H for p in poly)
# edificios: uso, viviendas, año
B={}
for ev,el in etree.iterparse('/tmp/cat/A.ES.SDGC.BU.04079.building.gml',tag='{%s}Building'%NS['bu-ext2d']):
    lid=el.find('.//base:localId',NS).text
    use=(el.findtext('bu-ext2d:currentUse',namespaces=NS) or '')
    dw=el.findtext('bu-ext2d:numberOfDwellings',namespaces=NS);yr=el.findtext('.//bu-core2d:dateOfConstruction//bu-core2d:beginning',namespaces=NS) or ''
    B[lid]=(use,int(dw) if dw and dw.isdigit() else 0,yr[:4])
    el.clear()
parts=[]
for ev,el in etree.iterparse('/tmp/cat/A.ES.SDGC.BU.04079.buildingpart.gml',tag='{%s}BuildingPart'%NS['bu-ext2d']):
    lid=el.find('.//base:localId',NS).text;bid=lid.split('_')[0]
    fa=el.findtext('bu-ext2d:numberOfFloorsAboveGround',namespaces=NS)
    fa=int(fa) if fa and fa.strip().lstrip('-').isdigit() else 0
    for p in polys(el):
        if len(p)>=4 and inside(p):parts.append((bid,fa,p))
    el.clear()
pools=[]
for ev,el in etree.iterparse('/tmp/cat/A.ES.SDGC.BU.04079.otherconstruction.gml',tag='{%s}OtherConstruction'%NS['bu-ext2d']):
    nat=el.findtext('.//bu-ext2d:constructionNature',namespaces=NS)
    if nat=='openAirPool':
        for p in polys(el):
            if inside(p):pools.append(p)
    el.clear()
json.dump({'B':B,'parts':parts,'pools':pools},open('/home/claude/osm/catastro/raw.json','w'))
from collections import Counter
print('parts',len(parts),'pools',len(pools),'blds in map',len(set(p[0] for p in parts)))
print(Counter(min(p[1],12) for p in parts))
print(Counter(B[p[0]][0] for p in parts if p[0] in B))
