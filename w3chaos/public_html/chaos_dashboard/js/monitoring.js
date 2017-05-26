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
var device_alarms = [];
var cu_alarms = [];

$(document).ready(function() {
    var cu = [];
    var url_cu = "";
    var zones = [];
    
    
    
      //Funzione per riempire le select(quella delle zone, e quella degli alimentatori)
    function element_sel(field, arr, add_all) {
        $(field).empty();
        $(field).append("<option>--Select--</option>");
	//$(field).append("<option value='ALL'>ALL</option>");

        if(add_all == 1) {
            $(field).append("<option value='ALL'>ALL</option>");
	    
        }  
        $(arr).each(function(i) {
	    
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
	var hours   = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	var seconds = sec_num - (hours * 3600) - (minutes * 60);
    
	if (hours   < 10) {hours   = "0"+hours;}
	if (minutes < 10) {minutes = "0"+minutes;}
	if (seconds < 10) {seconds = "0"+seconds;}
	return hours+':'+minutes+':'+seconds;
    }	
    
    
    
    //Funzione per controllare che il timestamp di ogni singolo magnete si stia aggiornando
    function checkTimestamp() {
        setInterval(function(){
            for(var i = 0; i < refresh_time.length; i++){
                if (refresh_time[i] != old_time[i]) {
                    $("#name_element_" + i).css('color','green');
                    old_time[i] = refresh_time[i];
                } else {
                    $("#name_element_" + i).css('color','red');
                }
            }
        },6000);  /*** il setInterval è impostato a 6 secondi perché non può essere minore delq refresh cu ***/
    }
    
    //Funzione per comporre la griglia della tabella dei magneti
    function add_element(arr) {
       	$("#main_table_cu").find("tr:gt(0)").remove();
        $(arr).each(function(i) {
	    $("#main_table_cu").append("<tr class='row_element' id='tr_element_" + i + "'><td class='name_element' id='name_element_"+ [i] + "'>" + arr[i]
					+ "</td><td id='status_"+ [i] + "'></td><td id='td_busy_"+ [i] + "'></td><td id='timestamp_"+ [i]
					+ "'></td><td id='uptime_"+ [i] + "'></td><td id='systemtime_"+ [i] + "'></td><td id='usertime_"+ [i]
					+ "'></td><td id='dev_alarm_"+ [i] + "'></td><td id='cu_alarm_"+ [i] + "'></td></tr>")	
	});
        n = $('#main_table_cu tr').size();
        if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
            $("#table-scroll").css('height','280px');
        } else {
            $("#table-scroll").css('height','');
        }
    }
    
    
    
       //Funzione di riempimento campo dei magneti con i dati chaos, e reload degli stessi
    function worker() {    //function to update request ***
        setInterval(function() {
            $.get("http://"+  url_server + ":" + n_port +"/CU?dev="+ url_cu + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
                var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
                
                //console.log("string " + old_str);
                
                try {
                                              
                    refresh_time.length = 0;
		    var colm_fl_state = [];
                    var dev_alarm_col = [];  //booleano
		    var cu_alarm_col = []; //booleano
		    device_alarms = [];  //contenuto allarmi device
		    cu_alarms = [];  //contenuto allarmi cu
                    var busy_col = [];
		    var timestamp = [];
		    var uptime = [];
		    var systemtime = [];
		    var usertime = [];

                
                    var name_cu = $.parseJSON(old_str);
                    cu.forEach(function(ctl) {
                        name_cu.forEach(function(el) {
                            var name_device_db = ctl;
                           // console.log("name_device " + name_device_db);
                        if( el.hasOwnProperty('output')) {
                            if(name_device_db == el.output.ndk_uid) {
				
				el.systTime = Number(el.health.nh_st).toFixed(3);
				el.usrTime = Number(el.health.nh_ut).toFixed(3);
				
				//((var dateTmp = (arrData[i][index].numberLong)/1000;
		//var DateUtc = new Date(1000*dateTmp);

				el.tmStamp = (el.health.nh_ts.numberLong)/1000;
				
				//console.log("timestamp " + el.tmStamp);
				
				el.tmUtm = el.health.nh_upt.numberLong.toHHMMSS();
				
				//console.log("uptime " + el.tmUtm);
		
				colm_fl_state.push($.trim(el.health.nh_status));
				busy_col.push($.trim(el.output.busy));
				//uptime.push(el.health.nh_upt.numberLong);
				//timestamp.push(el.health.nh_ts.numberLong);
				timestamp.push(new Date(1000*el.tmStamp));
				uptime.push(el.tmUtm);
				systemtime.push(el.systTime);
				usertime.push(el.usrTime);
                                refresh_time.push(el.output.dpck_ats.numberLong);
                                busy_col.push(el.output.busy);
                                
                                dev_alarm_col.push($.trim(el.output.device_alarm));
				cu_alarm_col.push($.trim(el.output.cu_alarm));
					
				device_alarms.push(el.device_alarms);
				cu_alarms.push(el.cu_alarms);                               
                            }
                        } else {
                            alert("problem")
                        } 
                        });
                    });
		    
		    
		    for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == 'Start') {
                            $("#status_" + i).html('<i class="material-icons verde">power_settings_news</i>');
                        } else if (colm_fl_state[i] == 'true') {
                            $("#status_" + i).html('<i class="material-icons rosso">power_settings_news</i>');
                            
                        }
                    }
		    
		    for(var i = 0; i<dev_alarm_col.length; i++) {
                        //console.log("dev alarm " + dev_alarm_col[i]);
                        if (dev_alarm_col[i] == 1) {
                                $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error</i></a>');
                        } else if (dev_alarm_col[i] == 2) {
                                $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-cu" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');

                        } else {
                                $("#error_" + i).remove();
                        }
                    }
                       
		    for(var i=0; i< busy_col.length; i++ ) {
			//console.log("busy " + busy_col[i]);
			if (busy_col[i] == 'true') {
			    $("#td_busy_" + i).html('<i id="busy_'+ [i] + '" class="material-icon verde">hourglass empty</i>');
			} else if (busy_col[i] == 'false') {
                            $("#busy_" + i).remove();
			}
		    }
                    
		    for(var i = 0; i < uptime.length; i++) {
                        $("#uptime_" + i).html(uptime[i]);
                    }
		    
		    for(var i = 0; i < timestamp.length; i++) {
                        $("#timestamp_" + i).html(timestamp[i]);
                    }
		    
		    for(var i = 0; i < usertime.length; i++) {
                        $("#usertime_" + i).html(usertime[i]);
                    }
		    
		    for(var i = 0; i < systemtime.length; i++) {
                        $("#systemtime_" + i).html(systemtime[i]);
                    }
   
                    for(var i = 0; i<cu_alarm_col.length; i++) {
			//console.log("cu alarm " + cu_alarm_col[i])
                        if (cu_alarm_col[i] == 1) {
                                $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-cu" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error_outline</i></a>');
                        }
                        else if (cu_alarm_col[i] == 2) {
                                $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-cu" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error_outline</i></a>');
                        } else {
                                $("#warning_" + i).remove();
                        }
                    }

                    
                } catch(e) {
                    
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }
    
            });
        },2000);
    }
 
    
    
    
        //Query a chaos per prendere la zona selezionata
    $.get("http://"+  url_server + ":" + n_port +"/CU?cmd=search&parm={'name': ' ' , 'what': 'zone', 'alive':true}", function(datazone,textStatus) {
        zones = $.parseJSON(datazone);
        element_sel('#zones', zones, 1);
    });
    
    //Query a chaos per prendere la lista dei magneti
    var cu_list = [];
    $("#zones").change(function() {
        zone_selected = $("#zones option:selected").val();
        if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements").attr('disabled','disabled');
        } else {
            $("#elements").removeAttr('disabled');
        }
         
          $.get("http://" +  url_server + ":" + n_port +"/CU?cmd=search&parm={'name':'" + zone_selected + "','what':'class','alive':true}", function(datael, textStatus) {
            cu_list = $.parseJSON(datael);
            element_sel('#elements', cu_list,1);
        });
	  
	
	/*if (zone_selected == "ALL") {
	    $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'','what':'class','alive':true}", function(datael, textStatus) {
            cu_list = $.parseJSON(datael);
	    console.log("qqqqqqq " + cu_list);
            element_sel('#elements', cu_list,0);
	    });
	} */
	  
    });
    
    
  

    //Get per prendere i dati delle cu selezionate
    $("#elements").change(function() {
         cu_selected = $("#elements option:selected").val();
        
        if (cu_selected == "--Select--" || zone_selected == "--Select--" ) {
            $(".btn-main-function").hasClass("disabled")
        } else {
            $(".btn-main-function").removeClass("disabled")
        }
	
	console.log("cu_selected " + cu_selected + "zone selected " + zone_selected);

        if(jQuery.inArray(cu_selected, cu_list) == -1) {
            $.ajax({
                url: "http://"+  url_server + ":" + n_port +"/CU?cmd=search&parm={'name':'','what':'cu','alive':true}",
                async: false
            }).done(function(datall, textStatus) {
                cu = $.parseJSON(datall);
                add_element(cu);
                //selectElement(0);   //seleziono la prima riga appena appare la tabella da attivare
		console.log("data all " + datall);
            });
        }
	
	
	if(zone_selected == "ALL" || cu_selected == "ALL") {
	    	console.log(" zone " + zone_selected);

	    
            $.ajax({
                url: "http://"+  url_server + ":" + n_port +"/CU?cmd=search&parm={'name':'','what':'cu','alive':true}",
                async: false
            }).done(function(datall, textStatus) {
                cu = $.parseJSON(datall);
                add_element(cu);
                //selectElement(0);   //seleziono la prima riga appena appare la tabella da attivare
		console.log("data all " + datall);
            });
        } 
	
	
	else {
            $.ajax({
                url: "http://"+  url_server + ":" + n_port +"/CU?cmd=search&parm={'name':'" + zone_selected + "/" + cu_selected + "','what':'cu','alive':true}",
                async: false
            }).done(function(dataele, textStatus) {
                cu = $.parseJSON(dataele);
                add_element(cu);
                //selectElement(0); //da attivare
            });
        } 
        
        
	ok_cu = [];
        url_cu = "";   // empty array
        cu.forEach(function(ele) {
            ok_cu.push(ele);   //array con la classe dei magneti che ho selezionato
          url_cu += ele + ",";

        });
        
        url_cu = url_cu.substring(0, url_cu.length - 1);   /*** Manipolazione per togliere l'ultima virgola dall'url_cu ***/        

        
	//console.log("url cu " + url_cu);
	

	// Allinea numero di elementi tra old e refresh time
        if (old_time.length!=refresh_time.length) {
            // Cambiata lista elementi o prima richiesta
            old_time.length=0;
            for(var i = 0; i < refresh_time.length; i++){
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
	
    
    }); // *** element list change
        
        
});   //*** main function
    