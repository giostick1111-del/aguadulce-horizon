import json,math,collections
P=json.load(open('pois26.json'));old=json.load(open('../3d/pois_old.json'))
LBL={'restaurant':'RESTAURANTE','cafe':'CAFETERÍA','bar':'BAR','pub':'PUB','fast_food':'COMIDA RÁPIDA','ice_cream':'HELADERÍA','hairdresser':'PELUQUERÍA','beauty':'CENTRO DE ESTÉTICA','supermarket':'SUPERMERCADO','convenience':'ALIMENTACIÓN','pharmacy':'FARMACIA','bank':'BANCO','dentist':'CLÍNICA DENTAL','doctors':'CONSULTA MÉDICA','clinic':'CLÍNICA','veterinary':'VETERINARIO','laundry':'LAVANDERÍA','estate_agent':'INMOBILIARIA','furniture':'MUEBLES','car_repair':'TALLER','variety_store':'BAZAR','optician':'ÓPTICA','gambling':'SALÓN DE JUEGO','clothes':'MODA','shoes':'ZAPATERÍA','lottery':'LOTERÍAS','insurance':'SEGUROS','pet_grooming':'PELUQUERÍA CANINA','driving_school':'AUTOESCUELA','bakery':'PANADERÍA','fitness_centre':'GIMNASIO','sports_centre':'CENTRO DEPORTIVO','mobile_phone':'TELEFONÍA','tattoo':'TATUAJES','stationery':'PAPELERÍA','physiotherapist':'FISIOTERAPIA','pet':'TIENDA DE ANIMALES','chemist':'DROGUERÍA','veterinary':'VETERINARIO','dancing_school':'ESCUELA DE BAILE','garden_centre':'VIVERO','bicycle':'BICICLETAS','nightclub':'DISCOTECA','telecommunication':'TELEFONÍA','car':'CONCESIONARIO','jewelry':'JOYERÍA','photo':'FOTOGRAFÍA','florist':'FLORISTERÍA','pastry':'PASTELERÍA','herbalist':'HERBOLARIO','hotel':'HOTEL','apartment':'APARTAMENTOS','guest_house':'HOSTAL','butcher':'CARNICERÍA','greengrocer':'FRUTERÍA','kiosk':'KIOSCO','tobacco':'ESTANCO','hardware':'FERRETERÍA','doityourself':'BRICOLAJE','travel_agency':'VIAJES','lawyer':'ABOGADOS','accountant':'ASESORÍA','tax_advisor':'ASESORÍA','books':'LIBRERÍA','electronics':'ELECTRÓNICA','computer':'INFORMÁTICA','gift':'REGALOS','toys':'JUGUETERÍA','sports':'DEPORTES','cosmetics':'PERFUMERÍA','perfumery':'PERFUMERÍA','seafood':'PESCADERÍA','alcohol':'BODEGA','wine':'VINOTECA','frozen_food':'CONGELADOS','deli':'DELICATESSEN','fuel':'GASOLINERA','post_office':'CORREOS','marketplace':'MERCADO','cinema':'CINE','tiles':'AZULEJOS','window_construction':'CARPINTERÍA','photographer':'FOTÓGRAFO','gas':'GAS','weapons':'ARMERÍA','massage':'MASAJES','nutrition_supplements':'NUTRICIÓN','e-cigarette':'VAPEO','copyshop':'COPISTERÍA','dry_cleaning':'TINTORERÍA','money_lender':'FINANCIERA','language_school':'ACADEMIA DE IDIOMAS','music_school':'ESCUELA DE MÚSICA','tutoring':'ACADEMIA','coworking':'COWORKING','yes':'TIENDA','motorcycle':'MOTOS','car_parts':'RECAMBIOS','interior_decoration':'DECORACIÓN','kitchen':'COCINAS','bed':'COLCHONES','second_hand':'SEGUNDA MANO','charity':'TIENDA SOLIDARIA','department_store':'GRANDES ALMACENES','mall':'CENTRO COMERCIAL','energy_supplier':'ENERGÍA','it':'INFORMÁTICA','company':'OFICINAS','architect':'ARQUITECTURA','notary':'NOTARÍA','government':'OFICINA','ngo':'ASOCIACIÓN','association':'ASOCIACIÓN','podiatrist':'PODOLOGÍA','psychotherapist':'PSICOLOGÍA','optometrist':'OPTOMETRÍA','laboratory':'LABORATORIO','hearing_aids':'AUDÍFONOS','medical_supply':'ORTOPEDIA','funeral_directors':'FUNERARIA','storage_rental':'TRASTEROS','car_rental':'ALQUILER DE COCHES','boat_rental':'ALQUILER DE BARCOS','dive_centre':'CENTRO DE BUCEO','spa':'SPA','sauna':'SAUNA','casino':'CASINO','events_venue':'SALÓN DE EVENTOS','community_centre':'CENTRO CÍVICO','social_facility':'CENTRO SOCIAL','childcare':'GUARDERÍA','kindergarten':'ESCUELA INFANTIL','nursing_home':'RESIDENCIA','arts_centre':'CENTRO CULTURAL','theatre':'TEATRO','hostel':'ALBERGUE','camp_site':'CAMPING','caravan_site':'ÁREA DE AUTOCARAVANAS','motel':'MOTEL','museum':'MUSEO','gallery':'GALERÍA'}
SKIP={'school','place_of_worship','townhall','college','university','parcel_locker','trolley_bay','vacant','police','library','fire_station','courthouse','prison','grave_yard','bus_station','ferry_terminal','public_building','monastery','vending_machine','boat_storage','harbourmaster','sailing_school','hospital','training','yacht_club'}
out=[];kept=collections.Counter()
def near(x,z,n):
    for o in out:
        if math.hypot(o[0]-x,o[1]-z)<25 and (o[2].lower()==n.lower()):return True
    return False
# primero los nuevos (OSM 2026) y luego los antiguos que no estén repetidos
for p in P:
    x,z,name,kind=p[0],p[1],p[2],p[3];k=kind.split(':')[1]
    if k in SKIP:continue
    if name.lower() in('shop','yes'):name=''
    if not name:
        name=LBL.get(k)
        if not name:continue
    if near(x,z,name):continue
    out.append([round(x,1),round(z,1),name,kind]);kept[kind]+=1
for o in old:
    if any(math.hypot(q[0]-o[0],q[1]-o[1])<30 and q[2].lower()==o[2].lower() for q in out):continue
    if o[3].split(':')[1] in SKIP:continue
    out.append(o)
# extras de la web (2026)
out.append([2822.0,1940.0,'Covirán El Rancho','shop:supermarket'])
print(len(out),'(antes',len(old),')')
json.dump(out,open('/home/claude/osm/3d/pois.json','w'),ensure_ascii=False)
