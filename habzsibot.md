---
layout: default
title: habzsibot
permalink: habzsibot
---
commands
--------
```
alert: [idő] <üzenet> idő nélkül 12h
alerts: list alerts
snooze: [idő] utolsó alert újraalertelése
penis: penis kép küldése a defautl chatbe
update: update.sh -- ~/prog/TelegramBot pull + habzsibot reset --hard HEAD
restart: exit(), utána a daemon remélhetőleg újraindítja
version: verziószám (dátum) visszadása, remélhetőleg nem felejtettem el átírni
setdefault: default chat beállítása ahova a penis képet küldi mindenképpen
setpenis: kell hozzá képet küldeni és akkor beállítja a penis képet
time: time...
note: valami noteot felír de többnyire nem tudjuk mi történik
notes: note ok listázása
loadtxt: random szöveggenerátorhzo, de nem fér el a ramban
deletetxt:
reloadtxt:
randtxt:
```

időformátum
-----------
__relatív:__ `1w7d24h60m` bármelyik elhagyható és bármekkora lehet, írható többször bármilyen sorrendben  
__abszolút:__ `:mounth:day:hour:minute | :day:hour:minute | :hour:minute | :hour` lehet a minuteot mindenhonnan el lehetne hagyni 

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