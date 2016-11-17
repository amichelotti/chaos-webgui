var initialized = "";
var timestamp = 0;
var firsttimestamp = 0;
var points = new Array();
var onswitched = 0;
var maxarray = 600;
var npoints = 0;
var refreshInterval = 0;
//var request_prefix = "http://chaosdev-webui1.chaos.lnf.infn.it:8081/CU?dev="; 
var request_prefix = "http://" + location.host + ":8081/CU?dev=";
var internal_param = new Array();
var excludeInterface = ["oldtimestamp", "dostate", "firsttimestamp", "ndk_uid", "dpck_ds_type", "dpck_ats", "updating"];
var updateAll = false;
var defaultDigits = 3;
///////



/////
function CU(name) {
    this.name = name;
    this.dostate = "updateall";

    this.timestamp = 0;
    this.oldtimestamp = 0;
    this.refresh = 0;
    this.seconds = 0; // seconds of life of the interface
    this.dev_status = "";
    this.error_status = "";
    this.log_status = "";

    this.firsttimestamp = 0; // first time stamp of the interface
    console.log("creating CU:" + name);
    this.updating = 0;
    this.buildtable = 0;
    this.multibase = 0;
    this.buildInterface = function (parm) {
        buildtable = parm;
    }
    this.isbuildInterface = function () {
        return this.buildtable;
    }
    this.init = function () {
        var request = new XMLHttpRequest();

        //   request.open("GET", "/cgi-bin/cu.cgi?InitId=" + this.name,true);
        request.open("GET", request_prefix + this.name + "&cmd=init", true);
        request.send();
        this.dostate = "init";


    }

    this.run = function () {
        if (this.initialized == 0) {
            this.init();
        }

        this.start();
        this.dostate = "start";
    }
    this.deinit = function () {
        var request = new XMLHttpRequest();
        request.open("GET", request_prefix + this.name + "&cmd=deinit", true);
        request.send();
        this.dostate = "deinit";

    }
    this.start = function () {
        var request = new XMLHttpRequest();

        request.open("GET", request_prefix + this.name + "&cmd=start", true);
        request.send();
        this.dostate = "start";


    };
    this.stop = function () {
        var request = new XMLHttpRequest();
        request.open("GET", request_prefix + this.name + "&cmd=stop", true);
        request.send();
        this.dostate = "stop";
    };
    // this function should be overloaded by the class object
    // if not it contain exactly what is pushed
    this.processData = function () {


    };
    this.sendCommand = function (command, parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " command:" + command + " param:" + parm);
        request.open("GET", request_prefix + this.name + "&cmd=" + command + "&parm=" + parm, true);
        request.send();
    };

    this.sendAttr = function (vv) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set attr:" + vv.currentTarget.name + " param:" + vv.currentTarget.value);
        request.open("GET", request_prefix + this.name + "&cmd=attr" + "&parm={\"" + vv.currentTarget.name + "\": \"" + vv.currentTarget.value + "\"}", true);
        request.send();
    };
    this.sendEvent = function (vv) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " event:" + vv.currentTarget.name + " param:" + vv.currentTarget.value);
        request.open("GET", request_prefix + this.name + "&cmd=" + vv.currentTarget.name + "&parm=" + vv.currentTarget.value, true);
        request.send();
    };

    this.onFocus = function (vv) {

    };
    this.setSched = function (parm) {
        var request = new XMLHttpRequest();

        console.log("device:" + this.name + " set scheduling to:" + parm);
        request.open("GET", request_prefix + this.name + "&cmd=sched&parm=" + parm, true);
        request.send();
    };

    this.injectJson = function (json_answer) {
        var my = this;
        try {
            var json = JSON.parse(json_answer);
        } catch (err) {
            console.log("exception parsing \"" + json_answer + "\"");
            return;
        }
        var input = json.input;
        var output = json.output;
        for (var kk in output) {
            if (kk == "dpck_ats") {
                json.output["timestamp"] = output[kk].$numberLong;
                json["timestamp"] = output[kk].$numberLong;
            } else if (output[kk].hasOwnProperty("$numberLong")) {
                json.output[kk] = parseInt(output[kk].$numberLong);
            }

        }
        for (var kk in input) {
            if (kk == "dpck_ats") {
                json.input["timestamp"] = input[kk].$numberLong;
            } else if (input[kk].hasOwnProperty("$numberLong")) {
                json.input[kk] = parseInt(input[kk].$numberLong);
            }

        }

        Object.keys(json).forEach(function (key) {
            try {
                var val = json[key];


                if (key == "timestamp") {
                    if (my.firsttimestamp == 0) {
                        my.firsttimestamp = val;
                    }
                    my.oldtimestamp = my.timestamp;
                    my.timestamp = val;
                    my.seconds = (val - my.firsttimestamp) / 1000.0;
                    if (my.oldtimestamp != 0) {
                        my.refresh = (val - my.oldtimestamp) / 1000.0;
                    }
                } else {
                    //console.log("call " + my.toString() + " process data :"+key+ " val:"+val);
                    my[key] = val;
                }


            } catch (err) {
                // console.error(key + " does not exist:" + err);
            }
        });
        my.processData();
    }
    this.UpdateDataset = function () {
        var request = new XMLHttpRequest();
        var my = this;

        console.log("Update All dataset");
        request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1", true);
        request.send();
        request.onreadystatechange = function () {
            if (request.readyState == 4 && request.status == 200) {
                var json_answer = request.responseText;
                //	console.log("answer :\""+ json_answer+"\"");
                if (json_answer == "") {
                    return;
                }

                my.injectJson(json_answer);

                return;
            }
        }
        return;
    };
    this.update = function () {
        var request = new XMLHttpRequest();
        var my = this;
        request.timeout = 30000;
        if (my.updating == 1)
            return;
        // console.log("updating "+my.name + " run:" +dorun)
        if (my.dostate == "updateall" || (my.buildtable == 1)) {
            request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1", true);
            my.dostate = "";
        } else if (my.dostate == my.dev_status) {
            my.dostate = "";
            console.log("device " + my.name + " is in \"" + my.dev_status + " OK");
            if (updateAll) {
                request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1", true);
            } else {
                request.open("GET", request_prefix + this.name + "&cmd=status", true);
            }

        } else if (my.dostate != "") {
            console.log("device " + my.name + " is in \"" + my.dev_status + "\" I should go into \"" + my.dostate + "\"");
            if (my.dostate == "init") {
                if (my.dev_status == "start") {
                    request.open("GET", request_prefix + this.name + "&cmd=start", true);
                } else if (my.dev_status == "stop") {
                    request.open("GET", request_prefix + this.name + "&cmd=deinit", true);

                } else {
                    request.open("GET", request_prefix + this.name + "&cmd=init", true);


                }
            } else if (my.dostate == "start") {
                if (my.dev_status == "deinit") {
                    request.open("GET", request_prefix + this.name + "&cmd=init", true);

                } else {
                    request.open("GET", request_prefix + this.name + "&cmd=start", true);

                }
            } else if (my.dostate == "stop") {
                if (my.dev_status == "start") {
                    request.open("GET", request_prefix + this.name + "&cmd=stop", true);

                } else {
                    if (updateAll) {
                        request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1", true);
                    } else {
                        request.open("GET", request_prefix + this.name + "&cmd=status", true);
                    }


                } /*else if(my.dev_status  != "") {
                 this.dostate ="";
                 alert("cannot STOP device "+ this.name + " is in state:"+my.dev_status );
                 } else {
                 request.open("GET", "/cgi-bin/cu.cgi?StopId=" + this.name,true);
                 }*/
            } else if (my.dostate == "deinit") {
                if (my.dev_status == "start") {
                    request.open("GET", request_prefix + this.name + "&cmd=stop", true);

                } else {
                    request.open("GET", request_prefix + this.name + "&cmd=deinit", true);

                }
            } else {

                request.open("GET", request_prefix + this.name + "&cmd=status", true);

            }

        } else {
            if (updateAll) {
                request.open("GET", request_prefix + this.name + "&cmd=channel&parm=-1", true);
            } else {
                request.open("GET", request_prefix + this.name + "&cmd=status", true);
            }
        }
        request.ontimeout = function () {
            //alert("Timed out!!!"); 
            console.log("TIMEOUT!!");
            my.updating = 0;
        }
        my.updating = 1;
        request.send();
        request.onreadystatechange = function () {
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

    } catch (e) {
    }
}
function updateInterface() {

}
function CULoad(classname, inter) {
    var query = window.location.search.substring(1);
    var vars = query.split("=");
    var cus_names = vars[1].split("&");
    if (vars == null || cus_names == null) {
        alert("Please specify a valid powersupply in the URL ?<init|deinit|start|stop|run>=cu1_id&cu2_id");
        return;
    }
    for (var i = 0; i < cus_names.length; i++) {
        var cu;
        if (classname != null) {
            console.log("Creating class:" + classname + " name: " + cus_names[i])
            cu = new window[classname](cus_names[i]);
            //  var refreshFunc=classname + "Refresh";
            // refreshInterval=setInterval(refreshFunc,inter);



        } else {
            cu = new CU(cus_names[i]);
            console.log("Creating Generic CU name: " + cus_names[i]);

        }

        cu.update();
        cus.push(cu);

        if (vars[0] === "init") {
            console.log("initializing " + cus_names[i]);
            cu.init();
        } else if (vars[0] === "deinit") {
            console.log("deinitalizing " + cus_names[i]);
            cu.deinit();
        } else if (vars[0] === "start") {
            console.log("start " + cus_names[i]);
            cu.start();
        } else if (vars[0] === "stop") {
            console.log("stop " + cus_names[i]);
            cu.stop();
        } else {
            console.log("run " + cus_names[i]);
            cu.run();
        }
    }
    if (classname != null) {
        refreshInterval = setInterval(updateInterface, inter);
    } else {
        refreshInterval = setInterval(CUupdateInterface, inter);
    }


}

function CUBuildInterface() {
    updateAll = true;
    for (var i = 0; i < cus.length; i++) {
        cus[i].buildtable = 1;
        cus[i].multibase = 1;
        cus[i].UpdateDataset();
        for (var key in cus[i]) {
            internal_param.push(key);
        }
    }
}

function initializeCU(cunames) {
    for (var i = 0; i < cunames.length; i++) {
        var cu = new CU(cunames[i])
        cus.push(cu);
        console.log("initializing " + cunames[i]);
        cu.init();

    }
}

function toExclude(parm) {
    for (var x in excludeInterface) {
        if (parm == excludeInterface[x])
            return 1;
    }
    return 0;
}
function isInternal(parm) {
    for (var x in internal_param) {
        if (parm == internal_param[x])
            return 1;
    }
    return 0;
}

function build_indicator(indicator_name, output, instancen, tbdy) {

    var hdr = document.createElement('tr');
    var td = document.createElement('td');
    var text = document.createTextNode("###" + indicator_name + "###");
    td.setAttribute("class", "Indicator-header");
    td.appendChild(text);
    hdr.appendChild(td);
    var td = document.createElement('td');
    td.setAttribute("class", "Indicator-header");
    var text = document.createTextNode("### Value ###");
    td.appendChild(text);
    hdr.appendChild(td);

    tbdy.appendChild(hdr);

    for (var key in output) {
        if (toExclude(key))
            continue;

        if (output[key].hasOwnProperty("$numberLong")) {
            output[key] = output[key].$numberLong;
        }
        console.log("creating output \"" + key + "\" val=" + output[key]);


        if ((typeof (output[key]) !== 'function') && ((typeof (output[key]) !== 'object') || Array.isArray(output[key]))) {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            //var b=document.createElement('b');

            var text = document.createTextNode(key);
            text.class = "Indicator-ok";
            td.appendChild(text);
            td.setAttribute('class', "Indicator-ok");

            /*	if(!isInternal(key)){
             td.style.fontStyle='bold';
             td.style.color='green';
             td.setAttribute('style', 'font-weight: bold; color: green; font-size:150%;');
             }*/
            tr.appendChild(td);
            td = document.createElement('td');
            td.setAttribute("id", key + "_"+indicator_name+"_" + instancen);
            td.setAttribute("class", "Indicator-ok");
            if (Array.isArray(output[key])) {
                // text=document.createTextNode("["+obj[key].length+"]");
                text = document.createTextNode("[" + output[key] + "]");

                console.log("#########################:" + output[key]);

            } else {
                text = document.createTextNode(output[key]);
            }
            td.appendChild(text);
            tr.appendChild(td);
            tbdy.appendChild(tr);

        }
    }

}

function build_control(control_name, input, instancen, tbdy) {
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var text = document.createTextNode("###" + control_name + "###");
    td.setAttribute('class', "Control-header");
    td.appendChild(text);
    tr.appendChild(td);
    var td = document.createElement('td');
    var text = document.createTextNode("### Input Value ###");
    td.setAttribute('class', "Control-header");

    td.appendChild(text);
    tr.appendChild(td);
    var td = document.createElement('td');
    td.setAttribute('class', "Control-header");

    var text = document.createTextNode("### Reached Value ###");
    td.appendChild(text);
    tr.appendChild(td);
    tbdy.appendChild(tr);

    for (var key in input) {
        if (toExclude(key))
            continue;

        if (input[key].hasOwnProperty("$numberLong")) {
            input[key] = input[key].$numberLong;
        }
        console.log("creating input \"" + key + "\" val=" + input[key]);


        if ((typeof (input[key]) !== 'function') && ((typeof (input[key]) !== 'object') || Array.isArray(input[key]))) {
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            //var b=document.createElement('b');
            var text = document.createTextNode(key);
            text.class = "Control-ok";
            td.appendChild(text);
            td.setAttribute('class', "Control-ok");
            /*if(!isInternal(key)){
             td.style.fontStyle='bold';
             td.style.color='green';
             td.setAttribute('style', 'font-weight: bold; color: green; font-size:150%;');
             }*/
            tr.appendChild(td);
            // input
            td = document.createElement('td');
            var ctrl = document.createElement("input");
            ctrl.id = key + "_input_"+control_name+"_" + instancen;
            ctrl.setAttribute('class', "Control-ok");
            ctrl.name = key;
            //ctrl.addEventListener("change",sendAttr);
            ctrl.onkeyup = function () {
                if (event.which == 13)
                    obj.sendAttr(event);
            }
            td.appendChild(ctrl);

            tr.appendChild(td);

            // readout 
            td = document.createElement('td');
            td.setAttribute("id", key + "_readout_"+control_name+"_"+ instancen);
            td.class = "Indicator-ok";
            if (Array.isArray(input[key])) {
                // text=document.createTextNode("["+obj[key].length+"]");
                text = document.createTextNode("[" + input[key] + "]");

                console.log("#########################:" + text);

            } else {
                text = document.createTextNode(input[key]);
            }
            td.appendChild(text);
            tr.appendChild(td);
            tbdy.appendChild(tr);

        }
    }

}

function chaos_create_table(obj, instancen) {
    console.log("create table for " + obj.name + " instance " + instancen);

    //var body=document.getElementsByTagName('body');
    var body = document.body;
    var tbl = document.createElement('table');
    //var hr=document.createElement('hr');
    //	body.appendChild(hr);


    tbl.style.width = 'auto';
    tbl.setAttribute('border', '1');
    tbl.setAttribute("id", obj.name + "_" + instancen);
    var tbdy = document.createElement('tbody');


    //tbdy.appendChild(hr);
    obj.buildtable = 1;
    // name and status
    var tr = document.createElement('tr');
    var td = document.createElement('td');
    var h = document.createElement('h2');
    var text = document.createTextNode(obj.name);
    h.appendChild(text);
    td.appendChild(h);
    tr.appendChild(td);
    td = document.createElement('td');
    var div = document.createElement('div');
    //div.setAttribute("class","Indicator-ok");
    div.appendChild(document.createTextNode("status:"));

    td.appendChild(div);
    div = document.createElement('div');
    div.setAttribute("id", "dev_status" + "_" + instancen);
    div.setAttribute("class", "Indicator-ok");
    div.appendChild(document.createTextNode(obj.dev_state));


    td.appendChild(div);
    tr.appendChild(td);
    //error
    td = document.createElement('td');
    div = document.createElement('div');
    div.appendChild(document.createTextNode("error:"));
    td.appendChild(div);
    div = document.createElement('div');
    div.setAttribute("id", "error_status" + "_" + instancen);
    div.setAttribute("class", "Indicator-ok");
    div.appendChild(document.createTextNode(obj.error_status));
    td.appendChild(div);

    tr.appendChild(td);
    tbdy.appendChild(tr);
    // init,stop,deinit,start,clrexception
    tr = document.createElement('tr');
    cu_ctrl = ["start", "stop", "recover", "init", "deinit"];
    td = document.createElement('td');

    for (var b in cu_ctrl) {

        var ctrl = document.createElement("button");
        ctrl.id = cu_ctrl[b] + "_input_" + instancen;
        ctrl.setAttribute('class', "Control-ok");
        ctrl.name = cu_ctrl[b];
        ctrl.type = 'button';
        ctrl.appendChild(document.createTextNode(cu_ctrl[b]));

        //ctrl.addEventListener("change",sendAttr);
        ctrl.onclick = function () {
            obj.sendEvent(event);
        }
        ctrl.onfocus = function () {
            obj.onFocus(event);
        }
        td.appendChild(ctrl);
    }
    tr.appendChild(td);

    td = document.createElement('td');
    td.appendChild(document.createTextNode("sched:"));
    tr.appendChild(td);
    ctrl = document.createElement("input");
    ctrl.id = obj.name + "_sched_input_" + instancen;
    ctrl.setAttribute('class', "Control-ok");
    ctrl.name = "sched";
    //ctrl.addEventListener("change",sendAttr);
    ctrl.onkeyup = function () {
        if (event.which == 13)
            obj.sendEvent(event);
    }
    td.appendChild(ctrl);

    tr.appendChild(td);

    tbdy.appendChild(tr);

    var input = obj.input;
    var output = obj.output;
    var alarm = obj.alarms;
    var health = obj.health;
    build_indicator("output", output, instancen, tbdy);
    build_control("input", input, instancen, tbdy);
    build_indicator("alarms", alarm, instancen, tbdy);
    build_indicator("health", health, instancen, tbdy);


    tbl.appendChild(tbdy);
    body.appendChild(tbl);

}


function isInt(n) {
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}


function formatValue(key,value,base,digits) {
    var isarray = Array.isArray(value);
      var number = value;
        var sout = value;
    if ((typeof (value) !== 'function') && ((typeof (value) !== 'object') || isarray)) {

      
   
        //  console.log("SETTING [" +typeof(cu[key])+"]" + docelem+ " to:"+cu[key]);
            if (key === "timestamp") {
                if (true) {
                    var d = new Date(Number(value));
                    sout = value + "(" + d.toLocaleString() + ")";
                } else {
                    sout = value;
                }
            } else {
              
                if (base != null) {
                    number = Number(value).toString(base);
                   
                } else if (digits != null) {
                    number = Number(value).toFixed(digits);
                } else if ((isInt(value) == false) && !isarray) {
                    number = Number(value).toFixed(defaultDigits);
                } else {
                    
                }

              

                if (isInt(number)) {
                    sout = number + "(0x" + Number(value).toString(16) + ")";
                } else {
                    sout = number;
                }

                
            }
            return sout;
         
    }

}
function updateControl(control_name,input, index, color, tick) {
    var docelem;
    for (var key in input) {
      docelem = key + "_readout_"+control_name+"_" + index;
      var digits=null;
      var base=null;
      if(toExclude(key))
          continue;
      try{
        digits = document.getElementById(docelem).getAttribute("digits");
        base = document.getElementById(docelem).getAttribute("base");
    } catch(e){
        
    }
     try {
      

      var sout=formatValue(key,input[key],base,digits);

        
        document.getElementById(docelem).innerHTML = sout;
        document.getElementById(docelem).style.color = color;
        document.getElementById(docelem).style.fontWeight = tick;
       // if (isarray) {
         //           // text=document.createTextNode("["+obj[key].length+"]");
          //          text = document.createTextNode("[" + input[key] + "]");
            //    }


            } catch (e) {
                console.log("document control element:" + docelem + " not present in page:" + e);
            }
        }
    }



function updateIndicator(indicator_name,output, index, color, tick) {
     var docelem;
    for (var key in output) {
         if(toExclude(key))
          continue;
        docelem = key +"_"+indicator_name+"_" + index;
      var digits=null;
      var base=null;
      try{
        digits = document.getElementById(docelem).getAttribute("digits");
        base = document.getElementById(docelem).getAttribute("base");
    } catch(e){
        
    }
      try {
           

         var sout=formatValue(key,output[key],base,digits);

        
        document.getElementById(docelem).innerHTML = sout;
        document.getElementById(docelem).style.color = color;
        document.getElementById(docelem).style.fontWeight = tick;
       // if (isarray) {
         //           // text=document.createTextNode("["+obj[key].length+"]");
          //          text = document.createTextNode("[" + input[key] + "]");
            //    }


            } catch (e) {
                console.log("document indicator element:" + docelem + " not present in page:" + e);
            }
        }
    }

function CUupdateInterface() {

    for (var i = 0; i < cus.length; i++) {
        if (cus[i].buildtable == 1) {
            chaos_create_table(cus[i], i);
            cus[i].buildtable = 0;
        }
        cus[i].update();
        var cu = cus[i];
        var color = "yellow";
        var tick = "normal";
        if (cu.refresh != 0) {
            tick = "bold";
        }
        if (cu.dev_status == "start") {
            color = "green";

        } else if (cu.dev_status == "stop") {
            color = "black";
        } else if (cu.dev_status == "init") {
            color = "yellow";

        } else {
            color = "red";
        }

        if (cu.error_status != "") {
            color = "red";
            console.log("An internal error occurred on device \"" + cu.name + "\":\"" + cu.error_status + "\"");
            clearInterval(refreshInterval);
            alert(cu.error_status);
        }

        var input = cu.input;
        var output = cu.output;
        var alarms = cu.alarms;
        var health = cu.health;
        if (document.getElementById("dev_status_" + i) != null) {
            document.getElementById("dev_status_" + i).innerHTML = cu.dev_status;
        }
        if (document.getElementById("error_status_" + i) != null) {
            document.getElementById("error_status_" + i).innerHTML = cu.error_status;
        }
        updateIndicator("output",output, i, color, tick);
        updateIndicator("alarms",alarms, i, color, tick);
        updateIndicator("healt",health, i, color, tick);
        updateControl("input",input, i, color, tick);


    }
}


