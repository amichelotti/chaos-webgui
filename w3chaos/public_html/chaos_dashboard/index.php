<!DOCTYPE HTML>
<html>
<?php require_once('head.php'); ?>
<body>


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
						<!--li><a href="index.php"><i class="icon-home"></i><span class="hidden-tablet"> Home</span></a></li-->	
						

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
					<!--li><a href="#">Scrapers</a></li-->
				</ul>
			
				<div class="row-fluid">
				
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
						<h3>Zones</h3>
						<select id="zones"></select>
					</div>
					<div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
						<h3>Elements</h3>
						<select id="elements"></select>
					</div>	
				
				<!-- ANCORA DA IMPLEMENTARE -->
					<!--div class="span3 statbox yellow" onTablet="span6" onDesktop="span3">
						<h3>Search</h3>
						<input id="search"/>
					</div-->	

				
				</div>
				
				<div class="row-fluid" id="table-space">
					
					
					<div class="box span12">
						<div class="box-content">
							<table class="table table-bordered" id="main_table_cu">
								<thead class="box-header">
								  <tr>
									  <th>Name CU</th>
									  <th colspan="2">Status</th>
									  <th>Timestamp</th>
									  <th>Uptime</th>
									  <th>SystemTime [%]</th>
									  <th>UserTime [%]</th>
									  <th>Command Queue</th>
									  <th>Alarm Device</th>
									  <th>Alarm CU</th>
								  </tr>
								</thead>   
							</table>            
						</div>
					</div><!--/span-->
					
					
					
				</div><!--/row-->
				

			</div><!--/.--/#content.span10---->
	
		</div><!--/fluid-row-->
	</div>
	
		
	
	<div class="clearfix"></div>
	<footer>

		<p>
			<span style="text-align:left;float:left">&copy; 2016 <a href="http://chaos.infn.it/" alt="logo-!CHAOS" target="_blank">!CHAOS</a></span>
			
		</p>

	</footer>
	
	
		<!--MODAL DEVICE ALARM-->
	<div class="modal hide fade" id="mdl-device-alarm-cu">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">X</button>
			<h3>TABLE ALARM of <span id="name-device-alarm"></span></h3>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				<div class="box span12 red">
					<div class="box-content">
						<table class="table table-bordered" id="table_device_alarm">
							<thead class="box-header red">
								<tr>
									<th>Description</th>
									<th>Value</th>
								</tr>
							</thead>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-footer">
			<!--a href="#" class="btn btn-primary" onclick="">Save</a-->
		</div>
	</div>
	
	<!--MODAL CU ALARM-->
	<div class="modal hide fade" id="mdl-cu-alarm-cu">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">X</button>
			<h3>TABLE CU ALARM of <span id="name-cu-alarm"></span></h3>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				<div class="box span12 yellow">
					<div class="box-content">
						<table class="table table-bordered" id="table_cu_alarm">
							<thead class="box-header yellow">
								<tr>
									<th>Description</th>
									<th>Value</th>
								</tr>
							</thead>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-footer"></div>
	</div>
	
	
	<!--MODAL INPUT/OUTPUT CU-->
	<div class="modal hide fade" id="mdl-io-cu">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">X</button>
			<h3>DATA of <span id="name-cu-io"></span></h3>
		</div>
		<div class="modal-body">
				<!--div id="lalla"><table id="cc"></table></div-->

			<div class="row-fluid">		
				<div class="span12">

					<table class="table table-bordered" id="table_cu_out">						
						<thead class="box-header green">
							<tr>
								<th colspan="2">Output</th>
							</tr>
						</thead>
					</table>

					<table class="table table-bordered" id="table_cu_in">						
						<thead class="box-header green">
							<tr>
								<th colspan="2">Input</th>
							</tr>
						</thead>
					</table>


					<!--div class="box-content">
						
						<div id="lalla"><table id="cc"></table></div-->

						<!--table class="table table-bordered" id="table_cu_out">
							<thead class="box-header green">
								<tr>
									<th>Output</th>
								</tr>
							</thead>
							<tbody>
								
							</tbody>
						</table-->
						
						<!--table class="table table-bordered" id="table_cu_in">
							<thead class="box-header green">
								<tr>
									<th colspan="2">Input</th>
								</tr>
							</thead>
						</table-->

					<!--/div-->
				</div>
			</div>
		</div>
		<div class="modal-footer"></div>
	</div>


</body>
</html>