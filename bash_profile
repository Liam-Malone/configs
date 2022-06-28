#
# ~/.bash_profile
#

[[ -f ~/.bashrc ]] && . ~/.bashrc

alias ll='ls -lG'
alias py='python'
alias ping='ping -c 5'
alias newpf='source .bash_profile'

files=(~/.ASCII_Art/*)
cat ${files[$[ $RANDOM % ${#files[@]} + 0 ]]}

if xhost >& /dev/null ; 
then 
	echo "Display exists"
else 
	echo "Display invalid" ; startx  

fi

xrandr -s 1440x900

