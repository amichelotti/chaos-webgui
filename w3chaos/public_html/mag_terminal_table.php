<html>
<head>
    <title>!CHAOS on Mag Terminal</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/mag_terminal.css" />
    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/powersupply.js"></script>
    
    <!--script type="text/javascript" src="js_chart/js/lib/jquery-1.8.3.min.js"></script>
    <script type="text/javascript" src="js_chart/js/flot/jquery.flot.min.js"></script>
    <script type="text/javascript" src="js_chart/js/flot/jquery.flot.time.js"></script>
    <script type="text/javascript" src="js_chart/js/flot/jshashtable-2.1.js"></script>
    <script type="text/javascript" src="js_chart/js/flot/jquery.numberformatter-1.2.3.min.js"></script>

    <script type="text/javascript" src="webChaos/BPM_command_plot.js"></script>
    <script type="text/javascript" src="webChaos/libera_state_total.js"></script-->
    
    <!--script src="http://ajax.googleapis.com/ajax/libs/jquery/x.x.x/jquery.min.js"></script>
    <script type="text/javascript" src="js/bpopo.js"></script-->

    
    <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="http://dinbror.dk/bpopup/assets/jquery.bpopup-0.9.4.min.js"></script>
    <script src="http://dinbror.dk/bpopup/assets/jquery.easing.1.3.js"></script>
    
   <!--script src="http://dinbror.dk/bpopup/assets/style.min.css"></script-->

</head>

<script type="text/JavaScript"> 
function addRow(r){ 
var root = r.parentNode;//the root 
var allRows = root.getElementsByTagName('tr');//the rows' collection 
var cRow = allRows[0].cloneNode(true)//the clone of the 1st row 
var cInp = cRow.getElementsByTagName('input');//the inputs' collection of the 1st row 
for(var i=0;i<cInp.length;i++){//changes the inputs' names (indexes the names) 
cInp[i].setAttribute('name',cInp[i].getAttribute('name')+'_'+(allRows.length+1)) 
} 
var cSel = cRow.getElementsByTagName('select')[0]; 
cSel.setAttribute('name',cSel.getAttribute('name')+'_'+(allRows.length+1));//change the selecet's name 
root.appendChild(cRow);//appends the cloned row as a new row 
} 
function shownames(){ 
var allInp=document.getElementsByTagName('input'); 
for(var i=0;i<allInp.length;i++){ 
alert(allInp[i].name) 
} 
} 
</script> 

<script>
function printDiv()
{
  var divToPrint=document.getElementById('main_table');
  newWin= window.open("");
  newWin.document.write(divToPrint.outerHTML);
  newWin.print();
  newWin.close();
}
</script>


<script>
$(function(){
    $('#GlobalLoad').click(function(){
        $('#popup').bPopup();
    });
});
</script>

<script>
function myFunction() {
    var x = document.getElementById("elementi");
    var i = x.selectedIndex;
    document.getElementById("demo").innerHTML = x.options[i].text;
}
</script>

<script>
        CULoad(null,3500);	//"PowerSupply"

</script>
    
<body>
<div class="container">
	
    <div class="top">
	<strong>status:</strong>
	    <b id="dev_status_0" class="Indicator" style="color:green; font-weight: bold;"></b>
	<span class="right">
	<strong>timestamp:</strong>
	    <b id="timestamp_0" class="Indicator" style="color:green; font-weight: bold;"></b>
	</span>
	<div class="clr"></div>
    </div>
    	
    <!--div class="title">
        <header><h1>!CHAOS on Beam Test Facility<span>Mag Terminal</span></h1></header>
    </div-->
    <div class="main_menu">
	<button class="button_main_menu" id="GlobalSave" style="cursor:pointer;">Global Save</button>
	<button class="button_main_menu" id="GlobalLoad" style="cursor:pointer;">Global Load</button>
	<button class="button_main_menu" style="cursor:pointer;">Altro</button>
	<button class="button_main_menu" id="print" onclick="printDiv()" style="cursor:pointer;">Print</button>
	
	
	<p id="Dataset"><b id="dataset_file">DATASET</b><input type="text" id="input_dataset"></p>
    </div>

    <!--POPUP-->
    <div id="popup" style="display: none;">
    <span class="button b-close"><span>Close</span></span>
    COSA CERCARE??<br />
    </div>

    
    <div id="zone">
	<form class="choose">
	    <fieldset class="field_zone">
		<legend>ZONES</legend>
		<select name="zona">
		    <option value="BTF" selected="btf">BTF</option>
		    <option value="LINAC" selected="linac">LINAC</option>
		</select>
	    </fieldset>
	</form>
	
	<form method="post" action="check.php" class="choose">
	    <fieldset class="field_zone">
		<legend>ELEMENTS</legend>
		<select id="elementi" onchange="myFunction()">
		    <option value="ALL" selected="btf">ALL</option>
		    <option value="DIP" selected="linac">DIPOLE</option>
		    <option value="QUAD" selected="linac">QUADRUPOLE</option>
		    <option value="COR" selected="linac">CORRETTORI</option>
		</select>
		<INPUT TYPE="submit" name="submit"/>
	    </fieldset>
	</form>
    </div>
    
    
<p id="demo"></p>
    
    <?php
    echo $_POST['elementi'];
    ?>
    
    <div id="choosen">
	
    </div>
    
    <div id="main_table_box">
	<table id="main_table">
	    <tr id="table_field">
		<td>Element</td>
		<td>Readout</td>
		<td>Setting</td>
		<td>Saved</td>
		<td>Flags</td>
	    </tr>
	    		
		<?php
		
		
		
		/*for($i=0; $i<6; $i++) {
		    echo '<tr class="table_value">';
			echo '<td class="element_name"><b>name_'.$i.'</b></td>';
		    	echo '<td class="element_readout"><b>readout_'.$i.'</b></td>';
			echo '<td class="element_setting"><b>setting_'.$i.'</b></td>';
			echo '<td class="element_saved"><b>saved_'.$i.'</b></td>';
			echo '<td class="element_flags"><b>flags_'.$i.'</b></td>';
		    echo '</tr>';

		} */

		
		?>	
	</table>
    </div>
    
     <!-- Button that triggers the popup -->
            <!--button id="my-button">POP IT UP</button>
            <!-- Element to pop up -->
            <!--div id="element_to_pop_up">Content of popup</div-->
	    
	    
	 
    
   <!--div id="popup" style="display: none;">
    <span class="button b-close"><span>X</span></span>
    If you can't get it up use trallelewdfsfs<br />
    <span class="logo">bPopup</span>
</div>

<button id="pop">PopUp</button-->
<form action="" method="get"> 
  <table width="766"  border="0" cellspacing="0" cellpadding="0"> 
    <tr> 
      <td width="191"><input type="text" name="textfield_a" /></td> 
      <td width="191"><input type="text" name="textfield_b" /></td> 

      <td width="98"><select name="select"> 
        <option value="item1" selected="selected">item1</option> 
        <option value="item2">item2</option> 
        <option value="item3">item3</option> 
        <option value="item4">item4</option> 
        <option value="item5">item5</option> 

      </select></td> 
      <td width="286"><input name="button" type="button" value="+" onclick="addRow(this.parentNode.parentNode)"></td> 
    </tr> 
  </table><br /><br /> 
  <input name="submit" type="submit" value="Submit" /> 
        <br> 
        <br> 
<input name="button" type="button" onclick="shownames()" value="Show names">         
</form> 
	

    </div>          
</body>
</html>