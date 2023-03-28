#!/bin/sh
clear;echo ""; 
echo -e "\e[1;35mIf you haven't already, cd to the directory this script is stored in before continuing."; sleep 3; echo "";
echo "This script will ensure the core, extra and multilib repos are enabled in your /etc/pacman.conf"; sleep 3; echo ""
srcdir=$(pwd)
echo -e "\e[1;34mrunning from $srcdir"
echo -e "\e[1;34menabling appropriate repos"
sudo cp $srcdir/pacman.conf /etc/pacman.conf
cd $HOME
mkdir -p pictures/screenshots pictures/wallpapers documents downloads videos
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

cd $HOME
echo -e "\e[1;32m[%] grabbing dwm..."
git clone https://github.com/Liam-Malone/dwm
echo -e "\e[1;34m[%] building dwm..."; cd $HOME/dwm; sudo make clean install; cd $HOME
echo "$(cat dwm/config.h | XK_)" > $HOME/documents/dwm-keybinds.txt

echo -e "\e[1;32m[%] grabbing dmenu..."
git clone https://github.com/Liam-Malone/dmenu
echo -e "\e[1;34m[%] building dmenu..."; cd $HOME/dmenu; sudo make clean install; cd $HOME

echo -e "\e[1;32m[%] grabbing slstatus..."
git clone https://github.com/Liam-Malone/slstatus
echo -e "\e[1;34m[%] building slstatus..."; cd $HOME/slstatus; sudo make clean install; cd $HOME


cd $srcdir

echo -e "\e[1;34m[%] moving onto configs..."; sleep 1
cp bashrc $HOME/.bashrc
cp -R scripts $HOME/

echo "export PATH=\"$HOME/scripts:$PATH\"" >> $HOME/.bashrc
cp bash_profile $HOME/.bash_profile
cp -R config $HOME/.config/
cp xinitrc $HOME/.xinitrc
chmod +x $HOME/.xinitrc
sudo cp -r lightdm /etc/

cd $HOME

echo "[%] adding packer (plugin manager for neovim)"
git clone --depth 1 https://github.com/wbthomason/packer.nvim\
 ~/.local/share/nvim/site/pack/packer/start/packer.nvim

echo ""; echo ""
cp $srcdir/wallpapers.zip ~/pictures/
cd ~/pictures; unzip wallpapers.zip

systemctl enable sddm
echo -e "\e[1;32m[%] Assuming no failures; install is complete :)"
sleep 1
echo -e "Enjoy your new system :)"
sleep 1
Hyprland
