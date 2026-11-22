#!/bin/bash
# Prepara una sesión nueva de bot: enlaza el repositorio en las rutas que usan los scripts y compila el juego.
set -e
REPO=$(cd "$(dirname "$0")/.." && pwd)
for L in /home/claude/osm /tmp/fhtest; do
  if [ -e "$L" ] && [ ! -L "$L" ]; then echo "ABORTO: $L existe y no es un enlace; no lo toco"; exit 1; fi
  rm -f "$L"
done
ln -s "$REPO/osm" /home/claude/osm
ln -s "$REPO/fhtest" /tmp/fhtest
mkdir -p "$REPO/fhtest/bots_out"
cd /home/claude/osm/fh && python3 build.py
cd /tmp/fhtest && sed 's#https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js#three.min.js#' /home/claude/osm/aguadulce-horizon.html > index.html
echo "OK: juego compilado en /home/claude/osm/aguadulce-horizon.html"
