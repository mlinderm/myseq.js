#!/usr/bin/env bash

set -o errexit

# Clean background processes after quit
trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

IFY_CMD=browserify

SHARED_TEST=(
)

NODE_TEST=(
	"src/lib/js/io/FileReaders.spec.js"	
	"src/lib/js/io/TabixIndexedFile.spec.js"
	"src/lib/js/io/VCFSource.spec.js"
)

BROWSER_TEST=(
	"src/lib/js/io/FileReaders-browser.spec.js"
 	"src/lib/js/io/TabixIndexedFile-browser.spec.js"
)

usage() {
	cat << EOF
usage: `basename $0` [options]
EOF
}

while getopts "wh" Option
do
	case $Option in 
		w)
			IFY_CMD=watchify
			;;
		h)
			usage
			exit 0
			;;
		?)
			usage
			exit 85
			;;
		esac
done


mkdir -p dist  # In case it doesn't already exist

$IFY_CMD \
	-v \
	-t [ babelify ] \
	--node --debug \
	-o dist/tests.js \
	${SHARED_TEST[*]} ${NODE_TEST[*]} &

$IFY_CMD \
	-v \
	-t [ babelify ] -t [ aliasify ] \
	--debug \
	-o dist/tests-browser.js \
	${SHARED_TEST[*]} ${BROWSER_TEST[*]} &

$IFY_CMD \
	-v \
	-t [ babelify ] -t [ aliasify ] \
	--debug \
	-o dist/myseq-client.js \
	--standlone myseq \
	src/client/js/app.js &



wait
