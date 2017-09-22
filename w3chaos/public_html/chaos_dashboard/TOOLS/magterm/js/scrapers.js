/*
 * LETTURA DATI (POSIZIONE READ OUT, STATO, ERRORI) CHAOS E CREAZIONE TABELLA SCRAPER
 */
var zone_selected = "";     //zona selezionata ad es.BTF; questa variabile è usata anche in command.js
var elements_selected = "";
var refresh_time = [];
var old_time = [];
var timestamp_never_called = true;
var refresh_values_never_called = true;
var ok_scraper = [];
var n; //numero delle righe (ovvero degli elementi in tabella); così applicando il dataset l'id delle righe aumenta
var device_alarms = [];
var cu_alarms = [];

$(document).ready(function() {
    var scrapers = [];
    var url_scraper = "";
    var zones = [];

    
    //Funzione per riempire le select(quella delle zone, e quella degli scraper)
    function element_sel(field, arr) {
        $(field).empty();
        $(field).append("<option>--Select--</option>");
        $(arr).each(function(i) {
            if (arr[i] != "ACCUMULATOR" && arr[i] != "LNF/TEST") { //tolgo dalla lista la zona ACCUMULATOR
		if (arr[i] != "DIPOLE" && arr[i] != "QUADRUPOLE" && arr[i] != "CORRECTOR" && arr[i] != "BPM" && arr[i] != "CRIO0" && arr[i] != "DAQ") {
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
       	$("#main_table_scrapers").find("tr:gt(0)").remove();
        $(arr).each(function(i) {
	    $("#main_table_scrapers").append("<tr class='row_element' id='tr_element_" + i + "'><td class='name_element' id='name_element_"+ [i] + "'>" + arr[i]
					+ "</td><td class='position_element' id='position_element_"+ [i] + "'></td><td class='position_element' id='setting_"+ [i]
					+ "'></td><td id='saved_pos_"+ [i] + "'></td><td id='saved_status_"+ [i] + "'></td><td id='status_"+ [i] + "'></td><td id='in_"+ [i]
					+ "'></td><td id='out_"+ [i] + "'></td><td id='dev_alarm_"+ [i] + "'></td><td id='cu_alarm_"+ [i] + "'></td></tr>")	
	});
        n = $('#main_table_scrapers tr').size();
        if (n > 22) {     /***Attivo lo scroll della tabella se ci sono più di 22 elementi ***/
            $("#table-scroll").css('height','280px');
        } else {
            $("#table-scroll").css('height','');
        }
    }
    
    //Funzione di riempimento campo degli scraper con i dati chaos, e reload degli stessi
    function worker() {    //function to update request ***
        setInterval(function() {
            $.get("http://" + location.host + ":8081/CU?dev="+ url_scraper + "&cmd=channel&parm=-1", function(datavalue, textStatus) {
                var old_str = datavalue.replace(/\$numberLong/g, 'numberLong');
                
                //console.log("aaaaaa" + old_str);
                
                try {  
                    var position_col = [];
                    var setting_col = [];
                    var saved_col = [];
                    var out_neg_col = []; 
                    var in_pos_col = [];
                    var status_col = [];
                    var dev_alarm_col = [];
		    var cu_alarm_col = [];
		    device_alarms = [];
		    cu_alarms = [];
                    refresh_time.length = 0;
                        
                    var name_scraper = $.parseJSON(old_str);
                    scrapers.forEach(function(scraper) {
                        name_scraper.forEach(function(el) {
                            var name_device_db = scraper;
                           // console.log("name_device " + name_device_db);
                        if( el.hasOwnProperty('output')) {
				if(name_device_db == el.output.ndk_uid) {
					refresh_time.push(el.output.dpck_ats.numberLong);
					el.position = Number(el.output.position).toFixed(3)
					el.setting = Number(el.input.position).toFixed(3)
					
					
					position_col.push(el.position);
					setting_col.push(el.setting);
					
					status_col.push($.trim(el.output.powerOn));
					
					out_neg_col.push($.trim(el.output.NegativeLimitSwitchActive));
					in_pos_col.push($.trim(el.output.PositiveLimitSwitchActive));
					
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
		    
			
			//console.log("aaaa " + device_alarms);
			
			
		    for(var i = 0; i< position_col.length; i++) {
			$("#position_element_" + i).html(position_col[i]);
		    }
		    
		    for(var i = 0; i< setting_col.length; i++) {
			$("#setting_" + i).html(setting_col[i]);
		    }
		    
		    //PROVVISORIO
		    for(var i = 0; i < status_col.length; i++) {
			//console.log("statuss " + status_col[i] );
                        if (status_col[i] == 'false') {
                            $("#status_" + i).html('<i class="material-icons rosso">pause_circle_outline</i>');
                        }
                        else if (status_col[i] == 'true') {
                            $("#status_" + i).html('<i class="material-icons verde">trending_down</i>');
			}
		    }
		    
		    
		    for(var i=0; i< out_neg_col.length; i++ ) {
			//console.log("out-negative " + out_neg_col[i]);
			if (out_neg_col[i] == 'true') {
			    $("#out_" + i).html('<i id="out_icon_'+ [i] + '" class="icon-caret-left verde"></i>');
			} else if (out_neg_col[i] == 'false') {
                            $("#out_icon_" + i).remove();
			}
		    }
		    
		    
		    for(var i=0; i< in_pos_col.length; i++ ) {
			//console.log("in-positive " + in_pos_col[i]);
			if (in_pos_col[i] == 'true') {
			    $("#in_" + i).html('<i id="in_icon_'+ [i] + '" class="icon-caret-right verde"></i>');
			}  else if (in_pos_col[i] == 'false') {
                            $("#in_icon_" + i).remove();
			}
		    }
		    
		    
		    for(var i = 0; i<dev_alarm_col.length; i++) {
			//console.log("device alarm " + dev_alarm_col[i])
                        if (dev_alarm_col[i] == 1) {
                            $("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error</i></a>');
                        }   else if( dev_alarm_col[i] == 2) {
				$("#dev_alarm_" + i).html('<a id="error_' + [i] + '" href="#mdl-device-alarm" role="button" data-toggle="modal" onclick="return show_dev_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
			} else {
                            $("#error_" + i).remove();
                            }    
                    }
		    
		    
		    for(var i = 0; i<cu_alarm_col.length; i++) {
			//console.log("cu alarm " + cu_alarm_col[i])
                        if (cu_alarm_col[i] == 1) {
                            $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons giallo">error</i></a>');
                        }  else if (cu_alarm_col[i] == 2) {
                            $("#cu_alarm_" + i).html('<a id="warning_' + [i] + '" href="#mdl-cu-alarm" role="button" data-toggle="modal" onclick="return show_cu_alarm(this.id);"><i style="cursor:pointer;" class="material-icons rosso">error</i></a>');
			} else  {  
                            $("#warning_" + i).remove();
                        }    
                    }


		    
		    //DA VEDERE INSIEME AGLI ALLARMI
		    /*for(var i = 0; i < status_col.length; i++) {
                        if (status_col[i] == 'false' && colm_alarm[i] == 0) {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde md-24">trending_down</i>');
                        }
                        if (status_col[i] == 'true' && colm_alarm[i] == 0) {
                            $("#td_flag_state_" + i).html('<i class="material-icons red md-24">pause_circle_outline</i>');
                            
                        } else {
                            decodeError(colm_alarm[i])
                            var checkComuniFail = checkCommunicationFailure(colm_alarm[i])
                            if (checkComuniFail == 1) {
                                $("#td_flag_state_" + i).html('<i id="communication_' + [i] + '" class="material-icons red">help_ouline</i>');
                            } else if (colm_alarm[i] != 0 ) {
                                $("#td_flag_state_" + i).html('<i style="cursor:pointer;" id="error_' + [i] + '" class="material-icons red" onclick="open_popup_alarm_mag(this.id)">error</i>');
                            }
                        }
                    } */

                   
		   /* for(var i = 0; i < colm_fl_pol.length; i++) {
                        switch(colm_fl_pol[i]) {
                            case 1:
                                $('#td_flag_pol_' + i).html('<i class="material-icons red md-24">add_circle</i>');
                                break;
                            case -1:
                                $('#td_flag_pol_' + i).html('<i class="material-icons blu md-24">remove_circle</i>');
                                break;
                            case 0:
                                $('#td_flag_pol_' + i).html('<i class="material-icons md-24">radio_button_unchecked</i>');
                                break;
                        }
                    } */
                    
                   /* for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == "false" ) {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde md-24">trending_down</i>');
                        } else {
                            $("#td_flag_state_" + i).html('<i class="material-icons red md-24">pause_circle_outline</i>');
                        }
                    } */
                    
                 /*   for(var i = 0; i < colm_fl_state.length; i++) {
                        if (colm_fl_state[i] == 'false' && colm_alarm[i] == 0) {
                            $("#td_flag_state_" + i).html('<i class="material-icons verde md-24">trending_down</i>');
                        }
                        if (colm_fl_state[i] == 'true' && colm_alarm[i] == 0) {
                            $("#td_flag_state_" + i).html('<i class="material-icons red md-24">pause_circle_outline</i>');
                            
                        } else {
                            decodeError(colm_alarm[i])
                            var checkComuniFail = checkCommunicationFailure(colm_alarm[i])
                            if (checkComuniFail == 1) {
                                $("#td_flag_state_" + i).html('<i id="communication_' + [i] + '" class="material-icons red">help_ouline</i>');
                            } else if (colm_alarm[i] != 0 ) {
                                $("#td_flag_state_" + i).html('<i style="cursor:pointer;" id="error_' + [i] + '" class="material-icons red" onclick="open_popup_alarm_mag(this.id)">error</i>');                                    
                            }
                        }
                    } */
                    
                    
                  /*  for(var i = 0; i < colm_off.length; i++) {
                        if (colm_off[i] == "true") {
                            $("#td_flag_state_" + i).html('<i class="material-icons red">power_settings_new</i>');
                        }
                    } */
    
                 /*   for(var i = 0; i< colm_alarm_catalog.length; i ++) {
                        if (colm_alarm_catalog[i] == true) {
                            $("#td_error_state_" + i).html('<i style="cursor:pointer;" id="warning_' + [i] + '" class="material-icons giallo" onclick="apri_popup(this.id)">warning</i>');
                        } else if (colm_alarm_catalog[i] == false) {
                            $("#warning_" + i).remove();
                        }
                    }  */
                    
                 /*   for(var i = 0; i<colm_alarm.length; i++) {
                        if (colm_alarm[i]!= 0) {
                            error_string = decodeError(colm_alarm[i]);
                            $("#td_flag_state_" + i).html('<i style="cursor:pointer;" id="error_' + [i] + '" class="material-icons red md-24" onclick="apri_popup()">error</i>');                                    
                        }   else if( colm_alarm[i] == 0) {  
                            $("#error_" + i).remove();
                            }    
                    } */
                                   
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
        element_sel('#zones', zones);
    });
    
    //Query a chaos per prendere la lista degli scraper
    var scraper_list = [];
    $("#zones").change(function() {
        zone_selected = $("#zones option:selected").val();
        if (zone_selected == "--Select--") {        //Disabilito la select dei magneti se non è selezionata la zona
            $("#elements").attr('disabled','disabled');
        } else {
            $("#elements").removeAttr('disabled');
        }
        $.get("http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + zone_selected + "','what':'class','alive':true}", function(datael, textStatus) {
            scraper_list = $.parseJSON(datael);
            element_sel('#elements', scraper_list);
        });
    });
    
    
  

    //Get per prendere i dati dei magneti selezionati
    $("#elements").change(function() {
       // $("#apply_saved").remove();  //rimuove il tasto apply all se cambio selezione dei magneti
         elements_selected = $("#elements option:selected").val();
        
        if (elements_selected == "--Select--" || zone_selected == "--Select--" ) {
            $(".btn-main-function").hasClass("disabled")
        } else {
            $(".btn-main-function").removeClass("disabled")
        }

        
	//DA ATTIVARE QUANDO FUNZIONANTE
	$.ajax({
                url: "http://" + location.host + ":8081/CU?cmd=search&parm={'name':'" + zone_selected + "/" + elements_selected + "','what':'cu','alive':true}",
                async: false
            }).done(function(dataele, textStatus) {
                scrapers = $.parseJSON(dataele);
		console.log("bbbbb " + scrapers);
                add_element(scrapers);
               // selectElement(0); //da attivare
            }); 
	
	//PROVVISORIO
	//   scrapers = ["BTF/SCRAPER/LAB_MAE","BTF/SCRAPER/LAB_SLOSYN"];
	//    console.log("###### " + scrapers);
        //    add_element(scrapers); 

	
        
        
        ok_scraper = [];
        url_scraper = "";   // empty array
        scrapers.forEach(function(scraper) {
		if (scraper != "ACCUMULATOR/BPM/BPMSYNC") {
			ok_scraper.push(scraper);   //array i bpm che ho selezionato
			url_scraper += scraper + ",";
		}
        });
        
        url_scraper = url_scraper.substring(0, url_scraper.length - 1);   /*** Manipolazione per togliere l'ultima virgola dall'url_scraper ***/        
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
    