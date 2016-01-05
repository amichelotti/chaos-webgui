<!DOCTYPE html>
<!--
To change this license header, choose License Headers in Project Properties.
To change this template file, choose Tools | Templates
and open the template in the editor.
-->
<html>
    <head>
        <link href="webChaos/powersupply.css" rel="stylesheet" type="text/css">
         <script type="text/Javascript" src="webChaos/jquery.js"></script>
       <script type="text/Javascript" src="webChaos/flot/jquery.flot.js"></script>
        <script type="text/javascript" src="webChaos/chaos.js"></script>
         <script type="text/javascript" src="webChaos/powersupply_state.js"></script>        
    <link rel="stylesheet" type="text/css" href="css/BTF_pw.css" />
        <script>
            CULoad("PowerSupply",1500);
        </script>
        <body>
        <table id="table_powersupply_0">
	  <tr class="param">
                        <td class="name"><b>Name</b></td>
                        <td class= "state" colspan="2"><b>State (on-off)</b></td>
                        <td class="polarity" colspan="3"><b>Polarity (+/-)</b></td>
                        <td class="current" colspan="2"><b>Current</b></td>
                        <td class="current" colspan="3"><b>Slope (up,down)</b></td>
                        <td class="current_sp"><b>Current SP</b></td>
                        <td class="current_r_o"><b>Current Readout</b></td>
                        <td class="timestamp"><b>Timestamp</b></td>
                        <td class="alarm" colspan="2"><b>Alarms</b></td>
			<td class="plot"><b>Plot</b></td>
	  </tr>
				    
		 <?php

		    for ($trq = 0; $trq<1; $trq++) {
			echo '<tr class="pw">';
			echo '<td class="name_td"><b id="'.'name_'.$trq.'"class="PowersupplyIndicator">noname</b></td>';
			echo '<td class="state_td_on"><input type="button" name="on" id="'.'on_'.$trq.'"value="On" onclick="'.'cus['.$trq.'].powerSupplyOn(this.value);"/></td>';
			echo '<td class="state_td_off"><input type="button" name="stby" id="'.'stby_'.$trq.'"value="StandBy" onclick="'.'cus['.$trq.'].powerSupplyOff(this.value);"/></td>';
			echo '<td class="polarity_p"><input type="button" name="pos" id="'.'pos_'.$trq.'" value="Pos" onclick="'.'cus['.$trq.'].setPolarity(1);" /></td>';
			echo '<td class="polarity_l"><input type="button" name="neg" id="'.'neg_'.$trq.'" value="Neg" onclick="'.'cus['.$trq.'].setPolarity(-1);" /></td>';
			echo '<td class="open_td"><input type="button" name="open" id="'.'open_'.$trq.'" value="open" onclick="'.'cus['.$trq.'].setPolarity(0);" /></td>';
			echo '<td class="current_td"><input type="text" id="'.'inputcurrent_'.$trq.'" name="currentSet" class="controlInput" value="0"/>';
			echo '<td class="current_set_td"><input type="button" id="'.'setcurrent_'.$trq.'" value="set" onclick="'.'cus['.$trq.'].setCurrent(inputcurrent_'.$trq.'.value);" />';
			echo '<td class="current_td"><input type="text" id="'.'inputslopeup_'.$trq.'" name="slopeSet" class="controlInput" value="1"/>';
			echo '<td class="current_td"><input type="text" id="'.'inputslopedown_'.$trq.'" name="slopeSet" class="controlInput" value="1"/>';
			echo '<td class="current_set_td"><input type="button" id="'.'setslope_'.$trq.'" value="set" onclick="'.'cus['.$trq.'].setSlope(inputslopeup_'.$trq.'.value,inputslopedown_'.$trq.'.value);" />';
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
    </body>
</html>
