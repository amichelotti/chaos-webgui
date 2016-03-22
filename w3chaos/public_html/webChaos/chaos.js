var initialized = "";
var timestamp = 0;
var firsttimestamp=0;
var points = new Array();
var onswitched=0;
var maxarray=600;
var npoints=0;
var refreshInterval=0;
var request_prefix = "http://localhost:8081/CU?dev="; 
var internal_param=new Array();
var excludeInterface=["oldtimestamp","dostate","firsttimestamp","ndk_uid","dev_state","dpck_ds_type","dpck_ats","updating"];
var updateAll=false;
///////


function sendAttr(vv) {
	var request = new XMLHttpRequest();

	console.log("device:" + this.id + " set attr:" + this.name + " param:" + this.value);
	request.open("GET",  request_prefix + this.name + "&attr="+ this.id + "&parm=" + this.value,true);
	request.send();

};


/////
function CU(name){
	this.name =name;
	this.dostate="updateall";

	this.timestamp=0;
	this.oldtimestamp=0;
	this.refresh = 0;
	this.seconds=0; // seconds of life of the interface
	this.dev_status="";
	this.error_status="";
	this.log_status="";

	this.firsttimestamp=0; // first time stamp of the interface
	console.log("creating CU:"+name);
	this.updating=0;
	this.buildtable=0;
	this.buildInterface = function (parm){
		buildtable=parm;
	}
	this.isbuildInterface = function(){
		return this.buildtable;
	}
	this.init=function (){
		var request = new XMLHttpRequest();

		//   request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name,true);
		request.open("GET", request_prefix + this.name + "&cmd=init",true);
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
		request.open("GET",  request_prefix + this.name + "&cmd=deinit",true);
		request.send();        
		this.dostate = "deinit";

	}
	this.start=function (){
		var request = new XMLHttpRequest();

		request.open("GET",  request_prefix + this.name + "&cmd=start",true);
		request.send(); 
		this.dostate = "start";


	};
	this.stop=function (){
		var request = new XMLHttpRequest();  
		request.open("GET",  request_prefix + this.name + "&cmd=stop",true);
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
		request.open("GET",  request_prefix + this.name + "&cmd="+ command + "&parm=" + parm,true);
		request.send();
	};

	this.sendAttr=function (vv) {
		var request = new XMLHttpRequest();

		console.log("device:" + this.name + " set attr:" + vv.currentTarget.name + " param:" + vv.currentTarget.value);
		request.open("GET",  request_prefix + this.name + "&attr="+ vv.currentTarget.name + "&parm=" + vv.currentTarget.value,true);
		request.send();
	};

	this.setSched=function (parm) {
		var request = new XMLHttpRequest();

		console.log("device:" + this.name + " set scheduling to:" + parm);
		request.open("GET", request_prefix + this.name + "&cmd=sched&parm=" + parm,true);
		request.send();
	};
	
	this.injectJson=function(json_answer){
		var my=this;
		try {
			var json = JSON.parse(json_answer);
		} catch (err){
			console.log("exception parsing \"" + json_answer + "\"");
			return;
		}
		var input=json.input;
		var output=json.output;
		for(var kk in output){
			if(kk== "dpck_ats"){
				json.output["timestamp"]=output[kk].$numberLong;
				json["timestamp"]=output[kk].$numberLong;
			}else if(output[kk] === 'object'){
				if(output[kk].name == "$numberLong"){
					json.output[kk]=output[kk].$numberLong;
				}
			}
		}
		for(var kk in input){
			if(kk== "dpck_ats"){
				json.input["timestamp"]=input[kk].$numberLong;
			} else if(input[kk] === 'object'){
				if(input[kk].name == "$numberLong"){
					json.input[kk]=input[kk].$numberLong;
				}
			}
		}
		
		Object.keys(json).forEach(function(key) {
			try {
				var val = json[key];
							
				
				if (key == "timestamp") {
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
					//console.log("call " + my.toString() + " process data :"+key+ " val:"+val);
					my[key]=val;
				}


			} catch(err) {
				// console.error(key + " does not exist:" + err);
			}
		});
		my.processData();
	}
	this.UpdateDataset=function(){
		var request = new XMLHttpRequest();
		var my=this;

		console.log("Update All dataset");
		request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1",true);
		request.send();
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				var json_answer = request.responseText;
			//	console.log("answer :\""+ json_answer+"\"");
				if (json_answer == "") {
					return ;
				}
				
				my.injectJson(json_answer);
				
				return;
			}
		}
		return ;
	};
	this.update=function (){
		var request = new XMLHttpRequest();
		var my=this;
		request.timeout =30000;
		if(my.updating == 1)
			return;
		// console.log("updating "+my.name + " run:" +dorun)
		if(my.dostate == "updateall" || (my.buildtable==1)){
			request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1",true);
			my.dostate="";
		} else if(my.dostate == my.dev_status  ){
			my.dostate = "";
			console.log("device "+my.name + " is in \""+my.dev_status+ " OK"); 
			if(updateAll){
				request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1",true);
			} else {
				request.open("GET", request_prefix + this.name + "&cmd=status",true);
			}

		} else if(my.dostate!="") { 
			console.log("device "+my.name + " is in \""+my.dev_status+ "\" I should go into \""+ my.dostate+"\""); 
			if(my.dostate == "init") {
				if(my.dev_status  == "start"){
					request.open("GET", request_prefix + this.name + "&cmd=start",true);
				} else if(my.dev_status  == "stop"){
					request.open("GET", request_prefix + this.name + "&cmd=deinit",true);

				} else{
					request.open("GET", request_prefix + this.name + "&cmd=init",true);


				}
			} else if(my.dostate == "start"){
				if(my.dev_status  == "deinit"){
					request.open("GET", request_prefix + this.name + "&cmd=init",true);

				} else {
					request.open("GET", request_prefix + this.name + "&cmd=start",true);

				}
			} else if(my.dostate == "stop"){
				if(my.dev_status  == "start"){
					request.open("GET", request_prefix + this.name + "&cmd=stop",true);

				} else {
					if(updateAll){
						request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1",true);
					} else {
						request.open("GET", request_prefix + this.name + "&cmd=status",true);
					}


				} /*else if(my.dev_status  != "") {
                   this.dostate ="";
                   alert("cannot STOP device "+ this.name + " is in state:"+my.dev_status );
               } else {
                    request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name,true);
               }*/
			} else if(my.dostate == "deinit"){
				if(my.dev_status  == "start"){
					request.open("GET", request_prefix + this.name + "&cmd=stop",true);

				} else {
					request.open("GET", request_prefix + this.name + "&cmd=deinit",true);

				}
			} else {

				request.open("GET", request_prefix + this.name + "&cmd=status",true);

			}

		} else {
			if(updateAll){
				request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1",true);
			} else {
				request.open("GET", request_prefix + this.name + "&cmd=status",true);
			}
		}
		request.ontimeout = function () { 
			//alert("Timed out!!!"); 
			console.log("TIMEOUT!!");
			my.updating = 0;
		}
		my.updating =1;
		request.send();
		request.onreadystatechange = function() {
			if (request.readyState == 4 && request.status == 200) {
				//       if(request.status==200) {{
				var json_answer = request.responseText;
				my.updating = 0;
//				console.log("answer this.dostate:" + my.dostate +" ("+my.name+"):\"" + json_answer+"\"");
				if (json_answer == "") {
					return;
				}
				my.injectJson(json_answer);
			}
		};  
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
	function updateInterface(){

	}
	function CULoad(classname,inter){
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
				//  var refreshFunc=classname + "Refresh";
				// refreshInterval=setInterval(refreshFunc,inter);



			} else {
				cu = new CU(cus_names[i]);
				console.log("Creating Generic CU name: "+cus_names[i]);

			}

			cu.update();
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
		if(classname!=null){
			refreshInterval=setInterval(updateInterface,inter);
		} else {
			refreshInterval=setInterval(CUupdateInterface,inter);
		}


	}

	function CUBuildInterface(){
		updateAll=true;
		for(var i=0;i<cus.length;i++){
			cus[i].buildtable=1;
			cus[i].UpdateDataset();
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
	function chaos_create_table(obj,instancen){
		console.log("create table for "+obj.name + " instance "+instancen);

		//var body=document.getElementsByTagName('body');
		var body=document.body;
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
		obj.buildtable=1;
		var input=obj.input;
		var output=obj.output;

		for (var key in output) {
			if(toExclude(key))
				continue;

			console.log("creating output \""+key+"\" val="+output[key]);

			
			if((typeof(output[key]) !== 'function') && ((typeof (output[key]) !== 'object') || Array.isArray(output[key]))){
				var tr=document.createElement('tr');
				var td=document.createElement('td');
				//var b=document.createElement('b');
				
				var text=document.createTextNode(key);
				text.class="Indicator-ok";
				td.appendChild(text);
				td.setAttribute('class',"Indicator-ok");
				
			/*	if(!isInternal(key)){
					td.style.fontStyle='bold';
					td.style.color='green';
					td.setAttribute('style', 'font-weight: bold; color: green; font-size:150%;');
				}*/
				tr.appendChild(td);
				td=document.createElement('td');
				td.setAttribute("id",key + "_"+instancen);
				td.setAttribute("class","Indicator-ok");
				if(Array.isArray(output[key])){
					// text=document.createTextNode("["+obj[key].length+"]");
					text=document.createTextNode("["+output[key]+"]");

					console.log("#########################:" + text);

				} else {
					text=document.createTextNode(output[key]);
				}
				td.appendChild(text);
				tr.appendChild(td);
				tbdy.appendChild(tr);

			}
		}
		for (var key in input) {
			if(toExclude(key))
				continue;

			console.log("creating input \""+key+"\" val="+input[key]);


			if((typeof(input[key]) !== 'function') && ((typeof (input[key]) !== 'object') || Array.isArray(input[key]))){
				var tr=document.createElement('tr');
				var td=document.createElement('td');
				//var b=document.createElement('b');
				var text=document.createTextNode(key);
				text.class="Control-ok";
				td.appendChild(text);
				td.setAttribute('class',"Control-ok");
				/*if(!isInternal(key)){
					td.style.fontStyle='bold';
					td.style.color='green';
					td.setAttribute('style', 'font-weight: bold; color: green; font-size:150%;');
				}*/
				tr.appendChild(td);
				// input
				td=document.createElement('td');
				var ctrl=document.createElement("input");
				ctrl.id=key + "_input_"+instancen;
				ctrl.setAttribute('class',"Control-ok");
				ctrl.name=key;
				//ctrl.addEventListener("change",sendAttr);
				ctrl.onchange=function(){obj.sendAttr(event);}
				td.appendChild(ctrl);

				tr.appendChild(td);
				
				// readout 
				td=document.createElement('td');
				td.setAttribute("id",key + "_readout_"+instancen);
				td.class="Indicator-ok";
				if(Array.isArray(output[key])){
					// text=document.createTextNode("["+obj[key].length+"]");
					text=document.createTextNode("["+input[key]+"]");

					console.log("#########################:" + text);

				} else {
					text=document.createTextNode(input[key]);
				}
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
			if(cus[i].buildtable==1){
				chaos_create_table(cus[i],i);
				cus[i].buildtable=0;
			}
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
				console.log("An internal error occurred on device \""+cu.name+"\":\""+cu.error_status+"\"");
				clearInterval(refreshInterval);
				alert(cu.error_status);
			}

			var input=cu.input;
			var output=cu.output;

			for (var key in output) {
				var docelem = key +"_"+i;
				if((typeof(output[key]) !== 'function') && ((typeof (output[key]) !== 'object') || Array.isArray(output[key]))){



					//  console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
					try {

						var digits = document.getElementById(docelem).getAttribute("digits");
						var base = document.getElementById(docelem).getAttribute("base");
						var number=output[key];
						if(digits!=null){
							number=Number(output[key]).toFixed(digits);			    
						} 

						if(base!=null){
							number=Number(output[key]).toString(base);
						} 
						document.getElementById(docelem).innerHTML=number;
						document.getElementById(docelem).style.color=color;
						document.getElementById(docelem).style.fontWeight =tick;
						if(Array.isArray(cu[key])){
							// text=document.createTextNode("["+obj[key].length+"]");
							text=document.createTextNode("["+output[key]+"]");
						}


					} catch(e){
						//  console.log("document element:" +docelem+ " not present in page:"+e); 
					}
				}
			}
			
			for (var key in input) {
				var docelem = key +"_readout_"+i;
				if((typeof(input[key]) !== 'function') && ((typeof (input[key]) !== 'object') || Array.isArray(input[key]))){



					//  console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
					try {

						var digits = document.getElementById(docelem).getAttribute("digits");
						var base = document.getElementById(docelem).getAttribute("base");
						var number=input[key];
						if(digits!=null){
							number=Number(input[key]).toFixed(digits);			    
						} 

						if(base!=null){
							number=Number(input[key]).toString(base);
						} 
						document.getElementById(docelem).innerHTML=number;
						document.getElementById(docelem).style.color=color;
						document.getElementById(docelem).style.fontWeight =tick;
						if(Array.isArray(cu[key])){
							// text=document.createTextNode("["+obj[key].length+"]");
							text=document.createTextNode("["+input[key]+"]");
						}


					} catch(e){
						//  console.log("document element:" +docelem+ " not present in page:"+e); 
					}
				}
			}
		}
	}


