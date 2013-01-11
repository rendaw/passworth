#!/bin/bash
./getstrings.sh | sort -u | while read string
do
	if ! grep -qs "$string" ${1:-../app/translation_en.js}
	then
		echo -e "\t'$string': '$string',"
	fi
done

