# Historial de los bots

Cada turno añade aquí una entrada (fecha, bot, qué encontró o arregló, resultado de las pruebas).

## 2026-11-22 — Inspector (seed 326)
- Compilación: OK.
- Reportes de jugadores: no se pudieron leer (`fh/bugs.json` bloqueado por permisos de acceso web en esta sesión); 0 reportes procesados.
- Fallos nuevos en la cola: 20 (6 de prioridad 1). Los peores: escalón de ~7 m en la autovía (3349,1261), escalón de ~5 m en zona Calle Carmen Pinteño (2004,733), escalón de ~4.3 m en un cañón/trinchera (3801,1342); además una zona sin terreno (suelo blanco) en Calle de Bristol (341,3579).
- Rendimiento: 583 calls, 447 590 tris, 194 texturas, 2051 geometrías.
- Pruebas: paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true pero airFr 698, take 3; fútbol (fb2) OK, los partidos avanzan y hay goles; móvil (mobfb.py) NO SE EJECUTÓ: falta `fhtest/mockfb.js`.
- Nota: los «bins» del log (65) no se dibujan (en parques está `if(false&&…)`), así que no hay papeleras visibles; no es fallo.

## 2026-11-22 (2ª pasada, lanzada a mano) — Inspector (seed 326)
- Sin cambios en el código del juego desde la pasada anterior; con la misma semilla saldrían las mismas calles, así que no se repitió la inspección automática.
- Reportes de jugadores: siguen sin poderse leer (permiso web no concedido).
- Hice capturas a ras de suelo de los 6 baches que faltaban por comprobar. Los 6 son escalones reales: Carretera de Málaga (4744,1690) con 3,0 m, Calle del Naranjo (2686,3138) con 2,7 m, Autovía del Mediterráneo (944,1143) con 3,1 m, Puerto de Guadarrama (3451,1507) con 3,5 m, Puerto de Navacerrada (3402,1518) con ondulaciones de ±2 m, y autovía oeste (223,2755) con 2,9 m. Los 6 suben a prioridad 1, así que hay 12 graves en la cola.
- 0 fallos nuevos; la cola sigue con 20.
- Pruebas: como en la pasada anterior; sigue faltando `fhtest/mockfb.js`, así que la prueba de móvil no se puede ejecutar.

## 2026-11-23 — Inspector (seed 327)
- Compilación: OK.
- Reportes de jugadores: no se pudieron leer (`fh/bugs.json` sigue bloqueado por permisos de acceso web en esta sesión); 0 reportes procesados.
- No hay cambios en el mapa desde ayer (el último commit solo añade motos): los 11 baches graves de ayer siguen igual.
- Fallos nuevos en la cola: 6 (3 de prioridad 1). Baches confirmados a ras de suelo: (2139,650) escalón de 3,4 m junto a un muro; (983,1158) escalón de 3,4 m que entra en una ranura entre paredes; Calle Puerto de Bonalgua (3506,1496) escalón de 3,2 m; (4553,1718) dientes de sierra ±2 m; (2065,761) 2,4 m. Motos: en vista interior la trail (tipo 6) muestra un retrovisor enorme flotando y no se ven manos en ninguna moto.
- Quitado de la cola: 20261122-9 (la prueba móvil ya funciona con `mockfb.js`).
- Añadido a fallos existentes: hoyo de ~4 m en Autovía de Roquetas (223,2776) con losa blanca inclinada y coche expulsado 20 m (208,2781); coche expulsado 10 m en Puerto de Navacerrada (3397,1489).
- Sin sitio en la cola (máx. 25), para el próximo turno: calzada cortada de golpe en Calle Islas Baleares (3650,1939); calzada cortada en diagonal contra la acera (1727,1557).
- Rendimiento: 674 calls, 503 164 tris, 195 texturas, 1996 geometrías (sube respecto a ayer: +91 calls, +56 000 tris, seguramente por las motos).
- Pruebas: paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true pero airFr 626, take 3; fútbol (fb2) OK, los partidos avanzan y hay goles; móvil (mobfb.py) OK (30 fps, sin errores). Motos 5-8 arrancan y se inclinan (lean 0,06–0,48).

## 2026-11-23 — Mecánico
- Arreglados 6 fallos (prioridad 1, en orden): 20261122-1 (3349,1261), -2 (3801,1342), -3 Calle del Mare Nostrum (3833,1761), -4 zona Carmen Pinteño (2004,733), -5 (4316,1277), -13 Carretera de Málaga (4744,1690).
- Causa común: en `conformTerrain` el perfil de cada calle se calculaba por separado; donde dos calles comparten nodo (cruces, y sobre todo las bocas de los antiguos túneles `wasT`) los perfiles llegaban a alturas distintas (hasta 8,8 m) y el terreno quedaba con escalones.
- Arreglo (regla general, `f3_world3d.js`): nueva `junctionFix()`. Primero se calculan todos los perfiles; luego en cada extremo de calle que toca otra calle se busca la altura común (media ponderada por categoría; si cae en mitad de otra calle, se ajusta a ella; los extremos que tocan un puente no se mueven) y la corrección se reparte en rampa de hasta 80 m. Después se adapta el terreno como antes.
- `f13_struct.js`: al comprobar si un puente queda enterrado, en los 8 m junto a cada estribo se tolera 1,5 m (antes 0,6) porque ahí el tablero ya va pegado al suelo; sin esto el puente (4614,1692)-(4697,1689) de la Carretera de Málaga se descartaba con el nuevo terreno.
- Medida (curvatura del terreno cada 5 m a lo largo de las calles): puntos >1,2 m: 148 → 42; >2,5 m: 28 → 8; >4 m: 4 → 1. En los 6 arreglados la curvatura baja a 0,04–0,64 m. Capturas a ras de suelo: sin escalones ni cortes.
- También bajan (pendiente de que el Inspector lo confirme, siguen en la cola con nota): 20261122-14 (0,33), -15 (0,13), -16 (1,03), 20261123-1 (0,23), 20261123-2 (0,43), 20261123-3 (0,94).
- No arreglados: 20261122-6 Calle de Bristol (341,3579): está fuera del mapa (z > 3445, donde acaban MDT y ortofoto); hace falta ampliar datos o recortar las calles que salen del mapa. Siguen mal: 20261122-18 (223,2755; el puente de la Autovía de Roquetas ya se descartaba antes de este cambio), 20261123-4 (4553,1718), 20261123-5 (2065,761), 20261122-17 (3402,1518).
- Pruebas: dbgload sin errores (nota: `dbgload.py` se ejecuta suelto con `python3 dbgload.py`; con `run.py` falla porque abre su propio navegador); paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true, airFr 585, take 1 (antes 626, take 3); móvil `ok []`; fútbol: partidos de 11, 7 y 5 en juego, con goles.
- Rendimiento (perf2, nr): 437 calls, 520 248 tris — igual que sin el cambio (437 calls, 520 126 tris).
- Nueva herramienta: `fhtest/metric.py` (cuenta baches por curvatura y mide cada punto de la cola) para comparar antes/después.
- Publicado: commit ed09eeb; workflow «Publicar juego» terminó en success.

## 2026-11-23 (2º turno) — Mecánico
- Arreglados 2 fallos y confirmados 4 del turno anterior (6 en total pasan a procesados):
  - 20261122-18 rotonda bajo la Autovía de Roquetas (223,2755): curvatura 3,22 → 0,72 m, perfil liso (45,9–47,7). Causas: el remate final de la autovía más allá del estribo del puente se metía en la rotonda; en la plataforma de dos vías de igual categoría a alturas muy distintas se cogía la más baja; y el puente de la 2ª calzada (202,2747)-(218,2839) se descartaba por un montículo de 1,2 m bajo el tablero, con lo que la calzada pasaba a ras por encima de la rotonda.
  - 20261123-4 calle paralela a la Carretera de Málaga (4553,1718): 2,73 → 1,68 m. Causa: el talud/acera de la carretera (más categoría) mandaba sobre la calzada de la calle más baja.
  - Confirmados a ras de suelo (captura + coche soltado 0 m): 20261122-14 (0,33), 20261122-15 (0,13), 20261123-1 (0,23), 20261123-2 (0,43).
- Arreglos (reglas generales): `f3_world3d.js` `conformTerrain`: (1) la calzada de una calle manda sobre el talud de otra (excepto el talud de las autovías, el remate más allá del final de una calle y las antiguas trincheras `wasT`); (2) un extremo apoyado en un puente no se prolonga más allá del estribo; (3) en la plataforma (cap/flo) a igual categoría manda la vía de eje más cercano y la calzada manda sobre la acera de otra. `f13_struct.js`: nueva `clearUnder()`: si un puente que cruza sobre otra vía solo queda enterrado ≤4 m en el centro, se rebaja el terreno bajo el tablero en vez de quitar el puente (ahora hay 11 puentes, antes 10).
- Medida global (metric.py/top.py, curvatura cada 5 m): puntos >1,2 m: 42 → 19; >2,5 m: 8 → 0; >4 m: 1 → 0. Probé y descarté otras variantes (desempate por cercanía en la jerarquía general; talud de autovía sin prioridad) porque creaban escalones nuevos en (199,2728) y (379,2206).
- No arreglados: 20261122-6 (fuera del mapa), 20261123-5 (2065,761; 2,39 m, sin cambios), 20261122-17 y -16 (curvatura 1,5/1,2 m pero el coche soltado se desplaza 10 m), 20261123-3 (aquí bien, pero a 30 m queda (3502,1525) con 2,32 m), 20261122-8 (airFr 585). Nuevo en la cola: 20261123-7, coche soltado bajo el puente recuperado (208,2781) se desplaza 20 m.
- Pruebas: dbgload sin errores (solo fallos de red de fuentes externas); paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 585, take 1); móvil `ok []`; fútbol: partidos de 11, 7 y 5 en juego, con goles.
- Rendimiento (perf2, nr): 437 calls, 518 502 tris (antes 437 / 520 248).
- Herramientas nuevas en `fhtest/`: `diag.py` (calles cercanas a un punto con perfil cy/H; PTS por entorno), `top.py` (lista de puntos con curvatura >2 m), `shots.py` (capturas a ras de suelo; usar con `run.py ""`), `drop.py` (suelta el coche en puntos de la cola).
- Publicado: commit 5635fe4; workflow «Publicar juego» terminó en success.

## 2026-11-23 (3ª pasada, lanzada a mano) — Mecánico
- Arreglado 20261123-6 (motos, vista desde el casco): el «retrovisor enorme flotando» de la trail era su guardabarros alto, colocado en el marco del manillar sumando la altura dos veces (quedaba a ~1,6 m); ahora va bajo el faro. Las manos no se veían porque la cámara del casco miraba demasiado alta: inclinación 3,4 → 6 (deportiva 7,5). Scooter, naked y trail muestran brazos y manos; en la deportiva el carenado aún tapa las manos (anotado).
- Procesados sin cambio de código: 20261122-10 no reproducible (capturas hacia los 4 lados en (3961,1819) sin nada en el cielo); 20261123-7 no es fallo (el punto está en la isleta de la rotonda bajo el puente; el coche se aparta a la calzada).
- Diagnosticados, sin arreglar: 20261122-16/-17 (el coche se aparta 10 m porque esas calles de OSM atraviesan bloques de viviendas del Catastro; conflicto de datos), 20261123-3 (cambio de pendiente real del 10 % al 45 %), 20261123-5 (glorieta 2,4 m sobre el margen de un ramal de autovía), 20261122-12 (reproducido: la calzada acaba en tierra; antiguo puente descartado de 11,6 m).
- No dio tiempo: calzadas cortadas de Calle Islas Baleares (3650,1939) y (1727,1557) (no están en la cola).
- Pruebas: dbgload sin errores (solo fuentes externas); paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 589, take 1); móvil `ok []`; fútbol: partidos de 11, 7 y 5 con goles; motos (car1.py) sin errores.
- Rendimiento (perf2, nr): 437 calls, 519 002 tris.
- Nuevo: `fhtest/motos_casco.py` (capturas de la vista desde el casco de las 4 motos).
- Publicado: commit c10e8eb; workflow «Publicar juego» terminó en success.

## 2026-11-24 — Inspector (semilla 328)
- Avisos de jugadores: no se pudieron leer (WebFetch a `fh/bugs.json` falló: la petición de permiso no se respondió a tiempo). Se siguió sin reportes.
- 8 fallos nuevos en la cola (19 en total). Los más graves: escalón de 2,3 m con la calzada metida contra una ladera en calle sin nombre de la costa este (4451,1747); hundimiento de 1,4 m con raja negra en el Paseo Marítimo junto al puerto (4186,1844); salto de 2,6 m en calle alta junto a la Autovía (2089,702). Añadidas también las dos calzadas cortadas que el turno anterior dejó fuera (3650,1939) y (1727,1557).
- Inspección automática: 14 baches >1,2 m (máx. 2,39 m; ninguno >2,5 m), 0 problemas al soltar el coche en 40 puntos. Revisados a ras de suelo los 5 nuevos de mayor curvatura: 3 son fallos reales; Calle de Virginia (2369,1490) y (2297,1394) son cuestas normales.
- Siguen: 20261122-16 (cámara al azar dentro del bloque en (3454,1488)), 20261123-3 (3502,1525; 2,32 m), 20261123-5 (2,39 m). (4553,1718) baja a 1,21 m.
- Motos 5–8: arrancan, avanzan y se inclinan (lean 0,02–0,32); vista desde el casco (camMode 2) correcta en las 4; en la deportiva el carenado sigue tapando las manos (ya anotado).
- Rendimiento (inspector, sin reportes): 369 calls, 250 621 tris, 200 texturas, 2025 geometrías.
- Pruebas: compilación OK; paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 585, take 1); fútbol (fb2) OK, partidos de 11, 7 y 5 en juego con goles; móvil (mobfb) `ok []`.

## 2026-11-24 — Mecánico
- Arreglado 20261124-2, el Paseo Marítimo junto al puerto (4186,1844), y de paso el otro punto del Paseo en (4249,1839). Causa: `flattenPort` (`f15_port.js`) bajaba a la cota de la explanada (1,2 m) toda celda del terreno (rejilla de 6 m) a menos de 6 m de la explanada, aunque estuviera bajo la calzada del Paseo. Con la interpolación eso hundía el borde de la calzada 1,4–1,9 m y abría la raja negra. Arreglo (regla general): no se rebajan las celdas bajo una vía principal (`mainRoad`) que no sean explanada. Curvatura: 1,89→0,03 m y 1,37→0,01 m. Captura a ras de suelo limpia.
- No reproducible: 20261124-5 (1727,1557). En la vista cenital y a ras de suelo el cruce tiene calzada continua y paso de cebra.
- Diagnosticados, sin arreglar (siguen en la cola con nota):
  - 20261124-1 (4451,1747): una calle cls 3 va paralela a 7 m de otra cls 1 que está 3 m más alta (es el MDT). La rejilla de 6 m no puede representar ese desnivel. Probé dos cambios de jerarquía en `conformTerrain`: contar como calzada solo la anchura real, y que el talud no tire de una calzada ya puesta. Ninguno mejora aquí (1,94→1,76 como mucho) y el segundo empeora Puerto de Navacerrada (1,54→2,47), así que los descarté. Haría falta un muro entre calzadas o una rejilla más fina.
  - 20261124-3 (2089,702): antiguo túnel (`wasT`, idx 949) que cruza bajo la Autovía del Mediterráneo; la calle sube 3,5 m sobre la autovía. Falta decidir si se corta o se sube el perfil.
  - 20261124-4 (3650,1939): dos calles de OSM casi superpuestas (Islas Baleares y Calle de la Escucha) se juntan y la acera entre ambas acaba en cuña.
- Sin tocar este turno: los de prioridad 1 ya diagnosticados en turnos anteriores (20261122-6 fuera del mapa; 20261122-16/-17 conflicto OSM/Catastro; 20261123-3 cambio de pendiente real).
- Medida global (`fhtest/met2.py`, curvatura cada 5 m): puntos >1,2 m: 19 → 16; >2,5 m: 0. Ningún punto nuevo.
- Pruebas:
  - dbgload sin errores; solo fallan las fuentes externas (ERR_TUNNEL).
  - paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 587, take 1).
  - móvil `ok []`; fútbol: partidos de 11, 7 y 5 en juego, con goles.
- Rendimiento (perf2, nr): 437 calls, 526 960 tris (antes 437 / 519 002; +1,5 %).
- Nueva herramienta: `fhtest/met2.py` (curvatura global y en los puntos de la cola, con la lista de puntos >1,2 m).
- Publicado: commit 4cea5fb, pero el workflow «Publicar juego» (run 45326185502) falló dos veces en `deploy-pages` («No artifacts named github-pages were found», aunque `upload-pages-artifact` terminó bien). Parece un fallo de GitHub, no del juego. No toco `.github/`. El push no relanzó el workflow (solo salta con cambios en site/), así que lo lancé a mano (workflow_dispatch, run 45327249334 sobre 66028d8): terminó en success. Web publicada.

## 2026-11-25 — Inspector (semilla 329)
- Avisos de jugadores: no se pudieron leer (WebFetch a `fh/bugs.json` falló otra vez: la petición de permiso no se respondió a tiempo). Se siguió sin reportes.
- 3 fallos nuevos en la cola (20 en total). Los más graves: escalón de 2,7 m con raja negra junto a un paso de cebra en calle sin nombre al lado de la Autovía de Roquetas (361,2174); calzada que acaba contra una casa y atraviesa un edificio en la zona de Don Juan de Austria / Zaidín (1712,2767); franja vertical rara en el cielo en Calle Chillida (752,1552).
- Inspección automática: 12 baches >1,2 m (máx. 2,39 m; ninguno >2,5 m); 1 coche «expulsado» en (82,3473), que es fuera del mapa (z>3445): el coche vuelve al borde; se anota en 20261122-6 junto con Calle Briviescas (668,3432), que también sigue sobre suelo blanco.
- Revisados a ras de suelo: (361,2174) fallo nuevo; (3421,1507), (3502,1525), (2065,761) y (198,2719) siguen (raja negra confirmada en 20261124-6).
- Motos 5–8 en Avenida de Carlos III con vista desde el casco (camMode 2): manillar, espejos y manos bien en las 4; avanzan y se inclinan (lean 0,02–0,20). La scooter (5) apenas acelera en 2,5 s (0,9 m/s); puede ser solo que es lenta, sin confirmar.
- Rendimiento (inspector, sin reportes): 354 calls, 183 491 tris, 201 texturas, 2148 geometrías.
- Pruebas: compilación OK; paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 585, take 1); fútbol (fb2) OK, partidos de 11, 7 y 5 en juego con goles; móvil (mobfb) `ok []`.

## 2026-11-25 — Mecánico
- Arreglados 5 fallos (pasan a procesados):
  - 20261125-1 escalón con raja junto al paso de cebra al lado de la Autovía de Roquetas (361,2174). Causa: la calle idx 694 era un antiguo túnel (`wasT`) bajo las dos calzadas de la autovía; sin túnel, su calzada subía por el talud y quedaba como losas encima de la autovía.
  - 20261124-3 calle alta junto a la Autovía del Mediterráneo (2089,702): mismo caso (antiguo túnel idx 949). Decisión: como los túneles están prohibidos, la calle se corta a cada lado de la autovía. Curvatura 1,44 → 0,11 m.
  - 20261122-6 Calle de Bristol / Calle Briviescas sobre suelo blanco, y 20261122-7 (colisión fantasma en z=3545, misma zona): 70 vías de OSM salían del mapa (z > 3445). Ahora se cortan en el borde del mapa.
  - 20261125-3 franja recta en el cielo (Calle Chillida): reproducido mirando hacia −X; es la costura de la textura de la cúpula, donde se cortaban las nubes y una loma. Ahora la textura es continua (no cambia la iluminación).
- Arreglos (reglas generales):
  - `f1_world.js`: nueva `cutRoads()` (parte vías y descarta trozos cortos).
    - Corte en el borde del mapa.
    - Antiguos pasos inferiores (`wasT`) que cruzan, sin unirse, bajo una vía de más categoría: se quita el tramo dentro del talud de esa vía. Las calles que llegaban a la boca se recortan hasta 25 m de ella para no acabar metidas en el talud. Se recortaron 4 pasos inferiores (también Calle Menorca bajo Carlos III y otro bajo la Autovía de Roquetas en (170,3275)) y 8 calles vecinas.
  - `f3_world3d.js` `paintSky`: nubes y sierras se dibujan también desplazadas una vuelta.
- Medida global (`met2.py`): puntos >1,2 m: 16 → 15; >2,5 m: 0. Aparece (122,3406) con 1,31 m en la Autovía de Roquetas, a 40 m del borde del mapa (efecto del corte en el suavizado). A ras de suelo no se ve nada raro; queda anotado.
- No arreglados (siguen en la cola): 20261122-16/-17, 20261123-3, 20261124-1 (ya diagnosticados: conflicto OSM/Catastro, cambio de pendiente real, desnivel que no cabe en la rejilla de 6 m). No dio tiempo a los de prioridad 2 restantes, entre ellos 20261125-2 (calle contra edificio, posible conflicto OSM/Catastro).
- Pruebas:
  - dbgload sin errores (solo ERR_TUNNEL de fuentes externas).
  - paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 43, take 1; antes 585).
  - móvil `ok []`; fútbol: partidos de 11, 7 y 5 en juego, con goles.
- Rendimiento (perf2, nr): 436 calls, 525 076 tris (antes 437 / 526 960).
- Herramientas nuevas en `fhtest/`: `cam.py` (capturas libres por ángulo, distancia y altura, o vista cenital), `sky.py` (capturas del cielo en 6 direcciones).
- Publicado: commit ea3aba3. El workflow «Publicar juego» lanzado por el push (run 45547093163) falló en `deploy-pages` con «No artifacts named github-pages», el mismo fallo de GitHub del 24-11. Lo lancé a mano (run 45547412536), volvió a fallar y en el reintento terminó en success. Web publicada.

## 2026-11-26 — Inspector (semilla 330)
- Avisos de jugadores: no se pudieron leer (WebFetch a `fh/bugs.json` falló: la petición de permiso no se respondió a tiempo). Se siguió sin reportes.
- 2 fallos nuevos en la cola (17 en total):
  - 20261126-1 (875,3320): calle con aceras y farolas que pasa por dentro de una nave/invernadero gris semitransparente, al sur de Avenida de Carlos III.
  - 20261126-2 (1544,2531): terreno de la ortofoto asomando sobre la acera de los comercios en la rotonda de Calle Alfaguara / Carlos III; y un polígono gris semitransparente sin identificar al oeste.
- Inspección automática: 11 baches >1,2 m (máx. 2,39 m; ninguno >2,5 m), todos ya conocidos. A ras de suelo los 5 mayores siguen igual: (2065,761), (3502,1525), (4451,1747) con el borde levantado, (3421,1507) con la cámara entre bloques; Calle de Virginia (2369,1490) sigue siendo cuesta normal (al lado de un campo de fútbol).
- Revisado y NO es fallo: el cilindro y la pancarta rosa en (4494,1760) son la salida del «Circuito Carlos III»; las 65 papeleras de Mapillary se cuentan en `f11_street.js` pero no se dibujan.
- Motos 5–8 en (621,1937), vista desde el casco (camMode 2) y vista de persecución: bien las 4. En la deportiva (8) no se ven las manos porque las tapa el carenado.
- Rendimiento (inspector, sin reportes): 445 calls, 526 362 tris, 189 texturas, 1923 geometrías.
- Pruebas: compilación OK; paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 42, take 1); móvil (mobfb) `ok []`; fútbol (fb2) OK, partidos de 11, 7 y 5 en juego, con goles.

## 2026-11-26 — Mecánico
- Arreglados 3 fallos (pasan a procesados):
  - 20261122-16 Calle Puerto de Guadarrama (3451,1507) y 20261122-17 Puerto del Manzanal (3397,1489): las calles de OSM atravesaban bloques de viviendas del Catastro (2002); el coche soltado se apartaba 10 m y la cámara quedaba entre bloques. Ahora el coche se queda en su sitio (0 m). La curvatura que queda (1,24–1,56 m) es la pendiente real de la calle.
  - 20261126-1 (875,3320): calle con aceras y farolas dentro de un invernadero del Catastro (idx 19094). El invernadero queda ahora al lado de la calle.
- Arreglo (regla general, `f1_world.js` `roadBldFix` en `loadBlds`), para edificios que pisan una calzada cls 0–4:
  - los vértices que caen en la calzada se apartan a media anchura + 1 m;
  - si la calle sigue cruzando el edificio, se parte en dos por la calzada;
  - si no queda al menos el 30 % del edificio, se quita.
  - Resultado: 99 edificios recortados o partidos (unos 50 son invernaderos) y 5 quitados (3 en Calle Moncabril, 1 en Puerto de Piqueras y una obra de 2024 en Calle Puerto de la Cruz / Calle Cortijo).
  - Decisión: manda la calle (es por donde se conduce). Primero probé a quitar los edificios enteros, pero vaciaba la urbanización de las calles «Puerto de…» (20 bloques que sí salen en la ortofoto); por eso se parten.
  - Log nuevo: `env calles-edificio <quitados> <recortados>`.
- No arreglados:
  - 20261125-2 (Pasaje Zaidín): ya no hay edificios que pisen la calle; la calzada de OSM acaba sin salida en un patio entre fachadas. Queda en la cola con la nota.
  - 20261122-16/-17 (curvatura), 20261123-3, 20261124-1, 20261123-5: ya diagnosticados, sin cambios.
- Pruebas:
  - dbgload sin errores (solo ERR_TUNNEL); paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 43, take 1).
  - móvil `ok []`; fútbol: partidos de 11, 7 y 5 en juego, con goles.
  - met2: puntos >1,2 m: 15; >2,5 m: 0.
- Rendimiento (perf2, nr): 436 calls, 525 903 tris (antes 436 / 525 076).
- Publicado: commit 0908d22. El workflow «Publicar juego» (run 45755580272) falló al principio en `deploy` (el mismo fallo intermitente de GitHub de días anteriores). Al relanzarlo terminó en success. Web publicada.

## 2026-11-27 — Inspector (semilla 331)
- Avisos de jugadores: no se pudieron leer (WebFetch a `fh/bugs.json` rechazado: la petición de permiso no se respondió a tiempo; curl también bloqueado por el proxy). Se siguió sin reportes.
- 4 fallos nuevos en la cola (18 en total):
  - 20261127-1 (4660,1633): camino sin nombre (cls 3) en la ladera este; muro de terreno casi vertical pegado a la calzada (14,6→25,0 m en 10 m) y franja de acera trepando la ladera.
  - 20261127-2 (3380,1600): montículo de terreno en picos por encima de las casas entre Calle de Fray Leopoldo y Calle Latón; franja azul junto a la acera.
  - 20261127-3 (670,3395): Calle Ribadelago, fachada pegada al bordillo (acera derecha ~0,5 m).
  - 20261127-4 (1964,1251): arena del terreno sobre las aceras en la cuesta junto a Calle Jesús de Perceval.
- Inspección automática: 11 baches >1,2 m (máx. 2,39 m; ninguno >2,5 m), todos ya conocidos. A ras de suelo: (2065,761) escalón 132,0→134,4; (3502,1525) y (3421,1507) +3 m en 5 m (pendiente real según el Mecánico); (4451,1747) 26,0→23,7; Calle de Virginia (2369,1490) cuesta normal. Coche soltado en 40 puntos: sin coche bajo el suelo, en edificio ni expulsado.
- Motos 5–8 en Calle Suspiro del Moro (2150,2784), vista interior (camMode 2) y persecución: bien las 4.
- Rendimiento (inspector, sin reportes): 519 calls, 819 868 tris, 196 texturas, 1970 geometrías. Ojo: es el valor más alto visto en el inspector (antes 183k–526k), aunque depende de dónde queda el coche; vigilar con perf2.
- Pruebas: compilación OK; paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 43, take 1); móvil (mobfb) `ok []`; fútbol (fb2) OK, partidos de 11, 7 y 5 en juego, con goles.

## 2026-11-27 — Mecánico
- Arreglado 1 fallo (pasa a procesados):
  - 20261127-4 (1964,1251), cuesta junto a Calle Jesús de Perceval: arena del terreno sobre las aceras. Causa general: la rejilla del suelo (6 m) es más gruesa que las aceras; sus vértices bajo la acera ya se bajaban, pero el triángulo del suelo asomaba entre ellos en cuñas y montículos.
  - Arreglo (regla general, `carveGround` en `f16_parks.js`): 2º paso que recorre cada triángulo de acera, calzada, arcén y parque cada ~1,5 m y, donde el suelo asoma, baja los vértices de esa celda (solo si asoma ≤1,5 m y como mucho 3 m por vértice, para no abrir zanjas en las sendas de monte). En todo el mapa: triángulos con tierra >10 cm por encima pasan de 938 a 38 (los que quedan son sendas cls 5–7 en ladera). Log: `env carve` añade `fixed` y `deep` (vértices bajados >1 m: 363).
  - A ras de suelo en Jesús de Perceval: las dos aceras se ven enteras con su bordillo.
- No reproducible: 20261122-20 (787,3017): sin montículo en ninguna dirección; el nombre «Génova» era el de la posición del coche, no de la cámara.
- No arreglados (con nota en la cola):
  - 20261127-3 Calle Ribadelago: no es roadBldFix (no se recortó ningún edificio); las fachadas del Catastro están a 4,3–4,7 m del eje de OSM y la calzada mide 7,6 m. Haría falta estrechar la calzada entre fachadas cercanas.
  - 20261127-2 (3380,1600): es la ladera real (53 → 75–80 m a 40–70 m); los «picos» son surcos cada ~24 m; sin ortofoto no se sabe si son reales.
  - Los de prioridad 1 (20261123-3, 20261124-1) y 20261123-5, 20261122-12, 20261124-4: ya diagnosticados, sin cambios.
- Pruebas: dbgload sin errores (solo ERR_TUNNEL de fuentes externas); paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 43, take 1); móvil `ok []`; fútbol: partidos de 11, 7 y 5 en juego, con goles.
- Rendimiento (perf2, nr): 436 calls, 521 219 tris (antes 436 / 525 903).
- Publicado: commit 4bb6a8a. El workflow «Publicar juego» (run 45940633140) terminó en success. Web publicada.

## 2026-11-28 — Inspector (semilla 332)
- Avisos de jugadores: no se pudieron leer (WebFetch a `fh/bugs.json` rechazado otra vez: «la petición de permiso no se respondió a tiempo»). Se siguió sin reportes.
- 3 fallos nuevos en la cola (19 en total):
  - 20261128-1 (932,1179): paso superior de la Autovía del Mediterráneo; terraplén cortado en vertical junto a la pila y tierra por encima de la calzada lateral; punta triangular del tablero solapada con la calzada.
  - 20261128-2 (2825,1778): calle sin salida junto a Calle Toronto/Sonora que acaba contra un montículo de tierra entre las fachadas.
  - 20261128-3 (3035,2833): Paseo Marítimo, locales con escaparates ~1,5 m por encima de la acera sobre un zócalo.
- Inspección automática: 11 baches >1,2 m (máx. 2,39 m; ninguno >2,5 m), todos ya conocidos. A ras de suelo: (2065,761), (3502,1525), (4451,1747) siguen igual; Calle de Virginia (2369,1490) y (3421,1507) cuesta normal entre edificios.
- Motos 5–8 en (1969,3422), vista normal y vista interior (camMode 2), y la 8 conduciendo en interior: bien las 4 (manillar, espejos y piloto correctos).
- Rendimiento (inspector, sin reportes): 332 calls, 314 139 tris, 201 texturas, 2081 geometrías.
- Pruebas: compilación OK; paseo-auto-nr done:true (airFr 0); autovia-auto-nr done:true (airFr 43, take 1); móvil (mobfb) `ok []`; fútbol (fb2): partidos de 11, 7 y 5 en juego (7 y 5 con goles, 3-2; el de 11 iba 0-0 a los 194 s).
