/*
 * MONITORING CU (STATUS,ALARM)
 */

var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile � usata anche in mag_command.js
var cu_selected = "";
var refresh_time = [];
var old_time = [];
var timestamp_never_called = true;
var refresh_values_never_called = true;
var ok_cu = [];
var n; //numero delle righe (ovvero degli elementi in tabella); cos� applicando il dataset l'id delle righe aumenta
var device_alarms = [];
var cu_alarms = [];
var fat_err = [];
var dom_err = [];
var colm_fl_state = [];

$(document).ready(function () {
    var cu = [];
    var url_cu = "";
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

            //if (arr[i] != "ACCUMULATOR" && arr[i] != "LNF/TEST") { //tolgo dalla lista la zona accumulatore
            //if (arr[i] != "SCRAPER" && arr[i] != "DAQ") { //tolgo dalla lista gli scraper
            //$(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");
            //  }
            // }
            $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");

        });

    }

    //Function to convert second in h/m/s
    String.prototype.toHHMMSS = function () {

        var sec_num = parseInt(this, 10); // don't forget the second param	
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
        }, 10000);  /*** il setInterval � impostato a 6 secondi perch� non pu� essere minore delq refresh cu ***/
    }

    //Funzione per comporre la griglia della tabella dei magneti
    function add_element(arr) {
        //  $(arr).each(function(i) {

        /*$("#table-space").append("<div class='box span12'><div class='box-content'><table class='table table-bordered' id='main_table_cu'>"+
         "<thead class='box-header'><tr><th>Name CU</th><th colspan='2'>Status</th><th>Timestamp</th><th>Uptime [hh:mm:ss]</th>"+
         "<th>Systemtime [%]</th><th>UserTime [%]</th><th>Alarm Device</th><th>Alarm CU</th></tr></thead>"+
         "<tr class='row_element' id='tr_element_" + i + "'><td class='name_element' id='name_element_"+ [i] + "'>" + arr[i]
         + "</td><td id='status_"+ [i] + "'></td><td id='td_busy_"+ [i] + "'></td><td id='timestamp_"+ [i]
         + "'></td><td id='uptime_"+ [i] + "'></td><td id='systemtime_"+ [i] + "'></td><td id='usertime_"+ [i]
         + "'></td><td id='dev_alarm_"+ [i] + "'></td><td id='cu_alarm_"+ [i] + "'></td></tr></table></div></div>") */



        $("#main_table_cu").find("tr:gt(0)").remove();
        $(arr).each(function (i) {
            $("#main_table_cu").append("<tr class='row_element' id='tr_element_" + i + "'><td class='name_element' id='name_element_" + [i] + "'>" + arr[i]
                    + "</td><td id='status_" + [i] + "'></td><td id='td_busy_" + [i] + "'></td><td id='timestamp_" + [i]
                    + "'></td><td id='uptime_" + [i] + "'></td><td id='systemtime_" + [i] + "'></td><td id='usertime_" + [i]
                    + "'></td><td id='command_" + [i] + "'></td><td id='dev_alarm_" + [i] + "'></td><td id='cu_alarm_" + [i] + "'></td></tr>")
        });

        //$("#main_table_cu").DataTable();

        n = $('#main_table_cu tr').size();
        if (n > 22) {     /***Attivo lo scroll della tabella se ci sono pi� di 22 elementi ***/
            $("#table-scroll").css('height', '280px');
        } else {
            $("#table-scroll").css('height', '');
        }
    }

    function updateChannel() {
        jchaos.getChannel(ok_cu, -1, function (cu) {   //risposta

//		    var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');

            //console.log("dati " + old_str + "aaa " + datavalue)

            try {  // try

                refresh_time.length = 0;
                 colm_fl_state = [];
                var dev_alarm_col = [];  //booleano
                var cu_alarm_col = []; //booleano
                device_alarms = [];  //contenuto allarmi device
                cu_alarms = [];  //contenuto allarmi cu
		fat_err	= [];
		dom_err = [];
                var busy_col = [];
                var timestamp = [];
                var uptime = [];
                var systemtime = [];
                var usertime = [];
                var command = [];

//			var name_cu = $.parseJSON(old_str);
                //var name_cu = old_str;
                //console.log("string " + name_cu);
                cu.forEach(function (el) {  // cu forEach
                        var name_device_db = el.health.ndk_uid;
                        if (el.hasOwnProperty('output')) {   //if el output

                                el.systTime = Number(el.health.nh_st).toFixed(3);
                                el.usrTime = Number(el.health.nh_ut).toFixed(3);
                                el.tmStamp = Number(el.health.nh_ts.$numberLong) / 1000;
                                el.tmUtm = el.health.nh_upt.$numberLong.toHHMMSS();
                                colm_fl_state.push($.trim(el.health.nh_status));
                                busy_col.push($.trim(el.output.busy));
                                timestamp.push(new Date(1000 * el.tmStamp).toUTCString());
                                uptime.push(el.tmUtm);
                                systemtime.push(el.systTime);
                                usertime.push(el.usrTime);
                                refresh_time.push(Number(el.health.nh_ts.$numberLong)) / 1000;
                                //refresh_time.push(el.output.dpck_ats.numberLong);
                                //busy_col.push(el.output.busy);
                                command.push(el.system.dp_sys_que_cmd);
				


                                dev_alarm_col.push($.trim(el.output.device_alarm));
                                cu_alarm_col.push($.trim(el.output.cu_alarm));

                                device_alarms.push(el.device_alarms);
				fat_err.push($.trim(el.health.nh_lem));
				dom_err.push($.trim(el.health.nh_led));
                                cu_alarms.push(el.cu_alarms);
                        } else {
                            ////alert("problem")
                            console.log("problem");
                        }  // fine el output
                });   // fine cu forEach

                for (var i = 0; i < colm_fl_state.length; i++) {
                    if (colm_fl_state[i] == 'Start' || colm_fl_state[i] ==  'start') {
                        $("#status_" + i).html('<i class="material-icons verde">power_settings_news</i>');
                    } if (colm_fl_state[i] == 'Stop' || colm_fl_state[i] == 'stop') {
                        $("#status_" + i).html('<i class="material-icons arancione">power_settings_news</i>');
                    }  if (colm_fl_state[i] == 'Init' || colm_fl_state[i] == 'init') {
                        $("#status_" + i).html('<i class="material-icons giallo">power_settings_news</i>');
                    }if (colm_fl_state[i] == 'Denit' || colm_fl_state[i] == 'deinit') {
                        $("#status_" + i).html('<i class="material-icons rosso">power_settings_news</i>');
                    } if (colm_fl_state[i] == 'Fatal Error' || colm_fl_state[i] == 'fatal error') {
			$("#status_" + i).html('<a id="fatalError_' + [i] + '" href="#mdl-fatal-error" role="button" data-toggle="modal" onclick="return show_fatal_error(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
                    }  else if (colm_fl_state[i] == 'Recoverable Error' || colm_fl_state[i] == 'recoverable error') {
			$("#status_" + i).html('<a id="recoverError_' + [i] + '" href="#mdl-fatal-error" role="button" data-toggle="modal" onclick="return show_fatal_error(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
                    } 
                }

                for (var i = 0; i < dev_alarm_col.length; i++) {
                    if (dev_alarm_col[i] == 1) {
                        $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error</i></a>');
                    } else if (dev_alarm_col[i] == 2) {
                        $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
                    } else {
                        $("#error_" + i).remove();
                    }
                }

                for (var i = 0; i < busy_col.length; i++) {
                    if (busy_col[i] == 'true') {
                        $("#td_busy_" + i).html('<i id="busy_' + [i] + '" class="material-icons verde">hourglass_empty</i>');
                    } else if (busy_col[i] == 'false') {
                        $("#busy_" + i).remove();
                    }
		    console.log("lunghezza busy " + busy_col.length);
		    //console.log("busy " + busy_col[i]);
		    
                }

                for (var i = 0; i < uptime.length; i++) {
                    $("#uptime_" + i).html(uptime[i]);
		    console.log("uptime " + uptime.length)
                }

                for (var i = 0; i < timestamp.length; i++) {
                    $("#timestamp_" + i).html(timestamp[i]);
                }

                for (var i = 0; i < usertime.length; i++) {
                    $("#usertime_" + i).html(usertime[i]);
                }

                for (var i = 0; i < systemtime.length; i++) {
                    $("#systemtime_" + i).html(systemtime[i]);
                }

                for (var i = 0; i < command.length; i++) {
                    $("#command_" + i).html(command[i]);
                }

                for (var i = 0; i < cu_alarm_col.length; i++) {
                    if (cu_alarm_col[i] == 1) {
                        $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-cu" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error_outline</i></a>');
                    } else if (cu_alarm_col[i] == 2) {
                        $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-cu" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error_outline</i></a>');
                    } else {
                        $("#warning_" + i).remove();
                    }
                }


            } catch (e) {
                //alert("Error status");
                console.log("errore parsing" + e.message);
            }   // fine try 

            //});

        });  // fine risposta
    }
    //Funzione di riempimento campo dei magneti con i dati chaos, e reload degli stessi
    function worker() {    //function to update request ***
        setInterval(updateChannel, 1000);
    }

    function populate_url(cu) {
        ok_cu = [];
//	url_cu = "";   // empty array
        cu.forEach(function (ele) {
            ok_cu.push(ele);   //array con la classe dei magneti che ho selezionato
//	    url_cu += ele + ",";
        });

//	url_cu = url_cu.substring(0, url_cu.length - 1);   /*** Manipolazione per togliere l'ultima virgola dall'url_cu ***/        

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

    jchaos.search("", "zone",false, function (zones) {
	//console.log("zoness " + zones);
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
            jchaos.search("", "class",false, function (ll) {
                element_sel('#elements', ll, 0);
            });

        } else {
            jchaos.search(zone_selected, "class", false, function (ll) {
                element_sel('#elements', ll, 0);
            });
        }

    });



    //Get per prendere i dati delle cu selezionate
    $("#elements").change(function () {
        cu_selected = $("#elements option:selected").val();
        var str_search="";
	
	
        if((zone_selected!="ALL")&&(zone_selected != "--Select--")){
            str_search=zone_selected;
        }
        if((cu_selected!="ALL")&&(cu_selected != "--Select--")){
            str_search+="/"+cu_selected;
        }
        
        jchaos.search(str_search, "cu", false, function (cu) {
                add_element(cu);
                populate_url(cu);

            });
	
	
	 /*  if (zone_selected == "ALL") {
	    
	            jchaos.search("", "cu", true, function (cu) {
			
			add_element(cu);
			                populate_url(cu);


            });
		    
	   } */

	  
	
	/*    if (zone_selected == "ALL") {
	    //$.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'','what':'cu','alive':true}", function(datael, textStatus) {
		$.ajax({
		     url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'','what':'cu','alive':true}",
		     async: false
		 }).done(function(dataele, textStatus) {
		     cu = $.parseJSON(dataele);
		     //cu = dataele;
		     add_element(cu);
		     //selectElement(0); //da attivare
		 });
		populate_url(cu);
	} */

        if (cu_selected == "--Select--" || zone_selected == "--Select--") {
            $(".btn-main-function").hasClass("disabled");
            
        } else {
            $(".btn-main-function").removeClass("disabled");
            
        }




    }); // *** element list change


});   //*** main function

