#!/usr/bin/env sh

echo "Size: $(cat $(dirname -- "$0")/../build/esm/index.js | wc -c) bytes"
echo "GZipped size: $(cat $(dirname -- "$0")/../build/esm/index.js | gzip -c | wc -c) bytes"
echo "GZipped size, comments stripped : $(cat $(dirname -- "$0")/../build/esm/index.js | npx @prasadrajandran/strip-comments-cli | gzip -c | wc -c) bytes"