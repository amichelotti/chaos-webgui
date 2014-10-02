var initialized = "";
var timestamp = 0;
var firsttimestamp=0;
var points = new Array();
var onswitched=0;
var maxarray=600;
var npoints=0;


function CU(name){
    this.name =name;
    this.dostate="";
    
    this.timestamp=0;
    this.oldtimestamp=0;
    this.refresh = 0;
    this.seconds=0; // seconds of life of the interface
    this.dev_status="";
    this.error_status="";
    this.log_status="";
    
    this.firsttimestamp=0; // first time stamp of the interface
    console.log("creating CU:"+name);

    this.init=function (){
        var request = new XMLHttpRequest();
        
        request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name, true);
        request.send();        
        this.dostate = "init";

        
    }
    
     this.run=function (){
        if(this.initialized==0){
            this.init();
        }
        
        this.start();
        this.dostate = "start";
    }
    this.deinit=function (){
        var request = new XMLHttpRequest();
        request.open("GET", "/cgi-bin/cu.cgi?DeInitId=" + this.name, true);
        request.send();        
        this.dostate = "deinit";
        
    }
    this.start=function (){
        var request = new XMLHttpRequest();
        
        request.open("GET", "/cgi-bin/cu.cgi?StartId=" + this.name, true);
        request.send(); 
        this.dostate = "start";

       
    };
    this.stop=function (){
        var request = new XMLHttpRequest();  
        request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name, true);
        request.send();
        this.dostate = "stop";
    };
    // this function should be overloaded by the class object
    // if not it contain exactly what is pushed
    this.processData=function (){
	
        
    };
    this.sendCommand=function (command, parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " command:" + command + " param:" + parm);
        request.open("GET", "/cgi-bin/cu.cgi?dev=" + this.name + "&cmd=" + command + "&param=" + parm, true);
        request.send();
    };
    
    this.setSched=function (parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set scheduling to:" + parm);
        request.open("GET", "/cgi-bin/cu.cgi?dev=" + this.name + "&sched=" + parm, true);
        request.send();
    };
    this.update=function (){
       var request = new XMLHttpRequest();
       var my=this;
       request.timeout =120000;
      // console.log("updating "+my.name + " run:" +dorun)
        if(my.dostate == my.dev_status  ){
            my.dostate = "";
            console.log("device "+my.name + " is in \""+my.dev_status+ " OK"); 

            request.open("GET", "/cgi-bin/cu.cgi?status=" + this.name, true);
            
        } else if(my.dostate!="") { 
           console.log("device "+my.name + " is in \""+my.dev_status+ "\" I should go into \""+ my.dostate+"\""); 

          if(my.dostate == "init") {
            if(my.dev_status  == "start"){
                request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name, true);
            } else if(my.dev_status  == "stop"){
                request.open("GET", "/cgi-bin/cu.cgi?DeinitId=" + this.name, true);
            } else{
                request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name, true);
            }
          } else if(my.dostate == "start"){
              if(my.dev_status  == "deinit"){
                  request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name, true);
              } else {
                 request.open("GET", "/cgi-bin/cu.cgi?StartId=" + this.name, true);
              }
          } else if(my.dostate == "stop"){
               if(my.dev_status  == "start"){
                    request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name, true);
               } else {
                                request.open("GET", "/cgi-bin/cu.cgi?status=" + this.name, true);

               } /*else if(my.dev_status  != "") {
                   this.dostate ="";
                   alert("cannot STOP device "+ this.name + " is in state:"+my.dev_status );
               } else {
                    request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name, true);
               }*/
          } else if(my.dostate == "deinit"){
              if(my.dev_status  == "start"){
                    request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name, true);
               } else {
                  request.open("GET", "/cgi-bin/cu.cgi?DeinitId=" + this.name, true);
               }
          } else {
             request.open("GET", "/cgi-bin/cu.cgi?status=" + this.name, true);

          }
         
        } else {
           request.open("GET", "/cgi-bin/cu.cgi?status=" + this.name, true);

        }
        request.ontimeout = function () { 
            //alert("Timed out!!!"); 
            console.log("TIMEOUT!!");
        }

        request.send();
        request.onreadystatechange = function() {
	if (request.readyState == 4 && request.status == 200) {
	    var json_answer = request.responseText;
	    
	    console.log("answer this.dostate:" + my.dostate +" ("+my.name+"):\"" + json_answer+"\"");
	    if (json_answer == "") {
		return;
	    }
	    try {
	    var json = JSON.parse(json_answer);
	    } catch (err){
		console.log("exception parsing " + json_answer);
                  
                  return;
	    }
	    Object.keys(json).forEach(function(key) {
		try {
		    var val = json[key];
		    if (typeof(val) === 'object') {
			if (val.hasOwnProperty('$numberLong')) {
			    val = val['$numberLong'];
			}
		    }
		  //  console.log("processing:"+key+ " val:"+val);
                    if(key == "cs|csv|device_id"){
                        my.name = val;
                    } else if (key == "cs|csv|timestamp") {
			
			if(my.firsttimestamp==0){
                            my.firsttimestamp=val;
                        }
                        my.oldtimestamp=my.timestamp;
			my.timestamp = val;
			my.seconds =(val - my.firsttimestamp)/1000.0;
                        if(my.oldtimestamp!=0){
                            my.refresh = (val - my.oldtimestamp)/1000.0;
                        }
		    } else {
			//			console.log("call " + my.toString() + " process data :"+key+ " val:"+val);
                        my[key]=val;
                    }
                    
                    if(my.error_status!=""){
                        console.log("An internal error occurred on device \""+my.name+"\":\""+my.error_status+"\"");
                    }
                } catch(err) {
		    // console.error(key + " does not exist:" + err);
		}
	    });
           my.processData();
	}
    } 
} 
}

 function addRow(tableID) {
 
            var table = document.getElementById(tableID);
 
            var rowCount = table.rows.length;
            var row = table.insertRow(rowCount);
            return row;
            
 /*
            var cell1 = row.insertCell(0);
            var element1 = document.createElement("input");
            element1.type = "checkbox";
            element1.name="chkbox[]";
            cell1.appendChild(element1);
 
            var cell2 = row.insertCell(1);
            cell2.innerHTML = rowCount + 1;
 
            var cell3 = row.insertCell(2);
            var element2 = document.createElement("input");
            element2.type = "text";
            element2.name = "txtbox[]";
            cell3.appendChild(element2);
 
 */
        }
 
        function deleteRow(tableID) {
            try {
            var table = document.getElementById(tableID);
            var rowCount = table.rows.length;
            table.deleteRow(rowCount);
        
            }catch(e) {
            }
        }
        
function CULoad(classname){
     var query = window.location.search.substring(1);
     var vars = query.split("=");
     var cus_names=vars[1].split("&");
     if(vars==null || cus_names==null){
         alert("Please specify a valid powersupply in the URL ?<init|deinit|start|stop|run>=cu1_id&cu2_id");
         return;
     }
     for (var i=0;i<cus_names.length;i++) {
          var cu;
          if(classname!=null){
              console.log("Creating class:"+classname + " name: "+cus_names[i])
              cu  = new window[classname](cus_names[i]);
          } else {
              cu = new CU(cus_names[i]);
            console.log("Creating Generic CU name: "+cus_names[i])

        }
          cus.push(cu);
          if(vars[0]==="init"){
              console.log("initializing "+cus_names[i]);
              cu.init();
          } else if(vars[0]==="deinit"){
              console.log("deinitalizing "+cus_names[i]);
              cu.deinit();
          } else if(vars[0]==="start"){
              console.log("start "+cus_names[i]);
              cu.start();
          } else if(vars[0]==="stop"){
              console.log("stop "+cus_names[i]);
              cu.stop();
          } else {
              console.log("run "+cus_names[i]);
              cu.run();
          }
     }
    
}
function initializeCU(cunames){
     for(var i=0;i<cunames.length;i++){
          var cu = new CU(cunames[i])
          cus.push(cu);
          console.log("initializing "+cunames[i]);
          cu.init();
          
     }
 }
 
function CUupdateInterface(){
                for(var i = 0;i<cus.length;i++){
                    cus[i].update();
		    var cu=cus[i];
                    var color="yellow";
                    var tick="normal";
                    if(cu.refresh != 0){
                        tick = "bold";
                    }
                    if(cu.dev_status=="start"){
                        color="green";
                    } else if(cu.dev_status=="stop"){
                        color="black";
                    } else if(cu.dev_status=="init"){
                        color="yellow";
                    } else {
                        color="red";
                    }
                    if(cu.error_status!=""){
                        color="red";
                    }
                    
                    for (var key in cu) {
			var docelem = key +"_"+i;
			if((typeof(cu[key]) !== 'function') && (typeof (cu[key]) !== 'object')){
			  //  console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
			try {
                       
                        var digits = document.getElementById(docelem).getAttribute("digits");
                        if(digits!=null){
                            document.getElementById(docelem).innerHTML=Number(cu[key]).toFixed(digits);
                          

                        } else {
                            document.getElementById(docelem).innerHTML=cu[key];

                        }
                        document.getElementById(docelem).style.color=color;
                        document.getElementById(docelem).style.fontWeight =tick;
                        
			} catch(e){
			  //  console.log("document element:" +docelem+ " not present in page:"+e); 
			}
			}
                }
            }
           
 }

 