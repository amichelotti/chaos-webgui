/*
 * LETTURA DATI (CORRENTE READ OUT, STATO, ERRORI) CHAOS E CREAZIONE TABELLA DEI MAGNETI
 */
var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in mag_command.js
var mag_selected = "";
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
var url_device = "LUMINOMETER/CAEN775";


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
            $.get("http://" + location.host + ":8081/CU?dev="+ url_device + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
                var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
                
              //  console.log("http://" + location.host + ":8081/CU?dev="+ url_device + "&cmd=channel&parm=-1");
		//console.log(old_str);
                
                try {
                    
		    refresh_time.length = 0;

		    var acquisitions = 0;
		    var events = 0;
		    var channel = [];
		    device_alarms = 0;
		    
		                            
                    var colm_settCurr = [];
                    var dev_alarm_col = [];  //booleano
		    var cu_alarm_col = []; //booleano
		    device_alarms = [];  //contenuto allarmi device
		    cu_alarms = [];  //contenuto allarmi cu

                
                    var str_device = $.parseJSON(old_str);
		    str_device.forEach(function(el) {
			
		    acquisitions = el.output.ACQUISITION.numberLong;
		    events = el.output.EVENTS.numberLong;
		    channel = el.output.CH;
		    device_alarms = el.output.device_alarm;

			
		    });

		    
                               
			       
			       /* refresh_time.push(el.output.dpck_ats.numberLong);
                            
                                dev_alarm_col.push($.trim(el.output.device_alarm));
				cu_alarm_col.push($.trim(el.output.cu_alarm));
					
				device_alarms.push(el.device_alarms);
				cu_alarms.push(el.cu_alarms); */
                                
				
				//console.log(" channel" + channel[1] );
                            
			/*     element_col.push(obj_json.ndk_uid);
                            position_col.push(Number(obj_json.position).toFixed(3));
                            setting_col.push(obj_json.position_sp);
                            refresh_time.push(obj_json.dpck_ats.numberLong);
                            status_col.push(obj_json.status_id); */

			    
                       
                    $("#td_acquisition").html(acquisitions);
		    $("#td_event").html(events);
		    $("#td_channel").html(channel);
		    $("#td_alarm").html(device_alarms);
		    
		    for(var i = 0; i< channel.length; i++) {
			
                          $("#td_channel_" + i).html(channel[i]);  
		    }
                /*    for(var i = 0; i < colm_fl_pol.length; i++) {
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
                    
                    
                    for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == 'false') {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde">trending_down</i>');
                        } else if (colm_fl_state[i] == 'true') {
                            $("#td_flag_state_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                            
                        }
                    }  */
                   
               
                } catch(e) {
                    
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }
    
            });
        },2000);
    }
    
 
        
        if (refresh_values_never_called) {
            worker();
            refresh_values_never_called = false;
        }
        
        if (timestamp_never_called) {
            checkTimestamp();
            timestamp_never_called = false;
        }        
        
        
});   //*** main function
    