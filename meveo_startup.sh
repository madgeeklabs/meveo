#!/bin/bash
# STARTUP FILE FOR MEVEO
# To use, Add to /etc/init.d and give it permission to execute, 
# then update init.d:
# $ sudo cp ./meveo_startup.sh /etc/init.d/meveo_startup.sh
# $ sudo chmod +x /etc/init.d/meveo_startup.sh
# $ sudo update-rc.d meveo_startup.sh start 99 2 . 
cd /home/pi/meveo
sudo node ./app.js &


