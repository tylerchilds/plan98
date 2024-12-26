#!/bin/sh

mkdir -p subsystems

mkdir -p subsystems/backpack
wget https://git.sr.ht/~tychi/backpack/archive/main.tar.gz -O - | tar -xz

cp -R backpack-main/* subsystems/backpack
rm -rf backpack-main

cd subsystems/backpack

./unpack.sh

# back to start
cd -

source ~/.bashrc

# install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# install tauri
cargo install tauri-cli --version "^2.0.0" --locked

# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

mkdir -p subsystems/rust-9p
# download 9p 
wget https://github.com/pfpacket/rust-9p/archive/refs/heads/master.tar.gz -O - | tar -xz

cp -R rust-9p-master/* subsystems/rust-9p
rm -rf rust-9p-master

# change to the default 9p server example
cd subsystems/rust-9p/example/unpfs

# build the 9p server
cargo build --verbose --release

# back to start
cd -

# ensure a mount point for the thumb drive
mkdir -p /home/$USER/thumb-drive
# ensure applications folder
mkdir -p /home/$USER/Applications
