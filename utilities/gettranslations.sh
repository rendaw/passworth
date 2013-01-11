#!/bin/bash
grep "': '" ${1:-../app/translation_en.js} | sed -e "s/^\s*'//" -e "s/': '.*$//"
