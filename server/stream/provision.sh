#!/bin/sh

# Download the repository and pipe that to the shell
curl -s https://owncast.online/install.sh | bash

# Navigate into the extracted directory
cd owncast

./owncast
