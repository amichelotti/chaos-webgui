
<html>
<head>
    <title>Aula Touschek monitoring</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/Aula_T_zoom.css" />
    
    <script type="text/javascript" src="js_chart/js/lib/jquery-1.8.3.min.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.flot.min.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.flot.time.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jshashtable-2.1.js"></script>
<script type="text/javascript" src="js_chart/js/flot/jquery.numberformatter-1.2.3.min.js"></script>

    <!--meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="http://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css"-->

    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/powersupply.js"></script>
    <script type="text/javascript" src="webChaos/Aula_T_real_zoom.js"></script>
  
</head>


<script>
    
        CULoad(null,3500);

</script>
    
    <body>


    <div class="container">
        
        <header class="title">
            <h1>TEMPERATURE_AVG</h1>
        </header>
        
	<div class="main">
	    
	    <!--table class="table_parameter">
		<tr class="probe"></tr>
		<td class="value_probe"></td-->
	    <table class="table_parameter">
                    <tr class="param">
                        <td class="name"><b>Name</b></td>
                        <td class= "value"><b>Value[&#186;C]</b></td>
			<!--div class="inTable"-->
			
		    </tr>
		
	    
	    <?php
	    $TempUR_probe= array(
				    "DO101" => array("TEMP_0"),
				    "DO102" => array("TEMP_1"),
				    "DO103" => array("TEMP_2"),
				    "DO201" => array("TEMP_6"),
				    "DO202" => array("TEMP_7"),
				    "DO203" => array("TEMP_8"),
				    "DO301" => array("TEMP_11"),
				    "DO302" => array("TEMP_12"),
				    "DO303" => array("TEMP_13"),
				    "DO304" => array("TEMP_14"),
				    "DO401" => array("TEMP_17"),
				    "DO402" => array("TEMP_18"),
				    "DO403" => array("TEMP_19"),
				    "DO404" => array("TEMP_20"),
				    "DO501" => array("TEMP_22"),
				    "DO502" => array("TEMP_23")
				);

		foreach($TempUR_probe as $tempUm => $sensarr){
		
		
		/*    echo '<table class="table_parameter">';

		   // echo '<table class="table_parameter" id="'.$tempUm.'">';
		  echo '<tr class="probe">';
		   echo '<td class="value_probe">';
		    echo'<div class="inTable">';
		    echo '<span class="unit">&#186;C</span>';
		     echo '<td class="value"><b id="'.$sensarr[0].'" class="Indicator">0</b></td>';

		  //  echo '<div class="value"><b id="'.$sensarr[0].'" class="Indicator">0</b></div>';
		    echo '</div>';
		   echo '</td>';
		} */
	 
	 
			
	    echo '<tr class="probe">';
	    echo'<td class="value_probe"><b>'.$tempUm.'</b></td>';
		//echo '<span class="unit">&#186;C</span>';
		     echo '<td class="value"><b id="'.$sensarr[0].'" class="Indicator">0</b></td>';			
			}
			
			echo '<td><b>tot</b></tot>';
			echo '</tr>';
			echo '<tr><b>tot</b></tr>';

		?>
		    
		    <tr>tot</tr>
	
	    </table>
	
	    
	    <!--div class="graph"-->

		<fieldset class="plot" id="plot_t">
		    <legend>Temperature_AVG</legend>		    
		    <div id="flot-placeholder1" style="width:300px;height:400px"></div>
		</fieldset>
		
		
		
	    <!--/div-->

    </div>

</div>
    
    
</body>
</html>
