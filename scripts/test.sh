#!/usr/bin/env bash

set -o errexit

# Adapted from https://github.com/hammerlab/pileup.js

# Run http-server and save its PID
http-server -p 8081 > /dev/null &
SERVER_PID=$!
function finish() {
  kill -TERM $SERVER_PID
}
trap finish EXIT

# Avoid race condition on launch of http-server
sleep 0.1

# Test in node
echo "Testing in Node..."
mocha --reporter spec dist/tests.js

# Test in browser
PHANTOM_BINARY="$(npm config get prefix)/bin/phantomjs"
if [[ -x "$PHANTOM_BINARY" ]] && "$PHANTOM_BINARY" -v | grep -q "^2" ; then
    echo "Testing on phantomjs version $("$PHANTOM_BINARY" -v)..."
    mocha-phantomjs -p "$PHANTOM_BINARY" http://localhost:8081/test/runner.html "$@"
else
    echo "Testing on builtin phantomjs..."
    mocha-phantomjs http://localhost:8081/test/runner.html "$@"
fi
