<!DOCTYPE HTML>
<html>
<?php require_once('head.php'); 
$curr_page = "live-data";

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
					<a href="<?php echo $index ?>">Home</a>
					<i class="icon-angle-right"></i>
				</li>
				<li><a href="<?php echo $curr_page.".php" ?>"><?php echo $curr_page; ?></a></li>
			</ul>

			
			
			<div class="row-fluid">
				<!--div class="span7">
					<h3>Archive</h3>
				</div-->
			</div>
						
			<div class="row-fluid">
				<div class="span7">
					<h3>Select CU</h3>
				</div>
			</div>
			
			
			<div class="row-fluid">
				
					<div class="span3 statbox purple" onTablet="span3" onDesktop="span3">
						<h3>Zones</h3>
						<select id="zones-archive"></select>
					</div>
					<div class="span3 statbox purple" onTablet="span3" onDesktop="span3">
						<h3>Elements</h3>
						<select id="elements-archive"></select>
					</div>
					<div class="span4 statbox purple" onTablet="span3" onDesktop="span3">
						<h3>CU</h3>
						<select id="CUs-archive"></select>
					</div>	

				
					<!--div class="span3 statbox yellow" onTablet="span6" onDesktop="span3">
						<h3>Insert name CU</h3>
						<input id="search"/>
					</div-->	
	
			</div>
			
			
			<div class="row-fluid">
				<div class="span7">
					<h3>Select Variable</h3>
				</div>
			</div>
			
			
			<div class="row-fluid">
				
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
						<h3>Channel</h3>
						<select id="channel"></select>
					</div>
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
						<h3>Variable</h3>
						<select id="variable"></select>
					</div>
					
					<div class="span3" style="margin-top:18px;">					
						<!--a class="btn yellow" id="plot-view" onclick=plot-live();><i class="icon-bar-chart"></i> Plot</a-->
						<a class="btn yellow" id="plot-live"><i class="icon-bar-chart"></i> Plot</a>     

					</div>
				
	
			</div>
			

			
			<div class="row-fluid">
				<div class="span7">
					<h3>Plot</h3>
				</div>
			</div>

			<div class="row-fluid">
				<div class="span10" id="place-plot">
					<div id="container" style="min-width: 810px; height: 400px; margin: 0 auto"></div>

					
				</div>
				
			</div>
			
			
			<div class="row-fluid" style="margin-top:20px;">
				
				
			
			</div>
			
			
			
			

	</div><!--/.fluid-container-->
	
			<!-- end: Content -->
		</div><!--/#content.span10-->
		</div><!--/fluid-row-->
		
	
	
	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>



<script src="/<?php echo $main_dir ?>/js/archive.js"></script>
<script src="/<?php echo $main_dir ?>/js/plot-live.js"></script>	
<script type="text/javascript" src="//cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
 
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>

	
	
	
</body>
</html>
