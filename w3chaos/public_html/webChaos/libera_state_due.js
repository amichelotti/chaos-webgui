var cus=[];       
function liberaDAQ(name) {
    CU.apply(this,arguments);
    this.mode=0; //DD, SA
    this.trigger = 0;
    console.log("creating oooooLiberaDAQ:" + name);
    
   /* this.Enable= function Enable(val){
	if (val=="Enable") {
	    this.sendCommand("acquire", "{ \"enable\" : 1 }", "{\"mode\" : 2}", "{\"samples\" : 1}",
			     "{\"loops\" : 1000}", "{\"duration\" : 0}");
	    	    
	}
    }
    
    this.Disable= function Disable(val){
	if (val=="Disable") {
   this.sendCommand("acquire", "{ \"enable\" : 0 }", "{\"mode\" : 2}", "{\"samples\" : 1}",
			     "{\"loops\" : 1000}", "{\"duration\" : 0}");	    
	}
    } */
    
    this.powerSupplyDD=function powerSupplyDD(val) {
	if (val=="DataOnDemand") {
	            this.sendCommand("acquire", "{\"mode\" : 1}");
        } 
    }  
    
    this.powerSupplySA=function powerSupplySA(val) {
	if (val=="SlowAcquisition") {
	    this.sendCommand("acquire", "{\"mode\" : 2}");
    } 
    }
    
    /*
    this.dataondemand = function dataondemand(val){
	if (this.mode&0x1) {
	    var samples;
	    this.sendCommand("mode","{\"mode_dev\":" + samples +"}");
	}
    }
    this.pushTrigger = function pushTrigger(trigger) {
	if (this.mode&0x1) {
	    this.sendCommand("trigger","{\"send_trigger\":" + trigger +"}");
	}
    }
    this.slowacquisition = function slowacquisition(val) {
	if (this.mode&0x2) {
	    var loop;
	    this.sendCommand("loop","{\"send_loop\":" + loop +"}");
	}
    } */
}
    
function updateInterface(){
	CUupdateInterface();
	for (var i=0; i<cus.length;i++) {
	    cus[0].update();
	    if (cus[0].mode&0x1) {
		document.getElementById("DD_"+i).value = "DataOnDemand";
		document.getElementById("DD_"+i).style.fontWeight = "bold";
	//	document.getElementById("trigger_"+ i).disabled = true;
	//	document.getElementById("campioni_"+i).title="Set samples";
			
	    }
	 //   if (cus[i].mode&0x2) {
		document.getElementById("SA_"+i).value = "SlowAcquisition";
		document.getElementById("SA_"+i).style.fontWeight = "normal";
	//	document.getElemendById("loop_"+i).title = "Set loops";
	//	document.getElementById("trigger_" + i).disabled = false;
	//    } 
	    
	    document.getElementById("DD_"+i).className="";
            document.getElementById("SA_"+i).className="";
	//    document.getElementById("trigger_" +i).className ="";
 
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

		
