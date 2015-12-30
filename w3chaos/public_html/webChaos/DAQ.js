var cus=[];
           
function PowerSupply(name){
    CU.apply(this,arguments);
    
    console.log("creating PowerSupply:"+name);
    
       this.points = new Array();
    this.npoints=0;
    
        this.maxarray=60;


}
   
    
 
 function updateInterface(){

                CUupdateInterface();
		
		/*for(var i = 0;i<cus.length;i++){
                    cus[i].update(); */

			var ch0 = document.getElementById("ch30_2").innerHTML;
			var ch1 = document.getElementById("ch31_2").innerHTML;
			
			document.getElementById("ch_sub").innerHTML = ch1-ch0;
			
		
		   

	
                }
 //}
		
 
                  
		
	
               