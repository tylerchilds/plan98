#!/bin/sh

# install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# install tauri
cargo install tauri-cli --version "^2.0.0" --locked --force

# install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

mkdir -p subsystems

# download 9p 
wget https://github.com/pfpacket/rust-9p/archive/refs/heads/master.tar.gz -O - | tar -xz

mv rust-9p-master subsystems

# change to the default 9p server example
cd subsystems/rust-9p-master/example/unpfs

# build the 9p server
cargo build --verbose --release

# back to start
cd -

wget https://git.sr.ht/~tychi/backpack/archive/main.tar.gz -O - | tar -xz

mv backpack-main subsystems
cd subsystems/backpack-main

./unpack.sh

# back to start
cd -

source ~/.bashrc

# ensure a mount point for the thumb drive
mkdir -p /home/$USER/thumb-drive
# ensure applications folder
mkdir -p /home/$USER/Applications
