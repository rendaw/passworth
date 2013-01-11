#!/bin/bash
./gettranslations.sh $1 | sort -u | while read string
do
	if ! grep -qs "Local('$string')" ../app/app.js
	then
		echo $string
	fi
done

