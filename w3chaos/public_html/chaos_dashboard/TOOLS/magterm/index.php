<!DOCTYPE HTML>
<html>
	
<head>
	
	<!-- start: Meta -->
	<meta charset="utf-8">
	<title>!CHAOS Dashboard</title>
	<!--meta name="description" content="Bootstrap Metro Dashboard">
	<meta name="author" content="Dennis Ji">
	<meta name="keyword" content="Metro, Metro UI, Dashboard, Bootstrap, Admin, Template, Theme, Responsive, Fluid, Retina"-->
	<!-- end: Meta -->
	
	<!-- start: Mobile Specific -->
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<!-- end: Mobile Specific -->
	
	<!-- start: CSS -->
	<link id="bootstrap-style" href="./css/bootstrap.min.css" rel="stylesheet">
	<link href="./css/bootstrap-responsive.min.css" rel="stylesheet">
	<link id="base-style" href="./css/style.css" rel="stylesheet">
	<link id="base-style-responsive" href="./css/style-responsive.css" rel="stylesheet">
	<link href="https://fonts.googleapis.com/icon?family=Material+Icons"rel="stylesheet">

	<link href='http://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,400,300,600,700,800&subset=latin,cyrillic-ext,latin-ext' rel='stylesheet' type='text/css'>
	<!-- end: CSS -->
	

	<!-- The HTML5 shim, for IE6-8 support of HTML5 elements -->
	<!--[if lt IE 9]>
	  	<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<link id="ie-style" href="./css/ie.css" rel="stylesheet">
	<![endif]-->
	
	<!--[if IE 9]>
		<link id="ie9style" href="./css/ie9.css" rel="stylesheet">
	<![endif]-->
		
	<link href="./css/custom_style.css" rel="stylesheet">

		
	<!-- start: Favicon -->
	<link rel="shortcut icon" href="./img/favicon.ico">
	<!-- end: Favicon -->
	
		
		
		
</head>

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
				<a class="brand" href="index.php"><span>!CHAOS Dashboard</span></a>
								
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
						

						<li><a href="../../index.php"><i class="icon-home"></i><span class="hidden-tablet"> Home</span></a></li>
						
						<li><a href="../archive.php"><span class="hidden-tablet"> ARCHIVE</span></a></li>	
						<li><a href="../live-data.php"><span class="hidden-tablet"> LIVE-DATA</span></a></li>	
						<li><a class="dropmenu" href="#"><i class="icon-folder-close-alt"></i><span class="hidden-tablet"> TOOLS</span></a></li>
							<ul>
								<li><a href="../OrbitAccumulator/index.php" style="color: white;"><span class="hidden-tablet"> ORBITACCUMULATOR</span></a></li>
								<li><a href="./index.php" style="color: white;"><span class="hidden-tablet"> MAGTERM</span></a></li>

								<li><a href="../scraperterm/index.php" style="color: white;"><span class="hidden-tablet"> SCRAPERTERM</span></a></li>
							</ul>


						<!--li><a href="messages.html"><i class="icon-envelope"></i><span class="hidden-tablet"> Accumulator</span></a></li>
						<li><a href="tasks.html"><i class="icon-tasks"></i><span class="hidden-tablet"> Dafne status</span></a></li-->
						<!--li-->
							<!--a class="dropmenu" href="#"><i class="icon-folder-close-alt"></i><span class="hidden-tablet"> MAGNETS</span--><!--span class="label label-important dropmenu"> 4 </span--><!--/a-->
							<!--ul>
								<li><a class="submenu" href="#mdl-save" role="button" data-toggle="modal"><i class="icon-save"></i><span class="hidden-tablet"> Save</span></a></li>
								<li><a class="submenu" href="#mdl-load" role="button" data-toggle="modal"><i class="icon-file"></i><span class="hidden-tablet"> Load</span></a></li>
								<li><a class="submenu" href="submenu3.html"><i class="icon-repeat"></i><span class="hidden-tablet"> Restore</span></a></li>
								<li><a class="submenu" href="submenu4.html"><i class="icon-print"></i><span class="hidden-tablet"> Print</span></a></li>
							</ul-->	
						<!--/li-->
						
						
						

					</ul>
				</div>
			</div>
			<!-- end: Main Menu -->
			
			
			<!-- start: Content -->
			<div id="content" class="span10">
			
			
			<ul class="breadcrumb">
				<li>
					<i class="icon-home"></i>
					<a href="../../index.php">Home</a> 
					<i class="icon-angle-right"></i>
				</li>
				<li><a href="#">Magnets</a></li>
			</ul>

			<div class="row-fluid">
				
				<div class="span3 statbox purple" onTablet="span4" onDesktop="span3">
					<h3>Zones</h3>
					<select id="zones"></select>
				</div>
				<div class="span3 statbox purple" onTablet="span4" onDesktop="span3">
					<h3>Elements</h3>
					<select id="elements"></select>
				</div>
				
				
				<div class="box black span2 offset4" onTablet="span4" onDesktop="span2">
					<div class="box-header">
						<h2><i class="halflings-icon white list"></i><span class="break"></span>Actions</h2>
						<div class="box-icon">
							<a href="#" class="btn-minimize"><i class="halflings-icon white chevron-up"></i></a>
						</div>
					</div>
					<div class="box-content">
						<ul class="dashboard-list metro">
							<li class="green">
								<a href="#mdl-save" role="button" data-toggle="modal">
									<i class="icon-save green"></i><span class="opt-menu hidden-tablet">Save</span>                               
								</a>
							</li>
							<li class="red">
								<a href="#mdl-load" role="button" data-toggle="modal" onclick="return openGlobalLoad()">
									<i class="icon-file red"></i><span class="opt-menu hidden-tablet">Load</span>
								</a>
							</li>
							<li class="blue">
								<a href="#" role="button" onclick="reLoad()">
								  <i class="icon-repeat blue"></i><span class="opt-menu hidden-tablet">Reload</span>
								</a>
							</li>
							<li class="yellow">
								<a href="#">
								  <i class="icon-print yellow"></i><span class="opt-menu hidden-tablet">Print</span>
								</a>
							</li>
						</ul>
					</div>
				</div>


				
			</div>		

			<div id="#cu-dashboard">
<!-- 
			<div class="row-fluid">		
				<div class="box span12">
					<div class="box-content">
						<table class="table table-bordered" id="main_table_magnets">
							<thead class="box-header">
							  <tr>
								  <th>Element</th>
								  <th>Readout [A]</th>
								  <th>Setting [A]</th>
								  <th colspan="3">Saved</th>
								  <th colspan="6">Flags</th>
							  </tr>
							</thead>   
						</table>            
					</div>
				</div>		
			</div> -->
			
	<!-- 					
			<div class="row-fluid">				
				<div class="box span12 box-cmd">
					<div class="box-header green">
						<h3 id="h3-cmd">Commands</h3>
					</div>
					<div class="box-content">
						
						<div class="row-fluid">				
							<a class="quick-button-small span1 btn-cmd" id="buttON" onclick=setPowerSupply("On")>
								<i class="material-icons verde">trending_down</i>
								<p class="name-cmd">On</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="buttOFF" onclick=setPowerSupply("Standby")>
								<i class="material-icons rosso">pause_circle_outline</i>
								<p class="name-cmd">Standby</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="reset_alarm" onclick=resetAlarm("Reset")>
								<i class="material-icons rosso">error</i>
								<p class="name-cmd">Reset</p>
							</a>
							
							<div class="span3 offset1" onTablet="span6" onDesktop="span3" id="input-value-mag">
								<input class="input focused" id="new_curr" name="setCurrent" type="text" value="[A]">
							</div>
							
							<a class="quick-button-small span1 btn-value" id="apply_current" onclick=setCurrent(new_curr.value)>
								<p>Apply</p>
							</a>
						</div>

						<div class="row-fluid">				
							<a class="quick-button-small span1 btn-cmd" id="buttPOS" onclick=setPolarity("Pos")>
								<i class="material-icons rosso">add_circle</i>
								<p class="name-cmd">Pos</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="buttOP" onclick=setPolarity("Open")>							
								<i class="material-icons">radio_button_unchecked</i>
								<p class="name-cmd">Open</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="buttNEG" onclick=setPolarity("Neg")>							
								<i class="material-icons blu">remove_circle</i>
								<p class="name-cmd">Neg</p>
							</a>
						</div>	
					</div>
				</div>
							
			</div>
			
			

	</div> -->
	
			<!-- end: Content -->
		</div><!--/#content.span10-->
		</div><!--/fluid-row-->
		
	

	
	


	
	<div class="clearfix"></div>
	
	<footer>

		<p>
			<span style="text-align:left;float:left">&copy; 2016 <a href="http://chaos.infn.it/" alt="logo-!CHAOS" target="_blank">!CHAOS</a></span>
			
		</p>

	</footer>
	
	<!-- start: JavaScript-->

		<script src="./js/jquery-1.9.1.min.js"></script>
	<script src="./js/jquery-migrate-1.0.0.min.js"></script>
	
		<script src="./js/jquery-ui-1.10.0.custom.min.js"></script>
	
		<script src="./js/jquery.ui.touch-punch.js"></script>
	
		<script src="./js/modernizr.js"></script>
	
		<script src="./js/bootstrap.min.js"></script>
	
		<script src="./js/jquery.cookie.js"></script>
	
		<script src='./js/fullcalendar.min.js'></script>
	
		<script src='./js/jquery.dataTables.min.js'></script>

		<script src="./js/excanvas.js"></script>
	<script src="./js/jquery.flot.js"></script>
	<script src="./js/jquery.flot.pie.js"></script>
	<script src="./js/jquery.flot.stack.js"></script>
	<script src="./js/jquery.flot.resize.min.js"></script>
	
		<script src="./js/jquery.chosen.min.js"></script>
	
		<script src="./js/jquery.uniform.min.js"></script>
		
		<script src="./js/jquery.cleditor.min.js"></script>
	
		<script src="./js/jquery.noty.js"></script>
	
		<script src="./js/jquery.elfinder.min.js"></script>
	
		<script src="./js/jquery.raty.min.js"></script>
	
		<script src="./js/jquery.iphone.toggle.js"></script>
	
		<script src="./js/jquery.uploadify-3.1.min.js"></script>
	
		<script src="./js/jquery.gritter.min.js"></script>
	
		<script src="./js/jquery.imagesloaded.js"></script>
	
		<script src="./js/jquery.masonry.min.js"></script>
	
		<script src="./js/jquery.knob.modified.js"></script>
	
		<script src="./js/jquery.sparkline.min.js"></script>
	
		<script src="./js/counter.js"></script>
	
		<script src="./js/retina.js"></script>

		
	
	
	
	
	
		<script src="./js/custom.js"></script>
		
		

	<!-- end: JavaScript-->
	
</body>
</html>
