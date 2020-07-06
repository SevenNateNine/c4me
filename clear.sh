#This clears file watchers to avoid bug on Ubuntu. Run as sudo.

echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
