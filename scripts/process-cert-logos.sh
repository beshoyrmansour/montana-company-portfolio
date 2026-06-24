#!/usr/bin/env bash
#
# Batch-process certification logos into white-tile-ready transparent PNGs.
#
# 1. Drop the official raw logo files (PNG / JPG / WEBP) into:
#       public/images/certifications/_raw/
#    Name each by its target slug so the output matches CERT_LOGOS, e.g.
#       brcgs.png  ifs.jpg  iso-22000.png  globalgap.png  smeta.png
#       halal.png  nfsa.png  qcap.png  fda.png  codex.png
#
# 2. Run:  bash scripts/process-cert-logos.sh
#
# For each raw file it:
#   - removes the solid background (flood-fills from the corners, so white
#     INSIDE the logo is preserved),
#   - trims to the artwork, normalises the height, adds a little transparent
#     padding, and writes <slug>.png next to this folder.
#
# Tunables (env vars):  FUZZ=12  HEIGHT=240  PAD=10
#
# Note: this handles logos on a SOLID background (white or any flat colour).
# Logos on a photographic / gradient background need an AI matte tool such as
# `rembg` (pip install rembg) — see the printed hint at the end.
#
set -euo pipefail

RAW_DIR="public/images/certifications/_raw"
OUT_DIR="public/images/certifications"
FUZZ="${FUZZ:-12}"     # % colour tolerance when matching the background
HEIGHT="${HEIGHT:-240}" # output height in px (width scales to keep ratio)
PAD="${PAD:-10}"       # transparent padding around the trimmed logo

command -v magick >/dev/null 2>&1 || { echo "ERROR: ImageMagick (magick) not found"; exit 1; }
[ -d "$RAW_DIR" ] || { echo "ERROR: $RAW_DIR does not exist — create it and add raw logos."; exit 1; }

shopt -s nullglob nocaseglob
files=("$RAW_DIR"/*.{png,jpg,jpeg,webp})
shopt -u nocaseglob
[ ${#files[@]} -gt 0 ] || { echo "No raw images in $RAW_DIR — drop logo files there first."; exit 0; }

mapping=""
for f in "${files[@]}"; do
  name="$(basename "$f")"
  slug="${name%.*}"
  [ "$slug" = "_sample" ] && continue
  out="$OUT_DIR/$slug.png"

  # Seed the flood-fill with the actual top-left pixel colour so this works for
  # white OR any flat-colour background. A 1px border of that colour guarantees
  # the background is connected all the way around before we flood it away.
  corner="$(magick "$f" -format '%[pixel:p{0,0}]' info:)"
  magick "$f" -alpha set \
    -bordercolor "$corner" -border 1 \
    -fuzz "${FUZZ}%" -fill none -draw "alpha 0,0 floodfill" \
    -shave 1x1 \
    -trim +repage \
    -resize "x${HEIGHT}" \
    -bordercolor none -border "${PAD}" \
    "$out"
  echo "✓ $name → $out  ($(identify -format '%wx%h' "$out"))"
  mapping="${mapping}  '${slug}': '/images/certifications/${slug}.png',\n"
done

echo ""
echo "Done. Paste these into CERT_LOGOS in src/lib/certs.ts (fix the cert-name keys"
echo "to match exactly, e.g. 'IFS Food', 'ISO 22000', 'GLOBALG.A.P'):"
echo ""
printf "%b" "$mapping"
echo ""
echo "Tip: inspect each output over a white background; if a halo or leftover"
echo "background remains, re-run with a higher FUZZ (e.g. FUZZ=20 bash scripts/process-cert-logos.sh)."
echo "Photographic backgrounds: pip install rembg && rembg p <in> <out>, then re-run this to trim/resize."
