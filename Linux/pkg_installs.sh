#!/bin/sh
sudo pacman -S - < pkg_installs.txt; 
flatpak install com.obsproject.Studio org.kde.kdenlive
