# Bot INSPECTOR — instrucciones de cada turno

Objetivo: encontrar fallos del mapa y dejarlos en `bots/cola.json` para el Mecánico. **No toca el código del juego.**

1. Preparación
   - `bash bots/setup.sh` (desde la raíz del repositorio). Si falla la compilación, apúntalo como fallo de prioridad 0 en la cola y termina.
   - Lee `bots/PREFERENCIAS.md`. Lo que ahí se prohíbe NO es un fallo.
2. Reportes de jugadores (botón «⚠» del juego)
   - Lee con WebFetch `https://aguadulce-ley-de-la-calle-default-rtdb.europe-west1.firebasedatabase.app/fh/bugs.json`
     (pide el JSON literal: id, x, y, z, yaw, cam, nota, calle, v, t). Si da error de permisos o está vacío, sigue.
   - Descarta los ids que ya estén en `bots/procesados.json`. Guarda los nuevos en `/tmp/fhtest/bots_out/reportes.json`
     como lista de objetos con su `id`.
   - Si quieres ver la miniatura del jugador: `.../fh/bugimg/<id>.json` (es un data:image/jpeg en base64).
3. Inspección automática
   - `cd /tmp/fhtest && SEED=<día del año> REPORTS=/tmp/fhtest/bots_out/reportes.json timeout 900 python3 run.py "" inspector.py`
   - Genera `bots_out/inspeccion.json` (baches por curvatura del terreno, coche bajo el suelo/dentro de edificios/expulsado,
     rendimiento, errores de consola) y capturas `rep*.png` (reportes) y `sw*.png` (calles al azar).
   - Además: `timeout 600 python3 run.py paseo-auto-nr steps.py` y `... autovia-auto-nr steps.py` (deben acabar con "done":true),
     `timeout 600 python3 mobfb.py`, `timeout 400 python3 run.py "" fb2.py`.
4. Revisión visual
   - Mira TODAS las capturas (herramienta Read). Busca: edificios flotando o hundidos, huecos en el suelo, carreteras que flotan o se
     hunden, bordillos/aceras a distinta altura que la calzada, parpadeos, objetos atravesando calles, texturas rotas.
   - Para los 5 baches de mayor curvatura haz una captura a ras de suelo (cámara a 2 m, mirando a lo largo de la calle) y decide si es
     un fallo real (escalón, rampa brusca, coche que salta) o una cuesta normal.
5. Cola
   - Escribe `bots/cola.json` (lista, máx. 25, ordenada por prioridad 1=grave … 3=detalle) con objetos:
     `{"id":"AAAAMMDD-n","origen":"jugador|auto|visual","tipo":"...","x":..,"z":..,"cam":[..]|null,"detalle":"qué se ve y por qué es fallo","reporte":"<id firebase o null>","prioridad":1}`
     Mantén los pendientes que siga habiendo de turnos anteriores (no los dupliques: mismo tipo a <20 m = el mismo).
   - Añade una entrada a `bots/HISTORIAL.md` con fecha, nº de fallos nuevos, rendimiento (calls/tris) y resultado de las pruebas.
6. `git add bots && git commit -m "Inspector: <resumen>" && git push`. No subas capturas al repositorio.
