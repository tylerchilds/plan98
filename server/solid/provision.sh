#!/bin/sh

# Download the repository as a .tar.gz file
curl -L -o CommunitySolidServer.tar.gz https://github.com/CommunitySolidServer/CommunitySolidServer/archive/master.tar.gz

# Extract the downloaded archive
tar -xzvf CommunitySolidServer.tar.gz

# Navigate into the extracted directory
cd CommunitySolidServer-main

# install dependencies
npm i

# start it up
npm start
