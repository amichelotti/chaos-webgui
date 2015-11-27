
<html>
<head>
    <title>BTF real_DAQ</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/BTF_DAQ.css" />
    <script type="text/Javascript" src="webChaos/jquery.js"></script>
    <script type="text/Javascript" src="webChaos/flot/jquery.flot.js"></script>
    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/DAQ.js"></script>
    
    
  
</head>


<script>
    CULoad("PowerSupply",1500);
</script>

<body>

    <div class="container">
        
        <header class="title">
            <h1>!CHAOS on BTF<span>Data acquisition</span></h1>	
        </header>
	
        
        <div class="main">
           
	    <fieldset class="qdc0">
                <legend id="name_0" class="Indicator">noname</legend><b class="tmp">Timestamp:  <span class="Indicator" id="timestamp_0">0</span></b>
                <table class="table_parameter">
                    <tr class="param">
                        <td class="name"><b>Ch Num HIGH </b></td>
                        <td class= "value"><b>Value</b></td>
			<td class="name"><b>Ch Num LOW</b></td>
                        <td class= "value"><b>Value</b></td>
		    </tr>
				    
		 <?php
		    for ($trqdc0 = 0; $trqdc0<10; $trqdc0++) {
			
			echo '<tr class="vme">';
			echo'<td class="name_td"><b>hi'.$trqdc0.'</b></td>';
			echo '<td class="value_td"><b id="'.'chh0'.$trqdc0.'_0"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			echo'<td class="name_td"><b>lo'.$trqdc0.'</b></td>';
			echo '<td class="value_td"><b id="'.'chl0'.$trqdc0.'_0"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			}
			echo '</tr>';
			
		    for ($trqdc0 = 10; $trqdc0<16; $trqdc0++) {
			
			echo '<tr class="vme">';
			echo'<td class="name_td"><b>hi'.$trqdc0.'</b></td>';
			echo '<td class="value_td"><b id="'.'chh'.$trqdc0.'_0"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			echo'<td class="name_td"><b>lo'.$trqdc0.'</b></td>';
			echo '<td class="value_td"><b id="'.'chl'.$trqdc0.'_0"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			}
			echo '</tr>';
		 ?>
                </table>
	    </fieldset>
	    
	    
	    <fieldset class="qdc1">
                <legend id="name_1" class="Indicator">noname</legend><b class="tmp">Timestamp:  <span class="Indicator" id="timestamp_1">0</span></b>
		<table class="table_parameter">
                    <tr class="param">
                        <td class="name"><b>Ch Num</b></td>
                        <td class= "value"><b>Value</b></td>
		    </tr>
	  
		<?php
		   for ($trqdc1 = 0; $trqdc1<10; $trqdc1++) {
			echo '<tr class="vme">';
			echo'<td class="name_td"><b>ch'.$trqdc1.'</b></td>';
			echo '<td class="value_td"><b id="'.'ch0'.$trqdc1.'_1"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			}
			echo '</tr>';
			
		    for ($trqdc1 = 10; $trqdc1<16; $trqdc1++) {
			echo '<tr class="vme">';
			echo'<td class="name_td"><b>ch'.$trqdc1.'</b></td>';
			echo '<td class="value_td"><b id="'.'ch'.$trqdc1.'_1"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			}
			echo '</tr>';	
		 ?>
		</table>
            </fieldset>
	     
	     
	    <fieldset class="scaler">
                <legend id="name_2" class="Indicator">noname</legend><b class="tmp">Timestamp:  <span class="Indicator" id="timestamp_2">0</span></b>
                <table class="table_parameter">
                    <tr class="param">
                        <td class="name"><b>Ch Num</b></td>
                        <td class= "value"><b>Value</b></td>
		    </tr>
		    
		<?php
		   for ($trsc = 0; $trsc<10; $trsc++) {
			echo '<tr class="vme">';
			echo'<td class="name_td"><b>ch'.$trsc.'</b></td>';
			echo '<td class="value_td"><b id="'.'ch0'.$trsc.'_2"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			}
			
		    for ($trsc = 10; $trsc<32; $trsc++) {
			echo '<tr class="vme">';
			echo'<td class="name_td"><b>ch'.$trsc.'</b></td>';
			echo '<td class="value_td"><b id="'.'ch'.$trsc.'_2"  digits="3" title="channel value" class="PowersupplyIndicator">0</b></td>';
			}
			
			
			
			echo '</tr>';
			echo '<tr class="vme">';
			echo '<td class= "name_td"><b>trigger_persi</b></td>';
			echo '<td class= "value_td"><b id="ch_sub" digits="3" class="Indicator">0</b></td>'; 
			echo '</tr>';
			
		 ?>
                </table>
		

            </fieldset>
	                
        </div>
		  

    </div>
    
 
</body>
</html>
