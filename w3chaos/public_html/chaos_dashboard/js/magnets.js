/*
 * LETTURA DATI (CORRENTE READ OUT, STATO, ERRORI) CHAOS E CREAZIONE TABELLA DEI MAGNETI
 */
var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in mag_command.js
var mag_selected = "";
//var error_string="";
var refresh_time = [];
var old_time = [];
var timestamp_never_called = true;
var refresh_values_never_called = true;
var ok_mag = [];
var n; //numero delle righe (ovvero degli elementi in tabella); così applicando il dataset l'id delle righe aumenta
var colm_rem_loc = [];
//var tot_alarm = [];
//var colm_alarm = [];
var device_alarms = [];
var cu_alarms = [];


$(document).ready(function() {
    var magnets = [];
    var url_mag = "";
    var zones = [];

    
    //Funzione per riempire le select(quella delle zone, e quella degli alimentatori)
    function element_sel(field, arr, add_all) {
        $(field).empty();
        $(field).append("<option>--Select--</option>");
        if(add_all == 1) {
            $(field).append("<option value='ALL'>ALL</option>");
        }
        $(arr).each(function(i) {
            if (arr[i] != "ACCUMULATOR" && arr[i] != "LNF/TEST") { //tolgo dalla lista la zona accumulatore
                if (arr[i] != "SCRAPER" && arr[i] != "DAQ") { //tolgo dalla lista gli scraper
                    $(field).append("<option value='" + arr[i] + "'>" + arr[i] + "</option>");
                }
            }
        });
        
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
        $("#main_table_magnets").find("tr:gt(0)").remove();
        $(arr).each(function(i) {

            $("#main_table_magnets").append("<tr class='tr_element' id='tr_element_" + i + "'><td class='td_element td_name' id='name_element_"
                                    + [i] + "'>" + arr[i] + "</td><td class='td_element td_readout' id='td_readout_" + [i]
                                    + "'> 0</td><td class='td_element td_current' id='td_settCurr_"
                                    + [i] + "'>0</td><td class='td_element' id='td_saved_curr_" + [i]
                                    + "'></td><td class='td_element' id='td_saved_state_" + [i]
                                    + "'></td><td class='td_element' id='td_saved_pola_" + [i]
                                    + "'></td><td class='td_element' id='td_flag_state_" + [i]
                                    + "'></td><td class='td_element' id='td_flag_pol_" + [i]
                                    + "'></td><td class='td_element' id='td_flag_rl_" + [i]
                                    +"'></td><td class='td_element' id='td_busy_" + [i]
                                    + "'></td><td class='td_element' id='dev_alarm_" + [i]
                                    + "'></td><td class='td_element' id='cu_alarm_" + [i]
                                    + "'></td></tr>");
            });
         n = $('#main_table_magnets tr').size();
        if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 magneti ***/
            $("#table-scroll").css('height','280px');
        } else {
            $("#table-scroll").css('height','');
        }
    }
    
    //Funzione di riempimento campo dei magneti con i dati chaos, e reload degli stessi
    function worker() {    //function to update request ***
        setInterval(function() {
            $.get("http://" + location.host + ":8081/CU?dev="+ url_mag + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
                var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
                
                console.log(old_str);
                
                try {
                                              
                    var colm_readout = [];
                    var colm_fl_state = [];
                    var colm_fl_pol = [];
                    var colm_settCurr = [];
                    //colm_alarm = [];
                    //var colm_alarm_catalog = [];
                    colm_rem_loc = [];  //colonna flag remote/local
                    refresh_time.length = 0;
                    //var err_state = [];
                    //var log_state = [];
                    //var colm_off = [];
                    //tot_alarm = [];
                    var dev_alarm_col = [];  //booleano
		    var cu_alarm_col = []; //booleano
		    device_alarms = [];  //contenuto allarmi device
		    cu_alarms = [];  //contenuto allarmi cu
                    var busy_col = [];

                
                    var name_mag = $.parseJSON(old_str);
                    magnets.forEach(function(mag) {
                        name_mag.forEach(function(el) {
                            var name_device_db = mag;
                           // console.log("name_device " + name_device_db);
                        if( el.hasOwnProperty('output')) {
                            if(name_device_db == el.output.ndk_uid) {
                                el.current = Number(el.input.current).toFixed(3);
                                el.current_sp = Number(el.output.current).toFixed(3);
                                
                              //  colm_rem_loc.push(el.output.status_id);
                                //colm_alarm.push(el.output.alarms.numberLong);
                              
                                //colm_alarm_catalog.push(el.output.alarm_catalog);
                                colm_settCurr.push(el.current);
                                colm_readout.push(el.current_sp);
                                colm_fl_pol.push(el.output.polarity);
                                colm_fl_state.push($.trim(el.output.stby));
                                colm_rem_loc.push($.trim(el.output.local));
                                //colm_off.push($.trim(el.output.off));
                                
                                refresh_time.push(el.output.dpck_ats.numberLong);
                                //log_state.push(el.log_status); // da controllare
                                
                                //tot_alarm.push(el.alarms);
                                
                                busy_col.push(el.output.busy);
                                
                                dev_alarm_col.push($.trim(el.output.device_alarm));
				cu_alarm_col.push($.trim(el.output.cu_alarm));
					
				device_alarms.push(el.device_alarms);
				cu_alarms.push(el.cu_alarms);
                                
                            }
                        } else {
                            //alert("problem")
                        } 
                        });
                    });
                            
                    for(var i = 0; i < colm_fl_pol.length; i++) {
                        switch(colm_fl_pol[i]) {
                            case 1:
                                $('#td_flag_pol_' + i).html('<i class="material-icons rosso">add_circle</i>');
                                break;
                            case -1:
                                $('#td_flag_pol_' + i).html('<i class="material-icons blu">remove_circle</i>');
                                break;
                            case 0:
                                $('#td_flag_pol_' + i).html('<i class="material-icons">radio_button_unchecked</i>');
                                break;
                        }
                    }
                    
                   /* for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == "false" ) {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde md-24">trending_down</i>');
                        } else {
                            $("#td_flag_state_" + i).html('<i class="material-icons red md-24">pause_circle_outline</i>');
                        }
                    } */
                    
                    /*for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == 'false' && colm_alarm[i] == 0) {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde">trending_down</i>');
                        }
                        if (colm_fl_state[i] == 'true' && colm_alarm[i] == 0) {
                            $("#td_flag_state_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                            
                        } else {
                            decodeError(colm_alarm[i])
                            var checkComuniFail = checkCommunicationFailure(colm_alarm[i])
                            if (checkComuniFail == 1) {
                                $("#td_flag_state_" + i).html('<i id="communication_' + [i] + '" class="material-icons rosso">help_ouline</i>');
                            } else if (colm_alarm[i] != 0 ) {
                                $("#td_flag_state_" + i).html('<i style="cursor:pointer;" id="error_' + [i] + '" class="material-icons rosso" onclick="open_popup_alarm_mag(this.id)">error</i>');                                    
                            }
                        }
                    } */
                    
                    
                    for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == 'false') {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde">trending_down</i>');
                        } else if (colm_fl_state[i] == 'true') {
                            $("#td_flag_state_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                            
                        }
                    }
                   
                    
                    for(var i = 0; i < colm_rem_loc.length; i++) {
                        if (colm_rem_loc[i] == "true") {
                            $("#td_flag_rl_" + i).html('<i class="material-icons rosso" id="local_' + [i] + '">vpn_key</i>');
                        } else if (colm_rem_loc[i] == "false") {
                            $("#local_" + i).remove();
                        }
                    }
                    
                    /*for(var i = 0; i < colm_off.length; i++) {
                        if (colm_off[i] == "true") {
                            $("#td_flag_state_" + i).html('<i class="material-icons rosso">power_settings_new</i>');
                        }
                    } */
    
                    for(var i = 0; i < colm_readout.length; i++) {
                        $("#td_readout_" + i).html(colm_readout[i]);
                    }
                    
                    for(var i = 0; i < colm_settCurr.length; i++) {
                        $("#td_settCurr_" + i).html(colm_settCurr[i]);
                    }
                    
                    
                    /*for(var i = 0; i< colm_alarm_catalog.length; i ++) {
                        if (colm_alarm_catalog[i] == true) {
                            $("#td_error_state_" + i).html('<i style="cursor:pointer;" id="warning_' + [i] + '" class="material-icons yellow" onclick="apri_popup(this.id)">warning</i>');
                        } else if (colm_alarm_catalog[i] == false) {
                            $("#warning_" + i).remove();
                        }
                    }  */
                    
                    
                    
		    for(var i=0; i< busy_col.length; i++ ) {
			//console.log("busy " + busy_col[i]);
			if (busy_col[i] == 'true') {
			    $("#td_busy_" + i).html('<i id="busy_'+ [i] + '" class="material-icon verde">hourglass empty</i>');
			} else if (busy_col[i] == 'false') {
                            $("#busy_" + i).remove();
			}
		    }
                    
                    for(var i = 0; i<dev_alarm_col.length; i++) {
                        //console.log("dev alarm " + dev_alarm_col[i]);
                        if (dev_alarm_col[i] == 1) {
                                $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-mag" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error</i></a>');
                        } else if (dev_alarm_col[i] == 2) {
                                $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-mag" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');

                        } else {
                                $("#error_" + i).remove();
                        }
                    }
                       
                    
		    /*for(var i = 0; i<dev_alarm_col.length; i++) {
                        if (dev_alarm_col[i] == 'true') {
                            $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm-mag" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
                        }   else if( dev_alarm_col[i] == false) {  
                            $("#error_" + i).remove();
                            }    
                    } */
		    
                    for(var i = 0; i<cu_alarm_col.length; i++) {
			//console.log("cu alarm " + cu_alarm_col[i])
                        if (cu_alarm_col[i] == 1) {
                                $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-mag" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error_outline</i></a>');
                        }
                        else if (cu_alarm_col[i] == 2) {
                                $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-mag" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error_outline</i></a>');
                        } else {
                                $("#warning_" + i).remove();
                        }
                    }

		    
		    /*for(var i = 0; i<cu_alarm_col.length; i++) {
			//console.log("cu alarm " + cu_alarm_col[i])
                        if (cu_alarm_col[i] == 'true') {
                            $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm-mag" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error_outline</i></a>');
                        }   else if( cu_alarm_col[i] == false) {  
                            $("#warning_" + i).remove();
                            }    
                    }*/


                 /*   for(var i = 0; i<colm_alarm.length; i++) {
                        if (colm_alarm[i]!= 0) {
                            error_string = decodeError(colm_alarm[i]);
                            $("#td_flag_state_" + i).html('<i style="cursor:pointer;" id="error_' + [i] + '" class="material-icons red md-24" onclick="apri_popup()">error</i>');                                    
                        }   else if( colm_alarm[i] == 0) {  
                            $("#error_" + i).remove();
                            }    
                    } */
                    
                    /*for(var i = 0; i < err_state.length; i ++) {    
                        if (err_state[i] != "") {
                            alert("log:" + log_state[i] + "err: " + err_state[i]);
                        }
                    } */
                   // console.log("STATUS_ID: " + colm_rem_loc),
                  //  console.log("Allarme: " + datavalue);
               
                } catch(e) {
                    
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }
    
            });
        },2000);
    }
    
    //Query a chaos per prendere la zona selezionata
    $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name': ' ' , 'what': 'zone', 'alive':true}", function(datazone,textStatus) {
        zones = $.parseJSON(datazone);
        element_sel('#zones', zones, 0);
    });
    
    //Query a chaos per prendere la lista dei magneti
    var btf_list = [];
    $("#zones").change(function() {
        zone_selected = $("#zones option:selected").val();
        if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements").attr('disabled','disabled');
        } else {
            $("#elements").removeAttr('disabled');
        }
         
          $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + zone_selected + "','what':'class','alive':true}", function(datael, textStatus) {
            btf_list = $.parseJSON(datael);
            element_sel('#elements', btf_list, 1);
        });
    });
    
    
  

    //Get per prendere i dati dei magneti selezionati
    $("#elements").change(function() {
       // $("#apply_saved").remove();  //rimuove il tasto apply all se cambio selezione dei magneti
         mag_selected = $("#elements option:selected").val();
        
        if (mag_selected == "--Select--" || zone_selected == "--Select--" ) {
            $(".btn-main-function").hasClass("disabled")
        } else {
            $(".btn-main-function").removeClass("disabled")
        }

        if(jQuery.inArray(mag_selected, btf_list) == -1) {
            $.ajax({
                url: "http://" + location.host + ":8081/CU?cmd=search&parm={'names':['BTF/DIPOLE','BTF/QUADRUPOLE','BTF/CORRECTOR'],'what':'cu','alive':true}",
                async: false
            }).done(function(datall, textStatus) {
                magnets = $.parseJSON(datall);
                add_element(magnets);
                selectElement(0);   //seleziono la prima riga appena appare la tabella da attivare
            });
        } else {
            $.ajax({
                url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + zone_selected + "/" + mag_selected + "','what':'cu','alive':true}",
                async: false
            }).done(function(dataele, textStatus) {
                magnets = $.parseJSON(dataele);
                add_element(magnets);
                selectElement(0); //da attivare
            });
        } 
        
        ok_mag = [];
        url_mag = "";   // empty array
        magnets.forEach(function(magn) {
            ok_mag.push(magn);   //array con la classe dei magneti che ho selezionato
          url_mag += magn + ",";

        });
        
        url_mag = url_mag.substring(0, url_mag.length - 1);   /*** Manipolazione per togliere l'ultima virgola dall'url_mag ***/        
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
        
    });   // ***   element list change
        
});   //*** main function
    