---
layout: default
title: habzsibot
permalink: habzsibot
---
commands
--------
```
alert: [idő] [repeat] <üzenet> idő nélkül 12h
alerts: list alerts
remove: remove alerts -- canceleljéte ha közben az egyik élesedne
snooze: [idő] utolsó alert újraalertelése
penis: random penis kép küldése a defautl chatbe
addpenis: képet kell hozzá küldeni és hozzáadja a penis képekhez...
update: update.sh -- ~/prog/TelegramBot pull + habzsibot reset --hard HEAD
restart: exit(), utána a daemon remélhetőleg újraindítja
version: verziószám (dátum) visszadása, remélhetőleg nem felejtettem el átírni
setdefault: default chat beállítása ahova a penis képet küldi mindenképpen
time: time...
```

időformátum
-----------
__relatív:__ `1w7d24h60m` bármelyik elhagyható és bármekkora lehet, írható többször bármilyen sorrendben  
__abszolút:__ `:mounth:day:hour:minute | :day:hour:minute | :hour:minute | :hour` lehet a minuteot mindenhonnan el lehetne hagyni 

__repeat__ `&` kerekter utána relatív idő

update
------
git push origin master  
/update  
/restart

ssh okosság
-----------

clone habzsibot: git clone ssh://hangyas@hangyas.net/home/hangyas/habzsibot

http://stackoverflow.com/questions/1764380/push-to-a-non-bare-git-repository
http://stackoverflow.com/questions/6167905/git-clone-through-ssh

git log -p -2 //utolsó 2 részletesen
git log --oneline
git reset <shorthash>