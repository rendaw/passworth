#!/bin/bash
grep -o "Local('[^']*')" ../app/app.js | sed -e "s/^Local('//" -e "s/')$//"
