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