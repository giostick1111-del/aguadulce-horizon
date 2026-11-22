import json
P='/home/claude/osm/fh/'
h=open(P+'head.html',encoding='utf8').read()
js='<script>\n'+''.join(open(P+f,encoding='utf8').read()+'\n' for f in ['f1_world.js','pp/CopyShader.js','pp/LuminosityHighPassShader.js','pp/EffectComposer.js','pp/RenderPass.js','pp/ShaderPass.js','pp/UnrealBloomPass.js','f2_tex.js','f2b_atlas.js','f3_world3d.js','f3b_env.js','f4_car.js','f4b_carmodel.js','f4c_audio.js','f5_race.js','f7_social.js','f8_settings.js','f9_traffic.js','f10_ops.js','f11_street.js','f12_render.js','f13_struct.js','f14_futbol.js','f15_port.js','f16_parks.js','f17_public.js','f18_bugs.js','f6_main.js'])
# f1 empieza con <script> y 'use strict'
js=js.replace('<script>\n<script>','<script>',1)
cfg=json.dumps({"apiKey":"AIzaSyCrMogQgy1goZHgISNUFwBbh8Sdk4CBx54","authDomain":"aguadulce-ley-de-la-calle.firebaseapp.com","projectId":"aguadulce-ley-de-la-calle","appId":"1:19056400800:web:094e406fb20d1554cdecc5","databaseURL":"https://aguadulce-ley-de-la-calle-default-rtdb.europe-west1.firebasedatabase.app"})
h=h.replace('__WORLD__',open('/home/claude/osm/world_cat.json',encoding='utf8').read().strip()).replace('__FBCFG__',cfg).replace('__DEM__',open(P+'dem5.json').read()).replace('__SND__',open(P+'snd/snd.json').read()).replace('__PORT__',open(P+'portdata.json').read()).replace('__POI__',open('/home/claude/osm/3d/pois.json',encoding='utf8').read())
import base64
import time
js=js.replace('__BUILD__',time.strftime('%Y%m%d-%H%M'))
js=js.replace('__ORTHO__','data:image/jpeg;base64,'+base64.b64encode(open(P+'pnoa.jpg','rb').read()).decode()).replace('__PORT__',open(P+'portdata.json').read()).replace('__PARKS__',open(P+'parks.json').read()).replace('__PKD__',open(P+'pk.json').read()).replace('__PUBD__',open(P+'public.json',encoding='utf8').read())
out=h+js
open('/home/claude/osm/aguadulce-horizon.html','w',encoding='utf8').write(out)
print(len(out))
