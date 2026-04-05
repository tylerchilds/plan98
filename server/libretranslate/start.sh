#!/bin/sh

./provision.sh
source .venv/bin/activate
libretranslate --port 3005
