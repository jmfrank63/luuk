#!/usr/bin/env bash

set -e

for _ in {1..200}
do
    curl "http://127.0.0.1:3000/api/weather?location=Tomsk&time=20&username=jmfrank63" &
done
