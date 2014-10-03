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
    
    this.processData=function(){
	var my=this;
         var curr = Number(my.current).toFixed(3);
         my.points.push([(my.timestamp-my.firsttimestamp)/1000,curr]);
        

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
           }
           if(bit&0x1){
               cell.innerHTML = "1 fusibili area";
           } else if(bit&0x2){
               cell.innerHTML = "2 sovracorrente AC ";
           } else if(bit&0x4){
               cell.innerHTML ="3 fusibili IGBT";
           } else if(bit&0x8){
               cell.innerHTML ="4 sovra temperatura IGBT";
           } else if(bit&0x10){
               cell.innerHTML ="5 sovra corrente DCLINK";
           } else if(bit&0x20){
               cell.innerHTML = "6 AirFlow ";
           } else if(bit&0x40){
               cell.innerHTML ="7 ---- ";
               
           } else if(bit&0x80){
               cell.innerHTML = "8 Sovra temperatura raddrizzatore ";
           } else if(bit>0){
               cell.innerHTML = a + " --- ";

           }
       } 
 }
 function updateInterface(){
                CUupdateInterface();
                for(var i = 0;i<cus.length;i++){
                    cus[i].update();
                    console.log("updating \""+cus[i].name + " current:"+cus[i].current + " polarity:"+cus[i].polarity);
                    var table_error = document.getElementById("error_list_"+i);
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
                    
                    if(cus[i].alarms!=0){
                        var alarm=cus[i].alarms
                       
                        decodeError(alarm,table_error);
                       
                        
                    } else {
                        table_error.innerHTML="";
                    }
                    $.plot("#powersupply-graph_"+i,[cus[i].points]);
                }
            }
               