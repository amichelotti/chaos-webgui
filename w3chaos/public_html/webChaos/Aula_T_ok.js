var maxarray = 100;
var cus=[];

    var CO_avg;
    var CO_graph = new Array();
           
function PowerSupply(name){
    CU.apply(this,arguments);
    
    console.log("creating PowerSupply@@@@@@@@:"+name);

    
       this.points = new Array();    


	
	for(var i=0; i<cus.length;i++) {
	var my=this;
        //   var y = $("#TEMP_3").html(); 
	   
	    my.points.push([(my.timestamp-my.firsttimestamp)/1000,CO_graph]);

    
    
   
}
	
}
    
    
   
function updateInterface(){

    CUupdateInterface();
    
    for(var i = 0;i<cus.length;i++){
                    cus[i].update();
   
	var CO1 = parseFloat(document.getElementById("CO2_5").innerHTML);
	var CO3 = parseFloat(document.getElementById("CO2_16").innerHTML);
	var CO5 = parseFloat(document.getElementById("CO2_26").innerHTML);
	
	
	CO_avg = (CO1 + CO3 + CO5)/3;
	
	console.log("###########" + CO_avg);
	
	CO_graph.push(CO_avg);
	
	 var maxpoints = document.getElementById("powersupply-graph_"+i).getAttribute("maxpoints");
		    if(maxpoints!=null){
			cus[i].maxarray = maxpoints;
		    }     

		    if(cus[i].npoints>=cus[i].maxarray){
			cus[i].npoints = 0;
			
			cus[i].points[cus[i].npoints++] = cus[i].points[cus[i].maxarray-1];
			cus[i].points[cus[i].npoints++] = cus[i].points[cus[i].maxarray-2];

			cus[i].points.length=cus[i].npoints;

		    }  

		    
		    $.plot("#powersupply-graph_"+i,[cus[i].points]);
	
	
		  
}

