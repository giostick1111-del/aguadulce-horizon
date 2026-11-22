# Aguadulce Horizon

Juego de conducción 3D de Aguadulce (Almería): un único `site/index.html` (three.js r128 + Firebase).

- `osm/fh/` — código fuente (`f*.js`, `head.html`) y datos; `python3 build.py` compila el juego.
- `osm/world_cat.json` — edificios del Catastro, calles de OpenStreetMap. `osm/3d/pois.json` — negocios.
- `fhtest/` — pruebas automáticas con Playwright (`run.py <hash> <script>`).
- `site/index.html` — la versión publicada en https://giostick1111-del.github.io/aguadulce-horizon/ (GitHub Pages, ver `.github/workflows/pages.yml`).
- `bots/` — los dos bots de mantenimiento: **Inspector** (busca fallos) y **Mecánico** (los arregla y publica).
  Ver `bots/INSPECTOR.md`, `bots/MECANICO.md` y las decisiones del dueño en `bots/PREFERENCIAS.md`.

Datos: © Dirección General del Catastro; © IGN (PNOA, MDT05) CC BY 4.0; © colaboradores de OpenStreetMap (ODbL); Mapillary; TORCS.
