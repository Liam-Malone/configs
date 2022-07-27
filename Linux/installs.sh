#!/bin/sh
sudo pacman -S --needed - < pkg_installs.txt; 
flatpak install com.obsproject.Studio org.kde.kdenlive
cp -R scripts ~/
cp -R config/* ~/.config/
cp bashrc ~/.bashrc
cp bash_profile ~/.bash_profile
cp xinitrc ~/.xinitrc
