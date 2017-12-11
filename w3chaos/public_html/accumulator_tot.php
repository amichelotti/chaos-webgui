<html>
<head>
    <title>Accumulator BPM</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/accumulator_tot.css" />
    <script type="text/Javascript" src="webChaos/jquery.js"></script>
    <script type="text/Javascript" src="webChaos/flot/jquery.flot.js"></script>
    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/powersupply.js"></script>
    
       <script type="text/javascript" src="js_chart/js/lib/jquery-1.8.3.min.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.flot.time.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jshashtable-2.1.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.numberformatter-1.2.3.min.js"></script>


        <script type="text/javascript" src="webChaos/BPM_tot_line.js"></script>



</head>

<script>
    CULoad(null,1500);	//"PowerSupply"
</script>
    
    <body>


    <div class="container">
        
        <header><h1>!CHAOS on Accumulator<span>BPMs Monitoring - General View</span></h1></header>
	
	    <div class="container">
		
		<div class="line">
		
		<table class="table_parameter">
		    <tr class="parameter">
			<td class="BPM_position"><b>PBM Position</b></td>
			<td class="BPM_name"><b>BPM name</b></td>
			<td class="BPM_value"><b>Y [mm]</b></td>
		    </tr>
		    
		    <?php
		    $value_bpm = array (
				"BPBA1001" => array("BPBA1001Y_0","1"),
				"BPSA1001" => array("BPSA1001Y_0","2"),
				"BPBA1002" => array("BPBA1002Y_0","3"),
				"BPBA2001" => array("BPBA2001Y_0","4"),
				"BPSA2001" => array("BPSA2001Y_0","5"),
				"BPBA2002" => array("BPBA2002Y_0","6"),
				"BPSA3001" => array("BPSA3001Y_0","7"),
				"BPBA3001" => array("BPBA3001Y_0","8"),
				"BPBA3002" => array("BPBA3002Y_0","9"),	
				"BPBA4001" => array("BPBA4001Y_0","10"),
				"BPBA4002" => array("BPBA4002Y_0","11"),
				"BPSA4001" => array("BPSA4001Y_0","12"),
			    );
			    	    
			    
		    foreach($value_bpm as $sensarr => $value) {
			

		
		    echo '<tr class="value">';
		    echo '<td class="BPM_position"><b >'.$value[1].'&#186</b></td>';
		    echo '<td class="BPM_name"><b>'.$sensarr.'</b></td>';
		    echo '<td class="BPM_value"><b id="'.$value[0].'" digits="3" class="Indicator" style="color:green; font-weight:bold;"></b></td>';
		    echo '</tr>';
		    
		    }
		    
		    ?>
		   
		</table>
	

	    <fieldset class="plot_tot">
		<legend>Y [mm]</legend>		    
                <div id="flot-placeholder1" style="width:600px;height:400px;"></div>
	    </fieldset>
	    
		</div>
		
		<div class="line">
	    
	    <table class="table_parameter">
		    <tr class="parameter">
			<td class="BPM_position"><b>PBM Position</b></td>
			<td class="BPM_name"><b>BPM name</b></td>
			<td class="BPM_value"><b>X [mm]</b></td>
		    </tr>
		    
		    <?php
		    $value_bpm = array (
				"BPBA1001" => array("BPBA1001X_0","1"),
				"BPSA1001" => array("BPSA1001X_0","2"),
				"BPBA1002" => array("BPBA1002X_0","3"),
				"BPBA2001" => array("BPBA2001X_0","4"),
				"BPSA2001" => array("BPSA2001X_0","5"),
				"BPBA2002" => array("BPBA2002X_0","6"),
				"BPSA3001" => array("BPSA3001X_0","7"),
				"BPBA3001" => array("BPBA3001X_0","8"),
				"BPBA3002" => array("BPBA3002X_0","9"),	
				"BPBA4001" => array("BPBA4001X_0","10"),
				"BPBA4002" => array("BPBA4002X_0","11"),
				"BPSA4001" => array("BPSA4001X_0","12"),
			    );
			    	    
			    
		    foreach($value_bpm as $sensarr => $value) {
		
		    echo '<tr class="value">';
		    echo '<td class="BPM_position"><b >'.$value[1].'&#186</b></td>';
		    echo '<td class="BPM_name"><b>'.$sensarr.'</b></td>';
		    echo '<td class="BPM_value"><b id="'.$value[0].'" digits="3" class="Indicator" style="color:green; font-weight:bold;"></b></td>';
		    echo '</tr>';
		    
		    }
		    
		    ?>
		   
		</table>
	
	    
	    
	     <fieldset class="plot_tot">
		<legend>X [mm]</legend>		    
                <div id="flot-placeholder2" style="width:600px;height:400px;"></div>
	    </fieldset>  
                    
        </div>
		
    </body>
    </html>
    
   
    </div>
    
          
        </body>
</html>