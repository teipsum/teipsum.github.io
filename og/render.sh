#!/bin/sh
# Re-render the social card and touch icon from their HTML sources with headless Chrome.
set -eu
cd "$(dirname "$0")"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=5000 \
  --window-size=1200,630 --screenshot="$PWD/../public/og-card-v1.png" "file://$PWD/og-card.html"
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 --virtual-time-budget=5000 \
  --window-size=1200,630 --screenshot="$PWD/../public/og-card-es-v1.png" "file://$PWD/og-card-es.html"
"$CHROME" --headless=new --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=180,180 --screenshot="$PWD/../public/apple-touch-icon.png" "file://$PWD/icon.html"
