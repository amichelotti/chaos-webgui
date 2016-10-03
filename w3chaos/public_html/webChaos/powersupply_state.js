var cus=[];
           
function PowerSupply(name){
    CU.apply(this,arguments);
    this.state=0; //on, stdby
    this.points = new Array();
    this.npoints=0;
    this.current=0;
    this.polarity=0;
    this.alarms=0;
    this.maxarray=60;
    this.data = new Date();
    console.log("creating PowerSupply:"+name);
    this.setCurrent=function setCurrent(val){
        var curr = Number(val).toFixed(3);
       
        this.sendCommand("sett", "{\"sett_cur\":" + curr + "}");
    }
    this.setSlope=function setSlope(val,val1){
        var curr = Number(val).toFixed(3);
        var curr1 = Number(val1).toFixed(3);
       
        this.sendCommand("sslp", "{\"sslp_up\":" + curr + ",\"sslp_down\":"+curr1 +"}");
    }
    this.setPolarity=function setPolarity(val){
        if(this.state&0x2){
	            //if(this.state&0x2){

            alert("Powersupply:"+this.name+ " you should be in standby to change polarity");
            return;
        }
        this.sendCommand("pola", "{\"pola_value\":" + val + "}");
    }
    
   this.powerSupplyToggle=function powerSupplyToggle(val) {
        if(val=="On"){
            if(this.current>2.0 || this.current<-2.0){
                alert("Powersupply:"+this.name+" current should at 0 to change to standby");
                return;
            }
            this.sendCommand("mode", "{\"mode_type\": 0 }");
        } else {
            this.sendCommand("mode", "{\"mode_type\": 1 }");
        }
    } 
     
    this.powerSupplyOff=function powerSupplyOff(val) {
	if (val=="StandBy") {
	
            if(this.current>2.0 || this.current<-2.0){
                alert("Powersupply:"+this.name+" current should at 0 to change to standby");
                return;
            }
            this.sendCommand("mode", "{\"mode_type\": 0 }");
        } 
    }  
    
    this.powerSupplyOn=function powerSupplyOn(val) {
	if (val=="On") {

            this.sendCommand("mode", "{\"mode_type\": 1 }");
    
    } 
    }  
    
    this.powerSupplyClrAlarms=function powerSupplyClrAlarms(){
        this.sendCommand("rset","");
    }
    
    this.processData=function(){
	var my=this;
         var curr = Number(my.current).toFixed(3);

	my.data.setTime(my.timestamp);
	if(my.polarity<0)
	    curr = -curr;
        my.points[my.npoints++]=([(my.timestamp-my.firsttimestamp)/1000,curr]);
	//var str=my.data.getHours()+":" + my.data.getMinutes() + ":"+ my.data.getSeconds();
        //my.points.push([str,curr]);

    } 
    }


 function decodeError(alarm, table){
     table.innerHTML = "";
     var rows=0;
       for(var a=0;a<32;a++){
           var bit = alarm & (1<<a);
           var row,cell;
           if(bit){
               row = table.insertRow(rows++);
               cell = row.insertCell(0);
	       cell.innerHTML = "- "+ decodeAlarm(bit)
           }
	   
       } 
 }

function decodeAlarm(alarm){
    var desc="";
                       
    //    decodeError(alarm,table_error);
    switch (alarm){
    case 1:
	return "door open";
    case 2:
	return "over temperature";

    case 0x4:
	return "fuse fault";
    case 0x8:
	return "earth fault";
    case 0x10:
	return "over voltage";
    case 0x20:
	return "over current";
    case 0x40:
	return "communication failure";
    case 0x80:
	return "main unit fault";
    case 0x100:
	return "external interlock";
    case 0x200:
	return "set point card fault";
    case 0x400:
	return "cubicle fault";
	
    case 0x800:
	return "DCCT OVT";
    case 0x1000:
	return "DCCT FAULT";
    case 0x2000:
	return "active filter fuse";
    case 0x4000:
	return "active filter fuse OVT";
    case 0x8000:
	return "diode OVT";
    case 0x10000:
	return "diode fault";
    case 0x20000:
	return "AC issue";
    case 0x40000:
	return "phase loss";
    case 0x80000:
	return "air flow";
    case 0x100000:
	return "transformer OVT";

    case 0x200000:
	return "snubber fuse";
    case 0x400000:
	return "SCR fuse";
    case 0x800000:
	return "SCR OVT";
    case 0x1000000:
	return "choke OVT";
    case 0x2000000:
	return "pass filter";
    case 0x4000000:
    default:
	return "undefined";
    }

}

 function updateInterface(){
                CUupdateInterface();
                for(var i = 0;i<cus.length;i++){
                    cus[i].update();
		    //                    console.log("updating \""+cus[i].name + " current:"+cus[i].current + " polarity:"+cus[i].polarity);
                    var table_error = document.getElementById("error_list_"+i);

                    if(cus[i].status_id&0x2){
                //     document.getElementById("onstby_"+i).value="On";
	        //	document.getElementById("onstby_"+i).title="Press to switch in StandBy";
                //        document.getElementById("onstby_"+i).style.fontWeight="bold";
		    
		        document.getElementById("on_"+i).value="On";
		    	document.getElementById("on_"+i).title="Press to change in ON"; 
                        document.getElementById("on_"+i).style.fontWeight="bold";
                    //    document.getElementById("stby_"+i).disabled=false;

                        document.getElementById("neg_"+i).disabled=true;
                        document.getElementById("pos_"+i).disabled=true;
                        document.getElementById("open_"+i).disabled=true;
			document.getElementById("neg_"+i).title="Disabled, you must be in standby to change";
			document.getElementById("pos_"+i).title="Disabled, you must be in standby to change";
			document.getElementById("open_"+i).title="Disabled, you must be in standby to change";
			document.getElementById("setcurrent_"+i).title="Set the current";
                    } 
                    if(cus[i].status_id&0x8){
		//	document.getElementById("onstby_"+i).value="StandBy";
		//	document.getElementById("onstby_"+i).title="Press to switch in ON";
                  //      document.getElementById("onstby_"+i).style.fontWeight="normal";
			
			document.getElementById("stby_"+i).value="StandBy";
			document.getElementById("stby_"+i).title="Press to change in STANDBY"; 
                     //   document.getElementById("on_"+i).disabled=false;

                        document.getElementById("stby_"+i).style.fontWeight="normal";
                        document.getElementById("neg_"+i).disabled=false;
                        document.getElementById("pos_"+i).disabled=false;
                        document.getElementById("open_"+i).disabled=false;
			document.getElementById("neg_"+i).title="Press to change to Polarity to NEGATIVE";
			document.getElementById("pos_"+i).title="Press to change to Polarity to POSITIVE";
			document.getElementById("open_"+i).title="Press to change to OPEN";
			document.getElementById("setcurrent_"+i).title="Set the current, will be applied in ON";
		    }
                    document.getElementById("open_"+i).className="";
                    document.getElementById("neg_"+i).className="";
                    document.getElementById("pos_"+i).className="";

		    document.getElementById("on_"+i).className="";
                    document.getElementById("stby_"+i).className="";
		    
		  //  document.getElementById("onstby_"+i).className="";




                    if((cus[i].polarity>0)){
                        document.getElementById("pos_"+i).className="active";
                    }
                    if((cus[i].polarity<0)){
                       document.getElementById("neg_"+i).className="active";
                    }
                     if((cus[i].polarity==0)){
                       document.getElementById("open_"+i).className="active";
                    }
		    
		    if((cus[i].stby==0)){
                       document.getElementById("on_"+i).className="active";
                    }
		    
		    if((cus[i].on==0)){
                       document.getElementById("stby_"+i).className="active";
                    }
		    
		    
                    
                    if(cus[i].alarms!=0){
                        var alarm=cus[i].alarms;
			document.getElementById("alarms_"+i).style.color="red";
			decodeError(alarm, table_error);
                    } else {
                        table_error.innerHTML="";
                    }
		    //		    console.log("data:" + cus[i].data);
		    var maxpoints = document.getElementById("powersupply-graph_"+i).getAttribute("maxpoints");
		    if(maxpoints!=null){
			cus[i].maxarray = maxpoints;
		    }     

		    if(cus[i].npoints>=cus[i].maxarray){
			cus[i].npoints = 0;
			
			cus[i].points[cus[i].npoints++] = cus[i].points[cus[i].maxarray-1];
			cus[i].points[cus[i].npoints++] = cus[i].points[cus[i].maxarray-2];

			cus[i].points.length=cus[i].npoints;

			//$("#powersupply-graph_"+i).empty();
		    }

		    
		    $.plot("#powersupply-graph_"+i,[cus[i].points]);
		  //  document.getElementById("data_"+i).innerHTML=cus[i].data;
		     
                    
                }
            }
	
	
               
