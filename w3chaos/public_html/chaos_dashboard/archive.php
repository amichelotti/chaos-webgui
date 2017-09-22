<!DOCTYPE HTML>
<html>
<?php require_once('head.php'); 

$curr_page = "archive";

?>
<body>

<?php
require_once('header.php');
?>

<body>


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
			
			<!--div class="row-fluid" style="margin-top:20px;"><p></p></div-->
			
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
					<div class="span4 statbox purple" onTablet="span4" onDesktop="span3">
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
				
	
			</div>
			
			<!--div class="row-fluid">
				
				
				<div class="control-group span3">
					<label class="control-label" for="startDate">From</label>
					<div class="controls">
						<input class="dataRange" id="startDate" type="text" name="startdate" value="" />
					</div>
				</div>	
				
				<div class="control-group span3">
					<label class="control-label" for="endDate">To</label>
					<div class="controls">
						<input class="dataRange" id="endDate" type="text" name="enddate" value="" />
					</div>
				</div>
				
				<div class="span3" style="margin-top:18px;">					
					<a class="btn btn-small purple" id="plot-view"><i class="icon-bar-chart"></i> Plot</a>     
				</div>
				
			</div-->

	<div class="row-fluid">


	<div class="control-group span3" onTablet="span4" onDesktop="span3">
					<label class="control-label" for="startDate">From</label>
					<div class="controls">
						<input class="dataRange" id="startDate" type="text" name="startdate" value="" />
					</div>
				</div>	
				
				<div class="control-group span3" onTablet="span4" onDesktop="span3">
					<label class="control-label" for="endDate">To</label>
					<div class="controls">
						<input class="dataRange" id="endDate" type="text" name="enddate" value="" />
					</div>
				</div>
				
				<!--div class="span3" style="margin-top:18px;">					
					<a class="btn btn-small purple" id="getData"><i class="icon-download-alt"></i> Export csv</a>     
				</div>
				
				
				<div class="span3" style="margin-top:18px;">					
					<a class="btn btn-small purple" id="proof"><i class="icon-download-alt"></i> altro</a>     
				</div-->
				
				
				<div class="span3" style="margin-top:18px;" onTablet="span3" onDesktop="span3">					
					<a class="btn yellow" id="plot-view" onclick=plot();><i class="icon-bar-chart"></i> Plot</a>     
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
<script src="/<?php echo $main_dir ?>/js/plot-archive.js"></script>	
	
<script type="text/javascript" src="//cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script> 
<!-- Include Date Range Picker -->
<script type="text/javascript" src="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.js"></script>
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css" />

<!--script src="https://code.jquery.com/jquery-3.1.1.min.js"></script-->
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>

	
	
	
</body>
</html>
