<?php
/**
 * Created by komodo.
 * User: eliana
 * Date: 21/05/16
 */

?>

<li><a href="./index.php"><i class="icon-home"></i><span class="hidden-tablet"> Home</span></a></li>
	
	
	<?php					
		$only_php = glob('./*.{php,html}', GLOB_BRACE);

		foreach($only_php as $pathChaos){
			if(is_file('./'.$pathChaos)&& ($pathChaos!="..")){
							
				/*if($pathChaos == "./index.php") {
									
					echo '<li><a href="./index.php"><i class="icon-home"></i><span class="hidden-tablet"> Home</span></a></li>';
								
				}else */ if($pathChaos !== "./head.php" && $pathChaos !== "./menu.php" && $pathChaos !== "./index.php" ) {

							
				 $ths_filename=strtoupper(basename($pathChaos, ".php"));
						   
						   
				echo '<li>';
				echo '<a class="submenu" href="/chaos_dashboard/'.$pathChaos.'"><i class="icon-file-alt"></i><span class="hidden-tablet">'.$ths_filename.' </span></a>';
				echo '</li>';
				}
			}
						   
		}

	
					

	
		echo '<a class="dropmenu" href="#"><i class="icon-folder-close-alt"></i><span class="hidden-tablet"> TOOLS</span></a>';
		echo '<ul style="display: block;">';

		$files=scandir('TOOLS');
		foreach($files as $pathTool){
			if(is_file('TOOLS/'.$pathTool.'/index.php')&& ($pathTool!="..")){
				$th_filename=strtoupper(basename($pathTool));
						   
				echo '<li>';
				echo '<a class="submenu" href="/chaos_dashboard/TOOLS/'.$pathTool.'/index.php"><i class="icon-file-alt"></i><span class="hidden-tablet">'.$th_filename.' </span></a>';
				echo '</li>';
			}
		}
				echo '</ul>';

	?>
	


	