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
