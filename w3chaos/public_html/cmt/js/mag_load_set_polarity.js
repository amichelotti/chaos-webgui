var elements_dataset = [];
var current_saved = [];
var status_saved = [];
var polarity_saved = [];

function fill_table_saved() {
    elements_dataset = [];
    current_saved = [];
    status_saved = [];
    polarity_saved = [];
    
    $("#apply_saved").remove();
    
    for (var i = 0; i < ok_mag.length; i++) {
        $("#td_saved_curr_" + i).html("");
        $("#td_saved_pola_" + i).html("");
        $("#td_saved_state_" + i).html("");
    }
    
    $.get("http://" + location.host + "/cmt/json_api/get_dataset/" + name_file_ds, function(data, textStatus) {
        var data_dataset = $.parseJSON(data);
        
        data_dataset.forEach(function(el) {
            elements_dataset.push(el.element);
            current_saved.push(Number(el.value).toFixed(3));
            status_saved.push(el.status);
            polarity_saved.push(el.polarity);
        });
        
        var dataset_index = -1;
        var mag_index = 0;
        
        ok_mag.forEach(function(mag) {
            dataset_index = $.inArray(mag, elements_dataset);
            if (dataset_index != -1) {
                $("#td_saved_curr_" + mag_index).html('<input type="text" class="input_curr_saved" id="curr_dataset_' + mag_index +
                                                      '" value="' + current_saved[dataset_index] + '"/>');
                switch (status_saved[dataset_index]) {
                    case '2':
                        $("#td_saved_state_" + mag_index).html('<select class="select_saved" id="state_dataset_' + mag_index +
                                                               '"><option value="on" selected>on</option><option value="standby">standby</option></select>');
                        break;
                    case '8':
                        $("#td_saved_state_" + mag_index).html('<select class="select_saved" id="state_dataset_' + mag_index +
                                                               '"><option value="on">on</option><option value="standby" selected>standby</option></select>');
                        break;                                                            
                }
                
                switch (polarity_saved[dataset_index]) {
                    case '-1':
                        $("#td_saved_pola_" + mag_index).html('<select class="select_saved" id="pola_dataset_' + mag_index + '" ><option value="pos">Pos</option>' +
                                                              '<option value="open">Open</option><option value="neg" selected>Neg</option></select>');
                        break;
                    case '0':
                        $("#td_saved_pola_" + mag_index).html('<select class="select_saved" id="pola_dataset_' + mag_index + '" ><option value="pos">Pos</option>' +
                                                              '<option value="open" selected>Open</option><option value="neg">Neg</option></select>');
                        break;
                    case '1':
                        $("#td_saved_pola_" + mag_index).html('<select class="select_saved" id="pola_dataset_' + mag_index + '" ><option value="pos" selected>' +
                                                              'Pos</option><option value="open">Open</option><option value="neg">Neg</option></select>');
                    
                        break;
                } 
            } else {
                $("#td_saved_curr_" + mag_index).html('<input type="text" class="input_curr_saved" id="curr_dataset_' + mag_index + '" value=""/>');
                $("#td_saved_state_" + mag_index).html('<select class="select_saved"><option value="on">on</option><option value="standby">stanby</option></select>');
                $("#td_saved_pola_" + mag_index).html('<select class="select_saved"><option value="pos">Pos</option><option value="open">Open</option>' +
                                                      '<option value="neg">Neg</option></select>');
            }
            mag_index++;
        });
    });
    
    $("#main_table_box").append('<button style="cursor:pointer;" onclick="loadDataset()"; id="apply_saved">Apply All</button>');
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
    
    $("#main_table input[type=text]").each( function() {
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