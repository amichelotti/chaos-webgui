var cus=[];       
function liberaDAQ(name) {
    CU.apply(this,arguments);
    this.trigger = 0;
    console.log("creating Libera DAQ:" + name);
  
  this.Disable= function Disable(val){
	if (val=="Disable") {
	this.sendCommand("acquire", "{ \"enable\":0 }");	    
	}
    } 
    
   /* this.powerDD=function powerDD(val) {
	if (val=="DataOnDemand") {
	            this.sendCommand("acquire", "{ \"enable\":1 ,\"mode\":1, \"samples\":1024,\"loops\":1, \"duration\":0}");
        } 
    }  */
    
  /*  this.powerSA=function powerSA(val) {
	if (val=="SlowAcquisition") {
		this.sendCommand("acquire", "{ \"enable\":1 ,\"mode\":2, \"samples\":1,\"loops\":1000, \"duration\":0}");
    } 
    } */
  
    this.powerDD = function powerDD(sam,loo){
	var samples = Number(sam);
	var loops = Number(loo);
	this.sendCommand("acquire", "{\"enable\":1, \"mode\":1, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}");
    }
    
     this.powerSA = function powerSA(sam, loo){
	var samples = Number(sam);
	var loops = Number(loo);
	this.sendCommand("acquire", "{\"enable\":1, \"mode\":2, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}");
    }
    
    this.pushTrigger = function pushTrigger(sam,loo){
	var samples = Number(sam);
	var loops = Number(loo);
	this.sendCommand("acquire", "{\"enable\":1, \"mode\":101, \"samples\": "+ samples +", \"loops\":"+ loops +", \"duration\":0}");
    }
    
    this.permanentDD = function permanentDD(sam){
	var samples = Number(sam);
	this.sendCommand("acquire", "{\"enable\":1, \"mode\":1, \"samples\": "+ samples +", \"loops\":-1, \"duration\":0}");
    }
    
     this.permanentSA = function permanentSA(sam){
	var samples = Number(sam);
	this.sendCommand("acquire", "{\"enable\":1, \"mode\":2, \"samples\": "+ samples +", \"loops\":-1, \"duration\":0}");
    }
}
    
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
		    
		    var state_mode = document.getElementById("MODE_0").value;
		    
		    if (state_mode=='0') {
			document.getElementById("disable_"+i).className="active";
		       	document.getElementById("disable_"+i).style.fontWeight = "bold";
		    } else if (state_mode=='1') {
			document.getElementById("DD_"+i).className="active";
		       	document.getElementById("DD_"+i).style.fontWeight = "bold";
		    } else if (state_mode=='2') {
			document.getElementById("SA_"+i).className="active";
		       	document.getElementById("SA_"+i).style.fontWeight = "bold";
		    } else if (state_mode=='101') {
			document.getElementById("trig_"+i).className="active";
		       	document.getElementById("trig_"+i).style.fontWeight = "bold";
		    }
		    
		    var state_loop = document.getElementById("ACQUISITION_0").value;
		    
		    if (state_mode=='1' & state_loop=='-1') {
			document.getElementById("permanentDD_"+i).className="active";
		       	document.getElementById("permanentDD_"+i).style.fontWeight = "bold";
		    } else if (state_mode=='2' & state_loop=='-1') {
			document.getElementById("permanentSA_"+i).className="active";
		       	document.getElementById("permanentSA_"+i).style.fontWeight = "bold";
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
		
