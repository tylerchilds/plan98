#!/bin/sh

# Download the repository and pipe that to the shell
npm install ghost-cli -g

mkdir ghost-blog

cd ghost-blog

ghost install local
