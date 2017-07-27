<html>
<head>
    <title>Beam position monitoring</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" type="text/css" href="css/materialize.css" />
    <link rel="stylesheet" type="text/css" href="css/style.css" />
    <link rel="stylesheet" type="text/css" href="css/custom_materialize.css" />
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <script type="text/javascript" src="https://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script type="text/javascript" src="js/materialize.js"></script>
    <!--[if lte IE 8]><script language="javascript" type="text/javascript" src="js/flot/excanvas.min.js"></script><![endif]-->
    <script type="text/javascript" src="js/flot/jquery.flot.min.js"></script>
    <script type="text/javascript" src="js/flot/jquery.flot.time.js"></script>
    <script type="text/javascript" src="js/flot/jquery.flot.axislabels.js"></script>
    <script type="text/javascript" src="js/flot/jquery.flot.symbol.js"></script>
    <script type="text/javascript" src="js/accumulator.js"></script>
    <script type="text/javascript" src="js/commandPlot.js"></script>
    <script type="text/javascript" src="js/plot_tot_SA.js"></script>
    <script type="text/javascript" src="js/plot_tot_DD.js"></script>
    <script type="text/javascript" src="js/chartSA-check.js"></script>
    <script type="text/javascript" src="js/chartDDpermanent.js"></script>

</head>

<body>

<!-- TOP -->
    <div class="row top">
	<div class="col s12 m12 l12">
	    <span>STATUS: </span><b id="dev_status"></b>
	    <span id="top-right">TIMESTAMP: <b id="timestamp"></b></span>
	</div>
    </div>
<!-- END TOP -->
    
<!-- CONTAINER -->
    <div class="container">

    <!-- TITLE -->
	<div class="row row-box">
	    <header class="col s12 m12 l12"><h1>!CHAOS on Accumulator</h1>
		<br><span>BPMs Monitoring</span></header>
	</div>
    <!-- END TITLE -->
    

    <!-- TABLE STATUS -->
	<div class="row-box main-box">
	    <div class="row">
		<div class="col s12 m12 l6">
		    <div class="rTableHead col s3 m3 l3"><span>Mode</span></div>
		    <div class="rTableHead col s3 m3 l3"><span>Samples</span></div>
		    <div class="rTableHead col s3 m3 l3"><span>Acquisition</span></div>
		    <div class="rTableHead col s3 m3 l3"><span>DA&#966;NE status</span></div>
		</div>
	    </div>
	    <div class="row">
		<div class="col s12 m12 l6">
		    <div class="rTableCell col s3 m3 l3"><b id="MODE">0</b></div>
		    <div class="rTableCell col s3 m3 l3"><b id="SAMPLES">0</b></div>
		    <div class="rTableCell col s3 m3 l3"><b id="ACQUISITION">0</b></div>
		    <div class="rTableCell col s3 m3 l3"><b id="DAFNE">0</b></div>
		</div>   
	    </div>
	</div>
    <!-- END TABLE STATUS -->
	
	
    <!-- TABLE INPUT -->
	<div class="row">
	    <div class="col s12 m12 l6">
		<fieldset class="box-input">
		    <legend class="legend-input">Command</legend>
		
		    <div class="row">
			<div class="row-input col s12 m12 l12">
			    <div class="col s4 m4 l4 switch">
				<label>Trigger Off
				    <input type="checkbox" id="trig_1">
				    <span class="lever"></span>Trigger On
				</label>
			    </div>
			    <div class="input-field col s2 m2 l2">
				<input id="sampleTR_0" type="text" value="1" class="validate">
				<label for="sampleTR_0">n&#176 samples</label>
			    </div>
			    <div class="col s6 m6 l6">
				<input class="waves-effect waves-light btn" type="button" name="permanent" id="permanentDD_0" value="DD" onclick="permanentDD(sampleTR_0.value);"/>
				<input class="waves-effect waves-light btn" type="button" name="permanent" id="permanentSA_0" value="SA" onclick="permanentSA();"/>
				<input class="waves-effect waves-light btn" type="button" name="disable" id="disable_0" value="Disable" onclick="Disable(this.value);"/>
			    </div>
			</div>
		    </div>
		    
		    <div class="row">	
			<div class="row-input col s12 m12 l12">
			    <div class="col s4 m4 l4 switch">
				<label>Trigger Off
				    <input type="checkbox" id="trig_0">
				    <span class="lever"></span>Trigger On
				</label>
			    </div>
			    <div class="input-field col s2 m2 l2">
				<input id="sampleDD_0" type="text" value="1" class="validate">
				<label for="sampleDD_0">n&#176 samples</label>
			    </div>
			    <div class="input-field col s2 m2 l2">
				<input id="loopDD_0" type="text" value="1" class="validate">
				<label for="loopDD_0">n&#176 loops</label>
			    </div>
			    <div class="col s4 m4 l4">
				<input class="waves-effect waves-light btn btn-big" type="button" name="DD" id="DD_0" value="DataOnDemand" onclick="powerDD(sampleDD_0.value,loopDD_0.value);"/>
			    </div>
			</div>
		    </div>
			    
		    <div class="row">    
			<div class="row-input col s12 m12 l12">
			    <div class="input-field col s2 m2 l2 offset-s6 offset-m6 offset-l6">
				<input id="loopSA_0" type="text" value="1" class="validate">
				<label for="loopSA_0">n&#176 loops</label>
			    </div>
			    <div class="col s4 m4 l4">
				<input class="waves-effect waves-light btn btn-big" type="button" name="SA" id="SA_0" value="SlowAcquisition" onclick="powerSA(loopSA_0.value);"/>
			    </div>
			</div>
		    </div>
		</fieldset> <!-- END FIELDSET -->
	    </div> <!-- END DIV col s12 m12 l12 box-input-->
	    
	    
	<!-- FIELDSET file -->
	    <!--div class="row"-->
		<div class="col s12 m12 l4 offset-l1">
		    <fieldset class="box-input">
			<legend class="legend-input">File</legend>
			
			<div class="row">
			    <div class="col s8 m8 l8 input-field">
				<input class="file-path validate" type="text" id="nameToSave">
				<label>file to save</label>
			    </div>
			    <div class="col s4 m4 l4">
				<input class="waves-effect waves-light btn btn-big" type="button" value="Save" onclick="SaveData(nameToSave.value)"/>
			    </div>
			</div>
			
			<div class="row">
			    <div class="col s8 m8 l8 input-field">
				<input class="file-path validate" type="text" id="nameToLoad">
				<label>file to load</label>
			    </div>
			    <div class="col s4 m4 l4">
				<a class="waves-effect waves-light btn modal-trigger"  data-target="modal1" id="btn-search" onclick="Search()"><i class="material-icons left">search</i></a>
				<input class="waves-effect waves-light btn btn-load" type="button" value="Load" class="btn-load"/>
			    </div>
			</div>
			
			<div class="row">
			    <div class="col s4 m4 l4 chip chip-file">
				<i class="material-icons red">add_circle</i>
				file uploaded<br>
				<span id="file-up-pos"></span>
			    </div>
			    <div class="col s4 m4 l4 offset-s1 offset-m1 offset-l1 chip chip-file">
				<i class="material-icons blu">remove_circle</i>
				file uploaded<br>
				<span id="file-up-el"></span>
			    </div>
			</div>
	
		    </fieldset>    
		<!--/div-->
	    </div> <!-- END fieldset file -->
	    	
	</div> <!-- END ROW box-input -->
	
	<div class="row">
	    <div class="col s12 m12 l12">
		<h3 class="plot_title">----- Plot -----</h3>
	    </div>
	    <!--div class="row">
		<div class="col s1 m1 l1">
		    <label>max axis</label>
		    <input class="file-path validate" type="text" id="max_axis">
		</div>
		<div class="col s3 m3 l3">
		    <input class="waves-effect waves-light btn set_axis" type="button" value="Set Xaxs"/>
		</div>
	    </div-->
	</div>
	<!--/div-->
	
	
	<div class="row"> <!-- plot accumulator x -->
	    <div class="col s12 m12 l12 box-accumulator">
		<div id="plot_accumulator_x"></div>
	    </div>
	</div> <!-- end plot accumulator x -->
	
	<div class="row"> <!-- plot accumulator y -->
	    <div class="col s12 m12 l12 box-accumulator">
		<div id="plot_accumulator_y"></div>
	    </div>
	</div> <!-- end plot accumulator y -->
	
	<div class="row"> <!-- break -->
	    <div class="s12 m12 l12"><p></p><p></p><p></p><br><br></div>
	</div>
	
	<div class="row">
	    <div class="col s12 m12 l12">
		<h3 class="plot_title">----- BPM Plot -----</h3>
	    </div>
	</div>
	
	<div class="row"> <!-- break -->
	    <div class="s12 m12 l12"><p></p><p></p><p></p><br></div>
	</div>

	
	<div class="row"> <!-- 4 bpm -->
	    <div class="col s12 m12 l10 offset-l1">
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA1001" name="selector[]" />
		    <label for="BPBA1001">BPBA1001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA1002" name="selector[]" />
		    <label for="BPBA1002">BPBA1002</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA2001" name="selector[]" />
		    <label for="BPBA2001">BPBA2001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA2002" name="selector[]" />
		    <label for="BPBA2002">BPBA2002</label>
		</div>
	    </div>
	</div>
	
	<div class="row"> <!-- 4 bpm -->
	    <div class="col s12 m12 l10 offset-l1">
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA3001" name="selector[]" />
		    <label for="BPBA3001">BPBA3001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA3002" name="selector[]" />
		    <label for="BPBA3002">BPBA3002</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA4001" name="selector[]" />
		    <label for="BPBA4001">BPBA4001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPBA4002" name="selector[]" />
		    <label for="BPBA4002">BPBA4002</label>
		</div>
	    </div>
	</div>
	
	<div class="row"> <!-- 4 bpm -->
	    <div class="col s12 m12 l10 offset-l1">
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPSA1001" name="selector[]" />
		    <label for="BPSA1001">BPSA1001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPSA2001" name="selector[]" />
		    <label for="BPSA2001">BPSA2001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPSA3001" name="selector[]" />
		    <label for="BPSA3001">BPSA3001</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="BPSA4001" name="selector[]" />
		    <label for="BPSA4001">BPSA4001</label>
		</div>
	    </div>
	</div>
	
	<div class="row"> <!--  -->
	    <div class="col s12 m12 l10 offset-l1">
		<div class="col s3 m3 l2">
		    <input type="checkbox" class="filled-in" id="ALL" name="selector[]" />
		    <label for="ALL">ALL</label>
		</div>
		<div class="col s3 m3 l2">
		    <input type="button" id="show_value" name="show_value" value="Show" />
		</div>
	    </div>
	</div>
    
	<div class="row"> <!-- break -->
	    <div class="s12 m12 l12"><p></p><p></p><p></p></div>
	</div>
	    
	<div class="row">
	    <div class="col s12 m12 l12 box-multiple-plot">
		<div id="multi_plot"></div>
	    </div>
	</div>
	
		
    </div>      <!--CHIUSURA COINTEINER-->
    
    
    <div class="row"><!-- break -->
	<div class="s12 m12 l12"><br><br><br><br></div>
    </div>
    
    <footer></footer>
    

  <!-- Modal Structure -->
  <div id="modal1" class="modal modal-fixed-footer">
    <div class="modal-content">
      <h4 id="title-popup">List Load Files</h4>
      <table id="table-list">
	<thead>
	    <th>Nome</th>
	    <th>Timestamp</th>

	</thead>
      </table>
    </div>
    <div class="modal-footer">
	<button class="btn btn-load" id="no-right">Load</button>
      <a class="modal-action modal-close waves-effect waves-green btn-flat ">Close</a>
    </div>
  </div>
  

</body>
</html>