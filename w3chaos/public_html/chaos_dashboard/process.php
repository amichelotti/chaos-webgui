<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Home";
echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.terminal.min.js"></script>';
echo '<script src="'.$main_dir.'/js/jquery.terminal/js/jquery.mousewheel-min.js"></script>';
echo '<link href="' .$main_dir. '/js/jquery.terminal/css/jquery.terminal.min.css" type="text/css" rel="stylesheet" />';

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
			
				<div id="main-dashboard"></div>

				
								
	
		</div><!--/fluid-row--> -->
	</div>
	

	
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	
	


<script>
$('#main-dashboard').chaosDashboard({
                collapsed: true,
				withQuotes: true,
				template:"process",
                Interval: 2000

            });
</script>
	

</body>
</html>
