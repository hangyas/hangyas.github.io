---
layout: default
title: quadro
permalink: quadro
---

#webcam

laptopon működött kommand: `cvlc -vvv v4l:///dev/video1 --sout '#rtp{sdp=rtsp://:8081/test.sdp}' :demux=h264`
_/dev/video1 / /dev/video0_
megnyitás: `vlc rtsp://0.0.0.0:8081/test.sdp`

__sztem adjuk fel amíg nem lesz vlc 2.2.2__
