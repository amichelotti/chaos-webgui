var initialized = "";
var timestamp = 0;
var firsttimestamp=0;
var points = new Array();
var onswitched=0;
var maxarray=600;
var npoints=0;


function CU(name){
    this.name =name;
    this.initialized=0;
    this.timestamp=0;
    this.oldtimestamp=0;
    this.seconds=0; // seconds of life of the interface

    this.firsttimestamp=0; // first time stamp of the interface
    console.log("creating CU:"+name);

    this.init=function (){
        var request = new XMLHttpRequest();
        
        request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name, true);
        request.send();        
	this.initialized=1;
        
        
    }
    
     this.run=function (){
        if(this.initialized==0){
            this.init();
        }
        this.start();
    }
    this.deinit=function (){
        var request = new XMLHttpRequest();
        request.open("GET", "/cgi-bin/cu.cgi?DeInitId=" + this.name, true);
        request.send();        
	this.initialized=0;
        
        
    }
    this.start=function (){
        var request = new XMLHttpRequest();
        
        request.open("GET", "/cgi-bin/cu.cgi?StartId=" + this.name, true);
        request.send();        
        
       
    };
    this.stop=function (){
        var request = new XMLHttpRequest();  
        request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name, true);
        request.send();                
       
    };
    // this function should be overloaded by the class object
    // if not it contain exactly what is pushed
    this.processData=function (key,value){
	//        console.log("ADDING:" + key + " :"+value);
        
        this[key]=value;
        
    };
    this.sendCommand=function (command, parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " command:" + command + " param:" + parm);
        request.open("GET", "/cgi-bin/cu.cgi?dev=" + this.name + "&cmd=" + command + "&param=" + parm, true);
        request.send();
    };
    
    
    this.update=function (){
       var request = new XMLHttpRequest();
       var my=this;
        request.open("GET", "/cgi-bin/cu.cgi?dev=" + this.name, true);
        request.send();
        
        request.onreadystatechange = function() {
	if (request.readyState == 4) {
	    var json_answer = request.responseText;
	    
	    console.log("answer ("+my.name+"):" + json_answer);
	    if (json_answer == "") {
		return;
	    }
	    try {
	    var json = JSON.parse(json_answer);
	    } catch (err){
		console.log("exception parsing " + json_answer);
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

		    if (key == "cs|csv|timestamp") {
			
			if(my.firsttimestamp==0){
                            my.firsttimestamp=val;
                        }
                         my.oldtimestamp=my.timestamp;
			my.timestamp = val;
			my.seconds =(val - my.firsttimestamp)/1000.0;
		    } else {
			//			console.log("call " + my.toString() + " process data :"+key+ " val:"+val);
                        my.processData(key,val);
                    }
                } catch(err) {
		    // console.error(key + " does not exist:" + err);
		}
	    });
	}
    } 
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
              cu  = new window[classname](cus_names[i]);
          } else {
              cu = new CU(cus_names[i]);
        }
          cus.push(cu);
          if(vars[0]==="init"){
              console.log("initializing "+cus_names[i]);
              cu.init();
          }
           if(vars[0]==="deinit"){
              console.log("deinitalizing "+cus_names[i]);
              cu.deinit();
          }
          if(vars[0]==="start"){
              console.log("start "+cus_names[i]);
              cu.start();
          }
          
          if(vars[0]==="stop"){
              console.log("stop "+cus_names[i]);
              cu.stop();
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
                    for (var key in cu) {
			var docelem = key +"_"+i;
			if((typeof(cu[key]) !== 'function') && (typeof (cu[key]) !== 'object')){
			    console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
			try {
                        document.getElementById(docelem).innerHTML=cu[key];
			} catch(e){
			    console.log("document element:" +docelem+ " not present in page:"+e); 
			}
			}
                }
            }
 }

 