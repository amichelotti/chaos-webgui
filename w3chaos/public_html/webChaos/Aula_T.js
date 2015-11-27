var maxarray=100;
var cus=[];
           
function PowerSupply(name){
    CU.apply(this,arguments);
    
    
        console.log("creating PowerSupply@@@@@@@@@@@@@@@");

   
    this.points = new Array();    
    
    this.processData=function(){
	
	for(var i=0; i<cus.length;i++) {
	var my=this;
           var y = $("#TEMP_3").html();
	   
	    my.points.push([(my.timestamp-my.firsttimestamp)/1000,y]);

	}

    } 
    }

 function updateInterface(){
                CUupdateInterface();
               /* for(var i = 0;i<cus.length;i++){
                    cus[i].update();
                		    
		$.plot("#powersupply-graph_"+i,[cus[i].points]);

                } */
	       
                    cus[3].update();
                		    
		$.plot("#powersupply-graph_3",[cus[3].points]);

                
	       
            }
               