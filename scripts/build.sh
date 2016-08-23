#!/usr/bin/env bash

set -o errexit

SHARED_TEST=(
)

NODE_TEST=(
	"src/js/util/io/FileReaders.spec.js"	
	"src/js/util/io/TabixIndexedFile.spec.js"
	"src/js/util/io/VCFSource.spec.js"
)

BROWSER_TEST=(
	"src/js/util/io/FileReaders-browser.spec.js"
 	"src/js/util/io/TabixIndexedFile-browser.spec.js"
)

# node.js testing
browserify \
  -v \
  -t [ babelify ] \
  --node --debug \
  -o dist/tests.js \
	${SHARED_TEST[*]} ${NODE_TEST[*]}

# browser testing
browserify \
  -v \
  -t [ babelify ] -t [ aliasify ] \
  --debug \
  -o dist/tests-browser.js \
	${SHARED_TEST[*]} ${BROWSER_TEST[*]}
