/*
 * MONITORING CU (STATUS,ALARM)
 */

var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in mag_command.js
var cu_selected = "";
var refresh_time = [];
var old_time = [];
var timestamp_never_called = true;
var refresh_values_never_called = true;
var ok_cu = [];
var n; //numero delle righe (ovvero degli elementi in tabella); così applicando il dataset l'id delle righe aumenta
var cu_cache={};
var row_2_cu=[];
var row_2_cuid=[];
var selected_device; // 

$(document).ready(function () {
    var cu = [];
    var zones = [];

    //Funzione per riempire le select(quella delle zone, e quella degli alimentatori)
    function element_sel(field, arr, add_all) {
        $(field).empty();
        $(field).append("<option>--Select--</option>");
        //$(field).append("<option value='ALL'>ALL</option>");

        if (add_all == 1) {
            $(field).append("<option value='ALL'>ALL</option>");

        }
        $(arr).each(function (i) {
            $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");

        });

    }
    //Function to convert second in h/m/s
    function toHHMMSS(sec_num) {

       // var sec_num = parseInt(this, 10); // don't forget the second param	
        var days = Math.floor(sec_num / 86400);
        var hours = Math.floor((sec_num - (days * 86400)) / 3600);
        var minutes = Math.floor((sec_num - (days * 86400) - (hours * 3600)) / 60);
        var seconds = sec_num - (days * 86400) - (hours * 3600) - (minutes * 60);

        if (days < 10) {
            days = "0" + days;
        }
        if (hours < 10) {
            hours = "0" + hours;
        }
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }

        return days + ' days ' + hours + ':' + minutes + ':' + seconds;
    }



    //Funzione per controllare che il timestamp di ogni singolo magnete si stia aggiornando
    function checkTimestamp() {
        setInterval(function () {
            for (var i = 0; i < refresh_time.length; i++) {
                if (refresh_time[i] != old_time[i]) {
                    $("#name_element_" + i).css('color', 'green');
                    old_time[i] = refresh_time[i];
                } else {
                    $("#name_element_" + i).css('color', 'red');
                }
            }
        }, 10000);  /*** il setInterval è impostato a 6 secondi perché non può essere minore delq refresh cu ***/
    }
    function encodeName(str){
        var tt=str.replace(/\//g,"_");
        return tt;
    }
    //Funzione per comporre la griglia della tabella dei magneti
    function add_element(arr) {
        $("#main_table_cu").find("tr:gt(0)").remove();
        $(arr).each(function (i) {
            var cuname=encodeName(arr[i]);
            row_2_cu[i]=arr[i];
            row_2_cuid[i]=cuname;
            $("#main_table_cu").append("<tr class='row_element' id='tr_element_" + i + "'><td class='name_element' id='name_element_" + cuname + "'>" + arr[i]
                    + "</td><td id='status-" + cuname + "'></td><td id='td_busy_" + cuname + "'><td id='td_bypass_" + cuname + "'></td><td id='timestamp_" +cuname
                    + "'></td><td id='uptime_" + cuname + "'></td><td id='systemtime_" + cuname + "'></td><td id='usertime_" + cuname
                    + "'></td><td id='command_" + cuname + "'></td><td id='dev_alarm_" + cuname + "'></td><td id='cu_alarm_" + cuname + "'></td><td id='prate_" + cuname + "'></td></tr>")
        });

        //$("#main_table_cu").DataTable();

        n = $('#main_table_cu tr').size();
        if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
            $("#table-scroll").css('height', '280px');
        } else {
            $("#table-scroll").css('height', '');
        }
    }

    function updateChannel() {
	
	//console.log("tot cu " + ok_cu.length );
	
	/*if (ok_cu.length > 10) {
	    
	    
    } */
    function show_fatal_error(id) {
        var id_fatal_error = id.split("-")[1];
        //var name_cu_fe = $("#name_element_" + id_fatal_error).text();
        selected_device = cu_cache[id_fatal_error];
        
        decodeFatalError(cu_cache[id_fatal_error].health.ndk_uid,cu_cache[id_fatal_error].health.nh_status,cu_cache[id_fatal_error].health.nh_lem,cu_cache[id_fatal_error].health.nh_led);    
    }
    
    function decodeFatalError(nameCu,status_msg,FEmessagge,domMessage) {
        $("#name-FE-device").html(nameCu);
        $("#status_message").html(status_msg);
    
        $("#error_message").html(FEmessagge);
        $("#error_domain").html(domMessage);
    
        
    }
    
        jchaos.getChannel(ok_cu, -1, function (cu) {

            try {  // try
                cu.forEach(function (el) {  // cu forEach
                    var name_device_db,name_id;
                    var status;
                    if (el.hasOwnProperty('health')) {   //if el health
                        name_device_db=el.health.ndk_uid;
                        name_id=encodeName(name_device_db);
                        el.systTime = Number(el.health.nh_st).toFixed(3);
                        el.usrTime = Number(el.health.nh_ut).toFixed(3);
                        el.tmStamp = Number(el.health.dpck_ats) / 1000;

                        el.tmUtm = toHHMMSS(el.health.nh_upt);
                        status=el.health.nh_status;
                        cu_cache[name_id]=el;
                        $("#uptime_" + name_id).html(el.tmUtm);
                        $("#timestamp_" + name_id).html(new Date(1000 * el.tmStamp).toUTCString());
                        $("#usertime_" + name_id).html( el.usrTime);
                        $("#systemtime_" + name_id).html(el.systTime);
                        $("#prate_" + name_id).html(Number(el.health.cuh_dso_prate).toFixed(3));
                    //    colm_fl_state[name_id]=status;
                    //    fat_err[name_id]=el.health.nh_lem;
                   //     dom_err[name_id]=el.health.nh_led;
                        if (status == 'Start' || status ==  'start') {
                            $("#status-" + name_id).html('<i class="material-icons verde">play_arrow</i>');
                        } if (status == 'Stop' || status == 'stop') {
                            $("#status-" + name_id).html('<i class="material-icons arancione">stop</i>');
                        }  if (status == 'Init' || status == 'init') {
                            $("#status-" + name_id).html('<i class="material-icons giallo">trending_up</i>');
                        }if (status == 'Deinit' || status == 'deinit') {
                            $("#status-" + name_id).html('<i class="material-icons rosso">trending_down</i>');
                        } if (status == 'Fatal Error' || status == 'fatal error') {
                            //$("#status_" + name_id).html('<a id="fatalError_' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" onclick="return show_fatal_error(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
                            $("#status-" + name_id).html('<a id="fatalError-' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" ><i style="cursor:pointer;" class="material-icons rosso">cancel</i></a>');
                            $("fatalError_" + name_id).on("click",function(){
                                show_fatal_error(this.id)});
                        }  else if (status == 'Recoverable Error' || status == 'recoverable error') {
                           // $("#status_" + name_id).html('<a id="recoverError_' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal" onclick="return show_fatal_error(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
                           $("#status-" + name_id).html('<a id="recoverError-' + name_id + '" href="#mdl-fatal-error" role="button" data-toggle="modal"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>').click(function(){
                            show_fatal_error(this.id)});
                    
                           /*$("fatalError_" + name_id).on("click",function(){
                            show_fatal_error(this.id)});
                        } */
                    }
                    }  
                    if (el.hasOwnProperty('system')) {   //if el system
                        $("#command_" + name_id).html(el.system.dp_sys_que_cmd);
                        if (el.system.cudk_bypass_state == false) {
                            $("#td_bypass_" + name_id).html('<i id="td_bypass_' + name_id + '" class="material-icons verde">usb</i>');
                        } else {
                            $("#td_bypass_" + name_id).html('<i id="td_bypass_' + name_id + '" class="material-icons verde">cached</i>');
                        }
                    }                           
                    if (el.hasOwnProperty('output')) {   //if el output
                        var busy=$.trim(el.output.busy);
                        var dev_alarm=$.trim(el.output.device_alarm);
                        var cu_alarm=$.trim(el.output.cu_alarm);
                        if (dev_alarm == 1) {
                            $("#dev_alarm_" + name_id).html('<a id="error-' + name_id + '" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i class="material-icons giallo">error</i></a>');
                        } else if (dev_alarm == 2) {
                            $("#dev_alarm_" + name_id).html('<a id="error-' + name_id + '" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i class="material-icons rosso">error</i></a>');
                        } else {
                            $("#error_" + name_id).remove();
                        }

                        if (cu_alarm == 1) {
                          $("#cu_alarm_" + name_id).html('<a id="warning-' + name_id + '" href="#mdl-cu-alarm-cu" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i class="material-icons giallo">error_outline</i></a>');
                        } else if (cu_alarm == 2) {
                            $("#cu_alarm_" + name_id).html('<a id="warning-' + name_id + '" href="#mdl-cu-alarm-cu" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i  class="material-icons rosso">error_outline</i></a>');
                        } else {
                            $("#warning_" + name_id).remove();
                        }
                        if (busy == 'true') {
                            $("#td_busy_" + name_id).html('<i id="busy_' + name_id + '" class="material-icons verde">hourglass_empty</i>');
                        } else {
                            $("#busy_" + name_id).remove();
                        }
                    }                        
                });
            } catch (e) {
                //alert("Error status");
                console.log("errore parsing" + e.message);
            }   // fine try 

        });  // fine risposta
    }
    //Funzione di riempimento campo dei magneti con i dati chaos, e reload degli stessi
    function worker() {    //function to update request ***
        setInterval(updateChannel, 1000);
    }

    function populate_url(cu) {
        ok_cu = [];
	$("#no-result-monitoring").html("");

        cu.forEach(function (ele) {
            ok_cu.push(ele);   //array con la classe dei magneti che ho selezionato

        });
	
	if (cu.length == 0) {
	    $("#no-result-monitoring").html("No results match");
	}
	

        worker();

        if (old_time.length != refresh_time.length) {
            // Cambiata lista elementi o prima richiesta
            old_time.length = 0;
            for (var i = 0; i < refresh_time.length; i++) {
                old_time.push(0);
            }
        }

        if (refresh_values_never_called) {
            worker();
            refresh_values_never_called = false;
        }

        if (timestamp_never_called) {
            checkTimestamp();
            timestamp_never_called = false;
        }

    }

    jchaos.search("", "zone", true, function (zones) {
        element_sel('#zones', zones, 1);

    });
    //Query a chaos per prendere la zona selezionata
//    $.get("http://" +  url_server + ":" + n_port +"/CU?cmd=search&parm={'name': ' ' , 'what': 'zone', 'alive':true}", function(datazone,textStatus) {
//        zones = $.parseJSON(datazone);
//	//zones = datazone;
//	//zones = datazone.toString();
//        element_sel('#zones', zones, 1);
//    });
//    
//    //Query a chaos per prendere la lista dei magneti
    var cu_list = [];

    $("#zones").change(function () {
        zone_selected = $("#zones option:selected").val();
        if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non � selezionata la zona
            $("#elements").attr('disabled', 'disabled');
        } else {
            $("#elements").removeAttr('disabled');
        }
        if (zone_selected == "ALL") {
            jchaos.search("", "class", true, function (ll) {
                element_sel('#elements', ll, 1);
            });

        } else {
            jchaos.search(zone_selected, "class", true, function (ll) {
                element_sel('#elements', ll, 1);
            });
        }

    });

    var str_search="";

    //Get per prendere i dati delle cu selezionate
    $("#elements").change(function () {
        cu_selected = $("#elements option:selected").val();
	
        if((zone_selected!="ALL")&&(zone_selected != "--Select--")){
            str_search=zone_selected;
        }
        if((cu_selected!="ALL")&&(cu_selected != "--Select--")){
            str_search+="/"+cu_selected;
        }
                

        if (cu_selected == "--Select--" || zone_selected == "--Select--") {
            $(".btn-main-function").hasClass("disabled");
            
        } else {
            $(".btn-main-function").removeClass("disabled");
            
        }
	
	jchaos.search(str_search, "cu", true, function (cu) {
		add_element(cu);
		populate_url(cu);
	    });



    }); // *** element list change
    
    
  
    
    var alive;
        $('input[type=radio][name=alive]').change(function() {
        if (this.value == 'true') {

	    alive = true;
	    jchaos.search(str_search, "cu", alive, function (cu) {
		add_element(cu);
		populate_url(cu);
	    });
	    console.log("entro");
	} else if (this.value == 'false') {
	    alive = false;
	    console.log("falso");
	  
	jchaos.search(str_search, "cu", alive, function (cu) {
		add_element(cu);
		populate_url(cu);
	    });
	}
	
    }); 
/*
 * COMANDI DEI MAGNETI AL CLICK DELLA RIGA I-ESIMA
 */

//get url al cui-server (webui server)
var request_prefix = "http://" + location.host + ":8081/CU?dev=";
// var request_prefix = "http://chaosdev-webui1.chaos.lnf.infn.it:8081/CU?dev="; 
var url;    // url completa di device per la get al cuiserver
var num_row = 0;    //n¡ riga selezionata
var current;

  





//funzione generale per mandare i comandi           
function sendCommand(command,parm) {
    jchaos.sendCUCmd(selected_device.health.ndk_uid,command,parm,null);
} 


function selectElement(ele_num) {
    var status,bypass;
    $("#tr_element_" + ele_num).addClass("row_selected");
    //current = $("#td_settCurr_" + ele_num).text();
    //$("#new_curr").val(current);
    selected_device = cu_cache[row_2_cuid[ele_num]];
 //   $("#cu-cmd").html(selected_device);
    status=cu_cache[row_2_cuid[ele_num]].health.nh_status;
    bypass=cu_cache[row_2_cuid[ele_num]].system.cudk_bypass_state;
    $("#available_commands").find("a").remove();
    
  //  $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOn' onclick='ByPassON()'><i class='material-icons verde'>cached</i><p class='name-cmd'>ByPass</p></a>");
   /*  
    if (status == 'Start' || status ==  'start') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-stop' onclick='Stop()'><i class='material-icons verde'>pause</i><p class='name-cmd'>Stop</p></a>");
        
    } if (status == 'Stop' || status == 'stop') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-start' onclick='Start()'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>");
        
    }  if (status == 'Init' || status == 'init') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-start' onclick='Start()'><i class='material-icons verde'>play_arrow</i><p class='name-cmd'>Start</p></a>");        
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-deinit' onclick='Deinit()'><i class='material-icons verde'>trending_down</i><p class='name-cmd'>Deinit</p></a>");
    } if (status == 'Deinit' || status == 'deinit') {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-init' onclick='Init()'><i class='material-icons verde'>trending_up</i><p class='name-cmd'>Init</p></a>");
    } 

    if(bypass){
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-bypassOFF' onclick='ByPassOFF()'><i class='material-icons verde'>usb</i><p class='name-cmd'>BypassOFF</p></a>");
        
    } else {
        $("#available_commands").append("<a class='quick-button-small span2 btn-cmd' id='cmd-bypassON' onclick='ByPassON()'><i class='material-icons verde'>cached</i><p class='name-cmd'>BypassON</p></a>");   
    } */
   // console.log("device "+ device);
    //url = request_prefix + device;
    
}


$(document).on("click", "td", function(e) {
        var selected = $(this).parent().hasClass("row_selected");
        $(".row_element").removeClass("row_selected");
    if(!selected) {
        var row_index = $(this).parent().index();
       // console.log("row_indexxxx " + row_index);
        selectElement(row_index);    
    }
});

//var index = 0;
//38 up, 40down
$(document).keydown(function(e) {

    if (e.keyCode === 40) {
        if (num_row+1 >= $(".row_element").length) {
            num_row = $(".row_element").length - 1;
        } else {
            num_row = num_row + 1;
        }
        $(".row_element").removeClass("row_selected");
        selectElement(num_row);
        return false;
    }
    if (e.keyCode === 38) {
        if (num_row == 0) {
            num_row = 0;
        } else {
            num_row = num_row -1;
        }
        $(".row_element").removeClass("row_selected");
        selectElement(num_row);
        return false;
    }
});




function show_dev_alarm(id) {
    var id_device_alarm = id.split("-")[1];
    selected_device = cu_cache[id_fatal_error];
    
    decodeDeviceAlarm(cu_cache[id_device_alarm].device_alarms);   
}
    
    
function decodeDeviceAlarm(dev_alarm) {
        $("#table_device_alarm").find("tr:gt(0)").remove();
	$("#name-device-alarm").html(dev_alarm.ndk_uid);

        $.each(dev_alarm, function(key, value){
        if (key != "ndk_uid"  && key != "dpck_seq_id" && key != "dpck_ats" && key !="dpck_ds_type") {
            switch (value) {
                case 1:   
                    $("#table_device_alarm").append('<tr><td class="warning_value">'+ key + '</td><td class="warning_value">'+ value +'</td></tr>');
                    break;
                case 2:
                    $("#table_device_alarm").append('<tr><td style="color:red;">'+ key + '</td><td style="color:red;">'+ value +'</td></tr>');
                    break;
                default: 
                    $("#table_device_alarm").append('<tr><td>'+ key + '</td><td>'+ value +'</td></tr>');
            }
        }  
    });  
}


function show_cu_alarm(id) {
    var id_cu_alarm = id.split('-')[1];
    decodeCUAlarm(cu_cache[id_cu_alarm].cu_alarms);   
}
    
    
function decodeCUAlarm(cu_alarm) {
        $("#table_cu_alarm").find("tr:gt(0)").remove();
	$("#name-cu-alarm").html(cu_alarm.ndk_uid);

        $.each(cu_alarm, function(key, value){
        if (key != "ndk_uid"  && key != "dpck_seq_id" && key != "dpck_ats" && key !="dpck_ds_type") {
            switch (value) {
                case 1:   
                    $("#table_cu_alarm").append('<tr><td class="warning_value">'+ key + '</td><td class="warning_value">'+ value +'</td></tr>');
                    break;
                case 2:
                    $("#table_cu_alarm").append('<tr><td style="color:red;">'+ key + '</td><td style="color:red;">'+ value +'</td></tr>');
                    break;
                default: 
                    $("#table_cu_alarm").append('<tr><td>'+ key + '</td><td>'+ value +'</td></tr>');
            }
        }  
    });  
}


function openViewIO() {
    if(!selected_device.hasOwnProperty('health')){
        return;
    }
    $("#name-cu-io").html(selected_device.health.ndk_uid)
    
    
   $('#cu-dashboard').chaosDashboard(selected_device.health.ndk_uid,{
    CUtype:"generic",
    collapsed: true,
    withQuotes: true

});
  /* jchaos.getDesc(selected_device.health.ndk_uid, function (cu) {
    $('#cu-json-description').jsonViewer(cu,{
        collapsed: true,
        withQuotes: true

   });
   });*/
   $("#mdl-io-cu").draggable();    
   $("#mdl-io-cu").modal();
    

}

$(document).on("click", ".name_element", function(e) {
//$(document).on("click", "#main_table_cu tr", function(e) {
    var selected = $(this).hasClass("row_selected");
    $(".name_element").removeClass("row_selected");
   // $("#main_table_cu tr").removeClass("row_selected");
    if (!selected) {
        $(this).addClass("row_selected");
	   num_row = $(this).parent().index();
      //  num_row = this.rowIndex;
      //  num_row = num_row - 1;  // per far partire il conteggio da 1 e non da 0
	openViewIO();
    }
});

});   //*** main function

