#!/bin/sh

# Download the repository as a .tar.gz file
curl -L -o express-activitypub.tar.gz https://github.com/dariusk/express-activitypub/archive/master.tar.gz

# Extract the downloaded archive
tar -xzvf express-activitypub.tar.gz

cp config.json express-activitypub-master/

# Navigate into the extracted directory
cd express-activitypub-master

# install dependencies
npm i

# start it up
node index.js
