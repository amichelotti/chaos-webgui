<!DOCTYPE HTML>
<html>
	
<?php
require_once('./../../head.php');
?>
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
				<a class="brand" href="index.php"><span>Dashboard BTF</span></a>
								
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
						
					<?php require_once('./../../menu.php'); ?>

						<!--li><a href="../../index.php"><i class="icon-home"></i><span class="hidden-tablet"> Home</span></a></li-->	
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
				
				<div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
					<h3>Zones</h3>
					<select id="zones"></select>
				</div>
				<div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
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
				</div><!--/span-->			
			</div><!--/row-->
			
						
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
			
			

	</div><!--/.fluid-container-->
	
			<!-- end: Content -->
		</div><!--/#content.span10-->
		</div><!--/fluid-row-->
		
	
	<div class="modal hide fade" id="mdl-save">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">×</button>
			<h3>SAVE DATASET</h3>
		</div>
		<div class="modal-body">
			<div class="control-group">
				<label class="control-label" for="nameDataset">Insert name</label>
				<div class="controls">
					<input class="input-xlarge focused" id="nameDataset" type="text" value="name">
				</div>
			</div>
		</div>
		<div class="modal-footer">
			<a href="#" class="btn btn-primary" data-dismiss="modal" onclick="saveDataset(nameDataset.value)">Save</a>
		</div>
	</div>
	
	<!--MODAL LOAD-->
	<div class="modal hide fade" id="mdl-load">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">×</button>
			<h3>LIST DATASET</h3>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				<div class="box span12">
					<div class="box-content">
						<table class="table table-bordered" id="table_dataset">
							<thead class="box-header">
								<tr>
									<th>Date</th>
									<th>Name</th>
								</tr>
							</thead>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-footer">
			<a href="#" class="btn" data-dismiss="modal">Close</a>
		</div>
	</div>
	
<!--MODAL VIEW DATASET-->
	<div class="modal hide fade" id="mdl-into-load">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">×</button>
			<h3>DATASET of <span id="name_dataset"></span></h3>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				<div class="box span12">
					<div class="box-content">
						<table class="table table-bordered" id="table_into_dataset">
							<thead class="box-header">
								<tr>
									<th>Element</th>
									<th>Setting</th>
									<th>Status</th>
									<th>Polarity</th>
								</tr>
							</thead>
						</table>
					</div>
				</div>
			</div>
		</div>
		<div class="modal-footer">
			<a href="#" class="btn btn-primary" data-dismiss="modal" onclick="fill_load_main_table()">Load</a>
			<a href="#" class="btn" data-dismiss="modal">Close</a>
		</div>
	</div>
	
	
	<!--MODAL DEVICE ALARM-->
	<div class="modal hide fade" id="mdl-device-alarm-mag">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">×</button>
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
	<div class="modal hide fade" id="mdl-cu-alarm-mag">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">×</button>
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



	
	<div class="clearfix"></div>
	
	<footer>

		<p>
			<span style="text-align:left;float:left">&copy; 2016 <a href="http://chaos.infn.it/" alt="logo-!CHAOS" target="_blank">!CHAOS</a></span>
			
		</p>

	</footer>
	
	<!-- start: JavaScript-->

	
	
		<script src="js/custom.js"></script>
		
		<script src="js/magnets.js"></script>
		<script src="js/magnets-cmd.js"></script>
		<script src="js/magnets-alarm-load.js"></script>
		<script src="js/magnets_reload.js"></script>




	<!-- end: JavaScript-->
	
</body>
</html>
