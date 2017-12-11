<html>
<head>
    <title>Beam position monitoring</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/beam_position_monitoring.css" />
    <script type="text/Javascript" src="webChaos/jquery.js"></script>
    <script type="text/Javascript" src="webChaos/flot/jquery.flot.js"></script>
    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/powersupply.js"></script>
    
       <script type="text/javascript" src="js_chart/js/lib/jquery-1.8.3.min.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.flot.time.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jshashtable-2.1.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.numberformatter-1.2.3.min.js"></script>


    
    <script type="text/javascript" src="webChaos/BPM.js"></script>
        <!--script type="text/javascript" src="webChaos/BPM_circle.js"></script-->


</head>

<script>
    CULoad(null,1500);	//"PowerSupply"
</script>
    
    <body>


    <div class="container">
        
        <header><h1>!CHAOS on Accumulator<span>BPMs Monitoring</span></h1></header>
	
	<button style="cursor: pointer;" onclick="window.open('http://__template__webuiulr__/accumulator_tot.php?dev=ACCUMULATOR/BPM/BPMSYNC')";>Accumulator General View</button>
	
		
	    <?php
	    
	    $value_bpm = array (
				"BPBA1001" => array("BPBA1001X_0","BPBA1001Y_0","1","2"),
				"BPBA1002" => array("BPBA1002X_0","BPBA1002Y_0","3","4"),
				"BPBA2001" => array("BPBA2001X_0","BPBA2001Y_0","5","6"),
				"BPBA2002" => array("BPBA2002X_0","BPBA2002Y_0","7","8"),
				"BPBA3001" => array("BPBA3001X_0","BPBA3001Y_0","9","10"),
				"BPBA3002" => array("BPBA3002X_0","BPBA3002Y_0","11","12"),
				"BPBA4001" => array("BPBA4001X_0","BPBA4001Y_0","13","14"),
				"BPBA4002" => array("BPBA4002X_0","BPBA4002Y_0","15","16"),
				"BPSA1001" => array("BPSA1001X_0","BPSA1001Y_0","17","18"),
				"BPSA2001" => array("BPSA2001X_0","BPSA2001Y_0","19","20"),
				"BPSA3001" => array("BPSA3001X_0","BPSA3001Y_0","21","22"),
				"BPSA4001" => array("BPSA4001X_0","BPSA4001Y_0","23","24"),

		);
	    
	    foreach($value_bpm as $sensarr => $value) {
		
		echo '<div class="line">';
		echo '<table class="caratteristiche">';
		echo '<tr class="probe">';
		echo '<td class="td_nome" class="Indicator" style="color:black; font-weight:bold;">'.$sensarr.'</td>';
		echo '<td class="value_probe"><span>X[mm]</span><b id="'.$value[0].'" digits="3" class="Indicator" style="color:green; font-weight:bold; padding-left: 10px;">0</b></td>';
		echo '<td class="value_probe"><span>Y[mm]</span><b id="'.$value[1].'" digits="3" class="Indicator" style="color:green; font-weight:bold; padding-left: 10px;">0</b></td>';
		echo '</tr>';
		echo '<table>';
		
		echo '<fieldset class="plot">';
		echo '<legend>Y [mm]</legend>';
		echo '<div id="flot-placeholder'.$value[2].'" style="width:400px; height:200px;"></div>';
		echo '</fieldset>';
		
		echo '<fieldset class="plot">';
		echo '<legend>X [mm]</legend>';
		echo '<div id="flot-placeholder'.$value[3].'" style="width:400px; height:200px;"></div>';
		echo '</fieldset>';
		
		echo'</div>';
	    }
	
	?>
	
	
	
	
    </div>
    
          
        </body>
</html>