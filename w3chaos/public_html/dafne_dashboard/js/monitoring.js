/*
 * MONITORING CU (STATUS,ALARM)
 */
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
					+ "</td><td id='status_"+ [i] + "'></td><td id='dev_alarm_"+ [i] + "'></td><td id='cu_alarm_"+ [i] + "'></td></tr>")	
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
            $.get("http://" + location.host + ":8081/CU?dev="+ url_cu + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
                var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
                
                console.log("string " + old_str);
                
                try {
                                              
                    refresh_time.length = 0;
                    var dev_alarm_col = [];  //booleano
		    var cu_alarm_col = []; //booleano
		    device_alarms = [];  //contenuto allarmi device
		    cu_alarms = [];  //contenuto allarmi cu
                    var busy_col = [];

                
                    var name_mag = $.parseJSON(old_str);
                    cu.forEach(function(mag) {
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
                            alert("problem")
                        } 
                        });
                    });
                            
                    
                /*    for(var i = 0; i < colm_fl_state.length; i++) {
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
                    } */
                    
                } catch(e) {
                    
                    alert("Error status");
                    console.log("errore parsing" + e.message);
                }
    
            });
        },2000);
    }
 
    
 
	    
	    $.ajax({
                url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'','what':'cu','alive':false}",
                async: false
            }).done(function(dataele, textStatus) {
                cu = $.parseJSON(dataele);
		console.log("cu " + cu);
                add_element(cu);
            });
    
    
    
  
        ok_cu = [];
        url_cu = "";   // empty array
        cu.forEach(function(ele) {
            ok_cu.push(ele);   //array con la classe dei magneti che ho selezionato
          url_cu += ele + ",";

        });
        
        url_cu = url_cu.substring(0, url_cu.length - 1);   /*** Manipolazione per togliere l'ultima virgola dall'url_cu ***/        

        
	console.log("url cu " + url_cu);
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	        
	
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
        
        
});   //*** main function
    