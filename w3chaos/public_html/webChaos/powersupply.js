var maxarray=600;
var cus=[];
           
function PowerSupply(name){
    CU.apply(this,arguments);
    this.state=0; //on, stdby
   
    this.points = new Array();
    this.npoints=0;
    this.current=0;
    this.polarity=0;
    this.alarms=0;
    
    console.log("creating PowerSupply:"+name);
    
    this.setCurrent=function setCurrent(val){
        var curr = Number(val).toFixed(3);
       
        this.sendCommand("sett", "{\"sett_cur\":" + curr + "}");
    }
    this.setPolarity=function setPolarity(val){
        if(this.state&0x2){
            alert("Powersupply:"+this.name+ " you should be in standby to change polarity");
            return;
        }
        this.sendCommand("pola", "{\"pola_value\":" + val + "}");
    }
    this.powerSupplyToggle=function powerSupplyToggle(val) {
        if(val=="On"){
            if(this.current>1.0 || this.current<-1.0){
                alert("Powersupply:"+this.name+" current should at 0 to change to standby");
                return;
            }
            this.sendCommand("mode", "{\"mode_type\": 0 }");
        } else {
            this.sendCommand("mode", "{\"mode_type\": 1 }");
        }
    }
    this.powerSupplyClrAlarms=function powerSupplyClrAlarms(){
        this.sendCommand("rset","");
    }
    
    this.processData=function(key,value){
	var my=this;
	//	console.log("processing " + key + ":" + value); 
            if (key == "current") {
                            //var index = npoints%maxarray;
			    var curr = Number(value).toFixed(3);
			   
                            my.points.push([(my.timestamp-my.firsttimestamp)/1000,curr]);
                            
                            npoints++;
                            if(npoints>maxarray){
                                my.points.pop();
                            }
			    my.current=curr;
                            system.log("current:"+my.current);
			} else if(key == "polarity"){
                            my.polarity=value;
			} else if(key == "status_id"){
                            my.state = value;
                     } else if(key=="current_sp"){
                         my.current_sp = value;
                     } else if(key=="alarm"){
                         my.alarms = value;
                     } else {
                         ///
                     }
               
	    
	}
    } 
 


 
 function powerSupplyUpdateArrayInterface(){
                for(var i = 0;i<cus.length;i++){
                    cus[i].update();
                    console.log("updating \""+cus[i].name + " current:"+cus[i].current + " polarity:"+cus[i].polarity);
                    document.getElementById("readoutcurrent_"+i).innerHTML=cus[i].current;
                    document.getElementById("spcurrent_"+i).innerHTML=cus[i].current_sp;
                    document.getElementById("cuname_"+i).innerHTML=cus[i].name;
                    document.getElementById("timestamp_"+i).innerHTML=Number((cus[i].timestamp -cus[i].firsttimestamp))*1.0/1000;
                    document.getElementById("readoutalarms_"+i).innerHTML=cus[i].alarms;

                    if(cus[i].state&0x2){
                        document.getElementById("onstby_"+i).value="On";
                        document.getElementById("neg_"+i).disabled=true;
                        document.getElementById("pos_"+i).disabled=true;
                        document.getElementById("open_"+i).disabled=true;
                    }
                    if(cus[i].state&0x8){
                        document.getElementById("onstby_"+i).value="StandBy";
                        document.getElementById("neg_"+i).disabled=false;
                        document.getElementById("pos_"+i).disabled=false;
                        document.getElementById("open_"+i).disabled=false;
                    }
                    document.getElementById("open_"+i).className="";
                    document.getElementById("neg_"+i).className="";
                    document.getElementById("pos_"+i).className="";
                    if((cus[i].polarity>0)){
                        document.getElementById("pos_"+i).className="active";
                    }
                    if((cus[i].polarity<0)){
                       document.getElementById("neg_"+i).className="active";
                    }
                     if((cus[i].polarity==0)){
                       document.getElementById("open_"+i).className="active";
                    }
                    if((cus[i].timestamp!=cus[i].oldtimestamp)){
                        document.getElementById("cuname_"+i).style.color="green";
                    } else {
                        document.getElementById("cuname_"+i).style.color="red";
                    }
                    if(cus[i].alarms!=0){
                        document.getElementById("readoutalarms_"+i).style.color="red";
                    } else {
                         document.getElementById("readoutalarms_"+i).style.color="green";
                    }
                    $.plot("#powersupply-graph_"+i,[cus[i].points]);
                }
            }
    