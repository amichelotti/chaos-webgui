var maxarray=100;
var cus=[];
           
function PowerSupply(name){
    CU.apply(this,arguments);
   
    this.points = new Array();    
    console.log("creating PowerSupply:"+name);
    
    this.processData=function(){
	
	for(var i=0; i<cus.length;i++) {
	var my=this;
           var y = $("#PS_0").html();
	   
	    my.points.push([(my.timestamp-my.firsttimestamp)/1000,y]);

	}

    } 
    }

 function updateInterface(){
                CUupdateInterface();
                for(var i = 0;i<cus.length;i++){
                    cus[i].update();
                		    
		$.plot("#flotcontainer_"+i,[cus[i].points]);

                }
            }
               