#!/bin/sh

# install rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# install deno
curl -fsSL https://deno.land/x/install/install.sh | sh

# download 9p 
wget https://github.com/pfpacket/rust-9p/archive/refs/heads/master.tar.gz -O - | tar -xz

# change to the default 9p server example
cd rust-9p-master/example/unpfs

# build the 9p server
cargo build --verbose --release

# ensure a mount point for the thumb drive
mkdir -p /home/$USER/thumb-drive
mkdir -p /home/$USER/.pocketbase/bin
