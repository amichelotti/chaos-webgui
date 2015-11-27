//VARIABILI DI INIZIALIZZAZIONE

var initialized = "";
var timestamp = 0;
var firsttimestamp=0;
var points = new Array();
var onswitched=0;
var maxarray=600;
var npoints=0;
var refreshInterval=0;
var request_prefix = "http://chaost-webui1.chaos.lnf.infn.it:8081/CU?dev="; //"/cgi-bin/cu.cgi?" //CHIAMATA WAN PROXY
var internal_param=new Array();
var excludeInterface=["oldtimestamp","error_status","log_status","dostate","firsttimestamp","dpck_device_id","dev_status","dpck_ds_type","updating"];

function CU(name){
    this.name =name;
    this.dostate="init";
    
    this.timestamp=0;
    this.oldtimestamp=0;
    this.refresh = 0;
    this.seconds=0; // seconds of life of the interface
    this.dev_status="";
    this.error_status="";
    this.log_status="";
    this.date=""
    
    this.firsttimestamp=0; // first time stamp of the interface
    console.log("creating CU:"+name);
    this.updating=0;
    var buildtable=0;
    this.buildInterface = function (parm){
        buildtable=parm;
    }
    this.isbuildInterface = function(){
        return buildtable;
    }
    this.init=function (){    //LANCIO LA UI CON UN SET-POINT GI� IMPOSTATO
        var request = new XMLHttpRequest();
        
     //   request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name,true);
        request.open("GET", request_prefix + this.name + "&cmd=init",true);
        request.send();       //NON C'� LA STRINGA PERCHE' USIAMO IL METODO 'GET'
        this.dostate = "init";

        
    }
    
     this.run=function (){
        if(this.initialized==0){
            this.init();
        }
        
        this.start();
        this.dostate = "start";
    }
    this.deinit=function (){    //DEINIZIALIZZO LE VARIABILI
        var request = new XMLHttpRequest();
        request.open("GET",  request_prefix + this.name + "&cmd=deinit",true);
        request.send();        
        this.dostate = "deinit";
        
    }
    this.start=function (){    //INIZIALIZZO (IN REALTA' START=DEV)
        var request = new XMLHttpRequest();
        
        request.open("GET",  request_prefix + this.name + "&cmd=start",true);
        request.send(); 
        this.dostate = "start";

       
    };
    this.stop=function (){     //FERMO L'UPDATE DELLA UI
        var request = new XMLHttpRequest();  
        request.open("GET",  request_prefix + this.name + "&cmd=stop",true);
        request.send();
        this.dostate = "stop";
    };
    // this function should be overloaded by the class object
    // if not it contain exactly what is pushed
    this.processData=function (){     //E' RICHIAMATA IN ALTRI .JS PER LE SPECIFICHE FUNZIONI DEL DEVICE PROCESSATO
	
        
    };
    this.sendCommand=function (command, parm) {    // MANDO I COMANDI AL WAN PROXY
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " command:" + command + " param:" + parm);
        request.open("GET",  request_prefix + this.name + "&cmd="+ command + "&parm=" + parm,true);
        request.send();
    };
    
    this.sendAttr=function (name, val) {    
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set attr:" + name + " param:" + val);
        request.open("GET",  request_prefix + this.name + "&attr="+ command + "&parm=" + val,true);
        request.send();
    };
    
    this.setSched=function (parm) {	//MANDO IL SET DI PARAMETRI
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set scheduling to:" + parm);
        request.open("GET", request_prefix + this.name + "&cmd=sched&parm=" + parm,true);
        request.send();
    };
    this.update=function (){	// AGGIORNO L'INTERFACCIA
       var request = new XMLHttpRequest();
       var my=this;
       request.timeout =30000;
       if(my.updating == 1)
           return;
      // console.log("updating "+my.name + " run:" +dorun)
        if(my.dostate == my.dev_status  ){
            my.dostate = "";
            console.log("device "+my.name + " is in \""+my.dev_status+ " OK"); 

            request.open("GET", request_prefix + this.name + "&cmd=status",true);
            
        } else if(my.dostate!="") { 
           console.log("device "+my.name + " is in \""+my.dev_status+ "\" I should go into \""+ my.dostate+"\""); 

          if(my.dostate == "init") {
	      request.open("GET", request_prefix + this.name + "&cmd=init",true);
/*            if(my.dev_status  == "start"){
                request.open("GET", request_prefix + this.name + "&cmd=stop",true);
            } else if(my.dev_status  == "stop"){
                request.open("GET", request_prefix + this.name + "&cmd=deinit",true);

            } else{
                request.open("GET", request_prefix + this.name + "&cmd=init",true);
            }*/
          } else if(my.dostate == "start"){
	      request.open("GET", request_prefix + this.name + "&cmd=start",true);
              if(my.dev_status  == "deinit"){
                 request.open("GET", request_prefix + this.name + "&cmd=init",true);

              } else {
                 request.open("GET", request_prefix + this.name + "&cmd=start",true);

              }
          } else if(my.dostate == "stop"){
	      request.open("GET", request_prefix + this.name + "&cmd=stop",true);
               if(my.dev_status  == "start"){
                  request.open("GET", request_prefix + this.name + "&cmd=stop",true);

               } else if(my.dev_status  == "deinit"){
		   request.open("GET", request_prefix + this.name + "&cmd=init",true);
	       } else {
                  request.open("GET", request_prefix + this.name + "&cmd=status",true);
         
               } /*else if(my.dev_status  != "") {
                   this.dostate ="";
                   alert("cannot STOP device "+ this.name + " is in state:"+my.dev_status );
               } else {
                    request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name,true);
               }*/
          } else if(my.dostate == "deinit"){
	      request.open("GET", request_prefix + this.name + "&cmd=deinit",true);
              if(my.dev_status  == "start"){
                  request.open("GET", request_prefix + this.name + "&cmd=stop",true);

               } else {
                  request.open("GET", request_prefix + this.name + "&cmd=deinit",true);

               }
          } else {
              
            request.open("GET", request_prefix + this.name + "&cmd=status",true);

          }
         
        } else {
            request.open("GET", request_prefix + this.name + "&cmd=status",true);
        }
        request.ontimeout = function () { 	//SE NON RIESCE A CONNETTERSI ENTRO UN TEMPO PRESTABILITO
            //alert("Timed out!!!"); 
            console.log("TIMEOUT!!");
            my.updating = 0;
        }
        my.updating =1;
        request.send();
        request.onreadystatechange = function() {	// SI ATTIVA OGNI VOLTA CHE READYSTART CAMBIA
	if (request.readyState == 4 && request.status == 200) {  // LA RISPOSTA E' OK
 //       if(request.status==200) {{
	    var json_answer = request.responseText;	// PRENDI LA RISPOSTA COME STRINGA
	    my.updating = 0;
	    console.log("answer this.dostate:" + my.dostate +" ("+my.name+"):\"" + json_answer+"\"");
	    if (json_answer == "") {
		return;
	    }
	    try {
	    var json = JSON.parse(json_answer);	 // ANALIZZA LA STRINGA JSON
	    } catch (err){
		console.log("exception parsing " + err);
                return;
	    }
	    Object.keys(json).forEach(function(key) {	//RESTITUISCE UN ARRAY I CUI ELEMENTI SONO STRINGHE CORRISPONDENTI ALLE PROPRIETA''ENUMERABILI' TROVATE DIRETTAMENTE IN (JSON)
		try {
		    var val = json[key];
		    if (typeof(val) === 'object') {	// OGNI ALTRO OGGETTO CHE NON SIA STRINGA, NUMERO,BOOLEANO
			if (val.hasOwnProperty('$numberLong')) {
			    val = val['$numberLong'];	//64 BIT, FLOATING POINT NUMBER
			} else if (val.hasOwnProperty('$binary')) {
			   val = atob(val['$binary']);
			  //  val = btoa(val['$binary']); 

			   /* var num = "ABCD";
			     var foo = new Uint8Array(num,0,4);
			     console.debug(foo);
			     console.log("######" + foo[0] + "######"); */
			    
			    
			    //Prova bytearray
			   /* var valbuffer = new ArrayBuffer(16);
			    valbuffer = atob(val['$binary']); 
			    var ciccio = new Uint8Array(val);
			    console.log("######## " + ciccio[0] + " ########");
			    for (var i=0; i< ciccio.length; i++) {
				console.log("##################################################" + i + ":" + ciccio[i]);
			    } 
			    
			   /* val = atob(val['$binary']); */
			   
			   //prova paolo
			   /* var result = "";
			    for (var i = 0; i < val.length; i++) {
				result += String.fromCharCode(parseInt(val[i], 2));
			    }
			    
			    console.log("#### " + result + " ####"); */
			}
		    } 
		    
                    
		  //  console.log("processing:"+key+ " val:"+val);
                    if(key == "cs|csv|device_id"){	// NOME DEVICE
                        my.name = val;
                    } else if (key == "dpck_ts") {
			
			if(my.firsttimestamp==0){
                            my.firsttimestamp=val;
                        }
                        my.oldtimestamp=my.timestamp;
			my.timestamp = val;
			var t = new Number(val);
			var my_date=new Date(t);
			my.date=my_date.toString();	// CONVERTO OGGETTO DATE IN STRINGA
			my.seconds =(val - my.firsttimestamp)/1000.0;
                        if(my.oldtimestamp!=0){
                            my.refresh = (val - my.oldtimestamp)/1000.0;
                        }
		    } else {
			//			console.log("call " + my.toString() + " process data :"+key+ " val:"+val);
                        my[key]=val;
                    }
                    
                    
                } catch(err) {
		    // console.error(key + " does not exist:" + err);
		}
	    });
           my.processData(); 	// FUNZIONE RICHIAMATA DA UN ALTRO SCRIPT
	}
    } 
} 
}

 function addRow(tableID) {	// NON USATA
 
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
 
        function deleteRow(tableID) {	// NON USATA
            try {
            var table = document.getElementById(tableID);
            var rowCount = table.rows.length;
            table.deleteRow(rowCount);
        
            }catch(e) {
            }
        }
function updateInterface(){	// FUNZIONE RICHIAMATA DA UN ALTRO SCRIPT
    
}
function CULoad(classname,inter){	//CLASSNAME= ES. POWERAUPPLY; INTER = INTERVALLO// CARICA LA CU
     var query = window.location.search.substring(1);	// PRENDE LA URL
     var vars = query.split("=");	// SEPARA LA PARTE CON I NOME DEI SENSORI/DEVICE
     var cus_names=vars[1].split("&");	// PRENDE IL NOME DEI DEVICE/SENSORI (CUS_NAMES)
     if(vars==null || cus_names==null){
         alert("Please specify a valid powersupply in the URL ?<init|deinit|start|stop|run>=cu1_id&cu2_id");
         return;
     }
     for (var i=0;i<cus_names.length;i++) {
          var cu;
          if(classname!=null){	// CIOE' SE NON E' SPECIFICA DI UN ALTRO STRIPT (ES. POWERSUPPLY)
              console.log("Creating class:"+classname + " name: "+cus_names[i])
              cu  = new window[classname](cus_names[i]);
            //  var refreshFunc=classname + "Refresh";
             // refreshInterval=setInterval(refreshFunc,inter);
           


          } else {
              cu = new CU(cus_names[i]);	
              console.log("Creating Generic CU name: "+cus_names[i]);
             
        }
         

          cus.push(cu);	// DICHIARATO IN POWERSUPPLY.JS
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
     if(classname!=null){	// AGGIORNA
          refreshInterval=setInterval(updateInterface,inter);
     } else {
          refreshInterval=setInterval(CUupdateInterface,inter);
     }
     
    
}

function CUBuildInterface(){
 for(var i=0;i<cus.length;i++){
     cus[i].buildInterface(1);
      for (var key in cus[i]) {
        internal_param.push(key);
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
 
 function toExclude(parm){
     for(var x in excludeInterface){
         if(parm==excludeInterface[x])
             return 1;
     }
     return 0;
 }
 function isInternal(parm){
     for(var x in internal_param){
         if(parm==internal_param[x])
             return 1;
     }
     return 0;
 }
 function chaos_create_table(obj,instancen){	// CREA IN AUTOMATICO LA WEB INTERFACE
    var body=document.getElementsByTagName('body')[0];
    var tbl=document.createElement('table');
    var hr=document.createElement('hr');
    body.appendChild(hr);
    var h=document.createElement('h2');
    var text=document.createTextNode(obj.name);
    h.appendChild(text);
    body.appendChild(h);
    tbl.style.width='100%';
    tbl.setAttribute('border','1');
    tbl.setAttribute("id",obj.name + "_" +instancen);
    var tbdy=document.createElement('tbody');
    
    
    
    tbdy.appendChild(hr);
    for (var key in obj) {
            if(toExclude(key))
                continue;
            
            if((typeof(obj[key]) !== 'function') && (typeof (obj[key]) !== 'object')){
                var tr=document.createElement('tr');
                var td=document.createElement('td');
                //var b=document.createElement('b');
                text=document.createTextNode(key);
                td.appendChild(text);
                if(!isInternal(key)){
                    td.style.fontStyle='bold';
                    td.style.color='green';
                    td.setAttribute('style', 'font-weight: bold; color: green; font-size:150%;');
                }
                tr.appendChild(td);
                td=document.createElement('td');
                td.setAttribute("id",key + "_"+instancen);
                td.setAttribute("class","Indicator");
                text=document.createTextNode(obj[key]);
                td.appendChild(text);
                tr.appendChild(td);
                tbdy.appendChild(tr);
            }
    }
    tbl.appendChild(tbdy);
    body.appendChild(tbl);
        
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
                        if(cu.isbuildInterface()){
                            chaos_create_table(cu,i);
                            cu.buildInterface(0);
                        }
                    } else if(cu.dev_status=="stop"){
                        color="black";
                    } else if(cu.dev_status=="init"){
                        color="yellow";
                        if(cu.isbuildInterface()){
                            chaos_create_table(cu,i);
                            cu.buildInterface(0);
                        }
                    } else {
                        color="red";
                    }
                    
                    if(cu.error_status!=""){
                        color="red";
                        console.log("An internal error occurred on device \""+cu.name+"\":\""+cu.error_status+"\"");
                        clearInterval(refreshInterval);
                        alert(cu.error_status);
                    }
                  
                    for (var key in cu) {	//PRENDE TUTTE LE CHIAVI (ELEMENTI DELLA CU) 
			var docelem = key +"_"+i;	// LI IDENTIFICA SE TERMINANO CON '-' + NUMERO
			if((typeof(cu[key]) !== 'function') && (typeof (cu[key]) !== 'object')){
			  //  console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
			try {
                       
                        var digits = document.getElementById(docelem).getAttribute("digits");
                        if(digits!=null){
                            document.getElementById(docelem).innerHTML=Number(cu[key]).toFixed(digits);	// ASSEGNA MAX 3 CIFRE DOPO LA VIRGOLA
                          

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

 
