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
