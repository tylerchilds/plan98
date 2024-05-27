#!/bin/sh

# Download the repository as a .tar.gz file
curl -L -o braid-text.tar.gz https://github.com/braid-org/braid-text/archive/master.tar.gz

# Extract the downloaded archive
tar -xzvf braid-text.tar.gz

# Navigate into the extracted directory
cd braid-text-master

# Run npm install
npm install

# Run deno task start-server
node server-demo.js
