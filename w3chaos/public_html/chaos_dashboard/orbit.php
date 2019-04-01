<!DOCTYPE HTML>
<html>
<?php
require_once('head.php');

$curr_page = "Orbit";

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
				
				<div class="span4" onTablet="span4" onDesktop="span4">
					<h2>DAFNE STATUS: <span id="linac_status"></span> </h2>
					<h2>MODE: <span> Slow Acquisition</span>  <!--strong>DAFNE STATUS:</strong><span id="dafne_status"></span--></h2>
					<br>
					<h2>Snapshot e-: <span id="snapshot-ele"></span> </h2>
					<h2>Snapshot e+: <span id="snapshot-pos"></span></h2>
					<br>

						
					<!--select id="zones"></select-->
				</div>
				<!--div class="span3 statbox purple" onTablet="span6" onDesktop="span3">
					<h3>Elements</h3>
					<select id="elements"></select>
				</div-->
				
			
				
				<div class="box black span2 offset6" onTablet="span4" onDesktop="span2">
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
								<a href="#mdl-load" role="button" data-toggle="modal" onclick="return loadOrbit()">
									<i class="icon-file red"></i><span class="opt-menu hidden-tablet">Load</span>
								</a>
							</li>
							
						</ul>
					</div>
				</div>
				
			</div>
			
				
			<div class="row-fluid">
				<div class="span11" onTablet="span11" onDesktop="span11">
					<div id="containerX" style="min-width: 750px; height: 300px; margin: 0 auto"></div>
				</div>
				<div class="span1">
					<input type="checkbox" id="choices-loadX"/><label for="choices-loadX" id="choices-load-labelX">dataset</label>
				    <input type="checkbox" id="choices-diffX"/><label for="choices-diffX" id="choices-diff-labelX">diff</label>
				</div> 

				</div>
				
				
			<div class="row-fluid">
				<div class="span11" onTablet="span11" onDesktop="span11">
					<div id="containerY" style="min-width: 750px; height: 300px; margin: 0 auto"></div>
				</div>
				<div class="span1">
					<input type="checkbox" id="choices-loadY" class="filled-in checkY"/><label for="choices-loadY" id="choices-load-labelY">dataset</label>
				    <input type="checkbox" id="choices-diffY" class="filled-in checkY"/><label for="choices-diffY" id="choices-diff-labelY">diff</label>
				</div> 

			</div>
			
			<div class="row-fluid">
				<div class="span11" onTablet="span11" onDesktop="span11">
					<div id="containerSum" style="min-width: 750px; height: 300px; margin: 0 auto"></div>
				</div>
				<div class="span1">
					<input type="checkbox" id="choices-loadSUM" class="filled-in checkSUM"/><label for="choices-loadSUM" id="choices-load-labelSUM">dataset</label>
				    <input type="checkbox" id="choices-diffSUM" class="filled-in checkSUM"/><label for="choices-diffSUM" id="choices-diff-labelSUM">diff</label>
				</div> 

			</div>

			<div class="row-fluid">
				<div class="span11" onTablet="span11" onDesktop="span11">
					<div id="containerCurrent" style="min-width: 750px; height: 300px; margin: 0 auto"></div>
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
			<h3>SAVE ORBIT ACCUMULATOR</h3>
		</div>
		<div class="modal-body">
			<div class="control-group">
				<label class="control-label" for="nameDataset">Insert name</label>
				<div class="controls">
					<input class="input-xlarge focused" id="nameOrbit" type="text" value="name">
				</div>
			</div>
		</div>
		<div class="modal-footer">
			<a href="#" class="btn btn-primary" data-dismiss="modal" onclick="saveOrbit(nameOrbit.value)">Save</a>
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
						<table class="table table-bordered" id="table_orbit_load">
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
	
	<footer><?php require_once('footer.php');?></footer>

		
	<!-- 	<script src="https://code.highcharts.com/highcharts.js"></script>
	<script src="https://code.highcharts.com/modules/exporting.js"></script>
 -->
		
		<!--script src="./js/accumulator.js"></script-->
		<script src="js/chaos-widget/accumulator.js"></script>

		

		<script>
                jchaos.setOptions({"uri":location.host:8081});
		</script>	

		



	<!-- end: JavaScript-->
	
</body>
</html>
