
<html>
<head>
    <title>Aula Touschek monitoring</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/Aula_T.css" />
    
    <script type="text/javascript" src="webChaos/flot/jquery.flot.min.js"></script>
    <script type="text/javascript" src="webChaos/flot/jquery.flot.time.js"></script>
    <script type="text/javascript" src="webChaos/flot/jquery.flot.axislabels.js"></script>
    <script type="text/javascript" src="webChaos/flot/jquery-1.8.3.min.js"></script>




      <!--meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css"-->

    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/Aula_T_real.js"></script>


    
</head>



<script>
    CULoad("PowerSupply",2500);
</script>
    
    <body>


    <div class="container">
        
        <header class="title">
            <h1>!CHAOS in Aula Touschek<span>Monitoring environmental parameters</span></h1>	
        </header>
        
	<div class="main">
	    
	    <div class="map" align=left>
		<img src="css/piantina_touschek.jpg" style="width:100%; margin-left:4%;"/>
		
			    
		<?php

		$COdue_probe= array(
				    "CO101" => array( "CO2_5" ),
				    "CO301" => array ( "CO2_16"),
				    "CO501" => array ("CO2_26")
				);

		foreach($COdue_probe as $codue => $sensarr ){
		    echo '<table class="table_parameter" id="'.$codue.'">';
		    echo '<tr class="probe">';
		    echo '<td class="value_probe">';
		    echo'<div class="inTable">';
		    echo '<span class="unit">ppm</span>';
		    echo '<div class="value"><b id="'.$sensarr[0].'" class="Indicator">0</b></div>';
		    echo '</div>';
		    echo '</td>';
		    echo '</tr>';
		    echo '</table>';
		}

		$temp_probe= array(
				    "SO101" => array ("TEMP_3"),
				    "SO102" => array ("TEMP_4"),
				    "SO201" => array ("TEMP_9"),
				    "SO202" => array ("TEMP_10"),
				    "SO301" => array ("TEMP_15"),
				    "SO401" => array ("TEMP_21"),
				    "SO501" => array ("TEMP_24"),
				    "SO502" => array ("TEMP_25")
				);


		foreach($temp_probe as $temp =>$sensarr){
		    echo '<table class="table_parameter" id="'.$temp.'">';
		    echo '<tr class="probe">';
		    echo '<td class="value_probe">';
		    echo'<div class="inTable">';
		    echo '<span class="unit">&#186;C</span>';
		    echo '<div class="value"><b id="'.$sensarr[0].'" class="Indicator">0</b></div>';
		    echo '</div>';
		    echo '</td>';
		    echo '</tr>';
		    echo '</table>';
		}


		$TempUR_probe= array(
				    "DO101" => array("TEMP_0","HUMIDITY_0"),
				    "DO102" => array("TEMP_1","HUMIDITY_1"),
				    "DO103" => array("TEMP_2","HUMIDITY_2"),
				    "DO201" => array("TEMP_6","HUMIDITY_6"),
				    "DO202" => array("TEMP_7","HUMIDITY_7"),
				    "DO203" => array("TEMP_8","HUMIDITY_8"),
				    "DO301" => array("TEMP_11","HUMIDITY_11"),
				    "DO302" => array("TEMP_12","HUMIDITY_12"),
				    "DO303" => array("TEMP_13","HUMIDITY_13"),
				    "DO304" => array("TEMP_14","HUMIDITY_14"),
				    "DO401" => array("TEMP_17","HUMIDITY_17"),
				    "DO402" => array("TEMP_18","HUMIDITY_18"),
				    "DO403" => array("TEMP_19","HUMIDITY_19"),
				    "DO404" => array("TEMP_20","HUMIDITY_20"),
				    "DO501" => array("TEMP_22","HUMIDITY_22"),
				    "DO502" => array("TEMP_23","HUMIDITY_23")
				);

		foreach($TempUR_probe as $tempUm => $sensarr){
		    echo '<table class="table_parameter" id="'.$tempUm.'">';
		    echo '<tr class="probe">';
		    echo '<td class="value_probe">';
		    echo'<div class="inTable">';
		    echo '<span class="unit">&#186;C</span>';
		    echo '<div class="value"><b id="'.$sensarr[0].'" class="Indicator">0</b></div>';
		    echo '</div>';
		    echo '</td>';
		    echo '<td class="value_probe">';
		    echo '<div class="inTable">';
		    echo '<span class="unit">%</span>';
	            echo '<div class="value"><b id="'.$sensarr[1].'" class="Indicator">0</b></div>';
		    echo '</div>';
		    echo '</td>';
		    echo '</tr>';
		    echo '</table>';
		}

		?>
	
		</div>
	    
	    <div class="graph">


		<fieldset class="plot" id="plot_t">
		    <legend>Temperature_AVG</legend>
	    
	    	    <!--div class="plot"><h4>Grafico temperatura media</h4></div-->
		    
		    <div id="#flot-placeholder1" style="width:550px;height:300px;margin:0 auto"></div>

		<!--div id="powersupply_graph_0" maxpoints="300" class="powersupply-graph-class"></div-->


		</fieldset>
		
		</div>
		
		<!--fieldset class="plot" id="plot_c">
		    <legend>[CO2]_AVG</legend>
	    
	    	    <div class="plot"><h4>Grafico CO2 media</h4></div>

		</fieldset>
		
		<fieldset class="plot" id="plot_s">
		    <legend>Temperature_superficial_AVG</legend>
	    
	    	    <div class="plot"><h4>Grafico temperatura superficiale media</h4></div>

		</fieldset-->
    	
    	
    	
    
	</div>
    
    </div>
    
    
</body>
</html>
