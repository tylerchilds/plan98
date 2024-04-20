#!/bin/sh

# Download the repository as a .tar.gz file
curl -L -o braidmail.tar.gz https://github.com/tylerchilds/braidmail/archive/main.tar.gz

# Extract the downloaded archive
tar -xzvf braidmail.tar.gz

# Navigate into the extracted directory
cd braidmail-main

# Run npm install
npm install

# Run deno task start-server
deno task start-server
