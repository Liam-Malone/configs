#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias ll='ls -lG'
alias chtheme='kitty +kitten themes'
alias py='python'
alias ping='ping -c 5'
alias new='clear; source ~/.bashrc'
alias nclear='clear; neofetch'
alias fehset='feh --bg-fill'
alias open='pcmanfm'
alias kpx='keepassxc-cli open'
alias findsample='echo "find / -iname *tabliss* 2>/dev/null"'
alias vi='vim'
alias vim='nvim'
alias picset='picom -b --config ~/.config/picom/picom.conf'


if [ "$TERM" == "xterm-kitty" ] || [ "$TERM" == "alacritty" ] || [ "$TERM" == "xterm-256color" ]; then
	PS1='\e[3;m\e[1;35m[🦩: \W]\$ \e[m\e[m\]'
fi

##### STARTUP HELP MESSAGE ######
if [ "$TERM" == "alacritty" ]; then
	$HOME/scripts/wp
	grep XK_ ~/dwm/config.h ; echo ""
	echo -e "       above are the system keybinds - stored in \e[1;33m$HOME/dwm/config.h\e[m"
	echo -e "       if you change these, run \e[1;33mdwmrebuild\e[m after"; echo ""
	echo -e "       a copy of the keybinds is stored in \e[1;33m$HOME/documents/keybinds\e[m"
	echo ""
fi
##### END OF STARTUP HELP MESSAGE ##### 

set -o vi

export GTK_IM_MODULE='fcitx'
export QT_IM_MODULE='fcitx'
export SDL_IM_MODULE='fcitx'
export XMODIFIERS='@im=fcitx'
if [ xhost >& /dev/null ] ; 
then 
	display_exists=true
	neofetch
else 
	echo "No Display Yet" ; neofetch ; startx

fi
