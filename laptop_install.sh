#!/bin/bash
clear;echo ""; 
echo -e "\e[1;35mIf you haven't already, cd to the directory this script is stored in before continuing."; sleep 3; echo "";
echo "This script will ensure the core, extra and multilib repos are enabled in your /etc/pacman.conf"; sleep 3; echo ""
srcdir=$(pwd)
echo -e "\e[1;34mrunning from $srcdir"
echo -e "\e[1;34menabling appropriate repos"
sudo cp $srcdir/pacman.conf /etc/pacman.conf
cd $HOME
mkdir -p pictures/screenshots documents downloads videos
echo -e "\e[1;34m[%] Upgrading system..."; sleep 1
sudo pacman -Syu --noconfirm

cd $srcdir
echo -e "\e[1;32m[%] installing packages from given list..."; sleep 1
sudo pacman -S --needed - < pkglist.txt;

echo -e "\e[1;32m[%] installing flatpaks..."; sleep 1
flatpak install  -y com.obsproject.Studio org.kde.kdenlive com.github.tchx84.Flatseal com.spotify.Client

echo -e "\e[1;32m[%] grabbing paru (aur helper)..."
cd $HOME; git clone https://aur.archlinux.org/paru
echo -e "\e[1;34m[%] building paru..."; cd $HOME/paru; makepkg
sudo cp pkg/paru/usr/bin/paru /usr/bin/

echo -e "\e[1;32m[%] installing aur packages..."
sleep 1
paru -S --noconfirm - < aurpkglist.txt

cd $srcdir

echo -e "\e[1;34m[%] moving onto configs..."; sleep 1

cd $HOME
git clone https://github.com/Liam-Malone/.dotfiles.git
cd .dotfiles

cp .bash* $HOME/
cp .config $HOME/

cd $srcdir
cp -R scripts $HOME/

cp xinitrc $HOME/.xinitrc
sudo cp -r sddm.conf.d /etc/

echo "[%] enabling sddm"
systemctl enable sddm
# TODO:
#   add service enables

cd $HOME

echo "[%] adding packer (plugin manager for neovim)"
git clone --depth 1 https://github.com/wbthomason/packer.nvim\
 ~/.local/share/nvim/site/pack/packer/start/packer.nvim

echo ""; echo ""
cp $srcdir/wallpapers.zip ~/pictures/
cd ~/pictures; unzip wallpapers.zip

echo -e "\e[1;32m[%] Assuming no failures; install is complete :)"
sleep 1
echo -e "Enjoy your new system :)"
sleep 1
systemctl start sddm
