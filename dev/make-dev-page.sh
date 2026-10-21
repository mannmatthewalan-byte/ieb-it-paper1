#!/bin/sh
# Regenerates dev/index-dev.html from index.html: same shell, but loads dev/sample-data.js instead of data/*.js.
cd "$(dirname "$0")/.." || exit 1
awk '
  /<!-- DATA:BEGIN -->/ { print "  <!-- DEV: sample data instead of data/*.js -->"; print "  <script defer src=\"sample-data.js\"></script>"; skip=1; next }
  /<!-- DATA:END -->/ { skip=0; next }
  skip { next }
  { gsub(/href="styles.css"/, "href=\"../styles.css\""); gsub(/src="app.js"/, "src=\"../app.js\""); gsub(/<title>IEB IT Paper 1<\/title>/, "<title>IEB IT Paper 1 (dev)</title>"); print }
' index.html > dev/index-dev.html
echo "wrote dev/index-dev.html"
