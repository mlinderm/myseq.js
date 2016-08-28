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
echo "Testing on phantomjs..."
mocha-phantomjs http://localhost:8081/test/runner.html "$@"
