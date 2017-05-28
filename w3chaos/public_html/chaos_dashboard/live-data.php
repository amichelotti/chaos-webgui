<!DOCTYPE HTML>
<html>
<?php require_once('head.php'); ?>
<body>



		<!-- start: Header -->
	<div class="navbar">
		<div class="navbar-inner">
			<div class="container-fluid">
				<a class="btn btn-navbar" data-toggle="collapse" data-target=".top-nav.nav-collapse,.sidebar-nav.nav-collapse">
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
					<span class="icon-bar"></span>
				</a>
				<a class="brand" href="index.html"><span>!CHAOS Dashboard</span></a>
								
				<!-- start: Header Menu -->
				<div class="nav-no-collapse header-nav">
					<ul class="nav pull-right">
						
						<!-- start: User Dropdown -->
						<li class="dropdown">
							<a class="btn dropdown-toggle" data-toggle="dropdown" href="#">
								<i class="halflings-icon white user"></i> Login
								<span class="caret"></span>
							</a>
							<ul class="dropdown-menu">
								<li class="dropdown-menu-title">
 									<span>Account Settings</span>
								</li>
								<li><a href="#"><i class="halflings-icon user"></i> Profile</a></li>
								<li><a href="login.html"><i class="halflings-icon off"></i> Logout</a></li>
							</ul>
						</li>
						<!-- end: User Dropdown -->
					</ul>
				</div>
				<!-- end: Header Menu -->
				
			</div>
		</div>
	</div>
	<!-- start: Header -->
	
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
					<a href="index.html">Home</a> 
					<i class="icon-angle-right"></i>
				</li>
				<!--li><a href="#">Dafne</a><i class="icon-angle-right"></i></li-->
				<li><a href="#"> Live Data </a></li>	
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
				
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span2">
						<h3>Zones</h3>
						<select id="zones-archive"></select>
					</div>
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span2">
						<h3>Elements</h3>
						<select id="elements-archive"></select>
					</div>
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span2">
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
	
	<footer>

		<p>
			<span style="text-align:left;float:left">&copy; 2016 <a href="http://chaos.infn.it/" alt="logo-!CHAOS" target="_blank">!CHAOS</a></span>
			
		</p>

	</footer>
	

<script src="/chaos_dashboard/js/plot-live.js"></script>

	
<!--script type="text/javascript" src="//cdn.jsdelivr.net/jquery/1/jquery.min.js"></script-->
<script type="text/javascript" src="//cdn.jsdelivr.net/momentjs/latest/moment.min.js"></script>
<!--link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap/3/css/bootstrap.css" /-->
 
<!-- Include Date Range Picker -->
<script type="text/javascript" src="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.js"></script>
<link rel="stylesheet" type="text/css" href="//cdn.jsdelivr.net/bootstrap.daterangepicker/2/daterangepicker.css" />

<!--script src="https://code.jquery.com/jquery-3.1.1.min.js"></script-->
<script src="https://code.highcharts.com/highcharts.js"></script>
<script src="https://code.highcharts.com/modules/exporting.js"></script>

	
	
	
</body>
</html>
