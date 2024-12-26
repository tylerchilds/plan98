#!/bin/sh

apt update
apt install \
  git \
  vim \
  kitty \
  tmux \
  silversearcher-ag \
  sway \
  waybar \
  libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libxdo-dev \
  libssl-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

./provision.sh

deno task native-build
deno task unix-install

reboot
