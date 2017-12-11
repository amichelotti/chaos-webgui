<?php
/**
 * Created by komodo.
 * User: eliana
 * Date: 21/05/17
 */

?>


<li><a href="/<?php echo $main_dir ?>/index.php"><i class="icon-home hidden-tablet"></i><span> HOME</span></a></li>
	
<?php
$only_php = glob('./*.{php,html}', GLOB_BRACE);

foreach($only_php as $pathChaos){
if(is_file('./'.$pathChaos)&& ($pathChaos!="..")){
if($pathChaos !== "./head.php" && $pathChaos !== "./menu.php" && $pathChaos !== "./index.php" && $pathChaos !== "./header.php" && $pathChaos !== "./footer.php" ) {

$ths_filename=strtoupper(basename($pathChaos, ".php"));
echo '<li>';
echo '<a class="submenu" href="'.$pathChaos.'"><span>'.$ths_filename.' </span></a>';
echo '</li>';


//echo '<a class="submenu" href="./'.$pathChaos.'" target="_blank"><span>'.$ths_filename.' </span></a>';
}
}
}
echo '<a style="color: white;" class="dropmenu" href="#"><i class="icon-folder-close-alt hidden-tablet" style="margin-left:10px;"></i><span> TOOLS</span></a>';
echo '<ul style="display: block;">';

$files=scandir('TOOLS');
foreach($files as $pathTool){
if(is_file('TOOLS/'.$pathTool.'/index.php')&& ($pathTool!="..")){
$th_filename=strtoupper(basename($pathTool));
echo '<li class="menu-tools">';
echo '<a style="color: white;" class="submenu" href="./TOOLS/'.$pathTool.'/index.php"><span>'.$th_filename.' </span></a>';

//echo '<a style="color: white;" class="submenu" href="./TOOLS/'.$pathTool.'/index.php" target="_blank"><span>'.$th_filename.' </span></a>';
echo '</li>';
}
}
echo '</ul>';
?>

<div class="row-fluid">				
				
						
						<div class="row-fluid" id="available_commands">				
<!-- 							
							<a class="quick-button-small span2 btn-cmd" id="cmd-init" onclick="Init()">
								<i class="material-icons verde">trending_up</i>
								<p class="name-cmd">Init</p>
							</a>
							<a class="quick-button-small span2 btn-cmd" id="cmd-start" onclick="Start()">
								<i class="material-icons verde">play_arrow</i>
								<p class="name-cmd">Start</p>
							</a>
							<a class="quick-button-small span2 btn-cmd" id="cmd-load" onclick="Load()">
								<i class="material-icons verde">settings_power</i>
								<p class="name-cmd">Load</p>
							</a>
							<a class="quick-button-small span2 btn-cmd" id="cmd-bypassOn" onclick="ByPassON()">
								<i class="material-icons red">cached</i>
								<p class="name-cmd">ByPass</p>
							</a>
						</div>
						
						<div class="row-fluid">
							<a class="quick-button-small span2 btn-cmd" id="cmd-deinit" onclick="Deinit()">
								<i class="material-icons giallo">trending_down</i>
								<p class="name-cmd">Deinit</p>
							</a>
							<a class="quick-button-small span2 btn-cmd" id="cmd-stop" onclick="Stop()">
								<i class="material-icons verde">pause</i>
								<p class="name-cmd">Stop</p>
							</a>
							<a class="quick-button-small span2 btn-cmd" id="cmd-unload" onclick="Unload()">
								<i class="material-icons red">highlight_off</i>
								<p class="name-cmd">Unload</p>
</a>
							<a class="quick-button-small span2 btn-cmd" id="cmd-bypassOFF" onclick="ByPassOff()">
								<i class="material-icons verde">usb</i>
								<p class="name-cmd">ByPass OFF</p>
							</a>
						</div> -->

                    </div>
                    </div>
   			
	