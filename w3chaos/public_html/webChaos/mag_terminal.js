var cus=[];       
function liberaDAQ(name) {
    CU.apply(this,arguments);
    this.trigger = 0;
    console.log("creating Libera DAQ:" + name);
  
    var x= document.getElementById("mySelect");
    var i = x.selectedIndex;
    document.getElementById("demo").innerHTML = x.options[i].text;
    
function updateInterface(){
	CUupdateInterface();
	for (var i=0; i<cus.length;i++) {
	    cus[i].update();
	  //  if (cus[i].mode&0x1) {
		document.getElementById("DD_"+i).value = "DataOnDemand";
		document.getElementById("DD_"+i).style.fontWeight = "bold";
	//	document.getElementById("trigger_"+ i).disabled = true;
	//	document.getElementById("campioni_"+i).title="Set samples";
			
	 //   }
	 //   if (cus[i].mode&0x2) {
		document.getElementById("SA_"+i).value = "SlowAcquisition";
		document.getElementById("SA_"+i).style.fontWeight = "normal";
	//	document.getElemendById("loop_"+i).title = "Set loops";
	//	document.getElementById("trigger_" + i).disabled = false;
	//    } 
	    
	    document.getElementById("DD_"+i).className="";
            document.getElementById("SA_"+i).className="";
	//    document.getElementById("trigger_" +i).className ="";
	    
	  /*   if((cus[i].Enable==0)){
                       document.getElementById("enable_"+i).className="active";
                    } */
		    
		    if((cus[i].Disable==0)){
                       document.getElementById("disable_"+i).className="active";
		       		document.getElementById("disable_"+i).style.fontWeight = "bold";

                    }
 
	 /*   if((cus[i].DD==0)){
                       document.getElementById("DD_"+i).className="active";
                    }
		    
		    if((cus[i].SA==0)){
                       document.getElementById("SA_"+i).className="active";
                    }*/
		    
	  /*  if((cus[i].trigger>0)){
                        document.getElementById("trigger_"+i).className="active";
                    }  */
	}
}
		
