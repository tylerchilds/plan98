#!/bin/sh

# Download the repository as a .tar.gz file
curl -L -o braidmail.tar.gz https://github.com/braid-org/braidmail/archive/master.tar.gz

# Extract the downloaded archive
tar -xzvf braidmail.tar.gz

# Navigate into the extracted directory
cd braidmail-master

# Run npm install
npm install

# Run deno task start-server
node server-demo.js
