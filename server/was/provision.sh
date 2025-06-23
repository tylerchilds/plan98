#!/bin/bash

# Download the repository as a .tar.gz file
curl -L -o wallet-attached-storage-server.tar.gz https://github.com/did-coop/wallet-attached-storage-server/archive/main.tar.gz

# Extract the downloaded archive
tar -xzvf wallet-attached-storage-server.tar.gz

# Navigate into the extracted directory
cd wallet-attached-storage-server-main

# Run npm install
npm install

# fix apple silicon :D
npm rebuild better-sqlite3

# Run deno task start-server

# CORS_ALLOWED_ORIGINS='["http://localhost:8081"]' npm run dev
