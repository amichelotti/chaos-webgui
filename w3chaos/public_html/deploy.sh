#!/bin/bash
echo "   <b><font size="4" color=\"red\">Production</font></b>" > chaos_dashboard/target.txt
ver=`git log --pretty=format:'%h' -n 1`
echo "<font size="4">  ($ver)</font>"qq > chaos_dashboard/version.txt
scp -r chaos_dashboard chaos@chaos-webui01.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
scp -r chaos_dashboard chaos@chaos-webui02.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
scp -r chaos_dashboard chaos@chaos-webui03.chaos.lnf.infn.it:/usr/local/chaos/chaos-distrib/html/
scp -r chaos_dashboard chaos@chaos-webui1.chaos.lnf.infn.it:/var/www/html/chaos/
scp -r chaos_dashboard chaos@chaos-webui2.chaos.lnf.infn.it:/var/www/html/chaos/

echo "   <b><font size="4" color=\"green\">Development/Preproduction</font></b>" > chaos_dashboard/target.txt
scp -r chaos_dashboard chaos@chaost-webui1.chaos.lnf.infn.it:/var/www/html/chaos/
scp -r chaos_dashboard chaos@chaost-webui2.chaos.lnf.infn.it:/var/www/html/chaos/



