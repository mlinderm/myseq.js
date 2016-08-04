#!/usr/bin/env bash

set -o errexit

browserify \
  -v \
  -t [ babelify ] \
  --node --debug \
  -o dist/tests.js \
	$(find src/js -name '*.spec.js')
