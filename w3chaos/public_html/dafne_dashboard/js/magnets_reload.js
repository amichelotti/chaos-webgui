/* FILL MAIN TABLE WITH DATASET */

function reLoad() {
    
    $.get("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'"+ name_file_ds +"','what':'restore'}");
    
    console.log("http://" + location.host + ":8081/CU?cmd=snapshot&parm={'name':'"+ name_file_ds +"', 'what':'restore'}");
}



function fill_load_main_table(){
    
    console.log("aaaaa");

   
    for (var i = 0; i < ok_mag.length; i++) {
        $("#td_saved_curr_" + i).html("");
        $("#td_saved_pola_" + i).html("");
        $("#td_saved_state_" + i).html("");
    }
 
      
      console.log("aafff " + colm_load_status);
                
                
        var dataset_index = -1;
        var mag_index = 0;
        
        ok_mag.forEach(function(mag) {
            dataset_index = $.inArray(mag, colm_load_element);
            if (dataset_index != -1) {
                /*$("#td_saved_curr_" + mag_index).html('<input type="text" class="input_curr_saved" id="curr_dataset_' + mag_index +
                                                      '" value="' + colm_load_setting[dataset_index] + '"/>'); */
                $("#td_saved_curr_" + mag_index).html(colm_load_setting[dataset_index]);

                switch (colm_load_status[dataset_index]) {
                    case true:
                        $("#td_saved_state_" + mag_index).html('<i class="material-icons rosso">pause_circle_outline</i>');
                        break;
                    case false:
                        $("#td_saved_state_" + mag_index).html('<i class="material-icons verde">trending_down</i>');
                        break;
                }

                switch (colm_load_polarity[dataset_index]) {
                    case 1:
                            $("#td_saved_pola_" + mag_index).html('<i class="material-icons rosso">add_circle</i>');
                            break;
                    case -1:
                            $("#td_saved_pola_" + mag_index).html('<i class="material-icons blu">remove_circle</i>');
                            break;
                    case 0:
                            $("#td_saved_pola_" + mag_index).html('<i class="material-icons">radio_button_unchecked</i>');
                            break;
                }
                
            }
            mag_index++;
        });
        
}


function changePolarity (val,load,flag){
    for(var i = 0; i<devices.length; i++) {
        url= "http://" + location.host + ":8081/CU?dev=" + devices[i];
        device = devices[i];
        if (polas_load[i] == load && polas_real[i] != flag) {
            if (state_fl[i] == "trending_down") {
                setPowerSupply("Standby");
                setPolarity(val);
                setPowerSupply("On");
            } else if (state_fl[i] == "pause_circle_outline") {
                setPolarity(val);
                setPowerSupply("On");
            }
        }
    }
}

var polas_load = [];
var polas_real = [];
var devices = [];
var state_fl = [];
function loadDataset() {
   
    var curr_sett = [];
    // var devices = [];
   // var state_fl = [];
    var states_load = [];
    // var polas_load = [];
    // var polas_real = []; 
    
    $("#main_table_magnets input[type=text]").each( function() {
        if ($(this).val() == '') {
            console.log("vuoto");
        } else {
            var input_saved = $(this).closest('tr').attr('id'); // id tr of input non null
            var device_name = $('#' + input_saved + ' td:first-child').text();  //device name of input not null
            var state_load = $('#' + input_saved + ' td:nth-child(5) option:selected').val(); // option state select of input not null
            var pola_load = $('#' + input_saved + ' td:nth-child(6) option:selected').val(); // option polarity select of input not null
            var onstb = $('#' + input_saved + ' td:nth-child(7)').text(); // flag state of input not null
            var pola_real = $('#' + input_saved + ' td:nth-child(8)').text(); // polarity flag of input not null
            var device_name = zone_selected + "/" + device_name; // come vuole il nome del device la funzione send_command
            
            curr_sett.push(this.value);
            devices.push(device_name);
            state_fl.push(onstb);
            states_load.push(state_load);
            polas_load.push(pola_load);
            polas_real.push(pola_real);
        }
    });
    
  //  for(var i = 0; i<devices.length; i++) {
    
    //    url= "http://" + location.host + ":8081/CU?dev=" + devices[i];
     //   device = devices[i];
        
    changePolarity("Open","open","radio_button_unchecked");
    changePolarity("Pos","pos","add_circle");
    changePolarity("Neg","neg","remove_circle");   
        
        /*if (polas_load[i] == "open" && polas_real[i] != "radio_button_unchecked") {
            if (state_fl[i] == "trending_down") {
                setPowerSupply("Standby");
                setPolarity("Open");
                setPowerSupply("On");
            } else if (state_fl[i] == "pause_circle_outline") {
                setPolarity("Open");
                setPowerSupply("On");
            }
        }
       
        if (polas_load[i] == "pos" && polas_real[i] != "add_circle") {
            if (state_fl[i] == "trending_down") {
                setPowerSupply("Standby");
                setPolarity("Pos");
                setPowerSupply("On");
            } else if (state_fl[i] == "pause_circle_outline") {
                setPolarity("Pos");
                setPowerSupply("On");
            }
        }
            
        if (polas_load[i] == "neg" && polas_real[i] != "remove_circle") {
            if (state_fl[i] == "trending_down") {
                setPowerSupply("Standby");
                setPolarity("Neg");
                setPowerSupply("On");
            } else if (state_fl[i] == "pause_circle_outline") {
                setPolarity("Neg");
                setPowerSupply("On");
            }
        }  */
        
   for(var i = 0; i<devices.length; i++) {
    
        url= "http://" + location.host + ":8081/CU?dev=" + devices[i];
        device = devices[i];
      
        if (state_fl[i] == 'pause_circle_outline') {  //controllo se lo stato  in standby
            setPowerSupply("On");
        }  
        setCurrent(curr_sett[i]);
        
        if (states_load[i] == "on") {
            setPowerSupply("On");
        } else if (states_load[i] == "Standby") {
            setPowerSupply("Standby");
        }
    }
    
}  