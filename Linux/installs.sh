#!/bin/sh
clear;echo ""; 
echo "If you haven't already, cd to the directory this script is stored in before continuing."; sleep 3; echo "";
fromdir=$(pwd)
echo "running from $fromdir"
cd $HOME
mkdir pictures; mkdir pictures/screenshots; mkdir documents; mkdir downloads
echo "[%] Upgrading system..."; sleep 1
sudo pacman -Syu

cd $fromdir
echo "[%] installing packages from given list..."; sleep 1
sudo pacman -S --needed - < pkg_installs.txt; 

cd $HOME
echo "[%] grabbing dwm..."
git clone https://github.com/Liam-Malone/dwm
echo "[%] building dwm..."; cd $HOME/dwm; sudo make clean install; cd $HOME
echo "$(cat dwm/config.h | XK_)" > $HOME/documents/keybinds

echo "[%] grabbing dmenu..."
git clone https://github.com/Liam-Malone/dmenu
echo "[%] building dmenu..."; cd $HOME/dmenu; sudo make clean install; cd $HOME

echo "[%] grabbing slstatus..."
git clone https://github.com/Liam-Malone/slstatus
echo "[%] building slstatus..."; cd $HOME/slstatus; sudo make clean install; cd $HOME

echo "[%] grabbing paru (aur helper)..."
cd $HOME; git clone https://aur.archlinux.org/paru
echo "[%] building paru..."; cd $HOME/paru; makepkg
sudo cp pkg/paru/usr/bin/paru /usr/bin/

cd $fromdir
echo "[%] installing flatpaks..."; sleep 1
flatpak install com.obsproject.Studio org.kde.kdenlive
echo "[%] moving onto configs..."; sleep 1
cp bashrc $HOME/.bashrc
cp -R scripts $HOME/
echo "export PATH=\"$HOME/scripts:$PATH\"" >> $HOME/.bashrc
cp bash_profile $HOME/.bash_profile
cp -R config $HOME/.config/
cp xinitrc $HOME/.xinitrc
cd $HOME
echo "[%] installing aur packages..."
sleep 1
paru -S brave-bin pfetch spotify-tui nitch cava
echo ""; echo ""
echo ""; echo "[%] grabbing wallpapers..."; cd $HOME/pictures
git clone https://gitlab.com/dwt1/wallpapers; cd $HOME
echo "[%] Assuming no failures; install is complete :)"
sleep 1
echo "Enjoy your new system :)"
sleep 1
startx
