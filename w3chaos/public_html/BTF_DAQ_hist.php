
<html>
<head>
    <title>BTF real_DAQ</title>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1"> 
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> 
    <link rel="stylesheet" type="text/css" href="css/BTF_DAQ_hist.css" />
    <script type="text/Javascript" src="webChaos/jquery.js"></script>
    <script type="text/Javascript" src="webChaos/flot/jquery.flot.js"></script>
    <script type="text/javascript" src="webChaos/chaos.js"></script>
    <script type="text/javascript" src="webChaos/DAQ_graph.js"></script>
    
    
    <script language="javascript" type="text/javascript" src="webChaos/graph/excanvas.min.js"></script>
	<script language="javascript" type="text/javascript" src="webChaos/graph/jquery.js"></script>
	<script language="javascript" type="text/javascript" src="webChaos/graph/jquery.flot.js"></script>
		<script language="javascript" type="text/javascript" src="webChaos/graph/jquery.flot.categories.js"></script>

		<script src="http://d3js.org/d3.v3.min.js"></script>

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
			
		    for ($trqdc1 = 10; $trqdc1<32; $trqdc1++) {
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
	
	 <div class="demo-container">
	<div id="placeholder_0" class="demo-placeholder"></div>
	<div id="placeholder_1" class="demo-placeholder"></div>

    </div>

    </div>
    
    <script>


var val_hist = document.getElementById("ch00_1").innerHTML;

console.log("###########" + val_hist);

var hist = new Array();

 hist.push(val_hist);
 
 
console.log("###########" + hist);

var values = hist.map(function(d) {
    return d})

/*var values = [1,2,3,4,98,654,432,654,3232,54,65,22,77,22,84,2,4,6,7,8,4,2].map(function(d){
    return d})*/

// A formatter for counts.
var formatCount = d3.format(",.0f");

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([-1, 5])

    .domain([0, 9])
    .range([0, width]);

// Generate a histogram using twenty uniformly-spaced bins.
var data = d3.layout.histogram()
    .bins(x.ticks(20))
    (values);

var y = d3.scale.linear()
    .domain([0, d3.max(data, function(d) { return d.y; })])
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var bar = svg.selectAll(".bar")
    .data(data)
  .enter().append("g")
    .attr("class", "bar")
    .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

bar.append("rect")
    .attr("x", 1)
    .attr("width", x(data[0].dx) - 1)
    .attr("height", function(d) { return height - y(d.y); });

bar.append("text")
    .attr("dy", ".75em")
    .attr("y", 6)
    .attr("x", x(data[0].dx) / 2)
    .attr("text-anchor", "middle")
    .text(function(d) { return formatCount(d.y); });

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

</script>

    

</body>
</html>
