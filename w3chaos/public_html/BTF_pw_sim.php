
<html>
<head>
    <title>BTF sim_powersupply</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/BTF_pw.css" />
    <script type="text/Javascript" src="webChaos/jquery.js"></script>
    <script type="text/Javascript" src="webChaos/flot/jquery.flot.js"></script>
    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/powersupply_state.js"></script>
    
</head>


<!--script type="text/javascript"> FUNZIONE PER IMPORRE I LIMITI
    function minmax(value, min, max) {
	if(parseInt(value) < 0 || isNaN(value)) 
	    return 0; 
	else if(parseInt(value) > 100)
	    return window.alert("sbagliato")
	    //return 100; 
	else return value;
}
</script-->

<!--script>  FUNZIONE PER MULTI-COMANDI
   function multi_com() {
	//quadrupolo 1
	var inputcurrent_0 = 10;
	setTimeout(cus[0].powerSupplyToggle(this.value),0);
	setTimeout(cus[0].setPolarity(0),100);
	setTimeout(cus[0].setPolarity(1),200);
	setTimeout(cus[0].setPolarity(-1),300);
	setTimeout(cus[0].powerSupplyToggle(this.value),400);
	setTimeout(cus[0].setCurrent(inputcurrent_0.value),500);
</script-->


<script>
    CULoad("PowerSupply",1500);
</script>
    
    <body>


    <div class="container">
        
        <header class="title">
            <h1>!CHAOS on BTF<span>Powersupply Control</span></h1>	
        </header>
        
        <div class="main">
            
  
           
	    
	    <fieldset class="quadrupoli">
                <legend>Quadrupole</legend>
                
                <table class="table_parameter">
                    <tr class="param">
                        <td class="name"><b>Name</b></td>
                        <td class= "state" colspan="2"><b>State (on-off)</b></td>
                        <td class="polarity" colspan="3"><b>Polarity (+/-)</b></td>
                        <td class="current" colspan="2"><b>Current</b></td>
                        <td class="current_sp"><b>Current SP</b></td>
                        <td class="current_r_o"><b>Current Readout</b></td>
                        <td class="timestamp"><b>Timestamp</b></td>
                        <td class="alarm" colspan="2"><b>Alarms</b></td>
			<td class="plot"><b>Plot</b></td>
		    </tr>
				    

		 <?php

		    for ($trq = 0; $trq<6; $trq++) {
			echo '<tr class="pw">';
			echo '<td class="name_td"><b id="'.'name_'.$trq.'"class="PowersupplyIndicator">noname</b></td>';
			echo '<td class="state_td_on"><input type="button" name="on" id="'.'on_'.$trq.'"value="On" onclick="'.'cus['.$trq.'].powerSupplyOn(this.value);"/></td>';
			echo '<td class="state_td_off"><input type="button" name="stby" id="'.'stby_'.$trq.'"value="StandBy" onclick="'.'cus['.$trq.'].powerSupplyOff(this.value);"/></td>';
			echo '<td class="polarity_p"><input type="button" name="pos" id="'.'pos_'.$trq.'" value="Pos" onclick="'.'cus['.$trq.'].setPolarity(1);" /></td>';
			echo '<td class="polarity_l"><input type="button" name="neg" id="'.'neg_'.$trq.'" value="Neg" onclick="'.'cus['.$trq.'].setPolarity(-1);" /></td>';
			echo '<td class="open_td"><input type="button" name="open" id="'.'open_'.$trq.'" value="open" onclick="'.'cus['.$trq.'].setPolarity(0);" /></td>';
			echo '<td class="current_td"><input type="text" id="'.'inputcurrent_'.$trq.'" name="currentSet" class="controlInput" value="0"/>';
			echo '<td class="current_set_td"><input type="button" id="'.'setcurrent_'.$trq.'" value="set" onclick="'.'cus['.$trq.'].setCurrent(inputcurrent_'.$trq.'.value);" />';
			echo '<td class="current_sp_td"><b id="'.'current_sp_'.$trq.'"  digits="3" title="current SP" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="current_r_o_td"><b id="'.'current_'.$trq.'" digits="3" title="current read out" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="timestamp_td"><b id="'.'seconds_'.$trq.'" title="seconds since the UI started" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="alarm_m_td"><input type="button" name="rstalarms" id="'.'rstalarms_'.$trq.'" value="rstalarms" title="Reset alarms" onclick="'.'cus['.$trq.'].powerSupplyClrAlarms();" /></td>';
			echo '<td class="alarm_v_td"><b id="'.'alarms_'.$trq.'" title="current alarms mask" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="plot_td"><div id="' . 'powersupply-graph_' . $trq . '" title="current vs seconds from the start of the UI" maxpoints="300" class="powersupply-graph-class"></div></td>';
			}
			echo '</tr>';
			
		 ?>
    
                </table>
             
            </fieldset>
	    
	     <fieldset class="dipoli">
                <legend>Dipole</legend>
                
                <table class="table_parameter">
                    <tr class="param">
                        <td class="name"><b>Name</b></td>
                        <td class= "state" colspan="2"><b>State (on-off)</b></td>
                        <td class="polarity" colspan="3"><b>Polarity (+/-)</b></td>
                        <td class="current" colspan="2"><b>Current</b></td>
                        <td class="current_sp"><b>Current SP</b></td>
                        <td class="current_r_o"><b>Current Readout</b></td>
                        <td class="timestamp"><b>Timestamp</b></td>
                        <td class="alarm" colspan="2"><b>Alarms</b></td>
			<td class="plot"><b>Plot</b></td>
		    </tr>
		                
		    
		    <?php

		    for ($tr = 6; $tr<8; $tr++) {
			echo '<tr class="pw">';
			echo '<td class="name_td"><b id="'.'name_'.$tr.'"class="PowersupplyIndicator">noname</b></td>';
			echo '<td class="state_td_on"><input type="button" name="on" id="'.'on_'.$tr.'"value="On" onclick="'.'cus['.$tr.'].powerSupplyOn(this.value);"/></td>';
			echo '<td class="state_td_off"><input type="button" name="stby" id="'.'stby_'.$tr.'"value="StandBy" onclick="'.'cus['.$tr.'].powerSupplyOff(this.value);"/></td>';
			echo '<td class="polarity_p"><input type="button" name="pos" id="'.'pos_'.$tr.'" value="Pos" onclick="'.'cus['.$tr.'].setPolarity(1);" /></td>';
			echo '<td class="polarity_l"><input type="button" name="neg" id="'.'neg_'.$tr.'" value="Neg" onclick="'.'cus['.$tr.'].setPolarity(-1);" /></td>';
			echo '<td class="open_td"><input type="button" name="open" id="'.'open_'.$tr.'" value="open" onclick="'.'cus['.$tr.'].setPolarity(0);" /></td>';
			echo '<td class="current_td"><input type="text" id="'.'inputcurrent_'.$tr.'" name="currentSet" class="controlInput" value="0"/>';
			echo '<td class="current_set_td"><input type="button" id="'.'setcurrent_'.$tr.'" value="set" onclick="'.'cus['.$tr.'].setCurrent(inputcurrent_'.$tr.'.value);" />';
			echo '<td class="current_sp_td"><b id="'.'current_sp_'.$tr.'"  digits="3" title="current SP" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="current_r_o_td"><b id="'.'current_'.$tr.'" digits="3" title="current read out" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="timestamp_td"><b id="'.'seconds_'.$tr.'" title="seconds since the UI started" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="alarm_m_td"><input type="button" name="rstalarms" id="'.'rstalarms_'.$tr.'" value="rstalarms" title="Reset alarms" onclick="'.'cus['.$tr.'].powerSupplyClrAlarms();" /></td>';
			echo '<td class="alarm_v_td"><b id="'.'alarms_'.$tr.'" title="current alarms mask" class="PowersupplyIndicator">0</b></td>';
			echo '<td class="plot_td"><div id="' . 'powersupply-graph_' . $tr . '" title="current vs seconds from the start of the UI" maxpoints="300" class="powersupply-graph-class"></div></td>';
			}
		    
			echo '</tr>';
			
		 ?>
    
   

                </table>
                
            </fieldset> 
                
	    <!--input type="button" name="multi" value="multix" onclick="multi_com();"-->  

            </div>
            
        </div>  
    </div>

</body>
</html>
