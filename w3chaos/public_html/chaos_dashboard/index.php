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
				
				<div class="row-fluid" id="table-space">
					<div class="box span12">
						<div class="box-content span12">
							<p id="no-result-monitoring"></p>
							<table class="table table-bordered" id="main_table_cu">
								<thead class="box-header">
								  <tr>
									  <th>Name CU</th>
									  <th colspan="3">Status</th>
									  <th>Timestamp</th>
									  <th>Uptime</th>
									  <th colspan="2">Time sys/usr [%]</th>
									  <th>Command Queue</th>
									  <th colspan="2">Alarms dev/cu</th>
									  <th>Push rate</th>
								  </tr>
								</thead>   
							</table>            
						</div>
					</div><!--/span-->
				</div><!--/row-->
				
	
				
<!-- 			<div class="row-fluid">				
				<div class="box span12 box-cmd">
					<div class="box-header green">
						<h3 id="h3-cmd">Commands</h3>
					</div>
					<div class="box-content">
						
						<div class="row-fluid">				
							<div class="span3 offset1" onTablet="span6" onDesktop="span3">
								<p class=input focused id="cu-cmd" </p>

							</div>
							<a class="quick-button-small span1 btn-cmd" id="cmd-init" onclick="Init()">
								<i class="material-icons verde">trending_up</i>
								<p class="name-cmd">Init</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="cmd-start" onclick="Start()">
								<i class="material-icons verde">play_arrow</i>
								<p class="name-cmd">Start</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="cmd-load" onclick="Load()">
								<i class="material-icons verde">settings_power</i>
								<p class="name-cmd">Load</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="cmd-bypassOn" onclick="ByPassON()">
								<i class="material-icons red">cached</i>
								<p class="name-cmd">ByPass</p>
							</a>
						</div>
						
						<div class="row-fluid">
							<a class="quick-button-small span1 btn-cmd offset4" id="cmd-deinit" onclick="Deinit()">
								<i class="material-icons giallo">trending_down</i>
								<p class="name-cmd">Deinit</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="cmd-stop" onclick="Stop()">
								<i class="material-icons verde">pause</i>
								<p class="name-cmd">Stop</p>
							</a>
							<a class="quick-button-small span1 btn-cmd" id="cmd-unload" onclick="Unload()">
								<i class="material-icons red">highlight_off</i>
								<p class="name-cmd">Unload</p>
</a>
							<a class="quick-button-small span1 btn-cmd" id="cmd-bypassOFF" onclick="ByPassOff()">
								<i class="material-icons verde">usb</i>
								<p class="name-cmd">ByPass OFF</p>
							</a>
						</div>

					</div>
				</div>
			</div>

			</div><!--/.--/#content.span10---->

	
		</div><!--/fluid-row--> -->
	</div>
	

	<div class="clearfix"></div>
	
	<footer><?php require_once('footer.php');?></footer>
	
	
	<!--MODAL FATAL ERROR-->
	<div class="modal hide fade" id="mdl-fatal-error">
		<div class="modal-header">
			<button type="button" class="close" data-dismiss="modal">X</button>
			<h3>Error of <span id="name-FE-device"></span></h3>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				<p><b>Health Status:</b><span id="status_message"></span></p>
				<p><b>Messagge:</b><span id="error_message"></span></p>
				<p><b>Domain:</b><span id="error_domain"></span></p>
			</div>
		</div>
			<div class="modal-footer">
		</div>
	</div>
	
	
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
			<h2><span id="name-cu-io"></span></h2>
		</div>
		<div class="modal-body">
			<div class="row-fluid">		
				<div class="span12">
				<h2>DATASET</span></h2>

				<pre id="cu-json-dataset"></pre>
				</div>
				<div class="span12">
				<h2>DESCRIPTION</span></h2>

				<pre id="cu-json-description"></pre>
				</div>
			</div>
		</div>
		<div class="modal-footer"></div>
	</div>


<script src="<?php echo $main_dir ?>/js/monitoring.js"></script>
	

</body>
</html>
