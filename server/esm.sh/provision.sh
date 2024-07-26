#!/bin/sh

# Download the repository as a .tar.gz file
curl -L -o esm.sh.tar.gz https://github.com/esm-dev/esm.sh/archive/main.tar.gz


# Extract the downloaded archive
tar -xzvf esm.sh.tar.gz

# Navigate into the extracted directory
cd esm.sh-main

go run main.go --config=config.json
