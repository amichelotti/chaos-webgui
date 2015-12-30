var cus=[];
           
function PowerSupply(name){
    CU.apply(this,arguments);
    
    console.log("creating PowerSupply:"+name);
    
 		var hist = new Array();


}
   
   
   
     


 
 function updateInterface(){

                CUupdateInterface();
	    

		    var ch0 = document.getElementById("ch30_2").innerHTML;
		    var ch1 = document.getElementById("ch31_2").innerHTML;
			
			document.getElementById("ch_sub").innerHTML = ch1-ch0;
			
			
		    var cl0= document.getElementById("chh00_0").innerHTML;
		    var cl1= document.getElementById("chh01_0").innerHTML;
		    var cl2= document.getElementById("chh02_0").innerHTML;
		    var cl3= document.getElementById("chh03_0").innerHTML;
		    var cl4= document.getElementById("chh04_0").innerHTML;
		    var cl5= document.getElementById("chh05_0").innerHTML;
		    var cl6= document.getElementById("chh06_0").innerHTML;
		    var cl7= document.getElementById("chh07_0").innerHTML;
		    var cl8= document.getElementById("chh08_0").innerHTML;
		    var cl9= document.getElementById("chh09_0").innerHTML;
		    var cl10= document.getElementById("chh10_0").innerHTML;
		    var cl11= document.getElementById("chh11_0").innerHTML;
		    var cl12= document.getElementById("chh12_0").innerHTML;
		    var cl13= document.getElementById("chh13_0").innerHTML;
		    var cl14= document.getElementById("chh14_0").innerHTML;
		    var cl15= document.getElementById("chh15_0").innerHTML;
		    var cl16= document.getElementById("chl00_0").innerHTML;
		    var cl17= document.getElementById("chl01_0").innerHTML;
		    var cl18= document.getElementById("chl02_0").innerHTML;
		    var cl19= document.getElementById("chl03_0").innerHTML;
		    var cl20= document.getElementById("chl04_0").innerHTML;
		    var cl21= document.getElementById("chl05_0").innerHTML;
		    var cl22= document.getElementById("chl06_0").innerHTML;
		    var cl23= document.getElementById("chl07_0").innerHTML;
		    var cl24= document.getElementById("chl08_0").innerHTML;
		    var cl25= document.getElementById("chl09_0").innerHTML;
		    var cl26= document.getElementById("chl10_0").innerHTML;
		    var cl27= document.getElementById("chl11_0").innerHTML;
		    var cl28= document.getElementById("chl12_0").innerHTML;
		    var cl29= document.getElementById("chl13_0").innerHTML;
		    var cl30= document.getElementById("chl14_0").innerHTML;
		    var cl31= document.getElementById("chl15_0").innerHTML;
		    
		    
		
		
		 var val_hist = document.getElementById("ch00_1").innerHTML;
		console.log("###########" + val_hist);
		var hist = new Array();
		hist.push(val_hist);
		console.log("###########" + hist);
		  
		
		
		
		$(function() {

		var data1 = [ ["3", cl0], ["6", cl1], ["9", cl2], ["12", cl3], ["15", cl4], ["18", cl5],
			    ["21", cl6],["24", cl7],["27", cl8],["30", cl9],["33", cl10],["36", cl11],
			    ["39", cl12], ["42", cl13],["45", cl14],["48", cl15]];
		
		
		var data2 = [["3", cl16],["6", cl17],["9", cl18],["12", cl19],["15", cl20],["18", cl21],["21", cl22],["24", cl23],
			    ["27", cl24],["30", cl25],["33", cl26],["36", cl27],["39", cl28],["42", cl29],["45", cl30],["48", cl31]];

		
		$.plot("#placeholder_0",  [{label: "high",data:data1}],{
			series: {
				bars: {
					show: true,
					barWidth: 0.6,
					align: "center"
				}
			},
			xaxis: {
				mode: "categories",
				tickLength: 0
			}	
		});
		
		$.plot("#placeholder_1", [{label:"low", data:data2} ], {
			series: {
				bars: {
					show: true,
					barWidth: 0.6,
					align: "center"
				}
			},
			xaxis: {
				mode: "categories",
				tickLength: 0
			}
		});
	});
	


		
 }
 
var values = hist.map(function(d) {
    return d})

//var values = [1,2,3,4,98,654,432,654,3232,54,65,22,77,22,84,2,4,6,7,8,4,2].map(function(d){
  //  return d})

// A formatter for counts.
var formatCount = d3.format(",.0f");

var margin = {top: 10, right: 30, bottom: 30, left: 30},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .domain([-1, 5])

   // .domain([0, 9])
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


//});
                    
		
 
                  
		
	
               