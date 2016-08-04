#!/usr/bin/env bash

set -o errexit

mocha --reporter spec dist/tests.js
