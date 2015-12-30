var maxarray=100;
var cus=[];
           
    var CO_avg;
  var CO_graph = new Array();
    
    var temp_sup_avg;
    var temp_sup_graph = new Array();
    
    var humi_avg;
    var humi_graph = new Array();
    
    var temp_avg;
    var temp_graph = new Array();
    
    
function PowerSupply(name){
    CU.apply(this,arguments);
   
    this.points = new Array();    
    console.log("creating PowerSupply:"+name);
    
  /*  this.processData=function(){
	
	for(var i=0; i<cus.length;i++) {
	var my=this;
         /*  var y = $("#PS_0").html();
	   
	    my.points.push([(my.timestamp-my.firsttimestamp)/1000,y]); */
	 
	/*    my.points.push([(my.timestamp-my.firsttimestamp)/1000,CO_graph]); 


	} */

      this.processData=function(){
	
		var my=this;


    my.points.push([(my.timestamp-my.firsttimestamp)/1000,CO_graph]); 

      }

    } 
    

 function updateInterface(){
                CUupdateInterface();
		
	var CO1 = parseFloat(document.getElementById("CO2_5").innerHTML);
	var CO3 = parseFloat(document.getElementById("CO2_16").innerHTML);
	var CO5 = parseFloat(document.getElementById("CO2_26").innerHTML);
	
	var HU10 = parseFloat(document.getElementById("HUMIDITY_0").innerHTML);
	var HU11 = parseFloat(document.getElementById("HUMIDITY_1").innerHTML);
	var HU12 = parseFloat(document.getElementById("HUMIDITY_2").innerHTML);
	var HU21 = parseFloat(document.getElementById("HUMIDITY_6").innerHTML);
	var HU22 = parseFloat(document.getElementById("HUMIDITY_7").innerHTML);
	var HU23 = parseFloat(document.getElementById("HUMIDITY_8").innerHTML);
	var HU31 = parseFloat(document.getElementById("HUMIDITY_11").innerHTML);
	var HU32 = parseFloat(document.getElementById("HUMIDITY_12").innerHTML);
	var HU33 = parseFloat(document.getElementById("HUMIDITY_13").innerHTML);
	var HU34 = parseFloat(document.getElementById("HUMIDITY_14").innerHTML);
	var HU41 = parseFloat(document.getElementById("HUMIDITY_17").innerHTML);
	var HU42 = parseFloat(document.getElementById("HUMIDITY_18").innerHTML);
	var HU43 = parseFloat(document.getElementById("HUMIDITY_19").innerHTML);
	var HU44 = parseFloat(document.getElementById("HUMIDITY_20").innerHTML);
	var HU51 = parseFloat(document.getElementById("HUMIDITY_22").innerHTML);
	var HU52 = parseFloat(document.getElementById("HUMIDITY_23").innerHTML);
	
	var TU10 = parseFloat(document.getElementById("TEMP_0").innerHTML);
	var TU11 = parseFloat(document.getElementById("TEMP_1").innerHTML);
	var TU12 = parseFloat(document.getElementById("TEMP_2").innerHTML);
	var TU21 = parseFloat(document.getElementById("TEMP_6").innerHTML);
	var TU22 = parseFloat(document.getElementById("TEMP_7").innerHTML);
	var TU23 = parseFloat(document.getElementById("TEMP_8").innerHTML);
	var TU31 = parseFloat(document.getElementById("TEMP_11").innerHTML);
	var TU32 = parseFloat(document.getElementById("TEMP_12").innerHTML);
	var TU33 = parseFloat(document.getElementById("TEMP_13").innerHTML);
	var TU34 = parseFloat(document.getElementById("TEMP_14").innerHTML);
	var TU41 = parseFloat(document.getElementById("TEMP_17").innerHTML);
	var TU42 = parseFloat(document.getElementById("TEMP_18").innerHTML);
	var TU43 = parseFloat(document.getElementById("TEMP_19").innerHTML);
	var TU44 = parseFloat(document.getElementById("TEMP_20").innerHTML);
	var TU51 = parseFloat(document.getElementById("TEMP_22").innerHTML);
	var TU52 = parseFloat(document.getElementById("TEMP_23").innerHTML);
	
	var S11 = parseFloat(document.getElementById("TEMP_3").innerHTML);
	var S12 = parseFloat(document.getElementById("TEMP_4").innerHTML);
	var S21 = parseFloat(document.getElementById("TEMP_9").innerHTML);
	var S22 = parseFloat(document.getElementById("TEMP_10").innerHTML);
	var S31 = parseFloat(document.getElementById("TEMP_15").innerHTML);
	var S41 = parseFloat(document.getElementById("TEMP_21").innerHTML);
	var S51 = parseFloat(document.getElementById("TEMP_24").innerHTML);
	var S52 = parseFloat(document.getElementById("TEMP_25").innerHTML);




	
	
	CO_avg = (CO1 + CO3 + CO5)/3;
	
	console.log("###########" + CO_avg);
	
	CO_graph.push(CO_avg);
	
	temp_avg = (TU10 + TU11 + TU12 + TU21 + TU22 + TU23 + TU31 + TU32 + TU33 + TU34 + TU41 + TU42 + TU43 + TU44 + TU51 + TU52)/16;
	temp_graph.push(temp_avg);
	
	humi_avg = (HU10 + HU11 + HU12 + HU21 + HU22 + HU23 + HU31 + HU32 + HU33 + HU34 + HU41 + HU42 + HU43 + HU44 + HU51 + HU52)/16;
	humi_graph.push(humi_avg);
	
	temp_sup_avg = (S11 + S12 + S21 + S22 + S31 + S41 + S51 + S52)/8;
	temp_sup_graph.push(temp_sup_avg);

	
	
	  /*  cus[3].update();
                		    
		$.plot("#powersupply-graph_3",[cus[3].points]);*/
		
               /* for(var i = 0;i<cus.length;i++){
                    cus[i].update(); */
	       
	     //  $.plot("#placeholder_0",  [{label: "high",data:CO_graph}]);
	       
	    //   $.plot($("#placeholder_0"), [ [[0, 0], [1, 1]] ], { yaxis: { max: 300 } });
	       
		//$.plot($("#powersupply-graph_0"), [ CO_graph ]);

		$.plot("#powersupply-graph_0",[CO_graph]);


		    

		    
		/*$.plot("#powersupply-graph_3",[cus[i].points]);

		}   */              		    
		
            }
               