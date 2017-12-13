<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";

?>
<body>

<?php
require_once('header.php');
?>

	<div class="container-fluid-full">
		<div class="row-fluid">
				
			<!-- start: Main Menu -->
			<div id="sidebar-left" class="span2">
				<div class="nav-collapse sidebar-nav">
					<ul class="nav nav-tabs nav-stacked main-menu">						
						<?php require_once('menu.php'); ?>	
					</ul>
				</div>
				
			</div>
			<!-- end: Main Menu -->
			
			
			<!-- start: Content -->
			<div id="content" class="span10">
			
				<ul class="breadcrumb">
					<li>
						<i class="icon-home"></i>
						<a href="<?php echo $index; ?>"><?php echo $curr_page; ?></a> 
						<i class="icon-angle-right"></i>
					</li>
				</ul>
			
				<div class="row-fluid">
				
					<div class="statbox purple" onTablet="span6" onDesktop="span3">
						<h3>Zones</h3>
						<select id="zones"></select>
					</div>
					<div class="statbox purple" onTablet="span6" onDesktop="span3">
						<h3>Elements</h3>
						<select id="elements"></select>
					</div>
					<div class="span3 statbox purple" onTablet="span4" onDesktop="span3">
					<h3>Class</h3>
					<select id="classe"></select>
					</div>
					<!--div class="span2" onTablet="span6" onDesktop="span2">
						<input type="radio" id="cu-true"/><label for="cu-true" id="choices-load-labelX">true</label>
						<input type="radio" id="cu-false"/><label for="cu-false" id="choices-diff-labelX">false</label>
					</div-->
					
					<!--div class="span2" onTablet="span6" onDesktop="span2">
						<input type="radio" name="alive" value="true" id="radio-true" checked="checked"/><label>true</label>
						<input type="radio" name="alive" value="false" id="radio-false"/><label>false</label>
					</div-->

					
					
				<!-- ANCORA DA IMPLEMENTARE -->
					<!--div class="span3 statbox yellow" onTablet="span6" onDesktop="span3">
						<h3>Search</h3>
						<input id="search"/>
					</div-->	
				</div>
				
				<div id="main-dashboard"></div>
								
	
		</div><!--/fluid-row--> -->
	</div>
	

	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	<!--MODAL INPUT/OUTPUT CU-->
	<div class="modal hide fade" id="mdl-io-cu">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">X</button>
			<h2><span id="name-cu-io"></span></h2>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				
				<div class="span12">
				<h2>DASHBOARD</span></h2>
				<div id="cu-dashboard"></div>
				</div>
			</div>
		</div>
		<div class="modal-footer"></div>
	</div>


<script src="<?php echo $main_dir ?>/js/monitoring.js"></script>
	

</body>
</html>
