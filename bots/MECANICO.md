# Bot MECÁNICO — instrucciones de cada turno

Objetivo: arreglar los fallos de `bots/cola.json`, comprobar que nada se rompe y publicar (Netlify publica `site/` al hacer push).

1. Preparación: `bash bots/setup.sh`. Lee `bots/PREFERENCIAS.md` (obligatorio) y `bots/cola.json`.
   Si la cola está vacía, apúntalo en el historial y termina sin publicar.
2. Para cada fallo, en orden de prioridad (máx. 6 por turno; para si llevas más de ~90 minutos):
   a. Reprodúcelo: captura en su posición (`window.__cam=[cx,cy,cz,tx,ty,tz]` y `__g.ME` como en `walk.py`/`top2.py`).
      Si no se reproduce, márcalo como "no reproducible" y pásalo a procesados.
   b. Busca la causa en `osm/fh/*.js` (terreno: `conformTerrain`, `carveGround`, `flattenPort`; carreteras: `rbMesh`, `RIBYC`,
      aceras/bordillos: `WALKQ`; puentes: `f13_struct.js`; edificios: `buildBuildings`). Arregla la causa, no el síntoma
      (prefiere reglas generales que arreglen todos los casos iguales a parches por coordenadas).
   c. `cd /home/claude/osm/fh && python3 build.py` y la misma captura otra vez: el fallo debe haber desaparecido y no debe
      aparecer nada nuevo alrededor.
3. Pruebas de regresión (TODAS deben pasar; si alguna falla y no lo puedes arreglar, deshaz tus cambios con `git checkout -- osm`
   y no publiques):
   - `cd /tmp/fhtest && sed ... > index.html` (como en setup.sh) y `timeout 400 python3 run.py "" dbgload.py` sin errores (PE/Error).
   - `run.py paseo-auto-nr steps.py` y `run.py autovia-auto-nr steps.py` con `"done":true`.
   - `python3 mobfb.py` termina con `ok []`; `run.py "" fb2.py` muestra partidos de 11, 7 y 5.
   - `run.py nr perf2.py`: `calls` y `tris` no más de un 10 % por encima de lo apuntado en el último HISTORIAL.
4. Publicar (el dueño pidió publicación directa en Netlify):
   - `cp /home/claude/osm/aguadulce-horizon.html site/index.html`
   - Pasa los ids arreglados (y sus `reporte`) a `bots/procesados.json` y quítalos de `bots/cola.json`.
   - Entrada en `bots/HISTORIAL.md`: qué fallos, causa, cómo se arregló, resultado de pruebas, rendimiento.
   - `git add -A && git commit -m "Mecánico: <resumen>" && git push`.
5. Nunca: cambiar la iluminación, volver a poner lo prohibido en PREFERENCIAS.md, borrar datos de jugadores,
   tocar `.github`, reescribir el historial de git ni hacer `push --force`.
